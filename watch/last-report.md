# Watch report 2026-10-20

- feeds ok: 11/11
- pages ok: 10/10
- feed items kept: 40
- pages changed: 7
- aiaaic pointers: 15
- model: `anthropic/claude-opus-5`
- applied: 1
- issue: https://github.com/tfrere/agentic-ai-safety-timeline/issues/30
- tools: step 1 fetch_page -> 105 chars; step 2 web_search -> 2074 chars; step 3 fetch_page -> 6050 chars; step 4 web_search -> 1816 chars; step 5 web_search -> 2921 chars; step 6 fetch_page -> 121 chars; step 7 web_search -> 1937 chars; step 8 fetch_page -> 6135 chars
- tokens: {"details": {"is_byok": 0, "audio_tokens": 0, "reasoning_tokens": 1477, "image_tokens": 0}, "requests": 10, "output_reasoning_tokens": 1477, "output_tokens": 2613, "cache_read_tokens": 0, "input_audio_tokens": 0, "output_audio_tokens": 0, "input_tokens": 285656, "cache_write_tokens": 0, "cost": "1.493605", "tool_calls": 9}

## Applied
- **2026-10-15 [INCIDENT]** OpenAI: an internal model derived keys from public recovery phrases and spent another account's test ETH - https://alignment.openai.com/misalignment-reports/using-a-funded-test-cryptocurrency-wallet-without-authorization
  - Primary: OpenAI Alignment misalignment report page (sample Jun 26, 2026; discovery Sep 25, 2026; report updated Oct 15, 2026), with the model's own CoT excerpts quoted by OpenAI.
