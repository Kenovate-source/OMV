"use client";

import { type FormEvent } from "react";
import { MapPin, Trash2, Star } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { useAddresses } from "@/lib/addresses/address-context";

export default function AddressesPage() {
  const { addresses, addAddress, removeAddress, setDefault } = useAddresses();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addAddress({
      label: String(fd.get("label") ?? "Home"),
      fullName: String(fd.get("fullName") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      line1: String(fd.get("line1") ?? ""),
      city: String(fd.get("city") ?? ""),
      state: String(fd.get("state") ?? ""),
    });
    e.currentTarget.reset();
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-3xl text-foreground">Addresses</h1>
        <p className="mt-2 text-sm text-foreground-muted">
          Saved delivery addresses for faster checkout.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
        <div>
          {addresses.length === 0 ? (
            <p className="rounded-card border border-border bg-surface-elevated p-8 text-center text-sm text-foreground-muted">
              No saved addresses yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {addresses.map((a) => (
                <li key={a.id}>
                  <Card
                    className={cn(
                      "flex items-start justify-between gap-4 p-5",
                      a.isDefault && "border-gold"
                    )}
                  >
                    <div className="flex gap-3">
                      <MapPin className="mt-0.5 shrink-0 text-primary" size={18} aria-hidden="true" />
                      <div>
                        <p className="font-serif text-base text-foreground">
                          {a.label}
                          {a.isDefault && <span className="ml-2 text-xs text-gold">Default</span>}
                        </p>
                        <p className="mt-1 text-xs text-foreground-muted">
                          {a.fullName} · {a.phone}
                        </p>
                        <p className="text-xs text-foreground-muted">
                          {a.line1}, {a.city}, {a.state}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!a.isDefault && (
                        <button
                          type="button"
                          onClick={() => setDefault(a.id)}
                          aria-label={`Set ${a.label} as default address`}
                          className="text-foreground-muted hover:text-gold"
                        >
                          <Star size={16} aria-hidden="true" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeAddress(a.id)}
                        aria-label={`Remove ${a.label} address`}
                        className="text-foreground-muted hover:text-red-400"
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="h-fit rounded-card border border-border bg-surface-elevated p-6"
        >
          <h2 className="mb-4 font-serif text-lg text-foreground">Add address</h2>
          <div className="flex flex-col gap-4">
            <Input label="Label" name="label" placeholder="Home, Office…" required />
            <Input label="Full name" name="fullName" required />
            <Input label="Phone" name="phone" type="tel" required />
            <Input label="Address" name="line1" required />
            <div className="grid grid-cols-2 gap-4">
              <Input label="City" name="city" required />
              <Input label="State" name="state" required />
            </div>
            <Button type="submit">Save Address</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
