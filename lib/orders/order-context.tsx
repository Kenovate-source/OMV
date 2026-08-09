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
  size: string;
  qty: number;
  price: number;
}

export type OrderStatus = "Placed" | "Processing" | "Shipped" | "Delivered";

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

  return (
    <OrderContext.Provider value={{ orders, addOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrders must be used within an OrderProvider");
  return ctx;
}
