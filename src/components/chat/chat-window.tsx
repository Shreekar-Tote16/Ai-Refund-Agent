//C:\Users\user\ai-refund-agent\src\components\chat\chat-window.tsx
"use client";

import type { Customer } from "@prisma/client";
import { Send, MessageSquare, Package, AlertCircle, HelpCircle, RefreshCw } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { MessageBubble } from "@/components/chat/message-bubble";
import { OrderPicker } from "@/components/chat/order-picker";
import { ToolCallBadge, ToolCallCard } from "@/components/chat/tool-call-badge";

type Order = {
  id: string;
  status: string;
  totalAmount: number;
  items: Array<{ id: string; product: { name: string }; quantity: number }>;
};

type Message = { id: string; role: "user" | "assistant"; content: string };
type ToolEvent = { name: string; summary: string; status?: "success" | "error" | "pending"; inputs?: Record<string, unknown>; outputs?: Record<string, unknown>; timestamp?: Date; duration?: number };

const SUGGESTED_PROMPTS = [
  { icon: <AlertCircle className="h-4 w-4" />, text: "My product arrived damaged" },
  { icon: <Package className="h-4 w-4" />, text: "I want to return my order" },
  { icon: <RefreshCw className="h-4 w-4" />, text: "Check my refund eligibility" },
  { icon: <HelpCircle className="h-4 w-4" />, text: "Where is my refund?" }
];

export function ChatWindow({ customers }: { customers: Customer[] }) {
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderId, setOrderId] = useState("");
  const [orderItemId, setOrderItemId] = useState("");
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [toolEvents, setToolEvents] = useState<ToolEvent[]>([]);
  const [pending, setPending] = useState(false);
  const [loadingStage, setLoadingStage] = useState<string>("");

  useEffect(() => {
    if (!customerId) return;
    fetch(`/api/orders/${customerId}`)
      .then((response) => response.json())
      .then((data) => {
        setOrders(data.orders ?? []);
        setOrderId("");
        setOrderItemId("");
      });
  }, [customerId]);

  const selectedOrder = useMemo(() => orders.find((order) => order.id === orderId), [orders, orderId]);

  useEffect(() => {
    setOrderItemId(selectedOrder?.items[0]?.id ?? "");
  }, [selectedOrder]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const message = String(form.get("message") ?? "").trim();
    if (!message || !customerId) return;
    event.currentTarget.reset();
    const userMessage = { id: crypto.randomUUID(), role: "user" as const, content: message };
    setMessages((current) => [...current, userMessage]);
    setPending(true);
    setLoadingStage("Checking order details...");
    
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, customerId, orderId, orderItemId, message })
    });
    
    setLoadingStage("Processing your request...");
    const data = await response.json();
    setPending(false);
    setLoadingStage("");
    
    if (!response.ok) {
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", content: data.error?.message ?? "Request failed." }]);
      return;
    }
    setConversationId(data.conversationId);
    setToolEvents(data.toolEvents ?? []);
    setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", content: data.message }]);
  }

  function handleSuggestedPrompt(prompt: string) {
    const form = document.querySelector("form") as HTMLFormElement;
    const input = form.querySelector("input[name='message']") as HTMLInputElement;
    input.value = prompt;
    form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
  }

  return (
    <section className="mx-auto grid min-h-screen max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[320px_1fr]">
      <aside className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Customer Refund Chat</h1>
        <label className="mt-5 block text-sm font-medium text-slate-700">
          Customer
          <select
            value={customerId}
            onChange={(event) => setCustomerId(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            aria-label="Select customer"
          >
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </label>
        <div className="mt-4">
          <OrderPicker orders={orders} orderId={orderId} orderItemId={orderItemId} onOrderChange={setOrderId} onOrderItemChange={setOrderItemId} />
        </div>
        <div className="mt-5 space-y-2">
          {toolEvents.map((event, index) => (
            <ToolCallCard key={`${event.name}-${event.summary}-${index}`} event={event} />
          ))}
        </div>
      </aside>
      <div className="flex min-h-[720px] flex-col rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
                <MessageSquare className="h-8 w-8 text-teal-700" />
              </div>
              <div className="text-center">
                <h2 className="text-lg font-semibold text-slate-900">Welcome to Refund Support</h2>
                <p className="mt-2 text-sm text-slate-600">Select an order and describe your refund issue, or choose a suggested prompt below.</p>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {SUGGESTED_PROMPTS.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedPrompt(prompt.text)}
                    disabled={pending}
                    className="flex items-center gap-2 rounded-md border border-slate-200 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {prompt.icon}
                    <span>{prompt.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => <MessageBubble key={message.id} role={message.role} content={message.content} />)
          )}
          {pending && (
            <div className="flex items-center gap-3 rounded-md bg-slate-50 p-4">
              <div className="flex space-x-1">
                <div className="h-2 w-2 animate-bounce rounded-full bg-teal-600" style={{ animationDelay: "0ms" }} />
                <div className="h-2 w-2 animate-bounce rounded-full bg-teal-600" style={{ animationDelay: "150ms" }} />
                <div className="h-2 w-2 animate-bounce rounded-full bg-teal-600" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-sm text-slate-600">{loadingStage}</span>
            </div>
          )}
        </div>
        <form onSubmit={submit} className="flex gap-3 border-t border-slate-200 p-4">
          <input
            name="message"
            className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            placeholder="Example: The item arrived damaged."
            autoComplete="off"
            aria-label="Type your message"
          />
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
            Send
          </button>
        </form>
      </div>
    </section>
  );
}
