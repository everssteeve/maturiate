import { describe, it, expect } from "vitest";
import { computeAggregateScores } from "@/lib/queries/org-dashboard";

describe("computeAggregateScores", () => {
  it("retourne null pour une liste vide", () => {
    const result = computeAggregateScores([]);
    expect(result).toBeNull();
  });

  it("calcule la moyenne par dimension pour 3 équipes", () => {
    const diagnostics = [
      { dimensionScores: { tools: 2.0, process: 3.0, docs: 1.0, quality: 4.0, collab: 2.0, vision: 3.0 }, globalScore: 2.5 },
      { dimensionScores: { tools: 3.0, process: 3.0, docs: 2.0, quality: 3.0, collab: 3.0, vision: 2.0 }, globalScore: 2.67 },
      { dimensionScores: { tools: 4.0, process: 3.0, docs: 3.0, quality: 2.0, collab: 4.0, vision: 1.0 }, globalScore: 2.83 },
    ];

    const result = computeAggregateScores(diagnostics);
    expect(result).not.toBeNull();

    // tools: (2+3+4)/3 = 3.0
    expect(result!.byDimension.tools).toBe(3);
    // process: (3+3+3)/3 = 3.0
    expect(result!.byDimension.process).toBe(3);
    // docs: (1+2+3)/3 = 2.0
    expect(result!.byDimension.docs).toBe(2);
    // quality: (4+3+2)/3 = 3.0
    expect(result!.byDimension.quality).toBe(3);
    // collab: (2+3+4)/3 = 3.0
    expect(result!.byDimension.collab).toBe(3);
    // vision: (3+2+1)/3 = 2.0
    expect(result!.byDimension.vision).toBe(2);
  });

  it("calcule le score global comme moyenne des 6 dimensions agrégées", () => {
    const diagnostics = [
      { dimensionScores: { tools: 2.0, process: 3.0, docs: 2.5, quality: 3.5, collab: 2.0, vision: 3.0 }, globalScore: 2.67 },
    ];

    const result = computeAggregateScores(diagnostics);
    expect(result).not.toBeNull();
    // avg = (2+3+2.5+3.5+2+3)/6 = 16/6 = 2.67
    expect(result!.globalScore).toBe(2.67);
  });

  it("détermine le bon niveau de maturité", () => {
    // All level 1
    const level1 = computeAggregateScores([
      { dimensionScores: { tools: 1, process: 1, docs: 1, quality: 1, collab: 1, vision: 1 }, globalScore: 1 },
    ]);
    expect(level1!.globalLevel).toBe(1);

    // Level 3
    const level3 = computeAggregateScores([
      { dimensionScores: { tools: 3, process: 3, docs: 3, quality: 3, collab: 3, vision: 3 }, globalScore: 3 },
    ]);
    expect(level3!.globalLevel).toBe(3);

    // Level 4
    const level4 = computeAggregateScores([
      { dimensionScores: { tools: 4, process: 4, docs: 4, quality: 4, collab: 4, vision: 4 }, globalScore: 4 },
    ]);
    expect(level4!.globalLevel).toBe(4);
  });

  it("calcule le nombre de dimensions fortes (>= 2.5)", () => {
    const diagnostics = [
      { dimensionScores: { tools: 3.0, process: 3.0, docs: 1.0, quality: 3.5, collab: 2.0, vision: 3.0 }, globalScore: 2.58 },
    ];

    const result = computeAggregateScores(diagnostics);
    // tools=3 (>=2.5), process=3 (>=2.5), docs=1 (<2.5), quality=3.5 (>=2.5), collab=2 (<2.5), vision=3 (>=2.5)
    expect(result!.strongDimensions).toBe(4);
  });

  it("arrondit les scores à 2 décimales", () => {
    const diagnostics = [
      { dimensionScores: { tools: 1, process: 2, docs: 3, quality: 1, collab: 2, vision: 3 }, globalScore: 2 },
      { dimensionScores: { tools: 2, process: 3, docs: 1, quality: 2, collab: 3, vision: 1 }, globalScore: 2 },
      { dimensionScores: { tools: 3, process: 1, docs: 2, quality: 3, collab: 1, vision: 2 }, globalScore: 2 },
    ];

    const result = computeAggregateScores(diagnostics);
    for (const score of Object.values(result!.byDimension)) {
      const decimalPart = score.toString().split(".")[1];
      expect(!decimalPart || decimalPart.length <= 2).toBe(true);
    }

    const globalDecimal = result!.globalScore.toString().split(".")[1];
    expect(!globalDecimal || globalDecimal.length <= 2).toBe(true);
  });

  it("ne compte que les équipes avec diagnostic (pas de division par le total)", () => {
    // 2 diagnostics seulement, la moyenne ne doit concerner que ces 2
    const diagnostics = [
      { dimensionScores: { tools: 2.0, process: 2.0, docs: 2.0, quality: 2.0, collab: 2.0, vision: 2.0 }, globalScore: 2.0 },
      { dimensionScores: { tools: 4.0, process: 4.0, docs: 4.0, quality: 4.0, collab: 4.0, vision: 4.0 }, globalScore: 4.0 },
    ];

    const result = computeAggregateScores(diagnostics);
    // tools: (2+4)/2 = 3
    expect(result!.byDimension.tools).toBe(3);
    expect(result!.globalScore).toBe(3);
  });
});
