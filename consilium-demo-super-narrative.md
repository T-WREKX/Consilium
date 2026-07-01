# Consilium · Demo Super Narrative

**Type:** Rehearsal-grade script
**Narrative:** "The Returning Expert" (primary) with "Pluggable Brain" closing frame
**Duration:** 5 minutes target, 4:30 minimum, 5:30 absolute maximum
**Cast on stage:**
- **Presenter** — plays Sarah Chen, a 5th-year senior associate at Acme Litigation Partners
- **Wingperson** — operates the second account login, advances slides, handles recovery if something breaks
**Demo medium:** live web app, projected, with a backup screen recording on a second laptop

---

## How to Use This Document

This is a rehearsal script, not a reading script. Read it. Practice it. Internalize the beats. By the day of the demo, you should not be reading from this document on stage — you should be performing from memory with this document in your pocket as a safety net.

**Notation:**
- **Bold text** = words you speak aloud, verbatim
- *Italic text* = stage direction, what you do, what's happening on screen
- `[brackets]` = timing marks or contingency triggers
- **\[\[clicks and inputs\]\]** = specific UI actions

**Pacing rule of thumb:**
- 130–140 words per minute of speaking
- Pauses of 2–3 seconds at each beat transition
- Pauses of 5–8 seconds during visual moments (the redaction reveal, the query overlay) — let the visuals breathe

**The script is timed for 4:50.** This leaves 10 seconds of buffer for the inevitable small delays (a slow AI response, a click that misses, a thought that lands particularly well). If you finish under 4:30, you rushed. If you go over 5:00, cut from the close, never from the middle.

---

## The Five-Beat Spine

| Beat | Time | Target Length | What Lands |
|---|---|---|---|
| 1. Frame the problem | 0:00–0:30 | 30s | The setup: a lawyer with a real problem |
| 2. Capture | 0:30–1:30 | 60s | Voice → structured note → personal graph updates |
| 3. Publish with redaction | 1:30–3:00 | 90s | The wow moment: privacy architecture made visible |
| 4. Query with overlay | 3:00–4:30 | 90s | The climax: the firm's brain answers with citations |
| 5. Close + pluggable brain frame | 4:30–5:00 | 30s | The strategic positioning |

---

## Pre-Flight Checklist

**Run this checklist 30 minutes before the demo. Every item, every time.**

### Browser and environment

- [ ] Demo laptop charged to 100%, plugged in
- [ ] Backup laptop charged to 100%, plugged in, ready
- [ ] Display cable tested with both laptops
- [ ] Screen resolution set to 1920×1080 (or whatever the projector prefers)
- [ ] Browser zoom at exactly 100% on the demo browser
- [ ] All non-demo browser tabs closed
- [ ] Notifications silenced on demo laptop (Do Not Disturb mode)
- [ ] Phone silenced
- [ ] Backup screen recording of the full demo loaded on a second device, ready to play if the live demo fails catastrophically

### Consilium state

- [ ] Consilium deployed at the public URL
- [ ] Seed data freshly loaded — re-run `POST /api/seed` 30 minutes before demo
- [ ] All three demo accounts verified working:
  - `litigator@acme.law` / `demo` — logs in, personal graph populated
  - `lead@acme.law` / `demo` — logs in, role visible
  - `admin@acme.law` / `demo` — logs in, role visible
- [ ] Mandatory demo query tested in the last 30 minutes — produces good cited response
- [ ] Refusal-case query tested — returns the refusal text
- [ ] Audio recording tested in browser — microphone permission granted
- [ ] Network connection tested with the venue's Wi-Fi (do this hours ahead if possible)
- [ ] Mobile hotspot ready as backup internet
- [ ] Gemini API key has remaining quota
- [ ] Postgres + Presidio + frontend all healthy

### Presenter readiness

- [ ] Water on stage, within reach
- [ ] Script reviewed once in the last hour, then put away
- [ ] First sentence memorized word-for-word
- [ ] Last sentence memorized word-for-word
- [ ] Voice warm (sing or speak aloud for a minute before going on)
- [ ] Time check: know exactly when you start and when 5:00 is

### Wingperson readiness

- [ ] Second browser tab pre-opened, ready to log in as `lead@acme.law` for the role-switch moment
- [ ] Clicker / advancer tested if using
- [ ] Knows the four recovery triggers (see Failure Recovery section)
- [ ] Knows how to start the backup screen recording at exactly the right moment if needed
- [ ] Watches the clock; signals at 4:30 if presenter is overrunning

