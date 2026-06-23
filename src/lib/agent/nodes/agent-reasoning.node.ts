import { createChatModel } from "@/lib/agent/llm";
import type { AgentState } from "@/lib/agent/state";
import { logStep } from "@/lib/logger";
import { buildSystemPrompt } from "@/lib/agent/prompts/system-prompt";

export async function agentReasoningNode(state: AgentState): Promise<AgentState> {
  const started = Date.now();
  const model = createChatModel();
  const summary = model ? "LLM reviewed conversation and selected refund tools." : "Local agent selected refund tools.";
  logStep(state.logs, {
    stepType: "LLM_CALL",
    nodeName: "agentReasoning",
    summary,
    reasoningText: `${buildSystemPrompt()}\n\nCustomer message: ${state.userMessage}`,
    model: model ? process.env.OPENAI_MODEL ?? "gpt-4o-mini" : "local-deterministic",
    latencyMs: Date.now() - started
  });
  return state;
}
