"use client";

import { Star } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { RequireRole } from "@/components/admin/RequireRole";
import { cn } from "@/lib/cn";
import { useAdminReviews, type ReviewStatus } from "@/lib/admin/admin-reviews-context";
import { useAdminAudit } from "@/lib/admin/admin-audit-context";
import { useAdminAuth } from "@/lib/admin/admin-auth-context";

export default function AdminReviewsPage() {
  const { reviews, setStatus } = useAdminReviews();
  const { logAction } = useAdminAudit();
  const { currentAdmin } = useAdminAuth();

  function handleStatus(id: string, product: string, status: ReviewStatus) {
    setStatus(id, status);
    if (currentAdmin) logAction(currentAdmin.name, `${status} review for ${product}`);
  }

  return (
    <RequireRole roles={["super", "business"]}>
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <Star className="text-primary" aria-hidden="true" />
          <div>
            <h1 className="font-serif text-3xl text-foreground">Reviews</h1>
            <p className="mt-1 text-sm text-foreground-muted">
              Moderate product reviews. Illustrative dataset — customer
              review submission isn&apos;t built into the storefront yet
              (deferred; see IMPLEMENTATION_LOG.md).
            </p>
          </div>
        </div>

        <ul className="flex flex-col gap-4">
          {reviews.map((r) => (
            <li key={r.id}>
              <Card className="flex flex-col gap-3 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-serif text-base text-foreground">{r.productName}</p>
                    <p className="text-xs text-foreground-muted">
                      {r.customerName} · {"★".repeat(r.rating)}
                      {"☆".repeat(5 - r.rating)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs",
                      r.status === "Approved" && "border-primary text-primary",
                      r.status === "Rejected" && "border-red-400 text-red-400",
                      r.status === "Pending" && "border-gold text-gold"
                    )}
                  >
                    {r.status}
                  </span>
                </div>
                <p className="text-sm text-foreground-muted">{r.comment}</p>
                {r.status === "Pending" && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleStatus(r.id, r.productName, "Approved")}
                      className="rounded-button bg-primary px-4 py-2 text-xs text-primary-foreground"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatus(r.id, r.productName, "Rejected")}
                      className="rounded-button border border-border px-4 py-2 text-xs text-foreground-muted hover:text-red-400"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </RequireRole>
  );
}
