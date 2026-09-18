# Watch report 2026-09-18

- feeds ok: 11/11
- pages ok: 10/10
- feed items kept: 40
- pages changed: 7
- aiaaic pointers: 15
- model: `anthropic/claude-fable-5.1`
- applied: 3
- issue: https://github.com/tfrere/agentic-ai-safety-timeline/issues/3
- tools: step 1 fetch_page -> 133 chars; step 2 web_search -> 2504 chars; step 3 fetch_page -> 134 chars; step 4 web_search -> 12 chars; step 5 fetch_page -> 6113 chars; step 6 web_search -> 2082 chars; step 7 fetch_page -> 6090 chars; step 8 fetch_page -> 6090 chars
- tokens: {"details": {"is_byok": 0, "audio_tokens": 0, "reasoning_tokens": 2311, "image_tokens": 0}, "requests": 10, "input_tokens": 239872, "output_tokens": 4252, "input_audio_tokens": 0, "output_audio_tokens": 0, "cache_read_tokens": 0, "output_reasoning_tokens": 2311, "cache_write_tokens": 0, "cost": "2.61132", "tool_calls": 9}

## Applied
- **2026-09-17 [LAB]** Anthropic proposes public metrics on AI-led R&D, agent oversight and compute; commits to embedded third-party evaluators - https://www.anthropic.com/institute/measuring-pace-of-ai-development
  - First-party Anthropic post (anthropic.com/institute). Fetched and grounded. Matches the post-incident push for pacing/transparency and embedded evaluators already on the timeline for OpenAI and Hugging Face.
- **2026-09-10 [RESEARCH]** Redwood proposes verified reporting of 'opaque serial depth' to track architecture effects on CoT monitorability - https://blog.redwoodresearch.org/p/proposal-for-tracking-the-effects
  - Redwood Research blog post by named authors, fetched. Directly relevant to the Sep 1 GPT-6 Astra CoT-monitorability drop; proposes a concrete verification regime rather than a jailbreak result.
- **2026-09-09 [LAB]** Paul Christiano joins OpenAI Foundation Board and its Safety and Security Committee - https://openai.com/index/paul-christiano-joins-openai-foundation-board/
  - Official OpenAI announcement (openai.com/index, in OpenAI's own feed). The openai.com page returned 403 to the fetcher this run; details were confirmed via a fetched recap quoting the announcement. Governance change at OpenAI in the middle of the Hawley/Blumenthal probes.
