// Interfaces from project-architecture.md §3.2
// APPEND-ONLY: add new types in the appropriate domain section below. Never edit existing entries.

// ─── Capture & Personal Graph ─────────────────────────────────────────────────

export type NoteClassification =
  | 'strategy'
  | 'observation'
  | 'lesson_learned'
  | 'action_item'
  | 'research'
  | 'meeting_summary';

export interface Entity {
  id: string;
  type:
    | 'matter'
    | 'party'
    | 'lawyer'
    | 'judge'
    | 'witness'
    | 'concept'
    | 'precedent'
    | 'statute';
  name: string;
  confidence: number;
}

export interface NoteLink {
  /** Stable UUID of the target note; survives title renames. Empty string for unresolved links. */
  targetNoteId: string;
  /** Original label the user typed inside [[...]] at link-creation time. */
  displayLabel: string;
  /** Optional [start, end] char offsets in body for editor highlighting. */
  position?: [number, number];
}

export type OrganizeFieldProvenance = 'unset' | 'ai' | 'user';

export interface OrganizeProvenance {
  entities: OrganizeFieldProvenance;
  classification: OrganizeFieldProvenance;
  privilege: OrganizeFieldProvenance;
}

export interface NoteFolder {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface PersonalNote {
  id: string;
  title: string;
  body: string;
  folderId?: string;
  contentType: 'text' | 'audio' | 'image';
  /** Stored via IDB structured clone — reconstruct with new Blob([arrayBuffer]) if retrieved as empty after a page reload. */
  audioBlob?: Blob;
  /** Stored via IDB structured clone — reconstruct with new Blob([arrayBuffer]) if retrieved as empty after a page reload. */
  imageBlob?: Blob;
  audioTranscript?: string;
  extractedEntities: Entity[];
  classification: NoteClassification;
  isPrivileged: boolean;
  isPublished: boolean;
  publishedNodeId?: string;
  createdAt: number; // epoch ms
  updatedAt: number; // epoch ms
  /** Outbound wikilinks resolved at save time. */
  links?: NoteLink[];
  /** Soft-delete marker. Absent = live note. */
  deletedAt?: number;
  /** Tracks whether each organize field was last set by AI or user. */
  organizeProvenance?: OrganizeProvenance;
  /** AI-suggested entities the user has previously removed; do not auto-re-add. Keys are `${type}:${name}`. */
  dismissedEntityKeys?: string[];
}

export interface OrganizeResponse {
  entities: Entity[];
  classification: NoteClassification;
  isPrivileged: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  retryable: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

// ─── Auth & Governance ────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'lawyer' | 'practice_group_lead' | 'knowledge_admin';
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RedactionItem {
  original: string;
  replacement: string;
  type: 'PII' | 'GENERALIZATION';
  position: [number, number];
}

export interface RedactResponse {
  original: string;
  sanitized: string;
  redactions: RedactionItem[];
  confidence: number;
}

export interface PublishResponse {
  nodeId: string;
  message: string;
}

// ─── Retrieval & Chat ─────────────────────────────────────────────────────────

export interface TeamGraphNode {
  id: string;
  nodeType: 'insight' | 'matter' | 'party' | 'lawyer' | 'judge'
    | 'witness' | 'concept' | 'precedent' | 'statute';
  title: string;
  body?: string;
  summary?: string;
  contributorId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface TeamGraphEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  edgeType: 'mentions' | 'involves' | 'cites' | 'authored_by'
    | 'about' | 'concerns' | 'related_to';
  weight: number;
}

export interface TeamGraph {
  nodes: TeamGraphNode[];
  edges: TeamGraphEdge[];
}

export type ChatKind = 'knowledge' | 'conversational';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  confidence?: ConfidenceLevel;
  sourceCount?: number;
  citedNodeIds?: string[];
  /** 'knowledge' for RAG-grounded answers, 'conversational' for chat replies. Assistant messages only. */
  kind?: ChatKind;
  timestamp: number;
}

export interface Citation {
  index: number;
  nodeId: string;
  title: string;
  summary?: string;
  nodeType: TeamGraphNode['nodeType'];
}

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'refuse';

