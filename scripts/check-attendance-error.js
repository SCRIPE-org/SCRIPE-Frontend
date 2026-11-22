const { chromium } = require("@playwright/test");

(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on("console", msg => console.log("PAGE LOG:", msg.type(), msg.text()));
  page.on("pageerror", err => console.log("PAGE ERROR:", err.message, "\nSTACK:", err.stack));

  await page.addInitScript(() => {
    sessionStorage.setItem("dev_access_token", "mock-token");
    localStorage.setItem("app-storage", JSON.stringify({
      state: {
        isAuthenticated: true,
        permissions: ["*"],
        roles: ["TenantAdmin", "AcademyDirector"],
        tenantCode: "HILAL",
        tenantId: "NrUPeGjZhFgb2nMv4qhxXkA2ZSyf1Em_0FkM0wHSu6UEJOaPvAzOdyKKYPo",
        user: {
          id: "qU-JUUDVr3Oe2eHfNrGffQcG21mTBNpiOqjUG9CqmiR-6ysVRiBkral14F4",
          username: "codex.qa.director",
          tenantId: "NrUPeGjZhFgb2nMv4qhxXkA2ZSyf1Em_0FkM0wHSu6UEJOaPvAzOdyKKYPo",
          roles: ["TenantAdmin", "AcademyDirector"],
          permissions: ["*"]
        },
        _hasHydrated: true,
      },
      version: 0,
    }));
  });

  await page.goto("http://localhost:3000/academy/attendance?view=corrections");
  await page.waitForTimeout(4000);

  const errorDetails = page.locator("text=Error Details");
  if (await errorDetails.isVisible()) {
    await errorDetails.click();
    await page.waitForTimeout(1000);
    const pre = await page.locator("pre").allInnerTexts();
    console.log("PRE ERROR DETAILS:", pre);
  }

  await browser.close();
})();
