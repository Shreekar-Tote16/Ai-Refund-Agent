import type { AgentState } from "@/lib/agent/state";
import { logStep } from "@/lib/logger";
import { validateProposedDecision } from "@/lib/policy/refund-policy";
import { getOrderDetails } from "@/lib/services/order.service";
import { getExistingRefundsForOrderItem } from "@/lib/services/refund.service";
import { jsonValue } from "@/lib/services/conversation.service";

export async function policyValidatorNode(state: AgentState): Promise<AgentState> {
  if (!state.orderId || !state.orderItemId || !state.proposedDecision) {
    state.validatedDecision = {
      status: "ESCALATED",
      approvedAmount: null,
      rationale: "The request did not include enough verified information for an automatic refund decision.",
      policyChecks: [{ rule: "complete_context", passed: false, detail: "Missing order, item, or proposed decision." }],
      overridden: false
    };
    return state;
  }

  const order = await getOrderDetails(state.orderId);
  if (!order) throw new Error("Order disappeared during policy validation.");
  const existingRefunds = await getExistingRefundsForOrderItem(state.orderItemId);
  state.validatedDecision = validateProposedDecision({
    order,
    orderItemId: state.orderItemId,
    existingRefunds,
    reason: state.reason,
    proposedStatus: state.proposedDecision.status,
    proposedAmount: state.proposedDecision.amount,
    proposedRationale: state.proposedDecision.rationale
  });
  logStep(state.logs, {
    stepType: "POLICY_CHECK",
    nodeName: "policyValidator",
    summary: state.validatedDecision.overridden
      ? "Policy validator overrode the model proposal."
      : "Policy validator confirmed the model proposal.",
    policyChecks: jsonValue(state.validatedDecision.policyChecks)
  });
  return state;
}
