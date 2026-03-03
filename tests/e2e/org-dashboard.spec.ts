import { test, expect } from "@playwright/test";

test.describe("Dashboard organisation", () => {
  test("la page /orgs/[orgId] redirige vers /login quand non authentifié", async ({ page }) => {
    await page.goto("/orgs/550e8400-e29b-41d4-a716-446655440000");
    await expect(page).toHaveURL(/\/login/);
  });

  test("la page /orgs/[orgId]?campaign=xxx redirige vers /login quand non authentifié", async ({ page }) => {
    await page.goto("/orgs/550e8400-e29b-41d4-a716-446655440000?campaign=test");
    await expect(page).toHaveURL(/\/login/);
  });
});
