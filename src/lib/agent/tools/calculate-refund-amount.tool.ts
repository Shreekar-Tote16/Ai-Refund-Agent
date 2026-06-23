import { z } from "zod";
import { calculateRefundAmount } from "@/lib/policy/refund-policy";
import { getOrderDetails } from "@/lib/services/order.service";

export const calculateRefundAmountSchema = z.object({
  orderItemId: z.string().min(1),
  orderId: z.string().min(1),
  reason: z.string().min(1)
});

export async function calculateRefundAmountTool(input: z.infer<typeof calculateRefundAmountSchema>) {
  const parsed = calculateRefundAmountSchema.safeParse(input);
  if (!parsed.success) return { error: "INVALID_INPUT" };
  try {
    const order = await getOrderDetails(parsed.data.orderId);
    const item = order?.items.find((candidate) => candidate.id === parsed.data.orderItemId);
    if (!item) return { error: "ORDER_ITEM_NOT_FOUND" };
    return { amount: calculateRefundAmount(item, parsed.data.reason) };
  } catch {
    return { error: "AMOUNT_CALCULATION_FAILED" };
  }
}
