import { RefundRequestsTable } from "@/components/admin/refund-requests-table";
import { listRefundRequests } from "@/lib/services/refund.service";

export default async function RefundsPage() {
  const refunds = await listRefundRequests();
  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-semibold">Refund Requests</h1>
      <RefundRequestsTable refunds={refunds} />
    </section>
  );
}
