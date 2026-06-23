import { z } from "zod";
import { getProductDetails } from "@/lib/services/order.service";

export const getProductDetailsSchema = z.object({ productId: z.string().min(1) });

export async function getProductDetailsTool(input: z.infer<typeof getProductDetailsSchema>) {
  const parsed = getProductDetailsSchema.safeParse(input);
  if (!parsed.success) return { error: "INVALID_INPUT" };
  try {
    const product = await getProductDetails(parsed.data.productId);
    return product ?? { error: "PRODUCT_NOT_FOUND" };
  } catch {
    return { error: "PRODUCT_LOOKUP_FAILED" };
  }
}
