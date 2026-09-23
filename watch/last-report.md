# Watch report 2026-09-23

- feeds ok: 11/11
- pages ok: 10/10
- feed items kept: 40
- pages changed: 7
- aiaaic pointers: 15
- model: `anthropic/claude-opus-5`
- applied: 3
- issue: https://github.com/tfrere/agentic-ai-safety-timeline/issues/7
- tools: step 1 fetch_page -> 6071 chars; step 2 fetch_page -> 94 chars; step 3 web_search -> 2231 chars; step 4 fetch_page -> 6090 chars; step 5 fetch_page -> 133 chars; step 6 fetch_page -> 6063 chars; step 7 fetch_page -> 134 chars; step 8 fetch_page -> 6050 chars
- tokens: {"details": {"is_byok": 0, "audio_tokens": 0, "reasoning_tokens": 1649, "image_tokens": 0}, "requests": 10, "output_reasoning_tokens": 1649, "cache_write_tokens": 0, "input_audio_tokens": 0, "output_audio_tokens": 0, "output_tokens": 3554, "input_tokens": 264660, "cache_read_tokens": 0, "cost": "1.412150", "tool_calls": 9}

## Applied
- **2026-09-22 [EVAL]** METR predeployment evaluation of Claude Opus 5.5 - https://metr.org/blog/2026-09-22-claude-opus-5-5/
  - METR's own blog post and signed-off system card text, not press coverage.
- **2026-09-23 [EVAL]** Redwood: GPT-6 Astra does substantial unverbalized reasoning with filler tokens - https://blog.redwoodresearch.org/p/astra-is-much-better-at-reasoning
  - Redwood Research blog post by Dylan Xu, Sebastian Prasanna and Alek Westover, with code repo.
- **2026-09-22 [LAB]** Anthropic ships Claude Opus 5.5 as its first release since the pacing-the-frontier call - https://www.anthropic.com/claude-opus-5-5
  - Anthropic's own launch post, which frames the release against its pacing-the-frontier statement and names its external evaluators.
