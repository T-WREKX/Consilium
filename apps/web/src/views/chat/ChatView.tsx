import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, PenLine, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { streamChat, buildHistoryPayload } from '../../api/chat';
import { ChatMessageComponent } from './ChatMessage';
import { NodeSummaryPanel } from './NodeSummaryPanel';
import { SourcesPanel } from './SourcesPanel';
import { QueryOverlay } from './QueryOverlay';
import { Logo } from '../../components/Logo';
import './chat.css';

/**
 * ChatView — Hero Moment 2 (design guidelines §8.2).
 */

const SUGGESTED_QUERIES = [
  'What strategies work for cross-examining expert witnesses?',
  'How do we handle summary judgment motions?',
  'What are our deposition timeline strategies?',
  'How should we approach settlement negotiations?',
];

export const ChatView: React.FC = () => {
  const [input, setInput] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [sourcesExpanded, setSourcesExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const {
    messages,
    isStreaming,
    isPending,
    citedNodeIds,
    overlayActive,
    addUserMessage,
    setPending,
    startStreaming,
    appendToken,
    finishStreaming,
    setOverlayActive,
    clearMessages,
  } = useChatStore();

  const handleResetChat = useCallback(() => {
    if (messages.length === 0) return;
    if (!window.confirm('Reset the chat? This clears all messages in this conversation.')) return;
    clearMessages();
    setSelectedNodeId(null);
    setSourcesExpanded(false);
    setInput('');
    inputRef.current?.focus();
  }, [messages.length, clearMessages]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(async (overrideQuery?: string) => {
    const query = (overrideQuery ?? input).trim();
    if (!query || isStreaming || isPending) return;

    if (!overrideQuery) setInput('');
    addUserMessage(query);
    setPending(true);

    const history = buildHistoryPayload(messages);

    try {
      await streamChat(query, history, token, {
        onKind: (kind) => {
          // For conversational replies, start streaming immediately — there
          // is no cited-nodes event coming. For knowledge replies, wait for
          // onCitedNodes so the overlay can read real node IDs.
          if (kind === 'conversational') {
            startStreaming([], null, 'conversational');
          }
        },
        onCitedNodes: (nodeIds, confidence) => {
          startStreaming(nodeIds, confidence, 'knowledge');
          setSourcesExpanded(confidence === 'medium' || confidence === 'low');
        },
        onToken: (text) => {
          appendToken('', text);
        },
        onDone: ({ confidence, sourceCount }) => {
          finishStreaming('', confidence ?? null, sourceCount ?? 0);
        },
        onError: (message) => {
          console.error('[chat] Stream error:', message);
          finishStreaming('', null, 0);
        },
      });
    } catch (err) {
      console.error('[chat] Failed to send query:', err);
      finishStreaming('', 'refuse', 0);
    } finally {
      setPending(false);
    }
  }, [input, isStreaming, isPending, token, messages, addUserMessage, setPending, startStreaming, appendToken, finishStreaming]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-grow textarea up to 4 lines
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const canSend = input.trim() && !isStreaming && !isPending;
  const lastMsg = messages[messages.length - 1];
  const isLastAssistantRefusal =
    lastMsg?.role === 'assistant' &&
    !isStreaming &&
    lastMsg.kind === 'knowledge' &&
    lastMsg.confidence === 'refuse';
  // Only dim when the knowledge-graph overlay is open. Conversational replies
  // skip the overlay entirely, so they should keep the chat fully readable.
  const dimChat = overlayActive;

  // Resolution set for citation chips: every node ID ever cited in this
  // conversation. Lets conversational follow-ups re-quote prior-turn citations.
  const allCitedNodeIds = React.useMemo(() => {
    const set = new Set<string>();
    for (const m of messages) {
      if (m.role === 'assistant' && m.citedNodeIds) {
        for (const id of m.citedNodeIds) set.add(id);
      }
    }
    // Also include the live streaming set (in case the current turn's IDs
    // haven't been persisted to the message yet).
    for (const id of citedNodeIds) set.add(id);
    return Array.from(set);
  }, [messages, citedNodeIds]);

  return (
    <div className="chat-root">
      <div className={`chat-content${dimChat ? ' chat-content--dimmed' : ''}`}>
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-main">
          <div>
            <h1>Team Brain</h1>
            <div className="chat-header-sub">
              Ask questions grounded in your firm's knowledge graph
            </div>
          </div>
          {messages.length > 0 && (
            <button
              type="button"
              className="chat-reset-btn"
              onClick={handleResetChat}
              disabled={isStreaming || isPending}
              title="Reset chat — clears all messages"
              aria-label="Reset chat"
            >
              <Trash2 size={14} />
              Reset chat
            </button>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-welcome">
            <div className="chat-welcome-logo">
              <Logo size={56} />
            </div>
            <span className="chat-welcome-title">
              {user ? `Welcome, ${user.displayName.split(' ')[0]}` : 'Welcome to Team Brain'}
            </span>
            <span className="chat-welcome-desc">
              Ask a question and receive answers cited directly from your firm's published insights.
              Every response is grounded — no hallucination.
            </span>

            <div className="chat-welcome-suggestions">
              {SUGGESTED_QUERIES.map((q) => (
                <button
                  key={q}
                  className="chat-suggestion"
                  onClick={() => handleSubmit(q)}
                  disabled={isStreaming || isPending}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => {
          // Don't render the empty placeholder bubble for the streaming
          // assistant message — the thinking-dots indicator below covers that
          // state, otherwise we get two stacked bubbles.
          const isEmptyStreamingAssistant =
            msg.role === 'assistant' &&
            msg.content === '' &&
            isStreaming &&
            msg === messages[messages.length - 1];
          if (isEmptyStreamingAssistant) return null;

          return (
            <React.Fragment key={msg.id}>
              <ChatMessageComponent
                message={msg}
                isStreaming={isStreaming && msg === messages[messages.length - 1]}
                onCitationClick={setSelectedNodeId}
                citedNodeIds={allCitedNodeIds}
              />
              {/* Sources panel — only after the latest assistant message, never on refusals */}
              {msg.role === 'assistant' &&
                !isStreaming &&
                msg === messages[messages.length - 1] &&
                msg.kind === 'knowledge' &&
                msg.confidence !== 'refuse' &&
                citedNodeIds.length > 0 && (
                  <SourcesPanel
                    citedNodeIds={citedNodeIds}
                    expanded={sourcesExpanded}
                    onToggle={() => setSourcesExpanded(!sourcesExpanded)}
                    onSourceClick={setSelectedNodeId}
                  />
                )}
            </React.Fragment>
          );
        })}

        {/* Refusal CTA — subtle suggestion to capture related personal note (§8.2) */}
        {isLastAssistantRefusal && (
          <motion.div
            className="chat-refusal-cta"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.35 }}
          >
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => navigate('/capture')}
            >
              <PenLine size={14} aria-hidden />
              Capture your thinking on this
            </button>
          </motion.div>
        )}

        {/* Thinking indicator — shows while pending OR streaming with no content yet */}
        {(isPending || (isStreaming && lastMsg?.role === 'assistant' && lastMsg.content === '')) && (
          <div className="chat-thinking">
            <div className="chat-avatar chat-avatar--assistant" aria-hidden>
              <Logo size={20} alt="" />
            </div>
            <div className="thinking-dots" aria-label="Thinking">
              <span className="thinking-dot" />
              <span className="thinking-dot" />
              <span className="thinking-dot" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="chat-input-area">
        <div className="chat-input-container">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask the firm..."
            disabled={isStreaming || isPending}
            rows={1}
            className="chat-input"
          />
          <motion.button
            onClick={() => handleSubmit()}
            disabled={!canSend}
            aria-label="Send message"
            className={`chat-send-btn ${canSend ? 'chat-send-btn--active' : 'chat-send-btn--disabled'}`}
            whileTap={canSend ? { scale: 0.94 } : undefined}
            transition={{ type: 'spring', stiffness: 420, damping: 22 }}
          >
            <Send size={18} />
          </motion.button>
        </div>
      </div>
      </div>

      {/* Sibling of .chat-content — escapes the dim cascade.
          Only shows when we're actually grepping the KB (overlayActive is set
          by startStreaming when there are real citations); during isPending
          we just dim + show the thinking dots. */}
      <QueryOverlay
        active={overlayActive}
        citedNodeIds={citedNodeIds}
        token={token}
        onDismiss={() => setOverlayActive(false)}
      />

      <NodeSummaryPanel
        nodeId={selectedNodeId}
        onClose={() => setSelectedNodeId(null)}
      />
    </div>
  );
};
