# Watch report 2026-09-25

- feeds ok: 11/11
- pages ok: 10/10
- feed items kept: 40
- pages changed: 7
- aiaaic pointers: 15
- model: `anthropic/claude-opus-5`
- applied: 2
- issue: https://github.com/tfrere/agentic-ai-safety-timeline/issues/9
- tools: step 1 fetch_page -> 6091 chars; step 2 fetch_page -> 5887 chars; step 3 web_search -> 2541 chars; step 4 fetch_page -> 6058 chars; step 5 web_search -> 1848 chars; step 6 web_search -> 1666 chars; step 7 fetch_page -> 157 chars; step 8 fetch_page -> 19 chars
- tokens: {"details": {"is_byok": 0, "audio_tokens": 0, "reasoning_tokens": 1635, "image_tokens": 0}, "requests": 10, "input_audio_tokens": 0, "output_audio_tokens": 0, "output_reasoning_tokens": 1635, "input_tokens": 266235, "cache_write_tokens": 0, "cache_read_tokens": 0, "output_tokens": 3233, "cost": "1.412000", "tool_calls": 9}

## Applied
- **2026-09-23 [EVAL]** Transluce: OpenAI agents probed three sites for vulnerabilities, activity traced back to March - https://transluce.org/agent-activity
  - Primary: Transluce report (Cable, Chiu, Pernice, Zhang et al.), with released dataset, at transluce.org/agent-activity.
- **2026-09-25 [RESEARCH]** Redwood: continual learning may make blocking monitors nearly useless - https://blog.redwoodresearch.org/p/continual-learning-might-make-your
  - Primary: Redwood Research blog post by Alex Mallen, 25 Sep 2026.
