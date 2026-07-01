---
title: V1 on-device speech recognition — Whisper.cpp, native APIs, or both?
type: question
status: open
tags: [v1, audio, on-device]
sources: [consilium-project-architecture]
raised-on: [whisper]
created: 2026-05-12
updated: 2026-05-12
---

# V1 on-device speech recognition — Whisper.cpp, native APIs, or both?

## Status

**Open** — awaiting team decision.

## Why it matters

MVP uses cloud [[whisper|Whisper]] API. The [[local-first-architecture]] promise breaks for audio if transcription stays cloud — voice memos are the most privilege-sensitive capture surface (live client conversations, internal strategy discussions). V1 must move audio transcription on-device. (see [[whisper]], [[local-first-architecture]])

## What we know so far

- MVP: cloud Whisper API, 5-minute cap, WebM/Opus.
- V1: must be on-device per local-first claim.
- Options: Whisper.cpp (cross-platform, well-trodden), native speech APIs (`SFSpeechRecognizer` on iOS/macOS, `SpeechRecognizer` on Android, Windows Speech), or both.

## What would resolve it

- Pick a runtime per platform (desktop = Whisper.cpp; mobile = native APIs OR Whisper.cpp via the [[tauri|Tauri/React Native]] bridge).
- Decide whether transcription happens during recording (streaming) or after (batch).
- Confirm the accuracy bar for legal terminology (judge names, case citations, doctrine names).

## Answer

_(pending)_

## Related

- [[whisper]]
- [[local-first-architecture]]
- [[tauri]]
