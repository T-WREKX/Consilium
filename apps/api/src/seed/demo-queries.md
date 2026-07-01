# Consilium Demo Queries

Curated query catalog for live demos and dry runs against the seeded team graph
([team-graph.seed.ts](./team-graph.seed.ts)). Organized by expected confidence
level. Each entry lists the query, why it lands the way it does, expected
cited node placeholder IDs, expected graph-overlay illumination pattern, and a
sample response opening so demo operators can validate output without judging
on tone alone.

> **The mandatory query is scripted at the bottom of this file.** Operators
> should run it twice in dry runs and check that graph overlay illuminates a
> dense connected subgraph and that citations include multiple authors and
> matters.

---

## High-confidence queries

These should produce `confidence: "high"` (3+ nodes above 0.80 similarity)
and stream substantive synthesized responses with 4–6 citations.

### HC-1 (MANDATORY) — damages expert cross-examination

**Query:**
> What has our firm learned about cross-examining expert witnesses on damages calculations?

See **The mandatory demo query** section at the bottom for the full script.

### HC-2 — Judge Buenaventura's drafting expectations

**Query:**
> How does Judge Buenaventura handle motions in her court? What should we know about her drafting expectations?

**Why it works:** 5 dedicated insights (011–015) all mentioning `judge-buenaventura`, plus 2 cross-cluster bridges (`insight-016` V&A doc dumps where Buenaventura granted continuances; `insight-029` mediator patterns). Authored by 4 different lawyers — Diana Santos, Joaquin Tirona, Rafael Estrada, Ana Mendoza.

**Expected cited nodes:** `insight-011` (15-page limit), `insight-012` (no-oral-MSJ), `insight-013` (file replies early), `insight-014` (no string cites), `insight-015` (MIL pre-trial window).

**Graph overlay:** dense star around `judge-buenaventura` entity node; bridges out to `concept-mil`, `concept-summary-judgment`, and `concept-ja-rule-scope`.

**Sample response opening:**
> Judge Buenaventura of RTC Makati Branch 147 runs a notably disciplined commercial docket. Several patterns are firm-established across our matters. First, the 15-page motion limit is treated as a binding internal rule — over-length filings have correlated with unfavorable first-round rulings in our practice [insight-011]. Second, she dispenses with oral argument on motions for summary judgment as a matter of practice; the reply brief is the final word [insight-012]. Third, she dislikes string citations — one-citation-per-proposition is the working drafting rule [insight-014]...

### HC-3 — Villanueva & Associates patterns

**Query:**
> What patterns have we observed in litigation against Villanueva & Associates?

**Why it works:** 5 dedicated insights (016–020) covering doc dumps, sanctions motions, voluminous pleadings, settlement curve, and formal-channels-only communications. Authors span Diana Santos, Beatrice Sevilla, Sophia Recto, Carlos Reyes.

**Expected cited nodes:** `insight-016` (doc dumps), `insight-017` (sanctions motions), `insight-018` (voluminous pleadings), `insight-019` (settlement timing), `insight-020` (formal channels).

**Graph overlay:** ring around `firm-villanueva`; bridges to `judge-buenaventura` and `judge-cruz` (the judges that have granted continuances on V&A doc dumps).

**Sample response opening:**
> Villanueva & Associates has produced predictable patterns across at least four of our matters. The most reliable is voluminous document disclosures 48–72 hours before critical hearings; counter-strategies include motion to strike, continuance for prejudice, and adverse-inference framing [insight-016]. Their discovery practice is paired with aggressive but thinly-supported sanctions motions filed within 60 days of discovery commencement [insight-017]...

### HC-4 — Summary judgment in trade-secret matters

**Query:**
> What approaches have worked for us on summary judgment in trade secrets cases?

**Why it works:** 5 dedicated insights (021–025) covering declaration density, Pennswell-as-pleading-template, identification specificity, reasonable-measures custodians, and temporal-proximity evidence. Plus 1 cross-cluster bridge to `insight-011` (Br. 147 SJ practice).

**Expected cited nodes:** `insight-021` (declaration density), `insight-022` (Pennswell template), `insight-023` (identification specificity), `insight-024` (reasonable measures), `insight-025` (temporal proximity).

**Graph overlay:** cluster around `concept-trade-secret`, `concept-summary-judgment`, `matter-banyan`, `precedent-air-phil-pennswell`. Authors Felix Domingo and Karen Bautista co-prominent.

