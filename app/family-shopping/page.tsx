"use client";

import { useState, type FormEvent } from "react";
import { Users, Trash2, Info } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { useFamily, type FamilyMember } from "@/lib/family/family-context";

const RELATIONS: FamilyMember["relation"][] = ["Self", "Partner", "Child", "Other"];

export default function FamilyShoppingPage() {
  const { members, activeId, addMember, removeMember, setActive } = useFamily();
  const [relation, setRelation] = useState<FamilyMember["relation"]>("Child");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const sizeNote = String(formData.get("sizeNote") ?? "").trim();
    if (!name) return;
    addMember({ name, relation, sizeNote });
    e.currentTarget.reset();
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="flex items-center gap-3">
        <Users className="text-primary" size={28} aria-hidden="true" />
        <h1 className="font-serif text-3xl text-foreground">Family Shopping</h1>
      </div>
      <p className="mt-3 max-w-2xl text-sm text-foreground-muted">
        One account, one cart — build a profile for every family member so
        sizes and preferences are always at hand while you shop.
      </p>

      <div className="mt-4 flex items-start gap-3 rounded-card border border-dashed border-border bg-surface-elevated p-4 text-xs text-foreground-muted">
        <Info size={16} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />
        <p>
          Family profiles will be tied to your signed-in account once the
          real authentication API lands in Phase 5. For this review, profiles
          are saved locally in your browser so you can test the full flow.
        </p>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div>
          <h2 className="mb-4 font-serif text-lg text-foreground">Family members</h2>
          {members.length === 0 ? (
            <p className="rounded-card border border-border bg-surface-elevated p-8 text-center text-sm text-foreground-muted">
              No family members added yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {members.map((m) => (
                <li key={m.id}>
                  <Card
                    className={cn(
                      "flex items-center justify-between gap-4 p-4",
                      activeId === m.id && "border-gold"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setActive(activeId === m.id ? null : m.id)}
                      className="flex-1 text-left"
                    >
                      <p className="font-serif text-base text-foreground">{m.name}</p>
                      <p className="text-xs text-foreground-muted">
                        {m.relation}
                        {m.sizeNote ? ` · ${m.sizeNote}` : ""}
                      </p>
                      {activeId === m.id && (
                        <span className="mt-1 inline-block text-xs text-gold">
                          Shopping for {m.name}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${m.name}`}
                      onClick={() => removeMember(m.id)}
                      className="text-foreground-muted hover:text-red-400"
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form onSubmit={handleSubmit} className="h-fit rounded-card border border-border bg-surface-elevated p-6">
          <h2 className="mb-4 font-serif text-lg text-foreground">Add a family member</h2>
          <div className="flex flex-col gap-4">
            <Input label="Name" name="name" required />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Relation</label>
              <select
                value={relation}
                onChange={(e) => setRelation(e.target.value as FamilyMember["relation"])}
                className="h-11 w-full rounded-input border border-border bg-surface px-4 text-sm text-foreground"
              >
                {RELATIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <Input label="Size notes" name="sizeNote" placeholder="e.g. Age 6, medium" />
            <Button type="submit">Add to Family</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
