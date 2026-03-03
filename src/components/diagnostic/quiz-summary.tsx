"use client";

import { DIMENSIONS } from "@/data/dimensions";
import { QUESTIONS } from "@/data/questions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BonusQuestion {
  id: string;
  dimensionId: string;
  text: string;
  options: string[];
}

interface QuizSummaryProps {
  answers: Record<string, number>;
  bonusAnswers: Record<string, number>;
  bonusQuestions: BonusQuestion[];
  onGoToQuestion: (index: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function QuizSummary({
  answers,
  bonusAnswers,
  bonusQuestions,
  onGoToQuestion,
  onSubmit,
  isSubmitting,
}: QuizSummaryProps) {
  const allCoreAnswered = QUESTIONS.every((q) => answers[q.id] != null);
  const coreCount = QUESTIONS.length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Récapitulatif</h2>
        <p className="text-sm text-muted-foreground">
          Vérifiez vos réponses avant de soumettre le diagnostic.
        </p>
      </div>

      {DIMENSIONS.map((dim) => {
        const dimQuestions = QUESTIONS.filter((q) => q.dimensionId === dim.id);
        const dimBonusQuestions = bonusQuestions.filter((q) => q.dimensionId === dim.id);

        return (
          <Card key={dim.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{dim.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {dimQuestions.map((q) => {
                const answer = answers[q.id];
                const qIndex = QUESTIONS.indexOf(q);
                return (
                  <div key={q.id} className="flex items-start justify-between gap-2">
                    <p className="text-sm text-muted-foreground line-clamp-1 flex-1">
                      {q.text}
                    </p>
                    <div className="flex items-center gap-2">
                      {answer != null ? (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {answer}/4
                        </span>
                      ) : (
                        <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                          Non répondu
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => onGoToQuestion(qIndex)}
                      >
                        Modifier
                      </Button>
                    </div>
                  </div>
                );
              })}
              {dimBonusQuestions.map((q) => {
                const answer = bonusAnswers[q.id];
                const bonusIndex = bonusQuestions.indexOf(q);
                return (
                  <div key={q.id} className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {q.text}
                      </p>
                      <span className="text-xs text-amber-600">Bonus</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {answer != null ? (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                          {answer}/4
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => onGoToQuestion(coreCount + bonusIndex)}
                      >
                        Modifier
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}

      {!allCoreAnswered && (
        <p className="text-sm font-medium text-destructive">
          Veuillez répondre à toutes les questions avant de soumettre.
        </p>
      )}

      <div className="flex justify-end">
        <Button
          size="lg"
          onClick={onSubmit}
          disabled={!allCoreAnswered || isSubmitting}
        >
          {isSubmitting ? "Soumission en cours..." : "Soumettre le diagnostic"}
        </Button>
      </div>
    </div>
  );
}
