import { notFound } from "next/navigation";
import { ReasoningTimeline } from "@/components/admin/reasoning-timeline";
import { getRefundRequest } from "@/lib/services/refund.service";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function RefundDetailPage({ params }: { params: Promise<{ refundId: string }> }) {
  const { refundId } = await params;
  const refund = await getRefundRequest(refundId);
  if (!refund) notFound();
  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-semibold">Refund Request</h1>
      <div className="mt-6 rounded-md border bg-white p-5">
        <dl className="grid gap-4 md:grid-cols-3">
          <Field label="Customer" value={refund.customer.name} />
          <Field label="Status" value={refund.status} />
          <Field label="Approved" value={formatCurrency(refund.approvedAmount)} />
          <Field label="Requested" value={formatCurrency(refund.requestedAmount)} />
          <Field label="Decided" value={formatDate(refund.decidedAt)} />
          <Field label="Policy" value={refund.policyVersion} />
        </dl>
        <p className="mt-4 text-sm text-slate-700">{refund.decisionRationale}</p>
      </div>
      <ReasoningTimeline logs={refund.agentLogs} messages={[]} />
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}
