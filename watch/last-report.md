# Watch report 2026-10-28

- feeds ok: 11/11
- pages ok: 10/10
- feed items kept: 40
- pages changed: 5
- aiaaic pointers: 15
- model: `anthropic/claude-opus-5`
- applied: 1
- issue: https://github.com/tfrere/agentic-ai-safety-timeline/issues/36
- tools: step 1 fetch_page -> 138 chars; step 2 fetch_page -> 103 chars; step 3 web_search -> 2100 chars; step 4 fetch_page -> 6078 chars; step 5 web_search -> 1791 chars; step 6 fetch_page -> 6054 chars; step 7 fetch_page -> 6050 chars; step 8 fetch_page -> 3897 chars
- tokens: {"details": {"is_byok": 0, "audio_tokens": 0, "reasoning_tokens": 1538, "image_tokens": 0}, "requests": 10, "output_tokens": 2655, "input_audio_tokens": 0, "output_audio_tokens": 0, "cache_write_tokens": 0, "input_tokens": 243451, "cache_read_tokens": 0, "output_reasoning_tokens": 1538, "cost": "1.283630", "tool_calls": 9}

## Applied
- **2026-10-27 [RESEARCH]** Anthropic: analysts deferred to their coding agent on 86% of open judgment calls - https://www.anthropic.com/research/agents-judgment-calls
  - First-party Anthropic research post (Herdagdelen, Joren, Tamkin, Alignment team, published Oct 27, 2026) with the trial design, the 86%/60%/77%/15% figures and the authors' own caveat that a human reviewer 'is only an independent check if their judgment is their own' — directly relevant to human-in-the-loop oversight of AI safety research.
