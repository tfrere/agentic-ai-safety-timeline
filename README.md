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

A GitHub Actions cron (`watch.yml`, 06:12 UTC) fetches first-party RSS/pages, runs one
OpenRouter call (`anthropic/claude-fable-5.1` + web plugin), and opens a `watch` issue
if something new passes the timeline selection bar. It never edits `data.js`.

- Sources: `watch/sources.json`
- Local run: `OPENROUTER_API_KEY=... python watch/run.py --dry-run`
- Secret: repository `OPENROUTER_API_KEY` (same key as marseille-agenda)
