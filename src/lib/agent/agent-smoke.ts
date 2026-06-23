import { prisma } from "@/lib/db";
import { handleCustomerMessage } from "@/lib/services/conversation.service";

async function main() {
  const order = await prisma.order.findFirst({
    where: {
      status: "DELIVERED",
      items: { some: { product: { isReturnable: true } } }
    },
    include: { items: { include: { product: true } } },
    orderBy: { orderDate: "desc" }
  });

  if (!order) throw new Error("No delivered returnable order found for smoke test.");

  const result = await handleCustomerMessage({
    customerId: order.customerId,
    orderId: order.id,
    orderItemId: order.items[0].id,
    message: "The item arrived damaged and I need a refund."
  });

  const [logCount, refund] = await Promise.all([
    prisma.agentLog.count({ where: { conversationId: result.conversationId } }),
    prisma.refundRequest.findFirst({
      where: { conversationId: result.conversationId },
      orderBy: { createdAt: "desc" }
    })
  ]);

  console.log(
    JSON.stringify({
      status: refund?.status,
      approvedAmount: refund?.approvedAmount,
      logCount,
      toolEvents: result.toolEvents.length
    })
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
