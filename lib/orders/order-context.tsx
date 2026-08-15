"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface OrderItem {
  productId: string;
  name: string;
  color: string;
  size: string;
  qty: number;
  price: number;
}

// "Cancelled" added for Phase 4's inventory-restoration flow: cancelling
// an order restores the stock it deducted (see lib/inventory and
// app/admin/orders/page.tsx, which calls restoreStock alongside this).
export type OrderStatus = "Placed" | "Processing" | "Shipped" | "Delivered" | "Cancelled";

export interface Order {
  id: string;
  date: string; // ISO string
  items: OrderItem[];
  total: number;
  status: OrderStatus;
}

interface OrderContextValue {
  orders: Order[];
  addOrder: (order: Omit<Order, "status">) => void;
  updateStatus: (id: string, status: OrderStatus) => void;
}

const OrderContext = createContext<OrderContextValue | undefined>(undefined);
const STORAGE_KEY = "omv-orders";

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setOrders(JSON.parse(stored));
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }, [orders, hydrated]);

  const addOrder: OrderContextValue["addOrder"] = (order) => {
    // Phase 3 mocks a realistic mid-flight status so Order Tracking has
    // something meaningful to visualize. Phase 5's real API will set this
    // from actual fulfillment events instead.
    setOrders((prev) => [{ ...order, status: "Processing" }, ...prev]);
  };

  // Phase 4: lets the Admin Portal's Orders page advance a real order's
  // status — the same order list customers see in their own dashboard.
  const updateStatus: OrderContextValue["updateStatus"] = (id, status) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateStatus }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrders must be used within an OrderProvider");
  return ctx;
}
