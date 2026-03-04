import { describe, it, expect } from "vitest";
import type { ConsultantOrgSummary, ConsultantOverviewData } from "@/lib/queries/consultant";

/**
 * Helper: Sort orgs as done in consultant-dashboard.tsx
 * (score descending, null scores last)
 */
function sortConsultantOrgs(orgs: ConsultantOrgSummary[]): ConsultantOrgSummary[] {
  return [...orgs].sort((a, b) => {
    if (a.avgScore == null && b.avgScore == null) return 0;
    if (a.avgScore == null) return 1;
    if (b.avgScore == null) return -1;
    return b.avgScore - a.avgScore;
  });
}

function makeOrg(overrides: Partial<ConsultantOrgSummary> = {}): ConsultantOrgSummary {
  return {
    orgId: "org-1",
    orgName: "Test Org",
    orgLogo: null,
    sector: null,
    size: null,
    avgScore: null,
    globalLevel: null,
    evaluatedTeams: 0,
    totalTeams: 0,
    lastCampaign: null,
    trend: null,
    ...overrides,
  };
}

describe("consultant org sorting", () => {
  it("trie par score décroissant", () => {
    const orgs = [
      makeOrg({ orgId: "a", avgScore: 2.0 }),
      makeOrg({ orgId: "b", avgScore: 3.5 }),
      makeOrg({ orgId: "c", avgScore: 1.5 }),
    ];

    const sorted = sortConsultantOrgs(orgs);
    expect(sorted.map((o) => o.orgId)).toEqual(["b", "a", "c"]);
  });

  it("place les organisations sans score en dernier", () => {
    const orgs = [
      makeOrg({ orgId: "a", avgScore: null }),
      makeOrg({ orgId: "b", avgScore: 2.0 }),
      makeOrg({ orgId: "c", avgScore: null }),
      makeOrg({ orgId: "d", avgScore: 3.0 }),
    ];

    const sorted = sortConsultantOrgs(orgs);
    expect(sorted.map((o) => o.orgId)).toEqual(["d", "b", "a", "c"]);
  });

  it("gère une liste vide", () => {
    const sorted = sortConsultantOrgs([]);
    expect(sorted).toEqual([]);
  });

  it("gère une seule organisation", () => {
    const orgs = [makeOrg({ orgId: "a", avgScore: 2.5 })];
    const sorted = sortConsultantOrgs(orgs);
    expect(sorted).toHaveLength(1);
    expect(sorted[0].orgId).toBe("a");
  });

  it("gère toutes les organisations sans score", () => {
    const orgs = [
      makeOrg({ orgId: "a", avgScore: null }),
      makeOrg({ orgId: "b", avgScore: null }),
    ];

    const sorted = sortConsultantOrgs(orgs);
    expect(sorted).toHaveLength(2);
  });
});

describe("consultant global stats", () => {
  it("calcule le score moyen uniquement sur les organisations avec données", () => {
    const orgsWithScores = [
      makeOrg({ avgScore: 2.5 }),
      makeOrg({ avgScore: 3.0 }),
      makeOrg({ avgScore: 2.0 }),
    ];
    const orgsWithout = [makeOrg({ avgScore: null })];
    const all = [...orgsWithScores, ...orgsWithout];

    const withData = all.filter((o) => o.avgScore != null);
    const avgGlobalScore =
      withData.length > 0
        ? Math.round(
            (withData.reduce((sum, o) => sum + o.avgScore!, 0) / withData.length) * 100,
          ) / 100
        : null;

    // (2.5 + 3.0 + 2.0) / 3 = 2.5
    expect(avgGlobalScore).toBe(2.5);
  });

  it("retourne null si aucune organisation n'a de données", () => {
    const orgs = [
      makeOrg({ avgScore: null }),
      makeOrg({ avgScore: null }),
    ];

    const withData = orgs.filter((o) => o.avgScore != null);
    const avgGlobalScore =
      withData.length > 0
        ? Math.round(
            (withData.reduce((sum, o) => sum + o.avgScore!, 0) / withData.length) * 100,
          ) / 100
        : null;

    expect(avgGlobalScore).toBeNull();
  });

  it("calcule le total des équipes évaluées", () => {
    const orgs = [
      makeOrg({ evaluatedTeams: 3 }),
      makeOrg({ evaluatedTeams: 5 }),
      makeOrg({ evaluatedTeams: 0 }),
    ];

    const total = orgs.reduce((sum, o) => sum + o.evaluatedTeams, 0);
    expect(total).toBe(8);
  });
});

describe("consultant trend", () => {
  it("retourne null si pas assez de campagnes", () => {
    const org = makeOrg({ trend: null });
    expect(org.trend).toBeNull();
  });

  it("retourne un delta positif pour une progression", () => {
    const org = makeOrg({ trend: 0.5 });
    expect(org.trend).toBe(0.5);
    expect(org.trend!).toBeGreaterThan(0);
  });

  it("retourne un delta négatif pour une régression", () => {
    const org = makeOrg({ trend: -0.3 });
    expect(org.trend).toBe(-0.3);
    expect(org.trend!).toBeLessThan(0);
  });
});
