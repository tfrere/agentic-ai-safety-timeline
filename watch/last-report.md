# Watch report 2026-11-18

- feeds ok: 11/11
- pages ok: 10/10
- feed items kept: 40
- pages changed: 8
- aiaaic pointers: 15
- model: `anthropic/claude-opus-5`
- applied: 1
- issue: https://github.com/tfrere/agentic-ai-safety-timeline/issues/49
- tools: step 1 fetch_page -> 127 chars; step 2 fetch_page -> 1198 chars; step 3 fetch_page -> 4181 chars; step 4 fetch_page -> 1175 chars; step 5 web_search -> 2173 chars; step 6 fetch_page -> 6091 chars; step 7 fetch_page -> 128 chars; step 8 fetch_page -> 6044 chars
- tokens: {"details": {"is_byok": 0, "audio_tokens": 0, "reasoning_tokens": 1174, "image_tokens": 0}, "requests": 10, "input_tokens": 305618, "cache_write_tokens": 0, "output_reasoning_tokens": 1174, "input_audio_tokens": 0, "cache_read_tokens": 0, "output_tokens": 2266, "output_audio_tokens": 0, "cost": "1.584740", "tool_calls": 9}

## Applied
- **2026-11-16 [EVAL]** Apollo starts a four-month embedded evaluation pilot inside OpenAI - https://www.apolloresearch.ai/blog/pilot-towards-embedded-evaluations
  - Apollo Research's own blog post announcing the pilot, with the access and withholding rules written out.
