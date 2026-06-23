import { NextResponse } from "next/server";
import { listCustomerOrders } from "@/lib/services/order.service";

export async function GET(_request: Request, { params }: { params: Promise<{ customerId: string }> }) {
  const { customerId } = await params;
  const orders = await listCustomerOrders(customerId);
  return NextResponse.json({ orders });
}
