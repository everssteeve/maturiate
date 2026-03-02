import { describe, it, expect } from "vitest";
import { z } from "zod";

// Re-create schemas here for unit testing (same as in actions)
const CreateOrganizationSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom de l'organisation est requis.")
    .max(100, "Le nom ne doit pas dépasser 100 caractères."),
  sector: z.enum(["esn", "editor", "dsi", "startup", "other"]).optional(),
  size: z.enum(["1-10", "11-50", "51-200", "201-1000", "1000+"]).optional(),
});

const UpdateOrganizationSchema = z.object({
  orgId: z.string().uuid(),
  name: z
    .string()
    .min(1, "Le nom de l'organisation est requis.")
    .max(100, "Le nom ne doit pas dépasser 100 caractères."),
  logo: z.string().url("L'URL du logo n'est pas valide.").optional().or(z.literal("")),
  sector: z.enum(["esn", "editor", "dsi", "startup", "other"]).nullable().optional(),
  size: z.enum(["1-10", "11-50", "51-200", "201-1000", "1000+"]).nullable().optional(),
});

const InviteMemberSchema = z.object({
  orgId: z.string().uuid(),
  email: z.string().email("Adresse email invalide."),
  role: z.enum(["admin", "manager", "member", "consultant"]),
});

const UpdateMemberRoleSchema = z.object({
  orgId: z.string().uuid(),
  membershipId: z.string().uuid(),
  newRole: z.enum(["admin", "manager", "member", "consultant"]),
});

const RemoveMemberSchema = z.object({
  orgId: z.string().uuid(),
  membershipId: z.string().uuid(),
});

const ToggleStateOfIaOptInSchema = z.object({
  orgId: z.string().uuid(),
  optIn: z.boolean(),
});

describe("CreateOrganizationSchema", () => {
  it("accepte un nom valide seul", () => {
    const result = CreateOrganizationSchema.safeParse({ name: "Mon ESN" });
    expect(result.success).toBe(true);
  });

  it("accepte un nom avec secteur et taille", () => {
    const result = CreateOrganizationSchema.safeParse({
      name: "TechCorp",
      sector: "esn",
      size: "51-200",
    });
    expect(result.success).toBe(true);
  });

  it("rejette un nom vide", () => {
    const result = CreateOrganizationSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.name![0]).toBe(
        "Le nom de l'organisation est requis.",
      );
    }
  });

  it("rejette un nom de plus de 100 caractères", () => {
    const result = CreateOrganizationSchema.safeParse({ name: "a".repeat(101) });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.name![0]).toBe(
        "Le nom ne doit pas dépasser 100 caractères.",
      );
    }
  });

  it("accepte un nom de 100 caractères exactement", () => {
    const result = CreateOrganizationSchema.safeParse({ name: "a".repeat(100) });
    expect(result.success).toBe(true);
  });

  it("rejette un secteur invalide", () => {
    const result = CreateOrganizationSchema.safeParse({ name: "Org", sector: "invalid" });
    expect(result.success).toBe(false);
  });

  it("rejette une taille invalide", () => {
    const result = CreateOrganizationSchema.safeParse({ name: "Org", size: "5000" });
    expect(result.success).toBe(false);
  });

  it("accepte tous les secteurs valides", () => {
    for (const sector of ["esn", "editor", "dsi", "startup", "other"]) {
      const result = CreateOrganizationSchema.safeParse({ name: "Org", sector });
      expect(result.success).toBe(true);
    }
  });

  it("accepte toutes les tailles valides", () => {
    for (const size of ["1-10", "11-50", "51-200", "201-1000", "1000+"]) {
      const result = CreateOrganizationSchema.safeParse({ name: "Org", size });
      expect(result.success).toBe(true);
    }
  });
});

