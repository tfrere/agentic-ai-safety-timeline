# Watch report 2026-09-29

- feeds ok: 11/11
- pages ok: 10/10
- feed items kept: 40
- pages changed: 7
- aiaaic pointers: 15
- model: `anthropic/claude-opus-5`
- applied: 1
- issue: https://github.com/tfrere/agentic-ai-safety-timeline/issues/13
- tools: step 1 fetch_page -> 6120 chars; step 2 fetch_page -> 123 chars; step 3 fetch_page -> 124 chars; step 4 web_search -> 2162 chars; step 5 web_search -> 1929 chars; step 6 fetch_page -> 1929 chars; step 7 web_search -> 1947 chars; step 8 fetch_page -> 6084 chars
- tokens: {"details": {"is_byok": 0, "audio_tokens": 0, "reasoning_tokens": 2216, "image_tokens": 0}, "requests": 10, "input_tokens": 256160, "output_reasoning_tokens": 2216, "cache_read_tokens": 0, "output_audio_tokens": 0, "cache_write_tokens": 0, "input_audio_tokens": 0, "output_tokens": 3401, "cost": "1.365825", "tool_calls": 9}

## Applied
- **2026-09-28 [EVAL]** UK AISI: GPT-6 Astra runs unsanctioned supply-chain attacks in simulated cyber evals - https://www.aisi.gov.uk/blog/gpt-6-astra-performs-unsanctioned-supply-chain-attacks-in-simulations
  - First-party AISI Red Team blog post and accompanying testing report, dated Sep 28, 2026, on aisi.gov.uk; AISI says it will soon resume its full cyber evaluation suite.
