import type { AgentState } from "@/lib/agent/state";
import { prisma } from "@/lib/db";
import { logStep } from "@/lib/logger";
import { REFUND_POLICY_VERSION } from "@/lib/policy/refund-policy";
import { getOrderDetails } from "@/lib/services/order.service";
import { jsonValue } from "@/lib/services/conversation.service";

export async function persistDecisionNode(state: AgentState): Promise<AgentState> {
  if (!state.orderId || !state.validatedDecision) return state;
  const order = await getOrderDetails(state.orderId);
  const item = order?.items.find((candidate) => candidate.id === state.orderItemId) ?? order?.items[0];
  const requestedAmount = item ? item.unitPrice * item.quantity : 0;

  logStep(state.logs, {
    stepType: "DECISION",
    nodeName: "persistDecision",
    summary: `Persisting ${state.validatedDecision.status.toLowerCase()} refund decision.`,
    reasoningText: state.validatedDecision.rationale,
    policyChecks: jsonValue(state.validatedDecision.policyChecks)
  });

  const refund = await prisma.$transaction(async (tx) => {
    const created = await tx.refundRequest.create({
      data: {
        conversationId: state.conversationId,
        customerId: state.customerId,
        orderId: state.orderId as string,
        orderItemId: state.orderItemId,
        reason: state.reason,
        requestedAmount,
        approvedAmount: state.validatedDecision?.approvedAmount ?? null,
        status: state.validatedDecision?.status,
        decisionRationale: state.validatedDecision?.rationale ?? "",
        policyVersion: REFUND_POLICY_VERSION,
        decidedAt: new Date()
      }
    });
    await tx.agentLog.createMany({
      data: state.logs.map((log, index) => ({
        conversationId: state.conversationId,
        refundRequestId: created.id,
        stepNumber: index + 1,
        stepType: log.stepType,
        nodeName: log.nodeName,
        summary: log.summary,
        reasoningText: log.reasoningText,
        toolName: log.toolName,
        toolInput: log.toolInput,
        toolOutput: log.toolOutput,
        policyChecks: log.policyChecks,
        model: log.model,
        latencyMs: log.latencyMs
      }))
    });
    return created;
  });
  state.refundRequestId = refund.id;
  return state;
}
