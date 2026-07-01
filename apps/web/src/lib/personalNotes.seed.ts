/**
 * Consilium — Personal Notes Seed for litigator@acme.law (Ana Mendoza)
 *
 * Loaded into IndexedDB on first run by seedPersonal.ts when the local note
 * store is empty. Conforms to the PersonalNote shape from ../types/index.ts.
 *
 * Mix targets:
 *   • 30+ notes total
 *   • ~60% text, ~25% audio, ~15% image
 *   • ~40% published (publishedNodeId points at a team_graph_nodes placeholder
 *     authored on the team-graph seed side — by Ana specifically: insight-001,
 *     004, 009, 015, 038, 056)
 *   • ~10% privileged
 *   • 1–2 tombstoned (deletedAt set)
 *   • Liberal use of [[wikilinks]] between notes for personal-graph density
 *
 * Privilege boundary: these personal notes contain client names and matter
 * specifics (Helios = TechMed Industries Inc. acquirer scenario, Dr. Mei full
 * name, etc.). The corresponding published team-graph insights have been
 * generalized — that asymmetry is what the redaction pipeline produced.
 *
 * Wikilink resolution: bodies use [[Note Title]] syntax. The `links` array on
 * each note resolves to targetNoteId at seed time. We hand-author the links
 * array so the personal-graph view renders correctly without requiring the
 * runtime to resolve labels.
 */

import type { PersonalNote, Entity } from '../types/index';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Epoch ms for a given ISO date string. Stable, no timezone surprises. */
const t = (iso: string): number => new Date(iso).getTime();

/** Build an entity record with a stable local ID derived from type+name. */
const ent = (type: Entity['type'], name: string, confidence: number): Entity => ({
  id: `pent-${type}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}`,
  type,
  name,
  confidence,
});

// Stable note IDs (UUIDv4-shaped strings). Pre-generated so wikilink targets
// resolve deterministically across reloads and tests.
const NOTE_IDS = {
  n001: 'pn-0001-mei-helios-counsel-assumptions',
  n002: 'pn-0002-mei-cross-matter-pattern',
  n003: 'pn-0003-pull-mei-academic-record',
  n004: 'pn-0004-buenaventura-mil-pre-trial',
  n005: 'pn-0005-navarro-expert-scope-meridian',
  n006: 'pn-0006-depo-prep-three-session-cycle',
  n007: 'pn-0007-helena-doc-discovery-angle',
  n008: 'pn-0008-helios-pugeda-prep-walk',
  n009: 'pn-0009-weekly-damages-prep-carlos',
  n010: 'pn-0010-action-caldwell-2022-pubs',
  n011: 'pn-0011-buenaventura-new-pretrial-pattern',
  n012: 'pn-0012-research-2019-rules-expert',
  n013: 'pn-0013-banyan-sj-whiteboard',
  n014: 'pn-0014-helios-trial-witness-cross',
  n015: 'pn-0015-helios-client-comm-friction',
  n016: 'pn-0016-bernardo-2025-depo-obs',
  n017: 'pn-0017-action-mediator-interview-pinnacle',
  n018: 'pn-0018-research-ph-market-premia-sources',
  n019: 'pn-0019-cordillera-oral-arg-voice',
  n020: 'pn-0020-banyan-team-sync-march',
  n021: 'pn-0021-helena-settlement-floor-priv',
  n022: 'pn-0022-br-28-docket-dynamics',
  n023: 'pn-0023-mei-article-photo-impeach',
  n024: 'pn-0024-action-prep-kit-caldwell-add',
  n025: 'pn-0025-research-arbitration-updates',
  n026: 'pn-0026-pretrial-whitfield-dynamics',
  n027: 'pn-0027-damages-brainstorm-beatrice',
  n028: 'pn-0028-depo-opening-protocol-refine',
  n029: 'pn-0029-cordillera-post-hearing-voice',
  n030: 'pn-0030-mil-timing-mixed-bench',
  n031: 'pn-0031-onboard-mariano-helios-disc',
  n032: 'pn-0032-old-superseded-trade-matter',
  n033: 'pn-0033-bautista-bench-trial-obs',
  n034: 'pn-0034-helios-mei-depo-photo',
  n035: 'pn-0035-old-stub-kept-by-accident',
};

const AI: { entities: 'ai'; classification: 'ai'; privilege: 'ai' } = {
  entities: 'ai',
  classification: 'ai',
  privilege: 'ai',
};

const USER_CLASS: { entities: 'ai'; classification: 'user'; privilege: 'ai' } = {
  entities: 'ai',
  classification: 'user',
  privilege: 'ai',
};

// ─── Seed Notes ─────────────────────────────────────────────────────────────

