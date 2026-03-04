import { describe, it, expect } from "vitest";
import { computeAggregateScores } from "@/lib/queries/org-dashboard";

describe("computeAggregateScores (pour State of IA)", () => {
  it("calcule la moyenne des scores par dimension pour plusieurs diagnostics", () => {
    const diagnostics = [
      {
        dimensionScores: { tools: 2.0, process: 3.0, docs: 1.0, quality: 4.0, collab: 3.0, vision: 2.0 },
        globalScore: 2.5,
      },
      {
        dimensionScores: { tools: 4.0, process: 1.0, docs: 3.0, quality: 2.0, collab: 1.0, vision: 4.0 },
        globalScore: 2.5,
      },
    ];

    const result = computeAggregateScores(diagnostics);

    expect(result).not.toBeNull();
    expect(result!.byDimension.tools).toBe(3.0);
    expect(result!.byDimension.process).toBe(2.0);
    expect(result!.byDimension.docs).toBe(2.0);
    expect(result!.byDimension.quality).toBe(3.0);
    expect(result!.byDimension.collab).toBe(2.0);
    expect(result!.byDimension.vision).toBe(3.0);
    expect(result!.globalScore).toBe(2.5);
  });

  it("retourne null pour une liste vide", () => {
    const result = computeAggregateScores([]);
    expect(result).toBeNull();
  });

  it("arrondit les scores à 2 décimales", () => {
    const diagnostics = [
      {
        dimensionScores: { tools: 1.0, process: 2.0, docs: 3.0, quality: 4.0, collab: 1.0, vision: 2.0 },
        globalScore: 2.17,
      },
      {
        dimensionScores: { tools: 2.0, process: 3.0, docs: 4.0, quality: 1.0, collab: 2.0, vision: 3.0 },
        globalScore: 2.5,
      },
      {
        dimensionScores: { tools: 3.0, process: 1.0, docs: 2.0, quality: 3.0, collab: 4.0, vision: 1.0 },
        globalScore: 2.33,
      },
    ];

    const result = computeAggregateScores(diagnostics);
    expect(result).not.toBeNull();

    // Each score should be rounded to 2 decimal places
    for (const score of Object.values(result!.byDimension)) {
      const decimalPart = score.toString().split(".")[1];
      expect(!decimalPart || decimalPart.length <= 2).toBe(true);
    }
  });

  it("gère un seul diagnostic", () => {
    const diagnostics = [
      {
        dimensionScores: { tools: 3.5, process: 2.5, docs: 1.5, quality: 4.0, collab: 2.0, vision: 3.0 },
        globalScore: 2.75,
      },
    ];

    const result = computeAggregateScores(diagnostics);

    expect(result).not.toBeNull();
    expect(result!.byDimension.tools).toBe(3.5);
    expect(result!.globalScore).toBe(2.75);
  });

  it("calcule le nombre de dimensions fortes (>= 2.5)", () => {
    const diagnostics = [
      {
        dimensionScores: { tools: 3.0, process: 3.0, docs: 1.0, quality: 3.0, collab: 1.0, vision: 3.0 },
        globalScore: 2.33,
      },
    ];

    const result = computeAggregateScores(diagnostics);
    expect(result).not.toBeNull();
    expect(result!.strongDimensions).toBe(4); // tools, process, quality, vision >= 2.5
  });
});
