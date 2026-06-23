"use client";

type Order = {
  id: string;
  status: string;
  totalAmount: number;
  items: Array<{ id: string; product: { name: string }; quantity: number }>;
};

export function OrderPicker({
  orders,
  orderId,
  orderItemId,
  onOrderChange,
  onOrderItemChange
}: {
  orders: Order[];
  orderId: string;
  orderItemId: string;
  onOrderChange: (id: string) => void;
  onOrderItemChange: (id: string) => void;
}) {
  const selected = orders.find((order) => order.id === orderId);
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <label className="text-sm font-medium text-slate-700">
        Order
        <select
          value={orderId}
          onChange={(event) => onOrderChange(event.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          aria-label="Select order"
        >
          <option value="">Select order</option>
          {orders.map((order) => (
            <option key={order.id} value={order.id}>
              {order.id.slice(-8)} - {order.status}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm font-medium text-slate-700">
        Item
        <select
          value={orderItemId}
          onChange={(event) => onOrderItemChange(event.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          aria-label="Select item"
        >
          <option value="">Select item</option>
          {selected?.items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.product.name} x{item.quantity}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
