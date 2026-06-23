import type { AgentLog, Message } from "@prisma/client";
import { formatDate } from "@/lib/utils";
import { ChevronDown, CheckCircle, Clock, AlertCircle, Brain, Settings, FileText } from "lucide-react";

function getStepTypeColor(stepType: string): string {
  switch (stepType) {
    case "LLM_CALL":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "TOOL_CALL":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "TOOL_RESULT":
      return "bg-cyan-100 text-cyan-800 border-cyan-200";
    case "POLICY_CHECK":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "DECISION":
      return "bg-green-100 text-green-800 border-green-200";
    case "ERROR":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-slate-100 text-slate-800 border-slate-200";
  }
}

function getStepIcon(stepType: string) {
  switch (stepType) {
    case "LLM_CALL":
      return <Brain className="h-4 w-4" />;
    case "TOOL_CALL":
      return <Settings className="h-4 w-4" />;
    case "TOOL_RESULT":
      return <CheckCircle className="h-4 w-4" />;
    case "POLICY_CHECK":
      return <FileText className="h-4 w-4" />;
    case "DECISION":
      return <CheckCircle className="h-4 w-4" />;
    case "ERROR":
      return <AlertCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
}

function getStepLabel(stepType: string): string {
  switch (stepType) {
    case "LLM_CALL":
      return "Thinking";
    case "TOOL_CALL":
      return "Tool Execution";
    case "TOOL_RESULT":
      return "Tool Result";
    case "POLICY_CHECK":
      return "Policy Validation";
    case "DECISION":
      return "Decision";
    case "ERROR":
      return "Error";
    default:
      return stepType;
  }
}

export function ReasoningTimeline({ logs, messages }: { logs: AgentLog[]; messages: Message[] }) {
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        {logs.length === 0 ? (
          <div className="rounded-md border bg-white p-8 text-center">
            <p className="text-slate-500">No agent logs found</p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />
            
            {logs.map((log, index) => (
              <div key={log.id} className="relative flex gap-4 pb-8 last:pb-0">
                {/* Timeline dot */}
                <div className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-sm ${getStepTypeColor(log.stepType)}`}>
                  {getStepIcon(log.stepType)}
                </div>
                
                {/* Content */}
                <div className="flex-1 rounded-md border bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStepTypeColor(log.stepType)}`}>
                        {getStepLabel(log.stepType)}
                      </span>
                      <h3 className="mt-2 font-semibold text-slate-900">{log.summary}</h3>
                      <p className="mt-1 text-sm text-slate-500">{log.nodeName}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="h-3 w-3" />
                      {formatDate(log.createdAt)}
                    </div>
                  </div>
                  {log.reasoningText && (
                    <div className="mt-3 rounded-md bg-slate-50 p-3">
                      <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{log.reasoningText}</p>
                    </div>
                  )}
                  {log.toolName && <JsonBlock title={log.toolName} value={{ input: log.toolInput, output: log.toolOutput }} />}
                  {log.policyChecks && <JsonBlock title="Policy checks" value={log.policyChecks} />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <aside className="rounded-md border bg-white p-4 shadow-sm">
        <h2 className="font-semibold text-slate-900 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Transcript
        </h2>
        <div className="mt-4 space-y-3">
          {messages.length === 0 ? (
            <p className="text-sm text-slate-500">No transcript attached to this view.</p>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="text-sm">
                <p className={`font-medium ${message.role === "USER" ? "text-teal-700" : "text-slate-700"}`}>
                  {message.role}
                </p>
                <p className="text-slate-600">{message.content}</p>
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}

function JsonBlock({ title, value }: { title: string; value: unknown }) {
  const parsed = typeof value === "string" ? safeParse(value) : value;
  return (
    <details className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs">
      <summary className="cursor-pointer font-medium text-slate-700 flex items-center gap-2">
        <ChevronDown className="h-4 w-4" />
        {title}
      </summary>
      <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-slate-600">{JSON.stringify(parsed, null, 2)}</pre>
    </details>
  );
}

function safeParse(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}
