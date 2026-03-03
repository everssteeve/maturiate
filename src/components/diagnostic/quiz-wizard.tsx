"use client";

import { useState, useTransition, useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { QUESTIONS } from "@/data/questions";
import { DIMENSIONS } from "@/data/dimensions";
import { submitDiagnostic } from "@/lib/actions/diagnostics";
import { Button } from "@/components/ui/button";
import { QuestionCard } from "@/components/diagnostic/question-card";
import { ProgressBar } from "@/components/diagnostic/progress-bar";
import { QuizSummary } from "@/components/diagnostic/quiz-summary";

interface BonusQuestion {
  id: string;
  dimensionId: string;
  text: string;
  options: string[];
}

interface QuizWizardProps {
  orgId: string;
  teamId: string;
  teamName: string;
  bonusQuestions: BonusQuestion[];
  campaignId?: string;
}

type Step = "question" | "summary";

export function QuizWizard({
  orgId,
  teamId,
  teamName,
  bonusQuestions,
  campaignId,
}: QuizWizardProps) {
  const allQuestions = [
    ...QUESTIONS.map((q) => ({ ...q, isBonus: false, options: [...q.options] })),
    ...bonusQuestions.map((q) => ({ ...q, isBonus: true })),
  ];
  const totalQuestions = allQuestions.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [bonusAnswersState, setBonusAnswersState] = useState<Record<string, number>>({});
  const [step, setStep] = useState<Step>("question");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const startedAtRef = useRef(new Date());

  const answeredCount = QUESTIONS.filter((q) => answers[q.id] != null).length;
  const currentQuestion = allQuestions[currentIndex];

  const currentDimension = DIMENSIONS.find((d) => d.id === currentQuestion?.dimensionId);

  function handleSelect(value: number) {
    if (!currentQuestion) return;
    if (currentQuestion.isBonus) {
      setBonusAnswersState((prev) => ({ ...prev, [currentQuestion.id]: value }));
    } else {
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
    }
  }

  function goNext() {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setStep("summary");
    }
  }

  function goPrev() {
    if (step === "summary") {
      setStep("question");
      setCurrentIndex(totalQuestions - 1);
    } else if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  }

  function goToQuestion(index: number) {
    setStep("question");
    setCurrentIndex(index);
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      try {
        await submitDiagnostic({
          orgId,
          teamId,
          campaignId,
          answers,
          bonusAnswers: Object.keys(bonusAnswersState).length > 0 ? bonusAnswersState : undefined,
          startedAt: startedAtRef.current,
        });
      } catch (e) {
        if (e instanceof Error && e.message !== "NEXT_REDIRECT") {
          setError(e.message || "Une erreur est survenue lors de la soumission.");
        }
      }
    });
  }

  const selectedValue = currentQuestion
    ? currentQuestion.isBonus
      ? bonusAnswersState[currentQuestion.id]
      : answers[currentQuestion.id]
    : undefined;

  if (step === "summary") {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={goPrev}>
            <ArrowLeft className="mr-1 size-4" />
            Retour aux questions
          </Button>
        </div>
        {error && (
          <p className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
        )}
        <QuizSummary
          answers={answers}
          bonusAnswers={bonusAnswersState}
          bonusQuestions={bonusQuestions}
          onGoToQuestion={goToQuestion}
          onSubmit={handleSubmit}
          isSubmitting={isPending}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold">Diagnostic — {teamName}</h2>
        {currentDimension && (
          <p className="text-sm text-muted-foreground">{currentDimension.label}</p>
        )}
      </div>

      <div className="mb-8">
        <ProgressBar current={answeredCount} total={QUESTIONS.length} />
      </div>

      {currentQuestion && (
        <QuestionCard
          question={currentQuestion}
          selected={selectedValue}
          onSelect={handleSelect}
          isBonus={currentQuestion.isBonus}
        />
      )}

      <div className="mt-8 flex items-center justify-between">
        <div>
          {currentIndex > 0 && (
            <Button variant="outline" onClick={goPrev}>
              <ArrowLeft className="mr-1 size-4" />
              Précédent
            </Button>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          Question {currentIndex + 1} / {totalQuestions}
        </div>
        <Button onClick={goNext}>
          {currentIndex === totalQuestions - 1 ? "Récapitulatif" : "Suivant"}
          {currentIndex < totalQuestions - 1 && <ArrowRight className="ml-1 size-4" />}
        </Button>
      </div>
    </div>
  );
}