**Sample response opening:**
> Our trade-secret summary judgment grant rate correlates more strongly with affidavit density than with any other variable. Of seven SJ motions filed in trade-secret matters over the last three years, the five supported by 4+ detailed affidavits from technical and custodial witnesses were granted in full or substantially in part [insight-021]. The operational pattern: organize the complaint and the SJ brief around the Pennswell elements, with each element receiving its own affidavit foundation [insight-022, insight-024]...

### HC-5 — Settlement leverage and timing

**Query:**
> When should we make settlement offers to maximize leverage?

**Why it works:** 5 dedicated insights (026–030) plus cross-cluster bridges to 019 (V&A timing) and 062 (Helios retrospective).

**Expected cited nodes:** `insight-026` (early mediation construction), `insight-027` (post-ruling leverage window), `insight-028` (structured settlements > PHP 50M), `insight-029` (mediator patterns), `insight-030` (negotiator separation).

**Graph overlay:** cluster around `concept-structured-settlement` and `concept-court-annexed-mediation`; bridges to `firm-villanueva`, `firm-ramos`, `firm-whitfield-mendez`.

**Sample response opening:**
> Our firm's settlement outcomes have several reliable patterns. The strongest is the post-ruling leverage window: offers made within 5–10 business days of a favorable interlocutory ruling have produced terms 25–40% better than offers made two weeks later [insight-027]. The window is narrow — by the second week opposing counsel has reframed the ruling for their client and the psychological impact dissipates...

### HC-6 — Pre-trial conference strategy

**Query:**
> What's our firm's approach to preparing for pre-trial conferences in commercial matters?

**Why it works:** `insight-061` (pre-trial conference strategy) anchors; `insight-015` (Br. 147 MIL window), `insight-031` (verified pleadings), `insight-063` (Skylark retrospective citing under-prepared pre-trial as root cause), `insight-026` (early mediation referrals from pre-trial).

**Expected cited nodes:** `insight-061`, `insight-015`, `insight-031`, `insight-063`, `insight-004` (Buenaventura page limit).

**Graph overlay:** procedural cluster bridging `judge-buenaventura`, `matter-skylark`, `matter-helios`, `matter-banyan`.

**Sample response opening:**
> The pre-trial conference is the single highest-leverage procedural moment in PH commercial matters [insight-061]. The pre-trial order issued out of the conference defines the operative issues, marks the admissibility of stipulated documents, and constrains the trial-stage evidentiary scope. Our operational protocol: partner-drafted pre-trial brief (no junior delegation), aggressive proposed admissions on every documentary element opposing counsel will struggle to dispute, and all motions in limine filed within the pre-trial window [insight-015]...

---

## Medium-confidence queries

These should produce `confidence: "medium"` (2+ nodes above 0.70) — thin but
real coverage. The streamed response should qualify its certainty.

### MC-1 — Foreign arbitral award enforcement

**Query:**
> How do PH courts treat the public-policy defense in foreign arbitral award enforcement?

**Why it works:** `insight-058` (Cordillera-rooted research note, classified `research`, flagged `confidence_marker: medium`). Some adjacency through `matter-cordillera` entity to insight-002 (Daubert-style challenges, research-flavored).

**Expected behavior:** Response should reference the Cordillera matter as the firm's current data point, acknowledge that PH case law on the public-policy defense is doctrinally thin, and offer the narrow-construction operating thesis with explicit hedge language.

**Expected cited nodes:** `insight-058`. Possibly `insight-002` if similarity surfaces it.

**Graph overlay:** thin — `concept-arbitration-enforcement`, `matter-cordillera`, `statute-nyc`, `statute-adr-act`, `witness-ostrowski`.

**Sample response opening:**
> Our coverage on this question is limited to one active matter — Cordillera Mining Arbitration — and the broader doctrinal landscape is genuinely thin. The operating thesis from our research is that PH courts construe the Article V(2)(b) public-policy defense narrowly, requiring affirmative statutory or constitutional conflict rather than routine regulatory disagreement [insight-058]. This is consistent with limited prior enforcement matters we've observed but should not be taken as predictive...

### MC-2 — Expert reliability under the 2019 Revised Rules on Evidence

**Query:**
> How do PH courts apply the 2019 Revised Rules on Evidence to expert testimony reliability challenges?

**Why it works:** `insight-059` (research note on FRE 702/703 PH analogs, `confidence_marker: medium`). Bridges to `insight-002` (Daubert challenges) and `insight-005` (foundation gaps).

**Expected behavior:** Response should identify the four-element rule structure, note that the FRE-703-analog has not produced traction, and qualify that the doctrinal area is developing.

**Expected cited nodes:** `insight-059`, `insight-002`, `insight-005`.

