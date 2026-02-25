import { test, expect } from "@playwright/test";

test.describe("Page d'invitation", () => {
  test("affiche une page 404 pour un token invalide", async ({ page }) => {
    const response = await page.goto("/invite/invalid-token-xyz");

    // notFound() returns a 404 page
    expect(response?.status()).toBe(404);
  });

  test("la page d'invitation est accessible sans authentification", async ({ page }) => {
    // Even with an invalid token, the page route should exist and not redirect to login
    await page.goto("/invite/some-token");

    // Should NOT redirect to /login — invitation pages are in (auth) group, not protected
    await expect(page).toHaveURL(/\/invite\//);
  });
});
