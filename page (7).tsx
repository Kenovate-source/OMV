"use client";

import { type FormEvent } from "react";
import { Tag, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { RequireRole } from "@/components/admin/RequireRole";
import { cn } from "@/lib/cn";
import { useAdminPromotions } from "@/lib/admin/admin-promotions-context";
import { useAdminAudit } from "@/lib/admin/admin-audit-context";
import { useAdminAuth } from "@/lib/admin/admin-auth-context";

export default function AdminPromotionsPage() {
  const { promotions, addPromotion, toggleActive, removePromotion } = useAdminPromotions();
  const { logAction } = useAdminAudit();
  const { currentAdmin } = useAdminAuth();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const code = String(fd.get("code") ?? "").trim();
    const discount = Number(fd.get("discount") ?? 0);
    if (!code || !discount) return;
    addPromotion(code, discount);
    if (currentAdmin) logAction(currentAdmin.name, `Created promotion ${code.toUpperCase()} (${discount}%)`);
    e.currentTarget.reset();
  }

  function handleToggle(id: string, code: string) {
    toggleActive(id);
    if (currentAdmin) logAction(currentAdmin.name, `Toggled promotion ${code}`);
  }

  function handleRemove(id: string, code: string) {
    removePromotion(id);
    if (currentAdmin) logAction(currentAdmin.name, `Removed promotion ${code}`);
  }

  return (
    <RequireRole roles={["super", "business"]}>
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <Tag className="text-primary" aria-hidden="true" />
          <div>
            <h1 className="font-serif text-3xl text-foreground">Promotions</h1>
            <p className="mt-1 text-sm text-foreground-muted">Create and manage discount codes.</p>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
          <ul className="flex flex-col gap-4">
            {promotions.map((p) => (
              <li key={p.id}>
                <Card className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="font-serif text-base text-foreground">{p.code}</p>
                    <p className="text-xs text-foreground-muted">{p.discountPercent}% off</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggle(p.id, p.code)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs",
                        p.active
                          ? "border-primary text-primary"
                          : "border-border text-foreground-muted"
                      )}
                    >
                      {p.active ? "Active" : "Inactive"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(p.id, p.code)}
                      aria-label={`Remove ${p.code}`}
                      className="text-foreground-muted hover:text-red-400"
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>

          <form
            onSubmit={handleSubmit}
            className="h-fit rounded-card border border-border bg-surface-elevated p-6"
          >
            <h2 className="mb-4 font-serif text-lg text-foreground">New promotion</h2>
            <div className="flex flex-col gap-4">
              <Input label="Code" name="code" placeholder="SUMMER20" required />
              <Input label="Discount %" name="discount" type="number" min="1" max="100" required />
              <Button type="submit">Create Promotion</Button>
            </div>
          </form>
        </div>
      </div>
    </RequireRole>
  );
}
