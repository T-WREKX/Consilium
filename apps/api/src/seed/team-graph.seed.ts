/**
 * Consilium — Team Graph Seed Corpus
 *
 * The fictional universe + published-insight corpus that backs the demo
 * retrieval moment. Loader: ./seed.ts.
 *
 * Universe at a glance:
 *   • Firm:  Acme Litigation Partners, Manila — Commercial Litigation Group
 *   • Period: ~3 years of accumulated firm knowledge (2022-08 through 2025-04)
 *   • 3 demo accounts (Ana Mendoza, Carlos Reyes, Diana Santos) + 12 additional
 *     firm lawyers as entity nodes only.
 *   • 10 matters, 8 judges, 6 opposing firms, 10 expert witnesses, ~26 concepts,
 *     ~12 precedents, ~14 statutes.
 *
 * Choreographed retrieval clusters (the demo lives or dies on these):
 *   1. MANDATORY — damages-expert cross-examination (10+ insights, shared experts
 *      Dr. Mei / Dr. Caldwell / Dr. Garcia across matters Helios, Helena,
 *      Meridian, Coastal).
 *   2. Judge Buenaventura tendencies (RTC Makati Br. 147).
 *   3. Opposing counsel patterns — Villanueva & Associates.
 *   4. Trade secrets / summary judgment doctrine (Banyan / Tessera).
 *   5. Settlement dynamics & mediator behaviors.
 *   6. Procedural / local-rule quirks.
 *
 * Refusal-trigger empty zones (intentionally zero coverage so a demo refusal
 * query reliably triggers): cryptocurrency / digital assets, immigration,
 * family law, criminal defense, patent prosecution.
 *
 * Medium-confidence (thin-but-real) zones: foreign arbitral award enforcement,
 * antitrust market definition, FRE 702/703-equivalent objections under the 2019
 * Revised Rules on Evidence.
 */

// ─── Types ───────────────────────────────────────────────────────────────────
// `NoteClassification` mirrors the shared union from apps/web/src/types/index.ts.
// Inlined to avoid a cross-package TS import from the API; keep in sync.

export type NoteClassification =
  | 'strategy'
  | 'observation'
  | 'lesson_learned'
  | 'action_item'
  | 'research'
  | 'meeting_summary';

export type EntityType =
  | 'matter'
  | 'party'
  | 'lawyer'
  | 'judge'
  | 'witness'
  | 'concept'
  | 'precedent'
  | 'statute';

export type LawyerRole =
  | 'partner'
  | 'practice_group_lead'
  | 'senior_counsel'
  | 'senior_associate'
  | 'mid_associate'
  | 'junior_associate';

/**
 * A firm lawyer. Becomes a `lawyer`-type team_graph_node so that `authored_by`
 * edges have somewhere to point. The 3 demo accounts ALSO live in the `users`
 * table and have a matching `userEmail`.
 */
export interface SeedLawyer {
  placeholderId: string;
  name: string;
  role: LawyerRole;
  specialty?: string;
  /** Present only for the 3 demo-account lawyers; loader resolves to users.id. */
  userEmail?: string;
}

/**
 * Any non-insight, non-firm-lawyer node: matter, party (opposing firm),
 * judge, witness (expert), concept, precedent, statute, or non-account lawyer
 * (e.g., individual opposing counsel).
 */
export interface SeedEntity {
  placeholderId: string;
  type: EntityType;
  name: string;
  /** 1–3 sentence body for the entity node. Surfaces in the side panel. */
  description?: string;
  metadata?: Record<string, unknown>;
}

/**
 * A published insight. Loader assigns a UUID, resolves authorPlaceholderId →
 * contributor user (if accounted) and emits edges from the metadata arrays.
 */
export interface SeedInsight {
  placeholderId: string;
  title: string;
  body: string;
  summary: string;
  classification: NoteClassification;
  /** SeedLawyer.placeholderId. Resolves to both contributor_id and authored_by edge. */
  authorPlaceholderId: string;
  mentions: readonly string[];
  about?: readonly string[];
  cites?: readonly string[];
  involves?: readonly string[];
  concerns?: readonly string[];
  /** ISO-8601 timestamp; loader overrides created_at/updated_at on the row. */
  createdAt: string;
  /** Stored on team_graph_nodes.source_personal_note_id; aligns with personal-notes seed. */
  sourcePersonalNotePlaceholderId?: string;
  metadata?: Record<string, unknown>;
}

export interface SeedEdge {
  source: string;
  target: string;
  type: 'related_to' | 'mentions' | 'involves' | 'cites' | 'about' | 'concerns' | 'authored_by';
  weight?: number;
}

// ─── Firm Lawyers (15) ───────────────────────────────────────────────────────
// 3 demo accounts + 12 entity-only firm lawyers. Names and emails for the
// demo accounts MUST stay in sync with seed.ts demoUsers.

export const FIRM_LAWYERS: readonly SeedLawyer[] = [
  // Demo accounts (have users-table rows)
  {
    placeholderId: 'lawyer-ana-mendoza',
    name: 'Ana Mendoza',
    role: 'senior_associate',
    specialty: 'commercial litigation; expert witness practice',
    userEmail: 'litigator@acme.law',
  },
  {
    placeholderId: 'lawyer-carlos-reyes',
    name: 'Carlos Reyes',
    role: 'practice_group_lead',
    specialty: 'M&A litigation; post-acquisition disputes; commercial fraud',
    userEmail: 'lead@acme.law',
  },
  {
    placeholderId: 'lawyer-diana-santos',
    name: 'Diana Santos',
    role: 'senior_counsel',
    specialty: 'knowledge management; procedural strategy; appellate practice',
    userEmail: 'admin@acme.law',
  },
  // Entity-only firm lawyers (no users row; authored_by edge still emitted)
  {
    placeholderId: 'lawyer-miguel-ortega',
    name: 'Miguel Ortega',
    role: 'partner',
    specialty: 'antitrust; competition law (PCC)',
  },
  {
    placeholderId: 'lawyer-lourdes-villaroman',
    name: 'Lourdes Villaroman',
    role: 'partner',
    specialty: 'securities litigation; M&A disputes',
  },
  {
    placeholderId: 'lawyer-felix-domingo',
    name: 'Felix Domingo',
    role: 'partner',
    specialty: 'IP litigation; trade secrets',
  },
  {
    placeholderId: 'lawyer-patricia-yusay',
    name: 'Patricia Yusay',
    role: 'senior_associate',
    specialty: 'construction; real estate disputes',
  },
  {
    placeholderId: 'lawyer-vincent-lao',
    name: 'Vincent Lao',
    role: 'senior_associate',
    specialty: 'distribution & dealership; franchise disputes',
  },
  {
    placeholderId: 'lawyer-rafael-estrada',
    name: 'Rafael Estrada',
    role: 'senior_associate',
    specialty: 'general commercial litigation; deposition practice',
  },
  {
    placeholderId: 'lawyer-karen-bautista',
    name: 'Karen Bautista',
    role: 'senior_associate',
    specialty: 'IP litigation; trade secret enforcement',
  },
  {
    placeholderId: 'lawyer-joaquin-tirona',
    name: 'Joaquin Tirona',
    role: 'mid_associate',
    specialty: 'commercial litigation; motion practice',
  },
  {
    placeholderId: 'lawyer-beatrice-sevilla',
    name: 'Beatrice Sevilla',
    role: 'mid_associate',
    specialty: 'e-discovery; document review protocols',
  },
  {
    placeholderId: 'lawyer-marco-pangilinan',
    name: 'Marco Pangilinan',
    role: 'mid_associate',
    specialty: 'labor & employment overlap; NLRC practice',
  },
  {
    placeholderId: 'lawyer-sophia-recto',
    name: 'Sophia Recto',
    role: 'junior_associate',
    specialty: 'legal research; brief drafting',
  },
  {
    placeholderId: 'lawyer-daniel-mariano',
    name: 'Daniel Mariano',
    role: 'junior_associate',
    specialty: 'case management; pleadings',
  },
];

// ─── Entities (matters, judges, opposing firms, experts, concepts, precedents, statutes) ──

