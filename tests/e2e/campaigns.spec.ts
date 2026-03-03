import { test, expect } from "@playwright/test";

test.describe("Campagnes", () => {
  test("la page campagnes redirige vers /login quand non authentifié", async ({ page }) => {
    await page.goto("/orgs/550e8400-e29b-41d4-a716-446655440000/campaigns");
    await expect(page).toHaveURL(/\/login/);
  });

  test("la page campagnes existe (pas de 404)", async ({ page }) => {
    const response = await page.goto(
      "/orgs/550e8400-e29b-41d4-a716-446655440000/campaigns",
    );
    expect(response?.status()).not.toBe(404);
  });

  test("la page nouvelle campagne redirige vers /login quand non authentifié", async ({
    page,
  }) => {
    await page.goto("/orgs/550e8400-e29b-41d4-a716-446655440000/campaigns/new");
    await expect(page).toHaveURL(/\/login/);
  });

  test("la page nouvelle campagne existe (pas de 404)", async ({ page }) => {
    const response = await page.goto(
      "/orgs/550e8400-e29b-41d4-a716-446655440000/campaigns/new",
    );
    expect(response?.status()).not.toBe(404);
  });

  test("la page détail campagne redirige vers /login quand non authentifié", async ({
    page,
  }) => {
    await page.goto(
      "/orgs/550e8400-e29b-41d4-a716-446655440000/campaigns/550e8400-e29b-41d4-a716-446655440001",
    );
    await expect(page).toHaveURL(/\/login/);
  });

  test("la page détail campagne existe (pas de 404)", async ({ page }) => {
    const response = await page.goto(
      "/orgs/550e8400-e29b-41d4-a716-446655440000/campaigns/550e8400-e29b-41d4-a716-446655440001",
    );
    expect(response?.status()).not.toBe(404);
  });

  test("la page diagnostic avec campaignId existe (pas de 404)", async ({ page }) => {
    const response = await page.goto(
      "/orgs/550e8400-e29b-41d4-a716-446655440000/diagnostic/550e8400-e29b-41d4-a716-446655440001?campaignId=550e8400-e29b-41d4-a716-446655440002",
    );
    expect(response?.status()).not.toBe(404);
  });

  test("le cron campaign-close retourne 401 sans secret", async ({ request }) => {
    const response = await request.get("/api/cron/campaign-close");
    expect(response.status()).toBe(401);
  });

  test("le cron campaign-reminder retourne 401 sans secret", async ({ request }) => {
    const response = await request.get("/api/cron/campaign-reminder");
    expect(response.status()).toBe(401);
  });
});
