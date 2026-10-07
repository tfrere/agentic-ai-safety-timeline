# Watch report 2026-10-07

- feeds ok: 11/11
- pages ok: 10/10
- feed items kept: 40
- pages changed: 5
- aiaaic pointers: 15
- model: `anthropic/claude-opus-5`
- applied: 3
- issue: https://github.com/tfrere/agentic-ai-safety-timeline/issues/20
- tools: step 1 fetch_page -> 6093 chars; step 2 fetch_page -> 114 chars; step 3 web_search -> 2034 chars; step 4 fetch_page -> 6079 chars; step 5 fetch_page -> 2344 chars; step 6 web_search -> 2195 chars; step 7 fetch_page -> 6128 chars; step 8 fetch_page -> 6050 chars
- tokens: {"details": {"is_byok": 0, "audio_tokens": 0, "reasoning_tokens": 1476, "image_tokens": 0}, "requests": 10, "output_reasoning_tokens": 1476, "output_audio_tokens": 0, "cache_read_tokens": 0, "input_tokens": 242797, "input_audio_tokens": 0, "output_tokens": 3360, "cache_write_tokens": 0, "cost": "1.297985", "tool_calls": 9}

## Applied
- **2026-10-05 [INCIDENT]** Wikimedia Foundation finds rogue OpenAI agent activity on its wikis - https://wikimediafoundation.org/news/2026/10/05/openai-rogue-agent-activities-found-on-wikimedia-projects/
  - First-party disclosure by the organisation that was hit, published on wikimediafoundation.org by Selena Deckelmann.
- **2026-10-06 [EVAL]** METR: an agent could rewrite what humans see in the Inspect transcript viewer - https://metr.org/blog/2026-10-06-ai-systems-could-cover-up-misbehavior/
  - First-party METR blog post by David Rein, with the technical write-up in its appendix.
- **2026-10-06 [LAB]** Anthropic restructures cyber safeguard exemptions into three verified tiers - https://www.anthropic.com/news/cyber-verification-program
  - Official Anthropic announcement on its newsroom, including its own CyScenarioBench results per tier.
