"use client";

import { useState } from "react";
import { ClipboardList, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import {
  useStyle,
  EMPTY_PREFERENCES,
  type StylePreferences,
  type FitPreference,
  type Formality,
} from "@/lib/style/style-context";

const COLOR_OPTIONS = ["Emerald", "Midnight", "Ivory", "Gold", "Blush", "Sand", "Burgundy", "Black"];
const CLOTHING_TYPE_OPTIONS = ["Dresses", "Trousers", "Shirts", "Skirts", "Traditional wear", "Suits", "Casual wear", "Outerwear"];
const STYLE_OPTIONS = ["Casual", "Smart", "Formal", "Traditional", "Streetwear", "Sporty", "Elegant", "Minimal", "Bold"];
const SHOE_OPTIONS = ["Sneakers", "Heels", "Sandals", "Flats", "Boots", "Loafers"];
const ACCESSORY_OPTIONS = ["Bags", "Jewellery", "Watches", "Belts", "Headwraps", "Scarves"];
const OCCASION_OPTIONS = ["Everyday", "Work", "Weddings", "Religious", "Travel", "Nights Out", "Formal Events"];
const FIT_OPTIONS: FitPreference[] = ["Loose", "Fitted", "Either"];
const FORMALITY_OPTIONS: Formality[] = ["Very casual", "Casual", "Balanced", "Smart", "Very formal"];

type StepKey = keyof Omit<StylePreferences, "fitPreference" | "formality">;

interface MultiStep {
  kind: "multi";
  key: StepKey;
  question: string;
  options: string[];
}
interface SingleStep {
  kind: "single";
  key: "fitPreference" | "formality";
  question: string;
  options: string[];
}
type Step = MultiStep | SingleStep;

const STEPS: Step[] = [
  { kind: "multi", key: "favoriteColors", question: "What colours do you like wearing?", options: COLOR_OPTIONS },
  { kind: "single", key: "fitPreference", question: "Do you prefer loose or fitted clothes?", options: FIT_OPTIONS },
  { kind: "multi", key: "favoriteClothingTypes", question: "What do you usually wear?", options: CLOTHING_TYPE_OPTIONS },
  { kind: "multi", key: "favoriteStyles", question: "Which style do you like?", options: STYLE_OPTIONS },
  { kind: "multi", key: "preferredShoes", question: "Which shoes do you like?", options: SHOE_OPTIONS },
  { kind: "multi", key: "preferredAccessories", question: "Which accessories do you like?", options: ACCESSORY_OPTIONS },
  { kind: "multi", key: "commonOccasions", question: "What are you dressing for most often?", options: OCCASION_OPTIONS },
  { kind: "single", key: "formality", question: "How formal do you like to dress, generally?", options: FORMALITY_OPTIONS },
];

export default function StyleQuizPage() {
  const { preferences, styleLabel, hasCompletedQuiz, savePreferences } = useStyle();
  const [taking, setTaking] = useState(false);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<StylePreferences>(EMPTY_PREFERENCES);

  function startQuiz() {
    setDraft(EMPTY_PREFERENCES);
    setStep(0);
    setTaking(true);
  }

  function toggleMulti(key: StepKey, value: string) {
    setDraft((d) => {
      const current = d[key] as string[];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...d, [key]: next };
    });
  }

  function chooseSingle(key: "fitPreference" | "formality", value: string) {
    const next = { ...draft, [key]: value };
    setDraft(next);
    if (step + 1 < STEPS.length) {
      setStep(step + 1);
    } else {
      savePreferences(next);
      setTaking(false);
    }
  }

  function continueMulti() {
    if (step + 1 < STEPS.length) {
      setStep(step + 1);
    } else {
      savePreferences(draft);
      setTaking(false);
    }
  }

  if (!taking) {
    if (hasCompletedQuiz) {
      return (
        <div className="flex flex-col gap-8">
          <div className="flex flex-col items-center gap-4 rounded-card border border-gold bg-surface-elevated p-16 text-center">
            <CheckCircle2 size={32} className="text-gold" aria-hidden="true" />
            <p className="text-sm text-foreground-muted">Your style profile</p>
            <h1 className="font-serif text-3xl text-foreground">{styleLabel}</h1>
            <Button onClick={startQuiz} variant="outline">Retake the Quiz</Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {preferences.favoriteColors.length > 0 && (
              <PrefSummary label="Colours" values={preferences.favoriteColors} />
            )}
            {preferences.favoriteStyles.length > 0 && (
              <PrefSummary label="Styles" values={preferences.favoriteStyles} />
            )}
            {preferences.commonOccasions.length > 0 && (
              <PrefSummary label="Dresses for" values={preferences.commonOccasions} />
            )}
            {preferences.preferredShoes.length > 0 && (
              <PrefSummary label="Shoes" values={preferences.preferredShoes} />
            )}
          </div>
          <p className="text-xs text-foreground-muted">
            These preferences shape suggestions in the Outfit Builder and
            Complete the Look.
          </p>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center gap-4 rounded-card border border-border bg-surface-elevated p-16 text-center">
        <ClipboardList size={32} className="text-primary" aria-hidden="true" />
        <h1 className="font-serif text-2xl text-foreground">Discover your style</h1>
        <p className="max-w-sm text-sm text-foreground-muted">
          A few easy questions — no fashion jargon — to help tailor the
          Outfit Builder, Complete the Look, and future recommendations.
        </p>
        <Button onClick={startQuiz}>Start the Quiz</Button>
      </div>
    );
  }

  const current = STEPS[step];
  if (!current) return null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <ClipboardList className="text-primary" aria-hidden="true" />
        <div>
          <h1 className="font-serif text-3xl text-foreground">Style Quiz</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Question {step + 1} of {STEPS.length}
          </p>
        </div>
      </div>

      <h2 className="font-serif text-2xl text-foreground">{current.question}</h2>

      {current.kind === "single" ? (
        <div className="flex flex-col gap-3">
          {current.options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => chooseSingle(current.key, opt)}
              className="rounded-input border border-border bg-surface-elevated px-5 py-4 text-left text-sm text-foreground transition-colors hover:border-gold"
            >
              {opt}
            </button>
          ))}
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {current.options.map((opt) => {
              const selected = (draft[current.key] as string[]).includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleMulti(current.key, opt)}
                  aria-pressed={selected}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm transition-colors",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-foreground-muted hover:text-foreground"
                  )}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          <Button onClick={continueMulti} className="w-fit">
            {step + 1 < STEPS.length ? "Next" : "Finish"}
          </Button>
        </>
      )}
    </div>
  );
}

function PrefSummary({ label, values }: { label: string; values: string[] }) {
  return (
    <div className="rounded-card border border-border bg-surface-elevated p-4">
      <p className="text-xs font-medium text-foreground-muted">{label}</p>
      <p className="mt-1 text-sm text-foreground">{values.join(", ")}</p>
    </div>
  );
}
