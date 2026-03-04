import { test, expect } from "@playwright/test";

test.describe("Landing page (visiteur non connecté)", () => {
  test("affiche la section hero avec titre et CTA", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /maturité ia/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Commencer gratuitement" }).first(),
    ).toBeVisible();
  });

  test("affiche la section bénéfices avec 4 cartes", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Pourquoi maturIAté ?" }),
    ).toBeVisible();
    await expect(page.getByText("Diagnostic rapide")).toBeVisible();
    await expect(page.getByText("Suivi dans le temps")).toBeVisible();
    await expect(page.getByText("Benchmark anonymisé")).toBeVisible();
    await expect(page.getByText("Vue multi-organisations")).toBeVisible();
  });

  test("affiche la section Comment ça marche avec 3 étapes", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Comment ça marche ?" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Créez votre organisation" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Invitez vos équipes" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Lancez une campagne" }),
    ).toBeVisible();
  });

  test("affiche le teaser State of IA", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "State of IA" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Consulter le rapport" }),
    ).toBeVisible();
  });

  test("affiche le CTA final et le footer", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Prêt à évaluer vos équipes ?" }),
    ).toBeVisible();
    await expect(page.getByText(/AIAD/)).toBeVisible();
  });

  test("le header public affiche les boutons de connexion", async ({
    page,
  }) => {
    await page.goto("/");

    const header = page.getByRole("banner");
    await expect(
      header.getByRole("link", { name: "Se connecter" }),
    ).toBeVisible();
    await expect(
      header.getByRole("link", { name: "Commencer" }),
    ).toBeVisible();
  });

  test("le CTA hero redirige vers /login", async ({ page }) => {
    await page.goto("/");

    await page
      .getByRole("link", { name: "Commencer gratuitement" })
      .first()
      .click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("est responsive sur mobile (375px)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Hero visible
    await expect(
      page.getByRole("heading", { name: /maturité ia/i }),
    ).toBeVisible();

    // Hamburger visible
    const hamburger = page.getByRole("button", {
      name: /ouvrir le menu/i,
    });
    await expect(hamburger).toBeVisible();

    // No horizontal scroll
    const body = page.locator("body");
    const box = await body.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeLessThanOrEqual(375);
  });

  test("le menu hamburger s'ouvre sur mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    await page.getByRole("button", { name: /ouvrir le menu/i }).click();

    // Check mobile menu nav links are visible (inside the mobile nav, not header desktop nav)
    const mobileNav = page.locator("nav.flex.flex-col");
    await expect(
      mobileNav.getByRole("link", { name: "Se connecter" }),
    ).toBeVisible();
  });
});

test.describe("Homepage authentifiée", () => {
  test("la page d'accueil se charge sans erreur", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
  });
});
