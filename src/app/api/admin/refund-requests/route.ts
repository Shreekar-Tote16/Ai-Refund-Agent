import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listRefundRequests } from "@/lib/services/refund.service";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Unauthorized." } }, { status: 401 });
  return NextResponse.json({ refundRequests: await listRefundRequests() });
}
