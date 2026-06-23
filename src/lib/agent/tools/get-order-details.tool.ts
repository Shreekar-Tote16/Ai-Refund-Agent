import { z } from "zod";
import { getOrderDetails } from "@/lib/services/order.service";

export const getOrderDetailsSchema = z.object({ orderId: z.string().min(1) });

export async function getOrderDetailsTool(input: z.infer<typeof getOrderDetailsSchema>) {
  const parsed = getOrderDetailsSchema.safeParse(input);
  if (!parsed.success) return { error: "INVALID_INPUT" };
  try {
    const order = await getOrderDetails(parsed.data.orderId);
    if (!order) return { error: "ORDER_NOT_FOUND" };
    return {
      id: order.id,
      customerId: order.customerId,
      status: order.status,
      deliveryDate: order.deliveryDate,
      totalAmount: order.totalAmount,
      items: order.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        product: item.product
      })),
      refundRequests: order.refundRequests.map((refund) => ({
        id: refund.id,
        orderItemId: refund.orderItemId,
        status: refund.status
      }))
    };
  } catch {
    return { error: "ORDER_LOOKUP_FAILED" };
  }
}
