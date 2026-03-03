import { describe, it, expect } from "vitest";
import { z } from "zod";

// Re-declare schemas inline to avoid importing Server Action modules in jsdom
const CreateTeamSchema = z.object({
  orgId: z.string().uuid(),
  name: z
    .string()
    .min(1, "Le nom de l'équipe est requis.")
    .max(100, "Le nom ne doit pas dépasser 100 caractères."),
});

const UpdateTeamSchema = z.object({
  orgId: z.string().uuid(),
  teamId: z.string().uuid(),
  name: z
    .string()
    .min(1, "Le nom de l'équipe est requis.")
    .max(100, "Le nom ne doit pas dépasser 100 caractères."),
});

const DeleteTeamSchema = z.object({
  orgId: z.string().uuid(),
  teamId: z.string().uuid(),
});

const AddTeamMemberSchema = z.object({
  orgId: z.string().uuid(),
  teamId: z.string().uuid(),
  userId: z.string().min(1),
});

const RemoveTeamMemberSchema = z.object({
  orgId: z.string().uuid(),
  teamId: z.string().uuid(),
  userId: z.string().min(1),
});

const TEST_UUID = "550e8400-e29b-41d4-a716-446655440000";
const TEST_UUID_2 = "660e8400-e29b-41d4-a716-446655440001";

describe("CreateTeamSchema", () => {
  it("accepte un nom valide avec orgId", () => {
    const result = CreateTeamSchema.safeParse({
      orgId: TEST_UUID,
      name: "Équipe Backend",
    });
    expect(result.success).toBe(true);
  });

  it("rejette un nom vide", () => {
    const result = CreateTeamSchema.safeParse({
      orgId: TEST_UUID,
      name: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.name).toContain(
        "Le nom de l'équipe est requis.",
      );
    }
  });

  it("rejette un nom trop long (>100 caractères)", () => {
    const result = CreateTeamSchema.safeParse({
      orgId: TEST_UUID,
      name: "A".repeat(101),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.name).toContain(
        "Le nom ne doit pas dépasser 100 caractères.",
      );
    }
  });

  it("rejette un orgId invalide", () => {
    const result = CreateTeamSchema.safeParse({
      orgId: "not-a-uuid",
      name: "Équipe Backend",
    });
    expect(result.success).toBe(false);
  });

  it("accepte un nom de 100 caractères exactement", () => {
    const result = CreateTeamSchema.safeParse({
      orgId: TEST_UUID,
      name: "A".repeat(100),
    });
    expect(result.success).toBe(true);
  });
});

describe("UpdateTeamSchema", () => {
  it("accepte des paramètres valides", () => {
    const result = UpdateTeamSchema.safeParse({
      orgId: TEST_UUID,
      teamId: TEST_UUID_2,
      name: "Équipe API",
    });
    expect(result.success).toBe(true);
  });

  it("rejette un nom vide", () => {
    const result = UpdateTeamSchema.safeParse({
      orgId: TEST_UUID,
      teamId: TEST_UUID_2,
      name: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejette un teamId invalide", () => {
    const result = UpdateTeamSchema.safeParse({
      orgId: TEST_UUID,
      teamId: "not-a-uuid",
      name: "Équipe API",
    });
    expect(result.success).toBe(false);
  });
});

describe("DeleteTeamSchema", () => {
  it("accepte des UUIDs valides", () => {
    const result = DeleteTeamSchema.safeParse({
      orgId: TEST_UUID,
      teamId: TEST_UUID_2,
    });
    expect(result.success).toBe(true);
  });

  it("rejette un orgId invalide", () => {
    const result = DeleteTeamSchema.safeParse({
      orgId: "invalid",
      teamId: TEST_UUID_2,
    });
    expect(result.success).toBe(false);
  });

  it("rejette un teamId invalide", () => {
    const result = DeleteTeamSchema.safeParse({
      orgId: TEST_UUID,
      teamId: "invalid",
    });
    expect(result.success).toBe(false);
  });
});

describe("AddTeamMemberSchema", () => {
  it("accepte des paramètres valides", () => {
    const result = AddTeamMemberSchema.safeParse({
      orgId: TEST_UUID,
      teamId: TEST_UUID_2,
      userId: "user_123",
    });
    expect(result.success).toBe(true);
  });

  it("rejette un userId vide", () => {
    const result = AddTeamMemberSchema.safeParse({
      orgId: TEST_UUID,
      teamId: TEST_UUID_2,
      userId: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejette un orgId invalide", () => {
    const result = AddTeamMemberSchema.safeParse({
      orgId: "not-uuid",
      teamId: TEST_UUID_2,
      userId: "user_123",
    });
    expect(result.success).toBe(false);
  });
});

describe("RemoveTeamMemberSchema", () => {
  it("accepte des paramètres valides", () => {
    const result = RemoveTeamMemberSchema.safeParse({
      orgId: TEST_UUID,
      teamId: TEST_UUID_2,
      userId: "user_123",
    });
    expect(result.success).toBe(true);
  });

  it("rejette un userId vide", () => {
    const result = RemoveTeamMemberSchema.safeParse({
      orgId: TEST_UUID,
      teamId: TEST_UUID_2,
      userId: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejette un teamId manquant", () => {
    const result = RemoveTeamMemberSchema.safeParse({
      orgId: TEST_UUID,
      userId: "user_123",
    });
    expect(result.success).toBe(false);
  });
});
