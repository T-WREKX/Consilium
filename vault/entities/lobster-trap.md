---
title: Lobster Trap (Veea)
type: entity
status: active
tags: [security, integration, optional, hackathon]
sources: [consilium-context-dump]
created: 2026-05-12
updated: 2026-05-12
---

# Lobster Trap

[[veea|Veea]]'s **deep prompt-inspection (DPI) proxy**. Considered for [[consilium|Consilium]] as either a Track 1 reposition vehicle or an optional Track 4 integration component for the publish-to-team flow. **Deferred** — Path A (stay in Track 4) was chosen.

## Key facts

- **What it is**: an MIT-licensed, drop-in, OpenAI-compatible DPI proxy. (see [[consilium-context-dump]])
- **Vendor**: [[veea]] (Track 1 sponsor — Agent Security & AI Governance).
- **Considered role in Consilium**: act as the policy-enforcement layer for the [[redaction-pipeline|publish flow]] — every Gemini call would route through Lobster Trap, which inspects and enforces governance rules.
- **Decision**: Path A in [[hackathon-judging-fit]] — keep Consilium in Track 4 (Data & Intelligence), defer Lobster Trap integration as optional. If time appears at day 5, the integration adds an enterprise-security talking point.
- **Why deferred**: Track 1 would be crowded with pure security/governance tools, and Consilium's most natural positioning is the knowledge layer, not the governance layer. Integration is additive, not load-bearing.

## Relations

- **Vendor**: [[veea]]
- **Optional integration with**: [[redaction-pipeline]] (would sit between [[consilium]] backend and the Gemini API)
- **Hackathon track context**: [[hackathon-judging-fit]]

## Open questions

- If integrated at the last minute, what is the latency cost on a single redaction round-trip? Unmeasured.
- Does Lobster Trap's DPI ruleset come with sensible defaults for legal use, or would the team need to author policies?

## Sources

- [[consilium-context-dump]]
