export type ChatKind = 'knowledge' | 'conversational';

export type ChatTurn = {
  role: 'user' | 'assistant';
  content: string;
  citedNodeIds?: string[];
};

export type SseKindEvent = { kind: ChatKind };
export type SseCitedNodesEvent = { nodeIds: string[]; confidence: string };
export type SseTokenEvent = { text: string };
export type SseDoneEvent =
  | { kind: 'knowledge'; confidence: string; sourceCount: number }
  | { kind: 'conversational' };
export type SseErrorEvent = { message: string };
