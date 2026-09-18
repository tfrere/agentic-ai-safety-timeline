#!/usr/bin/env python3
"""Daily agentic-AI-safety watch.

A Pydantic AI agent (Claude Fable 5.1, thinking high) scans feeds, uses search/fetch
tools, and writes passing events into data.js / TIMELINE.md.
"""

from __future__ import annotations

import argparse
import asyncio
import hashlib
import html
import json
import logging
import os
import re
import ssl
import sys
import urllib.error
import urllib.request
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from xml.etree import ElementTree as ET

if str(Path(__file__).resolve().parent) not in sys.path:
    sys.path.insert(0, str(Path(__file__).resolve().parent))
from agent import WATCH_MODEL, run_watch_agent

ROOT = Path(__file__).resolve().parents[1]
WATCH_DIR = Path(__file__).resolve().parent
SOURCES_PATH = WATCH_DIR / "sources.json"
STATE_PATH = WATCH_DIR / "state.json"
REPORT_PATH = WATCH_DIR / "last-report.md"
DATA_JS = ROOT / "data.js"

USER_AGENT = "agentic-ai-safety-watch/0.1 (+https://github.com/tfrere/agentic-ai-safety-timeline)"
MAX_FEED_ITEMS = 40
MAX_ITEM_AGE_DAYS = 10
PAGE_EXCERPT_CHARS = 4000
ALLOWED_TAGS = {"INCIDENT", "DEPARTURE", "LAB", "POLICY", "EVAL", "RESEARCH"}
ARXIV_HINTS = (
    "agent",
    "sandbox",
    "prompt injection",
    "multi-agent",
    "containment",
    "misalignment",
    "scheming",
    "control",
    "evaluation",
    "alignment",
)

ALLOWED_TRACKS = {"openai-hf", "anthropic-irregular", "aisi"}
POINTER_HOSTS = ("aiaaic.org", "incidentdatabase.ai", "oecd.ai")
AIAAIC_ITEM = re.compile(r"AIAAIC\s*\d+\s*:?\s*(.+?)(?=\s*AIAAIC\s*\d+|\Z)", re.I | re.S)


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8", errors="replace")).hexdigest()


def http_get(url: str, timeout: int = 25) -> tuple[int, str]:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "*/*"})
    ctx = ssl.create_default_context()
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as resp:
            raw = resp.read()
            charset = resp.headers.get_content_charset() or "utf-8"
            return resp.status, raw.decode(charset, errors="replace")
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace") if exc.fp else ""
        return exc.code, body
    except (urllib.error.URLError, TimeoutError, ssl.SSLError) as exc:
        return 0, f"{type(exc).__name__}: {exc}"


def local_tag(tag: str) -> str:
    return tag.split("}", 1)[-1]


def parse_date(value: str | None) -> datetime | None:
    if not value:
        return None
    value = value.strip()
    try:
        return parsedate_to_datetime(value).astimezone(timezone.utc)
    except (TypeError, ValueError, IndexError):
        pass
    for fmt in ("%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%dT%H:%M:%SZ", "%Y-%m-%d"):
        try:
            dt = datetime.strptime(value.replace("Z", "+0000") if fmt.endswith("%z") else value, fmt)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt.astimezone(timezone.utc)
        except ValueError:
            continue
    return None


def text_of(el: ET.Element | None) -> str:
    if el is None:
        return ""
    return "".join(el.itertext()).strip()


