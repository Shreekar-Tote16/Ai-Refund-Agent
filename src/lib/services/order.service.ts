import { prisma } from "@/lib/db";

export type OrderWithItems = Awaited<ReturnType<typeof getOrderDetails>>;

export async function listCustomerOrders(customerId: string) {
  return prisma.order.findMany({
    where: { customerId },
    include: { items: { include: { product: true } } },
    orderBy: { orderDate: "desc" }
  });
}

export async function getOrderDetails(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
      items: { include: { product: true } },
      refundRequests: true
    }
  });
}

export async function getProductDetails(productId: string) {
  return prisma.product.findUnique({ where: { id: productId } });
}

export async function listCustomers() {
  return prisma.customer.findMany({ orderBy: { name: "asc" } });
}
