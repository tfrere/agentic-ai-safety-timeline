"""Pydantic AI watch agent: Claude Opus thinks, uses tools, returns structured events."""

from __future__ import annotations

import logging
import json
import re
from dataclasses import dataclass, field
from typing import Literal
from pathlib import Path
from urllib.parse import unquote

import httpx
from pydantic import BaseModel, Field, field_validator
from pydantic_ai import Agent, RunContext
from pydantic_ai.models.openrouter import OpenRouterModel
from pydantic_ai.providers.openrouter import OpenRouterProvider
from pydantic_ai.settings import ModelSettings
from pydantic_ai.usage import UsageLimits

log = logging.getLogger(__name__)

WATCH_MODEL = "anthropic/claude-opus-5"
USER_AGENT = "agentic-ai-safety-watch/0.1 (+https://github.com/tfrere/agentic-ai-safety-timeline)"
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MAX_REQUESTS = 16
SOFT_STOP_STEP = 8
BACKFILL_MAX_REQUESTS = 28
BACKFILL_SOFT_STOP_STEP = 18
MAX_PAGE_CHARS = 6_000
METHOD_PATH = Path(__file__).with_name("METHOD.md")
INSTRUCTIONS = METHOD_PATH.read_text(encoding="utf-8")
Tag = Literal["INCIDENT", "DEPARTURE", "LAB", "POLICY", "EVAL", "RESEARCH"]
Track = Literal["openai-hf", "anthropic-irregular", "aisi"]


class Candidate(BaseModel):
    iso: str
    tag: Tag
    title: str
    desc: str
    why: str
    source: str
    source_label: str = Field(alias="sourceLabel")
    track: Track | None = None

    model_config = {"populate_by_name": True}

    @field_validator("iso")
    @classmethod
    def iso_date(cls, value: str) -> str:
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
            raise ValueError("iso must be YYYY-MM-DD")
        return value

    @field_validator("source")
    @classmethod
    def http_source(cls, value: str) -> str:
        if not value.startswith("http"):
            raise ValueError("source must be an http(s) URL")
        return value

    @field_validator("desc")
    @classmethod
    def desc_long_enough(cls, value: str) -> str:
        if len(value.strip()) < 40:
            raise ValueError("desc is too short")
        return value.strip()


class WatchOutput(BaseModel):
    candidates: list[Candidate] = Field(default_factory=list)


@dataclass
class WatchDeps:
    client: httpx.AsyncClient
    api_key: str
    model: str
    tool_log: list[str] = field(default_factory=list)
    soft_stop_step: int = SOFT_STOP_STEP


def _budget(ctx: RunContext[WatchDeps], tool: str, arg: str) -> str | None:
    log.info("watch step %d %s(%s)", ctx.run_step, tool, arg[:120])
    if ctx.run_step > ctx.deps.soft_stop_step:
        return "BUDGET EXHAUSTED: stop exploring and return your final answer now."
    return None


def _done(ctx: RunContext[WatchDeps], tool: str, out: str) -> str:
    ctx.deps.tool_log.append(f"step {ctx.run_step} {tool} -> {len(out)} chars")
    log.info("watch step %d %s -> %d chars", ctx.run_step, tool, len(out))
    return out


def make_model(api_key: str, name: str) -> OpenRouterModel:
    if "opus" not in name.lower() or "anthropic" not in name.lower():
        raise RuntimeError(f"WATCH_MODEL must be Claude Opus via OpenRouter, got {name!r}")
    provider = OpenRouterProvider(
        api_key=api_key,
        app_url="https://github.com/tfrere/agentic-ai-safety-timeline",
        app_title="agentic-ai-safety-watch",
    )
    settings = ModelSettings(
        temperature=0.1,
        max_tokens=12_000,
        timeout=240,
        thinking="high",
        parallel_tool_calls=False,
    )
    return OpenRouterModel(name, provider=provider, settings=settings)


def build_agent(model: OpenRouterModel) -> Agent[WatchDeps, WatchOutput]:
    agent: Agent[WatchDeps, WatchOutput] = Agent(
        model,
        deps_type=WatchDeps,
        output_type=WatchOutput,
        instructions=INSTRUCTIONS,
        retries=2,
        name="safety-watch",
    )

    @agent.tool
    async def web_search(ctx: RunContext[WatchDeps], query: str) -> str:
        """Search the web. Returns title | url | snippet lines. Prefer primary sources."""
        blocked = _budget(ctx, "web_search", query)
        if blocked:
            return blocked
        return _done(ctx, "web_search", await _web_search(ctx.deps, query))

    @agent.tool
    async def fetch_page(ctx: RunContext[WatchDeps], url: str) -> str:
        """Fetch one URL and return status plus a text excerpt. Required before citing a source."""
        blocked = _budget(ctx, "fetch_page", url)
        if blocked:
            return blocked
        return _done(ctx, "fetch_page", await _fetch_page(ctx.deps.client, url))

    return agent


