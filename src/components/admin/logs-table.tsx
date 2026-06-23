import Link from "next/link";
import { formatDate, getStatusColor } from "@/lib/utils";

type ConversationRow = {
  id: string;
  updatedAt: Date;
  customer: { name: string; email: string };
  refunds: Array<{ status: string }>;
  agentLogs: Array<{ summary: string }>;
};

export function LogsTable({ conversations }: { conversations: ConversationRow[] }) {
  if (conversations.length === 0) {
    return (
      <div className="mt-6 rounded-md border bg-white p-8 text-center">
        <p className="text-slate-500">No conversations found</p>
      </div>
    );
  }

  return (
    <div className="mt-6 overflow-hidden rounded-md border bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-100 text-slate-600">
          <tr>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Latest Step</th>
            <th className="px-4 py-3">Decision</th>
            <th className="px-4 py-3">Updated</th>
          </tr>
        </thead>
        <tbody>
          {conversations.map((conversation) => (
            <tr key={conversation.id} className="border-t hover:bg-slate-50">
              <td className="px-4 py-3">
                <Link className="font-medium text-teal-700 hover:text-teal-800" href={`/admin/logs/${conversation.id}`}>
                  {conversation.customer.name}
                </Link>
                <div className="text-xs text-slate-500">{conversation.customer.email}</div>
              </td>
              <td className="px-4 py-3 text-slate-700">{conversation.agentLogs[0]?.summary ?? "No agent log yet"}</td>
              <td className="px-4 py-3">
                {conversation.refunds[0]?.status ? (
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(conversation.refunds[0].status)}`}>
                    {conversation.refunds[0].status}
                  </span>
                ) : (
                  <span className="text-slate-400">-</span>
                )}
              </td>
              <td className="px-4 py-3 text-slate-600">{formatDate(conversation.updatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
