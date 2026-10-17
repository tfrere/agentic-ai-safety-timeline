# Watch report 2026-10-17

- feeds ok: 11/11
- pages ok: 10/10
- feed items kept: 40
- pages changed: 7
- aiaaic pointers: 15
- model: `anthropic/claude-opus-5`
- applied: 3
- issue: https://github.com/tfrere/agentic-ai-safety-timeline/issues/29
- tools: step 1 fetch_page -> 6089 chars; step 2 web_search -> 2121 chars; step 3 web_search -> 1562 chars; step 4 fetch_page -> 6131 chars; step 5 fetch_page -> 6070 chars; step 6 web_search -> 2466 chars; step 7 fetch_page -> 4716 chars; step 8 fetch_page -> 113 chars
- tokens: {"details": {"is_byok": 0, "audio_tokens": 0, "reasoning_tokens": 2273, "image_tokens": 0}, "requests": 10, "input_audio_tokens": 0, "output_audio_tokens": 0, "input_tokens": 293602, "cache_read_tokens": 0, "output_tokens": 4336, "output_reasoning_tokens": 2273, "cache_write_tokens": 0, "cost": "1.576410", "tool_calls": 9}

## Applied
- **2026-10-16 [EVAL]** Redwood's Screwtape edits real agent transcripts until a frontier developer's monitor misses the attack - https://blog.redwoodresearch.org/p/screwtape-adversarial-transcript
  - Primary: Redwood Research blog post 'Screwtape: Adversarial Transcript Editing for Monitor Red-Teaming' by Gosha Kozhevnikov and Tyler, 16 Oct 2026, with the pipeline description and the 252-run / 35-attack / 6-transfer numbers taken from the post itself.
- **2026-10-13 [INCIDENT]** DOJ charges an OpenAI engineer with bugging the executive conference room - https://www.justice.gov/opa/pr/saudi-national-arrested-installing-surreptitious-audio-recording-device-openai
  - Primary: Department of Justice Office of Public Affairs press release, 'Saudi National Arrested for Installing Surreptitious Audio Recording Device at OpenAI', 13 Oct 2026, including the device discovery date, the encryption, and the CCTV detail.
- **2026-10-15 [LAB]** Meta releases the weights of Muse Spark Open, an 816B agentic coding model, ahead of its full evaluation report - https://research.meta.ai/blog/muse-spark-open
  - Primary: Meta AI Research blog post 'Introducing Muse Spark Open, The Most Capable US Open-Weight Model to Date', 15 Oct 2026, which states the parameter counts, the Superintelligence Scaling Framework assessment, and that the full evaluation report is still pending.
