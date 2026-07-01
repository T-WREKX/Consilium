---
title: Litigator (persona)
type: entity
status: active
tags: [persona, user, consilium]
sources: [consilium-product-requirements, consilium-product-brief]
created: 2026-05-12
updated: 2026-05-12
---

# Litigator (persona)

Primary user of [[consilium]]. A 4–8 year litigation associate or senior associate at a mid-size firm (50–300 lawyers). Bills 1,900+ hours annually, works across 4–6 active matters.

## Key facts

- **Cares about**: efficient prep for repeat scenarios (similar matter types, same opposing counsel), better recall of past reasoning, faster ramp-up on inherited matters. (see [[consilium-product-requirements]])
- **Resistance pattern**: anything that adds documentation friction without clear personal payoff. Lawyers bill in six-minute increments; every minute documenting is a minute not billed. (see [[consilium-product-brief]])
- **MVP demo account**: `litigator@acme.law` / `demo` at [[acme-litigation-partners]].
- **Permissions in MVP**: capture personal notes; view personal graph; publish to team graph (auto-approved); query team brain; view team graph structure (read-only).
- **Permissions in V1**: same as MVP, but publishing requires [[knowledge-admin]] approval.

## What the Litigator does in the demo

1. Records a 30-second audio note about a deposition observation; [[whisper]] transcribes; [[auto-organization-pipeline]] extracts entities; personal graph updates live.
2. Clicks "Publish to team graph"; the [[redaction-pipeline]] runs; lawyer reviews the side-by-side diff and approves.
3. (In the second-lawyer role, after switching accounts) submits the canonical query; the [[query-overlay-animation]] runs; the cited answer streams.

## Why this persona is the wedge

Mid-size firms feel knowledge loss acutely — smaller than BigLaw's institutional infrastructure, larger than boutiques where everyone already knows everything. Litigation has the densest pattern-matching value: recurring judges, repeat opposing counsel, motion practice patterns.

## Relations

- **Works for**: [[acme-litigation-partners]] (demo)
- **Reports to**: [[practice-group-lead]]
- **Approval gate (V1)**: [[knowledge-admin]]
- **Persona contrast**: [[knowledge-admin]] (the buyer), [[practice-group-lead]] (the validator)

## Open questions

- What's the documented capture frequency assumption? PRD describes the surfaces but does not commit to a per-week minimum.

## Sources

- [[consilium-product-requirements]]
- [[consilium-product-brief]]
