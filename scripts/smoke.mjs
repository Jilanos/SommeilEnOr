// Browser smoke checks against a running instance (synthetic accounts only).
//   npx playwright install chromium
//   BASE=http://localhost:8000 OUT=/tmp/shots node scripts/smoke.mjs
// Covers: registration, quick capture, suggestions, PWA manifest/service worker,
// offline refusal without replay, export, second browser (mobile), account isolation.
import { chromium, devices } from "playwright";

const BASE = process.env.BASE ?? "http://localhost:8765";
const OUT = process.env.OUT;
const stamp = Date.now();
const alice = { email: `alice.${stamp}@example.com`, password: "synthetic-password-1" };
const bob = { email: `bob.${stamp}@example.com`, password: "synthetic-password-2" };
const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? " — " + detail : ""}`);
};

async function auth(page, user, register) {
  await page.goto(BASE);
  if (register) await page.getByRole("button", { name: "Créer un compte" }).click();
  await page.getByLabel("Adresse e-mail").fill(user.email);
  await page.getByLabel("Mot de passe").fill(user.password);
  await page.locator("form button[type=submit]").click();
  try {
    await page.getByRole("navigation", { name: "Navigation principale" }).waitFor({ timeout: 8000 });
  } catch (error) {
    console.log("AUTH FAILURE TEXT:", (await page.locator("body").innerText()).slice(0, 500));
    console.log("VALUES:", await page.getByLabel("Adresse e-mail").inputValue().catch(() => "?"));
    throw error;
  }
}

const browser = await chromium.launch();

// Desktop, account A.
const desktop = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await desktop.newPage();
await auth(page, alice, true);
check("register and land on capture screen", true);
const firstDrink = page.locator("section", { hasText: "Ajouter une boisson" }).first();
await firstDrink.getByRole("button", { name: "Maté", exact: true }).click();
await firstDrink.getByText("Enregistré").waitFor();
check("quick drink button saves", true);
await page.getByText("Maté · 250 ml").first().waitFor();
check("saved intake listed in the day", true);
const alcohol = page.locator(".field", { hasText: "Alcool aujourd'hui" });
await alcohol.getByRole("button", { name: "Oui" }).click();
await alcohol.getByText("Enregistré").waitFor();
check("daily alcohol answer saved", true);
await alcohol.getByRole("button", { name: "Suggérer une amélioration" }).click();
await page.getByRole("dialog").locator("textarea").fill("Ajouter le vin rouge en option");
await page.getByRole("button", { name: "Enregistrer la suggestion" }).click();
await page.getByRole("dialog").waitFor({ state: "detached" });
await page.getByRole("button", { name: "Suggestions" }).click();
await page.getByText("Ajouter le vin rouge en option").waitFor();
check("suggestion stored with context and listed", await page.getByText("day.alcohol").isVisible());
const suggestionButtons = await page.getByRole("button", { name: "Suggérer une amélioration" }).count();
await page.getByRole("button", { name: "Aujourd'hui" }).click();
await page.getByText("Maté · 250 ml").first().waitFor();
const captureSuggestions = await page.getByRole("button", { name: "Suggérer une amélioration" }).count();
check("suggestion controls beside actions", captureSuggestions >= 12, `${captureSuggestions} controls on capture screen, ${suggestionButtons} on list`);
if (OUT) await page.screenshot({ path: `${OUT}/desktop.png`, fullPage: true });

// PWA installability signals.
const manifest = await page.evaluate(async () => (await fetch("/manifest.webmanifest")).json());
check("manifest has standalone display and 192/512 icons",
  manifest.display === "standalone" && manifest.icons.some((i) => i.sizes === "512x512") && manifest.icons.some((i) => i.sizes === "192x192"));
await page.reload();
await page.waitForFunction(() => navigator.serviceWorker?.controller !== null, null, { timeout: 10000 });
check("service worker controls the page", true);

// Offline: write refused, nothing queued.
const countEvents = () => page.evaluate(async () => (await (await fetch("/api/events")).json()).length);
const before = await countEvents();
await desktop.setOffline(true);
await page.getByRole("alert").filter({ hasText: "Hors ligne" }).waitFor();
check("offline banner shown", true);
const drinkSection = page.locator("section", { hasText: "Ajouter une boisson" }).first();
await drinkSection.getByRole("button", { name: "Thé vert", exact: true }).click();
await drinkSection.getByText("Hors ligne : non enregistré.").waitFor();
check("offline save reported as not saved", true);
await desktop.setOffline(false);
await page.waitForTimeout(1500);
const after = await countEvents();
check("no offline entry queued or replayed", after === before, `${before} -> ${after}`);

// Export download.
await page.getByRole("button", { name: "Export" }).click();
const [download] = await Promise.all([page.waitForEvent("download"), page.getByText("Télécharger le JSON").click()]);
const exported = JSON.parse(await (await download.createReadStream()).toArray().then((c) => Buffer.concat(c).toString()));
check("JSON export downloads own records", exported.journal.events.length === after && exported.feature_suggestions.length === 1);
const aliceEventId = exported.journal.events[0].id;

// Second browser (mobile) on the same account.
const mobile = await browser.newContext({ ...devices["Pixel 7"] });
const phone = await mobile.newPage();
await auth(phone, alice, false);
await phone.getByText("Maté · 250 ml").first().waitFor();
check("record visible from a second browser (mobile)", true);
const overflow = await phone.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
check("mobile layout has no horizontal overflow", overflow <= 0, `overflow ${overflow}px`);
const minTarget = await phone.evaluate(() =>
  Math.min(...[...document.querySelectorAll(".quick")].map((b) => b.getBoundingClientRect().height)));
check("quick buttons are touch-sized", minTarget >= 44, `${minTarget}px`);
if (OUT) { await phone.screenshot({ path: `${OUT}/mobile.png`, fullPage: true }); await phone.getByText("Maté · 250 ml").first().scrollIntoViewIfNeeded(); await phone.screenshot({ path: `${OUT}/mobile-events.png` }); await phone.evaluate(() => window.scrollTo(0, 0)); await phone.screenshot({ path: `${OUT}/mobile-top.png` }); }

// Account B isolation.
const other = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const bobPage = await other.newPage();
await auth(bobPage, bob, true);
const bobView = await bobPage.evaluate(async (id) => ({
  events: (await (await fetch("/api/events")).json()).length,
  guessed: (await fetch(`/api/events/${id}`)).status,
  del: (await fetch(`/api/events/${id}`, { method: "DELETE" })).status,
  suggestions: (await (await fetch("/api/suggestions")).json()).length,
}), aliceEventId);
check("second account sees no data and cannot reach guessed IDs",
  bobView.events === 0 && bobView.guessed === 404 && bobView.del === 404 && bobView.suggestions === 0, JSON.stringify(bobView));

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} smoke checks passed`);
process.exit(failed.length ? 1 : 0);
