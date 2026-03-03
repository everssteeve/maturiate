import { describe, it, expect } from "vitest";

import {
  CreateCampaignSchema,
  UpdateCampaignSchema,
} from "@/lib/validations/campaigns";

describe("CreateCampaignSchema", () => {
  const validInput = {
    orgId: "550e8400-e29b-41d4-a716-446655440000",
    name: "Campagne Q1 2026",
    startDate: "2026-04-01",
  };

  it("accepte une campagne valide sans date de fin", () => {
    const result = CreateCampaignSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("accepte une campagne valide avec date de fin", () => {
    const result = CreateCampaignSchema.safeParse({
      ...validInput,
      endDate: "2026-04-30",
    });
    expect(result.success).toBe(true);
  });

  it("refuse un nom vide", () => {
    const result = CreateCampaignSchema.safeParse({ ...validInput, name: "" });
    expect(result.success).toBe(false);
  });

  it("refuse un nom trop long", () => {
    const result = CreateCampaignSchema.safeParse({
      ...validInput,
      name: "a".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it("refuse une date de début manquante", () => {
    const { startDate, ...withoutStart } = validInput;
    const result = CreateCampaignSchema.safeParse(withoutStart);
    expect(result.success).toBe(false);
  });

  it("refuse une date de fin antérieure à la date de début", () => {
    const result = CreateCampaignSchema.safeParse({
      ...validInput,
      startDate: "2026-04-15",
      endDate: "2026-04-01",
    });
    expect(result.success).toBe(false);
  });

  it("refuse un orgId invalide", () => {
    const result = CreateCampaignSchema.safeParse({
      ...validInput,
      orgId: "invalid",
    });
    expect(result.success).toBe(false);
  });
});

describe("UpdateCampaignSchema", () => {
  const validInput = {
    orgId: "550e8400-e29b-41d4-a716-446655440000",
    campaignId: "660e8400-e29b-41d4-a716-446655440000",
    name: "Campagne Q1 2026 — Modifiée",
    startDate: "2026-04-01",
  };

  it("accepte une mise à jour valide", () => {
    const result = UpdateCampaignSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("refuse un campaignId manquant", () => {
    const { campaignId, ...withoutId } = validInput;
    const result = UpdateCampaignSchema.safeParse(withoutId);
    expect(result.success).toBe(false);
  });

  it("refuse une date de fin antérieure à la date de début", () => {
    const result = UpdateCampaignSchema.safeParse({
      ...validInput,
      startDate: "2026-04-15",
      endDate: "2026-04-01",
    });
    expect(result.success).toBe(false);
  });
});
