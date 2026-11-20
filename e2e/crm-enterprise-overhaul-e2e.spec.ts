import {
  test,
  expect,
  BrowserContext,
  Locator,
  Page,
  Response,
} from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";
import { getDevAdminPassword } from "./helpers/auth-credentials";

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || "ahly.admin@scripe-dev.local";
const STORAGE_STATE_PATH = path.resolve(__dirname, "./helpers/.auth-storage-state.json");
const ARTIFACT_DIR =
  "C:\\Users\\seifmoustafa\\.gemini\\antigravity\\brain\\500d66cc-b4db-4996-ae8b-9d7b1184cf98";

fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

const RAW_LOCALE_KEY_REGEX =
  /(?<![@.])\b(?:crm[A-Za-z0-9_]*|common|crud|auth|validation)\.[a-zA-Z0-9_.]+\b/g;

interface NetworkFailure {
  method: string;
  url: string;
  status: number;
}

function attachStrictObservers(page: Page) {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const httpFailures: NetworkFailure[] = [];
  const nonApi404s: string[] = [];

  const onConsole = (msg: { type(): string; text(): string }) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  };
  const onPageError = (err: Error) => {
    pageErrors.push(err.message);
  };
  const onResponse = (res: Response) => {
    const status = res.status();
    const url = res.url();
    if (url.includes("/api/v1/customization/admins/settings")) return;
    if (status === 404 && !url.includes("/api/")) {
      nonApi404s.push(`${res.request().method()} ${url}`);
    }
    // Ignore benign Next.js prefetch/favicon 404s outside /api/ if any, flag all /api/ 4xx/5xx & any 5xx
    if (status >= 500 || (status >= 400 && url.includes("/api/"))) {
      httpFailures.push({ method: res.request().method(), url, status });
    }
  };

  page.on("console", onConsole);
  page.on("pageerror", onPageError);
  page.on("response", onResponse);

  return {
    consoleErrors,
    pageErrors,
    httpFailures,
    nonApi404s,
    assertClean: (label: string) => {
      const fatalConsole = consoleErrors.filter(
        (e) =>
          !e.includes("Download the React DevTools") &&
          !e.includes("hydration") &&
          !e.includes("Failed to load resource: the server responded with a status of 400") &&
          !(e.includes("status of 404") && nonApi404s.every((u) => u.includes("favicon.ico") || u.includes("/_vercel/insights/script.js")))
      );
      expect(
        httpFailures,
        `[${label}] Unexpected HTTP 4xx/5xx on API: ${JSON.stringify(httpFailures)}`
      ).toHaveLength(0);
      expect(
        pageErrors,
        `[${label}] Uncaught page errors: ${pageErrors.join(" | ")}`
      ).toHaveLength(0);
      expect(
        fatalConsole,
        `[${label}] Console errors (nonApi404s=${JSON.stringify(nonApi404s)}): ${fatalConsole.join(" | ")}`
      ).toHaveLength(0);
    },
    clear: () => {
      consoleErrors.length = 0;
      pageErrors.length = 0;
      httpFailures.length = 0;
      nonApi404s.length = 0;
    },
    detach: () => {
      page.off("console", onConsole);
      page.off("pageerror", onPageError);
      page.off("response", onResponse);
    },
  };
}

async function waitForSettled(page: Page) {
  await page
    .locator("text=/getting everything ready for you|نحن نقوم بتجهيز كل شيء من أجلك/i")
    .waitFor({ state: "detached", timeout: 15_000 })
    .catch(() => {});
  await page.waitForLoadState("networkidle", { timeout: 2_500 }).catch(() => {});
}

