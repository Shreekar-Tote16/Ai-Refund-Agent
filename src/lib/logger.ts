import pino from "pino";

export type AgentStepTypeValue = "LLM_CALL" | "TOOL_CALL" | "TOOL_RESULT" | "POLICY_CHECK" | "DECISION" | "ERROR";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  transport:
    process.env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: { colorize: true }
        }
      : undefined
});

export type PendingAgentLog = {
  stepType: AgentStepTypeValue;
  nodeName: string;
  summary: string;
  reasoningText?: string | null;
  toolName?: string | null;
  toolInput?: string | null;
  toolOutput?: string | null;
  policyChecks?: string | null;
  model?: string | null;
  latencyMs?: number | null;
};

export function logStep(logs: PendingAgentLog[], step: PendingAgentLog) {
  logs.push(step);
}
