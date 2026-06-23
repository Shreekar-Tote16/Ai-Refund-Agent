import type { Message } from "@prisma/client";
import { agentReasoningNode } from "@/lib/agent/nodes/agent-reasoning.node";
import { persistDecisionNode } from "@/lib/agent/nodes/persist-decision.node";
import { policyValidatorNode } from "@/lib/agent/nodes/policy-validator.node";
import { toolExecutorNode } from "@/lib/agent/nodes/tool-executor.node";
import type { AgentState } from "@/lib/agent/state";
import { formatCurrency } from "@/lib/utils";

export async function runRefundAgent(input: {
  conversationId: string;
  customerId: string;
  userMessage: string;
  orderId?: string;
  orderItemId?: string;
  history: Message[];
}) {
  let state: AgentState = {
    conversationId: input.conversationId,
    customerId: input.customerId,
    userMessage: input.userMessage,
    orderId: input.orderId ?? extractOrderId(input.userMessage),
    orderItemId: input.orderItemId,
    reason: input.userMessage,
    history: input.history,
    toolCallCount: 0,
    logs: [],
    toolEvents: []
  };

  state = await agentReasoningNode(state);
  state = await toolExecutorNode(state);
  if (state.toolCallCount > 6) {
    state.proposedDecision = {
      status: "ESCALATED",
      amount: null,
      rationale: "The agent reached the tool-call loop guard and escalated the request."
    };
  }
  state = await policyValidatorNode(state);
  state = await persistDecisionNode(state);
  if (!state.assistantMessage) {
    state.assistantMessage = formatAssistantMessage(state);
  }
  return {
    assistantMessage: state.assistantMessage,
    refundRequestId: state.refundRequestId,
    toolEvents: state.toolEvents
  };
}

function formatAssistantMessage(state: AgentState) {
  if (!state.validatedDecision) return state.assistantMessage ?? "Please choose an order so I can check the refund policy.";
  const decision = state.validatedDecision;
  const rationale = decision.rationale && decision.rationale.trim() ? decision.rationale : "No additional details provided.";
  
  if (decision.status === "APPROVED") {
    return `I've reviewed your order and verified it against our refund policy.

Good news — your refund has been approved.

Amount:
${formatCurrency(decision.approvedAmount)}

${rationale}

The refund will be processed shortly.`;
  }
  
  if (decision.status === "ESCALATED") {
    return `I've reviewed your request and this requires additional review.

Your refund request has been escalated to a support specialist.

Reason:
${rationale}

A specialist will review your case and get back to you within 1-2 business days.`;
  }
  
  return `I've reviewed your request and unfortunately I can't approve the refund because it violates our refund policy.

Reason:
${rationale}

If you believe this is incorrect, please contact customer support for further assistance.`;
}

function extractOrderId(message: string) {
  const match = message.match(/c[a-z0-9]{20,}/i);
  return match?.[0];
}
