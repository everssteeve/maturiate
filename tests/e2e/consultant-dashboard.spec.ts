import { test, expect } from "@playwright/test";

test.describe("Vue consultant", () => {
  test("la page /consultant redirige vers /login quand non authentifié", async ({ page }) => {
    await page.goto("/consultant");
    await expect(page).toHaveURL(/\/login/);
  });

  test("la route /consultant existe (pas de 404)", async ({ page }) => {
    const response = await page.goto("/consultant");
    // La page existe (redirection 302 vers login, pas un 404)
    expect(response?.status()).not.toBe(404);
  });
});
