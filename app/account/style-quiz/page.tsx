"use client";

import { useState } from "react";
import { ClipboardList, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useStyle } from "@/lib/style/style-context";

const QUESTIONS = [
  {
    question: "Pick a weekend look",
    options: ["Tailored & structured", "Relaxed linen", "Bold statement pieces"],
  },
  {
    question: "Your go-to colour palette",
    options: ["Deep neutrals", "Earthy tones", "Rich jewel tones"],
  },
  {
    question: "How do you shop for the family?",
    options: ["Coordinated matching sets", "Everyone in their own style", "Occasion-first"],
  },
];

const RESULTS = ["Modern Minimalist", "Relaxed Heritage", "Bold Statement"];
const DEFAULT_RESULT = "Modern Minimalist";

export default function StyleQuizPage() {
  const { styleProfile, setStyleProfile } = useStyle();
  const [taking, setTaking] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  function handleAnswer(optionIndex: number) {
    const next = [...answers, optionIndex];
    setAnswers(next);
    if (step + 1 < QUESTIONS.length) {
      setStep(step + 1);
      return;
    }
    const avg = Math.round(next.reduce((a, b) => a + b, 0) / next.length);
    // RESULTS[avg] is `string | undefined` under noUncheckedIndexedAccess;
    // fall back to a concrete literal rather than re-indexing the array.
    setStyleProfile(RESULTS[Math.min(avg, RESULTS.length - 1)] ?? DEFAULT_RESULT);
    setTaking(false);
  }

  function startQuiz() {
    setStep(0);
    setAnswers([]);
    setTaking(true);
  }

  if (!taking) {
    if (styleProfile) {
      return (
        <div className="flex flex-col items-center gap-4 rounded-card border border-gold bg-surface-elevated p-16 text-center">
          <CheckCircle2 size={32} className="text-gold" aria-hidden="true" />
          <p className="text-sm text-foreground-muted">Your style profile</p>
          <h1 className="font-serif text-3xl text-foreground">{styleProfile}</h1>
          <Button onClick={startQuiz} variant="outline">
            Retake the Quiz
          </Button>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center gap-4 rounded-card border border-border bg-surface-elevated p-16 text-center">
        <ClipboardList size={32} className="text-primary" aria-hidden="true" />
        <h1 className="font-serif text-2xl text-foreground">Discover your style</h1>
        <p className="max-w-sm text-sm text-foreground-muted">
          Three quick questions to help tailor future recommendations and the
          AI Fashion Assistant.
        </p>
        <Button onClick={startQuiz}>Start the Quiz</Button>
      </div>
    );
  }

  // QUESTIONS[step] is `{...} | undefined` under noUncheckedIndexedAccess;
  // guard and bail rather than assert, same pattern as the Vercel build fix.
  const current = QUESTIONS[step];
  if (!current) return null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <ClipboardList className="text-primary" aria-hidden="true" />
        <div>
          <h1 className="font-serif text-3xl text-foreground">Style Quiz</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Question {step + 1} of {QUESTIONS.length}
          </p>
        </div>
      </div>

      <h2 className="font-serif text-2xl text-foreground">{current.question}</h2>
      <div className="flex flex-col gap-3">
        {current.options.map((opt, i) => (
          <button
            key={opt}
            type="button"
            onClick={() => handleAnswer(i)}
            className="rounded-input border border-border bg-surface-elevated px-5 py-4 text-left text-sm text-foreground transition-colors hover:border-gold"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
