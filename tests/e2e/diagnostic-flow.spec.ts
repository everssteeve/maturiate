import { test, expect } from "@playwright/test";

test.describe("Diagnostic (Quiz)", () => {
  test("la page diagnostic redirige vers /login quand non authentifié", async ({ page }) => {
    await page.goto(
      "/orgs/550e8400-e29b-41d4-a716-446655440000/diagnostic/550e8400-e29b-41d4-a716-446655440001",
    );
    await expect(page).toHaveURL(/\/login/);
  });

  test("la page diagnostic existe (pas de 404)", async ({ page }) => {
    const response = await page.goto(
      "/orgs/550e8400-e29b-41d4-a716-446655440000/diagnostic/550e8400-e29b-41d4-a716-446655440001",
    );
    expect(response?.status()).not.toBe(404);
  });

  test("la page résultats redirige vers /login quand non authentifié", async ({ page }) => {
    await page.goto(
      "/orgs/550e8400-e29b-41d4-a716-446655440000/diagnostic/550e8400-e29b-41d4-a716-446655440001/results/550e8400-e29b-41d4-a716-446655440002",
    );
    await expect(page).toHaveURL(/\/login/);
  });

  test("la page résultats existe (pas de 404)", async ({ page }) => {
    const response = await page.goto(
      "/orgs/550e8400-e29b-41d4-a716-446655440000/diagnostic/550e8400-e29b-41d4-a716-446655440001/results/550e8400-e29b-41d4-a716-446655440002",
    );
    expect(response?.status()).not.toBe(404);
  });
});
