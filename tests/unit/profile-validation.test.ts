import { describe, it, expect } from "vitest";
import { UpdateProfileSchema } from "@/lib/validations/users";

describe("UpdateProfileSchema", () => {
  it("accepte un nom valide sans avatar", () => {
    const result = UpdateProfileSchema.safeParse({ name: "Sophie Martin" });
    expect(result.success).toBe(true);
  });

  it("accepte un nom valide avec une URL d'avatar", () => {
    const result = UpdateProfileSchema.safeParse({
      name: "Sophie Martin",
      image: "https://example.com/avatar.jpg",
    });
    expect(result.success).toBe(true);
  });

  it("accepte un nom valide avec un avatar vide (suppression)", () => {
    const result = UpdateProfileSchema.safeParse({
      name: "Sophie Martin",
      image: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejette un nom vide", () => {
    const result = UpdateProfileSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const nameErrors = result.error.flatten().fieldErrors.name;
      expect(nameErrors).toBeDefined();
      expect(nameErrors![0]).toBe("Le nom est requis.");
    }
  });

  it("rejette un nom de plus de 100 caractères", () => {
    const result = UpdateProfileSchema.safeParse({ name: "a".repeat(101) });
    expect(result.success).toBe(false);
    if (!result.success) {
      const nameErrors = result.error.flatten().fieldErrors.name;
      expect(nameErrors).toBeDefined();
      expect(nameErrors![0]).toBe("Le nom ne doit pas dépasser 100 caractères.");
    }
  });

  it("rejette une URL d'avatar invalide", () => {
    const result = UpdateProfileSchema.safeParse({
      name: "Sophie",
      image: "not-a-url",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const imageErrors = result.error.flatten().fieldErrors.image;
      expect(imageErrors).toBeDefined();
    }
  });

  it("accepte un nom d'un seul caractère", () => {
    const result = UpdateProfileSchema.safeParse({ name: "S" });
    expect(result.success).toBe(true);
  });

  it("accepte un nom de 100 caractères exactement", () => {
    const result = UpdateProfileSchema.safeParse({ name: "a".repeat(100) });
    expect(result.success).toBe(true);
  });
});