export const ENTITIES: readonly SeedEntity[] = [
  // ─── Matters (10) ────────────────────────────────────────────────────────
  {
    placeholderId: 'matter-helios',
    type: 'matter',
    name: 'Helios Acquisition',
    description:
      'Post-acquisition warranty and indemnity dispute in the mid-cap manufacturing sector. Our client (acquirer) alleges undisclosed liabilities and inventory misrepresentations against the selling principals. Active; lead Carlos Reyes.',
    metadata: { status: 'active', leadLawyer: 'lawyer-carlos-reyes', industry: 'manufacturing' },
  },
  {
    placeholderId: 'matter-meridian',
    type: 'matter',
    name: 'Meridian Class Suit',
    description:
      'Consumer class suit against a publicly listed telecom carrier (our client, defendant) over allegedly deceptive subscription terms. Settled favorably 14 months in. Lead Lourdes Villaroman.',
    metadata: { status: 'settled', leadLawyer: 'lawyer-lourdes-villaroman', industry: 'telecom' },
  },
  {
    placeholderId: 'matter-coastal',
    type: 'matter',
    name: 'Coastal Trade Dispute',
    description:
      'Restraint-of-trade and exclusive-dealing claim in inter-island shipping. Our client (a regional logistics company) prevailed on the merits at trial. Closed favorable; lead Miguel Ortega.',
    metadata: { status: 'closed_favorable', leadLawyer: 'lawyer-miguel-ortega', industry: 'shipping' },
  },
  {
    placeholderId: 'matter-banyan',
    type: 'matter',
    name: 'Banyan Trade Secret',
    description:
      'Trade-secret misappropriation against a former CTO and his new employer. Our client (Banyan-sector software vendor) alleges source-code copying and customer-list misuse. Active; lead Felix Domingo.',
    metadata: { status: 'active', leadLawyer: 'lawyer-felix-domingo', industry: 'software' },
  },
  {
    placeholderId: 'matter-helena',
    type: 'matter',
    name: 'Helena Securities',
    description:
      'Minority-shareholder securities-fraud action against management of a listed holding company over misstated quarterly results. Active; lead Lourdes Villaroman.',
    metadata: { status: 'active', leadLawyer: 'lawyer-lourdes-villaroman', industry: 'financial_services' },
  },
  {
    placeholderId: 'matter-cordillera',
    type: 'matter',
    name: 'Cordillera Mining Arbitration',
    description:
      'Enforcement in PH courts of a foreign arbitral award issued in our client\'s favor against a JV partner. Threshold issues on New York Convention public-policy defense. Active; lead Carlos Reyes.',
    metadata: { status: 'active', leadLawyer: 'lawyer-carlos-reyes', industry: 'mining' },
  },
  {
    placeholderId: 'matter-skylark',
    type: 'matter',
    name: 'Skylark Distribution',
    description:
      'Dealership termination dispute. Our client (regional dealer) lost on summary judgment; we underestimated the integration-clause defense. Closed unfavorable; lead Vincent Lao.',
    metadata: { status: 'closed_unfavorable', leadLawyer: 'lawyer-vincent-lao', industry: 'beverages' },
  },
  {
    placeholderId: 'matter-pinnacle',
    type: 'matter',
    name: 'Pinnacle Real Estate',
    description:
      'Construction defects and progress-payment dispute on a mid-rise project. Settled at mediation after a favorable interlocutory ruling on liquidated damages. Lead Patricia Yusay.',
    metadata: { status: 'settled', leadLawyer: 'lawyer-patricia-yusay', industry: 'construction' },
  },
  {
    placeholderId: 'matter-tessera',
    type: 'matter',
    name: 'Tessera Counter-claim',
    description:
      'Counter-claim filed by the defendant employer in the Banyan trade-secret matter, alleging tortious interference by our client. Active; lead Felix Domingo with Karen Bautista.',
    metadata: { status: 'active', leadLawyer: 'lawyer-felix-domingo', industry: 'software' },
  },
  {
    placeholderId: 'matter-aurora',
    type: 'matter',
    name: 'Aurora Pharma Distribution',
    description:
      'Exclusive-dealing complaint before the PCC; our client (a regional pharmacy chain) is the complainant against a multinational supplier. Active; lead Miguel Ortega.',
    metadata: { status: 'active', leadLawyer: 'lawyer-miguel-ortega', industry: 'pharmaceuticals' },
  },

  // ─── Judges (8) ──────────────────────────────────────────────────────────
  {
    placeholderId: 'judge-buenaventura',
    type: 'judge',
    name: 'Judge Maria Buenaventura',
    description:
      'RTC Makati Branch 147 (commercial docket). Fast on summary judgment, self-imposed 15-page motion limit, no oral argument on MSJs, dislikes string citations.',
    metadata: { district: 'RTC Makati Br. 147', docket: 'commercial' },
  },
  {
    placeholderId: 'judge-navarro',
    type: 'judge',
    name: 'Judge Roberto Navarro',
    description:
      'RTC Pasig Branch 7. Tech-forward; one of the first PH trial judges to accept predictive coding and TAR protocols for document review. Long written opinions; patient with experts.',
    metadata: { district: 'RTC Pasig Br. 7', docket: 'commercial' },
  },
  {
    placeholderId: 'judge-santos-art',
    type: 'judge',
    name: 'Judge Arturo Santos',
    description:
      'RTC Makati Branch 15. Mediation-heavy: refers virtually every commercial case to court-annexed mediation within the first two hearings; cites bad-faith mediation participation in costs awards.',
    metadata: { district: 'RTC Makati Br. 15', docket: 'commercial' },
  },
  {
    placeholderId: 'judge-lim',
    type: 'judge',
    name: 'Judge Patricia Lim',
    description:
      'RTC Quezon City Branch 28. Strict on Judicial Affidavit Rule scope — sustains objections to any expert opinion outside the four corners of the declared topics. Slow docket; detail-oriented written rulings.',
    metadata: { district: 'RTC QC Br. 28', docket: 'commercial' },
  },
  {
    placeholderId: 'judge-cruz',
    type: 'judge',
    name: 'Judge Elena Cruz',
    description:
      'RTC Manila Branch 33. Habitually defers rulings on motions to dismiss for lack of jurisdiction until after the plaintiff has rested. Heavy docket; difficult to obtain early dispositive relief.',
    metadata: { district: 'RTC Manila Br. 33', docket: 'general' },
  },
  {
    placeholderId: 'judge-mendoza-f',
    type: 'judge',
    name: 'Judge Felipe Mendoza',
    description:
      'RTC Makati Branch 62. Antitrust experience pre-bench; demands rigorous market-definition analysis on PCC referrals. Skeptical of price-discrimination theories without econometric support.',
    metadata: { district: 'RTC Makati Br. 62', docket: 'commercial; antitrust referrals' },
  },
  {
    placeholderId: 'judge-tolentino',
    type: 'judge',
    name: 'Justice Andrea Tolentino',
    description:
      'Court of Appeals, Special 5th Division. Strict on Rule 65 prerequisites — dismisses petitions for failure to file a motion for reconsideration absent compelling exception. Writes detailed dissents.',
    metadata: { court: 'CA Special 5th Div.', level: 'appellate' },
  },
  {
    placeholderId: 'judge-veloso',
    type: 'judge',
    name: 'Judge Conrado Veloso',
    description:
      'RTC Pasig Branch 51. IP-savvy; active TRO grantor in trade-secret and trademark matters. More receptive to irreparable-injury showings premised on customer-relationship harm than purely revenue-based theories.',
    metadata: { district: 'RTC Pasig Br. 51', docket: 'commercial; IP' },
  },

  // ─── Opposing Counsel Firms (6) — node_type 'party' ──────────────────────
  {
    placeholderId: 'firm-villanueva',
    type: 'party',
    name: 'Villanueva & Associates',
    description:
      'Mid-size litigation boutique. Hallmark pattern: voluminous supplemental document disclosures filed 48–72 hours before critical hearings. Aggressive on discovery sanction motions.',
    metadata: { reputation: 'aggressive', size: 'mid' },
  },
  {
    placeholderId: 'firm-santos-cruz',
    type: 'party',
    name: 'Santos Cruz Law',
    description:
      'Defense-oriented litigation firm. Known for speaking objections at deposition (lead: Atty. Ricardo Bernardo) and heavy motion-in-limine practice. Settlement-averse until adverse interlocutory.',
    metadata: { reputation: 'defense-aggressive', size: 'mid' },
  },
  {
    placeholderId: 'firm-ramos',
    type: 'party',
    name: 'Ramos Law Firm',
    description:
      'Labor & employment specialty. Represents respondent employers in NLRC cases. Slow settlement escalation curve: 30–40% of claim until adverse PCC ruling, then jumps to 60–70%.',
    metadata: { reputation: 'methodical', size: 'small_mid', practice: 'labor' },
  },
  {
    placeholderId: 'firm-tan-roxas',
    type: 'party',
    name: 'Tan & Roxas',
    description:
      'Trial boutique. Atty. Hector Bautista is the lead trial partner — vigorous on objections in jury-equivalent set-ups (criminal/family) but unfocused in bench commercial trials. Inconsistent depositions.',
    metadata: { reputation: 'inconsistent', size: 'small_mid' },
  },
  {
    placeholderId: 'firm-whitfield-mendez',
    type: 'party',
    name: 'Whitfield & Mendez',
    description:
      'International M&A firm with Manila office. Retains expensive damages experts (frequently Dr. Janet Mei). Slow to settle; uses procedural delay as leverage.',
    metadata: { reputation: 'patient_aggressive', size: 'large_international' },
  },
  {
    placeholderId: 'firm-aragon-madrigal',
    type: 'party',
    name: 'Aragon Madrigal',
    description:
      'Old-line litigation boutique. Highly procedural; files extensive Rule 65 petitions to the Court of Appeals on adverse interlocutories. Strong on appellate briefs, weak on factual development.',
    metadata: { reputation: 'procedural', size: 'mid' },
  },

  // ─── Individual Opposing Counsel (3) — node_type 'lawyer' ────────────────
  {
    placeholderId: 'lawyer-bernardo',
    type: 'lawyer',
    name: 'Atty. Ricardo Bernardo',
    description:
      'Lead trial partner at Santos Cruz Law. Habitual speaking objector during depositions; objects on "vague," "compound," and "calls for speculation" even on simple questions to coach witnesses.',
    metadata: { firm: 'firm-santos-cruz', side: 'opposing' },
  },
  {
    placeholderId: 'lawyer-bautista-h',
    type: 'lawyer',
    name: 'Atty. Hector Bautista',
    description:
      'Trial partner at Tan & Roxas. Files late objections to exhibits but only in jury-equivalent matters. In bench commercial trials he rarely objects to foundation. Overloads pre-trial with motions in limine he then waives.',
    metadata: { firm: 'firm-tan-roxas', side: 'opposing' },
  },
  {
    placeholderId: 'lawyer-whitfield',
    type: 'lawyer',
    name: 'Atty. Geraldine Whitfield',
    description:
      'Managing partner of Whitfield & Mendez Manila office. Leads opposition on Helios and historically on Coastal. Patient negotiator; preserves every objection on the record.',
    metadata: { firm: 'firm-whitfield-mendez', side: 'opposing' },
  },

  // ─── Expert Witnesses (10) ───────────────────────────────────────────────
  {
    placeholderId: 'witness-mei',
    type: 'witness',
    name: 'Dr. Janet Mei',
    description:
      'Damages / business-valuation expert. DCF specialist. Cross-matter pattern: her DCF models rely heavily on counsel-supplied assumptions (growth rate, discount rate, comparable set). Has appeared for the opposition in Helios, Helena, and a third commercial-fraud matter.',
    metadata: { field: 'damages_valuation', methodologies: ['DCF', 'comparable_transactions'], side: 'opposing', cross_matter_count: 3 },
  },
  {
    placeholderId: 'witness-caldwell',
    type: 'witness',
    name: 'Dr. Roman Caldwell',
    description:
      'Damages expert. Comparable-transactions methodology. Strong on US/EU market data but consistently weak on PH-specific market premia. Opposing expert in Meridian.',
    metadata: { field: 'damages_valuation', methodologies: ['comparable_transactions'], side: 'opposing' },
  },
  {
    placeholderId: 'witness-garcia',
    type: 'witness',
    name: 'Dr. Anthony Garcia',
    description:
      'Damages expert at Garcia & Partners. DCF practitioner who routinely uses aggressive terminal growth rates (often 4–6% above sector average). Opposing expert in two of our matters; weakness exploitable via discount-rate cross.',
    metadata: { field: 'damages_valuation', methodologies: ['DCF'], side: 'opposing', firm: 'Garcia & Partners' },
  },
  {
    placeholderId: 'witness-salazar',
    type: 'witness',
    name: 'Dr. Esperanza Salazar',
    description:
      'Telecom industry expert. Retained by us for Meridian — credible on consumer-behavior modeling. Strong academic record (UP Diliman, MIT).',
    metadata: { field: 'industry_telecom', side: 'ours' },
  },
  {
    placeholderId: 'witness-kwon',
    type: 'witness',
    name: 'Dr. Henry Kwon',
    description:
      'Software / technical expert. Retained for Banyan to opine on source-code similarity and access patterns. Comfortable with judicial-affidavit cross-examination format.',
    metadata: { field: 'software_engineering', side: 'ours' },
  },
  {
    placeholderId: 'witness-tagle',
    type: 'witness',
    name: 'Eng. Bruno Tagle',
    description:
      'Construction defects engineer. Retained for Pinnacle. Methodical site-inspection methodology; produces clean photo-and-narrative judicial affidavits.',
    metadata: { field: 'construction', side: 'ours' },
  },
  {
    placeholderId: 'witness-velasco',
    type: 'witness',
    name: 'Dr. Marina Velasco',
    description:
      'Forensic accountant; the firm\'s default damages-and-tracing expert for fraud matters. Strong on bank-record reconstruction. Internal note: schedule her early — she books out 6+ weeks.',
    metadata: { field: 'forensic_accounting', side: 'ours' },
  },
  {
    placeholderId: 'witness-pugeda',
    type: 'witness',
    name: 'Dr. Antonio Pugeda',
    description:
      'Damages expert at a smaller boutique. Lower hourly rate than the top tier; we have used him as a rebuttal expert in two matters with good results. Methodologies: comparable-transactions and asset-based.',
    metadata: { field: 'damages_valuation', side: 'ours', role: 'rebuttal' },
  },
  {
    placeholderId: 'witness-ostrowski',
    type: 'witness',
    name: 'Dr. Lyle Ostrowski',
    description:
      'Foreign-licensed (US) financial damages expert. Opposing in Cordillera Mining arbitration. Limited PH market familiarity — leverageable on local benchmark data.',
    metadata: { field: 'damages_valuation', side: 'opposing' },
  },
  {
    placeholderId: 'witness-aquino',
    type: 'witness',
    name: 'Dr. Christine Aquino',
    description:
      'Antitrust / industrial-organization economist. PCC repeat-retainer. We engaged her for Coastal on relevant-market definition; she\'s strong on diversion-ratio analysis.',
    metadata: { field: 'antitrust_economics', side: 'ours' },
  },

  // ─── Legal Concepts (26) ─────────────────────────────────────────────────
  { placeholderId: 'concept-damages-cross', type: 'concept', name: 'Damages expert cross-examination', description: 'Tactical area covering challenges to damages experts on methodology, assumptions, qualifications, and consistency.' },
  { placeholderId: 'concept-counsel-supplied-assumptions', type: 'concept', name: 'Counsel-supplied assumptions', description: 'Cross-examination angle: surfacing that key model inputs (growth, discount, comparables) came from retaining counsel rather than independent verification.' },
  { placeholderId: 'concept-dcf', type: 'concept', name: 'Discounted cash flow methodology', description: 'Income-approach valuation technique. Vulnerable to discount-rate, terminal-growth, and forecast-period challenges.' },
  { placeholderId: 'concept-comparable-transactions', type: 'concept', name: 'Comparable-transactions valuation', description: 'Market-approach valuation using transaction multiples. Vulnerable to comparability-set composition and adjustment-factor challenges.' },
  { placeholderId: 'concept-sensitivity-analysis', type: 'concept', name: 'Sensitivity analysis', description: 'Rebuttal technique: showing how small changes in key assumptions produce disproportionate changes in damages output.' },
  { placeholderId: 'concept-lost-enterprise-value', type: 'concept', name: 'Lost enterprise value vs. lost profits', description: 'Distinguishing the two damages theories; each has different proof and discount-rate requirements.' },
  { placeholderId: 'concept-daubert', type: 'concept', name: 'Daubert principles in PH practice', description: 'Daubert is not formally adopted in PH but its qualification-and-reliability principles are cited as persuasive authority under the 2019 Revised Rules on Evidence.' },
  { placeholderId: 'concept-expert-qualification', type: 'concept', name: 'Expert qualification foundation', description: 'Threshold showing that an expert\'s credentials match the specific topic of testimony; foundation gaps are an early cross-target.' },
  { placeholderId: 'concept-ja-rule-scope', type: 'concept', name: 'Judicial Affidavit Rule scope limitation', description: 'Under A.M. 12-8-8-SC, expert testimony at trial is bounded by the four corners of the judicial affidavit; any opinion beyond the declared scope is objectionable.' },
  { placeholderId: 'concept-mil', type: 'concept', name: 'Motion in limine', description: 'Pre-trial motion to exclude or limit evidence. PH practice: less formalized than US but increasingly used in commercial dockets.' },
  { placeholderId: 'concept-summary-judgment', type: 'concept', name: 'Summary judgment (Rule 35)', description: 'Disposition without trial when there is no genuine issue of material fact. Affidavit support materially raises grant rate in our practice.' },
  { placeholderId: 'concept-demurrer', type: 'concept', name: 'Demurrer to evidence (Rule 33)', description: 'Defense motion after plaintiff rests, challenging sufficiency of plaintiff\'s evidence. Timing creates settlement leverage.' },
  { placeholderId: 'concept-trade-secret', type: 'concept', name: 'Trade secret misappropriation', description: 'IP Code §§ 168, 169 and Air Philippines v. Pennswell framework: secrecy + reasonable measures + misappropriation.' },
  { placeholderId: 'concept-relevant-market', type: 'concept', name: 'Relevant market definition (antitrust)', description: 'Threshold issue in PCC matters; product and geographic dimensions. Diversion-ratio and SSNIP analyses are the credible methodologies.' },
  { placeholderId: 'concept-restraint-of-trade', type: 'concept', name: 'Restraint of trade', description: 'Anti-competitive conduct under RA 10667 §§ 14–15. Per-se vs. rule-of-reason analysis applies to different conduct types.' },
  { placeholderId: 'concept-securities-fraud', type: 'concept', name: 'Securities fraud (SRC § 26)', description: 'Manipulative and deceptive practices under RA 8799. Element of scienter is the contested issue in most matters.' },
  { placeholderId: 'concept-class-suit', type: 'concept', name: 'Class suit (Rule 3 § 12)', description: 'Representative action requirements: subject-matter common interest, parties so numerous that joinder is impracticable, adequacy of representation.' },
  { placeholderId: 'concept-speaking-objections', type: 'concept', name: 'Speaking objections at deposition', description: 'Objections phrased to suggest answers to witnesses. Counter: read-back of question verbatim; if pattern persists, motion for protective order.' },
  { placeholderId: 'concept-late-doc-disclosure', type: 'concept', name: 'Late document disclosure', description: 'Production of voluminous documents shortly before hearings as a tactical overload. Counter: motion to strike late-produced documents or continuance for prejudice.' },
  { placeholderId: 'concept-court-annexed-mediation', type: 'concept', name: 'Court-annexed mediation', description: 'CAM under A.M. 11-1-6-SC. Mandatory referral in covered commercial cases. Good-faith participation cited as factor in costs awards.' },
  { placeholderId: 'concept-tar', type: 'concept', name: 'Technology-assisted review (predictive coding)', description: 'ML-assisted document review for discovery. PH trial-court acceptance is judge-by-judge; methodology submission is the gating step.' },
  { placeholderId: 'concept-tro', type: 'concept', name: 'TRO / preliminary injunction', description: 'Rule 58 ancillary relief. Requires showing of clear and unmistakable right, urgent necessity, and irreparable injury.' },
  { placeholderId: 'concept-rule-65', type: 'concept', name: 'Rule 65 certiorari prerequisites', description: 'Grave abuse of discretion; no plain, speedy, adequate remedy; motion for reconsideration filed unless excepted. Strict at CA Special 5th Div.' },
  { placeholderId: 'concept-arbitration-enforcement', type: 'concept', name: 'Foreign arbitral award enforcement', description: 'Enforcement under NYC and ADR Act RA 9285. Public policy defense is the contested ground in most PH enforcement matters.' },
  { placeholderId: 'concept-structured-settlement', type: 'concept', name: 'Structured settlement', description: 'Settlement mixing monetary and non-monetary components (ongoing relationship, supply terms, license). Higher acceptance rate above PHP 50M.' },
  { placeholderId: 'concept-irreparable-injury', type: 'concept', name: 'Irreparable injury', description: 'Element of injunctive relief. Trend: courts increasingly require concrete evidence (market surveys, customer-loss data) rather than legal presumption.' },

  // ─── Precedents (12) ─────────────────────────────────────────────────────
  { placeholderId: 'precedent-daubert', type: 'precedent', name: 'Daubert v. Merrell Dow Pharmaceuticals, 509 U.S. 579 (1993)', description: 'US Supreme Court ruling setting reliability/qualification standard for expert testimony. Persuasive authority in PH practice.' },
  { placeholderId: 'precedent-frye', type: 'precedent', name: 'Frye v. United States, 293 F. 1013 (D.C. Cir. 1923)', description: 'Older "general acceptance" standard for expert testimony. Pre-Daubert; rarely cited in PH practice.' },
  { placeholderId: 'precedent-air-phil-pennswell', type: 'precedent', name: 'Air Philippines Corp. v. Pennswell, Inc., G.R. No. 172835 (Dec. 13, 2007)', description: 'PH SC trade-secret framework: secrecy + economic value + reasonable measures. Foundational citation in PH trade-secret matters.' },
  { placeholderId: 'precedent-marubeni-lirag', type: 'precedent', name: 'Marubeni Corp. v. Lirag Textile Mills', description: 'Contract interpretation precedent we have cited in post-acquisition warranty matters.' },
  { placeholderId: 'precedent-bpi-lifetime', type: 'precedent', name: 'BPI v. Lifetime Marketing', description: 'Commercial fraud and bank-record admissibility ruling we have cited in Helena Securities and earlier matters.' },
  { placeholderId: 'precedent-manila-mining', type: 'precedent', name: 'Manila Mining Corp. v. Globe Holdings', description: 'PH SC ruling on summary-judgment standard for contractual disputes; cited in our 2023 Skylark filings.' },
  { placeholderId: 'precedent-mercado-suarez', type: 'precedent', name: 'Mercado v. Suarez', description: 'PH SC opinion on Rule 65 prerequisites and the motion-for-reconsideration requirement.' },
  { placeholderId: 'precedent-republic-sandiganbayan', type: 'precedent', name: 'Republic v. Sandiganbayan', description: 'Generic citation for sufficiency-of-evidence and demurrer standards in civil proceedings.' },
  { placeholderId: 'precedent-asian-terminals', type: 'precedent', name: 'Asian Terminals v. CFC Logistics', description: 'PH SC ruling on relevant-market definition in shipping markets; cited in Coastal.' },
  { placeholderId: 'precedent-cci-northwest', type: 'precedent', name: 'Continental Carbon Industries v. Northwest Equity', description: 'Damages methodology ruling: court rejected DCF model with unsupported terminal growth. Cited in two of our Daubert-style challenges.' },
  { placeholderId: 'precedent-pacific-shipping', type: 'precedent', name: 'Pacific Shipping Alliance v. Coastal Logistics Co.', description: 'Court of Appeals ruling on the underlying restraint-of-trade theory in our Coastal matter; trial-court precedent for related disputes.' },
  { placeholderId: 'precedent-st-marys-carpitanos', type: 'precedent', name: 'St. Mary\'s Academy v. Carpitanos, G.R. No. 143363 (Feb. 6, 2002)', description: 'PH SC ruling cited for proximate-cause analysis; occasionally relevant in tort-overlap commercial matters.' },

  // ─── Statutes (14) ───────────────────────────────────────────────────────
  { placeholderId: 'statute-rule-33', type: 'statute', name: 'Rule 33, 1997 Rules of Civil Procedure', description: 'Demurrer to Evidence. Defense motion challenging the sufficiency of plaintiff\'s evidence after plaintiff rests.' },
  { placeholderId: 'statute-rule-35', type: 'statute', name: 'Rule 35, 1997 Rules of Civil Procedure', description: 'Summary Judgment. Disposition where pleadings, affidavits, and admissions show no genuine issue of material fact.' },
  { placeholderId: 'statute-rule-7', type: 'statute', name: 'Rule 7, 1997 Rules of Civil Procedure', description: 'Verification and certification against forum shopping. Common dismissal trigger for technical deficiencies.' },
  { placeholderId: 'statute-rule-65', type: 'statute', name: 'Rule 65, 1997 Rules of Civil Procedure', description: 'Certiorari, Prohibition, Mandamus. Special civil action for grave abuse of discretion correctable by appellate review.' },
  { placeholderId: 'statute-ja-rule', type: 'statute', name: 'Judicial Affidavit Rule (A.M. No. 12-8-8-SC)', description: 'Direct testimony by judicial affidavit. Strict scope rule: trial testimony cannot exceed declared topics.' },
  { placeholderId: 'statute-rules-evidence', type: 'statute', name: '2019 Revised Rules on Evidence (A.M. No. 19-08-15-SC)', description: 'Modernized rules including expanded expert-witness provisions broadly analogous to FRE 702/703.' },
  { placeholderId: 'statute-src', type: 'statute', name: 'Securities Regulation Code (RA 8799)', description: 'PH securities statute. §§ 26, 28 cover manipulative and deceptive practices; SRC § 63 governs private civil actions.' },
  { placeholderId: 'statute-pca', type: 'statute', name: 'Philippine Competition Act (RA 10667)', description: 'PH antitrust statute. §§ 14–15 prohibit anti-competitive agreements and abuse of dominance. PCC adjudication.' },
  { placeholderId: 'statute-ip-code', type: 'statute', name: 'Intellectual Property Code (RA 8293)', description: 'Comprehensive PH IP statute. §§ 168–169 cover unfair competition; trade-secret protection by case law overlay.' },
  { placeholderId: 'statute-adr-act', type: 'statute', name: 'Alternative Dispute Resolution Act (RA 9285)', description: 'Governs domestic and international arbitration in PH; implements New York Convention enforcement framework.' },
  { placeholderId: 'statute-nyc', type: 'statute', name: 'New York Convention on the Recognition and Enforcement of Foreign Arbitral Awards (1958)', description: 'Multilateral treaty for cross-border arbitral award enforcement. PH is a party; implementing framework via RA 9285.' },
  { placeholderId: 'statute-rule-3-sec-12', type: 'statute', name: 'Rule 3 § 12, 1997 Rules of Civil Procedure', description: 'Class suit requirements: common subject-matter interest, numerosity, adequate representation.' },
  { placeholderId: 'statute-rule-26-27', type: 'statute', name: 'Rules 26–27, 1997 Rules of Civil Procedure', description: 'Modes of discovery: requests for admission (Rule 26) and production of documents and things (Rule 27).' },
  { placeholderId: 'statute-labor-code-297', type: 'statute', name: 'Labor Code Article 297', description: 'Just causes for termination of employment. Relevant in trade-secret matters involving former employees.' },
];

// ─── Insights ────────────────────────────────────────────────────────────────
// Authored cluster-by-cluster. Cluster 1 (damages-expert cross-examination) is
// the MANDATORY demo-query target — 10 insights sharing Dr. Mei / Dr. Caldwell /
// Dr. Garcia across Helios / Helena / Coastal / Meridian, authored by multiple
// firm lawyers across the 3-year horizon.

