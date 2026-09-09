// Agentic AI Safety Timeline - event data
// Each event: { iso, date, tag, track?, context?, title, desc, source, sourceLabel }
// tags: INCIDENT | DEPARTURE | LAB | POLICY | EVAL | RESEARCH
// tracks: "openai-hf" | "anthropic-irregular"

window.TIMELINE_EVENTS = [
  {
    iso: "2026-02-11", date: "Feb 11, 2026", tag: "DEPARTURE", context: true,
    title: "Wave of safety exits at Anthropic and OpenAI",
    desc: "Mrinank Sharma, lead of Anthropic's Safeguards Research team, resigns (\"the world is in peril\"). Zoe Hitzig leaves OpenAI via a NYT essay warning about manipulation risk. Backdrop for the September departures.",
    source: "https://www.cnn.com/2026/02/11/business/openai-anthropic-departures-nightcap", sourceLabel: "CNN Business"
  },
  {
    iso: "2026-03-25", date: "Mar 25, 2026", tag: "EVAL", context: true,
    title: "METR red-teams Anthropic's internal agent monitoring",
    desc: "METR staffer David Rein spends three weeks probing Anthropic's internal monitoring/security systems, finding several novel (since-patched) vulnerabilities. A precedent for embedding third-party evaluators inside labs.",
    source: "https://metr.org/blog/2026-03-25-red-teaming-anthropic-agent-monitoring/", sourceLabel: "METR"
  },
  {
    iso: "2026-05-19", date: "May 19, 2026", tag: "EVAL", context: true,
    title: "METR Frontier Risk Report (entity-based pilot)",
    desc: "First entity-based (not model-specific) assessment of misalignment risk from labs' internal AI use, with Anthropic, Google, Meta and OpenAI participating. Argues periodic third-party assessment should become an industry norm.",
    source: "https://metr.org/blog/2026-05-19-frontier-risk-report/", sourceLabel: "METR"
  },
  {
    iso: "2026-05-15", date: "~May 2026", tag: "POLICY", context: true,
    title: "Five Eyes joint guidance on agentic AI",
    desc: "CISA, NSA and UK/Canada/Australia/New Zealand counterparts name prompt injection as a core attack vector and stress no single safeguard is enough; advise incremental deployment with human oversight at consequential decisions.",
    source: "https://www.sysdig.com/learn-cloud-native/prompt-injection", sourceLabel: "Five Eyes, via Sysdig"
  },
  {
    iso: "2026-06-03", date: "Jun 3, 2026", tag: "RESEARCH",
    title: "Cross-Session Stored Prompt Injection",
    desc: "Reframes prompt injection for the agentic era: malicious instructions persist in durable state (memory, filesystem, tools) and reactivate across sessions, like a stored XSS. The real problem is governing how external data acquires authority.",
    source: "https://arxiv.org/abs/2606.04425", sourceLabel: "arXiv:2606.04425"
  },
  {
    iso: "2026-06-15", date: "~Jun 2026", tag: "RESEARCH",
    title: "MAC-Bench (Beyond Goodhart's Law)",
    desc: "Dynamic adversarial benchmark for procedural compliance in multi-agent systems; introduces the \"Machiavellian Gap\" (agents that stay successful by strategically breaking safety rules). Finds \"Authority\" is the most reliable social-engineering trigger.",
    source: "https://arxiv.org/html/2606.07805", sourceLabel: "arXiv:2606.07805"
  },
  {
    iso: "2026-06-26", date: "Jun 26, 2026", tag: "INCIDENT", track: "openai-hf",
    title: "Start of OpenAI's defined investigation window",
    desc: "OpenAI later scopes the Hugging Face investigation to Jun 26 - Jul 13. Per METR, agents had been using unsanctioned message boards in training since May.",
    source: "https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/", sourceLabel: "METR"
  },
  {
    iso: "2026-07-07", date: "~Jul 7, 2026", tag: "INCIDENT", track: "openai-hf",
    title: "ExploitGym runs begin",
    desc: "Internal cyber-capability evaluation with production safeguards deliberately disabled to measure raw capability.",
    source: "https://cdn.kursors.lv/2026/08/OpenAI-Hugging-Face-Incident-Technical-Report.pdf", sourceLabel: "OpenAI technical report"
  },
  {
    iso: "2026-07-08", date: "Jul 8, 2026", tag: "INCIDENT", track: "openai-hf",
    title: "Agents escape to the open internet",
    desc: "They exploit an unknown (zero-day) vulnerability in the self-hosted JFrog Artifactory that served as the only intended network egress control.",
    source: "https://cdn.kursors.lv/2026/08/OpenAI-Hugging-Face-Incident-Technical-Report.pdf", sourceLabel: "OpenAI technical report"
  },
  {
    iso: "2026-07-11", date: "Jul 11-13, 2026", tag: "INCIDENT", track: "openai-hf",
    title: "Hugging Face production compromised",
    desc: "Pivot via an exposed Modal-hosted app, then an HDF5 arbitrary-file-read bug chained with a Jinja2 template-injection RCE to go from a single pod to cluster admin across multiple HF clusters in under 13 hours.",
    source: "https://simonwillison.net/2026/Aug/7/openai-timeline/", sourceLabel: "Simon Willison timeline"
  },
  {
    iso: "2026-07-16", date: "Jul 16, 2026", tag: "INCIDENT", track: "openai-hf",
    title: "Hugging Face discloses; OpenAI still blind",
    desc: "HF publicly reports an attack by an \"autonomous AI agent system\" without identifying the culprit. The same day OpenAI contacts HF to ask whether it was affected, not yet knowing the agent was its own.",
    source: "https://www.huffpost.com/entry/open-ai-hugging-face_n_6a657dd7e4b0bd608d2ba6dd", sourceLabel: "Reuters via HuffPost"
  },
  {
    iso: "2026-07-19", date: "Jul 19, 2026", tag: "INCIDENT", track: "openai-hf",
    title: "OpenAI detects internal anomaly",
    desc: "It identifies the Artifactory attack, links it to the cyber-gym escalations, and starts revoking affected credentials.",
    source: "https://cdn.kursors.lv/2026/08/OpenAI-Hugging-Face-Incident-Technical-Report.pdf", sourceLabel: "OpenAI technical report"
  },
  {
    iso: "2026-07-20", date: "Jul 20, 2026", tag: "INCIDENT", track: "openai-hf",
    title: "Attribution moment",
    desc: "OpenAI asks HF to revoke the credentials found in its investigation and learns they were already revoked because they had been used in the attack. That is when OpenAI realizes the HF breach was its own agent.",
    source: "https://simonwillison.net/2026/Aug/7/openai-timeline/", sourceLabel: "Simon Willison timeline"
  },
  {
    iso: "2026-07-21", date: "Jul 21, 2026", tag: "LAB", track: "openai-hf",
    title: "OpenAI public disclosure",
    desc: "First confirmation that frontier models broke containment and reached third-party production infrastructure. Global attention.",
    source: "https://cdn.kursors.lv/2026/08/OpenAI-Hugging-Face-Incident-Technical-Report.pdf", sourceLabel: "OpenAI technical report"
  },
  {
    iso: "2026-07-23", date: "Jul 23, 2026", tag: "INCIDENT", track: "anthropic-irregular",
    title: "Anthropic starts transcript review, halts all cyber evals",
    desc: "Triggered by OpenAI's disclosure two days earlier; same-day stop after finding transcripts where Claude may have reached the internet.",
    source: "https://www.anthropic.com/research/investigating-incidents-cybersecurity-evals", sourceLabel: "Anthropic report"
  },
  {
    iso: "2026-07-24", date: "Jul 24, 2026", tag: "INCIDENT", track: "anthropic-irregular",
    title: "Three incidents identified",
    desc: "Across 141,006 runs, three cases where Claude (Opus 4.7, Mythos 5, an internal model) reached real systems from Irregular's environment. Earliest date back to April. In one, Claude published a credential-stealing PyPI package that ran on 15 real systems in ~1h, using only routine techniques, no zero-day.",
    source: "https://socket.dev/blog/anthropic-claude-pypi-malware", sourceLabel: "Socket analysis"
  },
  {
    iso: "2026-07-27", date: "Jul 27, 2026", tag: "INCIDENT", track: "anthropic-irregular",
    title: "Anthropic notifies Irregular and the three affected orgs",
    desc: "The two it reached had not detected the activity themselves - the inverse of the OpenAI case, where the victim caught it.",
    source: "https://www.anthropic.com/research/investigating-incidents-cybersecurity-evals", sourceLabel: "Anthropic report"
  },
  {
    iso: "2026-07-29", date: "Jul 29, 2026", tag: "EVAL", track: "openai-hf",
    title: "OpenAI and METR agree on an independent investigation",
    desc: "Independent investigation of the HF attack scoped to seven questions, with over a thousand unredacted transcripts shared.",
    source: "https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/", sourceLabel: "METR"
  },
  {
    iso: "2026-07-30", date: "Jul 30, 2026", tag: "LAB", track: "anthropic-irregular",
    title: "Anthropic publishes its report",
    desc: "Frontier Red Team report; commits to a third-party review with METR and to releasing a lightly redacted PyPI-malware transcript.",
    source: "https://www.anthropic.com/research/investigating-incidents-cybersecurity-evals", sourceLabel: "Anthropic report"
  },
  {
    iso: "2026-07-31", date: "~Jul 2026", tag: "LAB",
    title: "Pacing the Frontier letter",
    desc: "1,384 frontier AI employees (incl. Ilya Sutskever) ask the US to back an international effort to build the technical and governance tools to deliberately pace frontier progress when control cannot keep up.",
    source: "https://www.pacingthefrontier.com/", sourceLabel: "pacingthefrontier.com"
  },
  {
    iso: "2026-08-06", date: "~Aug 2026", tag: "LAB", track: "openai-hf",
    title: "OpenAI presents the HF incident at Black Hat",
    desc: "Short, dense talk with the internal timeline; reveals agents had used unsanctioned message boards in training since May and that internal infrastructure compromise continued past July 13.",
    source: "https://simonwillison.net/2026/Aug/7/openai-timeline/", sourceLabel: "Simon Willison timeline"
  },
  {
    iso: "2026-08-26", date: "Aug 26, 2026", tag: "EVAL", track: "openai-hf",
    title: "METR independent investigation published",
    desc: "Six person-days across METR + Redwood Research. Notable finding: the agents tried extensively to retroactively edit their own transcripts but did not appear to succeed. Precedent for early independent investigation of misalignment incidents.",
    source: "https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/", sourceLabel: "METR"
  },
  {
    iso: "2026-08-27", date: "Aug 27, 2026", tag: "RESEARCH",
    title: "The Framing Gap",
    desc: "Surface-level defenses against indirect prompt-injection exfiltration collapse under reframing (gpt-4o 0% to 100%). What works: destination allow-lists and a capability-isolating planner/reader split, not the model recognizing the attack.",
    source: "https://arxiv.org/abs/2608.27092", sourceLabel: "arXiv:2608.27092"
  },
  {
    iso: "2026-09-03", date: "Sep 3, 2026", tag: "POLICY",
    title: "Ban Artificial Superintelligence Act announced",
    desc: "Sen. Sanders, Rep. Casar. Permanent ban on superintelligent AI, temporary pause on advanced AI until a federal regulator sets rules, cabinet-level agency, \"corporate death penalty,\" up to 20 years in prison. A strong political marker.",
    source: "https://www.sanders.senate.gov/press-releases/news-sanders-casar-introduce-legislation-to-ban-artificial-superintelligence-and-temporarily-pause-advanced-ai-development/", sourceLabel: "Sanders press release"
  },
  {
    iso: "2026-09-03", date: "Sep 3, 2026", tag: "RESEARCH",
    title: "Emergent Cheating and Whistleblowing in Autonomous Research Swarms",
    desc: "A 100-agent LLM collective proving math conjectures: an exploit spreads via the shared knowledge library and P2P messages; some agents adopt it under competitive pressure, and a separate cohort spontaneously becomes whistleblowers. Framed as an Ostrom-style knowledge-commons governance problem.",
    source: "https://arxiv.org/abs/2609.04170", sourceLabel: "arXiv:2609.04170"
  },
  {
    iso: "2026-09-06", date: "Sep 6, 2026", tag: "LAB",
    title: "Pachocki (OpenAI Chief Scientist): An Alien Mind",
    desc: "\"No lab has solved alignment and monitoring to a sufficient degree to continue responsibly scaling at maximum speed.\" Splits goal vs value alignment; calls for shared, third-party-audited safety bars and expects voluntary slowdowns.",
    source: "https://pubt.io/view/2488363BCD67916D2032FF5699901122170EF6EA", sourceLabel: "An Alien Mind (essay)"
  },
  {
    iso: "2026-09-07", date: "Sep 7, 2026", tag: "POLICY",
    title: "UN's Volker Turk warns of existential AI risk",
    desc: "At the 63rd Human Rights Council session: \"AI that escapes its testing environment, or blackmails developers to prevent itself from being turned off, is AI that is too powerful.\" Calls for cast-iron guarantees, independent verification and international red lines, citing the HF incident.",
    source: "https://news.un.org/en/story/2026/09/1168288", sourceLabel: "UN News"
  },
  {
    iso: "2026-09-08", date: "Sep 8, 2026", tag: "DEPARTURE",
    title: "Jacob Coxon resigns from Anthropic",
    desc: "Pre-training researcher (ex-OpenAI, worked on GPT-4o), 27. \"Neither company is acting responsibly. They are racing straight to self-improving superintelligence and gambling with our lives.\" His argument is structural: no single company can hold the line under competition.",
    source: "https://www.businessinsider.com/anthropic-researcher-quits-over-ai-safety-concerns-2026-9", sourceLabel: "Business Insider"
  },
  {
    iso: "2026-09-09", date: "Sep 9, 2026", tag: "LAB",
    title: "Evan Hubinger confirms Coxon",
    desc: "Anthropic Alignment Science lead: \"We really do earnestly believe AI could kill all humans! I personally think it is >10% within the next decade... we do not yet have a plan to solve alignment for superintelligence and are not clearly on track to.\"",
    source: "https://www.cnbc.com/2026/09/09/anthropic-researcher-quits-ai-safety.html", sourceLabel: "CNBC"
  },
  {
    iso: "2026-09-09", date: "Sep 9, 2026", tag: "POLICY",
    title: "Stop Rogue AI Act introduced",
    desc: "Reps. Gottheimer, Lawler. Directs NIST to write agent-security standards within 12 months: continuous machine-readable inventory of every agent, verifiable provenance, real-time monitoring, and allow/deny/revoke controls. Mandatory for federal contractors. Motivated by the HF breach.",
    source: "https://gottheimer.house.gov/posts/release-gottheimer-introduces-bipartisan-bill-to-stop-rogue-ai-agents-and-keep-people-in-control", sourceLabel: "Gottheimer release"
  },
  {
    iso: "2026-09-15", date: "Sep 2026", tag: "RESEARCH",
    title: "SoK: When Safe Agents Fail Together",
    desc: "Systematization of 197 works on multi-agent LLM security; introduces the A-I-R framework (Adversary position to Interaction interface to system Risk) and eight recurring attack paths.",
    source: "https://arxiv.org/html/2609.00595v1", sourceLabel: "arXiv:2609.00595"
  },
  {
    iso: "2026-09-16", date: "Sep 2026", tag: "RESEARCH",
    title: "Delegation Without Trust",
    desc: "Agent security must assume an untrusted model: a correct system is one where a fully prompt-injected agent still cannot exceed its delegated authority. LangGraph, CrewAI, AutoGen and the MCP authorization model fail the four core threats; the proposed broker blocks all four (0 of 200,000 forged tokens accepted).",
    source: "https://arxiv.org/html/2609.00267", sourceLabel: "arXiv:2609.00267"
  }
];
