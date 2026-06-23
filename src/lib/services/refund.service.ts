import { prisma } from "@/lib/db";

export async function listRefundRequests() {
  return prisma.refundRequest.findMany({
    include: {
      customer: true,
      order: true,
      orderItem: { include: { product: true } },
      conversation: true,
      overriddenByAdmin: true
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function getRefundRequest(id: string) {
  return prisma.refundRequest.findUnique({
    where: { id },
    include: {
      customer: true,
      order: { include: { items: { include: { product: true } } } },
      orderItem: { include: { product: true } },
      conversation: true,
      agentLogs: { orderBy: { stepNumber: "asc" } },
      overriddenByAdmin: true
    }
  });
}

export async function overrideRefundRequest(input: {
  id: string;
  adminUserId: string;
  status: "APPROVED" | "DENIED" | "ESCALATED";
  approvedAmount: number | null;
  rationale: string;
}) {
  return prisma.refundRequest.update({
    where: { id: input.id },
    data: {
      status: "OVERRIDDEN",
      approvedAmount: input.status === "APPROVED" ? input.approvedAmount : null,
      decisionRationale: `Admin override to ${input.status}: ${input.rationale}`,
      overriddenByAdminId: input.adminUserId,
      decidedAt: new Date()
    }
  });
}

export async function getExistingRefundsForOrderItem(orderItemId: string) {
  return prisma.refundRequest.findMany({
    where: { orderItemId },
    select: { id: true, orderItemId: true, status: true }
  });
}
