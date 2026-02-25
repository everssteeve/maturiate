export type DimensionId = "tools" | "process" | "docs" | "quality" | "collab" | "vision";

export type Dimension = {
  id: DimensionId;
  label: string;
  short: string;
  description: string;
};

export type Question = {
  id: string;
  dimensionId: DimensionId;
  text: string;
  options: readonly [string, string, string, string];
};

export type Level = {
  level: number;
  name: string;
  description: string;
  minScore: number;
  maxScore: number;
};

export type DimensionScores = Record<DimensionId, number>;

export type DiagnosticAnswers = Record<string, number>;
