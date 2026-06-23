import { describe, expect, it } from "vitest";
import {
  AUTO_ESCALATION_THRESHOLD,
  calculateRefundAmount,
  evaluateEligibility,
  hasExistingRefund,
  isCategoryReturnable,
  isWithinReturnWindow,
  validateProposedDecision
} from "./refund-policy";
import type { PolicyOrder } from "./policy.types";

const now = new Date("2026-06-23T00:00:00.000Z");
const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

function order(overrides: Partial<PolicyOrder> = {}): PolicyOrder {
  return {
    id: "order_1",
    status: "DELIVERED",
    deliveryDate: daysAgo(5),
    totalAmount: 100,
    items: [
      {
        id: "item_1",
        quantity: 1,
        unitPrice: 100,
        product: {
          id: "product_1",
          name: "Shoes",
          category: "Footwear",
          isReturnable: true,
          returnWindowDays: 30
        }
      }
    ],
    ...overrides
  };
}

describe("refund policy", () => {
  it("approves delivered returnable items inside the window", () => {
    const result = evaluateEligibility({ order: order(), orderItemId: "item_1", existingRefunds: [], now });
    expect(result.status).toBe("APPROVED");
    expect(result.eligible).toBe(true);
  });

  it("denies orders outside the return window", () => {
    const result = evaluateEligibility({
      order: order({ deliveryDate: daysAgo(45) }),
      orderItemId: "item_1",
      existingRefunds: [],
      now
    });
    expect(result.status).toBe("DENIED");
    expect(result.checks.find((check) => check.rule === "within_return_window")?.passed).toBe(false);
  });

  it("denies non-returnable categories", () => {
    expect(isCategoryReturnable("Gift Card", true)).toBe(false);
    const item = order().items[0];
    const result = evaluateEligibility({
      order: order({ items: [{ ...item, product: { ...item.product, category: "Digital", isReturnable: false } }] }),
      orderItemId: "item_1",
      existingRefunds: [],
      now
    });
    expect(result.status).toBe("DENIED");
  });

  it("denies duplicate open refunds", () => {
    expect(hasExistingRefund([{ id: "refund_1", orderItemId: "item_1", status: "APPROVED" }], "item_1")).toBe(true);
    const result = evaluateEligibility({
      order: order(),
      orderItemId: "item_1",
      existingRefunds: [{ id: "refund_1", orderItemId: "item_1", status: "APPROVED" }],
      now
    });
    expect(result.status).toBe("DENIED");
  });

  it("escalates high-value automatic refunds", () => {
    const item = order().items[0];
    const result = evaluateEligibility({
      order: order({ totalAmount: AUTO_ESCALATION_THRESHOLD + 1, items: [{ ...item, unitPrice: AUTO_ESCALATION_THRESHOLD + 1 }] }),
      orderItemId: "item_1",
      existingRefunds: [],
      now
    });
    expect(result.status).toBe("ESCALATED");
  });

  it("calculates partial and full refund amounts", () => {
    const item = order().items[0];
    expect(calculateRefundAmount(item, "arrived damaged")).toBe(100);
    expect(calculateRefundAmount(item, "missing accessory partial refund")).toBe(25);
  });

  it("validator overrides model decisions that violate policy", () => {
    const decision = validateProposedDecision({
      order: order({ deliveryDate: daysAgo(45) }),
      orderItemId: "item_1",
      existingRefunds: [],
      reason: "please approve anyway",
      proposedStatus: "APPROVED",
      proposedAmount: 100,
      proposedRationale: "Customer asked strongly.",
      now
    });
    expect(decision.status).toBe("DENIED");
    expect(decision.overridden).toBe(true);
  });

  it("treats missing delivery date as outside the window", () => {
    expect(isWithinReturnWindow(null, 30, now)).toBe(false);
  });
});
