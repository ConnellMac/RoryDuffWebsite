import { expect, test } from "@playwright/test";
import { seedSacredSite } from "./emulator-fixtures";

test("Phase 2 authentication and authorization journey", async ({ page, request }) => {
  const email = `member-${Date.now()}@example.test`;
  const password = "TestPassword123!";
  await seedSacredSite("onboarding-site");
  await test.step("member routes redirect before authentication", async () => {
    await page.goto("/members");
    await expect(page).toHaveURL(/\/login$/);
  });
  await test.step("sign up and require verification", async () => {
    await page.goto("/signup");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL(/\/verify-email$/);
  });
  await test.step("verify email through emulator", async () => {
    const response = await request.get(
      "http://127.0.0.1:9099/emulator/v1/projects/demo-sacred-path/oobCodes",
    );
    const data = (await response.json()) as { oobCodes: Array<{ email: string; oobLink: string }> };
    const code = data.oobCodes.find((item) => item.email === email);
    expect(code).toBeTruthy();
    await page.goto(code!.oobLink);
    await page.goto("/verify-email");
    await page.getByRole("button", { name: "I have verified my email" }).click();
    await expect(page).toHaveURL(/\/onboarding$/);
  });
  await test.step("complete onboarding", async () => {
    await page.getByLabel("Full name").fill("Test Member");
    await page.getByLabel("Brief background").fill("Integration test profile");
    await page.getByLabel("Country or region").fill("United Kingdom");
    await page.getByLabel("Nearest Sacred Site").selectOption("onboarding-site");
    const persisted = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/onboarding") && response.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Complete onboarding" }).click();
    const response = await persisted;
    expect(response.status()).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      onboardingState: "complete",
    });
    await expect(page).toHaveURL(/\/members$/);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });
  await test.step("normal member is denied admin", async () => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/members\?notice=admin-denied$/);
  });
  await test.step("logout protects member routes", async () => {
    await page.getByRole("button", { name: "Log out" }).click();
    await expect(page).toHaveURL(/\/login$/);
    await page.goto("/members");
    await expect(page).toHaveURL(/\/login$/);
  });
  await test.step("password reset request succeeds", async () => {
    await page.goto("/forgot-password");
    await page.getByLabel("Email").fill(email);
    await page.getByRole("button", { name: "Reset password" }).click();
    await expect(page.getByRole("status")).toContainText("requested");
  });
  await test.step("verified member can log in and out", async () => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL(/\/members$/);
    await page.getByRole("button", { name: "Log out" }).click();
    await expect(page).toHaveURL(/\/login$/);
  });
});