---

## The Verbatim Script

---

### Beat 1 — Frame the Problem (0:00–0:30)

*Stand center stage. Don't open the laptop yet. Make eye contact with the judges. Wait for the room to settle.*

**"I'm a senior associate at a litigation firm.**

**"Tomorrow morning, I have to depose a damages expert named Dr. Janet Mei. She has testified against our firm three times before. I need to figure out tonight how to cross-examine her tomorrow.**

**"Most lawyers in this position open a Word document and start from scratch.**

**"Tonight, I'm going to use Consilium."**

*Turn to the screen. Open the laptop / cue the browser display.*

`[Time check: should be at 0:25 here. If you're already past 0:35, you opened too slow.]`

---

### Beat 2 — Capture (0:30–1:30)

*Browser shows Consilium login page.*

**"This is Consilium. I'll log in as myself — Sarah Chen, senior associate."**

**\[\[Type `litigator@acme.law` and `demo`. Click Sign in.\]\]**

*Personal graph view loads, populated with Sarah's seeded notes. Don't dwell — judges should see the density without you pointing at it.*

**"This is my personal knowledge graph. Everything I've captured over the last two years lives here, on my device. It never goes to a server in its raw form."**

*Brief gesture at the graph. 2 seconds, no more.*

**"I want to capture something new — a quick note about today's prep call. I'll use voice."**

**\[\[Click the capture button in the nav. Select audio.\]\]**

*Audio capture screen loads with the record button prominent.*

**"I'll just talk."**

**\[\[Click record.\]\]**

*Speak naturally, as if dictating. Don't read from this script — internalize and improvise around it. 25–30 seconds.*

**"Talked to opposing counsel today about Mei's report. She's using a DCF model again — lost enterprise value, around eighty-seven million. Same pattern as Helios. Every assumption in her model is sourced from counsel. Growth rate, discount rate, comparable transactions — she hasn't done independent verification. Need to prep for tomorrow's deposition. Question for the firm — have we cross-examined her on this before?"**

**\[\[Click stop.\]\]**

*Transcription processes. Should take 3–5 seconds. Don't fill the silence — let the system work.*

*The transcript appears. The AI begins organizing. Entity chips populate:*
- *Dr. Janet Mei (witness)*
- *Helios Acquisition (matter)*
- *DCF methodology (concept)*
- *Counsel-supplied assumptions (concept)*

*Classification appears: Strategy. Privilege flag activates: Privileged.*

*The personal graph updates live, with the new note connecting to Dr. Mei's existing entity node (which was already in Sarah's graph from previous matters).*

**"Notice what just happened. I spoke for 30 seconds. The system transcribed me, extracted the entities I mentioned, classified the note as strategy, flagged it as privileged, and connected it to everyone I already know about in this matter.**

**"All of this happened on my device. Nothing has been published. The firm doesn't see this yet — and won't, until I decide it should."**

`[Time check: should be at 1:25–1:30. If you're past 1:40, you spent too long on capture — speed up.]`

---

### Beat 3 — Publish with Redaction (1:30–3:00) · THE WOW MOMENT

**"But here's where it gets interesting. I want to share what I learned today with the rest of my practice group. The firm should know about this pattern.**

**"But I can't just push this note to the firm. It names the client. It names the specific matter. It contains my work product. This is privileged material — it cannot leave the privileged context as-is."**

*Brief pause. This is the architectural setup. Make sure the judges absorb it.*

**"Watch what Consilium does."**

**\[\[Click "Publish to team graph" button.\]\]**

*The redaction modal opens. Side-by-side diff appears. Original note on left, sanitized version on right, with each redaction visually marked on both sides.*

*Hold for 2 seconds. Let the judges register what they're seeing.*

**"On the left is what I wrote. On the right is what would be published. Watch."**

*Point at the screen. Walk through specific redactions slowly. Mouse over them so the connecting highlights appear.*

**"'Helios Acquisition' becomes 'a recent acquisition matter.'**

**"'Dr. Janet Mei' becomes 'an expert we have now seen across multiple cases.'**

**"The eighty-seven million dollar figure becomes 'a substantial damages figure.' Specific dates become relative."**

