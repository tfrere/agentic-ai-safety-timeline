# Watch report 2026-11-12

- feeds ok: 11/11
- pages ok: 10/10
- feed items kept: 40
- pages changed: 7
- aiaaic pointers: 15
- model: `anthropic/claude-opus-5`
- applied: 3
- issue: https://github.com/tfrere/agentic-ai-safety-timeline/issues/45
- tools: step 1 fetch_page -> 100 chars; step 2 fetch_page -> 101 chars; step 3 fetch_page -> 6050 chars; step 4 web_search -> 1390 chars; step 5 fetch_page -> 6044 chars; step 6 web_search -> 3065 chars; step 7 fetch_page -> 6051 chars; step 8 fetch_page -> 148 chars
- tokens: {"details": {"is_byok": 0, "audio_tokens": 0, "reasoning_tokens": 2408, "image_tokens": 0}, "requests": 10, "input_tokens": 284046, "cache_write_tokens": 0, "input_audio_tokens": 0, "cache_read_tokens": 0, "output_reasoning_tokens": 2408, "output_audio_tokens": 0, "output_tokens": 3690, "cost": "1.512480", "tool_calls": 9}

## Applied
- **2026-11-02 [LAB]** OpenAI deploys activation-based classifiers as real-time safety monitors - https://alignment.openai.com/
  - Listed with date and summary on OpenAI's own alignment research index (alignment.openai.com), the lab's first-party channel for its monitoring stack.
- **2026-11-03 [RESEARCH]** OpenAI studies the gap between agent behaviour in safety evals and in production - https://alignment.openai.com/
  - Dated entry with summary on OpenAI's own alignment research index (alignment.openai.com); bears directly on whether eval results transfer to deployment.
- **2026-11-10 [RESEARCH]** OpenAI maps what makes chain of thought monitorable across the model lifecycle - https://alignment.openai.com/
  - Dated entry with summary on OpenAI's own alignment research index (alignment.openai.com), the lab's primary venue for monitorability work.
