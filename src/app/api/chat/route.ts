import { NextResponse } from "next/server";
import { z } from "zod";
import { handleCustomerMessage } from "@/lib/services/conversation.service";

const chatSchema = z.object({
  conversationId: z.string().optional().nullable(),
  customerId: z.string().min(1),
  orderId: z.string().optional().nullable(),
  orderItemId: z.string().optional().nullable(),
  message: z.string().min(1)
});

const REFUND_KEYWORDS = [
  "refund", "return", "damaged", "broken", "defective", "wrong", "missing",
  "exchange", "replace", "credit", "money back", "reimburse", "refundable",
  "policy", "eligibility", "approve", "deny", "escalate", "order", "delivery",
  "shipped", "arrived", "received", "item", "product", "purchase"
];

function isRefundRelated(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return REFUND_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
}

function getConversationalResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
    return "Hello! I'm here to help you with refund requests and order-related issues. How can I assist you today?";
  }
  
  if (lowerMessage.includes("name") || lowerMessage.includes("who are you")) {
    return "I'm the AI Refund Support Agent. I can help you process refund requests, check refund eligibility, and answer questions about our refund policy.";
  }
  
  if (lowerMessage.includes("thank")) {
    return "You're welcome! Is there anything else I can help you with regarding your order or refund?";
  }
  
  if (lowerMessage.includes("help") || lowerMessage.includes("can you do")) {
    return "I can help you with:\n• Processing refund requests\n• Checking refund eligibility\n• Answering questions about our refund policy\n• Reviewing order details\n\nPlease select an order and describe your refund issue to get started.";
  }
  
  return "I'm here to help with refund requests and order-related issues. Please select an order and describe your refund issue, or let me know if you have questions about our refund policy.";
}

export async function POST(request: Request) {
  const parsed = chatSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Invalid chat request." } }, { status: 400 });
  }
  
  const { message } = parsed.data;
  
  // Intent detection: only trigger refund workflow for refund-related messages
  if (!isRefundRelated(message)) {
    return NextResponse.json({
      conversationId: parsed.data.conversationId ?? undefined,
      message: getConversationalResponse(message),
      toolEvents: []
    });
  }
  
  const result = await handleCustomerMessage({
    conversationId: parsed.data.conversationId ?? undefined,
    customerId: parsed.data.customerId,
    orderId: parsed.data.orderId ?? undefined,
    orderItemId: parsed.data.orderItemId ?? undefined,
    message: parsed.data.message
  });
  return NextResponse.json({
    conversationId: result.conversationId,
    message: result.assistantMessage,
    refundRequestId: "refundRequestId" in result ? result.refundRequestId : undefined,
    toolEvents: result.toolEvents
  });
}