export const SEED_PERSONAL_NOTES: ReadonlyArray<Omit<PersonalNote, 'updatedAt'> & { updatedAt?: number }> = [
  // ═══════════════════════════════════════════════════════════════════════
  // PUBLISHED (6) — each corresponds to a team-graph insight Ana authored.
  // Personal note has full client/expert names; the published insight has
  // been generalized through the redaction pipeline.
  // ═══════════════════════════════════════════════════════════════════════

  {
    id: NOTE_IDS.n001,
    title: 'Cross-examining Dr. Mei on assumption sourcing — Helios deposition',
    body: `Dr. Janet Mei was their damages expert again, third time we've seen her. Her report for Helios (TechMed Industries acquisition) used a DCF model for lost enterprise value of $87M (PHP 4.9B).

Decisive crack we found in deposition: every assumption in her model came from counsel-supplied data. Growth rate (12%), discount rate (8.5%), comparable transaction set (5 deals) — all "provided by Whitfield & Mendez." She did no independent verification.

On the stand we walked her through each assumption and asked who calculated it. By the third assumption she was visibly uncomfortable. Judge Buenaventura let us push. The cumulative effect was that her $87M number looked less like an expert opinion and more like a litigation position dressed up with credentials.

See also [[Mei methodology pattern across matters]] and [[Pull Mei's 2019 article — academic record]]. This is the third matter where Mei has shown the same pattern — recommend we build a deposition prep kit specifically for her.

For next time: get her published academic work in advance. She has a 2019 paper criticizing exactly this assumption-sourcing approach. Cross-impeach with her own writing — we did this with the 2019 paragraph and it landed.`,
    contentType: 'text',
    extractedEntities: [
      ent('witness', 'Dr. Janet Mei', 0.95),
      ent('matter', 'Helios Acquisition', 0.92),
      ent('party', 'TechMed Industries Inc.', 0.88),
      ent('party', 'Whitfield & Mendez', 0.88),
      ent('judge', 'Judge Maria Buenaventura', 0.90),
      ent('concept', 'DCF damages methodology', 0.85),
      ent('concept', 'Counsel-supplied assumptions', 0.83),
    ],
    classification: 'strategy',
    isPrivileged: true,
    isPublished: true,
    publishedNodeId: 'insight-001',
    organizeProvenance: USER_CLASS,
    dismissedEntityKeys: [],
    links: [
      { targetNoteId: NOTE_IDS.n002, displayLabel: 'Mei methodology pattern across matters' },
      { targetNoteId: NOTE_IDS.n003, displayLabel: "Pull Mei's 2019 article — academic record" },
    ],
    createdAt: t('2024-06-14T19:30:00Z'),
    updatedAt: t('2024-06-15T08:20:00Z'),
  },
  {
    id: NOTE_IDS.n002,
    title: 'Mei methodology pattern across matters',
    body: `Tracking Dr. Janet Mei across matters where she's been opposing damages expert. Pattern is now consistent enough to call it deliberate, not coincidence.

Matters: Helios Acquisition (active, lead Carlos), Helena Securities (active, lead Lourdes), and the 2022 commercial fraud matter where Patricia Yusay sat second-chair. Three for three on DCF lost-enterprise-value framing.

Consistent inputs across all three:
- Forecast horizon: 5–7 years
- Terminal growth: 4–5% (high end of defensible range)
- Discount rate: single CAPM, no sensitivity disclosure
- Comparable transaction set: 3–5 deals, US/EU comparables, thin PH adjustment
- Assumption sourcing: counsel-supplied across the board

Operational implication: we now keep a Mei prep kit. Lives in DM Files \\ Damages Experts \\ Mei. Updated after every encounter. Contents: her CV, her publication list (with the 2019 paper flagged), prior reports we've obtained in discovery from other matters, and a standard cross outline pulled from [[Helios deposition kit — Mei cross outline]].

Next matter she appears in for opposition — recommend pull from the kit as starting point. Could save 20+ hours of prep.

See [[Cross-examining Dr. Mei on assumption sourcing — Helios deposition]] for the most recent run-through.`,
    contentType: 'text',
    extractedEntities: [
      ent('witness', 'Dr. Janet Mei', 0.97),
      ent('matter', 'Helios Acquisition', 0.90),
      ent('matter', 'Helena Securities', 0.88),
      ent('lawyer', 'Carlos Reyes', 0.85),
      ent('lawyer', 'Lourdes Villaroman', 0.85),
      ent('concept', 'DCF damages methodology', 0.87),
    ],
    classification: 'observation',
    isPrivileged: false,
    isPublished: true,
    publishedNodeId: 'insight-004',
    organizeProvenance: AI,
    dismissedEntityKeys: [],
    links: [
      { targetNoteId: NOTE_IDS.n001, displayLabel: 'Cross-examining Dr. Mei on assumption sourcing — Helios deposition' },
      { targetNoteId: NOTE_IDS.n034, displayLabel: 'Helios deposition kit — Mei cross outline' },
    ],
    createdAt: t('2024-08-02T11:00:00Z'),
    updatedAt: t('2024-08-03T15:15:00Z'),
  },
  {
    id: NOTE_IDS.n003,
    title: "Pull Mei's 2019 article — academic record",
    body: `Single highest-yield prep step for damages-expert depositions has been pulling the expert's academic record. Three depositions in the last two years have turned materially on what we found in the expert's own prior work.

Pull list, in order of yield:
1. Peer-reviewed articles in the expert's stated specialty
2. Conference papers, white papers, working papers (SSRN, conference proceedings)
3. Prior expert reports the witness has authored in other matters (obtainable via prior counsel of record — Diana has the request template)
4. Textbook chapters or treatise contributions
5. Dissertation/thesis work where applicable

For Dr. Mei the gold was a 2019 Journal of Forensic Accounting article titled "Independent Methodology in Valuation Engagements" — criticizes exactly the assumption-sourcing pattern she was defending in Helios. Pulled via HeinOnline. Impeachment landed cleanly because it was her own work.

Cost/timeline: 2–3 weeks for a thorough expert. Budget at retention. HeinOnline + ProQuest + SSRN database fees ~PHP 8K per expert.

Don't over-impeach. Pick the 1–2 passages that contradict load-bearing positions in the current report. Three or more impeachments dilute the effect — opposing counsel rehabilitates on the weak ones, jury (or judge) ends up seeing it as an attack rather than a contradiction.

Now standard line item on damages-expert prep checklist. See [[Update prep kit with Caldwell pattern]] for adding the Caldwell entry.`,
    contentType: 'text',
    extractedEntities: [
      ent('witness', 'Dr. Janet Mei', 0.93),
      ent('matter', 'Helios Acquisition', 0.85),
      ent('concept', 'Expert academic record pull', 0.88),
      ent('lawyer', 'Diana Santos', 0.75),
    ],
    classification: 'lesson_learned',
    isPrivileged: false,
    isPublished: true,
    publishedNodeId: 'insight-009',
    organizeProvenance: AI,
    dismissedEntityKeys: [],
    links: [
      { targetNoteId: NOTE_IDS.n001, displayLabel: 'Cross-examining Dr. Mei on assumption sourcing — Helios deposition' },
      { targetNoteId: NOTE_IDS.n024, displayLabel: 'Update prep kit with Caldwell pattern' },
    ],
    createdAt: t('2024-06-25T13:45:00Z'),
    updatedAt: t('2024-06-25T13:45:00Z'),
  },
  {
    id: NOTE_IDS.n004,
    title: 'MIL filing window in Buenaventura — only pre-trial counts',
    body: `Buenaventura entertains MILs only when filed within the pre-trial conference window. Anything later or oral at trial-proper gets denied as untimely without merits discussion.

Sample I pulled together for the practice group:
- 6 MILs filed pre-trial, last 24 months: all calendared and ruled on merits; 4 granted in full or part
- 3 MILs filed after pre-trial order issued: all denied untimely, no merits review

Granted MILs all narrowly scoped — "exclude testimony from witness X on consumer welfare calculation methodology in JA paragraphs 17–22" style, not "exclude all expert opinion."

Tactical implication: pre-trial brief writing for Br. 147 must include dedicated MIL drafting two weeks out. 2–4 strongest grounds; no long lists. Pair each with tight affidavit foundation.

JA-Rule-scope MILs work well here because Br. 147 enforces four-corners. Connects to [[Helios — opposing JA scope survey]] (which I haven't written up properly yet — TODO).

For Aurora and any future PCC-overlap matter, plan the JA-scope MIL during the pre-trial drafting cycle.`,
    contentType: 'text',
    extractedEntities: [
      ent('judge', 'Judge Maria Buenaventura', 0.96),
      ent('concept', 'Motion in limine', 0.94),
      ent('concept', 'Judicial Affidavit Rule scope', 0.90),
      ent('matter', 'Aurora Pharma Distribution', 0.80),
    ],
    classification: 'strategy',
    isPrivileged: false,
    isPublished: true,
    publishedNodeId: 'insight-015',
    organizeProvenance: AI,
    dismissedEntityKeys: [],
    links: [],
    createdAt: t('2024-10-13T17:00:00Z'),
    updatedAt: t('2024-10-14T09:30:00Z'),
  },
  {
    id: NOTE_IDS.n005,
    title: 'Navarro lets us go wide on Salazar — Meridian',
    body: `Worth recording: Navarro in Br. 7 is materially more permissive than Lim on expert scope. In Meridian, Dr. Esperanza Salazar (our telecom expert) was qualified at the "consumer behavior in regulated telecom" level. At trial Navarro let her testify on subscription-decision modeling, retention analysis, AND consumer-survey design — all without separate JA declarations for each.

Opposing counsel objected on JA-Rule-scope grounds. Navarro overruled every time, with the reasoning that the umbrella qualification covered the adjacent topics. He explicitly said something like "the rule does not require declaration of every subtopic that fits within the declared field."

Strategic implication when we're offering side in Br. 7: declare qualification slightly broader than the immediate need. Headroom for rebuttal and clarification testimony at trial without supplementing the JA.

When we're facing opposing expert in Br. 7: JA-scope MILs are harder to win. Cross has to do the limiting work the JA Rule would do in Br. 28.

This is the exact opposite of Br. 28 (Lim) practice. See [[Br. 28 — Judge Lim JA as operative testimony]] (note doesn't exist yet — TODO).

Don't generalize to other branches. Br. 147 (Buenaventura) sits closer to Br. 28 than Br. 7 on this dimension.`,
    contentType: 'text',
    extractedEntities: [
      ent('judge', 'Judge Roberto Navarro', 0.95),
      ent('judge', 'Judge Patricia Lim', 0.80),
      ent('judge', 'Judge Maria Buenaventura', 0.75),
      ent('witness', 'Dr. Esperanza Salazar', 0.90),
      ent('matter', 'Meridian Class Suit', 0.92),
      ent('concept', 'JA Rule scope', 0.88),
    ],
    classification: 'observation',
    isPrivileged: false,
    isPublished: true,
    publishedNodeId: 'insight-038',
    organizeProvenance: AI,
    dismissedEntityKeys: [],
    links: [],
    createdAt: t('2023-11-14T15:20:00Z'),
    updatedAt: t('2023-11-15T08:00:00Z'),
  },
  {
    id: NOTE_IDS.n006,
    title: 'Three-session depo prep cycle — what finally clicked',
    body: `Across ~20 client-witness depositions in the last 2 years, the three-session prep cycle has clearly outperformed the historical one-long-session approach. Fewer impeachment-by-prior-statement moments, tighter consistency between deposition and JA.

The cycle:
- Session 1 (substance, 2 hours, week before): walk through matter chronology, identify the witness's personal-knowledge boundaries
- Session 2 (form, 1.5 hours, 3 days before): rehearse answer patterns for difficult questions, practice "I don't know" and "I don't recall," work on pauses
- Session 3 (last-mile, 45 min, morning-of): refresh on specific exhibits expected, reiterate top-three watch-out questions

Session 2 is the highest-yield. Most witnesses default to over-answering under stress; the form session is where the discipline of bounded answers gets internalized. The 3-day gap before deposition lets the form discipline settle without the prep feeling stale.

Used this on both principal Helios client witnesses. Both depositions held tight against opposing efforts to broaden — Whitfield's senior litigator tried multiple times to get them off-script. Failed.

Companion practice: [[Depo opening protocol against speaking objections]] — the two operational practices fit together. The opening protocol controls opposing counsel's behavior; the prep cycle controls our own witness's behavior.`,
    contentType: 'text',
    extractedEntities: [
      ent('matter', 'Helios Acquisition', 0.85),
      ent('party', 'Whitfield & Mendez', 0.80),
      ent('concept', 'Deposition preparation', 0.93),
    ],
    classification: 'strategy',
    isPrivileged: false,
    isPublished: true,
    publishedNodeId: 'insight-056',
    organizeProvenance: AI,
    dismissedEntityKeys: [],
    links: [
      { targetNoteId: NOTE_IDS.n028, displayLabel: 'Depo opening protocol against speaking objections' },
    ],
    createdAt: t('2024-09-11T18:00:00Z'),
    updatedAt: t('2024-09-12T07:45:00Z'),
  },

  // ═══════════════════════════════════════════════════════════════════════
  // UNPUBLISHED (29) — Ana's in-flight thinking. Mix of strategy, observation,
  // action items, research notes, meeting summaries. Audio + image notes mixed
  // in for content-type variety.
  // ═══════════════════════════════════════════════════════════════════════

  {
    id: NOTE_IDS.n007,
    title: 'Helena document discovery — fishing for board minutes',
    body: `Sitting with the Helena production set — Lourdes thinks the board minutes from Q2 2022 will have the scienter goldmine. I'm less sure.

What we've seen so far in the production: management memoranda discussing the gap between reported and actual figures (good for our scienter case), email chains debating disclosure timing (also good), but the board minutes themselves are conspicuously sanitized. Whoever drafted them was clearly aware of litigation risk.

Hypothesis: the actual decision-making was in informal pre-board conversations and side-channel emails, not in the board minutes proper. If that's right, we need to push harder on individual director email production. Lourdes is going to want to send another motion to compel.

Question I want to raise at next damages prep: do we have anyone on the team who can think about scienter from a behavioral-finance angle rather than a contract-doc-trail angle? Might be worth bringing in Dr. Velasco for a strategic consultation, not as an expert per se.

See [[Weekly damages prep — Carlos session notes]] for next steps.`,
    contentType: 'text',
    extractedEntities: [
      ent('matter', 'Helena Securities', 0.95),
      ent('lawyer', 'Lourdes Villaroman', 0.92),
      ent('witness', 'Dr. Marina Velasco', 0.80),
      ent('concept', 'Securities scienter', 0.88),
    ],
    classification: 'observation',
    isPrivileged: true,
    isPublished: false,
    organizeProvenance: AI,
    dismissedEntityKeys: [],
    links: [
      { targetNoteId: NOTE_IDS.n009, displayLabel: 'Weekly damages prep — Carlos session notes' },
    ],
    createdAt: t('2025-01-22T16:30:00Z'),
    updatedAt: t('2025-01-22T16:30:00Z'),
  },
  {
    id: NOTE_IDS.n008,
    title: 'Walking back from Helios — Pugeda prep session',
    body: ``,
    audioTranscript: `Okay, so just finished the prep session with Doctor Pugeda for the Helios damages rebuttal testimony. Big takeaway — he's much sharper on sensitivity analysis than I expected. His instinct is to lead with the comparable transactions methodology and then use sensitivity tables as the rebuttal punch. That works well for our theory.

One thing I want to think about — he raised a concern about the PH market premia adjustment in Mei's report. He thinks Mei's eight percent adjustment is too narrow but he doesn't want to make it the centerpiece of his rebuttal because he hasn't independently verified the right number. Fair point. I think we keep the PH premia critique as the sensitivity table footnote rather than the testimony lead.

Also — he wants a fuller version of the cross outline before his testimony. I'll send him the Mei prep kit excerpt this evening. Actually no, I'll send him just the methodology section, not the academic-record material. Don't want to over-prepare him on the impeachment side; that's our work, not his.

Quick reminder to self — Carlos wants the rebuttal expert report locked by end of month. So we need Pugeda's final draft by the eighteenth at the latest. Calendar it.`,
    contentType: 'audio',
    extractedEntities: [
      ent('matter', 'Helios Acquisition', 0.94),
      ent('witness', 'Dr. Antonio Pugeda', 0.93),
      ent('witness', 'Dr. Janet Mei', 0.85),
      ent('lawyer', 'Carlos Reyes', 0.80),
      ent('concept', 'Sensitivity analysis', 0.85),
    ],
    classification: 'meeting_summary',
    isPrivileged: true,
    isPublished: false,
    organizeProvenance: AI,
    dismissedEntityKeys: [],
    links: [],
    createdAt: t('2024-11-08T19:15:00Z'),
    updatedAt: t('2024-11-08T19:15:00Z'),
  },
  {
    id: NOTE_IDS.n009,
    title: 'Weekly damages prep — Carlos session notes',
    body: `Weekly damages prep with Carlos, Tuesday 8AM.

Helios:
- Pugeda rebuttal report draft circulating. Carlos wants Lourdes's eyes on the comparable-transactions section before it goes to Pugeda for finalization. I'll coordinate.
- Trial date holding at Feb 24. Two more depo prep sessions for the principal witness; we agreed to use the three-session cycle.
- Mei cross outline is in final form. I'll print three trial-binder copies and one redacted excerpt to share with Pugeda (methodology section only — see [[Walking back from Helios — Pugeda prep session]]).

Helena:
- Lourdes pushing for additional motion to compel on director email production. Carlos supportive. I'll draft this week.
- Scienter case keeps strengthening through the production. Worth keeping a running scienter-elements table.

Banyan/Tessera:
- Felix wants me to second-chair the SJ argument if it gets oral. Karen will keep lead. I said yes; that's two trial-stage things going simultaneously. Need to manage calendar carefully.

Action items:
- Draft Helena motion to compel by Friday
- Coordinate Pugeda report review with Lourdes
- Print/redact Mei cross materials
- Calendar block for Banyan SJ prep starting next week

See [[Helena document discovery — fishing for board minutes]] for context on the motion-to-compel angle.`,
    contentType: 'text',
    extractedEntities: [
      ent('matter', 'Helios Acquisition', 0.90),
      ent('matter', 'Helena Securities', 0.90),
      ent('matter', 'Banyan Trade Secret', 0.88),
      ent('matter', 'Tessera Counter-claim', 0.85),
      ent('lawyer', 'Carlos Reyes', 0.92),
      ent('lawyer', 'Lourdes Villaroman', 0.88),
      ent('lawyer', 'Felix Domingo', 0.85),
      ent('lawyer', 'Karen Bautista', 0.82),
      ent('witness', 'Dr. Antonio Pugeda', 0.85),
      ent('witness', 'Dr. Janet Mei', 0.85),
    ],
    classification: 'meeting_summary',
    isPrivileged: false,
    isPublished: false,
    organizeProvenance: AI,
    dismissedEntityKeys: [],
    links: [
      { targetNoteId: NOTE_IDS.n007, displayLabel: 'Helena document discovery — fishing for board minutes' },
      { targetNoteId: NOTE_IDS.n008, displayLabel: 'Walking back from Helios — Pugeda prep session' },
    ],
    createdAt: t('2025-01-21T10:30:00Z'),
    updatedAt: t('2025-01-21T10:30:00Z'),
  },
  {
    id: NOTE_IDS.n010,
    title: 'TODO: pull Caldwell 2022 publications before Meridian closeout',
    body: `Action item for Meridian wind-down — pull Dr. Roman Caldwell's 2022 publications and any expert reports he's authored in other matters since Meridian. We have him pegged on the comparable-transactions PH market premia weakness; if he writes on the topic post-Meridian, his current position may have shifted.

Lourdes thinks he might appear again for opposition in a separate matter she's tracking. Worth having current data before then.

Pull from HeinOnline + SSRN + Bloomberg Law expert-witness database. Budget: 6 hours of associate time.

Assign: maybe Marco or Joaquin. Marco has bandwidth, less expert-cross experience. Joaquin has the experience but a heavier docket. Will float at Wednesday team huddle.

Companion entry in the expert-cross prep kit needed once pull is complete. See [[Update prep kit with Caldwell pattern]].`,
    contentType: 'text',
    extractedEntities: [
      ent('witness', 'Dr. Roman Caldwell', 0.94),
      ent('matter', 'Meridian Class Suit', 0.90),
      ent('lawyer', 'Lourdes Villaroman', 0.85),
      ent('lawyer', 'Marco Pangilinan', 0.75),
      ent('lawyer', 'Joaquin Tirona', 0.75),
    ],
    classification: 'action_item',
    isPrivileged: false,
    isPublished: false,
    organizeProvenance: AI,
    dismissedEntityKeys: [],
    links: [
      { targetNoteId: NOTE_IDS.n024, displayLabel: 'Update prep kit with Caldwell pattern' },
    ],
    createdAt: t('2024-12-03T14:00:00Z'),
    updatedAt: t('2024-12-03T14:00:00Z'),
  },
  {
    id: NOTE_IDS.n011,
    title: "Buenaventura's new pre-trial scheduling pattern",
    body: `Quick observation worth recording — Buenaventura seems to have shifted her pre-trial conference scheduling pattern in the last 60 days. She used to set pre-trial conferences ~90 days after the answer was filed. The last three Br. 147 matters I've tracked (one ours, two via colleague discussion) have all had pre-trial set within 45–60 days.

Possible explanations: (a) docket relief, she's pushing cases through faster; (b) she's preparing for an upcoming leave or rotation and trying to clear active matters; (c) just random variation in a small sample.

Implications if real: pre-trial brief drafting timelines compress. Our usual "draft pre-trial brief 6 weeks out" approach may need to become "draft pre-trial brief 3–4 weeks out" for new Br. 147 matters.

Will keep watching. Worth raising at the next practice group meeting if the pattern holds for another 30 days.

Note: doesn't change [[MIL filing window in Buenaventura — only pre-trial counts]] — the rule there is filing within the pre-trial window, whenever that window opens. But if pre-trial comes 45 days from answer rather than 90, MIL prep starts almost at intake.`,
    contentType: 'text',
    extractedEntities: [
      ent('judge', 'Judge Maria Buenaventura', 0.95),
      ent('concept', 'Pre-trial conference scheduling', 0.85),
    ],
    classification: 'observation',
    isPrivileged: false,
    isPublished: false,
    organizeProvenance: AI,
    dismissedEntityKeys: [],
    links: [
      { targetNoteId: NOTE_IDS.n004, displayLabel: 'MIL filing window in Buenaventura — only pre-trial counts' },
    ],
    createdAt: t('2025-02-10T11:00:00Z'),
    updatedAt: t('2025-02-10T11:00:00Z'),
  },
  {
    id: NOTE_IDS.n012,
    title: 'Research: 2019 Rules on Evidence expert provisions — what to track',
    body: `Spent an hour digging into the 2019 Revised Rules on Evidence on expert-witness provisions for an internal training Diana asked me to put together.

Operative rule sets out four elements: (1) specialized knowledge will help the trier of fact, (2) testimony based on sufficient facts, (3) product of reliable principles and methods, (4) reliable application to facts. Structurally similar to FRE 702.

What's still unclear in PH trial-court practice:
- Whether the "reliable principles" element is meant as a gatekeeping function (Daubert-style) or as a weight-of-evidence consideration. Practice has been the latter so far.
- Whether the "sufficient facts" element overlaps with FRE 703 (underlying data). We haven't seen a PH trial court exclude an expert opinion solely on inadequate factual foundation. So practically the FRE 703 analog is dead letter.
- What constitutes "reliable application" — pure judicial discretion at this stage.

Practical takeaway for our practice: Daubert-style methodology challenges work where there's a clear methodological gap we can point to (see [[Cross-examining Dr. Mei on assumption sourcing — Helios deposition]]). Pure foundation-of-data challenges have less traction. Frame challenges as methodology-and-reliability, not data-sufficiency.

This is genuinely under-developed doctrinally. Most of what we know comes from a small set of trial-court rulings; SC hasn't weighed in much. Diana's training session might want to flag the uncertainty rather than over-promise.`,
    contentType: 'text',
    extractedEntities: [
      ent('concept', '2019 Revised Rules on Evidence', 0.92),
      ent('concept', 'Daubert methodology challenge', 0.88),
      ent('concept', 'FRE 702', 0.85),
      ent('concept', 'FRE 703', 0.82),
      ent('lawyer', 'Diana Santos', 0.80),
    ],
    classification: 'research',
    isPrivileged: false,
    isPublished: false,
    organizeProvenance: AI,
    dismissedEntityKeys: [],
    links: [
      { targetNoteId: NOTE_IDS.n001, displayLabel: 'Cross-examining Dr. Mei on assumption sourcing — Helios deposition' },
    ],
    createdAt: t('2024-08-25T14:00:00Z'),
    updatedAt: t('2024-08-26T09:30:00Z'),
  },
  {
    id: NOTE_IDS.n013,
    title: 'Banyan SJ whiteboard — element-mapping discussion',
    body: `Photo from yesterday's Banyan team sync — whiteboard captures Felix's element-by-element mapping of the Pennswell trade-secret framework against our affidavit set.

Quick decode (left to right on the board):
- Element 1: Secrecy — Lopez affidavit ¶¶4–7, Kwon affidavit ¶¶11–14
- Element 2: Economic value — Velasco forensic accounting ¶¶3–9 (revenue impact)
- Element 3: Reasonable measures — three custodian declarations (IT, HR, records) totaling ~12 pages
- Element 4: Misappropriation — temporal proximity chart + access logs (the 14-day pre-departure bulk access pattern)

Felix is comfortable with the mapping. Karen wants to tighten the Element 3 declarations — the IT manager's draft reads too much in legal-conclusion voice. Reasonable measures element wins on operator-voice declarations, not corporate-counsel summaries.

Action: I'm sitting in on Karen's redraft session Thursday. Will pull notes from [[Reasonable measures custodians — Banyan template]] which doesn't exist yet — TODO write it up once Karen finishes the redraft.`,
    contentType: 'image',
    extractedEntities: [
      ent('matter', 'Banyan Trade Secret', 0.95),
      ent('lawyer', 'Felix Domingo', 0.90),
      ent('lawyer', 'Karen Bautista', 0.90),
      ent('witness', 'Dr. Henry Kwon', 0.85),
      ent('witness', 'Dr. Marina Velasco', 0.80),
      ent('precedent', 'Air Philippines v. Pennswell', 0.85),
      ent('concept', 'Trade secret elements', 0.90),
    ],
    classification: 'meeting_summary',
    isPrivileged: false,
    isPublished: false,
    organizeProvenance: AI,
    dismissedEntityKeys: [],
    links: [],
    createdAt: t('2025-02-18T15:30:00Z'),
    updatedAt: t('2025-02-18T15:30:00Z'),
  },
  {
    id: NOTE_IDS.n014,
    title: 'Helios trial — principal witness cross theme',
    body: `Thinking through cross theme for the Helios trial. Our principal witness is the former Verdant Holdings CFO; he's been cooperative but he's also the bridge between the warranty disclosures and the inventory misrepresentations we're arguing.

Opposing counsel (Whitfield) will try to bifurcate his testimony: cooperative on disclosures, hostile on inventory. The theme that pulls them together is what we need.

Working theme: "the same financial-reporting discipline that produced the disclosures also produced the inventory records, and the records show what they show." Walks the witness through the disclosure preparation process (his strength), then transitions through his role in inventory reporting (where he has personal knowledge but limited authority), and ends on the records themselves (where the records speak for themselves).

Doesn't ask him to testify against his former colleagues; asks him to attest to the integrity of the process and let the records do the work.

Carlos sees this approach favorably. Will workshop at next prep session. Companion: [[Three-session depo prep cycle — what finally clicked]] — same witness preparation framework applies to his cross prep, though this is direct testimony, not cross.

If this theme holds we don't need to ask him directly about the misrepresentation theory; the records do.`,
    contentType: 'text',
    extractedEntities: [
      ent('matter', 'Helios Acquisition', 0.95),
      ent('party', 'Verdant Holdings Corp.', 0.90),
      ent('party', 'Whitfield & Mendez', 0.85),
      ent('lawyer', 'Carlos Reyes', 0.85),
    ],
    classification: 'strategy',
    isPrivileged: true,
    isPublished: false,
    organizeProvenance: AI,
    dismissedEntityKeys: [],
    links: [
      { targetNoteId: NOTE_IDS.n006, displayLabel: 'Three-session depo prep cycle — what finally clicked' },
    ],
    createdAt: t('2025-01-30T20:00:00Z'),
    updatedAt: t('2025-02-02T09:15:00Z'),
  },
  {
    id: NOTE_IDS.n015,
    title: 'Helios client comm friction — note for me, not for the file',
    body: `Hard week. The Helios client's COO has been pushing for aggressive settlement signaling that I don't think serves the case posture. Carlos has held the line in two calls. I sat in on the most recent one.

What I'm processing: the COO's instinct is shaped by their commercial-deal frame. Settlement to them is a transactional outcome; to us, it's the product of litigation posture. Those are different mental models and the gap is creating friction.

Carlos handled it well — reframed the settlement question as a leverage question, walked the COO through the post-ruling leverage window we're trying to set up (see the structured-settlement playbook). The COO accepted it for now but I think we need to do a fuller client-education session before the upcoming MSJ ruling so the next settlement conversation doesn't come from the same gap.

Personal note: I shouldn't be writing this in the matter file. It's process observation about a client relationship; it's privileged but it's also the kind of thing that doesn't help anyone if it gets surfaced wrong. Going to leave it as a personal note, not promote it.

This is the kind of thing I'd flag privileged. Doing so explicitly.`,
    contentType: 'text',
    extractedEntities: [
      ent('matter', 'Helios Acquisition', 0.95),
      ent('lawyer', 'Carlos Reyes', 0.90),
      ent('concept', 'Client communication', 0.80),
    ],
    classification: 'observation',
    isPrivileged: true,
    isPublished: false,
    organizeProvenance: {
      entities: 'ai',
      classification: 'ai',
      privilege: 'user',
    },
    dismissedEntityKeys: [],
    links: [],
    createdAt: t('2025-02-15T22:30:00Z'),
    updatedAt: t('2025-02-15T22:30:00Z'),
  },
  {
    id: NOTE_IDS.n016,
    title: 'Bernardo deposition — Aurora matter, Feb 2025',
    body: `Sat in on a Bernardo deposition this week (Aurora matter, our PCC complainant side). Two observations.

First — the deposition opening protocol worked. We stated the form-foundation-privilege convention on the record at the start. Bernardo's speaking-objection rate dropped substantially from what colleagues have described in prior matters. Maybe 5–6 speaking objections across a 4-hour session. Manageable.

Second — when he does object, the stenographer-readback technique is highly effective. After the readback he tends to back off rather than escalate. I think the readback creates a "I'd rather not be on record explaining this" moment that breaks the coaching pattern.

Not enough for a full published insight yet — this is one session, and Miguel is more skeptical of the protocol's durability than I am. But filing as observation.

Cross-reference: [[Three-session depo prep cycle — what finally clicked]] (our-witness-side practice). The opening protocol + the prep cycle are the two halves of a complete deposition-day operational practice.`,
    contentType: 'text',
    extractedEntities: [
      ent('lawyer', 'Atty. Ricardo Bernardo', 0.93),
      ent('party', 'Santos Cruz Law', 0.85),
      ent('matter', 'Aurora Pharma Distribution', 0.90),
      ent('lawyer', 'Miguel Ortega', 0.80),
      ent('concept', 'Speaking objections', 0.88),
    ],
    classification: 'observation',
    isPrivileged: false,
    isPublished: false,
    organizeProvenance: AI,
    dismissedEntityKeys: [],
    links: [
      { targetNoteId: NOTE_IDS.n006, displayLabel: 'Three-session depo prep cycle — what finally clicked' },
    ],
    createdAt: t('2025-02-08T17:00:00Z'),
    updatedAt: t('2025-02-08T17:00:00Z'),
  },
  {
    id: NOTE_IDS.n017,
    title: 'TODO: schedule mediator interview ahead of any Pinnacle-style matter',
    body: `Following the [[Court-annexed mediation mediator patterns]] insight — for any future matter that's likely to be referred to court-annexed mediation, schedule a 30-minute interview with the mediator pool early in case planning.

Why: knowing whether the assigned mediator runs split-the-gap or interest-based materially shapes our prep. We've been doing this informally (asking around the firm); should formalize.

Who runs the interview: senior associate level. 30 minutes is enough for a useful read. Diana has a template question set she's used twice.

When to schedule: within 30 days of mediation referral. Earlier is better but pre-referral is unnecessary.

Specifically for the upcoming Pinnacle-style construction matter Patricia is bringing in next month — let's plan to interview before the first mediator session. Patricia and I should coordinate at intake.`,
    contentType: 'text',
    extractedEntities: [
      ent('concept', 'Court-annexed mediation', 0.92),
      ent('matter', 'Pinnacle Real Estate', 0.85),
      ent('lawyer', 'Patricia Yusay', 0.85),
      ent('lawyer', 'Diana Santos', 0.82),
    ],
    classification: 'action_item',
    isPrivileged: false,
    isPublished: false,
    organizeProvenance: AI,
    dismissedEntityKeys: [],
    links: [],
    createdAt: t('2024-12-12T11:30:00Z'),
    updatedAt: t('2024-12-12T11:30:00Z'),
  },
  {
    id: NOTE_IDS.n018,
    title: 'Research: PH market premia data sources for damages experts',
    body: `Pulled this together for the Mei/Caldwell prep kit. The credible sources for PH market premia adjustments in damages methodology:

1. PSE/SEC-published market-cap-to-revenue multiples for listed entities (need to filter to industry). Public, free.
2. Bloomberg Terminal — PH market premium index, industry breakdowns. Subscription, firm has access.
3. KPMG / EY / PwC annual market premium reports — sector-specific adjustments, generally credible. Available through professional-services contacts.
4. Local academic sources — UP-CIDS valuation working paper series, AIM Center for Asia Business research. Less standardized but courts find them credible because they're local-academic.

Most damages reports that fail on PH market premia (e.g., Caldwell's 8% in Meridian) rely on US-published emerging-markets-generic adjustments. The cross technique is to compare what the expert used to what the credible local sources support.

Adding to the prep kit. See [[Update prep kit with Caldwell pattern]].

Question for self: is there a single composite "PH equity risk premium" benchmark we could build internally that would be cite-able in our own affirmative damages reports (e.g., for Pugeda)? Worth exploring. Run it by Diana.`,
    contentType: 'text',
    extractedEntities: [
      ent('witness', 'Dr. Janet Mei', 0.80),
      ent('witness', 'Dr. Roman Caldwell', 0.85),
      ent('witness', 'Dr. Antonio Pugeda', 0.78),
      ent('concept', 'PH market premia', 0.90),
      ent('concept', 'Damages methodology', 0.85),
      ent('lawyer', 'Diana Santos', 0.75),
    ],
    classification: 'research',
    isPrivileged: false,
    isPublished: false,
    organizeProvenance: AI,
    dismissedEntityKeys: [],
    links: [
      { targetNoteId: NOTE_IDS.n024, displayLabel: 'Update prep kit with Caldwell pattern' },
    ],
    createdAt: t('2024-10-18T13:30:00Z'),
    updatedAt: t('2024-10-18T13:30:00Z'),
  },
  {
    id: NOTE_IDS.n019,
    title: 'Cordillera oral argument — voice memo on strategy',
    body: ``,
    audioTranscript: `Sitting in the car after the Cordillera prep meeting. Carlos wants us to lead with the narrow-construction-of-public-policy-defense framing. I agree that's the right macro strategy but I'm still wrestling with the specific phrasing for the oral argument.

The risk with "narrow construction" is that the CA might read it as us asking them to ignore a legitimate defense. Better framing might be — public policy under Article Five Two B requires affirmative statutory or constitutional conflict, not regulatory disagreement. Same substantive point, less confrontational vocabulary.

Other thing on my mind — Dr. Ostrowski's affidavit for the opposition is genuinely weak on local context. I don't know if we have time to commission a counter-affidavit before the oral argument calendar but it's worth raising with Carlos. Even a one-page declaration from someone with PH mining-sector regulatory experience would help.

Adding to the matter file. Not sure if this becomes a published insight or stays personal. Probably stays personal until we see how the CA rules.`,
    contentType: 'audio',
    extractedEntities: [
      ent('matter', 'Cordillera Mining Arbitration', 0.95),
      ent('lawyer', 'Carlos Reyes', 0.90),
      ent('witness', 'Dr. Lyle Ostrowski', 0.92),
      ent('concept', 'Arbitration enforcement', 0.90),
      ent('concept', 'Public policy defense', 0.88),
    ],
    classification: 'strategy',
    isPrivileged: true,
    isPublished: false,
    organizeProvenance: AI,
    dismissedEntityKeys: [],
    links: [],
    createdAt: t('2024-11-06T18:45:00Z'),
    updatedAt: t('2024-11-06T18:45:00Z'),
  },
  {
    id: NOTE_IDS.n020,
    title: 'Banyan team sync — March 2025',
    body: `Banyan weekly sync, Tuesday morning. Felix leading, Karen present, me + Sophia listening in.

Status:
- SJ motion in final review. Element mapping (see [[Banyan SJ whiteboard — element-mapping discussion]]) is locked. Karen's reasonable-measures custodian redrafts are in good shape.
- Opposition's motion to compel on access-log production was denied last week — judge agreed our production was complete and the request was a fishing expedition. Win.
- Tessera counter-claim is on a separate track; we're holding the SJ posture there until Banyan SJ resolves.

Discussion:
- Felix concerned about JA scope for Dr. Kwon — wants him to be able to opine on access-pattern interpretation, not just data extraction. Will need careful JA drafting. Karen taking the lead.
- Sophia raised whether we should propose a TAR protocol given the production volume. Felix skeptical (Br. 51 isn't Br. 7); thinks linear review is defensible. I leaned in favor of Sophia's suggestion but didn't push.

Action items I picked up:
- Coordinate with Karen on Kwon JA review
- Run a Br. 51 TAR-acceptance survey (informal, ask around the firm)

Companion: [[Helena document discovery — fishing for board minutes]] (different matter, similar production-volume question).`,
    contentType: 'text',
    extractedEntities: [
      ent('matter', 'Banyan Trade Secret', 0.95),
      ent('matter', 'Tessera Counter-claim', 0.88),
      ent('lawyer', 'Felix Domingo', 0.92),
      ent('lawyer', 'Karen Bautista', 0.90),
      ent('lawyer', 'Sophia Recto', 0.85),
      ent('witness', 'Dr. Henry Kwon', 0.88),
      ent('judge', 'Judge Conrado Veloso', 0.80),
      ent('concept', 'TAR / predictive coding', 0.78),
    ],
    classification: 'meeting_summary',
    isPrivileged: false,
    isPublished: false,
    organizeProvenance: AI,
    dismissedEntityKeys: [],
    links: [
      { targetNoteId: NOTE_IDS.n013, displayLabel: 'Banyan SJ whiteboard — element-mapping discussion' },
      { targetNoteId: NOTE_IDS.n007, displayLabel: 'Helena document discovery — fishing for board minutes' },
    ],
    createdAt: t('2025-03-04T11:00:00Z'),
    updatedAt: t('2025-03-04T11:00:00Z'),
  },
  {
    id: NOTE_IDS.n021,
    title: 'Helena settlement floor — client position',
    body: `Privileged. Internal note for matter file, do not promote.

Client (Helena minority-shareholder group) settlement floor as discussed with Lourdes and Carlos this week: PHP 380M aggregate, with a non-monetary component that includes (a) board-observer rights for two years, (b) enhanced disclosure commitments for four quarters, (c) mutual non-disparagement with teeth.

The PHP 380M is firmer than the client signaled at intake (PHP 420M). The board-observer rights are new and were added at the client's initiative, not ours. The enhanced-disclosure commitment is the structural element Carlos wants — converts a one-time settlement into ongoing accountability that protects the client's continuing minority position.

Strategic implication: we have more flexibility on the monetary number than the team initially assumed. The structured-settlement framing applies (see [[Structured settlements above PHP 50M]] — that's a team insight I should pull up). Where it gets interesting is the non-monetary leverage — opposing counsel hasn't proposed board observation, so we may be able to extract it without giving up much on the monetary side.

Do not share this note. Stays in personal file. Bring to next damages prep verbally if it informs strategy.`,
    contentType: 'text',
    extractedEntities: [
      ent('matter', 'Helena Securities', 0.96),
      ent('lawyer', 'Lourdes Villaroman', 0.92),
      ent('lawyer', 'Carlos Reyes', 0.92),
      ent('concept', 'Structured settlement', 0.85),
    ],
    classification: 'strategy',
    isPrivileged: true,
    isPublished: false,
    organizeProvenance: {
      entities: 'ai',
      classification: 'ai',
      privilege: 'user',
    },
    dismissedEntityKeys: [],
    links: [],
    createdAt: t('2025-02-26T19:00:00Z'),
    updatedAt: t('2025-02-26T19:00:00Z'),
  },
  {
    id: NOTE_IDS.n022,
    title: 'Br. 28 docket — moved further toward slow side?',
    body: `Two of my Br. 28 (Lim) matters have just been reset on routine motions for the second time. The pattern is consistent with the slow-docket observation (see Marco's insight) but I'm noticing the slowdown may have gotten worse in the last 90 days. Three resets where I'd expect zero or one.

Possible cause: a colleague mentioned that Lim picked up an additional administrative case load when another QC branch judge was reassigned. If that's the cause, the slowdown should be temporary.

Implication for our active Br. 28 matters: extend internal deadlines by another 30–45 days as a precaution. Client communications should mention the docket dynamics so the slow movement doesn't read as our team's pacing.

Lower priority but worth watching. Will check back in 60 days; if the reset rate hasn't moderated, raise at practice group meeting.`,
    contentType: 'text',
    extractedEntities: [
      ent('judge', 'Judge Patricia Lim', 0.95),
      ent('lawyer', 'Marco Pangilinan', 0.78),
      ent('concept', 'Docket scheduling', 0.85),
    ],
    classification: 'observation',
    isPrivileged: false,
    isPublished: false,
    organizeProvenance: AI,
    dismissedEntityKeys: [],
    links: [],
    createdAt: t('2025-02-19T10:00:00Z'),
    updatedAt: t('2025-02-19T10:00:00Z'),
  },
  {
    id: NOTE_IDS.n023,
    title: "Dr. Mei's 2019 article — photographed citation for impeachment kit",
    body: `Photo of the relevant paragraph from Dr. Mei's 2019 Journal of Forensic Accounting article — the one we used in Helios for the assumption-sourcing impeachment.

Key passage (paragraph 17 of the article): "A valuation engagement that relies materially on assumptions provided by retaining counsel without independent verification cannot, in the author's view, qualify as an independent professional valuation. The integrity of the valuation depends on the analyst's independent application of methodology to factual inputs the analyst has tested."

For the prep kit. Filed under DM Files \\ Damages Experts \\ Mei \\ Academic Record. Cross-reference [[Pull Mei's 2019 article — academic record]] for the broader academic-record-pull discipline.

Worth carrying a printed copy in the trial binder for any matter where Mei appears. The article is the impeachment vehicle for the entire counsel-supplied-assumptions cross.`,
    contentType: 'image',
    extractedEntities: [
      ent('witness', 'Dr. Janet Mei', 0.97),
      ent('matter', 'Helios Acquisition', 0.85),
      ent('concept', 'Counsel-supplied assumptions', 0.92),
      ent('concept', 'Expert impeachment', 0.90),
    ],
    classification: 'strategy',
    isPrivileged: false,
    isPublished: false,
    organizeProvenance: AI,
    dismissedEntityKeys: [],
    links: [
      { targetNoteId: NOTE_IDS.n003, displayLabel: "Pull Mei's 2019 article — academic record" },
    ],
    createdAt: t('2024-06-18T12:30:00Z'),
    updatedAt: t('2024-06-18T12:30:00Z'),
  },
  {
    id: NOTE_IDS.n024,
    title: 'Update prep kit with Caldwell pattern',
    body: `Action item to fold the Dr. Roman Caldwell comparable-transactions PH-premia weakness into the damages-expert prep kit.

What to add:
- Caldwell profile sheet: methodology (comparable transactions), weakness (8% PH market premium adjustment where 18–22% warranted in regulated sectors)
- Meridian transcript ¶¶312–340 (the impeachment passage)
- Dr. Salazar's industry-analysis rebuttal as companion document
- Cross-checklist: walk through adjustment-factor derivation, ask which PH-specific transactions considered, expose generic-emerging-markets-premium reliance

Companion documents to cross-reference in the kit:
- [[Research: PH market premia data sources for damages experts]] for the credible alternative sources
- [[TODO: pull Caldwell 2022 publications before Meridian closeout]] for the academic-record refresh

Assigning to myself. Half a day's work once Caldwell pubs are pulled. Target completion: end of Q1 2025.`,
    contentType: 'text',
    extractedEntities: [
      ent('witness', 'Dr. Roman Caldwell', 0.95),
      ent('witness', 'Dr. Esperanza Salazar', 0.85),
      ent('matter', 'Meridian Class Suit', 0.88),
      ent('concept', 'Expert prep kit', 0.90),
    ],
    classification: 'action_item',
    isPrivileged: false,
    isPublished: false,
    organizeProvenance: AI,
    dismissedEntityKeys: [],
    links: [
      { targetNoteId: NOTE_IDS.n018, displayLabel: 'Research: PH market premia data sources for damages experts' },
      { targetNoteId: NOTE_IDS.n010, displayLabel: 'TODO: pull Caldwell 2022 publications before Meridian closeout' },
    ],
    createdAt: t('2024-12-15T09:30:00Z'),
    updatedAt: t('2024-12-15T09:30:00Z'),
  },
  {
    id: NOTE_IDS.n025,
    title: 'Research: international arbitration enforcement — recent NYC developments',
    body: `Quick research pass on recent international arbitration enforcement decisions in PH and ASEAN courts, ahead of the Cordillera oral argument.

Found three relevant rulings in the last 36 months:
1. A 2023 CA decision narrowly construing the public-policy defense in an enforcement matter against a state-owned mining entity. Helpful for our framing.
2. A 2022 Singapore enforcement case treating public policy under Article V(2)(b) as requiring "fundamental conflict" not "regulatory inconsistency." Persuasive comparative authority.
3. A 2024 PH SC ruling on a different arbitration matter that includes dicta on public policy in enforcement context. Less directly on point but the language is favorable.

Will pull together for Carlos before the oral argument. Probably as a 2-page comparative memo, not a full brief — the substantive position is already drafted.

Honest acknowledgment: the doctrinal landscape here is genuinely thin. We're working with limited data points and significant uncertainty. Worth flagging in the memo so Carlos has the candid picture.

See [[Cordillera oral argument — voice memo on strategy]] for the macro framing.`,
    contentType: 'text',
    extractedEntities: [
      ent('matter', 'Cordillera Mining Arbitration', 0.92),
      ent('lawyer', 'Carlos Reyes', 0.85),
      ent('concept', 'Arbitration enforcement', 0.93),
      ent('concept', 'Public policy defense', 0.90),
      ent('statute', 'New York Convention', 0.88),
    ],
    classification: 'research',
    isPrivileged: false,
    isPublished: false,
    organizeProvenance: AI,
    dismissedEntityKeys: [],
    links: [
      { targetNoteId: NOTE_IDS.n019, displayLabel: 'Cordillera oral argument — voice memo on strategy' },
    ],
    createdAt: t('2024-11-10T16:00:00Z'),
    updatedAt: t('2024-11-10T16:00:00Z'),
  },
  {
    id: NOTE_IDS.n026,
    title: 'Pre-trial conference dynamics with Whitfield & Mendez',
    body: `Watched Carlos handle a pre-trial conference with Whitfield & Mendez in Helios this week. Worth recording the dynamics.

Whitfield's senior litigator (Geraldine Whitfield herself) showed up with a longer set of proposed admissions than usual and pushed hard on procedural-extension requests. The extensions, in retrospect, were designed to slow the pre-trial order issuance — every additional week of delay was leverage for them.

Carlos's approach: agreed to one minor procedural extension (45 days on a discovery deliverable), conditioned the rest on bilateral commitments (if they get the 45-day discovery extension, we get reciprocal flexibility on our own deposition scheduling). The trade equalized rather than gifted. Buenaventura adopted the bilateral framing in the pre-trial order.

Pattern observation for future Whitfield matters: when they ask for extensions, pair acceptance with reciprocal asks. Their structural incentive is delay; the symmetric ask either neutralizes the gain (if they accept) or exposes the delay motivation (if they refuse).

Companion: see firm-level insight on Whitfield's procedural-delay-as-leverage pattern.`,
    contentType: 'text',
    extractedEntities: [
      ent('matter', 'Helios Acquisition', 0.90),
      ent('party', 'Whitfield & Mendez', 0.95),
      ent('lawyer', 'Atty. Geraldine Whitfield', 0.92),
      ent('lawyer', 'Carlos Reyes', 0.90),
      ent('judge', 'Judge Maria Buenaventura', 0.85),
    ],
    classification: 'observation',
    isPrivileged: false,
    isPublished: false,
    organizeProvenance: AI,
    dismissedEntityKeys: [],
    links: [],
    createdAt: t('2024-09-28T17:30:00Z'),
    updatedAt: t('2024-09-28T17:30:00Z'),
  },
  {
    id: NOTE_IDS.n027,
    title: 'Damages-expert brainstorm with Beatrice — e-discovery angles',
    body: `Sat down with Beatrice Sevilla for an hour to brainstorm how the e-discovery side connects to the damages-expert side. Her angle is the meta-pattern: expert reports often rely on aggregated financial data, but the underlying data sets are themselves the subject of discovery production. There's a connection between TAR methodology rigor and damages-methodology credibility.

Specifically: if we can show that the opposing damages expert relied on a data set that wasn't validated through a defensible production protocol, that's an additional methodology angle to attack. Not just "the expert applied the wrong method to the data" but "the data the expert used wasn't validated to start with."

We don't have a matter where this fits cleanly yet. Helena might develop into one — the scienter angle is document-driven and the damages-quantum angle will also rely on production data. If both come together it could be a novel cross theme.

Beatrice is going to look at the Meridian TAR methodology submission and think about whether the validation framework there could be retrofitted as a damages-data-integrity argument.

Worth keeping warm. Could become a published insight if it lands in an active matter.`,
    contentType: 'text',
    extractedEntities: [
      ent('lawyer', 'Beatrice Sevilla', 0.95),
      ent('matter', 'Meridian Class Suit', 0.85),
      ent('matter', 'Helena Securities', 0.85),
      ent('concept', 'Damages methodology', 0.85),
      ent('concept', 'TAR / e-discovery', 0.88),
    ],
    classification: 'strategy',
    isPrivileged: false,
    isPublished: false,
    organizeProvenance: AI,
    dismissedEntityKeys: [],
    links: [],
    createdAt: t('2025-01-09T15:00:00Z'),
    updatedAt: t('2025-01-09T15:00:00Z'),
  },
  {
    id: NOTE_IDS.n028,
    title: 'Depo opening protocol — refinements after the Bernardo session',
    body: `The deposition opening protocol from cluster 10 of the firm playbook has been our standard for a year now. After the recent Bernardo session ([[Bernardo deposition — Aurora matter, Feb 2025]]) I'd add a refinement worth piloting.

Current opening: "Counsel, we are governed by the standard objection conventions: objections should be limited to form, foundation, and privilege; instructions to the witness not to answer are reserved for privilege; speaking objections are not appropriate and we will note them for the record."

Proposed addition (after privilege-only instruction sentence): "If we identify a pattern of speaking objections, we will request stenographer read-back of the question and ask the witness to answer as read."

This makes the read-back consequence explicit at the start. Opposing counsel can't claim surprise when we invoke it. Two-line addition; doesn't change the existing protocol's core.

Pilot at the next deposition I run. If it works as well as it should, propose to Diana for adoption as the firm-wide protocol.`,
    contentType: 'text',
    extractedEntities: [
      ent('concept', 'Deposition objections', 0.90),
      ent('lawyer', 'Diana Santos', 0.78),
      ent('lawyer', 'Atty. Ricardo Bernardo', 0.82),
    ],
    classification: 'strategy',
    isPrivileged: false,
    isPublished: false,
    organizeProvenance: AI,
    dismissedEntityKeys: [],
    links: [
      { targetNoteId: NOTE_IDS.n016, displayLabel: 'Bernardo deposition — Aurora matter, Feb 2025' },
    ],
    createdAt: t('2025-02-13T09:45:00Z'),
    updatedAt: t('2025-02-13T09:45:00Z'),
  },
  {
    id: NOTE_IDS.n029,
    title: 'Post-Cordillera hearing — voice reflection',
    body: ``,
    audioTranscript: `Driving back from the Cordillera oral argument. Carlos handled it well. The CA panel asked the public-policy-defense question almost first thing — they wanted us to articulate the line between regulatory disagreement and fundamental public-policy conflict. Carlos went with the framing we workshopped — affirmative statutory or constitutional conflict.

One of the Justices pressed on the regulatory-overlap point. He wanted to know whether mining-sector regulatory inconsistency could ever rise to the level of public policy. Carlos's answer was good — yes, in principle, but the specific inconsistency the opposition is pointing to is a routine licensing-condition question, not a fundamental regulatory conflict.

I felt the panel was receptive. Hard to tell with the CA panel composition. The decision will probably come in three to four months.

Lesson to take forward — the comparative authority memo I pulled together — see the [[Research: international arbitration enforcement — recent NYC developments]] note — that material would have helped if we'd needed to deepen any point. Carlos referenced it once but didn't lean on it. Worth keeping handy for the brief if any further written submissions are called for.

Privileged content — staying personal note.`,
    contentType: 'audio',
    extractedEntities: [
      ent('matter', 'Cordillera Mining Arbitration', 0.96),
      ent('lawyer', 'Carlos Reyes', 0.92),
      ent('concept', 'Arbitration enforcement', 0.88),
    ],
    classification: 'observation',
    isPrivileged: true,
    isPublished: false,
    organizeProvenance: AI,
    dismissedEntityKeys: [],
    links: [
      { targetNoteId: NOTE_IDS.n025, displayLabel: 'Research: international arbitration enforcement — recent NYC developments' },
    ],
    createdAt: t('2024-12-04T18:30:00Z'),
    updatedAt: t('2024-12-04T18:30:00Z'),
  },
  {
    id: NOTE_IDS.n030,
    title: 'MIL timing in mixed-bench matters — lesson from a 2024 misfire',
    body: `Lesson learned the awkward way last year. We filed a MIL in a matter that started in Br. 147 but got rebranched mid-stream to Br. 28 (Lim). The original MIL was structured for Br. 147 conventions — narrow scope, pinpoint citations, drafted in the pre-trial window per Buenaventura's preference.

Br. 28 has different practical timing expectations. Lim is slower, the pre-trial window is longer, and her preference is for the MIL to be tightly integrated with the JA-scope discussion (which happens later in her schedule than in Buenaventura's). The MIL got calendared but the timing felt off and the ruling didn't engage with the substance the way Buenaventura would have.

Takeaway: when matters move between branches mid-stream, MIL strategy should be re-evaluated, not just re-filed. The substantive grounds may be the same but the timing, framing, and supporting affidavit emphasis should change.

For the team: if any active matter moves between Br. 147 and Br. 28, flag immediately so the MIL strategy can be revisited. Not a published insight yet but might become one.`,
    contentType: 'text',
    extractedEntities: [
      ent('judge', 'Judge Maria Buenaventura', 0.85),
      ent('judge', 'Judge Patricia Lim', 0.85),
      ent('concept', 'Motion in limine', 0.92),
      ent('concept', 'JA Rule scope', 0.85),
    ],
    classification: 'lesson_learned',
    isPrivileged: false,
    isPublished: false,
    organizeProvenance: AI,
    dismissedEntityKeys: [],
    links: [
      { targetNoteId: NOTE_IDS.n004, displayLabel: 'MIL filing window in Buenaventura — only pre-trial counts' },
    ],
    createdAt: t('2024-11-20T11:15:00Z'),
    updatedAt: t('2024-11-20T11:15:00Z'),
  },
  {
    id: NOTE_IDS.n031,
    title: 'Onboarding Daniel Mariano on Helios discovery',
    body: `Daniel Mariano is joining the Helios team next week — Carlos asked me to onboard him on the discovery side. Putting together the materials.

Onboarding sequence:
- Day 1: matter overview, parties, theory of the case, timeline
- Day 2: discovery posture — what's been produced, what's still outstanding, the V&A-style late-disclosure pattern Whitfield uses
- Day 3: deposition coverage — past depos, upcoming depos, the prep cycle (see [[Three-session depo prep cycle — what finally clicked]])
- Day 4: damages posture — Pugeda as our expert, Mei as theirs, the prep kit
- Day 5: working alongside, joining team sync, picking up discrete assignments

Materials I'll send him in advance:
- Helios case summary memo (1 page)
- Discovery production log (current state)
- The damages-expert prep kit excerpt — the methodology-attack section, not the academic-record-impeachment section (he doesn't need that yet)
- The deposition opening protocol

Daniel is junior — second year — but smart and conscientious. Don't overload him at intake; pace materials across the first week. Diana onboarded me with the same approach when I joined this practice group; it worked well.`,
    contentType: 'text',
    extractedEntities: [
      ent('matter', 'Helios Acquisition', 0.92),
      ent('lawyer', 'Daniel Mariano', 0.95),
      ent('lawyer', 'Carlos Reyes', 0.85),
      ent('lawyer', 'Diana Santos', 0.80),
      ent('witness', 'Dr. Antonio Pugeda', 0.78),
      ent('witness', 'Dr. Janet Mei', 0.78),
      ent('party', 'Whitfield & Mendez', 0.80),
    ],
    classification: 'action_item',
    isPrivileged: false,
    isPublished: false,
    organizeProvenance: AI,
    dismissedEntityKeys: [],
    links: [
      { targetNoteId: NOTE_IDS.n006, displayLabel: 'Three-session depo prep cycle — what finally clicked' },
    ],
    createdAt: t('2025-03-10T13:00:00Z'),
    updatedAt: t('2025-03-10T13:00:00Z'),
  },

  // ═══════════════════════════════════════════════════════════════════════
  // TOMBSTONED (2)
  // ═══════════════════════════════════════════════════════════════════════

  {
    id: NOTE_IDS.n032,
    title: 'Old note — superseded matter (kept for retention)',
    body: `This note is being kept in tombstone form for retention purposes. The underlying matter was withdrawn before any substantive litigation steps; the note's content was specific to a client/strategy approach we no longer use.

Tombstoned 2024-08-12.`,
    contentType: 'text',
    extractedEntities: [],
    classification: 'observation',
    isPrivileged: false,
    isPublished: false,
    organizeProvenance: AI,
    dismissedEntityKeys: [],
    links: [],
    createdAt: t('2023-04-20T10:00:00Z'),
    updatedAt: t('2024-08-12T16:00:00Z'),
    deletedAt: t('2024-08-12T16:00:00Z'),
  },
  {
    id: NOTE_IDS.n033,
    title: 'Bautista in a bench trial — observation, Skylark coda',
    body: `Watched Atty. Bautista handle a bench commercial trial last quarter (separate matter, not ours — sitting in to observe). The pattern from the firm-level insight held up exactly: he was visibly less focused than I've seen him described in jury-equivalent contexts. Asked broad questions, didn't follow up on a clear admission, let a favorable point pass without elaboration.

Specifically: opposing counsel got the defense's CFO to concede on a critical accounting treatment. Bautista's redirect didn't even address the concession — he asked the witness about the company's organizational structure for two minutes and sat down. The concession stood unrehabilitated.

If we face Bautista in a future bench commercial matter, the pattern is reliable enough to plan around. Note that this is an observation from one session of one matter; the pattern across colleagues' descriptions makes it consistent but I'd validate before betting heavily on it.

Tangential connection to Skylark, where we lost on SJ partly on the damages-expert cross we should have done with more rigor. Different opposing counsel, different shape of vulnerability, but similar lesson — when opposing counsel has a visible weakness, exploit it actively, don't assume.`,
    contentType: 'text',
    extractedEntities: [
      ent('lawyer', 'Atty. Hector Bautista', 0.95),
      ent('party', 'Tan & Roxas', 0.88),
      ent('matter', 'Skylark Distribution', 0.75),
    ],
    classification: 'observation',
    isPrivileged: false,
    isPublished: false,
    organizeProvenance: AI,
    dismissedEntityKeys: [],
    links: [],
    createdAt: t('2024-10-22T19:00:00Z'),
    updatedAt: t('2024-10-22T19:00:00Z'),
  },
  {
    id: NOTE_IDS.n034,
    title: 'Helios deposition kit — Mei cross outline',
    body: `Working draft of the Mei cross outline used at the Helios deposition. Living document. Updated after each session with her.

Cross outline structure (8 sections):
1. Qualification foundation — credentials, current engagements, prior cases
2. Methodology selection — why DCF, what alternatives considered
3. Assumption sourcing — each assumption, who calculated it (THE MAIN POINT)
4. Discount rate derivation
5. Terminal growth rate selection
6. Comparable transactions set composition
7. Sensitivity analysis (or absence thereof)
8. Cross-impeachment with academic record — the 2019 paper passage (see [[Dr. Mei's 2019 article — photographed citation for impeachment kit]])

Section 3 is where the depo turned. The other sections set up the impeachment — they establish that the witness presented her opinion as independent expert judgment. Section 3 surfaces that the independent-judgment frame was inaccurate.

Section 8 closes it. The witness's own scholarship contradicting her current position is the rhetorical end of the deposition.

Will refine after each Mei encounter. Companion to [[Mei methodology pattern across matters]] (the broader cross-matter pattern note) and [[Cross-examining Dr. Mei on assumption sourcing — Helios deposition]] (the specific Helios deposition write-up).`,
    contentType: 'text',
    extractedEntities: [
      ent('witness', 'Dr. Janet Mei', 0.97),
      ent('matter', 'Helios Acquisition', 0.90),
      ent('concept', 'DCF damages methodology', 0.85),
      ent('concept', 'Damages expert cross-examination', 0.93),
    ],
    classification: 'strategy',
    isPrivileged: true,
    isPublished: false,
    organizeProvenance: AI,
    dismissedEntityKeys: [],
    links: [
      { targetNoteId: NOTE_IDS.n023, displayLabel: "Dr. Mei's 2019 article — photographed citation for impeachment kit" },
      { targetNoteId: NOTE_IDS.n002, displayLabel: 'Mei methodology pattern across matters' },
      { targetNoteId: NOTE_IDS.n001, displayLabel: 'Cross-examining Dr. Mei on assumption sourcing — Helios deposition' },
    ],
    createdAt: t('2024-06-10T09:00:00Z'),
    updatedAt: t('2025-02-26T17:00:00Z'),
  },
  {
    id: NOTE_IDS.n035,
    title: '[Tombstoned] Stub from old matter — kept by accident',
    body: `Empty stub from a matter that never proceeded. Soft-deleting for cleanliness; not worth purging from history.`,
    contentType: 'text',
    extractedEntities: [],
    classification: 'observation',
    isPrivileged: false,
    isPublished: false,
    organizeProvenance: AI,
    dismissedEntityKeys: [],
    links: [],
    createdAt: t('2023-02-14T08:00:00Z'),
    updatedAt: t('2024-05-01T11:30:00Z'),
    deletedAt: t('2024-05-01T11:30:00Z'),
  },
];

/**
 * The personal-notes seed payload, sized for first-run hydration into IndexedDB.
 * Loader (apps/web/src/lib/seedPersonal.ts) iterates and calls createNote per entry.
 *
 * Sanity counts:
 *   total: 35
 *   text: 28 (~80%)  •  audio: 3 (~9%)  •  image: 2 (~6%)  •  text-with-transcript-only: 2
 *   published: 6 (~17%)  •  privileged: 7 (~20%)  •  tombstoned: 2
 *
 * Note: brief-target was 60/25/15 content-type mix and ~40% published. Actual
 * mix is text-heavier and less-published because Ana's authored published insights
 * are only 6 — to hit 40% published we'd need to either thin out unpublished
 * coverage or fabricate more published insights. The current ratio favors a
 * realistic working-corpus feel over hitting the target percentages exactly.
 */
export const PERSONAL_NOTES_SEED_COUNT = SEED_PERSONAL_NOTES.length;
