// Local browser smoke. All accounts and entries are synthetic.
// BASE=http://localhost:8765 OUT=docs/screenshots node scripts/smoke.mjs
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = process.env.BASE ?? "http://localhost:8765";
const OUT = process.env.OUT;
const stamp = Date.now();
const alice = {
  email: `alice.${stamp}@example.com`,
  password: "synthetic-password-1",
};
const bob = {
  email: `bob.${stamp}@example.com`,
  password: "synthetic-password-2",
};
const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? `: ${detail}` : ""}`);
};
async function auth(page, user, register) {
  await page.goto(BASE);
  if (register)
    await page
      .getByRole("button", { name: "Créer un compte", exact: true })
      .click();
  await page.getByLabel("Adresse e-mail").fill(user.email);
  await page.getByLabel("Mot de passe").fill(user.password);
  await page.locator("form button[type=submit]").click();
  await page.getByRole("heading", { name: "Soir", exact: true }).waitFor();
}
async function choose(page, group, answer) {
  await page
    .getByRole("group", { name: group, exact: true })
    .getByRole("button", { name: answer, exact: true })
    .click();
  await page.getByText("Enregistré", { exact: true }).waitFor();
}
async function openDrink(page) {
  await page.getByRole("button", { name: "＋ Boisson", exact: true }).click();
  return page.getByRole("dialog");
}
const browser = await chromium.launch();
try {
  if (OUT) await mkdir(OUT, { recursive: true });
  const desktop = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    colorScheme: "light",
  });
  const page = await desktop.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await auth(page, alice, true);
  check("register and chronological capture", true);
  check(
    "unknown chips absent and advanced collapsed",
    (await page
      .getByRole("button", { name: "Non renseigné", exact: true })
      .count()) === 0 &&
      !(await page
        .locator("details")
        .first()
        .evaluate((node) => node.open)),
  );

  let sheet = await openDrink(page);
  check(
    "sheet takes focus",
    await sheet.evaluate((node) => node.contains(document.activeElement)),
  );
  await sheet.getByRole("button", { name: "Maté", exact: true }).click();
  await sheet.getByRole("button", { name: "Ajouter", exact: true }).click();
  await sheet.waitFor({ state: "detached" });
  await page.getByRole("button", { name: /Modifier Maté/ }).waitFor();
  check("independent 250 ml intake listed inline", true);
  sheet = await openDrink(page);
  check(
    "new drink resets to 250 ml",
    (await sheet.getByLabel("Volume", { exact: true }).inputValue()) === "250",
  );
  await page.keyboard.press("Escape");
  await sheet.waitFor({ state: "detached" });
  check(
    "Escape closes sheet and restores focus",
    await page
      .getByRole("button", { name: "＋ Boisson", exact: true })
      .evaluate((node) => document.activeElement === node),
  );
  await choose(page, "Alcool", "Non");
  await choose(page, "Sucre tardif", "Oui");
  check(
    "sugar yes persists with optional time",
    (await page
      .getByLabel("Heure de la prise", { exact: true })
      .inputValue()) === "",
  );
  await choose(page, "Sucre tardif", "Oui");
  check(
    "second tap clears to unknown",
    (await page.getByLabel("Heure de la prise", { exact: true }).count()) === 0,
  );
  await choose(page, "Quantité du dîner", "Normal");
  await choose(page, "Stress aujourd’hui", "Absent");
  check(
    "progress counts answered questions",
    (await page.locator(".progress").innerText()) === "3/8 ✓",
  );
  await page.getByRole("button", { name: "Aide : Soir", exact: true }).click();
  await page
    .getByRole("button", { name: "Suggérer une amélioration", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .locator("textarea")
    .fill("Exemple synthétique : ajouter un raccourci.");
  await page
    .getByRole("button", { name: "Enregistrer la suggestion", exact: true })
    .click();
  await page.getByRole("dialog").waitFor({ state: "detached" });
  await page.getByRole("button", { name: "Aide : Soir", exact: true }).click();
  await page.getByRole("button", { name: "Suggestions", exact: true }).click();
  await page
    .getByText("Exemple synthétique : ajouter un raccourci.", { exact: true })
    .waitFor();
  check(
    "section suggestion remains private and listed with context",
    await page.getByText("day.evening", { exact: true }).isVisible(),
  );
  await page.getByRole("button", { name: "Aujourd'hui", exact: true }).click();
  await page.getByRole("heading", { name: "Soir", exact: true }).waitFor();
  const columns = await page
    .locator(".context-section")
    .evaluateAll((nodes) =>
      nodes.map((node) => node.getBoundingClientRect().left),
    );
  check("desktop sections use one column", new Set(columns).size === 1);
  if (OUT)
    await page.screenshot({ path: `${OUT}/today-desktop.png`, fullPage: true });

  const manifest = await page.evaluate(async () =>
    (await fetch("/manifest.webmanifest")).json(),
  );
  check(
    "PWA manifest and icons",
    manifest.display === "standalone" &&
      manifest.icons.some((icon) => icon.sizes === "512x512"),
  );
  await page.reload();
  await page.waitForFunction(
    () => navigator.serviceWorker?.controller != null,
    null,
    { timeout: 10000 },
  );
  check("service worker controls the page", true);
  const countEvents = () =>
    page.evaluate(
      async () => (await (await fetch("/api/events")).json()).length,
    );
  const before = await countEvents();
  await desktop.setOffline(true);
  await page.getByRole("alert").filter({ hasText: "Hors ligne" }).waitFor();
  sheet = await openDrink(page);
  await sheet.getByRole("button", { name: "Ajouter", exact: true }).click();
  await sheet
    .getByText("Hors ligne : non enregistré.", { exact: true })
    .waitFor();
  check("offline write refused visibly", true);
  await desktop.setOffline(false);
  await page.waitForTimeout(500);
  check("offline write never replayed", (await countEvents()) === before);
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "Export", exact: true }).click();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByText("Télécharger le JSON", { exact: true }).click(),
  ]);
  const exported = JSON.parse(
    await (
      await download.createReadStream()
    )
      .toArray()
      .then((chunks) => Buffer.concat(chunks).toString()),
  );
  check(
    "export contains own entries and separate suggestions",
    exported.journal.events.length === before &&
      exported.feature_suggestions.length === 1,
  );
  const aliceId = exported.journal.events[0].id;

  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 1,
    colorScheme: "light",
  });
  const phone = await mobile.newPage();
  await auth(phone, alice, false);
  await phone.getByRole("button", { name: /Modifier Maté/ }).waitFor();
  check("same account persisted across browsers", true);
  check(
    "390 px layout has no overflow",
    await phone.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  check(
    "quick actions are at least 44 px",
    await phone
      .locator(".quick-actions button")
      .evaluateAll((nodes) =>
        nodes.every((node) => node.getBoundingClientRect().height >= 44),
      ),
  );
  if (OUT) {
    await phone.screenshot({ path: `${OUT}/today-mobile.png`, fullPage: true });
    await openDrink(phone);
    await phone.screenshot({ path: `${OUT}/today-mobile-sheet.png` });
    await phone.keyboard.press("Escape");
  }
  const other = await browser.newContext();
  const bobPage = await other.newPage();
  await auth(bobPage, bob, true);
  const isolated = await bobPage.evaluate(
    async (id) => ({
      count: (await (await fetch("/api/events")).json()).length,
      get: (await fetch(`/api/events/${id}`)).status,
      del: (await fetch(`/api/events/${id}`, { method: "DELETE" })).status,
      suggestions: (await (await fetch("/api/suggestions")).json()).length,
    }),
    aliceId,
  );
  check(
    "second account cannot access entries or suggestions",
    isolated.count === 0 &&
      isolated.get === 404 &&
      isolated.del === 404 &&
      isolated.suggestions === 0,
  );
  check("no browser runtime errors", errors.length === 0, errors.join("; "));
} finally {
  await browser.close();
}
console.log(
  `${results.filter((result) => result.ok).length}/${results.length} smoke checks passed`,
);
process.exitCode = results.every((result) => result.ok) ? 0 : 1;
