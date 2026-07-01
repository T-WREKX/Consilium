---
title: How does the Tauri webview talk to on-device Gemma inference?
type: question
status: open
tags: [v1, desktop, tauri, gemma, ipc]
sources: [consilium-project-architecture]
raised-on: [tauri, gemma]
created: 2026-05-12
updated: 2026-05-12
---

# How does the Tauri webview talk to on-device Gemma inference?

## Status

**Open** — awaiting team decision.

## Why it matters

V1 runs [[gemma]] on-device for personal-layer extraction. The Consilium UI is a [[react-vite|React frontend]] inside the Tauri webview. There must be a bridge between the JS-side request ("organize this note") and the Rust-side / native inference path. Choices have real implications for latency, memory pressure, and crash isolation. (see [[tauri]], [[gemma]])

## What we know so far

- Tauri's Rust core is the natural place to host or supervise inference.
- Options: direct in-process via a Rust binding (e.g. llama.cpp / candle), sidecar process spawned by Tauri, or HTTP-localhost to a separately-shipped binary.
- Consilium hasn't committed to a runtime (llama.cpp, candle, MediaPipe, Ollama, etc.).

## What would resolve it

- Pick a runtime (llama.cpp, candle, MediaPipe, Ollama, etc.).
- Decide in-process vs sidecar (sidecar is more crash-isolated; in-process is lower latency).
- Decide on a shared inference queue or per-request spawning.

## Answer

_(pending)_

## Related

- [[tauri]]
- [[gemma]]
- [[local-first-architecture]]
