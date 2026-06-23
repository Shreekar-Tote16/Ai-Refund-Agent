import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getConversationTrace } from "@/lib/services/conversation.service";

export async function GET(_request: Request, { params }: { params: Promise<{ conversationId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Unauthorized." } }, { status: 401 });
  const { conversationId } = await params;
  const trace = await getConversationTrace(conversationId);
  if (!trace) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Conversation not found." } }, { status: 404 });
  return NextResponse.json({ trace });
}
