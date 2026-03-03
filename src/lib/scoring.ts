"use strict";

import { QUESTIONS } from "@/data/questions";
import { DIMENSIONS } from "@/data/dimensions";
import { getLevelForScore } from "@/data/levels";
import type { DimensionId, DimensionScores } from "@/types";

export interface ScoringResult {
  dimensionScores: DimensionScores;
  globalScore: number;
  globalLevel: number;
}

export function computeScores(answers: Record<string, number>): ScoringResult {
  const dimensionScores = {} as DimensionScores;

  for (const dimension of DIMENSIONS) {
    const dimQuestions = QUESTIONS.filter((q) => q.dimensionId === dimension.id);
    const dimAnswers = dimQuestions.map((q) => answers[q.id]).filter((a) => a != null);

    if (dimAnswers.length === 0) {
      dimensionScores[dimension.id as DimensionId] = 1;
    } else {
      const avg = dimAnswers.reduce((sum, val) => sum + val, 0) / dimAnswers.length;
      dimensionScores[dimension.id as DimensionId] = Math.round(avg * 100) / 100;
    }
  }

  const dimValues = Object.values(dimensionScores);
  const globalScore =
    Math.round((dimValues.reduce((sum, val) => sum + val, 0) / dimValues.length) * 100) / 100;

  const level = getLevelForScore(globalScore);

  return {
    dimensionScores,
    globalScore,
    globalLevel: level.level,
  };
}
