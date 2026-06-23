import type {
  EligibilityResult,
  ExistingRefund,
  PolicyCheck,
  PolicyOrder,
  PolicyOrderItem,
  RefundDecision
} from "./policy.types";

export const REFUND_POLICY_VERSION = "2026-06-01";
export const DEFAULT_RETURN_WINDOW_DAYS = 30;
export const NON_REFUNDABLE_CATEGORIES = ["Gift Card", "Digital"];
export const AUTO_ESCALATION_THRESHOLD = 10000;

export function isWithinReturnWindow(deliveryDate: Date | null, returnWindowDays: number, now = new Date()): boolean {
  if (!deliveryDate) return false;
  const elapsedMs = now.getTime() - deliveryDate.getTime();
  const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);
  return elapsedDays <= returnWindowDays;
}

export function isCategoryReturnable(category: string, isReturnable: boolean): boolean {
  return isReturnable && !NON_REFUNDABLE_CATEGORIES.includes(category);
}

export function hasExistingRefund(existingRefunds: ExistingRefund[], orderItemId: string): boolean {
  return existingRefunds.some(
    (refund) =>
      refund.orderItemId === orderItemId &&
      ["PENDING", "APPROVED", "ESCALATED", "OVERRIDDEN"].includes(refund.status)
  );
}

export function calculateRefundAmount(item: PolicyOrderItem, reason: string): number {
  const baseAmount = item.unitPrice * item.quantity;
  const normalized = reason.toLowerCase();
  if (normalized.includes("missing accessory") || normalized.includes("partial")) {
    return roundCurrency(baseAmount * 0.25);
  }
  return roundCurrency(baseAmount);
}

export function evaluateEligibility(input: {
  order: PolicyOrder;
  orderItemId: string;
  existingRefunds: ExistingRefund[];
  now?: Date;
}): EligibilityResult {
  const { order, orderItemId, existingRefunds, now = new Date() } = input;
  const item = order.items.find((candidate) => candidate.id === orderItemId);
  const checks: PolicyCheck[] = [];

  checks.push({
    rule: "order_delivered",
    passed: order.status === "DELIVERED" && Boolean(order.deliveryDate),
    detail: order.status === "DELIVERED" ? "Order has been delivered." : "Order has not been delivered."
  });

  if (!item) {
    checks.push({ rule: "item_exists", passed: false, detail: "Order item was not found on this order." });
    return summarize(checks);
  }

  checks.push({ rule: "item_exists", passed: true, detail: "Order item belongs to the order." });
  checks.push({
    rule: "returnable_product",
    passed: isCategoryReturnable(item.product.category, item.product.isReturnable),
    detail: isCategoryReturnable(item.product.category, item.product.isReturnable)
      ? "Product category is refundable."
      : "Product category is not refundable."
  });
  checks.push({
    rule: "within_return_window",
    passed: isWithinReturnWindow(order.deliveryDate, item.product.returnWindowDays, now),
    detail: `Return window is ${item.product.returnWindowDays} days from delivery.`
  });
  checks.push({
    rule: "no_existing_open_refund",
    passed: !hasExistingRefund(existingRefunds, orderItemId),
    detail: hasExistingRefund(existingRefunds, orderItemId)
      ? "An open or completed refund already exists for this item."
      : "No open refund exists for this item."
  });
  checks.push({
    rule: "auto_escalation_threshold",
    passed: item.unitPrice * item.quantity <= AUTO_ESCALATION_THRESHOLD,
    detail:
      item.unitPrice * item.quantity <= AUTO_ESCALATION_THRESHOLD
        ? "Refund value is within automatic approval threshold."
        : "Refund value exceeds automatic approval threshold."
  });

  return summarize(checks);
}

export function validateProposedDecision(input: {
  order: PolicyOrder;
  orderItemId: string;
  existingRefunds: ExistingRefund[];
  reason: string;
  proposedStatus: "APPROVED" | "DENIED" | "ESCALATED";
  proposedAmount: number | null;
  proposedRationale: string;
  now?: Date;
}): RefundDecision {
  const eligibility = evaluateEligibility(input);
  const item = input.order.items.find((candidate) => candidate.id === input.orderItemId);
  const calculatedAmount = item ? calculateRefundAmount(item, input.reason) : 0;
  const approvedAmount = eligibility.status === "APPROVED" ? calculatedAmount : null;
  const statusMatches = input.proposedStatus === eligibility.status;
  const amountMatches =
    eligibility.status === "APPROVED"
      ? input.proposedAmount === approvedAmount
      : input.proposedAmount === null || input.proposedAmount === 0;

  if (statusMatches && amountMatches) {
    return {
      status: input.proposedStatus,
      approvedAmount: input.proposedStatus === "APPROVED" ? input.proposedAmount : null,
      rationale: input.proposedRationale,
      policyChecks: eligibility.checks,
      overridden: false
    };
  }

  return {
    status: eligibility.status,
    approvedAmount,
    rationale: buildRationale(eligibility),
    policyChecks: [
      ...eligibility.checks,
      {
        rule: "validator_override",
        passed: false,
        detail: `Model proposed ${input.proposedStatus}; policy validator enforced ${eligibility.status}.`
      }
    ],
    overridden: true
  };
}

export function policyPromptText(): string {
  return [
    `Refund policy version ${REFUND_POLICY_VERSION}.`,
    `Refunds are allowed only for delivered, returnable products inside each product return window.`,
    `Non-refundable categories: ${NON_REFUNDABLE_CATEGORIES.join(", ")}.`,
    `Refunds over ${AUTO_ESCALATION_THRESHOLD} must be escalated to a human.`,
    "Never finalize a decision without checking order details, eligibility, and amount."
  ].join("\n");
}

function summarize(checks: PolicyCheck[]): EligibilityResult {
  const failed = checks.filter((check) => !check.passed);
  const thresholdOnlyFailed = failed.length === 1 && failed[0].rule === "auto_escalation_threshold";
  if (failed.length === 0) {
    return { eligible: true, status: "APPROVED", checks, reasons: ["Eligible under current refund policy."] };
  }
  if (thresholdOnlyFailed) {
    return { eligible: false, status: "ESCALATED", checks, reasons: failed.map((check) => check.detail) };
  }
  return { eligible: false, status: "DENIED", checks, reasons: failed.map((check) => check.detail) };
}

function buildRationale(eligibility: EligibilityResult): string {
  if (eligibility.status === "APPROVED") return "Approved under the current refund policy.";
  if (eligibility.status === "ESCALATED") return "Escalated because the request requires human review.";
  return `Denied because ${eligibility.reasons.join(" ")}`;
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}