describe("UpdateOrganizationSchema", () => {
  const validOrgId = "550e8400-e29b-41d4-a716-446655440000";

  it("accepte une mise à jour valide", () => {
    const result = UpdateOrganizationSchema.safeParse({
      orgId: validOrgId,
      name: "Nouveau Nom",
    });
    expect(result.success).toBe(true);
  });

  it("accepte une URL de logo valide", () => {
    const result = UpdateOrganizationSchema.safeParse({
      orgId: validOrgId,
      name: "Org",
      logo: "https://example.com/logo.png",
    });
    expect(result.success).toBe(true);
  });

  it("accepte un logo vide (suppression)", () => {
    const result = UpdateOrganizationSchema.safeParse({
      orgId: validOrgId,
      name: "Org",
      logo: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejette une URL de logo invalide", () => {
    const result = UpdateOrganizationSchema.safeParse({
      orgId: validOrgId,
      name: "Org",
      logo: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("rejette un orgId non-UUID", () => {
    const result = UpdateOrganizationSchema.safeParse({
      orgId: "not-a-uuid",
      name: "Org",
    });
    expect(result.success).toBe(false);
  });

  it("accepte un secteur null (suppression)", () => {
    const result = UpdateOrganizationSchema.safeParse({
      orgId: validOrgId,
      name: "Org",
      sector: null,
    });
    expect(result.success).toBe(true);
  });
});

describe("InviteMemberSchema", () => {
  const validOrgId = "550e8400-e29b-41d4-a716-446655440000";

  it("accepte une invitation valide", () => {
    const result = InviteMemberSchema.safeParse({
      orgId: validOrgId,
      email: "user@example.com",
      role: "member",
    });
    expect(result.success).toBe(true);
  });

  it("rejette un email invalide", () => {
    const result = InviteMemberSchema.safeParse({
      orgId: validOrgId,
      email: "not-an-email",
      role: "member",
    });
    expect(result.success).toBe(false);
  });

  it("rejette un rôle invalide", () => {
    const result = InviteMemberSchema.safeParse({
      orgId: validOrgId,
      email: "user@example.com",
      role: "superadmin",
    });
    expect(result.success).toBe(false);
  });

  it("accepte tous les rôles valides", () => {
    for (const role of ["admin", "manager", "member", "consultant"]) {
      const result = InviteMemberSchema.safeParse({
        orgId: validOrgId,
        email: "user@example.com",
        role,
      });
      expect(result.success).toBe(true);
    }
  });
});

describe("UpdateMemberRoleSchema", () => {
  const validId = "550e8400-e29b-41d4-a716-446655440000";

  it("accepte un changement de rôle valide", () => {
    const result = UpdateMemberRoleSchema.safeParse({
      orgId: validId,
      membershipId: validId,
      newRole: "manager",
    });
    expect(result.success).toBe(true);
  });

  it("rejette un rôle invalide", () => {
    const result = UpdateMemberRoleSchema.safeParse({
      orgId: validId,
      membershipId: validId,
      newRole: "owner",
    });
    expect(result.success).toBe(false);
  });
});

describe("RemoveMemberSchema", () => {
  const validId = "550e8400-e29b-41d4-a716-446655440000";

  it("accepte des UUIDs valides", () => {
    const result = RemoveMemberSchema.safeParse({
      orgId: validId,
      membershipId: validId,
    });
    expect(result.success).toBe(true);
  });

  it("rejette un orgId invalide", () => {
    const result = RemoveMemberSchema.safeParse({
      orgId: "invalid",
      membershipId: validId,
    });
    expect(result.success).toBe(false);
  });
});

describe("ToggleStateOfIaOptInSchema", () => {
  const validId = "550e8400-e29b-41d4-a716-446655440000";

  it("accepte opt-in true", () => {
    const result = ToggleStateOfIaOptInSchema.safeParse({ orgId: validId, optIn: true });
    expect(result.success).toBe(true);
  });

  it("accepte opt-in false", () => {
    const result = ToggleStateOfIaOptInSchema.safeParse({ orgId: validId, optIn: false });
    expect(result.success).toBe(true);
  });

  it("rejette un orgId invalide", () => {
    const result = ToggleStateOfIaOptInSchema.safeParse({ orgId: "bad", optIn: true });
    expect(result.success).toBe(false);
  });

  it("rejette un optIn non-booléen", () => {
    const result = ToggleStateOfIaOptInSchema.safeParse({ orgId: validId, optIn: "yes" });
    expect(result.success).toBe(false);
  });
});
