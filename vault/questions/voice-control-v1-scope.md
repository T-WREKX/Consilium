---
title: Voice control "as a first-class feature" — V1 scope?
type: question
status: open
tags: [v1, accessibility, voice]
sources: [consilium-design-guidelines]
raised-on: [consilium-design-guidelines]
created: 2026-05-12
updated: 2026-05-12
---

# Voice control "as a first-class feature" — V1 scope?

## Status

**Open** — awaiting team decision.

## Why it matters

[[consilium-design-guidelines]] §10 asserts: *"Voice control as a first-class feature (mobile capture is voice-first; desktop has voice-feature-equal alongside text and image)."* "Voice-feature-equal" is broader than "audio capture" — it implies voice navigation, voice commands, voice-driven retrieval. None of that is specified anywhere else in the docs. (see [[consilium-design-guidelines]])

## What we know so far

- Audio capture (MediaRecorder + [[whisper]]) is shipping in MVP.
- "Voice-feature-equal on desktop" goes beyond capture.
- No voice-command grammar, voice-navigation surfaces, or voice-driven retrieval flow exists.

## What would resolve it

- Decide whether "voice-feature-equal" means (a) audio-capture as one of three capture modes (already done) or (b) full voice navigation.
- If (b): scope V1 ("press-and-hold mic in chat for spoken queries") vs V2 (full voice nav).
- Update the design guidelines to make the actual scope unambiguous.

## Answer

_(pending)_

## Related

- [[consilium-design-guidelines]]
- [[whisper]]
- [[on-device-speech-recognition-path]]