*Pause. Point at the preservation score at the top — 4 of 5 dots, "High."*

**"And critically — the strategic insight survives. The system measures whether the meaning is preserved after redaction. If it strips too much for the insight to be useful, it tells me, and asks me to refine."**

*Brief pause to let that land.*

**"This is the move no other AI tool in legal can make. Harvey can't do this. CoCounsel can't do this. ChatGPT certainly can't do this — because none of them can see the privileged version in the first place. Consilium built privacy into the architecture from day one."**

**\[\[Click Publish.\]\]**

*Confirmation toast appears: "Published. 34 colleagues can now see this insight."*

**"Now thirty-four colleagues in my practice group can learn from what I just observed. None of them will ever see the client's name, the matter, or the privileged details. They'll see the strategic insight."**

`[Time check: should be at 2:55–3:00. If you're past 3:15, the redaction beat ran long — accelerate the close of this beat and move to retrieval.]`

---

### Beat 4 — Query with Overlay (3:00–4:30) · THE CLIMAX

*Reset for the climax. Take a small breath.*

**"Now imagine my colleague. Different lawyer, different matter, but also deposing Dr. Mei next month. He logs in to Consilium."**

**\[\[Wingperson switches to second account: `lead@acme.law`. Or use account-switch UI if present.\]\]**

*Chat interface loads.*

**"He doesn't know I just published that note. But he has a question, and he asks the firm."**

**\[\[Type the query slowly so judges can read along:\]\]**

**"What has our firm learned about cross-examining expert witnesses on damages calculations?"**

*Hold for a beat before submitting. Let the judges read it.*

**\[\[Press Enter.\]\]**

*STOP TALKING. The visual carries the next 8–10 seconds.*

*Chat dims to 30% opacity within 150ms.*

*Full-screen overlay fades in over 400ms. Backdrop blur. Team graph fades in at center.*

*All nodes at 15% opacity for a beat.*

*Then: cited nodes begin to pulse to full brightness in waves. One. Then another. Then another. Seven nodes light up over about 1 second. Connecting edges illuminate to amber.*

*Hold the full-state visual for 1 second.*

*The overlay begins to fade. The chat un-dims. The streaming response begins.*

*Start reading aloud as the response appears, in sync with the streaming:*

**"Our firm has developed a consistent set of approaches for cross-examining damages experts. The most effective technique across our matters has been to surface the expert's reliance on counsel-supplied assumptions rather than independent verification..."**

*Continue reading the streaming response as it appears. Don't get ahead of the stream; pace yourself with it. About 30–40 seconds of reading.*

*Citations appear as inline chips: [1], [2], [3].*

*When the response is complete:*

**\[\[Click citation [1].\]\]**

*Source panel slides in from the right, showing the original insight with the contributor's name and date.*

**"Every claim is grounded. Every citation traces back to a specific colleague's insight, on a specific matter, on a specific date.**

**"This is not ChatGPT making things up. This is my firm thinking with me."**

*Brief pause.*

**"In the answer, you can see at least four different strategies developed by at least three different colleagues across multiple matters. None of them knew the others were working the same problem. Consilium surfaced the pattern."**

`[Time check: should be at 4:25–4:30. If you're past 4:40, skip directly to the close — don't add filler.]`

---

### Beat 5 — Close + Pluggable Brain Frame (4:30–5:00)

*Step back from the laptop slightly. This is where you stop showing and start framing. Slow your pace.*

**"What you just saw is the layer that's been missing from legal AI.**

**"Capture privileged thinking on-device. Publish what's worth sharing with privacy preserved. Query the firm's accumulated knowledge with citations grounded in real colleague experience.**

**"This is Consilium. The privacy-first knowledge fabric for law firms."**

*Final beat. Let it breathe.*

**"And it's not just a product. The firm's accumulated knowledge becomes infrastructure. Any AI tool the firm uses — Harvey, CoCounsel, the firm's own internal builds — plugs into the Consilium brain through an MCP endpoint. Every AI tool the firm adopts becomes firm-aware.**

**"We are not in the legal AI competition. We are the substrate that makes every other AI tool the firm uses actually work.**

**"Thank you."**

*Step back. Smile. Hold for applause / Q&A.*

`[Time check: should be at 4:55–5:00. If you finish at 4:45, that's fine — leave time for questions. If you go past 5:10, you're over.]`

---

