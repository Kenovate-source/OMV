"use client";

import { useState, type FormEvent } from "react";
import { Sparkles, Send } from "lucide-react";
import { cn } from "@/lib/cn";
import { PRODUCTS, formatNaira } from "@/lib/data/products";

interface Message {
  role: "user" | "assistant";
  text: string;
  suggestions?: string[]; // product ids
}

function generateReply(input: string): Message {
  const q = input.toLowerCase();
  const matches = PRODUCTS.filter(
    (p) =>
      q.includes(p.category) ||
      p.name.toLowerCase().split(" ").some((word) => word.length > 3 && q.includes(word))
  ).slice(0, 3);

  if (matches.length > 0) {
    return {
      role: "assistant",
      text: "Here's what I'd pull for that — these lean into a calm, considered look:",
      suggestions: matches.map((m) => m.id),
    };
  }

  return {
    role: "assistant",
    text: "Tell me an occasion, a category (women, men, kids) or a piece you already own, and I'll suggest a pairing. Full personalized styling connects to your order and profile history once Phase 5's real AI service is live.",
  };
}

export default function AiStylistPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: 'Hi! I\'m the OMV stylist. Ask me about an occasion, or a piece you\'d like styled — for example, "something for a family wedding".',
    },
  ]);
  const [input, setInput] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    const userMsg: Message = { role: "user", text: trimmed };
    const reply = generateReply(trimmed);
    setMessages((prev) => [...prev, userMsg, reply]);
    setInput("");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Sparkles className="text-accent" aria-hidden="true" />
        <div>
          <h1 className="font-serif text-3xl text-foreground">AI Fashion Assistant</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            A lightweight preview — keyword-matched against the catalogue.
            Real personalization arrives with Phase 5.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-card border border-border bg-surface-elevated p-6">
        <div className="flex flex-col gap-4" aria-live="polite">
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn("flex flex-col gap-3", m.role === "user" ? "items-end" : "items-start")}
            >
              <div
                className={cn(
                  "max-w-md rounded-2xl px-4 py-3 text-sm",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-accent text-accent-foreground"
                )}
              >
                {m.text}
              </div>
              {m.suggestions && (
                <div className="flex flex-wrap gap-3">
                  {m.suggestions.map((id) => {
                    const p = PRODUCTS.find((prod) => prod.id === id);
                    if (!p) return null;
                    const [from, to] = p.swatch;
                    return (
                      <div key={id} className="w-32 rounded-input border border-border bg-surface p-2">
                        <div
                          className="aspect-[4/5] rounded-[10px]"
                          style={{ background: `linear-gradient(155deg, ${from}, ${to})` }}
                          aria-hidden="true"
                        />
                        <p className="mt-2 text-xs text-foreground">{p.name}</p>
                        <p className="text-xs text-foreground-muted">{formatNaira(p.price)}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2 border-t border-border pt-4">
          <label htmlFor="ai-input" className="sr-only">
            Message the stylist
          </label>
          <input
            id="ai-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. something for a family wedding…"
            className="h-11 flex-1 rounded-input border border-border bg-surface px-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-gold"
          />
          <button
            type="submit"
            aria-label="Send message"
            className="flex h-11 w-11 items-center justify-center rounded-input bg-accent text-accent-foreground"
          >
            <Send size={16} aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
}
