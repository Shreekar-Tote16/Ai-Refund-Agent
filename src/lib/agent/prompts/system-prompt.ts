import { policyPromptText } from "@/lib/policy/refund-policy";

export function buildSystemPrompt() {
  return [
    "You are a customer support refund agent.",
    "Use tools to retrieve order facts and apply policy before finalizing.",
    "Be concise, factual, and transparent with customers.",
    policyPromptText()
  ].join("\n\n");
}
