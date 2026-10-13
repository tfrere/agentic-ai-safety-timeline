# Watch report 2026-10-13

- feeds ok: 11/11
- pages ok: 10/10
- feed items kept: 40
- pages changed: 6
- aiaaic pointers: 15
- model: `anthropic/claude-opus-5`
- applied: 3
- issue: https://github.com/tfrere/agentic-ai-safety-timeline/issues/25
- tools: step 1 fetch_page -> 113 chars; step 2 web_search -> 2006 chars; step 3 fetch_page -> 6076 chars; step 4 fetch_page -> 6110 chars; step 5 fetch_page -> 6078 chars; step 6 web_search -> 2385 chars; step 7 web_search -> 1839 chars; step 8 web_search -> 2640 chars
- tokens: {"details": {"is_byok": 0, "audio_tokens": 0, "reasoning_tokens": 2521, "image_tokens": 0}, "requests": 10, "cache_read_tokens": 0, "cache_write_tokens": 0, "output_tokens": 4166, "output_reasoning_tokens": 2521, "output_audio_tokens": 0, "input_audio_tokens": 0, "input_tokens": 267121, "cost": "1.439755", "tool_calls": 9}

## Applied
- **2026-10-12 [RESEARCH]** Anthropic: small models may be months from self-replicating across IoT devices - https://www.anthropic.com/research/self-replicating-ai
  - First-party Anthropic Frontier Red Team publication (William Zhou, Daniel Freeman) with its own measurements, not press coverage.
- **2026-10-12 [LAB]** Anthropic says new anti-distillation defences cut harvested data by 90-99% - https://www.anthropic.com/research/distillation-defenses
  - First-party Anthropic post with its own numbers and attributions, following the earlier September reporting on reasoning extraction.
- **2026-10-12 [LAB]** UK AISI sets out priorities for technical best practice during frontier AI development - https://www.aisi.gov.uk/blog/towards-technical-best-practice-for-frontier-ai-development
  - First-party institutional statement on the AISI blog, following the UK's September commitments.
