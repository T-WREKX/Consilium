import { create } from 'zustand';
import type { ChatKind, ChatMessage, ConfidenceLevel } from '../types';

const SESSION_STORAGE_KEY = 'consilium-chat-session-id';

function getOrCreateSessionId(): string {
  if (typeof sessionStorage === 'undefined') {
    return crypto.randomUUID();
  }
  let id = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_STORAGE_KEY, id);
  }
  return id;
}

interface ChatState {
  messages: ChatMessage[];
  sessionId: string;
  isStreaming: boolean;
  isPending: boolean; // Submitted; awaiting first response event (kind)
  citedNodeIds: string[];
  confidence: ConfidenceLevel | null;
  overlayActive: boolean;

  // Actions
  addUserMessage: (content: string) => string;
  setPending: (pending: boolean) => void;
  /**
   * Start streaming an assistant message. For conversational kind, pass [] and null;
   * the overlay stays off. For knowledge kind, pass real citedNodeIds + confidence;
   * the overlay activates iff confidence !== 'refuse' and there are citations.
   */
  startStreaming: (
    citedNodeIds: string[],
    confidence: ConfidenceLevel | null,
    kind: ChatKind
  ) => void;
  appendToken: (messageId: string, text: string) => void;
  finishStreaming: (
    messageId: string,
    confidence: ConfidenceLevel | null,
    sourceCount: number
  ) => void;
  setOverlayActive: (active: boolean) => void;
  clearMessages: () => void;
  /** Start a fresh Cognee session (cross-session memory demo). */
  resetSession: () => string;
  getSessionId: () => string;
}

let messageCounter = 0;

function generateId(): string {
  return `msg_${Date.now()}_${++messageCounter}`;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  sessionId: getOrCreateSessionId(),
  isStreaming: false,
  isPending: false,
  citedNodeIds: [],
  confidence: null,
  overlayActive: false,

  getSessionId: () => get().sessionId,

  resetSession: () => {
    const newId = crypto.randomUUID();
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(SESSION_STORAGE_KEY, newId);
    }
    set({
      messages: [],
      sessionId: newId,
      isStreaming: false,
      isPending: false,
      citedNodeIds: [],
      confidence: null,
      overlayActive: false,
    });
    return newId;
  },

  setPending: (pending: boolean) => set({ isPending: pending }),

  addUserMessage: (content: string) => {
    const id = generateId();
    const message: ChatMessage = {
      id,
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    set((state) => ({ messages: [...state.messages, message] }));
    return id;
  },

  startStreaming: (citedNodeIds, confidence, kind) => {
    const id = generateId();
    const message: ChatMessage = {
      id,
      role: 'assistant',
      content: '',
      citedNodeIds,
      confidence: confidence ?? undefined,
      kind,
      timestamp: Date.now(),
    };
    set((state) => ({
      messages: [...state.messages, message],
      isStreaming: true,
      isPending: false,
      citedNodeIds,
      confidence,
      // Overlay only fires for the knowledge path with real citations.
      // Conversational replies and refusals share the plain loading state.
      overlayActive:
        kind === 'knowledge' && confidence !== 'refuse' && citedNodeIds.length > 0,
    }));
  },

  appendToken: (_messageId: string, text: string) => {
    set((state) => ({
      messages: state.messages.map((m, i) => {
        if (i === state.messages.length - 1 && m.role === 'assistant') {
          return { ...m, content: m.content + text };
        }
        return m;
      }),
    }));
  },

  finishStreaming: (_messageId, confidence, sourceCount) => {
    set((state) => ({
      messages: state.messages.map((m, i) => {
        if (i === state.messages.length - 1 && m.role === 'assistant') {
          return {
            ...m,
            confidence: confidence ?? m.confidence,
            sourceCount,
          };
        }
        return m;
      }),
      isStreaming: false,
      isPending: false,
      overlayActive: false,
    }));
  },

  setOverlayActive: (active: boolean) => set({ overlayActive: active }),
  clearMessages: () =>
    set({
      messages: [],
      isStreaming: false,
      isPending: false,
      citedNodeIds: [],
      confidence: null,
      overlayActive: false,
    }),
}));
