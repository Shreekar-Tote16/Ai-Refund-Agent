import { LogsTable } from "@/components/admin/logs-table";
import { listConversations } from "@/lib/services/conversation.service";

export default async function LogsPage() {
  const conversations = await listConversations();
  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-semibold">Reasoning Logs</h1>
      <LogsTable conversations={conversations} />
    </section>
  );
}
