# Watch report 2026-11-14

- feeds ok: 11/11
- pages ok: 10/10
- feed items kept: 40
- pages changed: 6
- aiaaic pointers: 15
- model: `anthropic/claude-opus-5`
- applied: 2
- issue: https://github.com/tfrere/agentic-ai-safety-timeline/issues/47
- tools: step 1 fetch_page -> 100 chars; step 2 fetch_page -> 6091 chars; step 3 web_search -> 2763 chars; step 4 fetch_page -> 101 chars; step 5 fetch_page -> 6123 chars; step 6 fetch_page -> 105 chars; step 7 fetch_page -> 6078 chars; step 8 fetch_page -> 6051 chars
- tokens: {"details": {"is_byok": 0, "audio_tokens": 0, "reasoning_tokens": 1877, "image_tokens": 0}, "requests": 10, "output_reasoning_tokens": 1877, "input_tokens": 287188, "cache_write_tokens": 0, "input_audio_tokens": 0, "cache_read_tokens": 0, "output_audio_tokens": 0, "output_tokens": 3201, "cost": "1.515965", "tool_calls": 9}

## Applied
- **2026-11-09 [LAB]** OpenAI builds Control Room, a centralised kill switch for research model workloads - https://openai.com/index/control-room/
  - First-party OpenAI engineering post on its own containment infrastructure, naming the 35-second stop latency and the DNS misalignment incident as a monitoring example.
- **2026-11-13 [LAB]** Anthropic publishes its recommendations for building safety evaluations - https://www.anthropic.com/research/building-strong-safety-evaluations
  - First-party Anthropic methodology post that codifies post-incident evaluation practice, including the sandbox and internet-access restrictions it adopted after its own incidents.
