"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DecisionOverrideDialog({ refundId }: { refundId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function submit(formData: FormData) {
    setSaving(true);
    const response = await fetch(`/api/admin/refund-requests/${refundId}/override`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: formData.get("status"),
        approvedAmount: Number(formData.get("approvedAmount") || 0),
        rationale: String(formData.get("rationale") ?? "")
      })
    });
    setSaving(false);
    if (response.ok) {
      setOpen(false);
      router.refresh();
    }
  }

  return (
    <>
      <button 
        onClick={() => setOpen(true)} 
        className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        aria-label="Override refund decision"
      >
        Override
      </button>
      {open ? (
        <div 
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" 
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="override-dialog-title"
        >
          <form action={submit} className="w-full max-w-md rounded-md bg-white p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h2 id="override-dialog-title" className="text-lg font-semibold text-slate-900">Override Decision</h2>
            <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="override-status">
              Status
              <select 
                name="status" 
                id="override-status"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="APPROVED">APPROVED</option>
                <option value="DENIED">DENIED</option>
                <option value="ESCALATED">ESCALATED</option>
              </select>
            </label>
            <label className="mt-3 block text-sm font-medium text-slate-700" htmlFor="override-amount">
              Approved amount
              <input 
                name="approvedAmount" 
                id="override-amount"
                type="number" 
                min="0" 
                step="0.01" 
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </label>
            <label className="mt-3 block text-sm font-medium text-slate-700" htmlFor="override-rationale">
              Rationale
              <textarea 
                name="rationale" 
                id="override-rationale"
                required 
                rows={3} 
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button 
                type="button" 
                onClick={() => setOpen(false)} 
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button 
                disabled={saving} 
                className="rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
