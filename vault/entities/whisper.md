---
title: Whisper (OpenAI)
type: entity
status: active
tags: [ai-model, transcription, openai]
sources: [consilium-project-architecture, consilium-product-requirements]
created: 2026-05-12
updated: 2026-05-14
---

# Whisper

OpenAI's speech-to-text model. **Not used in the current MVP implementation** — audio transcription was migrated to [[gemini]] Flash (see below). Whisper remains the V1 on-device transcription candidate.

## Key facts

- **Specified in**: [[consilium-project-architecture]] and [[consilium-product-requirements]] as the MVP transcription backend.
- **Not shipped in MVP**: replaced by `gemini-2.5-flash` inline audio transcription before hackathon cutoff (2026-05-14). The `openai` npm package was removed from `apps/api/package.json`.
- **Audio format**: WebM/Opus (browser default) — unchanged by the migration; Gemini Flash accepts the same MIME type.
- **MVP cap**: 5-minute maximum recording duration (constant in `lib/audio.ts`) — unchanged.
- **Why migrated**: consolidate on a single API key (`GEMINI_API_KEY`); eliminate the `OPENAI_API_KEY` dependency for the hackathon build.

## Current implementation (as shipped)

`POST /api/transcribe` now uses `gemini-2.5-flash` with `inlineData` (base64-encoded audio), the same pattern as the vision route. Prompt: "Transcribe this audio exactly as spoken. Return only the transcription text, no commentary or formatting." Response shape is unchanged: `{ data: { transcript: string } }`.

## Role in capture flow (unchanged)

1. Lawyer records via MediaRecorder (waveform indicator, duration counter, 5-minute cap).
2. Stop triggers transcription via `POST /api/transcribe`.
3. Transcribed text becomes the body of a new note; the original audio Blob is stored in IndexedDB.
4. [[auto-organization-pipeline]] runs on the transcript.

## Relations

- **Replaced by**: [[gemini]] Flash for MVP transcription
- **Complement**: [[gemini]] (text/image/audio pipelines)

## Open questions

- Path for on-device speech recognition at V1 — Whisper.cpp on desktop, native speech APIs on mobile, or both?

## Sources

- [[consilium-project-architecture]]
- [[consilium-product-requirements]]
