import type { Message } from "@prisma/client";
import type { PendingAgentLog } from "@/lib/logger";
import type { RefundDecision } from "@/lib/policy/policy.types";

export type ToolEvent = {
  name: string;
  summary: string;
  status: "success" | "error" | "pending";
  inputs?: Record<string, unknown>;
  outputs?: Record<string, unknown>;
  timestamp: Date;
  duration?: number;
};

export type AgentState = {
  conversationId: string;
  customerId: string;
  userMessage: string;
  orderId?: string;
  orderItemId?: string;
  reason: string;
  history: Message[];
  toolCallCount: number;
  logs: PendingAgentLog[];
  toolEvents: ToolEvent[];
  proposedDecision?: {
    status: "APPROVED" | "DENIED" | "ESCALATED";
    amount: number | null;
    rationale: string;
  };
  validatedDecision?: RefundDecision;
  refundRequestId?: string;
  assistantMessage?: string;
};