def parse_feed(xml_text: str) -> list[dict]:
    try:
        root = ET.fromstring(xml_text)
    except ET.ParseError:
        return []
    items: list[dict] = []
    if local_tag(root.tag) == "feed":
        for entry in root:
            if local_tag(entry.tag) != "entry":
                continue
            title = ""
            link = ""
            date_raw = ""
            summary = ""
            for child in entry:
                name = local_tag(child.tag)
                if name == "title":
                    title = text_of(child)
                elif name == "link" and not link:
                    link = child.attrib.get("href") or text_of(child)
                elif name in {"updated", "published"} and not date_raw:
                    date_raw = text_of(child)
                elif name in {"summary", "content"} and not summary:
                    summary = strip_html(text_of(child))[:280]
            if title and link:
                items.append({"title": title, "url": link, "date": date_raw, "summary": summary})
        return items
    for item in root.iter():
        if local_tag(item.tag) != "item":
            continue
        title = link = date_raw = summary = ""
        for child in item:
            name = local_tag(child.tag)
            if name == "title":
                title = text_of(child)
            elif name == "link":
                link = text_of(child)
            elif name in {"pubDate", "date"}:
                date_raw = text_of(child)
            elif name in {"description", "summary"}:
                summary = strip_html(text_of(child))[:280]
        if title and link:
            items.append({"title": title, "url": link, "date": date_raw, "summary": summary})
    return items


def strip_html(blob: str) -> str:
    blob = re.sub(r"(?is)<script.*?>.*?</script>", " ", blob)
    blob = re.sub(r"(?is)<style.*?>.*?</style>", " ", blob)
    blob = re.sub(r"(?s)<[^>]+>", " ", blob)
    return re.sub(r"\s+", " ", html.unescape(blob)).strip()


def extract_pointer_titles(html: str, keywords: list[str] | None, limit: int = 15) -> list[str]:
    text = strip_html(html)
    titles: list[str] = []
    seen: set[str] = set()
    for match in AIAAIC_ITEM.finditer(text):
        title = re.sub(r"\s+", " ", match.group(1)).strip(" .-")[:180]
        if len(title) < 12 or title.lower() in seen:
            continue
        if not keyword_ok(title, keywords):
            continue
        seen.add(title.lower())
        titles.append(title)
        if len(titles) >= limit:
            break
    return titles


def keyword_ok(title: str, keywords: list[str] | None) -> bool:
    if not keywords:
        return True
    hay = title.lower()
    return any(k.lower() in hay for k in keywords)


def load_timeline() -> list[dict]:
    text = DATA_JS.read_text(encoding="utf-8")
    events = []
    pattern = re.compile(
        r'iso:\s*"(?P<iso>[^"]+)".*?tag:\s*"(?P<tag>[^"]+)".*?title:\s*"(?P<title>(?:\\.|[^"\\])*)".*?source:\s*"(?P<source>[^"]+)"',
        re.S,
    )
    for m in pattern.finditer(text):
        title = m.group("title").replace('\\"', '"')
        events.append(
            {
                "iso": m.group("iso"),
                "tag": m.group("tag"),
                "title": title,
                "source": m.group("source"),
            }
        )
    return events


