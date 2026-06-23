import { ChatOpenAI } from "@langchain/openai";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";

export function createChatModel(): BaseChatModel | null {
  if ((process.env.LLM_PROVIDER ?? "local") === "local") return null;
  if (!process.env.OPENAI_API_KEY) return null;
  return new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    temperature: 0
  });
}
