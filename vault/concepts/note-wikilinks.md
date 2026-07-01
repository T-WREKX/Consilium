---
title: Note wikilinks and backlinks
type: concept
status: active
tags: [capture, graph, ui, consilium, obsidian]
sources: [consilium-product-requirements, consilium-project-architecture]
created: 2026-05-15
updated: 2026-05-15
---

# Note wikilinks and backlinks

Author-stated note-to-note linking inside the personal layer, adapted from [[obsidian|Obsidian]] for an IndexedDB MVP. The user types `[[Title]]` in the body; on save, the link is resolved against the local note corpus to a stable UUID, persisted on the note, and rendered as an interactive chip in a read-only preview pane. A backlinks panel surfaces incoming references with body context. This is the human-curated counterpart to the AI-derived edges in [[derived-edges]] — both feed the [[consilium-capture-implementation|personal graph]], but with different visual weight and different provenance.

## Why it exists

The [[auto-organization-pipeline]] gives the personal graph **entity edges** (note → entity). It does not give the user a way to state "this note relates to *that other note*" without going through an entity. Wikilinks fill the gap: a first-class, author-stated note↔note edge type. Inspiration is the [[llm-wiki-pattern|LLM Wiki pattern]] applied one layer down — the lawyer's own notes form a mini-wiki inside their personal layer.

## Syntax and parsing

- **Syntax**: `[[Note Title]]` inline in the note body. Single line, no nested brackets.
- **Out of scope (MVP)**: aliases (`[[Title|alias]]`), section anchors (`[[Title#heading]]`), nested brackets.
- **Parser**: `apps/web/src/lib/wikilinks.ts` → `parseWikilinks(body)`. Single regex pass, returns `{ rawLabel, position: [start, end] }` tokens.

## Resolution rules

`resolveWikilinks(tokens, notes, sourceNoteId)`:

- **Match**: case-insensitive exact title match against live (non-soft-deleted) notes.
- **Exclusions**: the source note itself (no self-links); soft-deleted notes.
- **Ambiguity**: multiple matches → pick the most recently updated note; the label is added to an `ambiguous` array for future UI surfacing.
- **No match**: returned as an unresolved link with empty `targetNoteId`. Unresolved links are **not persisted** — only resolved links are written to `note.links`. Unresolved tokens stay in the body and re-resolve on every save (so creating the target note later "heals" the link automatically).

Resolution runs **at save time** in `noteStore.saveNote`. The result is stored on the note as `NoteLink[]`:

```ts
interface NoteLink {
  targetNoteId: string;     // stable UUID — survives renames
  displayLabel: string;     // original label as typed
  position?: [start, end];  // for backlink snippets
}
```

Because the link is bound to a UUID, **renaming the target note does not break the link** — the resolved chip just displays the new title on next render.

## Click behavior

`WikilinkChip` (`apps/web/src/components/WikilinkChip.tsx`) renders inside the `NotePreview` pane and the `OrganizePanel` Links section:

| State | Visual | Click action |
|---|---|---|
| Resolved | Filled chip, displays target note's *current* title | Open target note in capture view |
| Unresolved (no `targetNoteId`) | Dashed/muted chip | **Create a new stub note with that title**, then open it |

Stub-on-click is the same pattern as Obsidian's "create note" UX — a forward-only authoring affordance that doesn't require breaking flow.

## Backlinks panel

`BacklinksPanel` (`apps/web/src/views/capture/BacklinksPanel.tsx`) lives under the editor on the active note. Computed in-memory from the global note store: any other live note whose `links` array contains a `targetNoteId` matching the active note. Each backlink card shows the source title and a ±75-char snippet around the link position. Click navigates to that source.

## Personal-graph treatment

`linked_to` is a distinct edge type, visually the loudest:

| Edge type | Provenance | Visual |
|---|---|---|
| `mentions` (note → entity) | [[auto-organization-pipeline]] | solid `#21262d`, opacity 0.35, width 0.75 |
| `linked_to` (note → note) | **author-stated wikilink** | **solid `#9d4edd` (insight purple), opacity 0.7, width 1.2** |
| `related_to` ([[derived-edges|derived]]) | inferred from shared entities / co-occurrence | dashed `[4,3]`, opacity 0.25, width 0.5 |
| `about` (note → classification hub) | derived Phase 2 | dotted, opacity 0.15, width 0.4 |

The `linked_to` edge uses the same purple as the insight node it connects, so author-stated connections read as **direct continuations of the note** rather than ambient relatedness. Solid > dashed > dotted is the strict hierarchy.

## Soft delete and link integrity

Notes are tombstoned via `deletedAt: epoch_ms`, not removed from the IDB store. `getAllNotes()` filters them out by default; `getAllNotes({ includeDeleted: true })` is available for future trash/restore UI. Wikilink resolution **skips soft-deleted notes** in both directions: deleted notes don't show up as link targets, and they don't render as backlinks. The tombstone preserves the row in case a future "undelete" surface is added.

## Provenance and AI/user merge (organize panel context)

The wikilink work shipped alongside an **`OrganizeProvenance`** model on `PersonalNote`:

```ts
interface OrganizeProvenance {
  entities: 'unset' | 'ai' | 'user';
  classification: 'unset' | 'ai' | 'user';
  privilege: 'unset' | 'ai' | 'user';
}
```

The merge function (`apps/web/src/lib/organizeMerge.ts`) is the single source of truth for combining AI output with user state:

- **User-set fields are preserved.** When the user has manually set a classification or privilege flag, the AI's value is *not* applied; instead it surfaces as `Suggested: X (Accept / Dismiss)` inline.
- **Entities** are union-merged by `${type}:${name}` (case-insensitive). User-added entities are preserved.
- **`dismissedEntityKeys`** records AI-suggested entities the user explicitly removed. On subsequent runs, those keys are filtered out before merge — so AI does not silently re-add what the user just dismissed.

This pattern is conceptually separate from wikilinks but ships in the same surface (see [[auto-organization-pipeline]] for the AI-side specifics).

## Relations

- **Inspired by**: [[obsidian]] (the IDE that defines the pattern), [[llm-wiki-pattern]] (the same idea one layer up)
- **Visualized in**: [[consilium-capture-implementation|personal graph]] as `linked_to` edges
- **Distinct from**: [[derived-edges]] (AI-inferred, dashed) and [[auto-organization-pipeline]] entity edges (extracted, solid grey)
- **Persisted in**: [[consilium-data-model|IndexedDB]] on `PersonalNote.links`

## Open questions

- **Team-graph propagation**: wikilinks live in the personal layer only. On publish, the redaction pipeline strips body text but does not carry author-stated `linked_to` edges across. Should published-insight-to-published-insight links survive sanitization?
- **Aliases and anchors**: `[[Title|alias]]` and `[[Title#section]]` are MVP-deferred. Both are common Obsidian patterns; surface depends on whether notes grow long enough for sections to matter.
- **Ambiguity UI**: today the most-recently-updated note wins silently. A disambiguation surface would matter once corpora have many same-titled notes.

## Sources

- [[consilium-product-requirements]]
- [[consilium-project-architecture]]
