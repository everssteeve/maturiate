import { describe, it, expect } from "vitest";
import {
  ReportContentSchema,
  ExtractSnapshotsSchema,
  CreateReportSchema,
  UpdateReportSchema,
} from "@/lib/validations/state-of-ia";

describe("ReportContentSchema", () => {
  it("valide un contenu de rapport valide", () => {
    const content = {
      introduction: "Introduction du rapport",
      sections: [
        { title: "Distribution", body: "Texte de la section", chartType: "distribution" as const },
        { title: "Sans graphique", body: "Texte" },
      ],
      keyInsights: ["Insight 1", "Insight 2"],
      methodology: "Méthodologie de collecte",
    };

    const result = ReportContentSchema.safeParse(content);
    expect(result.success).toBe(true);
  });

  it("valide un contenu vide (par défaut)", () => {
    const content = {
      introduction: "",
      sections: [],
      keyInsights: [],
      methodology: "",
    };

    const result = ReportContentSchema.safeParse(content);
    expect(result.success).toBe(true);
  });

  it("rejette un chartType invalide", () => {
    const content = {
      introduction: "",
      sections: [{ title: "Test", body: "", chartType: "invalid" }],
      keyInsights: [],
      methodology: "",
    };

    const result = ReportContentSchema.safeParse(content);
    expect(result.success).toBe(false);
  });

  it("rejette une section sans titre", () => {
    const content = {
      introduction: "",
      sections: [{ title: "", body: "text" }],
      keyInsights: [],
      methodology: "",
    };

    const result = ReportContentSchema.safeParse(content);
    expect(result.success).toBe(false);
  });
});

describe("ExtractSnapshotsSchema", () => {
  it("valide une année valide", () => {
    const result = ExtractSnapshotsSchema.safeParse({ year: 2026 });
    expect(result.success).toBe(true);
  });

  it("rejette une année trop ancienne", () => {
    const result = ExtractSnapshotsSchema.safeParse({ year: 2020 });
    expect(result.success).toBe(false);
  });

  it("accepte replaceExisting optionnel", () => {
    const result = ExtractSnapshotsSchema.safeParse({ year: 2026, replaceExisting: true });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.replaceExisting).toBe(true);
    }
  });
});

describe("CreateReportSchema", () => {
  it("valide une année valide", () => {
    const result = CreateReportSchema.safeParse({ year: 2026 });
    expect(result.success).toBe(true);
  });
});

describe("UpdateReportSchema", () => {
  it("valide un reportId UUID et un contenu valide", () => {
    const result = UpdateReportSchema.safeParse({
      reportId: "550e8400-e29b-41d4-a716-446655440000",
      content: {
        introduction: "Test",
        sections: [],
        keyInsights: [],
        methodology: "",
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejette un reportId invalide", () => {
    const result = UpdateReportSchema.safeParse({
      reportId: "not-a-uuid",
      content: {
        introduction: "",
        sections: [],
        keyInsights: [],
        methodology: "",
      },
    });
    expect(result.success).toBe(false);
  });
});
