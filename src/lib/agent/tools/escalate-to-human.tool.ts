import { z } from "zod";

export const escalateToHumanSchema = z.object({ reason: z.string().min(1) });

export function escalateToHumanTool(input: z.infer<typeof escalateToHumanSchema>) {
  const parsed = escalateToHumanSchema.safeParse(input);
  if (!parsed.success) return { error: "INVALID_INPUT" };
  return {
    status: "ESCALATED" as const,
    amount: null,
    rationale: parsed.data.reason
  };
}