def norm(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", s.lower()).strip()


def already_known(url: str, title: str, events: list[dict], proposed: list[dict]) -> bool:
    ntitle = norm(title)
    nurl = url.rstrip("/").lower()
    for ev in events:
        if ev["source"].rstrip("/").lower() == nurl:
            return True
        et = norm(ev["title"])
        if et and (et == ntitle or et in ntitle or ntitle in et):
            return True
    for prev in proposed:
        if prev.get("url", "").rstrip("/").lower() == nurl:
            return True
        pt = norm(prev.get("title") or "")
        if pt and pt == ntitle:
            return True
    return False


def github_api(method: str, path: str, token: str, payload: dict | None = None) -> tuple[int, dict | list]:
    body = None if payload is None else json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        f"https://api.github.com{path}",
        data=body,
        method=method,
        headers={
            "User-Agent": USER_AGENT,
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            raw = resp.read().decode("utf-8")
            return resp.status, json.loads(raw) if raw else {}
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8", errors="replace")
        try:
            parsed: dict | list = json.loads(raw) if raw else {}
        except json.JSONDecodeError:
            parsed = {"message": raw}
        return exc.code, parsed


def ensure_label(repo: str, token: str) -> None:
    code, _ = github_api("GET", f"/repos/{repo}/labels/watch", token)
    if code == 200:
        return
    github_api(
        "POST",
        f"/repos/{repo}/labels",
        token,
        {"name": "watch", "color": "1D76DB", "description": "Daily watch candidate"},
    )


def open_issue_urls(repo: str, token: str) -> set[str]:
    code, data = github_api("GET", f"/repos/{repo}/issues?labels=watch&state=open&per_page=50", token)
    urls: set[str] = set()
    if code != 200 or not isinstance(data, list):
        return urls
    for issue in data:
        blob = f"{issue.get('title', '')}\n{issue.get('body', '')}"
        for match in re.findall(r"https?://[^\s)]+", blob):
            urls.add(match.rstrip("/").lower())
    return urls


def build_prompt(
    events: list[dict],
    feed_items: list[dict],
    page_notes: list[str],
    pointers: list[str],
    today: str,
) -> str:
    known = "\n".join(f"- {e['iso']} [{e['tag']}] {e['title']}" for e in events)
    feeds = "\n".join(
        f"- {it.get('date') or '?'} | {it['title']} | {it['url']}"
        + (f" | {it['summary']}" if it.get("summary") else "")
        for it in feed_items
    ) or "(no recent feed items)"
    pages = "\n\n".join(page_notes) or "(no first-party page change)"
    pointer_block = "\n".join(f"- {t}" for t in pointers) or "(no agentic AIAAIC titles)"
    return (
        f"Today is {today}. Look at the last {MAX_ITEM_AGE_DAYS} days.\n\n"
        f"ALREADY ON THE TIMELINE:\n{known}\n\n"
        f"RECENT FEED ITEMS:\n{feeds}\n\n"
        f"FIRST-PARTY PAGES (hash changed since last run, excerpt):\n{pages}\n\n"
        f"AIAAIC POINTERS (titles only, never cite aiaaic.org):\n{pointer_block}\n\n"
        "Use web_search and fetch_page. Fetch every source before adding it. "
        "Focus on OpenAI Alignment reports, Anthropic research, METR, UK AISI, Apollo, "
        "Hugging Face security posts, parliamentary/lab statements, and arXiv on agents/containment. "
        "AIAAIC is a discovery net after first-party sources: chase only titles that might pass the bar, "
        "then cite the primary. Never cite aiaaic.org, incidentdatabase.ai, or oecd.ai. "
        "Return only events that pass the selection bar and are not already listed. "
        "Those events will be written to the public timeline automatically."
    )


def validate_candidates(raw: dict, events: list[dict]) -> list[dict]:
    out = []
    for item in raw.get("candidates") or []:
        if not isinstance(item, dict):
            continue
        tag = str(item.get("tag") or "").upper()
        title = str(item.get("title") or "").strip()
        source = str(item.get("source") or "").strip()
        iso = str(item.get("iso") or "").strip()
        desc = str(item.get("desc") or item.get("why") or "").strip()
        if tag not in ALLOWED_TAGS or not title or not source.startswith("http"):
            continue
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", iso):
            continue
        if len(desc) < 40:
            continue
        if already_known(source, title, events, []):
            continue
        if any(host in source.lower() for host in POINTER_HOSTS):
            continue
        track = str(item.get("track") or "").strip()
        event = {
            "iso": iso,
            "tag": tag,
            "title": title[:180],
            "desc": desc[:800],
            "why": str(item.get("why") or "").strip()[:400],
            "source": source,
            "sourceLabel": str(item.get("sourceLabel") or item.get("source_label") or "").strip()[:80] or source.split("/")[2],
        }
        if track in ALLOWED_TRACKS:
            event["track"] = track
        out.append(event)
    return out


def display_date(iso: str) -> str:
    dt = datetime.strptime(iso, "%Y-%m-%d")
    return dt.strftime("%b ") + str(dt.day) + dt.strftime(", %Y")


def js_escape_event(ev: dict) -> str:
    extra = f', track: {json.dumps(ev["track"])}' if ev.get("track") else ""
    return "\n".join(
        [
            "  {",
            f'    iso: {json.dumps(ev["iso"])}, date: {json.dumps(display_date(ev["iso"]))}, tag: {json.dumps(ev["tag"])}{extra},',
            f'    title: {json.dumps(ev["title"], ensure_ascii=False)},',
            f'    desc: {json.dumps(ev["desc"], ensure_ascii=False)},',
            f'    source: {json.dumps(ev["source"])}, sourceLabel: {json.dumps(ev["sourceLabel"], ensure_ascii=False)}',
            "  }",
        ]
    )


def split_js_objects(array_body: str) -> list[str]:
    objs: list[str] = []
    depth = 0
    start = None
    for i, ch in enumerate(array_body):
        if ch == "{":
            if depth == 0:
                start = i
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0 and start is not None:
                objs.append("  " + array_body[start : i + 1].strip())
                start = None
    return objs


def apply_to_data_js(events: list[dict]) -> None:
    text = DATA_JS.read_text(encoding="utf-8")
    match = re.search(r"window\.TIMELINE_EVENTS = \[", text)
    end = text.rfind("];")
    if not match or end < 0:
        raise RuntimeError("could not find TIMELINE_EVENTS array in data.js")
    body = text[match.end() : end]
    blocks = split_js_objects(body)
    keyed: list[tuple[str, str]] = []
    for block in blocks:
        iso_m = re.search(r'iso:\s*"(\d{4}-\d{2}-\d{2})"', block)
        keyed.append((iso_m.group(1) if iso_m else "9999-99-99", block))
    for ev in events:
        keyed.append((ev["iso"], js_escape_event(ev)))
    keyed.sort(key=lambda pair: pair[0])
    new_body = "\n" + ",\n".join(block for _, block in keyed) + "\n"
    DATA_JS.write_text(text[: match.end()] + new_body + text[end:], encoding="utf-8")


def month_heading(iso: str) -> str:
    dt = datetime.strptime(iso, "%Y-%m-%d")
    return f"### {dt.strftime('%B')} {dt.year}"


def timeline_bullet(ev: dict) -> str:
    label = ev.get("sourceLabel") or ev["source"]
    return (
        f"- **{ev['iso']}** `{ev['tag']}` - **{ev['title']}.** {ev['desc']} "
        f"[{label}]({ev['source']})\n"
    )


DEEP_DIVE = "\n---\n\n## Deep dive: the three unsanctioned-internet incidents"
SOURCES_CLOSE = re.compile(r"\n\]\n```\s*\n---\s*\n## Sources")


def apply_to_timeline_md(events: list[dict], today: str) -> None:
    path = ROOT / "TIMELINE.md"
    md = path.read_text(encoding="utf-8")
    md = re.sub(
        r"(\*\*Last updated:\*\* )\d{4}-\d{2}-\d{2}",
        rf"\g<1>{today}",
        md,
        count=1,
    )
    for ev in events:
        bullet = timeline_bullet(ev)
        if ev["source"] in md and ev["title"] in md:
            continue
        heading = month_heading(ev["iso"])
        if heading not in md:
            md = md.replace(DEEP_DIVE, f"\n{heading}\n\n{bullet}\n{DEEP_DIVE}", 1)
        else:
            md = md.replace(DEEP_DIVE, f"\n{bullet}\n{DEEP_DIVE}", 1)
        item = {
            "date": ev["iso"],
            "tag": ev["tag"],
            "title": ev["title"],
            "source": ev["source"],
        }
        if ev.get("track"):
            item["track"] = ev["track"]
        insertion = ",\n  " + json.dumps(item, ensure_ascii=False)
        md, n = SOURCES_CLOSE.subn(lambda m, line=insertion: line + m.group(0), md, count=1)
        if n != 1:
            raise RuntimeError("could not insert into TIMELINE.md machine-readable array")
    path.write_text(md, encoding="utf-8")


def source_reachable(url: str) -> bool:
    code, _ = http_get(url, timeout=20)
    return code in {200, 203, 301, 302, 303, 401, 403}


def keep_reachable(candidates: list[dict], errors: list[str]) -> list[dict]:
    kept = []
    for ev in candidates:
        if source_reachable(ev["source"]):
            kept.append(ev)
        else:
            errors.append(f"unreachable source skipped: {ev['source']}")
    return kept


def write_report(report: dict) -> None:
    lines = [
        f"# Watch report {report['run_date']}",
        "",
        f"- feeds ok: {report['feeds_ok']}/{report['feeds_total']}",
        f"- pages ok: {report['pages_ok']}/{report['pages_total']}",
        f"- feed items kept: {report['feed_items']}",
        f"- pages changed: {report['pages_changed']}",
        f"- aiaaic pointers: {report.get('pointers', 0)}",
        f"- model: `{report['model']}`",
        f"- applied: {len(report['candidates'])}",
        f"- issue: {report.get('issue_url') or 'none'}",
    ]
    if report.get("tool_log"):
        lines.append("- tools: " + "; ".join(report["tool_log"]))
    if report.get("usage"):
        lines.append(f"- tokens: {json.dumps(report['usage'])}")
    if report.get("errors"):
        lines.append("")
        lines.append("## Errors")
        lines.extend(f"- {e}" for e in report["errors"])
    if report["candidates"]:
        lines.append("")
        lines.append("## Applied")
        for c in report["candidates"]:
            lines.append(f"- **{c['iso']} [{c['tag']}]** {c['title']} - {c['source']}")
            if c.get("why"):
                lines.append(f"  - {c['why']}")
    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
    parser = argparse.ArgumentParser(description="Daily agentic AI safety watch")
    parser.add_argument("--dry-run", action="store_true", help="Do not write data.js or open an issue")
    args = parser.parse_args()

    api_key = os.environ.get("OPENROUTER_API_KEY", "").strip()
    if not api_key:
        print("OPENROUTER_API_KEY is not set", file=sys.stderr)
        return 1
    model = os.environ.get("WATCH_MODEL", WATCH_MODEL).strip() or WATCH_MODEL
    if "fable" not in model.lower():
        print(f"WATCH_MODEL must be Claude Fable via OpenRouter, got {model!r}", file=sys.stderr)
        return 1
    repo = os.environ.get("GITHUB_REPOSITORY", "").strip()
    token = os.environ.get("GITHUB_TOKEN", "").strip()

    sources = json.loads(SOURCES_PATH.read_text(encoding="utf-8"))
    state = {"feed_hashes": {}, "page_hashes": {}, "proposed": []}
    if STATE_PATH.exists():
        try:
            state.update(json.loads(STATE_PATH.read_text(encoding="utf-8")))
        except json.JSONDecodeError:
            pass

    events = load_timeline()
    cutoff = utc_now() - timedelta(days=MAX_ITEM_AGE_DAYS)
    errors: list[str] = []
    feed_items: list[dict] = []
    feeds_ok = 0
    new_hashes: dict[str, str] = {}

    for feed in sources.get("feeds") or []:
        url = feed["url"]
        code, body = http_get(url)
        new_hashes[feed["id"]] = sha256_text(body)
        if code != 200:
            errors.append(f"feed {feed['id']}: HTTP {code}")
            continue
        feeds_ok += 1
        keywords = feed.get("keywords")
        for item in parse_feed(body):
            if not keyword_ok(item["title"], keywords):
                continue
            dt = parse_date(item.get("date"))
            if dt and dt < cutoff:
                continue
            feed_items.append(item)

    feed_items = feed_items[:MAX_FEED_ITEMS]
    pointers: list[str] = []
    page_notes: list[str] = []
    page_hashes: dict[str, str] = {}
    pages_ok = 0
    pages_changed = 0
    old_page_hashes = state.get("page_hashes") or {}

    for page in sources.get("pages") or []:
        code, body = http_get(page["url"])
        digest = sha256_text(body)
        page_hashes[page["id"]] = digest
        if code != 200:
            errors.append(f"page {page['id']}: HTTP {code}")
            continue
        pages_ok += 1
        if page.get("role") == "pointer":
            pointers.extend(extract_pointer_titles(body, page.get("keywords")))
            continue
        if old_page_hashes.get(page["id"]) == digest:
            continue
        pages_changed += 1
        excerpt = strip_html(body)[:PAGE_EXCERPT_CHARS]
        page_notes.append(f"### {page['id']} ({page['url']})\n{excerpt}")

    today = utc_now().date().isoformat()
    prompt = build_prompt(events, feed_items, page_notes, pointers, today)
    candidates: list[dict] = []
    usage: dict = {}
    tool_log: list[str] = []
    try:
        output, usage, tool_log = asyncio.run(run_watch_agent(api_key, model, prompt))
        dumped = [c.model_dump(by_alias=True) for c in output.candidates]
        candidates = validate_candidates({"candidates": dumped}, events)
        candidates = keep_reachable(candidates, errors)
    except Exception as exc:  # noqa: BLE001 - surface in the report, do not crash the commit
        errors.append(f"agent: {exc}")

    applied: list[dict] = []
    if candidates and not args.dry_run:
        try:
            apply_to_data_js(candidates)
            apply_to_timeline_md(candidates, today)
            applied = candidates
        except Exception as exc:  # noqa: BLE001
            errors.append(f"apply: {exc}")

    issue_url = None
    if applied and repo and token and not args.dry_run:
        ensure_label(repo, token)
        lines = [
            f"Watch applied {len(applied)} event(s) on {today}.",
            "",
            "Written to `data.js` and `TIMELINE.md` by a Pydantic AI agent (Claude Fable 5.1, thinking high). Revert the commit if one is wrong.",
            "",
        ]
        for c in applied:
            label = c.get("sourceLabel") or c["source"]
            lines.append(f"### {c['iso']} [{c['tag']}] {c['title']}")
            lines.append(f"- source: [{label}]({c['source']})")
            if c.get("why"):
                lines.append(f"- why: {c['why']}")
            lines.append("")
        code, created = github_api(
            "POST",
            f"/repos/{repo}/issues",
            token,
            {
                "title": f"watch: added {len(applied)} event(s) on {today}",
                "body": "\n".join(lines),
                "labels": ["watch"],
            },
        )
        if code in {200, 201} and isinstance(created, dict):
            issue_url = created.get("html_url")
        else:
            errors.append(f"github issue: HTTP {code} {created}")

    proposed = list(state.get("proposed") or [])
    for c in applied:
        proposed.append({"url": c["source"], "title": c["title"], "iso": c["iso"], "seen": today, "applied": True})
    proposed = proposed[-200:]

    report = {
        "run_date": today,
        "feeds_ok": feeds_ok,
        "feeds_total": len(sources.get("feeds") or []),
        "pages_ok": pages_ok,
        "pages_total": len(sources.get("pages") or []),
        "feed_items": len(feed_items),
        "pages_changed": pages_changed,
        "pointers": len(pointers),
        "model": model,
        "candidates": applied if not args.dry_run else candidates,
        "issue_url": issue_url,
        "usage": usage,
        "tool_log": tool_log,
        "errors": errors,
    }
    write_report(report)
    STATE_PATH.write_text(
        json.dumps(
            {
                "last_run": utc_now().isoformat(timespec="seconds"),
                "feed_hashes": new_hashes,
                "page_hashes": page_hashes,
                "proposed": proposed,
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(REPORT_PATH.read_text(encoding="utf-8"))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
