import { ChatWindow } from "@/components/chat/chat-window";
import { listCustomers } from "@/lib/services/order.service";

export default async function ChatPage() {
  const customers = await listCustomers();
  return <ChatWindow customers={customers} />;
}