export const INSIGHTS: readonly SeedInsight[] = [
  // ════════════════════════════════════════════════════════════════════════
  // CLUSTER 1 — DAMAGES EXPERT CROSS-EXAMINATION (MANDATORY DEMO QUERY)
  // ════════════════════════════════════════════════════════════════════════

  {
    placeholderId: 'insight-001',
    title: 'Cross-examining damages experts on counsel-supplied assumptions',
    body: `In a recent acquisition-related matter the opposing party retained a damages expert we have now seen across multiple cases. Her report supported a substantial lost-enterprise-value figure using a DCF model. The decisive vulnerability in deposition was assumption sourcing: every model input — growth rate, discount rate, comparable transaction set — was provided by opposing counsel rather than independently verified.

We walked the witness through each assumption on the stand and asked who calculated it. By the third assumption the credibility of the entire figure was compromised in front of the court. The court's eventual ruling cited the assumption-sourcing problem as a factor in reducing the credible damages range by approximately 60%.

This pattern has appeared in at least three of our matters with the same expert. We are maintaining a deposition prep kit specifically for cross-examining this category of damages methodology — see related insights on the Mei pattern across matters and on impeachment with the expert's own prior academic writing.

Tactical note: secure the expert's published scholarship in advance of deposition. The published expert in this category had prior work criticizing the exact assumption-sourcing approach they were now defending. Impeachment with the expert's own writing was decisive.`,
    summary:
      'Surface that DCF model inputs (growth, discount, comparables) came from counsel rather than independent verification. Pattern observed across 3 matters with the same expert; impeach with her own academic work.',
    classification: 'strategy',
    authorPlaceholderId: 'lawyer-ana-mendoza',
    about: ['concept-counsel-supplied-assumptions', 'concept-damages-cross'],
    mentions: ['witness-mei', 'concept-dcf', 'concept-lost-enterprise-value', 'firm-whitfield-mendez'],
    involves: ['matter-helios'],
    cites: ['precedent-daubert', 'precedent-cci-northwest'],
    createdAt: '2024-06-15T14:00:00Z',
    sourcePersonalNotePlaceholderId: 'note-042',
    metadata: { insight_category: 'expert_witness_cross_examination', cross_matter_pattern: true },
  },
  {
    placeholderId: 'insight-002',
    title: 'Daubert-style methodology challenge to damages experts in PH courts',
    body: `While PH courts do not formally adopt Daubert, the qualification-and-reliability principles are admissible as persuasive authority under the 2019 Revised Rules on Evidence. We have successfully run Daubert-style methodology challenges in two commercial damages cases.

The successful pattern: identify a specific methodological choice in the opposing expert's report that lacks support in any recognized professional standard. In Helena Securities we attacked a discount rate that the expert pulled from a single trade-publication article rather than from the AICPA practice aid or comparable peer-reviewed source. The court excluded the expert opinion on the damages-quantum portion, effectively cutting the claim by approximately 60%.

The motion cited Daubert and Continental Carbon Industries v. Northwest Equity. We framed the request not as importing US law but as articulating an evidentiary-reliability gate that the Rules on Evidence already authorizes the court to enforce.

For next time: identify the methodological vulnerability in the FIRST round of expert-report review. Late identification (after JA submission) materially weakens the motion because the court reads it as opportunistic. The expert pattern to watch for: discount rates or terminal growth rates supported by single citations rather than methodological consensus.`,
    summary:
      'PH courts will entertain Daubert-style methodology challenges as evidentiary-reliability gating. Win conditions: identify the specific methodological gap early, support with Continental Carbon or analogous authority.',
    classification: 'lesson_learned',
    authorPlaceholderId: 'lawyer-lourdes-villaroman',
    about: ['concept-daubert', 'concept-damages-cross'],
    mentions: ['concept-dcf', 'witness-mei', 'witness-garcia'],
    involves: ['matter-helena'],
    cites: ['precedent-daubert', 'precedent-cci-northwest', 'statute-rules-evidence'],
    createdAt: '2023-11-08T09:30:00Z',
    metadata: { insight_category: 'expert_witness_cross_examination' },
  },
  {
    placeholderId: 'insight-003',
    title: 'Three-step rebuttal expert strategy on damages',
    body: `When facing an opposing damages expert our most consistent rebuttal pattern has three steps. First, retain a competing expert using a different but equally recognized methodology — if the opposition uses DCF, we retain a comparable-transactions expert and vice versa. Methodological diversity by itself undermines the perceived certainty of either output.

Second, have the rebuttal expert prepare a side-by-side comparison showing how different but reasonable assumptions produce vastly different damages figures. The point is not to argue our number is right; it is to demonstrate that a "right number" does not exist in the way the opposing expert is presenting one.

Third, focus the rebuttal testimony on sensitivity analysis. Small, defensible changes in key inputs produce disproportionate changes in the damages output. Make the court see how brittle the opposing figure is.

In three consecutive matters this approach has measurably reduced the damages exposure. In Helios the trial court accepted the rebuttal's sensitivity table in its written order. In a 2023 matter the court rejected the opposing DCF entirely and adopted our comparable-transactions figure. In Helena the court declined to choose, but the spread between expert opinions opened a wide settlement range that closed favorably.`,
    summary:
      'Rebuttal pattern: competing methodology + assumption comparison + sensitivity analysis. Reliably reduces damages exposure across matters; courts have cited the sensitivity tables in written orders.',
    classification: 'strategy',
    authorPlaceholderId: 'lawyer-carlos-reyes',
    about: ['concept-damages-cross', 'concept-sensitivity-analysis'],
    mentions: ['witness-pugeda', 'concept-dcf', 'concept-comparable-transactions', 'witness-mei'],
    involves: ['matter-helios', 'matter-helena'],
    createdAt: '2024-09-22T11:15:00Z',
    metadata: { insight_category: 'expert_witness_cross_examination' },
  },
  {
    placeholderId: 'insight-004',
    title: 'Dr. Mei cross-matter pattern recognition',
    body: `The same damages expert has now appeared for the opposition in three of our commercial matters spanning roughly two and a half years. The pattern is consistent and exploitable.

Methodology: DCF for lost enterprise value. Forecast period typically 5–7 years; terminal growth rate consistently at the high end of the defensible range (4–5%); discount rate built from a single CAPM application without sensitivity disclosure.

Source of assumptions: invariably counsel-supplied. In all three matters the growth assumption was provided by retaining counsel rather than derived from independent market analysis. The "comparable transaction" set has been narrow (3–5 deals) and consistently composed of US/EU comparables with thin adjustments for PH market premium.

Vulnerability beyond methodology: she has a 2019 paper criticizing assumption-sourcing of exactly this kind. Impeachment with her own scholarship has worked in Helios deposition and was effective enough that opposing counsel did not call her at trial.

Operationally we are maintaining a deposition prep kit on her: prior reports we have obtained in discovery from other matters, her CV updates, her recent publication list, and a standard cross outline. Recommend any new matter where she appears for opposition pull from the kit as a starting point.`,
    summary:
      'Same damages expert has appeared opposing us in 3 matters using the same DCF/counsel-supplied-assumptions playbook. Firm maintains a prep kit; her own 2019 paper is the impeachment hook.',
    classification: 'observation',
    authorPlaceholderId: 'lawyer-ana-mendoza',
    about: ['concept-damages-cross'],
    mentions: ['witness-mei', 'concept-dcf', 'concept-counsel-supplied-assumptions', 'concept-comparable-transactions'],
    involves: ['matter-helios', 'matter-helena'],
    createdAt: '2024-08-03T16:45:00Z',
    metadata: { insight_category: 'expert_witness_cross_examination', expert_pattern_kit: true },
  },
  {
    placeholderId: 'insight-005',
    title: 'Foundation gaps in damages expert qualifications',
    body: `Before reaching methodology, attack qualification foundation. In PH practice expert testimony is bounded by the qualification declaration in the judicial affidavit; gaps between declared qualification and the specific opinion topic are a clean MIL target.

In Coastal Trade Dispute the opposing damages expert was qualified generally as a "financial analyst" but the specific opinion topic was lost profits in inter-island shipping. We filed a pre-trial motion in limine arguing the qualification declaration did not establish industry-specific competence. Judge Mendoza granted in part, limiting the expert to general damages methodology and excluding shipping-market-specific testimony.

The effect was significant. The opposing expert's lost-profits figure had been built on shipping-market assumptions that could no longer be expressed in his testimony. The remaining permissible scope produced a figure that was difficult for opposing counsel to anchor to the case theory.

Practice point: when opposing-expert qualification is general rather than specific to the matter's industry, raise the gap via MIL before the JA is submitted. Once the JA is in, Judge Lim and Judge Mendoza both apply the four-corners rule strictly; if the qualification statement is broad enough to cover the topic on its face, the gap argument is harder.`,
    summary:
      'Attack qualification foundation gaps via MIL before JA submission. Coastal: opposing expert qualified generally but topic was shipping-specific; Judge Mendoza limited scope, breaking the lost-profits theory.',
    classification: 'strategy',
    authorPlaceholderId: 'lawyer-miguel-ortega',
    about: ['concept-expert-qualification', 'concept-mil'],
    mentions: ['concept-ja-rule-scope', 'concept-damages-cross', 'judge-mendoza-f', 'judge-lim'],
    involves: ['matter-coastal'],
    cites: ['statute-ja-rule'],
    createdAt: '2023-04-12T10:00:00Z',
    metadata: { insight_category: 'expert_witness_cross_examination' },
  },
  {
    placeholderId: 'insight-006',
    title: 'Inconsistencies between expert report and deposition',
    body: `One of the highest-yield cross-examination targets is internal inconsistency: places where the expert's deposition testimony deviates from positions taken in the written report.

In Helena Securities the opposing damages expert testified at deposition that her chosen discount rate reflected current PH market conditions. The report, by contrast, listed a US 10-year Treasury rate as the risk-free component with no PH-market adjustment. We marked the inconsistency in deposition and reserved the impeachment for trial.

At trial, on cross, we walked her through both passages. The witness attempted to reconcile by characterizing the deposition answer as imprecise. The court noted the inconsistency in the written ruling and gave the damages opinion limited weight.

Operational practice: every prep session for damages-expert cross should include a side-by-side reading of the report and the deposition transcript. We maintain a template document (the "consistency table") that maps key methodological choices to report passages and deposition page-line cites. The table goes into the trial binder for impeachment-ready use.

Caveat: do not impeach on trivial inconsistencies. Save the impeachment for choices that are load-bearing on the damages output. Trivial impeachment lets the witness recover credibility.`,
    summary:
      'Build a consistency table mapping report passages to deposition pages. Reserve impeachment for load-bearing choices. Helena: discount-rate inconsistency reduced damages weight in written ruling.',
    classification: 'strategy',
    authorPlaceholderId: 'lawyer-rafael-estrada',
    about: ['concept-damages-cross'],
    mentions: ['concept-dcf', 'witness-mei'],
    involves: ['matter-helena'],
    createdAt: '2024-02-19T13:30:00Z',
    metadata: { insight_category: 'expert_witness_cross_examination' },
  },
  {
    placeholderId: 'insight-007',
    title: 'Motion in limine to exclude damages expert under JA Rule scope',
    body: `The Judicial Affidavit Rule is a sharper tool than counsel often recognize. Trial testimony of expert witnesses is bounded by the four corners of the judicial affidavit; any opinion topic not declared in the JA is objectionable.

In two of our matters we have used pre-trial MIL practice to narrow the opposing damages expert's permissible scope by surveying the JA against the matter's likely opinion topics, then filing to exclude any anticipated opinion outside the declared topics. This forces the opposition to either supplement the JA (which often opens new cross opportunities) or live with a narrower trial scope.

In Aurora Pharma the opposing expert had declared opinions on "market share and competitive effects" but had not declared opinions on "consumer welfare loss," which was the heart of the damages theory the opposition was previewing in pleadings. Our MIL was granted in full; the opposition supplemented the JA at the cost of a new round of deposition.

Judges Lim and Mendoza enforce the four-corners rule strictly and consistently. Judge Navarro is more permissive on minor extrapolations but will not allow a wholesale topic addition without supplementation. Map the JA against the opposition's case theory early.`,
    summary:
      'JA Rule four-corners scope is a sharper MIL tool than counsel realize. Survey opposing JA against likely opinion topics; file pre-trial to exclude undeclared opinions. Judges Lim and Mendoza enforce strictly.',
    classification: 'strategy',
    authorPlaceholderId: 'lawyer-miguel-ortega',
    about: ['concept-mil', 'concept-ja-rule-scope'],
    mentions: ['concept-damages-cross', 'judge-lim', 'judge-mendoza-f', 'judge-navarro'],
    involves: ['matter-aurora'],
    cites: ['statute-ja-rule'],
    createdAt: '2024-11-30T15:20:00Z',
    metadata: { insight_category: 'expert_witness_cross_examination' },
  },
  {
    placeholderId: 'insight-008',
    title: 'Lost enterprise value vs. lost profits — picking the right cross theme',
    body: `Damages experts often blur the distinction between lost enterprise value and lost profits in ways that are exploitable on cross. The two theories have different proof structures and different discount-rate requirements; conflating them is a methodological flag.

Lost enterprise value is a one-time valuation of the going-concern impact and is properly discounted to a single valuation date. Lost profits are a stream over a defined period and require period-specific discounting. An expert who applies a single discount rate to a multi-year lost-profits stream is making an error; one who applies a stream-discounting approach to what is really an enterprise-value claim is making the inverse error.

In Helios the opposing expert presented what she labeled "lost enterprise value" but the underlying computation was a five-year discounted profit stream. On cross we drew out the distinction and the testimony lost coherence. The court's written ruling singled out the conceptual confusion as a factor in declining to adopt the full damages figure.

Practice pattern: the second prep session for any damages cross should be dedicated to which theory the opposing expert is actually applying versus which they have labeled. They are often different.`,
    summary:
      'Lost enterprise value (single valuation date) and lost profits (stream) have different proof and discounting requirements. Opposing experts conflate them; the conflation is itself a methodological flag.',
    classification: 'strategy',
    authorPlaceholderId: 'lawyer-carlos-reyes',
    about: ['concept-lost-enterprise-value', 'concept-damages-cross'],
    mentions: ['concept-dcf', 'witness-mei'],
    involves: ['matter-helios'],
    createdAt: '2024-07-10T09:00:00Z',
    metadata: { insight_category: 'expert_witness_cross_examination' },
  },
  {
    placeholderId: 'insight-009',
    title: 'Pre-deposition discovery — getting the expert\'s academic record',
    body: `The single most under-used prep step for damages-expert depositions is a thorough pull of the expert's published academic and professional writing. Three depositions in the last two years have turned materially on what we found in the expert's own prior work.

What to pull, in order of yield: peer-reviewed articles in the expert's stated specialty; conference papers and white papers; expert reports the witness has authored in other matters (obtainable via prior counsel of record); the expert's textbook chapters or treatise contributions; and dissertations or thesis work where applicable.

In Helios we pulled a 2019 article in which the opposing expert criticized exactly the assumption-sourcing pattern she was defending in her report against us. The impeachment landed cleanly because the article was the witness's own work, not a third-party authority she could distance herself from.

Caveats. The pull takes 2–3 weeks for a thorough expert; budget the time. Some materials require fee-based database access (HeinOnline, ProQuest, SSRN); allocate the budget at retention. And do not over-impeach: pick the one or two passages that contradict load-bearing positions in the current report. Three or more impeachments dilute the effect.

Operational practice: pull-the-record is now a standard line item on our damages-expert prep checklist and should be commissioned within five business days of receiving the opposing expert's report.`,
    summary:
      'Pull the opposing damages expert\'s entire academic record — articles, conference papers, prior reports, dissertations. Three depositions in two years turned on the expert\'s own prior writing. Budget 2–3 weeks.',
    classification: 'lesson_learned',
    authorPlaceholderId: 'lawyer-ana-mendoza',
    about: ['concept-damages-cross', 'concept-expert-qualification'],
    mentions: ['witness-mei'],
    involves: ['matter-helios'],
    createdAt: '2024-06-25T14:30:00Z',
    metadata: { insight_category: 'expert_witness_cross_examination' },
  },
  {
    placeholderId: 'insight-010',
    title: 'Cross-examining on terminal growth rate — the Garcia pattern',
    body: `A specific opposing damages expert has a consistent terminal-growth-rate pattern that we now treat as a known cross target. He uses DCF with terminal growth rates 4–6 percentage points above the sector long-run average; the high rate drives the bulk of the enterprise-value figure.

Cross technique. First, walk the witness through the terminal-growth selection in his report: rate chosen, source of the rate, comparison to long-run sector averages. He typically cites a single trade-publication source rather than a recognized methodological treatise. Second, confront with the long-run sector growth data; the gap is usually so wide that the witness must either defend the gap on facts (rarely possible) or concede error. Third, run the DCF in cross with the long-run average substituted in. The enterprise-value figure typically collapses by 40–60%.

In the Skylark matter we did not deploy this technique despite seeing the pattern in the expert's report. The court ultimately adopted the inflated damages number on summary judgment. Skylark closed unfavorable in part because of this. Lesson recorded for the next matter where this expert appears.

Operational note: the Garcia pattern is now in the cross-prep kit for damages experts alongside the Mei pattern. Recommend any matter where either expert appears for opposition treat the kit as the first stop.`,
    summary:
      'Specific opposing expert uses DCF with terminal growth 4–6pp above sector average. Substituting the long-run average in cross collapses his EV figure by 40–60%. Skylark was lost in part because we didn\'t deploy.',
    classification: 'lesson_learned',
    authorPlaceholderId: 'lawyer-vincent-lao',
    about: ['concept-damages-cross', 'concept-dcf'],
    mentions: ['witness-garcia', 'concept-counsel-supplied-assumptions'],
    involves: ['matter-skylark'],
    createdAt: '2023-08-14T11:40:00Z',
    metadata: { insight_category: 'expert_witness_cross_examination', expert_pattern_kit: true },
  },

  // ════════════════════════════════════════════════════════════════════════
  // CLUSTER 2 — JUDGE BUENAVENTURA (RTC Makati Br. 147)
  // ════════════════════════════════════════════════════════════════════════

  {
    placeholderId: 'insight-011',
    title: 'Judge Buenaventura: 15-page motion limit strictly enforced',
    body: `Judge Maria Buenaventura of RTC Makati Br. 147 self-imposes a 15-page limit on motions (with replies capped at 7 pages). Filings over the limit are not formally rejected, but in five matters in the last two years counsel who exceeded the limit received unfavorable rulings on the first round, often with an order to re-file in conforming form.

The implication is not that she literally refuses to read over-length submissions; rather, she signals that prolixity is a marker of weak argument and rules accordingly. We treat the 15-page cap as a binding internal rule when drafting in her court.

Drafting impact. Brief discipline starts with a tight statement of relief and a single-sentence theory of the motion at the top. Cut all string citations (see related insight on her dislike of string cites). Cut redundant procedural recitations. Reserve detailed factual background for the supporting affidavits; the motion itself should reference rather than recite.

When the substance genuinely requires more than 15 pages, file a brief motion for leave to exceed page limits with a concrete justification (e.g., complex multi-party discovery). She has granted leave once in our experience and denied it twice; her bar for leave is high.

Operational note: associates drafting in Br. 147 should circulate to a senior reviewer specifically for length and structural discipline at least 48 hours before filing.`,
    summary:
      'Judge Buenaventura strictly enforces a 15-page motion limit (reply 7 pages) at RTC Makati Br. 147. Treat as a binding internal rule. Leave to exceed is granted rarely; she reads over-length filings as weak.',
    classification: 'observation',
    authorPlaceholderId: 'lawyer-diana-santos',
    about: ['concept-mil', 'concept-summary-judgment'],
    mentions: ['judge-buenaventura'],
    createdAt: '2023-02-10T08:45:00Z',
    metadata: { insight_category: 'judge_tendencies', judge: 'judge-buenaventura' },
  },
  {
    placeholderId: 'insight-012',
    title: 'Judge Buenaventura: no oral argument on MSJs — file paper-perfect',
    body: `Judge Buenaventura has, in the past 18 months, dismissed oral argument on motions for summary judgment in our matters at least four times. She prefers to rule on the papers. The implication is operational: every MSJ filed in her court must be paper-perfect, because there is no oral round to recover from a weak written submission.

Paper-perfect for Br. 147 means: a one-paragraph statement of relief at the top; numbered sub-issues, each disposed of in a self-contained section with its own affidavit citations; pinpoint citations to records and authorities (no parentheticals stacked beyond the first authority); and a clean conclusion that mirrors the requested relief.

In one matter in 2024 she ruled on the MSJ within four business days of the reply brief filing, without scheduling argument. Counsel was caught off-guard because they had planned an oral round to address weaknesses in their reply. We have since adjusted: the reply brief in her court must be the final word.

Cross-reference: file the reply brief early. She sometimes rules before the deadline if both parties have filed; the early-reply pattern is a separate insight.`,
    summary:
      'Br. 147 dispenses with oral argument on MSJs as a matter of practice. Treat the reply brief as the final word. Paper-perfect submission with tight structure and pinpoint cites is the operational baseline.',
    classification: 'strategy',
    authorPlaceholderId: 'lawyer-joaquin-tirona',
    about: ['concept-summary-judgment'],
    mentions: ['judge-buenaventura'],
    cites: ['statute-rule-35'],
    createdAt: '2024-03-22T10:15:00Z',
    metadata: { insight_category: 'judge_tendencies', judge: 'judge-buenaventura' },
  },
  {
    placeholderId: 'insight-013',
    title: 'Judge Buenaventura: file replies early — she rules before deadlines',
    body: `In three matters Judge Buenaventura has ruled on motions before the formal reply-brief deadline because both parties had filed. The pattern: where the moving party files on day 1 and the non-movant files within roughly half the allotted reply window, the court treats the matter as submitted and may rule without waiting out the calendar.

Practical implication. If we are the non-movant on a motion before her, do not wait until the last day. Filing roughly one to two business days after receiving the moving papers locks in the briefing schedule but does not force her hand; filing on day 3 or 4 of a 10-day window has, in our experience, accelerated ruling. The trade-off is preparation time, but the substantive risk of a late strong-reply being too late for a quick ruling is real.

If we are the movant, the inverse advice. Buy the time by filing the motion on a Friday with the deadline running into the next week; the calendar gives the non-movant a natural delay window.

Caveat: this pattern holds for routine motions and SJ briefing. For motions where she expects oral argument (rare; see the no-oral-MSJ insight) or where the matter is genuinely complex, she will set a status conference rather than rule sub-silentio.`,
    summary:
      'Br. 147 sometimes rules before the reply deadline if both parties have filed. As non-movant, reply early (days 3–4 of the window) when we have the better substance. As movant, file on Friday to lengthen the non-movant\'s calendar.',
    classification: 'strategy',
    authorPlaceholderId: 'lawyer-rafael-estrada',
    about: ['concept-summary-judgment'],
    mentions: ['judge-buenaventura'],
    createdAt: '2024-05-18T16:20:00Z',
    metadata: { insight_category: 'judge_tendencies', judge: 'judge-buenaventura' },
  },
  {
    placeholderId: 'insight-014',
    title: 'Judge Buenaventura: pinpoint citations, no string cites',
    body: `Judge Buenaventura\'s rulings in her own written orders contain almost no string citations. The drafting signal is clear: cite the single strongest authority for each proposition and stop. Three matters last year drew adverse rulings where our briefs included strings of three or more authorities for routine propositions; the rulings did not explicitly criticize the briefs but ruled against the proposition the strings supported.

We now treat one-citation-per-proposition as a Br. 147 drafting rule. Where the proposition genuinely requires multiple authorities (developing area of law, conflicting circuits, novel theory), we lead with the single strongest case, then in a separate sentence note the supporting authority chain. The structural separation reads better in her court than the comma-list format.

Practical drafting protocol. First pass: write the brief with whatever citation density the argument naturally requires. Second pass: for each proposition with two or more authorities, ask whether the secondary citations are doing real work. Most of the time they are not. Cut them or move them into footnotes (she tolerates footnote-citation chains better than in-line strings).

Cross-reference: the 15-page motion limit insight. Tight citation discipline is the single biggest length saver in her court.`,
    summary:
      'Br. 147 disfavors string citations in briefs. Lead with the single strongest authority; move supporting chain to footnotes if needed. One-citation-per-proposition is the working drafting rule.',
    classification: 'observation',
    authorPlaceholderId: 'lawyer-diana-santos',
    about: ['concept-mil'],
    mentions: ['judge-buenaventura'],
    createdAt: '2023-11-29T11:00:00Z',
    metadata: { insight_category: 'judge_tendencies', judge: 'judge-buenaventura' },
  },
  {
    placeholderId: 'insight-015',
    title: 'Judge Buenaventura: handling motions in limine — pre-trial or not at all',
    body: `Judge Buenaventura entertains motions in limine but only when filed within the pre-trial conference window. MILs raised by oral motion at trial-proper, or filed after the pre-trial order has been issued, are denied as a matter of practice unless the underlying ground arose post-pre-trial.

Pattern in our matters. Six MILs filed during the pre-trial window across the last two years; all were calendared and ruled on the merits, with four granted in full or part. Three MILs raised after the pre-trial order issued; all denied as untimely without merits discussion.

Drafting note. Her granted-MILs have all been narrowly scoped to specific evidence items or testimony topics. Broad MILs ("exclude all opinion testimony from witness X") have been denied more often than they have been granted; granular MILs ("exclude testimony from witness X on the consumer welfare calculation methodology described in JA paragraphs 17–22") have won.

Operational practice. Pre-trial brief-writing for Br. 147 matters should include a dedicated MIL drafting session no later than two weeks before the pre-trial conference. Identify the 2–4 strongest exclusion grounds; do not run a long list. Pair each MIL with a tight affidavit foundation.

Connects to the JA Rule scope MIL practice — Br. 147 enforces the four-corners rule and is receptive to JA-scope MILs filed in the pre-trial window.`,
    summary:
      'Br. 147 MILs must be filed in the pre-trial window. Late MILs are denied without merits review. Narrow, granular MILs win at materially higher rates than broad evidentiary exclusion requests.',
    classification: 'strategy',
    authorPlaceholderId: 'lawyer-ana-mendoza',
    about: ['concept-mil'],
    mentions: ['judge-buenaventura', 'concept-ja-rule-scope'],
    cites: ['statute-ja-rule'],
    createdAt: '2024-10-14T13:50:00Z',
    metadata: { insight_category: 'judge_tendencies', judge: 'judge-buenaventura' },
  },

  // ════════════════════════════════════════════════════════════════════════
  // CLUSTER 3 — VILLANUEVA & ASSOCIATES (OPPOSING COUNSEL PATTERN)
  // ════════════════════════════════════════════════════════════════════════

  {
    placeholderId: 'insight-016',
    title: 'Villanueva & Associates: late document dumps before hearings',
    body: `Villanueva & Associates has produced voluminous supplemental document disclosures 48–72 hours before critical hearings in at least four matters against the firm. The pattern is consistent enough that we now treat it as predictable rather than situational. The disclosures often contain documents nominally responsive to discovery requests served months earlier; the late timing has the practical effect of overwhelming our review window.

Counter-strategy. First, a motion to strike or limit use of the late-produced documents at the hearing, citing prejudice. Second, alternatively, a motion for continuance of the hearing of sufficient duration to permit meaningful review. Third, on the substantive merits, mark the late-disclosed documents in opposition as a circumstantial indicator of bad-faith discovery and request the court to draw an adverse inference.

In two matters Judge Buenaventura granted continuances on this ground. In one matter Judge Cruz declined to strike but credited the prejudice argument in declining to give weight to the late-disclosed documents. In one matter the court took no action; the result was unfavorable to our client and the late documents materially shaped the ruling.

Operational practice. In any matter against V&A, treat the 72-hour window before each significant hearing as a "high alert" period. Have a 2–3 lawyer review team on standby; anticipate the dump.`,
    summary:
      'V&A predictably dumps documents 48–72h before hearings. Counter with motion to strike, motion to continue, or adverse-inference framing. Judge Buenaventura grants continuances on this ground; Judge Cruz credits the prejudice argument.',
    classification: 'strategy',
    authorPlaceholderId: 'lawyer-diana-santos',
    about: ['concept-late-doc-disclosure'],
    mentions: ['firm-villanueva', 'judge-buenaventura', 'judge-cruz'],
    concerns: ['firm-villanueva'],
    createdAt: '2023-06-20T09:30:00Z',
    metadata: { insight_category: 'opposing_counsel_patterns', firm: 'firm-villanueva' },
  },
  {
    placeholderId: 'insight-017',
    title: 'Villanueva & Associates: aggressive discovery sanction motions',
    body: `Villanueva files for discovery sanctions earlier and more aggressively than typical commercial-litigation counsel. We have seen sanctions motions filed against us in three matters within 60 days of discovery commencement, in each case on grounds that, on review, were thin: alleged non-compliance with requests that the served-on party had in fact partially answered or had timely objected to.

The pattern reads as a pressure tactic. Even when the sanctions motion is denied, the briefing cycle consumes 2–3 weeks of associate time and pushes our client into a defensive posture.

Counter-pattern. Front-load discovery compliance documentation. Every response sent to V&A should be accompanied by a one-page transmittal noting (a) the specific request being answered, (b) any objection raised and the basis, (c) the page count or document count produced, and (d) a deadline-by-deadline calendar of remaining production. Maintain the transmittals in a discovery-compliance binder. When V&A files for sanctions, the binder produces a ready-made evidentiary appendix that materially shortens the response brief.

In two of three matters this approach reduced our response time from 14 to 5 business days. In the third, the sanctions motion was withdrawn after V&A received our binder citation in informal counsel correspondence.`,
    summary:
      'V&A files thin discovery-sanctions motions as a pressure tactic. Counter: front-load compliance documentation in a transmittal-and-binder discipline. In two matters this cut response time from 14 to 5 days; in one, V&A withdrew.',
    classification: 'strategy',
    authorPlaceholderId: 'lawyer-beatrice-sevilla',
    about: ['concept-late-doc-disclosure'],
    mentions: ['firm-villanueva'],
    concerns: ['firm-villanueva'],
    cites: ['statute-rule-26-27'],
    createdAt: '2024-01-15T14:00:00Z',
    metadata: { insight_category: 'opposing_counsel_patterns', firm: 'firm-villanueva' },
  },
  {
    placeholderId: 'insight-018',
    title: 'Villanueva & Associates: voluminous pleadings — read the executive summary',
    body: `V&A pleadings are consistently long — opening complaints regularly exceed 80 pages and motions exceed 30. The volume is structural, not substantive; the operative arguments and prayed-for relief are typically findable in the first 5–8 pages and the conclusion. The middle is filler: extended factual recitations, parallel theory pleadings, and string-cited boilerplate.

Reviewing practice for our team. First read: pages 1–8 and the conclusion. Second read: identify the load-bearing factual allegations and theory statements. Skip the middle on first pass. Often we can produce a working response outline from the first read alone.

In the rare matter where the middle of a V&A pleading contains a load-bearing argument, it is usually buried in a section heading that does not match the standard pleading conventions. Look for unusual section titles; they sometimes carry the actual surprise.

Caveat: this approach is for response-prioritization, not for sign-off. Final response drafts should reflect a full read. But for triage and resource allocation, the first-and-last technique has been reliable over four matters.

Operational note: any first-year associate handling a V&A pleading for the first time should be briefed on this reading order. Otherwise they will spend two days reading the middle and produce a less useful response.`,
    summary:
      'V&A pleadings are volume-padded; operative arguments live in the first 5–8 pages and the conclusion. Triage on first-and-last reading; brief new associates on the pattern before they spend days reading the filler.',
    classification: 'observation',
    authorPlaceholderId: 'lawyer-sophia-recto',
    about: ['concept-mil'],
    mentions: ['firm-villanueva'],
    concerns: ['firm-villanueva'],
    createdAt: '2024-09-05T15:30:00Z',
    metadata: { insight_category: 'opposing_counsel_patterns', firm: 'firm-villanueva' },
  },
  {
    placeholderId: 'insight-019',
    title: 'Settlement timing against Villanueva & Associates',
    body: `V&A is not a fast settler. Initial settlement offers from them have been below 25% of the demand in every matter we have tracked, including matters where their underlying liability exposure was acknowledged in their own correspondence. Meaningful settlement movement (to 50%+ of demand) has consistently required either an adverse interlocutory ruling against their client or the completion of significant discovery establishing the merits.

The implication is that settlement leverage in V&A matters is built almost entirely through litigation milestones rather than negotiation. We do not invest associate time in early-stage settlement correspondence with them; the time is better spent advancing the procedural posture.

In two matters the inflection point was the denial of their motion to dismiss. Within 30 days of the denial, V&A came back with an offer at roughly 55% of demand, where their pre-denial offer had been at 20%. The pattern is consistent enough to plan around.

Cross-reference: the settlement-leverage-after-favorable-rulings insight. The pattern of leverage spikes is general; the V&A-specific quirk is the very low starting position and the requirement of a litigation milestone to move it.`,
    summary:
      'V&A starts at <25% of demand and moves only after adverse interlocutories. Don\'t invest associate time in early settlement correspondence; build leverage through litigation milestones instead.',
    classification: 'strategy',
    authorPlaceholderId: 'lawyer-carlos-reyes',
    about: ['concept-structured-settlement'],
    mentions: ['firm-villanueva'],
    concerns: ['firm-villanueva'],
    createdAt: '2024-04-08T10:45:00Z',
    metadata: { insight_category: 'opposing_counsel_patterns', firm: 'firm-villanueva' },
  },
  {
    placeholderId: 'insight-020',
    title: 'Villanueva & Associates: formal-channels-only communications',
    body: `V&A counsel does not engage on informal counsel-to-counsel calls or emails. Every substantive exchange must occur on the formal record (letters, formal correspondence, court filings). This is consistent across the senior team there and appears to be a firm policy.

Implications. First, do not budget time for the informal scheduling and stipulation calls that work with most opposing counsel. Routine procedural adjustments (extension stipulations, deposition scheduling) all go through formal letter exchange and add 3–5 business days to any timeline. Second, do not include sensitive case-strategy content in counsel-to-counsel letters with them, because everything is treated as quoteable in subsequent filings.

In one matter early in our relationship with V&A we sent a routine extension request by email; their response was a formal letter quoting our email and characterizing the request as evidence of preparation difficulties. The episode was minor but established the rule we now follow: every written communication to V&A must read as a filing draft.

Operational note. In any matter against V&A, build an additional week into procedural timelines specifically to accommodate the formal-correspondence cycle. Use formal letters for everything, even routine matters. Treat every letter as quotable.`,
    summary:
      'V&A insists on formal-correspondence-only communications. Build a week into procedural timelines; treat every letter as quotable in filings. Don\'t send routine emails — they get quoted back.',
    classification: 'observation',
    authorPlaceholderId: 'lawyer-diana-santos',
    mentions: ['firm-villanueva'],
    concerns: ['firm-villanueva'],
    createdAt: '2023-09-12T08:00:00Z',
    metadata: { insight_category: 'opposing_counsel_patterns', firm: 'firm-villanueva' },
  },

  // ════════════════════════════════════════════════════════════════════════
  // CLUSTER 4 — TRADE SECRETS / SUMMARY JUDGMENT DOCTRINE (Banyan / Tessera)
  // ════════════════════════════════════════════════════════════════════════

  {
    placeholderId: 'insight-021',
    title: 'Summary judgment in trade-secret matters: declaration density wins',
    body: `In trade-secret matters our summary judgment grant rate correlates more strongly with affidavit density than with any other variable. Of seven SJ motions filed in trade-secret matters over the last three years, the five supported by 4+ detailed affidavits from technical and custodial witnesses were granted in full or substantially in part. The two relying primarily on documentary evidence were denied.

The judges treat the declarations as doing the work the IP Code does not: bridging the gap between abstract trade-secret elements and matter-specific facts. Air Philippines v. Pennswell sets the elements (secrecy + economic value + reasonable measures + misappropriation), but the elements are factual rather than legal, and trial courts want lay and technical witnesses to attest to each rather than infer them from documents.

Practical drafting. For each Pennswell element, identify the strongest custodian or technical witness and draft a focused affidavit (3–5 pages, no longer). Cross-reference paragraphs of the affidavits to the elements in the motion brief itself ("Element of secrecy is established by paragraphs 4–7 of the Lopez affidavit and paragraphs 11–14 of the Kwon affidavit"). This explicit mapping is what we have seen the granting orders cite back to.

Banyan SJ motion follows this template. Tessera counter-claim is also being prepared on the same model.`,
    summary:
      'SJ in trade-secret matters: rely on 4+ focused affidavits, one per Pennswell element, with explicit element-to-paragraph mapping in the brief. Affidavit density beats documentary density.',
    classification: 'lesson_learned',
    authorPlaceholderId: 'lawyer-felix-domingo',
    about: ['concept-summary-judgment', 'concept-trade-secret'],
    mentions: ['witness-kwon', 'precedent-air-phil-pennswell'],
    involves: ['matter-banyan', 'matter-tessera'],
    cites: ['statute-rule-35', 'statute-ip-code'],
    createdAt: '2024-07-28T15:00:00Z',
    metadata: { insight_category: 'trade_secrets' },
  },
  {
    placeholderId: 'insight-022',
    title: 'Pennswell as pleading template for trade-secret complaints',
    body: `Air Philippines v. Pennswell remains the operative PH Supreme Court framework for trade-secret claims. We now use it as an explicit pleading template: the complaint's substantive allegations are organized under the Pennswell elements, with each element receiving its own numbered section.

This structural choice has paid off in motion practice. In Banyan the opposing motion to dismiss attacked the complaint on insufficient-pleading grounds; the Pennswell-structured complaint allowed us to point the court directly to the paragraphs satisfying each element. The motion was denied with a written ruling that effectively endorsed the structural approach.

The risk to manage: do not let the Pennswell structure read as a checklist exercise. Each element section must contain matter-specific factual detail, not paraphrased recitations. The reasonable-measures element in particular requires granular allegations (specific security policies, NDA execution dates, access-control configurations) that vague pleading will not satisfy.

Where Pennswell falls short: it does not address damages quantum or remedy specifics. For those, supplement with IP Code §§ 168–169 framing and recent CA-level damages-quantification rulings. The Manila Mining ruling is one we have cited in Banyan for the lost-licensing-revenue theory.

Operational note: associates drafting trade-secret complaints in this practice should use the firm Pennswell template (in DM Files, owner Karen Bautista) rather than re-deriving the structure.`,
    summary:
      'Use Pennswell as a pleading-structure template — each substantive section maps to an element. Pair with IP Code §§168–169 for damages framing. Firm Pennswell template lives with Karen Bautista.',
    classification: 'strategy',
    authorPlaceholderId: 'lawyer-karen-bautista',
    about: ['concept-trade-secret'],
    mentions: ['precedent-air-phil-pennswell', 'precedent-manila-mining'],
    involves: ['matter-banyan'],
    cites: ['statute-ip-code', 'precedent-air-phil-pennswell'],
    createdAt: '2023-10-04T11:30:00Z',
    metadata: { insight_category: 'trade_secrets' },
  },
  {
    placeholderId: 'insight-023',
    title: 'Trade secret identification specificity — what survives SJ',
    body: `The single biggest reason trade-secret cases lose at the SJ stage is generic identification of the trade secrets at issue. Courts will deny SJ (in either direction) when the complaining party cannot identify what it claims with the specificity required to test the secrecy and misappropriation elements.

What works. Specify the trade secrets at the level of named files, named algorithms, or named customer lists with date ranges and source-of-record. "The customer pricing matrix in file [X] as of [date], stored in [system]" survives. "Our customer pricing information" does not.

What does not work. Bracket categories ("manufacturing processes," "business strategies"); references to documents not identified individually; references to "know-how" without specification.

In Banyan we drafted the complaint with the file-level specificity standard from the start. Opposition's motion to dismiss attempted to argue insufficient identification; the court rejected the argument and the SJ posture is now strong.

For SJ purposes specifically, the identification must align across the complaint, discovery responses, and supporting affidavits. Any inconsistency between these is exploited heavily on the opposition side. Maintain a single trade-secret identification table from complaint drafting through SJ briefing; update it once, propagate everywhere.`,
    summary:
      'Trade-secret identification must be file-and-date specific from the complaint forward. Maintain a single identification table; propagate the same language across complaint, discovery responses, and SJ affidavits.',
    classification: 'lesson_learned',
    authorPlaceholderId: 'lawyer-felix-domingo',
    about: ['concept-trade-secret', 'concept-summary-judgment'],
    mentions: ['precedent-air-phil-pennswell', 'witness-kwon'],
    involves: ['matter-banyan'],
    cites: ['statute-ip-code'],
    createdAt: '2024-02-08T10:20:00Z',
    metadata: { insight_category: 'trade_secrets' },
  },
  {
    placeholderId: 'insight-024',
    title: 'Reasonable measures element: custodian declarations are decisive',
    body: `The reasonable-measures element of Pennswell is the element most often contested at SJ. The vulnerability is that "reasonable" is relative to the matter context, and an abstract recitation of policies does not prove reasonableness for any particular trade secret.

Decisive evidence in our practice has been declarations from custodians who actually administered the protective measures. The IT security manager who explains how the access-control system was configured for the specific files; the HR officer who explains how NDA signing was documented for new hires in the relevant period; the records custodian who explains physical-document handling protocols.

In Banyan the SJ affidavit set includes three custodian declarations totaling about 12 pages, each describing the relevant measure in the present-tense voice of someone who operated the control. This is materially more persuasive than the alternative pattern (which we used in an earlier trade-secret matter and lost on this element): a single corporate-counsel affidavit summarizing the protective regime in legal-conclusion form.

Practical pattern. At case opening, identify the three custodian categories (IT/access, HR/policy, records). Schedule witness interviews early. Draft declarations in the witness's own voice, not in legal-conclusion form. Element wins are built operationally, not rhetorically.`,
    summary:
      'Reasonable-measures element wins on custodian declarations (IT/HR/records), not corporate-counsel affidavits. Identify the three custodian categories at case open; draft declarations in the witness\'s own voice.',
    classification: 'strategy',
    authorPlaceholderId: 'lawyer-karen-bautista',
    about: ['concept-trade-secret'],
    mentions: ['precedent-air-phil-pennswell', 'witness-kwon'],
    involves: ['matter-banyan'],
    cites: ['statute-ip-code'],
    createdAt: '2024-05-22T09:15:00Z',
    metadata: { insight_category: 'trade_secrets' },
  },
  {
    placeholderId: 'insight-025',
    title: 'Misappropriation by former employee — temporal proximity evidence',
    body: `In trade-secret matters involving a former employee defendant, temporal proximity between separation and the alleged misappropriation acts is the most persuasive form of circumstantial evidence on the misappropriation element. Direct evidence (e.g., the former employee admitting copying) is rare; courts have shown they will infer misappropriation from a tight time window between access and use.

What "tight" means in our experience. Less than 90 days between separation and the defendant's market entry or product launch in the relevant area. Less than 60 days between separation and a customer-list-aligned solicitation pattern. Document log entries showing bulk file access in the final two weeks of employment.

In Banyan the temporal record was tight on multiple dimensions: bulk access two weeks before departure, market entry by the new employer four months later but at exactly the customer set the defendant had managed, and at a pricing structure within 5% of our client's proprietary pricing matrix. The combination satisfied the court at the motion-to-dismiss stage on misappropriation.

Operational practice. In every former-employee trade-secret matter, the first discovery production request should be the defendant's access logs for the final 90 days of employment, plus the new employer's first 180 days of customer engagements. The matched timelines are the case theory.

Cross-reference: Labor Code Article 297 framing where the employer can also frame separation as a "just cause" — but that posture has trade-offs in trade-secret cases.`,
    summary:
      'Misappropriation rarely has direct evidence; courts infer from tight temporal proximity (≤90 days separation-to-market-entry). First discovery production: defendant access logs (final 90 days) + new employer customer engagements (first 180 days).',
    classification: 'observation',
    authorPlaceholderId: 'lawyer-felix-domingo',
    about: ['concept-trade-secret'],
    mentions: ['precedent-air-phil-pennswell'],
    involves: ['matter-banyan', 'matter-tessera'],
    cites: ['statute-ip-code', 'statute-labor-code-297'],
    createdAt: '2024-09-18T14:00:00Z',
    metadata: { insight_category: 'trade_secrets' },
  },

  // ════════════════════════════════════════════════════════════════════════
  // CLUSTER 5 — SETTLEMENT DYNAMICS
  // ════════════════════════════════════════════════════════════════════════

  {
    placeholderId: 'insight-026',
    title: 'Early mediation produces better outcomes in construction disputes',
    body: `Construction disputes settled at materially better terms when referred to mediation within the first six months of filing. Across seven construction-matter mediations in the last three years, the four referred early settled at terms averaging 35% closer to our client's reserve number than the three referred after 6 months.

The mechanism appears to be cost-and-position hardening. After six months, both sides have invested associate and partner time in pleadings, discovery, and motion practice; positions calcify and the perceived cost of compromise rises. Before six months, business considerations still anchor the negotiation more than litigation-sunk-cost considerations.

In Pinnacle Real Estate we referred at four months in. The mediator-assisted negotiation produced a settlement within two months of referral, with the principal payment landing roughly at our client's middle scenario. Cost saving relative to the projected trial track: approximately PHP 6M in fees and 18 months of management attention.

Practical implication. In construction matters specifically, brief the client at intake on the early-mediation pattern. Build mediation referral into the first-six-months case plan as the presumptive path; require explicit reasons to deviate. The reverse posture (litigate first, mediate later) is the wrong default for this matter type.

This pattern does not generalize fully. In matters where liability is contested rather than quantum-only, early mediation can lock in unfavorable framing. The pattern is most reliable in mixed-quantum-and-liability matters with clear contractual frameworks (construction, dealership, supply).`,
    summary:
      'Construction matters mediated within 6 months settle ~35% closer to reserve than later-mediated matters. Build early mediation into the intake case plan as the default; require reasons to deviate.',
    classification: 'lesson_learned',
    authorPlaceholderId: 'lawyer-patricia-yusay',
    about: ['concept-court-annexed-mediation'],
    mentions: ['judge-santos-art'],
    involves: ['matter-pinnacle'],
    cites: ['statute-adr-act'],
    createdAt: '2023-12-14T13:00:00Z',
    metadata: { insight_category: 'settlement_dynamics' },
  },
  {
    placeholderId: 'insight-027',
    title: 'Settlement leverage spikes after favorable interlocutory rulings',
    body: `Across our matters, settlement offers made within one week of a favorable interlocutory ruling — denial of a motion to dismiss, grant of a preliminary injunction, denial of opposing party's MSJ — have produced terms 25–40% better than offers made in the two weeks before the same ruling.

The leverage window is narrow. By two weeks after the ruling, opposing counsel has explained the ruling to the client as a procedural setback rather than a substantive defeat, and the psychological impact dissipates. The action must happen in the first 5–10 business days.

Operational implication. Every time we obtain a favorable interlocutory, the same-day partner conversation should include "should we move on settlement this week." This is not always the right answer (some rulings need consolidation through subsequent motions before extracting full leverage), but the question must be asked.

In Helios the preliminary-injunction ruling produced a window in which opposing counsel signaled openness to a structured resolution. We did not move within the window because of a competing scheduling priority, and the opening closed. The lesson is operational: assign a partner-level "settlement window watcher" on every active matter, with explicit authority to move quickly.

Cross-reference: settlement timing against Villanueva specifically — same general pattern but with a much lower starting position; need an adverse interlocutory before V&A will move at all.`,
    summary:
      'Settlement offers in the 5–10 business days after a favorable interlocutory produce 25–40% better terms than offers two weeks later. Operationalize: every favorable ruling triggers a same-day "should we move" partner conversation.',
    classification: 'strategy',
    authorPlaceholderId: 'lawyer-carlos-reyes',
    about: ['concept-structured-settlement'],
    mentions: ['firm-villanueva'],
    involves: ['matter-helios'],
    createdAt: '2024-01-30T08:45:00Z',
    metadata: { insight_category: 'settlement_dynamics' },
  },
  {
    placeholderId: 'insight-028',
    title: 'Structured settlements: mixing monetary and non-monetary components above PHP 50M',
    body: `For claims exceeding PHP 50M, settlement proposals that include non-monetary components have been accepted at materially higher rates than pure-monetary equivalents. Across nine high-value matters in the last three years, structured proposals (monetary + business-relationship terms) were accepted at roughly twice the rate of equivalent monetary-only proposals.

The mechanism is asymmetric value. Non-monetary components — continued supply relationships, licensing arrangements, mutual NDA, defined cooperation on third-party claims — often have value to the receiving party that exceeds their cost to the paying party. The structured proposal turns a zero-sum monetary negotiation into a positive-sum exchange.

Components that have worked well in our matters. Multi-year supply or service agreements at agreed terms; reciprocal license to specified IP; mutual non-disparagement (real teeth, not boilerplate); pre-agreed mediation for future disputes between the parties; cooperative defense agreements where the parties face common third-party exposure.

Components that have not worked. Pure non-disclosure provisions (no value, just constraint); informal cooperation language without metrics (unenforceable); equity exchanges (PH tax and corporate-approval friction usually kills these).

Drafting note. Structured-settlement term sheets should be drafted by the deal team, not the litigation team. Lit teams write defensively; deal teams write for performance. The Helios settlement framework draft was deal-team-led; the resulting document was substantially more usable than our litigation team's first pass.`,
    summary:
      'Above PHP 50M, structured proposals (monetary + supply / licensing / cooperative-defense terms) get accepted at ~2x the rate of pure-monetary. Have the deal team draft structured term sheets, not the litigation team.',
    classification: 'strategy',
    authorPlaceholderId: 'lawyer-carlos-reyes',
    about: ['concept-structured-settlement'],
    mentions: [],
    involves: ['matter-helios'],
    createdAt: '2024-04-30T12:00:00Z',
    metadata: { insight_category: 'settlement_dynamics' },
  },
  {
    placeholderId: 'insight-029',
    title: 'Court-annexed mediation: behavioral patterns of common mediators',
    body: `Court-annexed mediation outcomes in Makati and Pasig RTC matters vary materially by the assigned mediator. We track this informally; the patterns are reliable enough to factor into strategy.

The mediators who push hardest for a numerical figure in the first session ("split the gap" facilitators) tend to produce settlements at lower discounts to demand for our clients when we are plaintiff-side, but higher discounts when we are defense-side. The mediators who run extended caucuses and probe each side's underlying interests ("interest-based" facilitators) produce settlements more reflective of our reserve scenario on either side.

Implications for matter preparation. When we know the assigned mediator and they are split-the-gap, prepare a more aggressive opening anchor and brief the client to expect a quick-figure outcome. When we know they are interest-based, prepare a fuller business-interest narrative and allocate 2–3 sessions rather than 1.

Judge Santos, who refers heavily to court-annexed mediation, has favored mediators on the interest-based end of the spectrum. Judge Buenaventura refers less frequently and tends to assign split-the-gap mediators. Adjust expected sessions and preparation accordingly.

Operational note: we maintain an informal mediator-pattern table in the matter intake kit. It is not formal firm knowledge — it is observational and should be treated as such — but it materially helps mediation preparation. Update it after every mediation a partner attends.`,
    summary:
      'Mediator style (split-the-gap vs. interest-based) materially shapes outcomes. Judge Santos assigns interest-based; Judge Buenaventura assigns split-the-gap. Maintain the informal mediator-pattern table; update after each mediation.',
    classification: 'observation',
    authorPlaceholderId: 'lawyer-diana-santos',
    about: ['concept-court-annexed-mediation'],
    mentions: ['judge-santos-art', 'judge-buenaventura'],
    cites: ['statute-adr-act'],
    createdAt: '2023-07-25T16:00:00Z',
    metadata: { insight_category: 'settlement_dynamics' },
  },
  {
    placeholderId: 'insight-030',
    title: 'Lead negotiator should not be the trial-strategy partner',
    body: `Settlement outcomes in our matters have been measurably better when the lead negotiator is a partner other than the one running trial strategy. The principle is that the trial-strategy partner is psychologically anchored to the litigation theory of the case; the negotiation requires anchoring to the client's business objectives, which are usually broader.

In four matters in the last two years we used this two-partner structure deliberately. The trial-strategy partner remained the primary court-facing counsel; a second partner (often the M&A or transactional partner who knows the client commercially) led the settlement conversations. Outcomes were measurably more aligned with client business objectives than in matters where the same partner did both.

In Helios this structure has been in place since intake (Carlos Reyes on litigation, Lourdes Villaroman shadow on commercial framing). The client's commercial team has explicitly cited the dual-partner structure as helpful.

There are matters where the two-partner structure is overkill (small-dollar disputes, clear-quantum debt collection). The threshold we now use is roughly PHP 30M in disputed exposure or significant ongoing commercial relationship value at stake.

Cross-reference: the structured-settlement insight. The same principle drives why deal-team drafting beats lit-team drafting for term sheets.`,
    summary:
      'Settlement outcomes improve when the lead negotiator is a different partner from the trial-strategy partner. Threshold: ~PHP 30M exposure or significant commercial-relationship stake. In Helios, this structure was in place from intake.',
    classification: 'lesson_learned',
    authorPlaceholderId: 'lawyer-carlos-reyes',
    about: ['concept-structured-settlement'],
    mentions: ['lawyer-lourdes-villaroman'],
    involves: ['matter-helios'],
    createdAt: '2024-08-20T11:30:00Z',
    metadata: { insight_category: 'settlement_dynamics' },
  },

  // ════════════════════════════════════════════════════════════════════════
  // CLUSTER 6 — PROCEDURAL / LOCAL RULES
  // ════════════════════════════════════════════════════════════════════════

  {
    placeholderId: 'insight-031',
    title: 'Verified pleadings — the deficiencies that cause dismissals',
    body: `Verification and certification-against-forum-shopping defects remain the most common cause of dismissal-without-prejudice in our practice. Five matters in the last three years dismissed at the threshold on Rule 7 deficiencies. Each was correctable on re-filing, but the time cost (60–120 days lost) was substantial.

The recurring pitfalls. First, the verification must affirmatively state that the affiant has read the pleading and that the allegations are true and correct of personal knowledge or based on authentic records. Generic verification language that omits one of these is dismissed. Second, the certification against forum shopping must be executed by the party (the natural person, or for corporate parties an authorized representative with documented authority), not by counsel. Third, for corporate plaintiffs a board resolution or secretary's certificate authorizing the signatory must be attached. Missing the board resolution is the single most common Rule 7 dismissal trigger in our matters.

Operational practice. Every complaint draft is reviewed against a Rule 7 checklist before filing. The checklist is owned by the litigation support team and lives in the firm template repository. New associates should not draft verification or certification language from scratch; pull from the template every time.

The dismissal-without-prejudice cost is hidden but real: 3–4 months of timeline slip, client confidence dent, and occasionally a substantive disadvantage if the underlying claim involves a prescriptive period.`,
    summary:
      'Rule 7 defects (verification language, party-signed certification, missing board resolution) are the most common dismissal trigger. Use the firm template checklist; never draft from scratch. Cost of dismissal: 60–120 days.',
    classification: 'lesson_learned',
    authorPlaceholderId: 'lawyer-diana-santos',
    about: ['concept-mil'],
    mentions: [],
    cites: ['statute-rule-7'],
    createdAt: '2023-03-18T10:00:00Z',
    metadata: { insight_category: 'procedural' },
  },
  {
    placeholderId: 'insight-032',
    title: 'Metro Manila RTC branches: courtesy copies to clerks of court',
    body: `Several Metro Manila RTC branches have adopted informal courtesy-copy practices that materially affect scheduling. Branches 12, 28, and 42 (and at least three others we have observed) expect counsel to send courtesy copies of all motions to the branch clerk of court by email at least two business days before the scheduled hearing date.

Non-compliance does not result in formal sanctions. But counsel who comply receive more favorable scheduling treatment: their motions are more likely to be heard on the scheduled date rather than reset, and clerks raise scheduling conflicts proactively rather than letting them surface at the hearing.

We treat the practice as effectively required for our active matters in those branches. Every motion-filing checklist in those branches includes a "courtesy email to clerk" step with the clerk's known email address (maintained in the firm directory; assigned to Diana Santos for currency).

Caveat. The courtesy-copy expectation varies by branch and sometimes by judge. The branches above are reliable as of last quarter; we re-verify with a quick call before the first filing in any branch we have not appeared in recently. The status of the practice changes when judges rotate.

For new branches we appear in, ask the courtroom staff at the first hearing; they will tell counsel openly. We have never been refused this information.`,
    summary:
      'Metro Manila RTC branches (12, 28, 42 and others) expect courtesy email copies of motions to the clerk 2 business days before hearing. Not sanctioned, but materially shapes scheduling. Verify by quick courtroom-staff call in unfamiliar branches.',
    classification: 'observation',
    authorPlaceholderId: 'lawyer-diana-santos',
    mentions: ['judge-lim'],
    createdAt: '2022-11-08T09:00:00Z',
    metadata: { insight_category: 'procedural' },
  },
  {
    placeholderId: 'insight-033',
    title: 'Br. 28 emergency motion protocol (Judge Lim)',
    body: `Judge Lim's Br. 28 has an unwritten but consistent emergency-motion protocol. Motions seeking urgent relief (TRO, urgent ex parte orders, emergency MILs) require a courtesy phone call to the branch clerk before filing. If the call is not placed, the motion is calendared but processed at routine speed regardless of the "urgent" caption.

We learned this in Banyan when a TRO motion sat for nine days despite the urgency caption. The branch clerk later explained that no call had been placed and the staff treated the urgent labeling as boilerplate. Subsequent filings in Br. 28 have followed the call-then-file protocol; urgent motions have been processed within 2–3 business days.

The protocol applies in Br. 28 specifically; other branches handle urgency differently. Judge Veloso's Br. 51 in Pasig accepts an urgent designation at face value provided the motion is clearly captioned and supported by an affidavit of urgency. Judge Navarro's Br. 7 requires emailed notification but not a call.

Operational note. The branch-by-branch urgency protocol differences are maintained in the firm operational notes (with Diana Santos). For Br. 28 the rule is: call before filing, every time, even for routine urgency. The call takes five minutes and saves a week.`,
    summary:
      'Br. 28 (Judge Lim) requires a courtesy call to the branch clerk BEFORE filing any urgent motion; otherwise urgent designation is processed at routine speed. Br. 51 (Veloso) accepts urgency at face value; Br. 7 (Navarro) needs email notice.',
    classification: 'observation',
    authorPlaceholderId: 'lawyer-joaquin-tirona',
    mentions: ['judge-lim', 'judge-veloso', 'judge-navarro', 'concept-tro'],
    involves: ['matter-banyan'],
    createdAt: '2024-03-05T15:45:00Z',
    metadata: { insight_category: 'procedural' },
  },
  {
    placeholderId: 'insight-034',
    title: 'Board resolution requirement for corporate plaintiffs — substance, not form',
    body: `Corporate-plaintiff complaints have been dismissed on Rule 7 grounds in two of our matters because the attached board resolution did not specifically authorize the named signatory to verify and certify the particular complaint. Generic board resolutions ("the General Counsel is authorized to commence litigation on behalf of the corporation") have been deemed insufficient when the certification was signed by someone other than the named officer.

The clearer template we now use names the specific matter (or describes the dispute in identifying detail), names the specific officer authorized to verify and certify, and includes language authorizing delegation only if a specifically named alternate. Generic delegation language ("or such other officer as the General Counsel may designate") has been challenged.

Practical implication. When the client's General Counsel cannot personally sign (travel, schedule), the board resolution must affirmatively authorize the alternate by name. We now request both the primary and an explicitly named alternate in the resolution at intake; it eliminates a class of last-minute scrambles.

This is procedural rather than substantive but the dismissal cost is identical to a substantive defect. Treat it accordingly.`,
    summary:
      'Board resolutions for corporate-plaintiff certification must name the matter and the specific authorized officer (with named alternates). Generic delegation language has caused dismissals. Request named-alternate language at intake.',
    classification: 'lesson_learned',
    authorPlaceholderId: 'lawyer-marco-pangilinan',
    mentions: [],
    cites: ['statute-rule-7'],
    createdAt: '2023-05-30T13:20:00Z',
    metadata: { insight_category: 'procedural' },
  },
  {
    placeholderId: 'insight-035',
    title: 'Service of pleadings: personal vs. registered mail in Quezon City branches',
    body: `QC RTC branches treat service-of-pleadings discrepancies more strictly than the Makati counterparts. Branches 28, 33, and 217 have all sustained service defects in our matters where Makati branches in our experience would have proceeded.

The recurring vulnerability. Service by registered mail without a backup personal service or with imperfect proof-of-service documentation has been the basis for several adverse rulings in QC branches (motion deemed unfiled, hearing reset to give the served party more notice, opposing counsel granted continuance for prejudice).

Operational protocol now in place for QC filings. First, personal service is the default. Registered mail is used only when personal service is impracticable, and even then is paired with email notification (where counsel-to-counsel email has been established). Second, the proof-of-service exhibit attached to filings is a separately tabbed document with the original registry receipt photograph, the registry return card (if available), and a verifying affidavit by the process server. Third, in QC matters we maintain a service log in the case management system; every served document and the manner of service is logged contemporaneously.

The over-investment in service rigor is worth it. Service-defect setbacks are entirely avoidable; once they happen, the cost (continuance, opposing-counsel hearing recovery time, occasional adverse ruling) is real.`,
    summary:
      'QC RTC branches (28, 33, 217) treat service-of-pleadings defects more strictly than Makati. Use personal service by default; pair registered mail with email; maintain a tabbed proof-of-service exhibit and contemporaneous service log.',
    classification: 'observation',
    authorPlaceholderId: 'lawyer-sophia-recto',
    mentions: ['judge-lim', 'judge-cruz'],
    cites: ['statute-rule-7'],
    createdAt: '2024-06-08T08:30:00Z',
    metadata: { insight_category: 'procedural' },
  },

  // ════════════════════════════════════════════════════════════════════════
  // CLUSTER 7 — JUDGE NAVARRO (RTC Pasig Br. 7) — Tech-forward
  // ════════════════════════════════════════════════════════════════════════

  {
    placeholderId: 'insight-036',
    title: 'Judge Navarro accepts predictive coding / TAR for discovery',
    body: `Judge Navarro of RTC Pasig Br. 7 is one of the few PH trial-court judges to have accepted technology-assisted review (TAR) protocols as adequate compliance with discovery obligations. In the Meridian discovery posture we proposed a predictive-coding methodology supported by a 15-page methodology submission and validation sampling plan; he approved it with minor modifications and credited the protocol in his written discovery order.

The methodology submission is the gating step. He will not accept TAR on counsel's say-so; he expects a structured methodology with stated recall and precision targets, a validation-sampling plan, and named technical owners. Our submission included a control-set construction protocol (judgmental + random), iterative training rounds, and a defensible-stopping criterion. He picked apart two of the validation elements at the conference and required tightening.

The cost saving has been material. The Meridian production volume would have required roughly 6 attorney-months of linear review; the TAR-assisted protocol completed in roughly 8 attorney-weeks with a defensible audit trail.

For practice teams in other branches: do not assume the Meridian precedent transfers. Judge Buenaventura has not been asked; Judge Cruz has been asked once and declined without prejudice. Br. 7 is currently the only branch where TAR is reliably entertained.`,
    summary:
      'Br. 7 (Navarro) accepts TAR/predictive coding with a rigorous methodology submission. Meridian protocol cut review from 6 attorney-months to 8 weeks. Precedent does NOT transfer — other branches still skeptical.',
    classification: 'lesson_learned',
    authorPlaceholderId: 'lawyer-beatrice-sevilla',
    about: ['concept-tar'],
    mentions: ['judge-navarro', 'judge-buenaventura', 'judge-cruz'],
    involves: ['matter-meridian'],
    cites: ['statute-rule-26-27'],
    createdAt: '2023-09-19T10:00:00Z',
    metadata: { insight_category: 'judge_tendencies', judge: 'judge-navarro' },
  },
  {
    placeholderId: 'insight-037',
    title: 'Judge Navarro: long written opinions and how to use them',
    body: `Judge Navarro writes longer and more factual rulings than most PH trial judges. His orders in Meridian and in a 2022 commercial matter ran 25–40 pages each, with extensive recitation of the factual record and explicit reasoning chains. The drafting style has two practical implications.

First, his rulings are cite-able in subsequent matters. We have cited his discovery order in Meridian in two later TAR-methodology submissions to other branches; the substantive reasoning was persuasive even where the deciding judge ultimately declined to adopt the protocol. His patterns can be researched.

Second, his attentiveness to factual recitation rewards careful affidavit preparation. He reads the affidavits; the writing style of the affidavits ends up reflected in his orders. Affidavits that are vague or jargon-laden produce vague reasoning; affidavits that are concrete and date-and-document-specific produce concrete reasoning.

Operational implication. For Br. 7 matters, allocate disproportionate prep time to affidavit drafting (relative to motion-brief drafting). The brief should be tight; the affidavits should be the substantive workhorses. This is the inverse posture of Br. 147 (Buenaventura), where the brief carries the argument and affidavits are supplementary.

Cross-reference: Br. 147 brief-discipline insights (cluster 2). Same firm, opposite optimal drafting posture in the two branches.`,
    summary:
      'Br. 7 (Navarro) writes long, factual orders; they are cite-able in subsequent matters. For Br. 7 specifically, weight affidavit drafting heavier than brief drafting — inverse posture from Br. 147.',
    classification: 'observation',
    authorPlaceholderId: 'lawyer-diana-santos',
    mentions: ['judge-navarro', 'judge-buenaventura'],
    involves: ['matter-meridian'],
    createdAt: '2023-12-02T14:15:00Z',
    metadata: { insight_category: 'judge_tendencies', judge: 'judge-navarro' },
  },
  {
    placeholderId: 'insight-038',
    title: 'Judge Navarro: patient with experts, allows scope breadth',
    body: `Judge Navarro is materially more permissive on expert testimony scope than Judge Lim. He allows expert witnesses to address adjacent topics not explicitly listed in the judicial affidavit, provided they are within the broader subject-matter qualification declared in the affidavit. Speaking objections from opposing counsel are routinely overruled if the witness is properly qualified.

This is a strategic advantage when we are the offering party. We can declare expert qualification at a slightly broader level than the immediate matter requires and have headroom for rebuttal and clarification testimony at trial without supplementing the JA. In Meridian we declared Dr. Salazar's qualification across "telecom consumer behavior" rather than narrowly to "subscription-decision modeling," and the breadth gave us multiple direct-examination angles.

When we are facing an opposing expert in Br. 7, the inverse caution applies. Pre-trial JA-scope motions are harder to win here. Plan for cross to do the limiting work that the JA Rule would do in Br. 28.

Cross-reference: insight on Judge Lim and JA Rule scope (cluster 6 will deepen this). Same Rule, materially different judicial enforcement posture between Br. 7 and Br. 28. Map the branch posture before the JA drafting choice.`,
    summary:
      'Br. 7 (Navarro) is permissive on expert scope; speaking objections overruled when witness is qualified. Strategic implication: declare qualification slightly broader than immediate need. Opposite of Br. 28 (Lim).',
    classification: 'observation',
    authorPlaceholderId: 'lawyer-ana-mendoza',
    about: ['concept-ja-rule-scope'],
    mentions: ['judge-navarro', 'judge-lim', 'witness-salazar'],
    involves: ['matter-meridian'],
    cites: ['statute-ja-rule'],
    createdAt: '2023-11-15T09:30:00Z',
    metadata: { insight_category: 'judge_tendencies', judge: 'judge-navarro' },
  },
  {
    placeholderId: 'insight-039',
    title: 'Judge Navarro: monetary sanctions for discovery-motion abuse',
    body: `Br. 7 has imposed monetary sanctions on counsel in three of our observed matters for discovery-motion practices Navarro characterized as abusive: serial motions to compel on already-produced material, sanctions motions raised without a meet-and-confer effort, and one instance of motion practice that "appears designed to manufacture appellate issues."

The sanctions have been modest in amount (PHP 50K–150K range) but the disciplinary tone of the orders has been substantial. Our team has not been on the receiving end. We have been on the benefiting side once, in a 2022 matter where the opposing firm filed three motions to compel within five weeks; Navarro denied the third with a sanction order.

Operational implication. Discovery motion practice in Br. 7 must be substantively well-supported and procedurally clean. Always document the meet-and-confer effort before filing; always cite specific production deficiencies; never file motions that overlap in substance with earlier filings without acknowledging the overlap and explaining why the second motion is necessary.

This is materially different from other branches. In Br. 33 (Cruz) discovery-motion abuse rarely draws sanctions; in Br. 147 the page-limit discipline tends to deter abuse pre-emptively without need for sanctions.`,
    summary:
      'Br. 7 (Navarro) imposes monetary sanctions for discovery-motion abuse (serial motions, no meet-and-confer, manufactured appellate issues). PHP 50K–150K range. Different from Br. 33 (Cruz), where abuse rarely draws sanctions.',
    classification: 'observation',
    authorPlaceholderId: 'lawyer-beatrice-sevilla',
    mentions: ['judge-navarro', 'judge-cruz', 'judge-buenaventura'],
    cites: ['statute-rule-26-27'],
    createdAt: '2024-04-22T11:00:00Z',
    metadata: { insight_category: 'judge_tendencies', judge: 'judge-navarro' },
  },

  // ════════════════════════════════════════════════════════════════════════
  // CLUSTER 8 — REMAINING JUDGES (DEPTH PASSES)
  // ════════════════════════════════════════════════════════════════════════

  {
    placeholderId: 'insight-040',
    title: 'Judge Lim: judicial affidavits as the operative testimony',
    body: `Judge Lim of Br. 28 treats the judicial affidavit as the operative testimony. Direct examination at trial is brief, often perfunctory; she expects the JA to contain the substantive case-in-chief. Cross-examination at trial then has full procedural force, but the redirect is bounded to the cross topics — she does not allow redirect to introduce new substance the JA omitted.

The drafting implication is significant. JAs in Br. 28 must read as standalone substantive documents, not as outlines for live testimony. We allocate roughly 60% of pre-trial witness-preparation time to JA drafting in her court, against 30–40% in other branches. Witnesses review the JA multiple times before signing because the document is what the court will substantively rely on.

Operational practice. JA drafts in Br. 28 matters undergo a "stand-alone read" review: a partner reads the JA without any other case context and rates whether it tells a coherent factual story. If it does not, the draft is rewritten before signature. This single pass has prevented several weak filings.

Cross-reference: Br. 7 (Navarro) allows JA breadth and trial-stage broadening; Br. 147 (Buenaventura) is closer to the Br. 28 posture but with less explicit emphasis. Map the branch posture during witness prep.`,
    summary:
      'Br. 28 (Lim) treats the JA as operative testimony; direct is perfunctory, redirect is bounded. Allocate ~60% of witness prep to JA drafting (vs. 30–40% elsewhere). Use a "stand-alone read" review pass.',
    classification: 'strategy',
    authorPlaceholderId: 'lawyer-rafael-estrada',
    about: ['concept-ja-rule-scope'],
    mentions: ['judge-lim', 'judge-navarro', 'judge-buenaventura'],
    cites: ['statute-ja-rule'],
    createdAt: '2024-07-12T13:30:00Z',
    metadata: { insight_category: 'judge_tendencies', judge: 'judge-lim' },
  },
  {
    placeholderId: 'insight-041',
    title: 'Judge Lim: slow docket — plan timelines accordingly',
    body: `Matters in Br. 28 move materially slower than the Makati commercial branches. Routine motions wait 60–90 days for a ruling; SJ briefing is calendared on a 5–6 month cycle including reply windows; pre-trial conferences are often reset once before they proceed.

The implication for matter planning is operational rather than substantive. Internal client deadlines and litigation budgets must account for the slower cadence. A matter we forecast as 18 months in Br. 147 is realistically 28–32 months in Br. 28.

Tactical implication. The slow docket benefits defense in matters where business reality may resolve the underlying dispute (e.g., consolidation discussions, market shifts, third-party events). It is unfavorable for plaintiff-side matters where time-sensitive relief is needed; we have advised two clients against filing in Br. 28 venues when alternatives were available.

Operational note: status-conference scheduling in Br. 28 is somewhat opaque. We maintain informal contact with the branch staff for scheduling intelligence rather than relying on the published calendar, which lags actual scheduling decisions by several weeks.`,
    summary:
      'Br. 28 (Lim) docket is slow — 18-month matters realistically 28–32 months. Favors defense where business reality may resolve; disfavors plaintiff time-sensitive relief. Maintain informal scheduling intelligence with branch staff.',
    classification: 'observation',
    authorPlaceholderId: 'lawyer-marco-pangilinan',
    mentions: ['judge-lim', 'judge-buenaventura'],
    createdAt: '2023-08-30T15:00:00Z',
    metadata: { insight_category: 'judge_tendencies', judge: 'judge-lim' },
  },
  {
    placeholderId: 'insight-042',
    title: 'Judge Cruz: jurisdictional motions deferred — manage client expectations',
    body: `Judge Cruz of Br. 33 (Manila) habitually defers rulings on motions to dismiss for lack of jurisdiction until after the plaintiff has rested its case-in-chief. Across at least four matters we have observed (one ours, three through colleague discussion), the pattern is consistent.

The implication for case strategy is substantial. Where we have a jurisdictional defense in Br. 33, the realistic expectation is that the defense will not produce an early dispositive ruling and we will be required to litigate the full case-in-chief before the jurisdictional question is reached. Resources should be budgeted accordingly.

Tactical alternatives. First, consider whether the matter can be venued elsewhere — sometimes a Rule 65 petition challenging an erroneous venue assignment is available and warranted. Second, the jurisdictional defense can be paired with a substantive defense that is independently strong; the substantive defense becomes the operative trial theory while the jurisdictional defense is preserved for post-trial argument and appeal.

Client communication. Brief clients at intake on the Br. 33 deferral pattern. Otherwise the expectation gap (when we discuss the jurisdictional defense but the case proceeds for two years before it is ruled on) creates avoidable client friction.`,
    summary:
      'Br. 33 (Cruz) defers jurisdictional dismissal motions until after plaintiff rests. Pair the defense with a substantive theory; brief clients at intake to manage the expectation gap. Consider Rule 65 if venue assignment is erroneous.',
    classification: 'observation',
    authorPlaceholderId: 'lawyer-joaquin-tirona',
    about: ['concept-rule-65'],
    mentions: ['judge-cruz'],
    cites: ['statute-rule-65'],
    createdAt: '2023-05-10T10:45:00Z',
    metadata: { insight_category: 'judge_tendencies', judge: 'judge-cruz' },
  },
  {
    placeholderId: 'insight-043',
    title: 'Judge Mendoza-F: market-definition rigor in PCC referral matters',
    body: `Judge Felipe Mendoza of Br. 62 has pre-bench antitrust experience and applies a notably higher rigor standard to market-definition analysis in PCC-referred or PCC-overlap matters. In Coastal he required econometric support (diversion-ratio or SSNIP analysis) for market-definition claims and rejected pleading-stage assertions unsupported by economist declarations.

The implication for plaintiff-side antitrust filings in Br. 62 is operational: retain a credible antitrust economist early in case planning, before the pleading is filed. Dr. Christine Aquino has been our retained economist on two Br. 62 matters; her diversion-ratio analyses have been credited in his orders.

Defense-side, the opposite implication. In Br. 62 we can win significant relief by attacking the plaintiff's market-definition theory if it lacks econometric support. The Coastal opposition's market-definition theory was vulnerable on exactly this dimension; we developed it as the primary defense theme and prevailed on summary judgment.

Cross-reference: insight on antitrust market definition (medium-confidence segment of the corpus). The doctrine is reasonably well-developed at PCC level; the trial-court enforcement varies sharply by judge. Mendoza-F is the rigor benchmark for our practice.`,
    summary:
      'Br. 62 (Mendoza-F) requires econometric (diversion-ratio / SSNIP) support for market-definition in PCC matters. Retain an antitrust economist before pleading. Dr. Aquino has worked with us in two Br. 62 matters.',
    classification: 'strategy',
    authorPlaceholderId: 'lawyer-miguel-ortega',
    about: ['concept-relevant-market'],
    mentions: ['judge-mendoza-f', 'witness-aquino', 'concept-restraint-of-trade'],
    involves: ['matter-coastal'],
    cites: ['statute-pca'],
    createdAt: '2023-01-25T14:00:00Z',
    metadata: { insight_category: 'judge_tendencies', judge: 'judge-mendoza-f' },
  },
  {
    placeholderId: 'insight-044',
    title: 'Justice Tolentino (CA Special 5th): Rule 65 motion-for-reconsideration enforcement',
    body: `Justice Andrea Tolentino's Special 5th Division of the Court of Appeals enforces Rule 65 prerequisites strictly. The motion-for-reconsideration requirement before filing certiorari is dismissed-without-prejudice ground in her Division more reliably than at other Divisions. The dispense-with-MR exceptions (urgency, public interest, void order) are construed narrowly.

We have had two Rule 65 petitions dismissed in her Division for failure to first move for reconsideration of the underlying RTC ruling. In both cases the underlying ruling could not realistically have been corrected on MR, and we argued the futility exception; she rejected both. The matters were re-filed after the procedural cure but lost 6–9 weeks each.

Operational practice. For any potential Rule 65 challenge of a Br. 147 or other-RTC ruling, the MR is the procedurally cheaper first step even when it appears futile. File the MR, let it be denied, then file Rule 65 with both rulings in the record. This is the safer path in any matter that might land in Special 5th.

For matters that go to other CA Divisions, the futility exception is more accessible — but we cannot reliably control Division assignment, so the safer default is to MR first.`,
    summary:
      'CA Special 5th (Tolentino) enforces Rule 65 motion-for-reconsideration prerequisite strictly. Futility exception construed narrowly. Always MR first; file Rule 65 with both rulings in record. Default for any RTC challenge.',
    classification: 'lesson_learned',
    authorPlaceholderId: 'lawyer-diana-santos',
    about: ['concept-rule-65'],
    mentions: ['judge-tolentino', 'judge-buenaventura', 'precedent-mercado-suarez'],
    cites: ['statute-rule-65', 'precedent-mercado-suarez'],
    createdAt: '2024-10-08T11:20:00Z',
    metadata: { insight_category: 'judge_tendencies', judge: 'judge-tolentino' },
  },
  {
    placeholderId: 'insight-045',
    title: 'Judge Veloso: TRO grant patterns in IP and trade-secret matters',
    body: `Judge Veloso of Br. 51 (Pasig) grants TROs more readily than the typical PH commercial bench when the underlying matter is IP or trade-secret. Two patterns have been consistent across our matters and observed colleague matters.

First, customer-relationship-harm theories of irreparable injury have been more persuasive in his court than purely revenue-based theories. The TRO grant rate for "imminent loss of identified customer relationships" framing has been materially higher than for "imminent revenue loss" framing supporting the same factual situation. The customer-relationship framing is more concrete and reflects the relational nature of harms his orders have emphasized.

Second, the supporting affidavit set matters. Veloso reads the affidavits and weights them heavily in the urgency determination. Two recent TROs were granted in part because of well-prepared customer-relationship-loss declarations from the client's commercial team. A 2022 TRO was denied because we relied primarily on a damages-expert estimate without operational-team customer declarations.

Operational practice. In Br. 51 IP TRO applications, prioritize commercial-team declarations describing identified customer engagements at risk. The damages-expert framing is supplementary, not primary. This inverts the Br. 147 practice where damages expert reports have been weighted heavily by Judge Buenaventura.`,
    summary:
      'Br. 51 (Veloso) grants IP TROs on customer-relationship-harm framing more reliably than revenue-based. Prioritize commercial-team declarations over damages-expert framing. Inverts Br. 147 practice.',
    classification: 'strategy',
    authorPlaceholderId: 'lawyer-karen-bautista',
    about: ['concept-tro', 'concept-irreparable-injury'],
    mentions: ['judge-veloso', 'judge-buenaventura', 'concept-trade-secret'],
    involves: ['matter-banyan'],
    cites: ['statute-ip-code'],
    createdAt: '2024-02-28T16:00:00Z',
    metadata: { insight_category: 'judge_tendencies', judge: 'judge-veloso' },
  },

  // ════════════════════════════════════════════════════════════════════════
  // CLUSTER 9 — REMAINING OPPOSING FIRMS
  // ════════════════════════════════════════════════════════════════════════

  {
    placeholderId: 'insight-046',
    title: 'Atty. Ricardo Bernardo (Santos Cruz): speaking-objection coaching at depositions',
    body: `Atty. Ricardo Bernardo of Santos Cruz Law consistently uses speaking objections during depositions as a witness-coaching mechanism. The pattern: lengthy objections phrased as instructional reminders to the witness, often using the very language we want to keep out of the record ("Counsel, the witness has already explained that he did not personally observe the transaction, so any speculation would be objectionable as calls for speculation").

Counter-pattern that has worked. First, instruct the stenographer at the start of the deposition to read back the original question verbatim after any objection. Second, after the read-back, ask the witness directly to answer the question as read. Third, if the speaking-objection pattern persists past 3–4 instances, place an explicit on-the-record complaint citing Rule 23 § 12 standards and reserve the right to seek a protective order.

In a 2024 deposition this counter-pattern reduced his speaking objections from a starting rate of roughly one every 3 questions to roughly one every 12 questions over the course of a day. The witness's substantive answers reflected the reduced coaching.

If the pattern persists despite the counter-pattern, file the protective-order motion. We have done so once; the motion was granted in part and Bernardo's deposition behavior moderated noticeably in subsequent sessions.`,
    summary:
      'Counter Bernardo\'s speaking-objection coaching: instruct stenographer to read back question; ask witness to answer as read; if pattern persists, on-the-record complaint then protective-order motion. Reduced his rate ~4x in 2024.',
    classification: 'strategy',
    authorPlaceholderId: 'lawyer-rafael-estrada',
    about: ['concept-speaking-objections'],
    mentions: ['lawyer-bernardo', 'firm-santos-cruz'],
    concerns: ['firm-santos-cruz'],
    createdAt: '2024-05-30T09:45:00Z',
    metadata: { insight_category: 'opposing_counsel_patterns', firm: 'firm-santos-cruz' },
  },
  {
    placeholderId: 'insight-047',
    title: 'Santos Cruz Law: heavy motion-in-limine practice as procedural anchor',
    body: `Santos Cruz files MILs in volume — typically 8–15 separate MILs in any matter that proceeds to pre-trial conference. The volume pattern reads as a procedural-anchoring strategy: even if most MILs are denied, the briefing cycle consumes opposing-side preparation time and the granted MILs (typically 1–3) extract real evidentiary concessions.

Counter-pattern. First, do not respond to every MIL with the same priority. Triage at filing: identify the 2–3 MILs with substantive bite and prepare full responses; the remaining MILs get standard-form responses citing the absence of foundation. Second, file our own MILs in the same window — Santos Cruz's volume strategy assumes one-sided incentive structure; reciprocal MIL filing equalizes the prep burden.

Third, on the granted MILs, prepare in-trial workarounds rather than treating the grant as final. Their MILs are often broad as filed and the trial-stage application is contestable. We have several times prevailed on a granted-in-pre-trial MIL by re-framing the evidence at trial in a way that exited the MIL's literal scope.

Br. 147 (Buenaventura) is particularly receptive to MIL-volume pushback because of the page-discipline culture. In her court the response strategy can be brief without losing substance.`,
    summary:
      'Santos Cruz files 8–15 MILs per pre-trial. Triage to top 2–3 substantively; reciprocate with our own MILs; prepare trial-stage workarounds for granted MILs. Br. 147 is particularly receptive to MIL-volume pushback.',
    classification: 'strategy',
    authorPlaceholderId: 'lawyer-joaquin-tirona',
    about: ['concept-mil'],
    mentions: ['firm-santos-cruz', 'judge-buenaventura'],
    concerns: ['firm-santos-cruz'],
    createdAt: '2024-08-14T13:30:00Z',
    metadata: { insight_category: 'opposing_counsel_patterns', firm: 'firm-santos-cruz' },
  },
  {
    placeholderId: 'insight-048',
    title: 'Atty. Hector Bautista (Tan & Roxas): jury-vs-bench inconsistency',
    body: `Atty. Hector Bautista of Tan & Roxas exhibits a sharp performance difference between jury-equivalent matters and bench commercial trials. In matters with a jury-like fact-finding posture (criminal cases he occasionally handles, certain family-law adjacent matters where credibility is the central battle) he is vigorous on foundation objections, exhibit objections, and witness control. In our bench commercial matters against him he rarely objects to foundation and his depositions are unfocused — he asks broad questions, does not follow up on admissions, and frequently lets favorable points pass without elaboration.

The implication is matter-specific. In our bench commercial trials we have been more aggressive than we would otherwise be on exhibit introduction and witness expansion because he frequently fails to object to foundation issues that other firms would routinely contest. We have introduced exhibits without full foundation in two matters; he did not object, and the exhibits stood.

Operational caution. The pattern is not a guarantee. He has occasionally objected vigorously even in bench matters when the matter approached trial. The pattern is most reliable in pre-trial and discovery stages; at trial his attention sharpens. Plan accordingly.

Useful corollary: if he opens a favorable topic on cross-examination, let him run with it. He rarely circles back to cut off helpful answers.`,
    summary:
      'Atty. Bautista (Tan & Roxas) is vigorous in jury-equivalent matters but unfocused in bench commercial trials. Be more aggressive on exhibit introduction; let him run on favorable cross topics. Pattern less reliable at trial-proper.',
    classification: 'observation',
    authorPlaceholderId: 'lawyer-diana-santos',
    mentions: ['lawyer-bautista-h', 'firm-tan-roxas'],
    concerns: ['firm-tan-roxas'],
    createdAt: '2023-04-05T11:00:00Z',
    metadata: { insight_category: 'opposing_counsel_patterns', firm: 'firm-tan-roxas' },
  },
  {
    placeholderId: 'insight-049',
    title: 'Ramos Law Firm: settlement curve in NLRC labor matters',
    body: `Ramos Law Firm represents respondent employers in labor matters. Their settlement curve is predictable enough across the matters we have observed (3 directly, 4 through colleague discussion) to plan around.

The curve. Initial offers at 30–40% of complainant's claim regardless of underlying liability strength. No movement during the NLRC conciliation-mediation window. Marginal movement (to 45–50%) immediately after the conciliation phase if the complainant's case looks strong. Substantial movement (60–70%) only after an adverse preliminary conference ruling against their client.

Implication for complainant-side strategy. Do not invest in the early-stage settlement conversation. The Ramos pattern is structured to extract maximum negotiation leverage from NLRC procedural milestones; matching the procedural pace is the better complainant-side strategy. We have advised two complainant clients to hold firm through the conciliation phase and have prevailed at substantially better terms in both.

The pattern is rooted in their typical employer-client risk posture: employers are more willing to authorize settlement increases after a procedural validation of liability than on counsel's advance recommendation. Counsel for complainants who fight that incentive structure waste time.

Note: this insight applies to NLRC labor matters specifically; Ramos's commercial-litigation practice (which we have not observed directly) may have different patterns.`,
    summary:
      'Ramos Law Firm (labor side) starts at 30–40%, moves marginally post-conciliation, substantially (60–70%) only after adverse PCC. Hold firm through conciliation; the curve is structurally rooted in employer risk-authorization patterns.',
    classification: 'strategy',
    authorPlaceholderId: 'lawyer-marco-pangilinan',
    mentions: ['firm-ramos'],
    concerns: ['firm-ramos'],
    cites: ['statute-labor-code-297'],
    createdAt: '2023-06-15T10:30:00Z',
    metadata: { insight_category: 'opposing_counsel_patterns', firm: 'firm-ramos' },
  },
  {
    placeholderId: 'insight-050',
    title: 'Whitfield & Mendez: procedural delay as leverage',
    body: `Whitfield & Mendez uses procedural delay strategically. Their international-M&A-litigation posture treats time itself as a negotiation lever — every additional month their client retains the disputed assets or obligations is a month of value preserved. The pattern manifests in routine extension requests, expansive discovery objections, and motions practice timed to maximum disruption of our case calendar.

Counter-pattern. First, build the timeline into the case plan at intake: forecast their typical delay tactics and build buffer into our own deadlines. Second, on any motion practice they file, evaluate whether it is substantively contestable or whether it is delay-only; for delay-only motions, our response strategy should be to accelerate rather than to brief fully. A two-page response citing the standard authorities is often sufficient; the absence of substantive engagement signals to the court that the underlying motion is procedurally weak.

Third, where the delay-leverage is material, ask the court for case management orders that bind both parties to a structured schedule. Judge Buenaventura has issued these in two Helios proceedings; Judge Reyes (Br. 25) has done so once.

Cross-reference: settlement timing against Whitfield's parent strategy. The procedural delay is paired with low-settlement-offer posture; the combination requires litigation milestones to extract value.`,
    summary:
      'Whitfield & Mendez treats procedural delay as leverage. Counter with short responses to delay-only motions; seek case-management orders binding both parties to schedule. Judge Buenaventura has issued these in Helios.',
    classification: 'strategy',
    authorPlaceholderId: 'lawyer-carlos-reyes',
    mentions: ['firm-whitfield-mendez', 'lawyer-whitfield', 'judge-buenaventura'],
    concerns: ['firm-whitfield-mendez'],
    involves: ['matter-helios'],
    createdAt: '2024-03-12T14:30:00Z',
    metadata: { insight_category: 'opposing_counsel_patterns', firm: 'firm-whitfield-mendez' },
  },
  {
    placeholderId: 'insight-051',
    title: 'Aragon Madrigal: Rule 65 petitions as litigation strategy',
    body: `Aragon Madrigal files Rule 65 certiorari petitions to the Court of Appeals at higher rates than typical commercial-litigation counsel. We have seen them file Rule 65 challenges on at least four interlocutory rulings in our matters where the underlying ruling was within the trial court's discretion and a Rule 65 challenge had low probability of success.

The pattern reads less as legal strategy and more as procedural pressure. Even a Rule 65 petition that ultimately fails consumes 4–8 months of appellate-side briefing and produces a stay-or-no-stay decision that creates uncertainty in the underlying RTC matter.

Counter-pattern. First, on any Rule 65 petition they file against us, evaluate quickly whether to seek a sworn comment on a tight calendar or to let it proceed at the standard pace. Tight-calendar response signals to the CA that the petition is being treated seriously and accelerates dismissal. Standard-pace response is appropriate where the petition is plainly weak and the CA can be expected to dismiss without significant briefing investment.

Second, on the underlying RTC matter, do not let the Rule 65 petition pause our trial-court momentum. Continue all parallel work assuming the stay will be denied; this minimizes calendar slippage if the CA's stay decision comes late.

Cross-reference: Justice Tolentino's Special 5th Division enforces Rule 65 prerequisites strictly. Aragon's filings have repeatedly failed there for MR-prerequisite reasons.`,
    summary:
      'Aragon Madrigal files Rule 65 petitions as procedural pressure even where success is unlikely. Counter: tight-calendar response signals seriousness; do not pause RTC momentum. CA Special 5th (Tolentino) dismisses their MR-deficient filings.',
    classification: 'strategy',
    authorPlaceholderId: 'lawyer-diana-santos',
    about: ['concept-rule-65'],
    mentions: ['firm-aragon-madrigal', 'judge-tolentino'],
    concerns: ['firm-aragon-madrigal'],
    cites: ['statute-rule-65'],
    createdAt: '2024-07-04T11:15:00Z',
    metadata: { insight_category: 'opposing_counsel_patterns', firm: 'firm-aragon-madrigal' },
  },

  // ════════════════════════════════════════════════════════════════════════
  // CLUSTER 10 — DOMAIN DEEPENING (antitrust, securities, deposition, TAR)
  // ════════════════════════════════════════════════════════════════════════

  {
    placeholderId: 'insight-052',
    title: 'Relevant market definition in shipping antitrust: Coastal lessons',
    body: `In Coastal Trade Dispute the relevant-market definition question was the dispositive issue. The opposing alliance defined the market broadly to include all inter-island shipping nationwide; we defined it narrowly to specific lane segments where the alliance had captured 70%+ share. The narrow definition was credited and the alliance's market-power defense failed.

Methodology behind the narrow definition. Dr. Christine Aquino prepared a diversion-ratio analysis from customer-survey data: when the alliance raised lane-segment prices by 8% in a 2021 round, customers diverted to other lane-segment carriers at high rates rather than to other shipping markets entirely. The diversion-ratio analysis supported lane-segment-level market definition under standard antitrust methodology.

Practice lessons. First, the customer survey was the operational lynchpin. Without diversion-ratio data, the market-definition argument would have rested on industry-publication characterizations, which Judge Mendoza had already signaled would not satisfy his rigor standard. Second, the survey instrument design mattered — we worked with Dr. Aquino on the question structure to ensure the responses were admissible as actual customer behavior rather than hypothetical preferences.

Cross-reference: this insight is for plaintiff-side framing. In a defense posture, attacking the survey methodology and the responses' representativeness is the analogous path.`,
    summary:
      'Coastal: narrow lane-segment market definition was decisive. Diversion-ratio analysis from customer survey was the operational lynchpin. Judge Mendoza-F required this rigor; industry-publication characterization would not have sufficed.',
    classification: 'lesson_learned',
    authorPlaceholderId: 'lawyer-miguel-ortega',
    about: ['concept-relevant-market'],
    mentions: ['witness-aquino', 'judge-mendoza-f', 'concept-restraint-of-trade'],
    involves: ['matter-coastal'],
    cites: ['statute-pca', 'precedent-asian-terminals'],
    createdAt: '2022-12-08T15:00:00Z',
    metadata: { insight_category: 'antitrust' },
  },
  {
    placeholderId: 'insight-053',
    title: 'Helena Securities: scienter element development through document discovery',
    body: `Securities fraud under SRC § 26 requires scienter — the contested element in virtually every PH securities matter we have observed. In Helena Securities the scienter posture was strengthened materially by document discovery rather than by direct testimony.

The discovery yield. Internal memoranda among management discussing the difference between reported and actual quarterly figures. Email chains debating disclosure timing. Board materials reflecting awareness of the deviation 6+ weeks before public correction. Each document on its own was deniable; together they form a circumstantial scienter showing strong enough that the management defendants have repeatedly raised settlement during the matter.

Practice pattern. Securities scienter cases live or die on document discovery. The first six months of any securities matter should be heavily weighted toward document production and review rather than depositions; the documents drive the depositions, not the inverse. Allocate associate review capacity accordingly.

Caveat. Document discovery in PH securities matters is procedurally more contested than US-equivalent practice; expect to litigate motion-to-compel cycles. Plan timeline accordingly. Helena required two motion-to-compel cycles before the most material documents were produced.

Cross-reference: TAR-methodology insights — for high-volume securities productions, predictive coding is the only practical review approach.`,
    summary:
      'Securities scienter is built through document discovery, not depositions. Weight first 6 months toward document review. Plan for 2+ motion-to-compel cycles; Helena required two. TAR practical for high-volume securities productions.',
    classification: 'strategy',
    authorPlaceholderId: 'lawyer-lourdes-villaroman',
    about: ['concept-securities-fraud'],
    mentions: ['concept-tar', 'concept-class-suit'],
    involves: ['matter-helena'],
    cites: ['statute-src', 'precedent-bpi-lifetime'],
    createdAt: '2024-01-18T10:00:00Z',
    metadata: { insight_category: 'securities' },
  },
  {
    placeholderId: 'insight-054',
    title: 'Deposition objection management: drawing the line at speaking objections',
    body: `Across deposition practice the line between permissible objections (form, foundation, privilege) and impermissible objections (speaking, witness-coaching, argumentative) is contested and judge-by-judge. We now use an explicit deposition opening protocol to manage the line.

The protocol. At the start of every deposition, on the record, state: "Counsel, we are governed by the standard objection conventions: objections should be limited to form, foundation, and privilege; instructions to the witness not to answer are reserved for privilege; speaking objections are not appropriate and we will note them for the record."

This opening accomplishes three things. First, it sets expectations explicitly so opposing counsel cannot later claim ambiguity. Second, it creates a reference point for the stenographer when later read-back is needed. Third, if the protocol is violated and the matter goes to a protective-order motion, the opening is the foundation for the court's review.

The Bernardo deposition pattern is the recurring trigger. In a 2024 matter the opening protocol shortened a previously unproductive deposition cycle materially; opposing counsel limited speaking objections to roughly 4–5 per session against a baseline rate of 30+.

Operational note. For new associates being trained on deposition practice, the opening protocol is standard. Memorize and use it.`,
    summary:
      'Use an explicit deposition opening protocol stating the form/foundation/privilege convention. Creates reference for stenographer read-backs and foundation for protective-order motions. Cut Bernardo speaking objections from 30+ to 4–5 per session.',
    classification: 'strategy',
    authorPlaceholderId: 'lawyer-rafael-estrada',
    about: ['concept-speaking-objections'],
    mentions: ['lawyer-bernardo', 'firm-santos-cruz'],
    createdAt: '2024-09-26T14:30:00Z',
    metadata: { insight_category: 'deposition_practice' },
  },
  {
    placeholderId: 'insight-055',
    title: 'TAR methodology submission: what passed in Br. 7',
    body: `For the Meridian discovery cycle we prepared the firm's first formal TAR methodology submission. Judge Navarro approved it with modifications. The structure that passed:

Section 1, objectives. Quantified production volume, defined relevance scope, and the production deadline. Section 2, methodology. The TAR platform used, the algorithm class (logistic regression / SVM), the training-set construction process (judgmental seed expanded by random sampling), and the iterative-training round count. Section 3, validation. Control-set construction (5% random sample independently reviewed for relevance), recall and precision targets (recall ≥ 75%, precision ≥ 50% as a defensible baseline), and the stopping criterion (two consecutive rounds without target improvement). Section 4, audit and oversight. Named technical owner, named partner-level review checkpoint, and a defined process for human review of high-uncertainty documents.

What Judge Navarro modified. He required a tighter recall target (≥ 80%) and an explicit second-pass attorney review of any document the model flagged as relevant but the initial reviewer disagreed with. Both modifications were operationally manageable.

Practice template. The Meridian methodology submission is now the firm template for any TAR proposal. The template is in the firm KM repository (owner: Beatrice Sevilla). It has been adapted for two subsequent matters; both adaptations were accepted by Br. 7.

Cross-reference: insight on Br. 7 (Navarro) accepting TAR. The cluster fits together as a single demonstrable operational capability.`,
    summary:
      'Meridian TAR methodology that passed Br. 7: 4 sections (objectives, methodology, validation, audit). Navarro tightened recall to ≥80% and required second-pass attorney review of disagreed-relevance docs. Template now firm-standard.',
    classification: 'lesson_learned',
    authorPlaceholderId: 'lawyer-beatrice-sevilla',
    about: ['concept-tar'],
    mentions: ['judge-navarro'],
    involves: ['matter-meridian'],
    cites: ['statute-rule-26-27'],
    createdAt: '2023-10-22T11:30:00Z',
    metadata: { insight_category: 'discovery' },
  },

  // ════════════════════════════════════════════════════════════════════════
  // CLUSTER 11 — FINAL FILLER + MEDIUM-CONFIDENCE THIN COVERAGE
  // ════════════════════════════════════════════════════════════════════════

  {
    placeholderId: 'insight-056',
    title: 'Client-witness deposition prep: the three-session cycle',
    body: `Our deposition outcomes for client-side witnesses have been measurably better when prep follows a three-session cycle rather than the historical single long session. Across roughly 20 client-witness depositions in the last two years, the three-session cycle has produced fewer impeachment-by-prior-statement moments and tighter consistency between deposition and JA.

The cycle. Session 1 (substance, 2 hours, week before): walk through the matter chronology and identify the witness's personal-knowledge boundaries. Session 2 (form, 1.5 hours, 3 days before): rehearse answer patterns for difficult questions, practice "I don't know" and "I don't recall" framing, work on pauses. Session 3 (last-mile, 45 min, morning-of): refresh on the specific exhibits expected, reiterate top-three watch-out questions.

Session 2 is the highest-yield. Most witnesses default to over-answering under stress; the form session is where the discipline of bounded answers is internalized. The 3-day gap before deposition allows the form discipline to settle without the prep session feeling stale.

In the Helios matter we used this protocol for our two principal client witnesses. Both depositions held tight against opposing efforts to broaden their testimony. Cross-reference: the depo opening protocol on speaking objections (cluster 10) — the two operational practices fit together.`,
    summary:
      'Client-witness deposition prep should be three sessions, not one: substance (1 week out), form (3 days out, highest-yield), last-mile (morning-of). Helios principal witnesses held tight under this cycle.',
    classification: 'strategy',
    authorPlaceholderId: 'lawyer-ana-mendoza',
    mentions: ['concept-speaking-objections'],
    involves: ['matter-helios'],
    createdAt: '2024-09-12T10:00:00Z',
    metadata: { insight_category: 'deposition_practice' },
  },
  {
    placeholderId: 'insight-057',
    title: 'Witness rehabilitation on redirect: discipline beats volume',
    body: `When our own witness has taken damage on cross, redirect should be narrow and surgical, not broad and recuperative. Across recent matters, the longest redirects have produced the least rehabilitation; the redirects that worked were short and targeted at one or two specific points.

The reason is structural. A long redirect re-opens the matter for re-cross on the new ground. Each new question on redirect creates a new entry point for opposing counsel; the witness's exposure expands rather than contracts. A surgical redirect that addresses only the most damaging cross point and then sits down ends the witness exchange on our framing.

In the Pinnacle trial our principal witness took cross damage on a timeline-recollection issue. Our redirect focused on a single document refreshing the witness's recollection of the relevant date. Three questions, two minutes, then re-rest. Opposing counsel did not re-cross because there was no new ground to attack.

The discipline is hardest with junior associates handling the redirect — there is an instinct to ask the witness to "explain" or "clarify" multiple cross points. Train against this. The single sharpest redirect point beats five mediocre ones.

Cross-reference: deposition prep cycle (companion strategy for the cross-prep side).`,
    summary:
      'Redirect should be surgical (1–2 points, 2–3 questions). Long redirects re-open the witness for re-cross. Pinnacle: 3-question redirect on a single document ended cross damage with no re-cross.',
    classification: 'strategy',
    authorPlaceholderId: 'lawyer-rafael-estrada',
    mentions: [],
    involves: ['matter-pinnacle'],
    createdAt: '2023-10-30T16:30:00Z',
    metadata: { insight_category: 'deposition_practice' },
  },
  {
    placeholderId: 'insight-058',
    title: 'Foreign arbitral award enforcement: public-policy defense posture in PH',
    body: `In Cordillera Mining Arbitration the threshold enforcement issue is the public-policy defense under Article V(2)(b) of the New York Convention. PH courts have applied the defense narrowly in the relatively few prior enforcement matters we have observed, but the doctrine is thin and the precedential anchors are not fully developed.

Our research and a 2023 colleague consultation suggests the operative pattern. PH courts will sustain a public-policy challenge to a foreign arbitral award when the award would compel conduct affirmatively prohibited by PH statute or would violate a fundamental constitutional principle. Pure economic-policy disagreements with the foreign-tribunal outcome have not been sustained.

The Cordillera opposition is framing the public-policy defense around alleged inconsistency with PH mining-sector regulatory law. Our counter-strategy is to characterize the alleged inconsistency as a routine regulatory-overlap issue rather than a fundamental public-policy conflict.

Honest acknowledgment: this is an underdeveloped doctrinal area in PH practice. Our confidence in predicting outcomes is moderate. The matter is one we are tracking carefully and the lessons learned will inform subsequent enforcement matters. For now, the operating thesis is narrow construction of the public-policy defense.`,
    summary:
      'Public-policy defense to foreign arbitral award enforcement in PH is doctrinally thin. Operating thesis: courts construe narrowly, requiring affirmative statutory or constitutional conflict, not regulatory overlap. Tracking Cordillera carefully.',
    classification: 'research',
    authorPlaceholderId: 'lawyer-carlos-reyes',
    about: ['concept-arbitration-enforcement'],
    mentions: ['witness-ostrowski'],
    involves: ['matter-cordillera'],
    cites: ['statute-nyc', 'statute-adr-act'],
    createdAt: '2024-11-04T15:00:00Z',
    metadata: { insight_category: 'arbitration', confidence_marker: 'medium' },
  },
  {
    placeholderId: 'insight-059',
    title: 'Expert-testimony reliability objections under 2019 Revised Rules on Evidence',
    body: `The 2019 Revised Rules on Evidence include expanded expert-witness provisions that are broadly analogous to FRE 702 and 703 but not co-extensive. Practical questions have arisen as the rules are interpreted at the trial-court level.

The rule expansion clarifies that an expert may testify if the witness's scientific, technical, or other specialized knowledge will help the trier of fact, the testimony is based on sufficient facts, the testimony is the product of reliable principles and methods, and the expert has reliably applied the principles. The four-element formulation is structurally similar to FRE 702.

Distinctions worth tracking. PH practice does not formally adopt Daubert's reliability-gating function as US courts do; the trial-court determination is more discretionary. The "facts or data" foundation under FRE 703 is treated less rigorously in PH practice — we have not seen a PH trial court exclude an expert opinion solely on inadequate factual foundation.

This is an actively-developing area. Our limited matter-data on these objections (mostly Daubert-style methodology challenges, see cluster 1) suggests trial courts are receptive to FRE-702-flavored challenges but the FRE-703-flavored "underlying data" challenges have not yet produced traction. As more matters resolve, the picture should sharpen.

Caveat: doctrinal coverage is thin. Treat predictions accordingly.`,
    summary:
      '2019 Revised Rules on Evidence expanded expert provisions are FRE-702-analogous but not co-extensive. FRE-703-style underlying-data challenges have not produced traction in PH trial courts in our observed matters. Doctrinally thin area.',
    classification: 'research',
    authorPlaceholderId: 'lawyer-diana-santos',
    about: ['concept-expert-qualification', 'concept-daubert'],
    mentions: ['concept-damages-cross', 'precedent-daubert'],
    cites: ['statute-rules-evidence'],
    createdAt: '2024-08-28T11:00:00Z',
    metadata: { insight_category: 'evidence_doctrine', confidence_marker: 'medium' },
  },
  {
    placeholderId: 'insight-060',
    title: 'Dr. Caldwell — comparable-transactions methodology weakness on PH market premia',
    body: `Dr. Roman Caldwell, opposing damages expert in Meridian and at least one matter handled by a peer firm, has a consistent methodological weakness. His comparable-transactions approach uses US and EU transaction sets as the primary benchmark, with adjustment factors for PH market premia. The adjustment factors he applies are consistently too narrow.

What "too narrow" means. His PH market-premia adjustment in Meridian was 8% — a single composite adjustment factor. The methodologically sound adjustment for the matter's specific industry (regulated telecom) was 18–22% based on local market-cap-to-revenue multiples for comparable PH-listed entities. We documented the gap with Dr. Salazar's industry analysis in rebuttal.

On cross, the technique that worked was to walk Caldwell through the adjustment-factor derivation and ask which PH-specific transactions he had considered in setting the 8% figure. His answer revealed that he had not consulted any specific PH transactions and was applying a generic emerging-markets premium drawn from a US-published methodology paper. The court credited the gap in its weight assessment.

If Caldwell appears again for opposition in any PH-market matter, the comparable-transactions PH-premia angle is the documented vulnerability. The Meridian transcript paragraphs 312–340 contain the impeachment.`,
    summary:
      'Dr. Caldwell uses US/EU comparable transactions with thin PH market-premia adjustment (8% in Meridian where 18–22% was methodologically warranted). Meridian transcript ¶¶312–340 contains the impeachment.',
    classification: 'observation',
    authorPlaceholderId: 'lawyer-lourdes-villaroman',
    about: ['concept-damages-cross', 'concept-comparable-transactions'],
    mentions: ['witness-caldwell', 'witness-salazar'],
    involves: ['matter-meridian'],
    createdAt: '2023-08-22T13:45:00Z',
    metadata: { insight_category: 'expert_witness_cross_examination', expert_pattern_kit: true },
  },
  {
    placeholderId: 'insight-061',
    title: 'Pre-trial conference strategy in commercial dockets',
    body: `The pre-trial conference is the single highest-leverage procedural moment in PH commercial matters. The pre-trial order issued out of the conference defines the operative issues, marks the admissibility of stipulated documents, and constrains the trial-stage evidentiary scope. The cost of an inadequately prepared pre-trial conference is felt for the remainder of the matter.

Operational protocol that has worked across matters. First, the pre-trial brief is drafted by the partner-level attorney with no junior delegation; the document is too consequential. Second, the pre-trial brief includes proposed admissions on every documentary and factual element the opposition will struggle to dispute; many of these survive into the pre-trial order. Third, all motions in limine are filed in the pre-trial window (cross-reference cluster 2 on Br. 147 practice).

Common error to avoid. Counsel often treat the pre-trial conference as a scheduling formality. It is not. Judges issue pre-trial orders reflecting the substantive positioning expressed in the brief; under-preparing the brief produces an unfavorable order that constrains the rest of the matter.

In Helios and Banyan the pre-trial briefs were drafted with this discipline and the resulting orders favored our procedural posture. In Skylark the pre-trial brief was under-prepared by the prior team (before the matter rotated to us); the resulting order constrained our SJ posture and contributed to the unfavorable outcome.`,
    summary:
      'Pre-trial conference is the highest-leverage procedural moment. Partner-drafted brief (no junior delegation); include aggressive proposed admissions; file all MILs in the window. Skylark loss had under-prepared pre-trial as a root cause.',
    classification: 'strategy',
    authorPlaceholderId: 'lawyer-joaquin-tirona',
    about: ['concept-mil'],
    mentions: ['judge-buenaventura'],
    involves: ['matter-helios', 'matter-banyan', 'matter-skylark'],
    createdAt: '2024-01-08T09:00:00Z',
    metadata: { insight_category: 'procedural' },
  },
  {
    placeholderId: 'insight-062',
    title: 'Helios damages-theory retrospective: what worked, what we would do differently',
    body: `The Helios damages posture has been our most extensive damages-theory development to date. Several decisions have paid off; one would be made differently in a similar future matter.

What worked. First, retaining Dr. Pugeda as our affirmative damages expert produced a defensible figure with methodologically sound foundation. His comparable-transactions analysis with appropriate PH market premium adjustments has held up under opposition challenge. Second, the early pull of opposing-expert Dr. Mei's academic record (cluster 1) produced the decisive impeachment on counsel-supplied assumptions. Third, the structured-settlement framing in early counsel-to-counsel discussions positioned the matter for a non-monetary-component resolution.

What we would do differently. We initially anchored too high in our damages demand. The opposing posture was that even an aggressive defense scenario produced damages 30–40% below our initial number; the gap created credibility friction in the early stages. A more measured initial anchor would have produced earlier settlement openness.

For future post-acquisition damages matters, the operational pattern: retain Dr. Pugeda (or comparable rebuttal-trained expert) at intake; pull opposing-expert record within 30 days of opposing expert identification; anchor damages demand at the mid-scenario rather than aggressive ceiling; preserve structured-settlement framing in early correspondence.`,
    summary:
      'Helios damages: Dr. Pugeda rebuttal expert + Dr. Mei academic-record impeachment + structured-settlement framing all worked. Lesson: initial damages anchor was too high — anchor at mid-scenario, not aggressive ceiling, in future matters.',
    classification: 'lesson_learned',
    authorPlaceholderId: 'lawyer-carlos-reyes',
    about: ['concept-damages-cross', 'concept-structured-settlement'],
    mentions: ['witness-pugeda', 'witness-mei', 'concept-counsel-supplied-assumptions'],
    involves: ['matter-helios'],
    createdAt: '2024-11-22T14:00:00Z',
    metadata: { insight_category: 'expert_witness_cross_examination' },
  },
  {
    placeholderId: 'insight-063',
    title: 'Skylark loss retrospective: integration clause defense we underestimated',
    body: `Skylark Distribution closed unfavorable on summary judgment in 2023. The retrospective is uncomfortable but important to record. The proximate cause was an integration-clause defense from opposing counsel that we underestimated at intake and through discovery.

What happened. The dealership agreement contained a standard integration clause stating it represented the entire agreement of the parties. Our client's case theory relied substantially on alleged oral promises and course-of-dealing modifications. The opposing SJ motion argued (correctly under PH contract jurisprudence) that the integration clause foreclosed the modification theories. The court agreed.

What we should have done differently. First, the integration-clause vulnerability should have been identified at intake. The client's contract had it; the case theory ignored it. Second, even with the integration clause, the dealership-termination theory had alternative paths under Article 19/Article 20 of the Civil Code (abuse of right and acts contrary to law). We developed these too late — the SJ posture was already set against us. Third, the damages expert (Dr. Garcia for opposition; see cluster 1 insight on his terminal-growth pattern) was not cross-prepared with the rigor we now apply.

Recorded for the next dealership-termination matter: integration-clause review is the first intake step; alternative tort/equity theories should be developed at intake even if not the lead theory.`,
    summary:
      'Skylark closed unfavorable: integration clause defense underestimated at intake; case theory ignored its applicability. Lessons: integration-clause review is intake step 1; develop tort/equity alternatives early; damages cross-prep rigor.',
    classification: 'lesson_learned',
    authorPlaceholderId: 'lawyer-vincent-lao',
    about: ['concept-summary-judgment'],
    mentions: ['witness-garcia', 'concept-dcf'],
    involves: ['matter-skylark'],
    cites: ['statute-rule-35'],
    createdAt: '2023-06-30T10:00:00Z',
    metadata: { insight_category: 'matter_retrospective' },
  },
];

