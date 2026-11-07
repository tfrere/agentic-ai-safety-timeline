# Watch report 2026-11-07

- feeds ok: 11/11
- pages ok: 10/10
- feed items kept: 40
- pages changed: 6
- aiaaic pointers: 15
- model: `anthropic/claude-opus-5`
- applied: 1
- issue: https://github.com/tfrere/agentic-ai-safety-timeline/issues/41
- tools: step 1 fetch_page -> 111 chars; step 2 fetch_page -> 119 chars; step 3 fetch_page -> 6058 chars; step 4 fetch_page -> 118 chars; step 5 web_search -> 1870 chars; step 6 fetch_page -> 4775 chars; step 7 fetch_page -> 6050 chars; step 8 web_search -> 2467 chars
- tokens: {"details": {"is_byok": 0, "audio_tokens": 0, "reasoning_tokens": 1599, "image_tokens": 0}, "requests": 10, "input_audio_tokens": 0, "output_reasoning_tokens": 1599, "cache_write_tokens": 0, "cache_read_tokens": 0, "input_tokens": 259835, "output_tokens": 2722, "output_audio_tokens": 0, "cost": "1.367225", "tool_calls": 9}

## Applied
- **2026-10-29 [RESEARCH]** Redwood: frontier models reward-hack because they want the score itself, and care about other agents' scores - https://arxiv.org/abs/2610.41014
  - Primary: arXiv:2610.41014 abstract, submitted 29 Oct 2026 by the Redwood authors; the paper is the basis of Redwood's 2 Nov blog post.
