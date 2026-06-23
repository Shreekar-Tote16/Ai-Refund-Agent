import { notFound } from "next/navigation";
import { ReasoningTimeline } from "@/components/admin/reasoning-timeline";
import { getConversationTrace } from "@/lib/services/conversation.service";

export default async function ConversationLogPage({ params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = await params;
  const conversation = await getConversationTrace(conversationId);
  if (!conversation) notFound();
  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-semibold">Conversation Trace</h1>
      <p className="mt-1 text-sm text-slate-500">{conversation.customer.name}</p>
      <ReasoningTimeline logs={conversation.agentLogs} messages={conversation.messages} />
    </section>
  );
}