// ─── Hand-authored Edges ─────────────────────────────────────────────────────
// Cross-insight related_to edges and any other manually curated connections
// not derivable from insight metadata. Populated incrementally as clusters
// are authored.

export const HAND_AUTHORED_EDGES: readonly SeedEdge[] = [
  // Damages-expert cluster cross-references — dense related_to graph between
  // the 10 insights that all touch the mandatory demo query.
  { source: 'insight-001', target: 'insight-004', type: 'related_to', weight: 0.95 },
  { source: 'insight-001', target: 'insight-002', type: 'related_to', weight: 0.85 },
  { source: 'insight-001', target: 'insight-009', type: 'related_to', weight: 0.90 },
  { source: 'insight-002', target: 'insight-005', type: 'related_to', weight: 0.80 },
  { source: 'insight-002', target: 'insight-006', type: 'related_to', weight: 0.75 },
  { source: 'insight-002', target: 'insight-010', type: 'related_to', weight: 0.80 },
  { source: 'insight-003', target: 'insight-001', type: 'related_to', weight: 0.85 },
  { source: 'insight-003', target: 'insight-008', type: 'related_to', weight: 0.85 },
  { source: 'insight-004', target: 'insight-009', type: 'related_to', weight: 0.90 },
  { source: 'insight-004', target: 'insight-006', type: 'related_to', weight: 0.75 },
  { source: 'insight-005', target: 'insight-007', type: 'related_to', weight: 0.90 },
  { source: 'insight-006', target: 'insight-001', type: 'related_to', weight: 0.75 },
  { source: 'insight-007', target: 'insight-005', type: 'related_to', weight: 0.90 },
  { source: 'insight-008', target: 'insight-001', type: 'related_to', weight: 0.80 },
  { source: 'insight-009', target: 'insight-001', type: 'related_to', weight: 0.90 },
  { source: 'insight-010', target: 'insight-002', type: 'related_to', weight: 0.80 },
  { source: 'insight-010', target: 'insight-003', type: 'related_to', weight: 0.75 },

  // Cluster 2 — Judge Buenaventura
  { source: 'insight-011', target: 'insight-014', type: 'related_to', weight: 0.95 },
  { source: 'insight-011', target: 'insight-012', type: 'related_to', weight: 0.80 },
  { source: 'insight-011', target: 'insight-015', type: 'related_to', weight: 0.75 },
  { source: 'insight-012', target: 'insight-013', type: 'related_to', weight: 0.90 },
  { source: 'insight-012', target: 'insight-014', type: 'related_to', weight: 0.75 },
  { source: 'insight-013', target: 'insight-011', type: 'related_to', weight: 0.70 },
  { source: 'insight-015', target: 'insight-011', type: 'related_to', weight: 0.75 },

  // Cluster 3 — Villanueva & Associates
  { source: 'insight-016', target: 'insight-017', type: 'related_to', weight: 0.90 },
  { source: 'insight-016', target: 'insight-018', type: 'related_to', weight: 0.80 },
  { source: 'insight-017', target: 'insight-018', type: 'related_to', weight: 0.75 },
  { source: 'insight-019', target: 'insight-020', type: 'related_to', weight: 0.75 },
  { source: 'insight-019', target: 'insight-016', type: 'related_to', weight: 0.80 },
  { source: 'insight-020', target: 'insight-016', type: 'related_to', weight: 0.70 },

  // Cross-cluster bridges
  { source: 'insight-015', target: 'insight-007', type: 'related_to', weight: 0.85 }, // MIL practice across damages + Br. 147
  { source: 'insight-011', target: 'insight-016', type: 'related_to', weight: 0.65 }, // Br. 147 page discipline ↔ V&A page bloat

  // Cluster 4 — Trade secrets / SJ doctrine
  { source: 'insight-021', target: 'insight-023', type: 'related_to', weight: 0.90 }, // SJ density ↔ identification specificity
  { source: 'insight-021', target: 'insight-024', type: 'related_to', weight: 0.85 }, // SJ density ↔ reasonable measures custodians
  { source: 'insight-022', target: 'insight-023', type: 'related_to', weight: 0.80 }, // Pennswell template ↔ identification specificity
  { source: 'insight-022', target: 'insight-024', type: 'related_to', weight: 0.75 }, // Pennswell template ↔ reasonable measures
  { source: 'insight-023', target: 'insight-024', type: 'related_to', weight: 0.75 }, // identification ↔ reasonable measures
  { source: 'insight-024', target: 'insight-025', type: 'related_to', weight: 0.70 }, // reasonable measures ↔ misappropriation evidence
  { source: 'insight-025', target: 'insight-022', type: 'related_to', weight: 0.65 }, // temporal proximity ↔ Pennswell pleading

  // Cluster 5 — Settlement dynamics
  { source: 'insight-026', target: 'insight-027', type: 'related_to', weight: 0.85 }, // early mediation ↔ post-ruling leverage
  { source: 'insight-027', target: 'insight-028', type: 'related_to', weight: 0.80 }, // post-ruling leverage ↔ structured settlements
  { source: 'insight-027', target: 'insight-019', type: 'related_to', weight: 0.85 }, // post-ruling leverage ↔ V&A timing (cross-cluster)
  { source: 'insight-028', target: 'insight-030', type: 'related_to', weight: 0.80 }, // structured settlements ↔ negotiator separation
  { source: 'insight-029', target: 'insight-026', type: 'related_to', weight: 0.70 }, // mediator patterns ↔ early mediation
  { source: 'insight-030', target: 'insight-027', type: 'related_to', weight: 0.70 }, // negotiator separation ↔ post-ruling leverage

  // Cluster 6 — Procedural / local rules
  { source: 'insight-031', target: 'insight-034', type: 'related_to', weight: 0.95 }, // verified pleadings ↔ board resolution
  { source: 'insight-031', target: 'insight-035', type: 'related_to', weight: 0.75 }, // verified pleadings ↔ service rigor
  { source: 'insight-032', target: 'insight-033', type: 'related_to', weight: 0.70 }, // courtesy copies ↔ emergency protocol
  { source: 'insight-033', target: 'insight-035', type: 'related_to', weight: 0.65 }, // Br. 28 emergency ↔ QC service rigor

  // Additional cross-cluster bridges
  { source: 'insight-021', target: 'insight-011', type: 'related_to', weight: 0.65 }, // SJ trade-secrets ↔ Br. 147 SJ practice
  { source: 'insight-025', target: 'insight-016', type: 'related_to', weight: 0.55 }, // misappropriation evidence ↔ V&A discovery

  // Cluster 7 — Judge Navarro
  { source: 'insight-036', target: 'insight-037', type: 'related_to', weight: 0.85 }, // Navarro TAR ↔ long opinions
  { source: 'insight-036', target: 'insight-055', type: 'related_to', weight: 0.95 }, // Navarro TAR ↔ TAR methodology submission
  { source: 'insight-037', target: 'insight-038', type: 'related_to', weight: 0.75 }, // long opinions ↔ expert breadth
  { source: 'insight-038', target: 'insight-040', type: 'related_to', weight: 0.90 }, // Navarro expert breadth ↔ Lim JA contrast
  { source: 'insight-039', target: 'insight-036', type: 'related_to', weight: 0.65 }, // Navarro sanctions ↔ Navarro TAR (both Br. 7 discovery)
  { source: 'insight-039', target: 'insight-017', type: 'related_to', weight: 0.70 }, // Navarro sanctions ↔ V&A sanctions (cross-cluster)

  // Cluster 8 — remaining judges
  { source: 'insight-040', target: 'insight-041', type: 'related_to', weight: 0.80 }, // Lim JA ↔ Lim slow docket
  { source: 'insight-040', target: 'insight-015', type: 'related_to', weight: 0.85 }, // Lim JA ↔ Buenaventura MIL (cross-cluster)
  { source: 'insight-040', target: 'insight-007', type: 'related_to', weight: 0.80 }, // Lim JA ↔ JA Rule MIL (damages cluster bridge)
  { source: 'insight-040', target: 'insight-038', type: 'related_to', weight: 0.85 }, // Lim JA ↔ Navarro expert breadth (judges contrast)
  { source: 'insight-042', target: 'insight-044', type: 'related_to', weight: 0.70 }, // Cruz jurisdictional ↔ Tolentino Rule 65 (procedural barriers)
  { source: 'insight-043', target: 'insight-052', type: 'related_to', weight: 0.90 }, // Mendoza-F ↔ Coastal market def
  { source: 'insight-044', target: 'insight-051', type: 'related_to', weight: 0.85 }, // Tolentino Rule 65 ↔ Aragon Rule 65 strategy
  { source: 'insight-045', target: 'insight-021', type: 'related_to', weight: 0.75 }, // Veloso TRO ↔ trade-secret SJ (Br. 51 IP)
  { source: 'insight-045', target: 'insight-022', type: 'related_to', weight: 0.65 }, // Veloso TRO ↔ Pennswell pleading

  // Cluster 9 — remaining opposing firms
  { source: 'insight-046', target: 'insight-047', type: 'related_to', weight: 0.85 }, // Bernardo ↔ Santos Cruz MIL
  { source: 'insight-046', target: 'insight-054', type: 'related_to', weight: 0.95 }, // Bernardo ↔ depo objection protocol
  { source: 'insight-047', target: 'insight-015', type: 'related_to', weight: 0.80 }, // Santos Cruz MIL ↔ Buenaventura MIL
  { source: 'insight-048', target: 'insight-046', type: 'related_to', weight: 0.70 }, // Bautista vs Bernardo (depo style contrast)
  { source: 'insight-049', target: 'insight-019', type: 'related_to', weight: 0.85 }, // Ramos settlement curve ↔ V&A settlement timing
  { source: 'insight-049', target: 'insight-027', type: 'related_to', weight: 0.70 }, // Ramos ↔ post-ruling leverage
  { source: 'insight-050', target: 'insight-019', type: 'related_to', weight: 0.80 }, // Whitfield delay ↔ V&A timing
  { source: 'insight-050', target: 'insight-028', type: 'related_to', weight: 0.75 }, // Whitfield ↔ structured settlement
  { source: 'insight-051', target: 'insight-044', type: 'related_to', weight: 0.95 }, // Aragon Rule 65 ↔ Tolentino enforcement

  // Cluster 10 — domain deepening
  { source: 'insight-052', target: 'insight-043', type: 'related_to', weight: 0.90 }, // Coastal market ↔ Mendoza-F rigor
  { source: 'insight-053', target: 'insight-055', type: 'related_to', weight: 0.85 }, // Helena scienter ↔ TAR methodology (securities + TAR)
  { source: 'insight-053', target: 'insight-002', type: 'related_to', weight: 0.70 }, // Helena scienter ↔ Daubert (Helena context)
  { source: 'insight-054', target: 'insight-046', type: 'related_to', weight: 0.95 }, // depo protocol ↔ Bernardo counter
  { source: 'insight-055', target: 'insight-036', type: 'related_to', weight: 0.95 }, // TAR methodology ↔ Navarro TAR

  // Cluster 11 — final filler + medium-confidence + retrospectives
  { source: 'insight-056', target: 'insight-054', type: 'related_to', weight: 0.85 }, // depo prep cycle ↔ depo objection protocol
  { source: 'insight-056', target: 'insight-009', type: 'related_to', weight: 0.65 }, // depo prep cycle ↔ pre-depo academic record pull
  { source: 'insight-057', target: 'insight-056', type: 'related_to', weight: 0.75 }, // redirect ↔ depo prep
  { source: 'insight-058', target: 'insight-002', type: 'related_to', weight: 0.55 }, // arbitration enforcement ↔ Daubert (both research-flavored)
  { source: 'insight-059', target: 'insight-002', type: 'related_to', weight: 0.75 }, // FRE 702/703 PH ↔ Daubert challenges
  { source: 'insight-059', target: 'insight-005', type: 'related_to', weight: 0.70 }, // FRE 702/703 PH ↔ expert qualification
  { source: 'insight-060', target: 'insight-004', type: 'related_to', weight: 0.85 }, // Caldwell pattern ↔ Mei pattern (companion expert profiles)
  { source: 'insight-060', target: 'insight-001', type: 'related_to', weight: 0.75 }, // Caldwell pattern ↔ counsel-supplied assumptions
  { source: 'insight-060', target: 'insight-053', type: 'related_to', weight: 0.70 }, // Caldwell ↔ Helena context (cross-matter expert)
  { source: 'insight-061', target: 'insight-015', type: 'related_to', weight: 0.80 }, // pre-trial conference ↔ Br. 147 MIL window
  { source: 'insight-061', target: 'insight-031', type: 'related_to', weight: 0.65 }, // pre-trial conference ↔ verified pleadings
  { source: 'insight-061', target: 'insight-063', type: 'related_to', weight: 0.80 }, // pre-trial conference ↔ Skylark retrospective
  { source: 'insight-062', target: 'insight-001', type: 'related_to', weight: 0.90 }, // Helios retrospective ↔ counsel-supplied assumptions
  { source: 'insight-062', target: 'insight-003', type: 'related_to', weight: 0.85 }, // Helios retrospective ↔ three-step rebuttal
  { source: 'insight-062', target: 'insight-028', type: 'related_to', weight: 0.85 }, // Helios retrospective ↔ structured settlement
  { source: 'insight-062', target: 'insight-027', type: 'related_to', weight: 0.75 }, // Helios retrospective ↔ post-ruling leverage
  { source: 'insight-063', target: 'insight-010', type: 'related_to', weight: 0.90 }, // Skylark retrospective ↔ Garcia terminal-growth
];
