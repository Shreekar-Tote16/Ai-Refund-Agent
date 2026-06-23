import { z } from "zod";

export const finalizeDecisionSchema = z.object({
  status: z.enum(["APPROVED", "DENIED", "ESCALATED"]),
  amount: z.number().nullable(),
  rationale: z.string().min(1)
});

export function finalizeDecisionTool(input: z.infer<typeof finalizeDecisionSchema>) {
  const parsed = finalizeDecisionSchema.safeParse(input);
  if (!parsed.success) return { error: "INVALID_INPUT" };
  return parsed.data;
}
