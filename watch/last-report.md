# Watch report 2026-11-17

- feeds ok: 11/11
- pages ok: 10/10
- feed items kept: 40
- pages changed: 7
- aiaaic pointers: 15
- model: `anthropic/claude-opus-5`
- applied: 2
- issue: https://github.com/tfrere/agentic-ai-safety-timeline/issues/48
- tools: step 1 fetch_page -> 6087 chars; step 2 fetch_page -> 127 chars; step 3 fetch_page -> 133 chars; step 4 web_search -> 2128 chars; step 5 fetch_page -> 4808 chars; step 6 fetch_page -> 128 chars; step 7 web_search -> 2793 chars; step 8 fetch_page -> 660 chars
- tokens: {"details": {"is_byok": 0, "audio_tokens": 0, "reasoning_tokens": 994, "image_tokens": 0}, "requests": 10, "input_audio_tokens": 0, "output_tokens": 2358, "input_tokens": 273507, "output_audio_tokens": 0, "cache_read_tokens": 0, "cache_write_tokens": 0, "output_reasoning_tokens": 994, "cost": "1.426485", "tool_calls": 9}

## Applied
- **2026-11-16 [EVAL]** METR: investigator agents increasingly tell alignment evals apart from capability evals - https://metr.org/notes/2026-11-16-measuring-alignment-eval-tells/
  - METR research note by Uzay Girit, Kaivu Hariharan and Leni Shor, published on metr.org.
- **2026-11-16 [LAB]** Anthropic cuts its vulnerability disclosure window to 30 days, citing AI rediscovery - https://www.anthropic.com/research/coordinated-vulnerability-disclosure-timelines
  - Anthropic Frontier Red Team post on anthropic.com/research.
