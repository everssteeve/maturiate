import { describe, it, expect } from "vitest";

import { DIMENSIONS } from "@/data/dimensions";
import { QUESTIONS } from "@/data/questions";
import { LEVELS } from "@/data/levels";

describe("Business constants", () => {
  it("defines exactly 6 dimensions", () => {
    expect(DIMENSIONS).toHaveLength(6);
  });

  it("defines exactly 14 core questions", () => {
    expect(QUESTIONS).toHaveLength(14);
  });

  it("assigns each question to a valid dimension", () => {
    const dimensionIds = DIMENSIONS.map((d) => d.id);
    for (const question of QUESTIONS) {
      expect(dimensionIds).toContain(question.dimensionId);
    }
  });

  it("covers all 6 dimensions with at least one question", () => {
    const coveredDimensions = new Set(QUESTIONS.map((q) => q.dimensionId));
    expect(coveredDimensions.size).toBe(6);
  });

  it("provides 4 options per question", () => {
    for (const question of QUESTIONS) {
      expect(question.options).toHaveLength(4);
    }
  });

  it("defines 4 maturity levels covering 1.0 to 4.0", () => {
    expect(LEVELS).toHaveLength(4);
    expect(LEVELS[0].minScore).toBe(1.0);
    expect(LEVELS[LEVELS.length - 1].maxScore).toBe(4.0);
  });

  it("has no gaps between level score ranges", () => {
    for (let i = 1; i < LEVELS.length; i++) {
      expect(LEVELS[i].minScore).toBe(LEVELS[i - 1].maxScore);
    }
  });
});
