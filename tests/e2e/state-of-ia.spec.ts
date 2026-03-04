import { test, expect } from "@playwright/test";

test.describe("State of IA — Page publique", () => {
  test("la page /state-of-ia affiche un message quand aucun rapport n'est publié", async ({
    page,
  }) => {
    await page.goto("/state-of-ia");
    // Either redirects to latest year or shows "no report" message
    const content = await page.textContent("body");
    expect(
      content?.includes("State of IA") || content?.includes("Aucun rapport"),
    ).toBeTruthy();
  });

  test("la page /state-of-ia/9999 retourne 404", async ({ page }) => {
    const response = await page.goto("/state-of-ia/9999");
    expect(response?.status()).toBe(404);
  });
});

test.describe("State of IA — Back-office admin", () => {
  test("la page /admin/state-of-ia redirige vers /login quand non authentifié", async ({
    page,
  }) => {
    await page.goto("/admin/state-of-ia");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("State of IA — Benchmark", () => {
  test("la page /orgs/[orgId]/benchmark redirige vers /login quand non authentifié", async ({
    page,
  }) => {
    await page.goto("/orgs/550e8400-e29b-41d4-a716-446655440000/benchmark");
    await expect(page).toHaveURL(/\/login/);
  });
});