## Failure Recovery Playbook

The wingperson watches for these triggers and intervenes if the presenter freezes.

### Trigger A: Audio recording fails

**Symptom:** Microphone permission denied, recording produces no waveform, or transcription returns empty.

**Recovery line for presenter:**
> "Let me type the same thing — same flow, same AI organization."

*Switch to text capture. Paste a pre-prepared version of the same note from a notes file you have open in a hidden tab.*

**Cost:** ~10 seconds of momentum. Recoverable.

### Trigger B: AI organization doesn't extract entities

**Symptom:** Transcript appears but no entity chips populate. Personal graph doesn't update.

**Recovery line:**
> "And the AI can take a moment to organize — in the meantime, let me show you what the graph looks like after extraction."

*Click into an existing pre-seeded note that has full entity extraction. Show that view. Move on to publish flow using that note instead.*

**Cost:** 15–20 seconds. Loses live-capture authenticity but preserves the rest of the demo.

### Trigger C: Redaction modal fails to open or shows broken state

**Symptom:** Click publish, modal doesn't appear, or appears with no diff.

**Recovery line:**
> "The architectural moment Consilium is built around is this redaction pipeline. Let me show you how it works."

*Wingperson advances to a pre-prepared slide showing a static screenshot of the redaction modal with annotations. Walk the judges through the screenshot for 20 seconds.*

*Then:*

> "And once published, the sanitized version flows to the team graph. Let me show you what happens when a colleague queries it."

*Skip directly to Beat 4.*

**Cost:** 20–30 seconds. The biggest loss in the demo — redaction is the wow moment. Recoverable but painful.

### Trigger D: Query returns no results / overlay doesn't animate

**Symptom:** Chat query submitted, nothing returned, or returned with the refusal text instead of cited content.

**Recovery line:**
> "And one of the things Consilium does is refuse to hallucinate. If the firm hasn't captured knowledge on a topic, the system says so. Let me try a different query the firm has more depth on."

*Re-submit the mandatory demo query, which has been pre-tested and seeded extensively.*

**Cost:** 15 seconds. Actually turns into a feature — the refusal moment is itself something judges will note.

### Trigger E: Streaming response stalls mid-stream

**Symptom:** Response starts streaming, then halts halfway through.

**Recovery line:**
> "And while that completes, look at the citation trail — every claim traces back to a specific colleague's insight."

*Click any citation that's already rendered. Show the source panel. Continue talking about citation grounding while the wingperson signals OK or NOT OK on the stream.*

**If stream is dead:**

> "The response was reaching seven cited insights from four different colleagues across three matters. Let me close on what makes this architecturally different."

*Skip to Beat 5. Lose ~20 seconds of demo content but preserve the close.*

**Cost:** 20 seconds. Worst case for retrieval moment but salvageable.

### Trigger F: Catastrophic failure (whole app down, network gone, etc.)

**Symptom:** Browser shows error, network indicator red, nothing loads.

**Recovery line:**
> "The live system needed a moment. Let me show you what you would have seen."

*Wingperson cues the backup screen recording. Presenter narrates over it as it plays.*

*Continue narrating beats 3, 4, and 5 over the recording.*

**Cost:** Loses live-demo authenticity. Still delivers the full content arc. The recording is on a second device — keep it loaded and ready every time.

---

## Anti-Patterns: What Not to Do

These are the most common ways live demos fail not from technical breakage but from presenter error.

### Don't apologize for mocked elements

If something is mocked (the MCP endpoint, an integration), don't say "this is mocked." Say "and this connects to our MCP endpoint" and continue. Judges expect hackathon demos to have mocked pieces; apologizing draws attention to weakness.

### Don't read your slides

The product is on screen. Use it. Talk to the judges. The script in this document is for *rehearsal*; on stage you should be performing from internalized memory, with the product as the visual focus.

### Don't oversell the AI

Consilium is not the smartest AI in legal. Consilium is the most appropriately grounded AI. Lean into "this is your firm's thinking, not a model's guess." Overselling AI capability is the fastest way to lose technical judges.

### Don't dwell on capture

Capture is the lowest-novelty moment of the three hero moments. Judges have seen note-taking apps. They have not seen real-time PII redaction visualized. Speed through capture; spend your time on redaction and retrieval.

### Don't fill silence during the query overlay

