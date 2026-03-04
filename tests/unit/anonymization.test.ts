import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("hashOrganization", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("génère un hash SHA-256 déterministe", async () => {
    process.env.STATE_OF_IA_HASH_SALT = "test-salt";
    const { hashOrganization } = await import("@/lib/utils/anonymize");

    const hash1 = hashOrganization("org-123");
    const hash2 = hashOrganization("org-123");

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // SHA-256 hex = 64 chars
  });

  it("produit des hash différents pour des org IDs différents", async () => {
    process.env.STATE_OF_IA_HASH_SALT = "test-salt";
    const { hashOrganization } = await import("@/lib/utils/anonymize");

    const hash1 = hashOrganization("org-123");
    const hash2 = hashOrganization("org-456");

    expect(hash1).not.toBe(hash2);
  });

  it("produit des hash différents avec des salts différents", async () => {
    process.env.STATE_OF_IA_HASH_SALT = "salt-a";
    const mod1 = await import("@/lib/utils/anonymize");
    const hash1 = mod1.hashOrganization("org-123");

    process.env.STATE_OF_IA_HASH_SALT = "salt-b";
    vi.resetModules();
    const mod2 = await import("@/lib/utils/anonymize");
    const hash2 = mod2.hashOrganization("org-123");

    expect(hash1).not.toBe(hash2);
  });

  it("lève une erreur si STATE_OF_IA_HASH_SALT n'est pas défini", async () => {
    delete process.env.STATE_OF_IA_HASH_SALT;
    const { hashOrganization } = await import("@/lib/utils/anonymize");

    expect(() => hashOrganization("org-123")).toThrow(
      "La variable STATE_OF_IA_HASH_SALT n'est pas configurée.",
    );
  });

  it("le hash est un hexadécimal valide", async () => {
    process.env.STATE_OF_IA_HASH_SALT = "test-salt";
    const { hashOrganization } = await import("@/lib/utils/anonymize");

    const hash = hashOrganization("org-123");
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });
});
