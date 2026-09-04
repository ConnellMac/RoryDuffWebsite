import { expect, test } from "@playwright/test";
const routes = [
  "/",
  "/about",
  "/books",
  "/research",
  "/sacred-network",
  "/sacred-path",
  "/login",
  "/signup",
  "/forgot-password",
  "/verify-email",
];
for (const route of routes)
  test(`public route ${route}`, async ({ page }) => {
    expect((await page.goto(route))?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
test("onboarding and member routes require a server session", async ({ page }) => {
  for (const route of ["/onboarding", "/members", "/admin"]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/login$/);
  }
});