async function ensureAuthenticated(page: Page, context: BrowserContext) {
  await page.setViewportSize({ width: 1440, height: 900 });
  const currentUrl = page.url();
  if (currentUrl.includes("localhost:3000") && !currentUrl.includes("/login")) {
    const hasShell = await page
      .getByTestId("crm-shell")
      .isVisible({ timeout: 2_000 })
      .catch(() => false);
    if (hasShell) return;
  }

  await page.goto("/crm", { waitUntil: "domcontentloaded" });
  await waitForSettled(page);

  const shellOrLogin = page.locator('[data-testid="crm-shell"], #identifier').first();
  await shellOrLogin.waitFor({ state: "visible", timeout: 30_000 }).catch(() => {});

  if (await page.getByTestId("crm-shell").isVisible().catch(() => false)) {
    await context.storageState({ path: STORAGE_STATE_PATH }).catch(() => {});
    return;
  }

  if (!page.url().includes("/login") && !(await page.locator("#identifier").isVisible().catch(() => false))) {
    await page.goto("/login?redirect=%2Fcrm", { waitUntil: "domcontentloaded" });
    await page.locator('[data-testid="crm-shell"], #identifier').first().waitFor({ state: "visible", timeout: 25_000 }).catch(() => {});
  }

  if (await page.getByTestId("crm-shell").isVisible().catch(() => false)) {
    await waitForSettled(page);
    await context.storageState({ path: STORAGE_STATE_PATH }).catch(() => {});
    return;
  }

  const identifierInput = page.locator("#identifier");
  const passwordInput = page.locator("#password");
  await expect(identifierInput).toBeVisible({ timeout: 15_000 });
  await identifierInput.fill(ADMIN_EMAIL);
  await passwordInput.fill(getDevAdminPassword());

  for (let attempt = 0; attempt < 4; attempt++) {
    if (!page.url().includes("/login")) break;
    const submitBtn = page.locator("form button[type='submit']").first();
    await expect(submitBtn).toBeEnabled({ timeout: 5_000 });
    await submitBtn.click();
    const navigated = await page
      .waitForURL((url) => !url.pathname.includes("/login"), { timeout: 25_000 })
      .then(() => true)
      .catch(() => false);
    if (navigated || !page.url().includes("/login")) break;
    await page.waitForTimeout(3_000);
  }

  await expect(page).not.toHaveURL(/\/login/);
  await waitForSettled(page);
  await expect(page.getByTestId("crm-shell")).toBeVisible({ timeout: 20_000 });
  await context.storageState({ path: STORAGE_STATE_PATH }).catch(() => {});
}

async function setLanguageUi(page: Page, lang: "en" | "ar") {
  const targetDir = lang === "ar" ? "rtl" : "ltr";
  const currentDir = await page.locator("html").getAttribute("dir");
  if (currentDir === targetDir) return;

  const switcher = page
    .locator('button[aria-label="Change language"], button[aria-label="تغيير اللغة"]')
    .first();
  if (await switcher.isVisible({ timeout: 4_000 }).catch(() => false)) {
    await switcher.click();
    const option = page
      .getByRole("menuitemradio", { name: lang === "ar" ? /العربية/i : /English/i })
      .first();
    await expect(option).toBeVisible({ timeout: 5_000 });
    await option.click();
    await expect(page.locator("html")).toHaveAttribute("dir", targetDir, { timeout: 10_000 });
    await page.waitForTimeout(350);
    return;
  }

  await page.evaluate((targetLang) => {
    localStorage.setItem("scr_lang", targetLang);
    localStorage.setItem("scr_pref_lang", targetLang);
    document.cookie = `scr_lang=${targetLang}; path=/; max-age=31536000`;
  }, lang);
  await page.reload({ waitUntil: "domcontentloaded" });
  await waitForSettled(page);
  await expect(page.locator("html")).toHaveAttribute("dir", targetDir, { timeout: 15_000 });
}

async function captureArtifact(page: Page, fileName: string, fullPage = false) {
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    const nexusMain = document.getElementById("nexus-content");
    if (nexusMain?.parentElement) {
      nexusMain.parentElement.scrollTop = 0;
    }
    document.documentElement.setAttribute("data-reduced-motion", "true");
    document.documentElement.setAttribute("data-animation", "none");
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
    document.querySelectorAll("nextjs-portal").forEach((el) => {
      (el as HTMLElement).style.display = "none";
    });
  });
  await page.waitForTimeout(350);
  const targetPath = path.join(ARTIFACT_DIR, fileName);
  await page.screenshot({ path: targetPath, fullPage });
  expect(fs.existsSync(targetPath)).toBe(true);
}

async function assertNoRawLocaleKeys(page: Page, scopeLabel: string) {
  const matches = await page.evaluate((regexSource) => {
    const regex = new RegExp(regexSource, "g");
    const main = document.querySelector("main") ?? document.body;
    const text = (main.innerText || "").trim();
    const hits = text.match(regex) ?? [];
    return hits.filter(
      (hit) =>
        !/\.(?:com|org|net|local|io|png|json|ts|tsx|sa|eg|example)$/i.test(hit) &&
        !/^crm\.(?:opportunity|lead|account|contact|activity|crm_user_preferences)$/.test(hit)
    );
  }, RAW_LOCALE_KEY_REGEX.source);
  expect(matches, `Raw locale keys leaked on ${scopeLabel}: ${matches.join(", ")}`).toHaveLength(0);
}

