import { NextResponse } from "next/server";
import { getConversationTranscript } from "@/lib/services/conversation.service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const conversation = await getConversationTranscript(id);
  if (!conversation) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Conversation not found." } }, { status: 404 });
  }
  return NextResponse.json({ conversation });
}
