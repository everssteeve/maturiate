import { describe, it, expect } from "vitest";
import { computeTrend, computeDimensionTrends } from "@/lib/queries/team-dashboard";

describe("computeTrend", () => {
  it("retourne 'up' si la différence est > 0.1", () => {
    const result = computeTrend(3.0, 2.5);
    expect(result.direction).toBe("up");
    expect(result.diff).toBe(0.5);
  });

  it("retourne 'down' si la différence est < -0.1", () => {
    const result = computeTrend(2.0, 2.8);
    expect(result.direction).toBe("down");
    expect(result.diff).toBe(-0.8);
  });

  it("retourne 'stable' si la différence est <= 0.1 en valeur absolue", () => {
    const result = computeTrend(2.5, 2.45);
    expect(result.direction).toBe("stable");
    expect(result.diff).toBe(0.05);
  });

  it("retourne 'stable' pour une différence exacte de 0.1", () => {
    const result = computeTrend(2.6, 2.5);
    expect(result.direction).toBe("stable");
    expect(result.diff).toBe(0.1);
  });

  it("retourne 'stable' pour une différence exacte de -0.1", () => {
    const result = computeTrend(2.4, 2.5);
    expect(result.direction).toBe("stable");
    expect(result.diff).toBe(-0.1);
  });

  it("retourne 'up' pour une différence de 0.11", () => {
    const result = computeTrend(2.61, 2.5);
    expect(result.direction).toBe("up");
    expect(result.diff).toBe(0.11);
  });

  it("retourne 'down' pour une différence de -0.11", () => {
    const result = computeTrend(2.39, 2.5);
    expect(result.direction).toBe("down");
    expect(result.diff).toBe(-0.11);
  });

  it("retourne 'stable' pour des scores identiques", () => {
    const result = computeTrend(2.5, 2.5);
    expect(result.direction).toBe("stable");
    expect(result.diff).toBe(0);
  });
});

describe("computeDimensionTrends", () => {
  it("calcule les tendances pour chaque dimension", () => {
    const current = { tools: 3.0, process: 2.0, docs: 2.5, quality: 3.5, collab: 2.0, vision: 3.0 };
    const previous = { tools: 2.0, process: 2.5, docs: 2.45, quality: 3.0, collab: 2.0, vision: 1.0 };

    const trends = computeDimensionTrends(current, previous);

    expect(trends.tools.direction).toBe("up");
    expect(trends.tools.diff).toBe(1.0);

    expect(trends.process.direction).toBe("down");
    expect(trends.process.diff).toBe(-0.5);

    expect(trends.docs.direction).toBe("stable");
    expect(trends.docs.diff).toBe(0.05);

    expect(trends.quality.direction).toBe("up");
    expect(trends.quality.diff).toBe(0.5);

    expect(trends.collab.direction).toBe("stable");
    expect(trends.collab.diff).toBe(0);

    expect(trends.vision.direction).toBe("up");
    expect(trends.vision.diff).toBe(2.0);
  });

  it("inclut les 6 dimensions", () => {
    const scores = { tools: 2.0, process: 2.0, docs: 2.0, quality: 2.0, collab: 2.0, vision: 2.0 };
    const trends = computeDimensionTrends(scores, scores);

    expect(Object.keys(trends)).toHaveLength(6);
    expect(Object.keys(trends)).toEqual(
      expect.arrayContaining(["tools", "process", "docs", "quality", "collab", "vision"]),
    );
  });

  it("retourne 'stable' pour toutes les dimensions si les scores sont identiques", () => {
    const scores = { tools: 3.0, process: 2.0, docs: 1.5, quality: 4.0, collab: 2.5, vision: 3.5 };
    const trends = computeDimensionTrends(scores, scores);

    for (const trend of Object.values(trends)) {
      expect(trend.direction).toBe("stable");
      expect(trend.diff).toBe(0);
    }
  });
});