**Graph overlay:** small cluster around `concept-daubert`, `concept-expert-qualification`, `statute-rules-evidence`.

**Sample response opening:**
> The 2019 Revised Rules on Evidence include expert-witness provisions broadly analogous to FRE 702 — a four-element structure covering specialized knowledge, sufficient facts, reliable principles, and reliable application [insight-059]. PH trial-court practice has been receptive to FRE-702-flavored methodology challenges, particularly where a specific methodological gap is identifiable [insight-002]. The FRE-703 analog (challenges to underlying data) has produced less traction in our observed matters...

### MC-3 — Antitrust market definition methodology

**Query:**
> What methodology have we used for relevant market definition in antitrust matters?

**Why it works:** `insight-052` (Coastal market definition lessons) plus `insight-043` (Mendoza-F market-definition rigor) bridge. Thin overall — only one substantive Coastal-rooted matter on the docket.

**Expected cited nodes:** `insight-052`, `insight-043`.

**Graph overlay:** small — `concept-relevant-market`, `matter-coastal`, `judge-mendoza-f`, `witness-aquino`, `statute-pca`.

**Sample response opening:**
> Our most extensive market-definition work has been in the Coastal Trade Dispute, where the narrow lane-segment market definition was decisive at trial. The methodology that carried weight was a diversion-ratio analysis from customer-survey data, prepared by Dr. Christine Aquino [insight-052]. Judge Mendoza of RTC Makati Branch 62 — the judge presiding — applies a notably higher rigor standard to market-definition analysis than most PH trial-court counterparts, requiring econometric support rather than pleading-stage assertions [insight-043]...

---

## Low-confidence queries

These should produce `confidence: "low"` (only 1 node above 0.75). Single
citation, hedged language.

### LC-1 — Helios damages strategy retrospective

**Query:**
> What did we learn from the Helios matter about damages strategy?

**Why it works:** `insight-062` (Helios retrospective) is the single direct hit. Other Helios-tagged insights exist but they're about discrete tactics, not the matter retrospective as a whole.

**Expected cited nodes:** `insight-062`. Possibly `insight-001` (Mei impeachment) via graph expansion.

**Graph overlay:** thin — `matter-helios`, `witness-pugeda`, `witness-mei`, `concept-counsel-supplied-assumptions`.

### LC-2 — How we onboard new associates to discovery practice

**Query:**
> What's our approach to onboarding new associates to litigation discovery work?

**Why it works:** No direct firm insight on this exact topic — the answer has to be assembled indirectly from procedural insights (031, 035), V&A pattern insights (016, 020), and Navarro sanctions insight (039). Most semantic matches will be low.

**Expected cited nodes:** likely `insight-039` (discovery sanctions), `insight-035` (service rigor) — low similarity.

**Expected behavior:** Response should acknowledge the firm doesn't have a direct insight on onboarding specifically and pivot to the discovery practices that would be most relevant to a new associate.

---

## Refusal cases

These should trigger `confidence: "refuse"` — zero nodes above 0.75 — and emit
one of the 4 refusal variants from
[apps/api/src/services/rag.ts](../services/rag.ts) (chosen randomly).

### RF-1 — Cryptocurrency / digital assets

**Query:**
> What's our firm's experience with cryptocurrency regulation enforcement matters?

**Why it triggers refusal:** Zero coverage in the seed corpus. No insight, concept, precedent, statute, or matter touches digital assets or cryptocurrency. Vector search will find no neighborhood.

**Expected output:** one of:
1. `"I don't have firm knowledge that directly addresses this. You may want to capture your own thinking on this topic as a starting point."`
2. `"The firm brain doesn't have material covering this question. Consider opening a capture and starting the record yourself — your notes today become tomorrow's institutional memory."`
3. `"No published insights in the team graph speak to this directly. This looks like an open area for the firm's knowledge — your capture could be the first entry."`
4. `"I couldn't find firm knowledge on this. Rather than synthesize from general legal training, I'd rather defer — this is a good prompt for a fresh personal capture."`

### RF-2 — Patent prosecution

**Query:**
> How should we handle patent prosecution strategy for a new client?

**Why it triggers refusal:** Trademark and trade-secret IP litigation are covered; patent prosecution specifically is zero-coverage. Vector search may surface low-similarity IP-related nodes but none will pass the 0.75 threshold.

**Expected output:** one of the 4 refusal variants.

### RF-3 — Immigration / family law

**Query:**
> What's our approach to immigration matters? Or family law disputes?

**Why it triggers refusal:** Zero coverage. The corpus is commercial-litigation-only by design.

**Expected output:** one of the 4 refusal variants.

---

