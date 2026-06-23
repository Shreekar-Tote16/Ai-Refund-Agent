import { z } from "zod";
import { evaluateEligibility } from "@/lib/policy/refund-policy";
import { getOrderDetails } from "@/lib/services/order.service";
import { getExistingRefundsForOrderItem } from "@/lib/services/refund.service";

export const checkRefundEligibilitySchema = z.object({
  orderId: z.string().min(1),
  orderItemId: z.string().min(1)
});

export async function checkRefundEligibilityTool(input: z.infer<typeof checkRefundEligibilitySchema>) {
  const parsed = checkRefundEligibilitySchema.safeParse(input);
  if (!parsed.success) return { error: "INVALID_INPUT" };
  try {
    const order = await getOrderDetails(parsed.data.orderId);
    if (!order) return { error: "ORDER_NOT_FOUND" };
    const existingRefunds = await getExistingRefundsForOrderItem(parsed.data.orderItemId);
    return evaluateEligibility({
      order,
      orderItemId: parsed.data.orderItemId,
      existingRefunds
    });
  } catch {
    return { error: "ELIGIBILITY_CHECK_FAILED" };
  }
}
