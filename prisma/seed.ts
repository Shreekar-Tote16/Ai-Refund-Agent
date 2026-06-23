import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

async function main() {
  await prisma.agentLog.deleteMany();
  await prisma.refundRequest.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.adminUser.deleteMany();

  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD ?? "password123", 12);
  await prisma.adminUser.create({
    data: {
      email: process.env.ADMIN_EMAIL ?? "admin@example.com",
      name: "Refund Ops Admin",
      passwordHash
    }
  });

  const products = await Promise.all([
    prisma.product.create({ data: { name: "Trail Runner Shoes", sku: "SHOE-TRAIL-001", category: "Footwear", price: 1499, isReturnable: true, returnWindowDays: 30 } }),
    prisma.product.create({ data: { name: "Noise Cancelling Headphones", sku: "AUDIO-NC-100", category: "Electronics", price: 7999, isReturnable: true, returnWindowDays: 14 } }),
    prisma.product.create({ data: { name: "Digital Gift Card", sku: "GIFT-DIGI-050", category: "Gift Card", price: 5000, isReturnable: false, returnWindowDays: 0 } }),
    prisma.product.create({ data: { name: "Ceramic Dinner Set", sku: "HOME-DINNER-012", category: "Home", price: 2499, isReturnable: true, returnWindowDays: 30 } }),
    prisma.product.create({ data: { name: "Designer Jacket", sku: "APP-JACKET-900", category: "Apparel", price: 12999, isReturnable: true, returnWindowDays: 30 } }),
    prisma.product.create({ data: { name: "Online Course License", sku: "DIGI-COURSE-007", category: "Digital", price: 2999, isReturnable: false, returnWindowDays: 0 } }),
    prisma.product.create({ data: { name: "Office Chair", sku: "FURN-CHAIR-022", category: "Furniture", price: 10999, isReturnable: true, returnWindowDays: 30 } })
  ]);

  const customerNames = [
    "Aarav Mehta", "Maya Iyer", "Noah Carter", "Priya Shah", "Liam Johnson",
    "Anika Rao", "Ethan Brooks", "Sara Khan", "Vikram Singh", "Olivia Martin",
    "Kabir Das", "Emma Wilson", "Nina Patel", "Lucas Brown", "Isha Kapoor"
  ];

  const customers = await Promise.all(
    customerNames.map((name, index) =>
      prisma.customer.create({
        data: {
          name,
          email: `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
          phone: `+91-90000-00${String(index + 1).padStart(2, "0")}`
        }
      })
    )
  );

  async function createOrder(customerIndex: number, productIndex: number, quantity: number, deliveredDaysAgo: number | null) {
    const product = products[productIndex];
    const order = await prisma.order.create({
      data: {
        customerId: customers[customerIndex].id,
        status: deliveredDaysAgo === null ? "SHIPPED" : "DELIVERED",
        orderDate: daysAgo((deliveredDaysAgo ?? 2) + 4),
        deliveryDate: deliveredDaysAgo === null ? null : daysAgo(deliveredDaysAgo),
        totalAmount: product.price * quantity,
        items: {
          create: {
            productId: product.id,
            quantity,
            unitPrice: product.price
          }
        }
      },
      include: { items: true }
    });
    return order;
  }

  const eligible = await createOrder(0, 0, 1, 5);
  await createOrder(1, 1, 1, 40);
  await createOrder(2, 2, 1, 3);
  const alreadyRefunded = await createOrder(3, 3, 1, 2);
  await createOrder(4, 4, 1, 4);
  await createOrder(5, 6, 2, 1);
  await createOrder(6, 5, 1, 1);
  await createOrder(7, 0, 2, 12);
  await createOrder(8, 1, 1, null);
  await createOrder(9, 3, 2, 20);
  await createOrder(10, 4, 1, 31);
  await createOrder(11, 6, 1, 7);
  await createOrder(12, 0, 1, 1);
  await createOrder(13, 1, 2, 9);
  await createOrder(14, 3, 1, 15);

  const conversation = await prisma.conversation.create({
    data: { customerId: customers[0].id }
  });

  await prisma.message.createMany({
    data: [
      { conversationId: conversation.id, role: "USER", content: `I need a refund for order ${eligible.id}. It arrived damaged.` },
      { conversationId: conversation.id, role: "ASSISTANT", content: "I can help check the refund policy for that order." }
    ]
  });

  await prisma.refundRequest.create({
    data: {
      customerId: customers[3].id,
      orderId: alreadyRefunded.id,
      orderItemId: alreadyRefunded.items[0].id,
      reason: "Item arrived cracked",
      requestedAmount: alreadyRefunded.items[0].unitPrice,
      approvedAmount: alreadyRefunded.items[0].unitPrice,
      status: "APPROVED",
      decisionRationale: "Approved within return window for damaged physical goods.",
      policyVersion: "2026-06-01",
      decidedAt: daysAgo(1)
    }
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
