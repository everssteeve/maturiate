import { describe, it, expect } from "vitest";
import { computeScores } from "@/lib/scoring";

function makeAnswers(value: number): Record<string, number> {
  return Object.fromEntries(Array.from({ length: 14 }, (_, i) => [`q_${i}`, value]));
}

describe("computeScores", () => {
  it("calcule le score global comme moyenne des dimensions", () => {
    const answers = makeAnswers(3);
    const result = computeScores(answers);

    expect(result.globalScore).toBe(3);
    expect(result.dimensionScores.tools).toBe(3);
    expect(result.dimensionScores.process).toBe(3);
    expect(result.dimensionScores.docs).toBe(3);
    expect(result.dimensionScores.quality).toBe(3);
    expect(result.dimensionScores.collab).toBe(3);
    expect(result.dimensionScores.vision).toBe(3);
  });

  it("retourne toutes les propriétés attendues", () => {
    const answers = makeAnswers(2);
    const result = computeScores(answers);

    expect(result).toHaveProperty("dimensionScores");
    expect(result).toHaveProperty("globalScore");
    expect(result).toHaveProperty("globalLevel");
    expect(Object.keys(result.dimensionScores)).toHaveLength(6);
  });

  it("attribue le niveau 1 (Découverte) pour un score < 1.75", () => {
    const answers = makeAnswers(1);
    const result = computeScores(answers);

    expect(result.globalScore).toBe(1);
    expect(result.globalLevel).toBe(1);
  });

  it("attribue le niveau 2 (Exploration) pour un score >= 1.75 et < 2.5", () => {
    const answers = makeAnswers(2);
    const result = computeScores(answers);

    expect(result.globalScore).toBe(2);
    expect(result.globalLevel).toBe(2);
  });

  it("attribue le niveau 3 (Intégration) pour un score >= 2.5 et < 3.25", () => {
    const answers = makeAnswers(3);
    const result = computeScores(answers);

    expect(result.globalScore).toBe(3);
    expect(result.globalLevel).toBe(3);
  });

  it("attribue le niveau 4 (Transformation) pour un score >= 3.25", () => {
    const answers = makeAnswers(4);
    const result = computeScores(answers);

    expect(result.globalScore).toBe(4);
    expect(result.globalLevel).toBe(4);
  });

  it("gère la frontière exacte 2.5 comme niveau 3", () => {
    // tools: q_0=3,q_1=3,q_2=3 → 3.0
    // process: q_3=2,q_4=2 → 2.0
    // docs: q_5=2,q_6=2 → 2.0
    // quality: q_7=3,q_8=3 → 3.0
    // collab: q_9=2,q_10=2 → 2.0
    // vision: q_11=3,q_12=3,q_13=3 → 3.0
    // avg = (3+2+2+3+2+3)/6 = 15/6 = 2.5
    const answers: Record<string, number> = {
      q_0: 3, q_1: 3, q_2: 3,
      q_3: 2, q_4: 2,
      q_5: 2, q_6: 2,
      q_7: 3, q_8: 3,
      q_9: 2, q_10: 2,
      q_11: 3, q_12: 3, q_13: 3,
    };
    const result = computeScores(answers);

    expect(result.globalScore).toBe(2.5);
    expect(result.globalLevel).toBe(3);
  });

  it("gère la frontière exacte 1.75 comme niveau 2", () => {
    // tools: q_0=2,q_1=2,q_2=2 → 2.0
    // process: q_3=1,q_4=2 → 1.5
    // docs: q_5=2,q_6=2 → 2.0
    // quality: q_7=1,q_8=2 → 1.5
    // collab: q_9=2,q_10=1 → 1.5
    // vision: q_11=2,q_12=2,q_13=1 → 1.67
    // avg = (2+1.5+2+1.5+1.5+1.67)/6 = 10.17/6 ≈ 1.69 → level 1
    // Let's use exact values: all 2 except some 1s to hit 1.75
    // tools: q_0=2,q_1=2,q_2=2 → 2
    // process: q_3=2,q_4=1 → 1.5
    // docs: q_5=2,q_6=1 → 1.5
    // quality: q_7=2,q_8=1 → 1.5
    // collab: q_9=2,q_10=2 → 2
    // vision: q_11=2,q_12=2,q_13=1 → 1.67
    // avg = (2+1.5+1.5+1.5+2+1.67)/6 = 10.17/6 = 1.69 → not 1.75
    // Need: (a+b+c+d+e+f)/6 = 1.75 → sum = 10.5
    // tools=2 process=1.5 docs=1.5 quality=2 collab=1.5 vision=2 → sum=10.5 → avg=1.75
    const answers: Record<string, number> = {
      q_0: 2, q_1: 2, q_2: 2,   // tools: 2
      q_3: 1, q_4: 2,            // process: 1.5
      q_5: 1, q_6: 2,            // docs: 1.5
      q_7: 2, q_8: 2,            // quality: 2
      q_9: 1, q_10: 2,           // collab: 1.5
      q_11: 2, q_12: 2, q_13: 2, // vision: 2
    };
    const result = computeScores(answers);

    expect(result.globalScore).toBe(1.75);
    expect(result.globalLevel).toBe(2);
  });

  it("calcule des scores par dimension avec des réponses variées", () => {
    const answers: Record<string, number> = {
      q_0: 1, q_1: 3, q_2: 2,   // tools: (1+3+2)/3 = 2.0
      q_3: 4, q_4: 2,            // process: (4+2)/2 = 3.0
      q_5: 1, q_6: 1,            // docs: (1+1)/2 = 1.0
      q_7: 4, q_8: 4,            // quality: (4+4)/2 = 4.0
      q_9: 3, q_10: 3,           // collab: (3+3)/2 = 3.0
      q_11: 2, q_12: 2, q_13: 2, // vision: (2+2+2)/3 = 2.0
    };
    const result = computeScores(answers);

    expect(result.dimensionScores.tools).toBe(2);
    expect(result.dimensionScores.process).toBe(3);
    expect(result.dimensionScores.docs).toBe(1);
    expect(result.dimensionScores.quality).toBe(4);
    expect(result.dimensionScores.collab).toBe(3);
    expect(result.dimensionScores.vision).toBe(2);
    // global: (2+3+1+4+3+2)/6 = 15/6 = 2.5
    expect(result.globalScore).toBe(2.5);
    expect(result.globalLevel).toBe(3);
  });

  it("le score global est arrondi à 2 décimales", () => {
    // tools: (1+2+3)/3 = 2.0
    // process: (1+3)/2 = 2.0
    // docs: (1+4)/2 = 2.5
    // quality: (2+3)/2 = 2.5
    // collab: (1+4)/2 = 2.5
    // vision: (1+2+4)/3 = 2.33
    // global: (2+2+2.5+2.5+2.5+2.33)/6 = 13.83/6 = 2.305 → 2.31
    const answers: Record<string, number> = {
      q_0: 1, q_1: 2, q_2: 3,
      q_3: 1, q_4: 3,
      q_5: 1, q_6: 4,
      q_7: 2, q_8: 3,
      q_9: 1, q_10: 4,
      q_11: 1, q_12: 2, q_13: 4,
    };
    const result = computeScores(answers);

    // Check it's rounded to 2 decimal places
    const decimalPart = result.globalScore.toString().split(".")[1];
    expect(!decimalPart || decimalPart.length <= 2).toBe(true);
  });

  it("les scores par dimension sont >= 1.0 et <= 4.0", () => {
    const answers = makeAnswers(1);
    const resultMin = computeScores(answers);

    for (const score of Object.values(resultMin.dimensionScores)) {
      expect(score).toBeGreaterThanOrEqual(1);
      expect(score).toBeLessThanOrEqual(4);
    }

    const answersMax = makeAnswers(4);
    const resultMax = computeScores(answersMax);

    for (const score of Object.values(resultMax.dimensionScores)) {
      expect(score).toBeGreaterThanOrEqual(1);
      expect(score).toBeLessThanOrEqual(4);
    }
  });

  it("le score global est >= 1.0 et <= 4.0", () => {
    const resultMin = computeScores(makeAnswers(1));
    expect(resultMin.globalScore).toBeGreaterThanOrEqual(1);
    expect(resultMin.globalScore).toBeLessThanOrEqual(4);

    const resultMax = computeScores(makeAnswers(4));
    expect(resultMax.globalScore).toBeGreaterThanOrEqual(1);
    expect(resultMax.globalScore).toBeLessThanOrEqual(4);
  });

  it("le globalLevel est entre 1 et 4", () => {
    for (let v = 1; v <= 4; v++) {
      const result = computeScores(makeAnswers(v));
      expect(result.globalLevel).toBeGreaterThanOrEqual(1);
      expect(result.globalLevel).toBeLessThanOrEqual(4);
    }
  });
});