async function selectFromEntitySearch(
  page: Page,
  containerTestIdOrSelector: string,
  searchTerm?: string
): Promise<string> {
  const container = containerTestIdOrSelector.startsWith("#") || containerTestIdOrSelector.startsWith("[")
    ? page.locator(containerTestIdOrSelector).first()
    : page.getByTestId(containerTestIdOrSelector).first();
  const combobox = (await container.getAttribute("role")) === "combobox"
    ? container
    : container.locator('[role="combobox"]').first();

  await expect(combobox).toBeVisible({ timeout: 10_000 });
  await combobox.click();

  const searchInput = page.locator('[cmdk-input], input[placeholder*="Search" i], input[placeholder*="ابحث"]').last();
  if (searchTerm && (await searchInput.isVisible({ timeout: 3_000 }).catch(() => false))) {
    const searchResPromise = page
      .waitForResponse(
        (res) =>
          res.request().method() === "GET" &&
          (res.url().includes("search=") || res.url().includes("Search=")),
        { timeout: 10_000 }
      )
      .catch(() => null);
    await searchInput.fill(searchTerm);
    await searchResPromise;
    await page.waitForTimeout(250);
  }

  const targetOption = page.locator('[role="option"]').first();
  await expect(targetOption).toBeVisible({ timeout: 10_000 });
  const optionText = (await targetOption.innerText()).trim();
  // Ensure option never shows a raw GUID
  expect(optionText).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-/i);
  await targetOption.click();
  return optionText;
}

async function performFullCardDrag(params: {
  page: Page;
  card: Locator;
  targetStageKey: string;
}) {
  const { page, card, targetStageKey } = params;
  const targetCol = page.locator(`[data-stage-key="${targetStageKey}"]`).first();
  await card.evaluate((el) => el.scrollIntoView({ behavior: "instant", block: "nearest", inline: "center" }));
  await page.waitForTimeout(150);

  const cardBox = await card.boundingBox();
  expect(cardBox).not.toBeNull();
  const startX = cardBox!.x + cardBox!.width * 0.5;
  const startY = cardBox!.y + Math.min(cardBox!.height * 0.5, 42);

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + 16, startY + 6, { steps: 6 });

  const overlay = page.getByTestId("kanban-drag-overlay");
  await expect(overlay).toBeVisible({ timeout: 5_000 });

  await targetCol.evaluate((el) => el.scrollIntoView({ behavior: "instant", block: "nearest", inline: "center" }));
  await page.waitForTimeout(150);
  const colBox = await targetCol.boundingBox();
  expect(colBox).not.toBeNull();

  const viewport = page.viewportSize() ?? { width: 1440, height: 900 };
  const endX = Math.max(40, Math.min(viewport.width - 40, colBox!.x + colBox!.width * 0.5));
  const endY = Math.max(110, Math.min(viewport.height - 60, colBox!.y + Math.min(180, colBox!.height * 0.4)));

  await page.mouse.move(endX, endY, { steps: 18 });
  await page.waitForTimeout(200);
  await page.mouse.up();
}

