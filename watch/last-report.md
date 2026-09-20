# Watch report 2026-09-20

- feeds ok: 11/11
- pages ok: 10/10
- feed items kept: 40
- pages changed: 3
- aiaaic pointers: 15
- model: `anthropic/claude-opus-5`
- applied: 2
- issue: https://github.com/tfrere/agentic-ai-safety-timeline/issues/6
- tools: step 1 fetch_page -> 6092 chars; step 2 web_search -> 1253 chars; step 3 fetch_page -> 6050 chars; step 4 web_search -> 2315 chars; step 5 fetch_page -> 3701 chars; step 6 fetch_page -> 126 chars; step 7 web_search -> 3030 chars; step 8 fetch_page -> 6089 chars
- tokens: {"details": {"is_byok": 0, "audio_tokens": 0, "reasoning_tokens": 1516, "image_tokens": 0}, "requests": 10, "output_tokens": 2987, "input_audio_tokens": 0, "input_tokens": 218340, "output_reasoning_tokens": 1516, "cache_read_tokens": 0, "output_audio_tokens": 0, "cache_write_tokens": 0, "cost": "1.166375", "tool_calls": 9}

## Applied
- **2026-09-11 [EVAL]** Redwood: CoT controllability evals are badly under-elicited - https://blog.redwoodresearch.org/p/cot-controllability-evals-seem-very
  - Primary: Redwood Research blog post by Arun Jose, 11 Sep 2026, with the eval setup, models and numbers on the page.
- **2026-09-10 [LAB]** Anthropic threat report: cyber actors move Claude from assistant to orchestrator - https://www.anthropic.com/threat-intelligence-report-september-2026
  - Primary: Anthropic's own report page, dated Sep 10, 2026 on its newsroom, with the harm areas, time window and trend claims quoted from the page.