async def _web_search(deps: WatchDeps, query: str) -> str:
    try:
        r = await deps.client.post(
            OPENROUTER_URL,
            headers={"Authorization": f"Bearer {deps.api_key}"},
            json={
                "model": deps.model,
                "plugins": [{"id": "web", "max_results": 8}],
                "reasoning": {"effort": "high"},
                "messages": [{"role": "user", "content": f"Web search for: {query}\nList the results."}],
                "max_tokens": 800,
            },
            timeout=90,
        )
        if r.status_code == 200:
            msg = r.json()["choices"][0]["message"]
            lines = []
            for a in msg.get("annotations") or []:
                c = a.get("url_citation") or {}
                if c.get("url"):
                    lines.append(
                        f"{(c.get('title') or '')[:80]} | {c['url']} | "
                        f"{(c.get('content') or '')[:160].replace(chr(10), ' ')}"
                    )
            if lines:
                return "\n".join(dict.fromkeys(lines))
            log.warning("web plugin returned no annotations; falling back to DuckDuckGo")
        else:
            log.warning("web plugin failed %s: %s", r.status_code, r.text[:200])
    except (httpx.HTTPError, KeyError, ValueError) as exc:
        log.warning("web plugin error: %s", exc)
    return await _ddg(deps.client, query)


async def _ddg(client: httpx.AsyncClient, query: str) -> str:
    r = await client.get(
        "https://html.duckduckgo.com/html/",
        params={"q": query},
        headers={"User-Agent": USER_AGENT},
        timeout=30,
    )
    text = r.text
    lines = []
    for m in re.finditer(
        r'class="result__a"[^>]*href="([^"]+)"[^>]*>(.*?)</a>.*?class="result__snippet"[^>]*>(.*?)</(?:a|td)',
        text,
        re.S,
    ):
        href, title, snip = m.group(1), re.sub(r"<[^>]+>", "", m.group(2)), re.sub(r"<[^>]+>", "", m.group(3))
        uddg = re.search(r"uddg=([^&]+)", href)
        if uddg:
            href = unquote(uddg.group(1))
        lines.append(f"{title.strip()[:80]} | {href} | {re.sub(r'\s+', ' ', snip)[:160].strip()}")
        if len(lines) >= 8:
            break
    return "\n".join(lines) or "(no results)"


async def _fetch_page(client: httpx.AsyncClient, url: str) -> str:
    try:
        r = await client.get(url, headers={"User-Agent": USER_AGENT}, follow_redirects=True, timeout=25)
    except httpx.HTTPError as exc:
        return f"ERROR {type(exc).__name__}: {exc}"
    body = r.text
    body = re.sub(r"(?is)<script.*?>.*?</script>", " ", body)
    body = re.sub(r"(?is)<style.*?>.*?</style>", " ", body)
    body = re.sub(r"(?s)<[^>]+>", " ", body)
    excerpt = re.sub(r"\s+", " ", body).strip()[:MAX_PAGE_CHARS]
    return f"status={r.status_code} final_url={r.url}\n{excerpt}"


async def run_watch_agent(
    api_key: str,
    model: str,
    prompt: str,
    *,
    backfill: bool = False,
) -> tuple[WatchOutput, dict, list[str]]:
    settings_model = make_model(api_key, model)
    agent = build_agent(settings_model)
    request_limit = BACKFILL_MAX_REQUESTS if backfill else MAX_REQUESTS
    soft_stop = BACKFILL_SOFT_STOP_STEP if backfill else SOFT_STOP_STEP
    async with httpx.AsyncClient(headers={"User-Agent": USER_AGENT}, follow_redirects=True) as client:
        deps = WatchDeps(client=client, api_key=api_key, model=model, soft_stop_step=soft_stop)
        result = await agent.run(
            prompt,
            deps=deps,
            usage_limits=UsageLimits(request_limit=request_limit),
        )
    usage = result.usage
    if hasattr(usage, "model_dump"):
        raw_usage = usage.model_dump()
    else:
        raw_usage = {k: v for k, v in vars(usage).items() if not k.startswith("_")} if hasattr(usage, "__dict__") else {"repr": repr(usage)}
    usage_dict = json.loads(json.dumps(raw_usage, default=str))
    return result.output, usage_dict, deps.tool_log
