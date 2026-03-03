import { test, expect } from "@playwright/test";

test.describe("Gestion des équipes", () => {
  test("la section équipes redirige vers /login quand non authentifié", async ({ page }) => {
    await page.goto("/orgs/550e8400-e29b-41d4-a716-446655440000/settings");
    await expect(page).toHaveURL(/\/login/);
  });

  test("la page settings contient les routes nécessaires pour les équipes", async ({ page }) => {
    // Vérifie que /orgs/[orgId]/settings est accessible (redirige vers login sans auth)
    const response = await page.goto(
      "/orgs/550e8400-e29b-41d4-a716-446655440000/settings",
    );
    // La page existe (redirection 302 vers login, pas un 404)
    expect(response?.status()).not.toBe(404);
  });
});
