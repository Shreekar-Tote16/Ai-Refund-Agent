// //C:\Users\user\ai-refund-agent\src\lib\agent\nodes\tool-executor.node.ts

// import type { AgentState } from "@/lib/agent/state";
// import { logStep } from "@/lib/logger";
// import { calculateRefundAmountTool } from "@/lib/agent/tools/calculate-refund-amount.tool";
// import { checkRefundEligibilityTool } from "@/lib/agent/tools/check-refund-eligibility.tool";
// import { getOrderDetailsTool } from "@/lib/agent/tools/get-order-details.tool";
// import { jsonValue } from "@/lib/services/conversation.service";

// export async function toolExecutorNode(state: AgentState): Promise<AgentState> {
//   if (!state.orderId) {
//     logStep(state.logs, {
//       stepType: "TOOL_RESULT",
//       nodeName: "toolExecutor",
//       summary: "No order was selected, so the agent asked for clarification.",
//       toolOutput: jsonValue({ error: "ORDER_REQUIRED" })
//     });
//     state.assistantMessage = "Please choose the order and item you want help refunding.";
//     return state;
//   }

//   const orderInput = { orderId: state.orderId };
//   logStep(state.logs, {
//     stepType: "TOOL_CALL",
//     nodeName: "toolExecutor",
//     summary: "Checking order details.",
//     toolName: "get_order_details",
//     toolInput: jsonValue(orderInput)
//   });
//   const orderResult = await getOrderDetailsTool(orderInput);
//   state.toolCallCount += 1;
//  const orderStarted = Date.now();
// const orderResult = await getOrderDetailsTool(orderInput);
// const orderDuration = Date.now() - orderStarted;

// state.toolEvents.push({
//   name: "get_order_details",
//   summary: "Checked order details",
//   status: "error" in orderResult ? "error" : "success",
//   inputs: orderInput,
//   outputs: orderResult,
//   timestamp: new Date(),
//   duration: orderDuration
// });
//   logStep(state.logs, {
//     stepType: "TOOL_RESULT",
//     nodeName: "toolExecutor",
//     summary: "Loaded order details.",
//     toolName: "get_order_details",
//     toolOutput: jsonValue(orderResult)
//   });

//   if ("error" in orderResult) {
//     state.proposedDecision = {
//       status: "ESCALATED",
//       amount: null,
//       rationale: "The order could not be found, so a human needs to review the request."
//     };
//     return state;
//   }

//   const orderItemId = state.orderItemId ?? orderResult.items[0]?.id;
//   state.orderItemId = orderItemId;
//   if (!orderItemId) {
//     state.proposedDecision = {
//       status: "ESCALATED",
//       amount: null,
//       rationale: "No refundable line item could be identified on the order."
//     };
//     return state;
//   }

//   const eligibilityInput = { orderId: state.orderId, orderItemId };
//   logStep(state.logs, {
//     stepType: "TOOL_CALL",
//     nodeName: "toolExecutor",
//     summary: "Checking refund eligibility.",
//     toolName: "check_refund_eligibility",
//     toolInput: jsonValue(eligibilityInput)
//   });
//   const eligibilityStarted = Date.now();
// const eligibility = await checkRefundEligibilityTool(eligibilityInput);
// const eligibilityDuration = Date.now() - eligibilityStarted;

// state.toolEvents.push({
//   name: "check_refund_eligibility",
//   summary: "Checked refund eligibility",
//   status: "error" in eligibility ? "error" : "success",
//   inputs: eligibilityInput,
//   outputs: eligibility,
//   timestamp: new Date(),
//   duration: eligibilityDuration
// });
//   logStep(state.logs, {
//     stepType: "TOOL_RESULT",
//     nodeName: "toolExecutor",
//     summary: "Refund eligibility check completed.",
//     toolName: "check_refund_eligibility",
//     toolOutput: jsonValue(eligibility)
//   });

//   const amountInput = { orderId: state.orderId, orderItemId, reason: state.reason };
//   const amountStarted = Date.now();
// const amount = await calculateRefundAmountTool(amountInput);
// const amountDuration = Date.now() - amountStarted;

// state.toolEvents.push({
//   name: "calculate_refund_amount",
//   summary: "Calculated refund amount",
//   status: "error" in amount ? "error" : "success",
//   inputs: amountInput,
//   outputs: amount,
//   timestamp: new Date(),
//   duration: amountDuration
// });
//   logStep(state.logs, {
//     stepType: "TOOL_RESULT",
//     nodeName: "toolExecutor",
//     summary: "Refund amount calculated.",
//     toolName: "calculate_refund_amount",
//     toolInput: jsonValue(amountInput),
//     toolOutput: jsonValue(amount)
//   });

//   if ("error" in eligibility || "error" in amount) {
//     state.proposedDecision = {
//       status: "ESCALATED",
//       amount: null,
//       rationale: "Required refund facts could not be verified."
//     };
//     return state;
//   }

//   state.proposedDecision = {
//     status: eligibility.status,
//     amount: eligibility.status === "APPROVED" ? amount.amount : null,
//     rationale: eligibility.reasons.join(" ")
//   };
//   logStep(state.logs, {
//     stepType: "TOOL_CALL",
//     nodeName: "agentReasoning",
//     summary: "Model finalized a structured refund decision.",
//     toolName: "finalize_decision",
//     toolInput: jsonValue(state.proposedDecision)
//   });
//   return state;
// }


//C:\Users\user\ai-refund-agent\src\lib\agent\nodes\tool-executor.node.ts

