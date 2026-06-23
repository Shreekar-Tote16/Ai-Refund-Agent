import Link from "next/link";
import { DecisionOverrideDialog } from "@/components/admin/decision-override-dialog";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";

type RefundRow = {
  id: string;
  status: string;
  requestedAmount: number;
  approvedAmount: number | null;
  createdAt: Date;
  customer: { name: string };
  orderItem: { product: { name: string } } | null;
};

export function RefundRequestsTable({ refunds }: { refunds: RefundRow[] }) {
  if (refunds.length === 0) {
    return (
      <div className="mt-6 rounded-md border bg-white p-8 text-center">
        <p className="text-slate-500">No refund requests found</p>
      </div>
    );
  }

  return (
    <div className="mt-6 overflow-hidden rounded-md border bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-100 text-slate-600">
          <tr>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Item</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {refunds.map((refund) => (
            <tr key={refund.id} className="border-t hover:bg-slate-50">
              <td className="px-4 py-3">
                <Link href={`/admin/refunds/${refund.id}`} className="font-medium text-teal-700 hover:text-teal-800">
                  {refund.customer.name}
                </Link>
              </td>
              <td className="px-4 py-3 text-slate-700">{refund.orderItem?.product.name ?? "-"}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(refund.status)}`}>
                  {refund.status}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-700">{formatCurrency(refund.approvedAmount ?? refund.requestedAmount)}</td>
              <td className="px-4 py-3 text-slate-600">{formatDate(refund.createdAt)}</td>
              <td className="px-4 py-3">
                <DecisionOverrideDialog refundId={refund.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
