import { prisma } from "@/lib/db";
import { runRefundAgent } from "@/lib/agent/graph";
import { logger } from "@/lib/logger";

export async function listConversations() {
  return prisma.conversation.findMany({
    include: {
      customer: true,
      messages: { orderBy: { createdAt: "asc" }, take: 2 },
      refunds: true,
      agentLogs: { orderBy: { stepNumber: "asc" }, take: 1 }
    },
    orderBy: { updatedAt: "desc" }
  });
}

export async function getConversationTranscript(id: string) {
  return prisma.conversation.findUnique({
    where: { id },
    include: {
      customer: true,
      messages: { orderBy: { createdAt: "asc" } },
      refunds: { include: { orderItem: { include: { product: true } } } }
    }
  });
}

export async function getConversationTrace(conversationId: string) {
  return prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      customer: true,
      messages: { orderBy: { createdAt: "asc" } },
      agentLogs: { orderBy: { stepNumber: "asc" } },
      refunds: { include: { orderItem: { include: { product: true } }, order: true } }
    }
  });
}

export async function handleCustomerMessage(input: {
  conversationId?: string;
  customerId: string;
  message: string;
  orderId?: string;
  orderItemId?: string;
}) {
  const conversation = input.conversationId
    ? await prisma.conversation.update({
        where: { id: input.conversationId },
        data: { updatedAt: new Date() }
      })
    : await prisma.conversation.create({ data: { customerId: input.customerId } });

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      role: "USER",
      content: input.message
    }
  });

  const history = await prisma.message.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: "asc" }
  });

  try {
    const result = await runRefundAgent({
      conversationId: conversation.id,
      customerId: input.customerId,
      userMessage: input.message,
      orderId: input.orderId,
      orderItemId: input.orderItemId,
      history
    });

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "ASSISTANT",
        content: result.assistantMessage
      }
    });

    return { conversationId: conversation.id, ...result };
  } catch (error) {
    logger.error({ error }, "Uncaught agent failure");
    const fallback = "Something went wrong on our end, so this refund request has been escalated for a team member.";
    await prisma.$transaction([
      prisma.refundRequest.create({
        data: {
          conversationId: conversation.id,
          customerId: input.customerId,
          orderId: input.orderId ?? (await firstCustomerOrderId(input.customerId)),
          orderItemId: input.orderItemId,
          reason: input.message,
          requestedAmount: 0,
          approvedAmount: null,
          status: "ESCALATED",
          decisionRationale: fallback,
          policyVersion: "2026-06-01",
          decidedAt: new Date()
        }
      }),
      prisma.agentLog.create({
        data: {
          conversationId: conversation.id,
          stepNumber: 1,
          stepType: "ERROR",
          nodeName: "graph",
          summary: "Agent failed and request was escalated.",
          reasoningText: error instanceof Error ? error.message : "Unknown error"
        }
      }),
      prisma.message.create({
        data: { conversationId: conversation.id, role: "ASSISTANT", content: fallback }
      })
    ]);
    return { conversationId: conversation.id, assistantMessage: fallback, toolEvents: [] };
  }
}

async function firstCustomerOrderId(customerId: string) {
  const order = await prisma.order.findFirst({ where: { customerId }, orderBy: { orderDate: "desc" } });
  if (!order) throw new Error("Customer has no order to attach escalation.");
  return order.id;
}

export function jsonValue(value: unknown): string {
  return JSON.stringify(value);
}