import type { AgentState } from "@/lib/agent/state";
import { logStep } from "@/lib/logger";
import { calculateRefundAmountTool } from "@/lib/agent/tools/calculate-refund-amount.tool";
import { checkRefundEligibilityTool } from "@/lib/agent/tools/check-refund-eligibility.tool";
import { getOrderDetailsTool } from "@/lib/agent/tools/get-order-details.tool";
import { jsonValue } from "@/lib/services/conversation.service";

export async function toolExecutorNode(state: AgentState): Promise<AgentState> {
  if (!state.orderId) {
    logStep(state.logs, {
      stepType: "TOOL_RESULT",
      nodeName: "toolExecutor",
      summary: "No order was selected, so the agent asked for clarification.",
      toolOutput: jsonValue({ error: "ORDER_REQUIRED" })
    });
    state.assistantMessage = "Please choose the order and item you want help refunding.";
    return state;
  }

  // ===== GET ORDER DETAILS =====
  const orderInput = { orderId: state.orderId };
  logStep(state.logs, {
    stepType: "TOOL_CALL",
    nodeName: "toolExecutor",
    summary: "Checking order details.",
    toolName: "get_order_details",
    toolInput: jsonValue(orderInput)
  });

  const orderStartedAt = new Date();
  const orderStarted = Date.now();
  const orderResult = await getOrderDetailsTool(orderInput);
  const orderDuration = Date.now() - orderStarted;

  state.toolCallCount += 1;
  state.toolEvents.push({
    name: "get_order_details",
    summary: "Checked order details",
    status: "error" in orderResult ? "error" : "success",
    inputs: orderInput,
    outputs: orderResult,
    timestamp: orderStartedAt,
    duration: orderDuration
  });

  logStep(state.logs, {
    stepType: "TOOL_RESULT",
    nodeName: "toolExecutor",
    summary: "Loaded order details.",
    toolName: "get_order_details",
    toolOutput: jsonValue(orderResult)
  });

  if ("error" in orderResult) {
    state.proposedDecision = {
      status: "ESCALATED",
      amount: null,
      rationale: "The order could not be found, so a human needs to review the request."
    };
    return state;
  }

  const orderItemId = state.orderItemId ?? orderResult.items[0]?.id;
  state.orderItemId = orderItemId;
  if (!orderItemId) {
    state.proposedDecision = {
      status: "ESCALATED",
      amount: null,
      rationale: "No refundable line item could be identified on the order."
    };
    return state;
  }

  // ===== CHECK REFUND ELIGIBILITY =====
  const eligibilityInput = { orderId: state.orderId, orderItemId };
  logStep(state.logs, {
    stepType: "TOOL_CALL",
    nodeName: "toolExecutor",
    summary: "Checking refund eligibility.",
    toolName: "check_refund_eligibility",
    toolInput: jsonValue(eligibilityInput)
  });

  const eligibilityStartedAt = new Date();
  const eligibilityStarted = Date.now();
  const eligibility = await checkRefundEligibilityTool(eligibilityInput);
  const eligibilityDuration = Date.now() - eligibilityStarted;

  state.toolCallCount += 1;
  state.toolEvents.push({
    name: "check_refund_eligibility",
    summary: "Checked refund eligibility",
    status: "error" in eligibility ? "error" : "success",
    inputs: eligibilityInput,
    outputs: eligibility,
    timestamp: eligibilityStartedAt,
    duration: eligibilityDuration
  });

  logStep(state.logs, {
    stepType: "TOOL_RESULT",
    nodeName: "toolExecutor",
    summary: "Refund eligibility check completed.",
    toolName: "check_refund_eligibility",
    toolOutput: jsonValue(eligibility)
  });

  // ===== CALCULATE REFUND AMOUNT =====
  const amountInput = { orderId: state.orderId, orderItemId, reason: state.reason };
  logStep(state.logs, {
    stepType: "TOOL_CALL",
    nodeName: "toolExecutor",
    summary: "Calculating refund amount.",
    toolName: "calculate_refund_amount",
    toolInput: jsonValue(amountInput)
  });

  const amountStartedAt = new Date();
  const amountStarted = Date.now();
  const amount = await calculateRefundAmountTool(amountInput);
  const amountDuration = Date.now() - amountStarted;

  state.toolCallCount += 1;
  state.toolEvents.push({
    name: "calculate_refund_amount",
    summary: "Calculated refund amount",
    status: "error" in amount ? "error" : "success",
    inputs: amountInput,
    outputs: amount,
    timestamp: amountStartedAt,
    duration: amountDuration
  });

  logStep(state.logs, {
    stepType: "TOOL_RESULT",
    nodeName: "toolExecutor",
    summary: "Refund amount calculated.",
    toolName: "calculate_refund_amount",
    toolOutput: jsonValue(amount)
  });

  // ===== FINALIZE DECISION =====
  if ("error" in eligibility || "error" in amount) {
    state.proposedDecision = {
      status: "ESCALATED",
      amount: null,
      rationale: "Required refund facts could not be verified."
    };
    return state;
  }

  state.proposedDecision = {
    status: eligibility.status,
    amount: eligibility.status === "APPROVED" ? amount.amount : null,
    rationale: eligibility.reasons.join(" ")
  };

  logStep(state.logs, {
    stepType: "TOOL_CALL",
    nodeName: "agentReasoning",
    summary: "Model finalized a structured refund decision.",
    toolName: "finalize_decision",
    toolInput: jsonValue(state.proposedDecision)
  });

  return state;
}