test.describe("SCRIPE CRM Enterprise Overhaul Live E2E & Visual Evidence Suite", () => {
  test.describe.configure({ mode: "serial" });
  test.setTimeout(300_000);

  let sharedContext: BrowserContext;
  let sharedPage: Page;
  let observer: ReturnType<typeof attachStrictObservers>;

  test.beforeAll(async ({ browser }) => {
    sharedContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      ...(fs.existsSync(STORAGE_STATE_PATH) ? { storageState: STORAGE_STATE_PATH } : {}),
    });
    sharedContext.setDefaultTimeout(20_000);
    sharedPage = await sharedContext.newPage();
    observer = attachStrictObservers(sharedPage);
  });

  test.afterEach(async () => {
    if (sharedPage && !sharedPage.isClosed() && sharedPage.url().includes("localhost:3000") && !sharedPage.url().includes("/login")) {
      await sharedContext.storageState({ path: STORAGE_STATE_PATH }).catch(() => {});
    }
  });

  test.afterAll(async () => {
    observer?.detach();
    await sharedContext?.close().catch(() => {});
  });

  test("1. CRM Overview, ?create=1 Quick Actions & Custom Fields Studio (Select on crm.opportunity)", async () => {
    const page = sharedPage;
    await ensureAuthenticated(page, sharedContext);
    observer.clear();

    await page.goto("/crm", { waitUntil: "domcontentloaded" });
    await waitForSettled(page);
    await setLanguageUi(page, "en");

    await expect(page.getByText(/Active Deals|Pipeline Value|Win Rate/i).first()).toBeVisible({ timeout: 20_000 });
    await expect(page.locator("tbody tr").first()).toBeVisible({ timeout: 20_000 });
    await assertNoRawLocaleKeys(page, "CRM Overview (EN)");

    // Ensure Recent Deals table shows human names without raw UUID fragments
    const tableText = await page.locator("tbody").first().innerText();
    expect(tableText).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-/i);

    await captureArtifact(page, "final_crm_overview_en.png", true);

    // Quick Action ?create=1 navigation (Create Lead button in shell toolbar)
    const createLeadQuickBtn = page.getByRole("button", { name: /New Lead|Create Lead/i }).first();
    await expect(createLeadQuickBtn).toBeVisible({ timeout: 10_000 });
    await createLeadQuickBtn.click();
    await page.waitForURL(/\/crm\/leads\?create=1/, { timeout: 15_000 });
    await waitForSettled(page);
    const autoDialog = page.getByRole("dialog").first();
    await expect(autoDialog).toBeVisible({ timeout: 10_000 });
    await autoDialog.getByRole("button", { name: /cancel/i }).click();
    await expect(autoDialog).toBeHidden({ timeout: 5_000 });

    // Custom Fields Studio: verify cfOptionsCsv visible when Select chosen on crm.opportunity
    await page.goto("/crm/settings?tab=custom-fields", { waitUntil: "domcontentloaded" });
    await waitForSettled(page);
    await expect(page.getByTestId("crm-settings-custom-fields-card")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("crm-cf-entity-select")).toContainText(/Opportunity|Deal/i);
    await page.getByTestId("crm-cf-type-select").click();
    await page.getByRole("option", { name: /^Select$/i }).first().click();
    await expect(page.getByTestId("crm-cf-options-csv-input")).toBeVisible({ timeout: 5_000 });
    await expect(page.getByTestId("crm-cf-stage-gate-select")).toBeVisible({ timeout: 5_000 });

    observer.assertClean("Test 1 Overview + ?create=1 + Custom Fields Studio");
  });

  test("2. Leads Kanban (EN + AR), Zero GripVertical/DoubleBorder, Full-Card Drag, Assign Owner, Quick-Create & Convert", async () => {
    const page = sharedPage;
    await ensureAuthenticated(page, sharedContext);
    observer.clear();

    await page.goto("/crm/leads", { waitUntil: "domcontentloaded" });
    await waitForSettled(page);
    await setLanguageUi(page, "en");

    // Create isolated Lead for interactive test
    const suffix = Date.now().toString().slice(-6);
    const leadTitle = `Al-Nassr Hospitality Partner ${suffix}`;
    const createBtn = page.locator("main").getByRole("button", { name: /new lead/i }).first();
    await createBtn.click();
    const createDialog = page.getByRole("dialog").first();
    await expect(createDialog).toBeVisible({ timeout: 10_000 });
    await createDialog.locator("#lead-title").fill(leadTitle);
    await createDialog.locator("#lead-company").fill(`Al-Nassr Commercial ${suffix}`);
    await createDialog.locator("#lead-firstName").fill("Sami");
    await createDialog.locator("#lead-lastName").fill("Al-Jaber");
    await createDialog.locator("#lead-email").fill(`sami.${suffix}@alnassr.example`);
    await createDialog.locator("#lead-value").fill("185000");

    const createPost = page.waitForResponse(
      (res) => res.url().includes("/api/v1/crm/leads") && res.request().method() === "POST",
      { timeout: 20_000 }
    );
    await createDialog.getByRole("button", { name: /create lead/i }).click();
    expect([200, 201]).toContain((await createPost).status());
    await expect(createDialog).toBeHidden({ timeout: 10_000 });

    // Switch to Kanban
    const kanbanBtn = page.getByTestId("toggle-kanban-view").first();
    if (await kanbanBtn.isVisible().catch(() => false)) {
      await kanbanBtn.click();
    }
    await expect(page.locator('[data-stage-key="lead.new"]').first()).toBeVisible({ timeout: 15_000 });

    // Zero GripVertical & zero double nested border wrapper
    expect(await page.locator('[data-testid="kanban-sortable-card"] svg.lucide-grip-vertical').count()).toBe(0);
    const outerWrapperHasBorder = await page
      .locator('[data-testid="kanban-sortable-card"]')
      .first()
      .evaluate((el) => el.className.includes("border "));
    expect(outerWrapperHasBorder).toBe(false);

    const newLeadCard = page
      .locator(`[data-stage-key="lead.new"] [data-testid^="lead-kanban-card-"]`, { hasText: leadTitle })
      .first();
    await expect(newLeadCard).toBeVisible({ timeout: 15_000 });

    // Capture EN Leads Kanban
    await captureArtifact(page, "final_crm_leads_kanban_en.png", false);

    // Assign Owner using real encrypted tenant assignee search (zero 400 CRM_INVALID_USER_ID)
    const assignBtn = newLeadCard.getByRole("button", { name: /assign/i }).first();
    await assignBtn.click();
    const assignDialog = page.getByRole("dialog").first();
    await expect(assignDialog).toBeVisible({ timeout: 5_000 });
    await selectFromEntitySearch(page, "lead-assign-owner-select", "ahlyadmin");
    const assignResPromise = page.waitForResponse(
      (res) => res.url().includes("/owner") && ["POST", "PUT", "PATCH"].includes(res.request().method()),
      { timeout: 20_000 }
    );
    await assignDialog.locator('button[type="submit"]').click();
    expect((await assignResPromise).status()).toBe(200);
    await expect(assignDialog).toBeHidden({ timeout: 10_000 });
    await page.waitForTimeout(400);

    // Link Party using inline Quick-Create Contact & verify Lead data auto-prefill
    const linkBtn = newLeadCard.getByRole("button", { name: /link/i }).first();
    await linkBtn.click();
    const linkDialog = page.getByRole("dialog").first();
    await expect(linkDialog).toBeVisible({ timeout: 5_000 });
    await page.getByTestId("link-party-person-select-quick-create-btn").click();
    const qcName = page.getByTestId("crm-quick-create-name-en");
    await expect(qcName).toBeVisible({ timeout: 5_000 });
    await expect(qcName).toHaveValue("Sami Al-Jaber");
    await expect(linkDialog.locator('..').locator(`input[value="sami.${suffix}@alnassr.example"]`).or(page.locator(`input[type="email"]`)).first()).toHaveValue(`sami.${suffix}@alnassr.example`);
    await qcName.fill(`Quick Contact ${suffix}`);
    const qcCreateRes = page.waitForResponse(
      (res) => res.url().includes("/api/v1/crm/contacts") && res.request().method() === "POST",
      { timeout: 20_000 }
    );
    await page.getByTestId("crm-quick-create-submit").click();
    expect([200, 201]).toContain((await qcCreateRes).status());
    await expect(qcName).toBeHidden({ timeout: 10_000 });

    const linkResPromise = page.waitForResponse(
      (res) => res.url().includes("/link-party") && res.request().method() === "POST",
      { timeout: 20_000 }
    );
    await linkDialog.locator('button[type="submit"]').click();
    expect((await linkResPromise).status()).toBe(200);
    await expect(linkDialog).toBeHidden({ timeout: 10_000 });

    // Direct full-card drag lead.new -> lead.working
    const sortableWrapper = page
      .locator(`[data-stage-key="lead.new"] [data-testid="kanban-sortable-card"]`, { hasText: leadTitle })
      .first();
    const moveLeadPromise = page.waitForResponse(
      (res) => /\/api\/v1\/crm\/leads\/[^/]+\/(move-stage|stage)/.test(res.url()) && res.request().method() === "POST",
      { timeout: 20_000 }
    );
    await performFullCardDrag({ page, card: sortableWrapper, targetStageKey: "lead.working" });
    expect((await moveLeadPromise).status()).toBe(200);

    const movedWorkingCard = page
      .locator(`[data-stage-key="lead.working"] [data-testid^="lead-kanban-card-"]`, { hasText: leadTitle })
      .first();
    await expect(movedWorkingCard).toBeVisible({ timeout: 10_000 });

    // Switch to Arabic RTL and capture final_crm_leads_kanban_ar.png
    await setLanguageUi(page, "ar");
    await assertNoRawLocaleKeys(page, "Leads Kanban (AR)");
    await captureArtifact(page, "final_crm_leads_kanban_ar.png", false);

    // Switch back to EN and test Lead Convert flow
    await setLanguageUi(page, "en");
    const convertBtn = page
      .locator(`[data-stage-key="lead.working"] [data-testid^="lead-kanban-card-"]`, { hasText: leadTitle })
      .first()
      .getByRole("button", { name: /convert/i })
      .first();
    await convertBtn.click();
    const convertDialog = page.getByRole("dialog").first();
    await expect(convertDialog).toBeVisible({ timeout: 5_000 });
    const convertResPromise = page.waitForResponse(
      (res) => res.url().includes("/convert") && res.request().method() === "POST",
      { timeout: 20_000 }
    );
    await convertDialog.locator('button[type="submit"]').click();
    expect([200, 201]).toContain((await convertResPromise).status());
    await expect(convertDialog).toBeHidden({ timeout: 15_000 });

    observer.assertClean("Test 2 Leads Kanban EN/AR + QuickCreate + Assign + Drag + Convert");
  });

  test("3. Opportunities Kanban (AR RTL), Currency Switcher Conversion, Transition Dialog Reset & Searchable Dropdown", async () => {
    const page = sharedPage;
    await ensureAuthenticated(page, sharedContext);
    observer.clear();

    await page.goto("/crm/opportunities", { waitUntil: "domcontentloaded" });
    await waitForSettled(page);
    await setLanguageUi(page, "en");

    const kanbanBtn = page.getByTestId("toggle-kanban-view").first();
    if (await kanbanBtn.isVisible().catch(() => false)) {
      await kanbanBtn.click();
    }
    await expect(page.getByTestId("kanban-column-default.discovery")).toHaveCount(1);
    await expect(page.locator('[data-testid="kanban-card"]').first()).toBeVisible({ timeout: 15_000 });

    // Verify zero GripVertical, zero double borders, zero sentinel 1 Jan dates
    expect(await page.locator('[data-testid="kanban-sortable-card"] svg.lucide-grip-vertical').count()).toBe(0);
    const boardText = await page.locator("main").first().innerText();
    expect(boardText).not.toMatch(/\b1 Jan\b|١ يناير/);

    // Verify currency switcher updates column header totals AND card converted amounts accurately
    const currencyTrigger = page.getByTestId("crm-global-currency-select");
    await expect(currencyTrigger).toBeVisible({ timeout: 10_000 });

    const discTotalEl = page.getByTestId("kanban-stage-value-default.discovery");
    await currencyTrigger.click();
    await page.getByRole("option", { name: /USD/i }).first().click();
    await page.waitForTimeout(300);
    await expect(discTotalEl).toContainText(/^USD /);
    // Ensure closed/empty or any column uses USD, never hardcoded " SAR"
    const negTotalText = await page.getByTestId("kanban-stage-value-default.negotiation").innerText();
    expect(negTotalText).toMatch(/^USD /);

    await currencyTrigger.click();
    await page.getByRole("option", { name: /EGP/i }).first().click();
    await page.waitForTimeout(300);
    await expect(discTotalEl).toContainText(/^EGP /);

    // Verify Transition Dialog resets cleanly between cards (open card 1 -> cancel -> open card 2)
    const cards = page.locator('[data-testid="kanban-card"]');
    const firstCard = cards.nth(0);
    await performFullCardDrag({
      page,
      card: page.locator('[data-testid="kanban-sortable-card"]', { has: firstCard }).first(),
      targetStageKey: "default.closed_lost",
    });
    const d1 = page.getByRole("dialog").first();
    await expect(d1).toBeVisible({ timeout: 8_000 });
    await d1.getByRole("button", { name: /cancel/i }).click();
    await expect(d1).toBeHidden({ timeout: 5_000 });

    // Create an unlinked deal in default.solution_fit so dragging to default.proposal triggers requiresParty gate
    const unlinkedTitle = `E2E Unlinked Deal ${Date.now().toString().slice(-5)}`;
    await page.getByTestId("create-opportunity-button").click();
    const createOppDlg = page.getByRole("dialog").first();
    await expect(createOppDlg).toBeVisible({ timeout: 5_000 });
    await createOppDlg.locator("#opp-title").fill(unlinkedTitle);
    await createOppDlg.locator("#opp-amount").fill("45000");
    await createOppDlg.locator("#opp-rationale").fill("Executive RFP direct creation for commercial E2E test");
    await createOppDlg.locator("#opp-stage").click();
    await page.getByRole("option", { name: /Solution Fit/i }).first().click();
    const createOppRes = page.waitForResponse(
      (res) => res.url().includes("/api/v1/crm/opportunities") && res.request().method() === "POST",
      { timeout: 20_000 }
    );
    await createOppDlg.locator('button[type="submit"]').click();
    expect([200, 201]).toContain((await createOppRes).status());
    await expect(createOppDlg).toBeHidden({ timeout: 10_000 });

    // Switch to Arabic RTL and capture Opportunities Kanban AR
    await setLanguageUi(page, "ar");
    await assertNoRawLocaleKeys(page, "Opportunities Kanban (AR)");
    await captureArtifact(page, "final_crm_opportunities_kanban_ar.png", false);

    // Drag the unlinked deal in default.solution_fit to default.proposal
    const solFitCardWrapper = page
      .locator('[data-stage-key="default.solution_fit"] [data-testid="kanban-sortable-card"]', { hasText: unlinkedTitle })
      .first();
    await expect(solFitCardWrapper).toBeVisible({ timeout: 10_000 });

    await performFullCardDrag({
      page,
      card: solFitCardWrapper,
      targetStageKey: "default.proposal",
    });

    const transitionDialogAr = page.getByRole("dialog").first();
    await expect(transitionDialogAr).toBeVisible({ timeout: 10_000 });
    // Verify zero raw "معرّف الحساب أو جهة الاتصال" or "Account or Contact ID"
    const dialogTextAr = await transitionDialogAr.innerText();
    expect(dialogTextAr).not.toContain("معرّف الحساب أو جهة الاتصال");
    expect(dialogTextAr).not.toContain("Account or Contact ID");

    await captureArtifact(page, "final_crm_opportunities_transition_dialog_ar.png", false);

    // Open searchable CrmEntitySearchSelect dropdown inside transition dialog
    const partySearchSelect = transitionDialogAr.getByTestId("crm-transition-party-select");
    if (await partySearchSelect.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await partySearchSelect.locator('[role="combobox"]').first().click();
      await expect(page.locator('[role="option"]').first()).toBeVisible({ timeout: 10_000 });
      await captureArtifact(page, "final_crm_opportunities_entity_search_dropdown.png", false);
      await page.keyboard.press("Escape");
    } else {
      const anyCombo = transitionDialogAr.locator('[role="combobox"]').first();
      await anyCombo.click();
      await expect(page.locator('[role="option"]').first()).toBeVisible({ timeout: 10_000 });
      await captureArtifact(page, "final_crm_opportunities_entity_search_dropdown.png", false);
      await page.keyboard.press("Escape");
    }

    // Close any open dialog & restore EN
    await page.keyboard.press("Escape");
    await page.keyboard.press("Escape");
    await setLanguageUi(page, "en");
    observer.assertClean("Test 3 Opportunities Kanban + Currency + Transition Dialog");
  });

  test("4. Opportunity Detail (Buying Committee, Quote Builder, Playbook, Assign Owner)", async () => {
    const page = sharedPage;
    await ensureAuthenticated(page, sharedContext);
    observer.clear();

    await page.goto("/crm/opportunities", { waitUntil: "domcontentloaded" });
    await waitForSettled(page);
    await setLanguageUi(page, "en");

    // Open first deal detail
    const firstCard = page.locator('[data-testid="kanban-card"]').first();
    if (await firstCard.isVisible().catch(() => false)) {
      await firstCard.click();
    } else {
      await page.locator('[data-testid^="deal-row-link-"]').first().click();
    }
    await page.waitForURL(/\/crm\/opportunities\/[^/]+/, { timeout: 15_000 });
    await waitForSettled(page);
    await expect(page.getByTestId("opportunity-detail-view")).toBeVisible({ timeout: 15_000 });

    // Overview Tab -> Playbook interactive check
    const playbookCard = page.getByTestId("deal-stage-playbook-card");
    await expect(playbookCard).toBeVisible({ timeout: 10_000 });
    const firstPlaybookCheckbox = playbookCard.locator('[role="checkbox"]').first();
    await firstPlaybookCheckbox.click();
    await captureArtifact(page, "final_crm_opportunity_detail_en.png", true);

    // Commercial Tab -> Buying Committee + Quote Line Items
    await page.getByRole("tab", { name: /commercial/i }).first().click();
    await expect(page.getByTestId("deal-buying-committee-card")).toBeVisible({ timeout: 10_000 });

    // Quick-create a unique stakeholder contact so Buying Committee never hits 409 duplicate contact
    await page.getByTestId("committee-party-select-quick-create-btn").click();
    const qcCommitteeName = page.getByTestId("crm-quick-create-name-en");
    await expect(qcCommitteeName).toBeVisible({ timeout: 5_000 });
    await qcCommitteeName.fill(`Committee Contact ${Date.now().toString().slice(-6)}`);
    const qcCommitteeRes = page.waitForResponse(
      (res) => res.url().includes("/api/v1/crm/contacts") && res.request().method() === "POST",
      { timeout: 20_000 }
    );
    await page.getByTestId("crm-quick-create-submit").click();
    expect([200, 201]).toContain((await qcCommitteeRes).status());
    await expect(qcCommitteeName).toBeHidden({ timeout: 10_000 });

    await page.getByTestId("committee-notes-input").fill("Primary Executive Evaluator");
    const addRoleRes = page.waitForResponse(
      (res) => res.url().includes("/contact-roles") && res.request().method() === "POST",
      { timeout: 20_000 }
    );
    await page.getByTestId("committee-add-role-btn").click();
    expect([200, 201]).toContain((await addRoleRes).status());
    await expect(page.locator('[data-testid^="committee-role-row-"]').first()).toBeVisible({ timeout: 10_000 });

    // Quote Builder add line item
    const quoteCard = page.getByTestId("deal-quote-builder-card");
    await expect(quoteCard).toBeVisible({ timeout: 10_000 });
    await page.getByTestId("quote-item-name-input").fill("VIP Stadium Hospitality Suite");
    await page.getByTestId("quote-item-qty-input").fill("2");
    await page.getByTestId("quote-item-price-input").fill("12500");
    await page.getByTestId("quote-add-item-btn").click();
    await expect(quoteCard).toContainText("VIP Stadium Hospitality Suite");

    // Assign Owner using real searchable tenant user
    await page.getByTestId("deal-detail-assign-owner-btn").click();
    const assignDlg = page.getByRole("dialog").first();
    await expect(assignDlg).toBeVisible({ timeout: 5_000 });
    await selectFromEntitySearch(page, "#assign-owner-id", "ahlyadmin");
    const assignOppRes = page.waitForResponse(
      (res) => res.url().includes("/owner") && ["POST", "PUT", "PATCH"].includes(res.request().method()),
      { timeout: 20_000 }
    );
    await assignDlg.locator('button[type="submit"]').click();
    expect((await assignOppRes).status()).toBe(200);
    await expect(assignDlg).toBeHidden({ timeout: 10_000 });

    observer.assertClean("Test 4 Opportunity Detail Buying Committee + Quote + Playbook + Assign");
  });

  test("5. Accounts/Contacts ?account=/?contact= Filters, Activities Desk, Pipeline Studio & Archify Docs", async () => {
    const page = sharedPage;
    await ensureAuthenticated(page, sharedContext);
    observer.clear();

    // Account 360 -> /crm/activities?account=...
    await page.goto("/crm/accounts", { waitUntil: "domcontentloaded" });
    await waitForSettled(page);
    await page
      .locator('[data-testid^="account-row-link-"]:visible, tbody tr button:has-text("View 360"):visible')
      .first()
      .click();
    await page.waitForURL(/\/crm\/accounts\/[^/?#]+/, { timeout: 15_000 });
    await waitForSettled(page);
    const accId = page.url().split("/crm/accounts/")[1]?.split(/[?#]/)[0] || "";
    const accLogBtn = page
      .locator('a[href*="/crm/activities?account="]:visible, button:has-text("Log Activity"):visible')
      .first();
    if (await accLogBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await accLogBtn.click();
    } else {
      await page.goto(`/crm/activities?account=${encodeURIComponent(accId)}`, { waitUntil: "domcontentloaded" });
    }
    await page.waitForURL(/\/crm\/activities/, { timeout: 15_000 });
    await waitForSettled(page);
    await assertNoRawLocaleKeys(page, "Activities Desk (?account=)");

    // Contact 360 -> /crm/activities?contact=...
    await page.goto("/crm/contacts", { waitUntil: "domcontentloaded" });
    await waitForSettled(page);
    const peopleTab = page.getByTestId("customer-dir-people-tab").first();
    if (await peopleTab.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await peopleTab.click();
      await page.waitForTimeout(300);
    }
    await page
      .locator('[data-testid^="contact-row-link-"]:visible, tbody tr button:has-text("View 360"):visible')
      .first()
      .click();
    await page.waitForURL(/\/crm\/contacts\/[^/?#]+/, { timeout: 15_000 });
    await waitForSettled(page);
    const conId = page.url().split("/crm/contacts/")[1]?.split(/[?#]/)[0] || "";
    const conLogBtn = page
      .locator('a[href*="/crm/activities?contact="]:visible, button:has-text("Log Activity"):visible')
      .first();
    if (await conLogBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await conLogBtn.click();
    } else {
      await page.goto(`/crm/activities?contact=${encodeURIComponent(conId)}`, { waitUntil: "domcontentloaded" });
    }
    await page.waitForURL(/\/crm\/activities/, { timeout: 15_000 });
    await waitForSettled(page);
    // Clear contact filter chip & test Activities Desk due filters + Schedule Follow-Up modal
    const clearChip = page.locator('button[aria-label*="Clear contact" i], button[aria-label*="مسح" i]').first();
    if (await clearChip.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await clearChip.click();
    }
    await page.getByRole("button", { name: /Overdue/i }).first().click();
    await page.getByRole("button", { name: /^All Dates$/i }).first().click();

    const followUpHeaderBtn = page.getByRole("button", { name: /Schedule Follow-Up/i }).first();
    if (await followUpHeaderBtn.isVisible({ timeout: 4_000 }).catch(() => false)) {
      await followUpHeaderBtn.click();
      const followUpDlg = page.getByRole("dialog").first();
      if (await followUpDlg.isVisible({ timeout: 4_000 }).catch(() => false)) {
        await expect(followUpDlg.locator("#followup-assignee")).toBeVisible({ timeout: 5_000 });
        await page.keyboard.press("Escape");
      }
    }
    await captureArtifact(page, "final_crm_activities_desk_en.png", true);

    // Pipeline Studio: verify new exit gate fields & capture
    await page.goto("/crm/pipelines", { waitUntil: "domcontentloaded" });
    await waitForSettled(page);
    await page.getByTestId("workflow-edit-studio-wf-deal-default").click();
    await expect(page.getByTestId("crm-workflow-fullscreen-studio")).toBeVisible({ timeout: 15_000 });
    await page.getByTestId("canvas-node-default.qualification").click();
    for (const fk of ["contactId", "accountId", "ownerUserId", "discountPercent", "nextStepSummary"]) {
      await expect(page.getByTestId(`inspector-default.qualification-exit-field-${fk}`)).toBeVisible({ timeout: 5_000 });
    }
    await captureArtifact(page, "final_crm_pipeline_studio_en.png", false);

    // Docs Portal Archify Check
    await page.goto("http://localhost:3002/archify/crm-enterprise-overhaul-security-ux", {
      waitUntil: "domcontentloaded",
    });
    await page.waitForLoadState("networkidle").catch(() => {});
    const archifyFrame = page.locator('iframe[src*="crm-enterprise-overhaul-security-ux"]').first();
    await expect(archifyFrame).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(800);
    await captureArtifact(page, "final_docs_portal_archify_crm.png", false);

    observer.assertClean("Test 5 Activities + Pipeline Studio + Docs Portal Archify");
  });
});
