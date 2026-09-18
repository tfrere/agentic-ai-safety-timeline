---
title: Agentic AI Safety Timeline
emoji: 🛡️
colorFrom: indigo
colorTo: gray
sdk: static
pinned: false
short_description: Sourced timeline of agentic AI safety events (2026)
---

# Agentic AI Safety Timeline (2026)

A sourced, deduplicated, interactive timeline (newest first) of the serious events in
agentic AI safety: real sandbox-escape incidents, notable departures
and whistleblowers, lab position statements, regulation, third-party evaluations, and
the most solid research. Sensationalist takes with no verifiable substance were
filtered out.

- Filter by category, toggle the three parallel incident tracks (OpenAI x HF,
  Anthropic x Irregular, UK AISI), and search across events.
- Every entry links to a primary or high-quality source.
- Data lives in `data.js` (also mirrored as a machine-readable array) so the frise can
  be regenerated or extended easily.
- Includes a field note: a read-only audit of one developer's machine (token exposure
  through AI chat history, agent permission surface), with the audit script
  (`audit-agent-permissions.sh`) available for download.

Built as a static Space. Content and full write-up: see `TIMELINE.md`.

GitHub copy (Actions live here): https://github.com/tfrere/agentic-ai-safety-timeline

## Daily watch

A GitHub Actions cron (`watch.yml`, 06:12 UTC) runs a **Pydantic AI** agent
(`anthropic/claude-opus-5`, `thinking=high`) with `web_search` and `fetch_page`
tools. Passing events are written to `data.js` / `TIMELINE.md`, then pushed to
GitHub and the Hugging Face Space. Revert the commit if an entry is wrong.

- Sources: `watch/sources.json`
- Local run: `uv run python watch/run.py --dry-run`
- Method given to the agent: `watch/METHOD.md`
- Discovery net: AIAAIC titles (pointers only, never cited)
- Secrets: `OPENROUTER_API_KEY`, `HF_TOKEN`
