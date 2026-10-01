# Watch report 2026-10-01

- feeds ok: 11/11
- pages ok: 10/10
- feed items kept: 40
- pages changed: 4
- aiaaic pointers: 15
- model: `anthropic/claude-opus-5`
- applied: 4
- issue: https://github.com/tfrere/agentic-ai-safety-timeline/issues/15
- tools: step 1 fetch_page -> 6086 chars; step 2 fetch_page -> 133 chars; step 3 fetch_page -> 134 chars; step 4 fetch_page -> 124 chars; step 5 fetch_page -> 6111 chars; step 6 fetch_page -> 6101 chars; step 7 fetch_page -> 5904 chars; step 8 fetch_page -> 5549 chars
- tokens: {"details": {"is_byok": 0, "audio_tokens": 0, "reasoning_tokens": 2482, "image_tokens": 0}, "requests": 10, "input_audio_tokens": 0, "cache_read_tokens": 0, "output_reasoning_tokens": 2482, "cache_write_tokens": 0, "output_audio_tokens": 0, "output_tokens": 4700, "input_tokens": 223862, "cost": "1.236810", "tool_calls": 9}

## Applied
- **2026-09-30 [POLICY]** METR testifies to the Senate on the OpenAI / Hugging Face agent incident - https://metr.org/blog/2026-09-30-chris-painter-senate-testimony/
  - First-party METR blog post publishing the written testimony and naming the Senate subcommittee hearing.
- **2026-09-28 [LAB]** OpenAI apologises to Australia and names four affected agencies - https://openai.com/index/how-we-will-do-better-for-australia/
  - OpenAI's own incident post, with the agency list and notification dates.
- **2026-09-28 [LAB]** OpenAI publishes initial guidelines for safety cases before frontier RL runs - https://openai.com/index/towards-safety-cases-for-frontier-ai-training/
  - OpenAI's own post setting out the proposed training-time safety-case framework.
- **2026-09-30 [INCIDENT]** OpenAI disrupts a reasoning-extraction campaign and attributes a core cluster to Moonshot AI - https://openai.com/index/disrupting-a-coordinated-model-distillation-campaign/
  - OpenAI's own disclosure post, which contains the timeline, volumes and attribution.
