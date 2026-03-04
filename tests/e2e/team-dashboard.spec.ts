import { test, expect } from "@playwright/test";

test.describe("Dashboard équipe", () => {
  test("la page /orgs/[orgId]/teams/[teamId] redirige vers /login quand non authentifié", async ({ page }) => {
    await page.goto("/orgs/550e8400-e29b-41d4-a716-446655440000/teams/660e8400-e29b-41d4-a716-446655440001");
    await expect(page).toHaveURL(/\/login/);
  });

  test("la route /orgs/[orgId]/teams/[teamId] existe (pas de 404)", async ({ page }) => {
    const response = await page.goto(
      "/orgs/550e8400-e29b-41d4-a716-446655440000/teams/660e8400-e29b-41d4-a716-446655440001",
    );
    // La page existe (redirection 302 vers login, pas un 404)
    expect(response?.status()).not.toBe(404);
  });
});
