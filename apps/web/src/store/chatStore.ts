import { create } from 'zustand';
import type { ChatKind, ChatMessage, ConfidenceLevel } from '../types';

interface ChatState {
  messages: ChatMessage[];
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
}

let messageCounter = 0;

function generateId(): string {
  return `msg_${Date.now()}_${++messageCounter}`;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isStreaming: false,
  isPending: false,
  citedNodeIds: [],
  confidence: null,
  overlayActive: false,

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
