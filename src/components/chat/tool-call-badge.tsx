// 

"use client";

import { useState } from "react";
import {
  Wrench,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Package,
  ShieldCheck,
  DollarSign,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

type ToolEvent = {
  name: string;
  summary: string;
  status?: "success" | "error" | "pending";
  inputs?: Record<string, unknown>;
  outputs?: Record<string, unknown>;
  timestamp?: Date;
  duration?: number;
};

export function ToolCallCard({ event }: { event: ToolEvent }) {
  const [expanded, setExpanded] = useState(false);
  const status = event.status ?? "success";

  const statusIcon = {
    success: <CheckCircle className="h-4 w-4 text-green-600" />,
    error: <XCircle className="h-4 w-4 text-red-600" />,
    pending: <Loader2 className="h-4 w-4 animate-spin text-blue-500" />,
  }[status];

  const statusColor = {
    success: "border-green-200 bg-green-50",
    error: "border-red-200 bg-red-50",
    pending: "border-slate-200 bg-slate-50",
  }[status];

  return (
    <div className={`rounded-md border ${statusColor} overflow-hidden`}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-3 py-2 text-left transition-colors hover:bg-white/50"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2">
          {getToolIcon(event.name)}

          <div>
            <p className="text-sm font-semibold text-slate-800">
              {formatToolName(event.name)}
            </p>

            <p className="text-xs text-slate-500">{event.summary}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {statusIcon}

          {expanded ? (
            <ChevronUp className="h-4 w-4 text-slate-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-500" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-slate-200 bg-white px-3 py-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="h-3 w-3" />

            <span>
              {event.timestamp ? formatDate(event.timestamp) : "Just now"}
            </span>

            {event.duration && (
              <>
                <span>•</span>
                <span>{event.duration} ms</span>
              </>
            )}
          </div>

          {event.inputs && Object.keys(event.inputs).length > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold text-slate-600">
                Inputs
              </p>

              <pre className="overflow-x-auto rounded bg-slate-50 p-2 text-xs">
                {JSON.stringify(event.inputs, null, 2)}
              </pre>
            </div>
          )}

          <div>
            <p className="mb-1 text-xs font-semibold text-slate-600">
              Output
            </p>

            {renderOutput(event)}
          </div>
        </div>
      )}
    </div>
  );
}

function renderOutput(event: ToolEvent) {
  const output = event.outputs;

  if (!output || Object.keys(output).length === 0) {
    return (
      <p className="text-xs text-slate-500">
        No output available.
      </p>
    );
  }

  switch (event.name) {
    case "get_order_details":
      return (
        <div className="space-y-2 rounded bg-slate-50 p-3 text-xs">
          <InfoRow label="Status" value={output.status} />
          <InfoRow
            label="Items"
            value={Array.isArray(output.items) ? output.items.length : 0}
          />
          <InfoRow
            label="Total"
            value={
              output.totalAmount
                ? `₹${output.totalAmount}`
                : "-"
            }
          />
        </div>
      );

    case "check_refund_eligibility":
      return (
        <div className="space-y-2 rounded bg-slate-50 p-3 text-xs">
          <InfoRow
            label="Decision"
            value={output.status}
          />

          {Array.isArray(output.reasons) &&
            output.reasons.map((reason, index) => (
              <div
                key={index}
                className="rounded border bg-white px-2 py-1 text-slate-700"
              >
                • {String(reason)}
              </div>
            ))}
        </div>
      );

    case "calculate_refund_amount":
      return (
        <div className="space-y-2 rounded bg-slate-50 p-3 text-xs">
          <InfoRow
            label="Refund Amount"
            value={`₹${output.amount ?? 0}`}
          />
        </div>
      );

    default:
      return (
        <pre className="overflow-x-auto rounded bg-slate-50 p-2 text-xs">
          {JSON.stringify(output, null, 2)}
        </pre>
      );
  }
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: unknown;
}) {
  return (
    <div className="flex justify-between rounded border bg-white px-2 py-2">
      <span className="text-slate-500">{label}</span>

      <span className="font-medium text-slate-800">
        {String(value ?? "-")}
      </span>
    </div>
  );
}

function formatToolName(name: string) {
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getToolIcon(name: string) {
  if (name.includes("order"))
    return <Package className="h-4 w-4 text-slate-600" />;

  if (name.includes("eligibility"))
    return <ShieldCheck className="h-4 w-4 text-slate-600" />;

  if (name.includes("amount"))
    return <DollarSign className="h-4 w-4 text-slate-600" />;

  return <Wrench className="h-4 w-4 text-slate-600" />;
}

export function ToolCallBadge({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md border bg-slate-100 px-2 py-1 text-xs text-slate-600"
      title={label}
    >
      <Wrench className="h-3 w-3" />
      {label}
    </span>
  );
}