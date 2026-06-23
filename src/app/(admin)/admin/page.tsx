import { listConversations } from "@/lib/services/conversation.service";
import { listRefundRequests } from "@/lib/services/refund.service";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { MessageSquare, FileText, AlertTriangle, IndianRupee } from "lucide-react";

export default async function AdminPage() {
  const [conversations, refunds] = await Promise.all([listConversations(), listRefundRequests()]);
  const approved = refunds.filter((refund) => refund.status === "APPROVED" || refund.status === "OVERRIDDEN");
  const escalated = refunds.filter((refund) => refund.status === "ESCALATED");
  const totalApproved = approved.reduce((sum, refund) => sum + (refund.approvedAmount ?? 0), 0);

  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">Monitor refund requests and agent activity</p>
        </div>
        <div className="flex gap-2 text-sm">
          <Link href="/admin/logs" className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 hover:bg-slate-50 transition-colors">
            <MessageSquare className="h-4 w-4" />
            View Logs
          </Link>
          <Link href="/admin/refunds" className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 hover:bg-slate-50 transition-colors">
            <FileText className="h-4 w-4" />
            View Refunds
          </Link>
        </div>
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Conversations" value={conversations.length} color="blue" icon={<MessageSquare className="h-5 w-5" />} />
        <Metric label="Refund Requests" value={refunds.length} color="purple" icon={<FileText className="h-5 w-5" />} />
        <Metric label="Escalations" value={escalated.length} color="amber" icon={<AlertTriangle className="h-5 w-5" />} />
        <Metric label="Approved Value" value={formatCurrency(totalApproved)} color="green" icon={<IndianRupee className="h-5 w-5" />} />
      </div>
    </section>
  );
}

function Metric({ label, value, color = "slate", icon }: { label: string; value: string | number; color?: "blue" | "purple" | "amber" | "green" | "slate"; icon?: React.ReactNode }) {
  const colorClasses = {
    blue: "border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100",
    purple: "border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100",
    amber: "border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100",
    green: "border-green-200 bg-gradient-to-br from-green-50 to-green-100",
    slate: "border-slate-200 bg-white"
  };

  const iconColorClasses = {
    blue: "text-blue-600",
    purple: "text-purple-600",
    amber: "text-amber-600",
    green: "text-green-600",
    slate: "text-slate-600"
  };

  const valueColorClasses = {
    blue: "text-blue-900",
    purple: "text-purple-900",
    amber: "text-amber-900",
    green: "text-green-900",
    slate: "text-slate-900"
  };

  return (
    <div className={`rounded-xl border p-6 shadow-sm ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div className={`rounded-lg p-2 ${icon ? iconColorClasses[color] : "bg-slate-100"}`}>
          {icon}
        </div>
      </div>
      <p className="mt-4 text-sm font-medium text-slate-600">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${valueColorClasses[color]}`}>{value}</p>
    </div>
  );
}
