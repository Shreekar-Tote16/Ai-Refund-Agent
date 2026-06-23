export type PolicyOrderStatus = string;
export type PolicyRefundStatus = string;

export type PolicyProduct = {
  id: string;
  name: string;
  category: string;
  isReturnable: boolean;
  returnWindowDays: number;
};

export type PolicyOrderItem = {
  id: string;
  quantity: number;
  unitPrice: number;
  product: PolicyProduct;
};

export type PolicyOrder = {
  id: string;
  status: PolicyOrderStatus;
  deliveryDate: Date | null;
  totalAmount: number;
  items: PolicyOrderItem[];
};

export type ExistingRefund = {
  id: string;
  orderItemId: string | null;
  status: PolicyRefundStatus;
};

export type PolicyCheck = {
  rule: string;
  passed: boolean;
  detail: string;
};

export type EligibilityResult = {
  eligible: boolean;
  status: "APPROVED" | "DENIED" | "ESCALATED";
  checks: PolicyCheck[];
  reasons: string[];
};

export type RefundDecision = {
  status: "APPROVED" | "DENIED" | "ESCALATED";
  approvedAmount: number | null;
  rationale: string;
  policyChecks: PolicyCheck[];
  overridden: boolean;
};
