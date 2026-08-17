"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type ReviewStatus = "Pending" | "Approved" | "Rejected";

export interface AdminReview {
  id: string;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
}

const SEED: AdminReview[] = [
  {
    id: "r1",
    productName: "Emerald Wrap Dress",
    customerName: "Amaka Johnson",
    rating: 5,
    comment: "Beautiful fit, exactly as pictured.",
    status: "Pending",
  },
  {
    id: "r2",
    productName: "Forest Linen Shirt",
    customerName: "David Okafor",
    rating: 4,
    comment: "Great quality, runs slightly large.",
    status: "Pending",
  },
  {
    id: "r3",
    productName: "Heritage Gold Clutch",
    customerName: "Grace Ibe",
    rating: 5,
    comment: "Perfect for the wedding season.",
    status: "Approved",
  },
];

interface AdminReviewsContextValue {
  reviews: AdminReview[];
  setStatus: (id: string, status: ReviewStatus) => void;
}

const AdminReviewsContext = createContext<AdminReviewsContextValue | undefined>(undefined);
const STORAGE_KEY = "omv-admin-reviews";

export function AdminReviewsProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      setReviews(stored ? JSON.parse(stored) : SEED);
    } catch {
      setReviews(SEED);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  }, [reviews, hydrated]);

  const setStatus: AdminReviewsContextValue["setStatus"] = (id, status) =>
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));

  return (
    <AdminReviewsContext.Provider value={{ reviews, setStatus }}>
      {children}
    </AdminReviewsContext.Provider>
  );
}

export function useAdminReviews() {
  const ctx = useContext(AdminReviewsContext);
  if (!ctx) throw new Error("useAdminReviews must be used within an AdminReviewsProvider");
  return ctx;
}