When the chat dims and the graph fades in, **stop talking**. The visual is doing the work. Silence on stage during a powerful visual moment reads as confidence. Commentary undermines it.

### Don't apologize for the seed data being fictional

Every demo uses fictional data. Treat Acme Litigation Partners as if it's a real client. Treat Dr. Janet Mei as if she's a real expert witness. The narrative integrity matters more than the literal truth of the data.

### Don't break character mid-demo

You are Sarah Chen, a senior associate, until Beat 5. Don't suddenly become "the developer who built Consilium" mid-demo. Switch personas only at the close, when you frame the strategic positioning.

### Don't run over

Going over 5:00 is the single most damaging thing you can do. Judges form their final impression in the last 30 seconds, and if you're rushing because you're over time, the close lands badly. Cut from the middle if you have to. Never sacrifice the close.

---

## The 90-Second Emergency Demo

If for any reason you are given less time than expected (judge says "you have two minutes" mid-demo, schedule compresses, prior presenter ran long):

**Cut capture entirely. Run only redaction + retrieval.**

### 0:00–0:30 — Frame

**"Legal AI is structurally blocked by attorney-client privilege. No major AI tool can see what a lawyer actually writes about a client matter. Consilium solves this with architecture, not policy. Let me show you the two moments that matter."**

### 0:30–1:15 — Redaction

**\[\[Open an existing note. Click publish.\]\]**

*Redaction modal opens. Walk through redactions for 30 seconds.*

**"Privileged content stays on the lawyer's device. Sanitized content reaches the firm. The strategic insight survives. No one else does this."**

### 1:15–2:30 — Retrieval

**\[\[Submit the mandatory demo query.\]\]**

*Query overlay fires. Wait for the visual.*

*Read the response as it streams. Click a citation.*

**"Grounded in real colleague thinking. Citations trace back to specific lawyers, specific matters, specific dates. This is the firm thinking with itself."**

### 2:30–3:00 — Close

**"Consilium is the privacy-first knowledge fabric for law firms. The layer that makes every other AI tool the firm uses actually work. Thank you."**

---

## Rehearsal Schedule

This is the rehearsal cadence that produces a stage-ready demo. Compress if needed; don't skip the dress rehearsals.

### T-minus 3 days

- Presenter reads the script aloud, alone, in a quiet room. Twice. No timing yet. Focus on internalizing the language.
- Wingperson reads the failure recovery playbook. Memorizes the six recovery lines.

### T-minus 2 days

- First full run with the live app. Presenter and wingperson together. Time it. Expect 6:00–7:00 the first time.
- Identify the three weakest beats. Re-run those individually 3 times each.
- Run the whole demo a second time. Should land at 5:30–6:00.

### T-minus 1 day

- Three full dress rehearsals back-to-back. Treat each like the real thing. Time every one.
- After each, identify the single biggest issue. Fix it before the next run.
- By the third run, should land within 4:45–5:15.
- Practice the 90-second emergency demo at the end of the session. Once.

### T-minus 4 hours

- One final run. Don't stop or restart. Whatever happens, push through and time it.
- Do the pre-flight checklist.
- Then put the script away. Get water. Walk around. Don't re-rehearse.

### T-minus 30 minutes

- Pre-flight checklist again.
- Test the mandatory demo query and the refusal case one more time.
- Verify the backup screen recording is queued.

### T-minus 5 minutes

- Take a breath.
- Memorize this single sentence: **"I'm a senior associate at a litigation firm."** That's the opening. Everything else flows from it.

---

## After the Demo

- The wingperson is responsible for noting any questions judges ask that weren't answered. Write them down. They become Q&A prep for follow-ups.
- The presenter gets water and doesn't try to debrief immediately. Let the demo settle.
- Within 30 minutes, sit down together and identify: what worked, what didn't, what surprised you, what to refine if there's another presentation opportunity (final round, sponsor showcase, etc.).
- If the demo went well, the team's instinct will be to relax. Don't. The Q&A is where deals are made or lost.

---

## The Final Note

Five minutes on stage. Six days of building. Whatever you've built, the judges only see this five minutes.

Treat the script with care. Rehearse it until it's invisible. Walk on stage knowing every beat. Then let it land.

You have one job in those five minutes: make the judges understand that **Consilium is the privacy-architected substrate that legal AI has been missing.** Everything else in the script is in service of that understanding.

Win.
