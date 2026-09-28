# Watch report 2026-09-28

- feeds ok: 11/11
- pages ok: 10/10
- feed items kept: 40
- pages changed: 5
- aiaaic pointers: 15
- model: `anthropic/claude-opus-5`
- applied: 1
- issue: https://github.com/tfrere/agentic-ai-safety-timeline/issues/12
- tools: step 1 fetch_page -> 6101 chars; step 2 fetch_page -> 133 chars; step 3 web_search -> 2079 chars; step 4 web_search -> 1726 chars; step 5 fetch_page -> 6054 chars; step 6 web_search -> 1943 chars; step 7 fetch_page -> 6059 chars; step 8 fetch_page -> 127 chars
- tokens: {"details": {"is_byok": 0, "audio_tokens": 0, "reasoning_tokens": 2083, "image_tokens": 0}, "requests": 10, "cache_read_tokens": 0, "input_tokens": 237158, "output_tokens": 3174, "output_audio_tokens": 0, "output_reasoning_tokens": 2083, "cache_write_tokens": 0, "input_audio_tokens": 0, "cost": "1.265140", "tool_calls": 9}

## Applied
- **2026-09-27 [EVAL]** METR deploys a blocking per-action monitor on its own evals and finds holes in it - https://metr.org/notes/2026-09-27-implementing-a-basic-blocking-action-monitor/
  - First-party METR research note (Haskins, Saurous, Rush, Parikh, Barnes), published on metr.org, motivated explicitly by the OpenAI, Anthropic and UK AISI agent incidents.
