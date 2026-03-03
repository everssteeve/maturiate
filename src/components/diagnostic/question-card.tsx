"use client";

import { cn } from "@/lib/utils";

interface QuestionCardProps {
  question: {
    id: string;
    text: string;
    options: readonly string[];
    dimensionId: string;
  };
  selected: number | undefined;
  onSelect: (value: number) => void;
  isBonus?: boolean;
}

export function QuestionCard({ question, selected, onSelect, isBonus }: QuestionCardProps) {
  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-lg font-bold">{question.text}</h3>
        {isBonus && (
          <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
            Optionnel
          </span>
        )}
      </div>
      <div className="flex flex-col gap-3">
        {question.options.map((opt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(i + 1)}
            className={cn(
              "rounded-xl border-2 px-5 py-4 text-left transition-all",
              selected === i + 1
                ? "border-primary bg-primary/5 font-semibold"
                : "border-border bg-background hover:border-primary/40",
            )}
          >
            <span className="mr-3 inline-flex size-6 items-center justify-center rounded-full border text-xs font-medium">
              {i + 1}
            </span>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