## The mandatory demo query (fully scripted)

This is the moment the demo lives on. Run it twice in every dry run.

**Query (verbatim):**
> What has our firm learned about cross-examining expert witnesses on damages calculations?

**Why it works (operator check):**
- 10 directly-relevant insights (001–010) all explicitly authored on this topic.
- 3 shared expert-witness entities thread through them (Dr. Janet Mei in insights 001, 002, 003, 004, 006, 008, 009; Dr. Roman Caldwell in insights 002, 060; Dr. Anthony Garcia in insights 002, 010, 063).
- 4 shared matters appear across the cluster (Helios in 001, 003, 004, 008, 009; Helena in 002, 003, 006, 053; Coastal in 005; Skylark in 010, 063; Meridian in 060).
- 5 different firm-lawyer authors (Ana Mendoza, Lourdes Villaroman, Carlos Reyes, Rafael Estrada, Miguel Ortega, Vincent Lao).
- Hand-authored related_to edges densely connect the cluster (17 cluster-internal + bridges to MIL-cluster insight-015 and FRE-evidence insight-059).

**Expected cited nodes (in approximate priority order):**
1. `insight-001` — counsel-supplied assumption exploitation
2. `insight-004` — Mei cross-matter pattern recognition
3. `insight-009` — pre-deposition academic-record pull
4. `insight-002` — Daubert-style methodology challenges
5. `insight-003` — three-step rebuttal strategy
6. `insight-005` — foundation gaps in expert qualifications
7. `insight-008` — lost enterprise value vs. lost profits

**Expected graph-overlay illumination pattern:**
- Dense subgraph of the 7+ cited insight nodes, mutually connected via `related_to` edges
- Two prominent witness entity nodes (`witness-mei`, `witness-garcia`) appear as hub nodes
- Two prominent matter entity nodes (`matter-helios`, `matter-helena`) appear as hub nodes
- Concept-hub `concept-damages-cross` lights up at the center
- Author-edges show 4+ distinct firm lawyers pulsing as authors of the cited content

**Expected sample response opening (this is the moment):**

> Our firm has developed a consistent set of approaches for cross-examining damages experts. The most effective technique across our matters has been to surface the expert's reliance on counsel-supplied assumptions rather than independently verified data. In a recent acquisition-related matter, walking the opposing expert through each model input — growth rate, discount rate, comparable transaction set — and asking who calculated each revealed that every assumption came from retaining counsel; by the third assumption the expert's credibility was compromised in front of the court [insight-001].
>
> This pattern is not isolated. The same opposing expert has now appeared against us in three matters with the same DCF methodology and the same counsel-supplied-assumption sourcing — we now maintain a deposition prep kit specifically for her [insight-004]. The decisive impeachment vehicle has been her own academic record: a 2019 article in which she criticized exactly the assumption-sourcing approach she was defending [insight-009].
>
> Beyond this pattern, our firm has developed three additional cross techniques. First, Daubert-style methodology challenges work in PH courts as evidentiary-reliability gating where a specific methodological gap is identifiable [insight-002]. Second, a three-step rebuttal pattern — competing methodology, assumption comparison, sensitivity analysis — has reduced damages exposure in three consecutive matters [insight-003]. Third, attacking qualification foundation gaps via motion in limine before the judicial-affidavit is submitted has limited opposing expert scope in matters before Judge Mendoza and Judge Lim [insight-005].
>
> ---
> Sources:
> [insight-001] Cross-examining damages experts on counsel-supplied assumptions
> [insight-002] Daubert-style methodology challenge to damages experts in PH courts
> [insight-003] Three-step rebuttal expert strategy on damages
> [insight-004] Dr. Mei cross-matter pattern recognition
> [insight-005] Foundation gaps in damages expert qualifications
> [insight-009] Pre-deposition discovery — getting the expert's academic record

**Operator dry-run checklist before live demo:**
- [ ] Query returns `confidence: "high"`
- [ ] 5+ citations land in the response
- [ ] Citations span at least 3 different firm-lawyer authors
- [ ] Citations span at least 2 different matters
- [ ] Graph overlay shows a connected subgraph (not 3 isolated nodes)
- [ ] Streaming response surfaces the expert's name at least once and a matter code at least once
- [ ] Sources section lists distinct insight titles (not duplicates)

If any checklist item fails: investigate before going live. The most common failure mode in dry runs is that embedding similarity does not surface a particular insight as expected — re-running the query usually resolves it, but if not, check that the seed actually loaded all 63 insights (`SELECT COUNT(*) FROM team_graph_nodes WHERE node_type = 'insight';` should return 63).
