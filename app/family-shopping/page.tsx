"use client";

import { useState, type FormEvent } from "react";
import { Users, Trash2, Info, Pencil } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import {
  useFamily,
  RELATIONSHIP_OPTIONS,
  AGE_GROUPS,
  STYLE_PREFERENCES,
  type AgeGroup,
  type StylePreference,
  type ClothingSizes,
  type NewFamilyMember,
} from "@/lib/family/family-context";

const COLOR_OPTIONS = [
  "Emerald", "Midnight", "Ivory", "Gold", "Blush", "Sand", "Burgundy", "Black",
];

const EMPTY_SIZES: ClothingSizes = {
  tops: "",
  bottoms: "",
  dresses: "",
  outerwear: "",
  traditionalWear: "",
  other: "",
};

function emptyDraft(): NewFamilyMember {
  return {
    name: "",
    relationship: "Child",
    ageGroup: "Adult",
    genderPresentation: "",
    clothingSizes: { ...EMPTY_SIZES },
    shoeSize: "",
    stylePreferences: [],
    colorPreferences: [],
  };
}

export default function FamilyShoppingPage() {
  const { members, activeId, addMember, updateMember, removeMember, setActive } = useFamily();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<NewFamilyMember>(emptyDraft());

  function startEdit(id: string) {
    const m = members.find((x) => x.id === id);
    if (!m) return;
    const { id: _unused, ...rest } = m;
    setDraft(rest);
    setEditingId(id);
  }

  function startAdd() {
    setDraft(emptyDraft());
    setEditingId(null);
  }

  function toggleStyle(style: StylePreference) {
    setDraft((d) => ({
      ...d,
      stylePreferences: d.stylePreferences.includes(style)
        ? d.stylePreferences.filter((s) => s !== style)
        : [...d.stylePreferences, style],
    }));
  }

  function toggleColor(color: string) {
    setDraft((d) => ({
      ...d,
      colorPreferences: d.colorPreferences.includes(color)
        ? d.colorPreferences.filter((c) => c !== color)
        : [...d.colorPreferences, color],
    }));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!draft.name.trim()) return;
    if (editingId) {
      updateMember(editingId, draft);
    } else {
      addMember(draft);
    }
    startAdd();
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="flex items-center gap-3">
        <Users className="text-primary" size={28} aria-hidden="true" />
        <h1 className="font-serif text-3xl text-foreground">Family Shopping</h1>
      </div>
      <p className="mt-3 max-w-2xl text-sm text-foreground-muted">
        One account, one cart — build a profile for every family member so
        sizes, fit and style preferences are always at hand while you shop.
      </p>

      <div className="mt-4 flex items-start gap-3 rounded-card border border-dashed border-border bg-surface-elevated p-4 text-xs text-foreground-muted">
        <Info size={16} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />
        <p>
          Family profiles will be tied to your signed-in account once the
          real authentication API lands in Phase 5. For this review, profiles
          are saved locally in your browser so you can test the full flow.
        </p>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          <h2 className="mb-4 font-serif text-lg text-foreground">Family members</h2>
          {members.length === 0 ? (
            <p className="rounded-card border border-border bg-surface-elevated p-8 text-center text-sm text-foreground-muted">
              No family members added yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {members.map((m) => {
                const sizeEntries = Object.entries(m.clothingSizes).filter(([, v]) => v);
                return (
                  <li key={m.id}>
                    <Card
                      className={cn("flex flex-col gap-3 p-4", activeId === m.id && "border-gold")}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <button
                          type="button"
                          onClick={() => setActive(activeId === m.id ? null : m.id)}
                          className="flex-1 text-left"
                        >
                          <p className="font-serif text-base text-foreground">{m.name}</p>
                          <p className="text-xs text-foreground-muted">
                            {m.relationship} · {m.ageGroup}
                            {m.genderPresentation ? ` · ${m.genderPresentation}` : ""}
                          </p>
                          {activeId === m.id && (
                            <span className="mt-1 inline-block text-xs text-gold">
                              Shopping for {m.name}
                            </span>
                          )}
                        </button>
                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            aria-label={`Edit ${m.name}`}
                            onClick={() => startEdit(m.id)}
                            className="text-foreground-muted hover:text-gold"
                          >
                            <Pencil size={16} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Remove ${m.name}`}
                            onClick={() => removeMember(m.id)}
                            className="text-foreground-muted hover:text-red-400"
                          >
                            <Trash2 size={16} aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      {(sizeEntries.length > 0 || m.shoeSize) && (
                        <p className="text-xs text-foreground-muted">
                          {sizeEntries.map(([k, v]) => `${k}: ${v}`).join(" · ")}
                          {m.shoeSize ? `${sizeEntries.length ? " · " : ""}shoe: ${m.shoeSize}` : ""}
                        </p>
                      )}

                      {(m.stylePreferences.length > 0 || m.colorPreferences.length > 0) && (
                        <div className="flex flex-wrap gap-1.5">
                          {m.stylePreferences.map((s) => (
                            <span key={s} className="rounded-full border border-border px-2.5 py-0.5 text-[11px] text-foreground-muted">
                              {s}
                            </span>
                          ))}
                          {m.colorPreferences.map((c) => (
                            <span key={c} className="rounded-full border border-gold/40 px-2.5 py-0.5 text-[11px] text-gold">
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </Card>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="h-fit rounded-card border border-border bg-surface-elevated p-6"
        >
          <h2 className="mb-4 font-serif text-lg text-foreground">
            {editingId ? "Edit family member" : "Add a family member"}
          </h2>
          <div className="flex flex-col gap-4">
            <Input
              label="Name"
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              required
            />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Relationship
              </label>
              <input
                list="relationship-options"
                value={draft.relationship}
                onChange={(e) => setDraft((d) => ({ ...d, relationship: e.target.value }))}
                className="h-11 w-full rounded-input border border-border bg-surface px-4 text-sm text-foreground"
              />
              <datalist id="relationship-options">
                {RELATIONSHIP_OPTIONS.map((r) => (
                  <option key={r} value={r} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Age group
              </label>
              <select
                value={draft.ageGroup}
                onChange={(e) => setDraft((d) => ({ ...d, ageGroup: e.target.value as AgeGroup }))}
                className="h-11 w-full rounded-input border border-border bg-surface px-4 text-sm text-foreground"
              >
                {AGE_GROUPS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <Input
              label="Gender presentation (optional)"
              value={draft.genderPresentation}
              onChange={(e) => setDraft((d) => ({ ...d, genderPresentation: e.target.value }))}
              placeholder="e.g. Menswear, Womenswear"
            />

            <fieldset>
              <legend className="mb-2 text-sm font-medium text-foreground">Clothing sizes</legend>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(EMPTY_SIZES) as (keyof ClothingSizes)[]).map((key) => (
                  <Input
                    key={key}
                    label={key === "traditionalWear" ? "Traditional wear" : key.charAt(0).toUpperCase() + key.slice(1)}
                    value={draft.clothingSizes[key]}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        clothingSizes: { ...d.clothingSizes, [key]: e.target.value },
                      }))
                    }
                    placeholder="e.g. M"
                  />
                ))}
              </div>
            </fieldset>

            <Input
              label="Shoe size"
              value={draft.shoeSize}
              onChange={(e) => setDraft((d) => ({ ...d, shoeSize: e.target.value }))}
              placeholder="e.g. UK 7"
            />

            <fieldset>
              <legend className="mb-2 text-sm font-medium text-foreground">Style preferences</legend>
              <div className="flex flex-wrap gap-2">
                {STYLE_PREFERENCES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleStyle(s)}
                    aria-pressed={draft.stylePreferences.includes(s)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs transition-colors",
                      draft.stylePreferences.includes(s)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-foreground-muted"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-2 text-sm font-medium text-foreground">Colour preferences</legend>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleColor(c)}
                    aria-pressed={draft.colorPreferences.includes(c)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs transition-colors",
                      draft.colorPreferences.includes(c)
                        ? "border-gold bg-gold text-gold-foreground"
                        : "border-border text-foreground-muted"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                {editingId ? "Save Changes" : "Add to Family"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={startAdd}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
