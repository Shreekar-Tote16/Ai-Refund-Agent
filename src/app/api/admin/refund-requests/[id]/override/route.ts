import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { overrideRefundRequest } from "@/lib/services/refund.service";

const overrideSchema = z.object({
  status: z.enum(["APPROVED", "DENIED", "ESCALATED"]),
  approvedAmount: z.number().nullable().optional(),
  rationale: z.string().min(1)
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Unauthorized." } }, { status: 401 });
  const parsed = overrideSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Invalid override request." } }, { status: 400 });
  const admin = await prisma.adminUser.findUnique({ where: { email: session.user.email } });
  if (!admin) return NextResponse.json({ error: { code: "FORBIDDEN", message: "Admin user not found." } }, { status: 403 });
  const { id } = await params;
  const refund = await overrideRefundRequest({
    id,
    adminUserId: admin.id,
    status: parsed.data.status,
    approvedAmount: parsed.data.approvedAmount ?? null,
    rationale: parsed.data.rationale
  });
  return NextResponse.json({ refund });
}
