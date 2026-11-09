import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api, type DayView, type JournalEvent } from "./api";
import { DayPage } from "./screens/DayPage";
import { t } from "./i18n";

const date = "2026-11-09";
function emptyView(): DayView {
  return {
    tracking_date: date,
    events: [],
    night_events: [],
    day: {
      id: null,
      tracking_date: date,
      alcohol: "unknown",
      gluten: "unknown",
      experienced_stress: "unknown",
      evening_noncaffeinated_drink: "unknown",
      late_sugar: "unknown",
      late_sugar_at: null,
      dinner_at: null,
      dinner_quantity: "unknown",
    },
    night: {
      id: null,
      start_date: date,
      end_date: "2026-11-10",
      cat_presence: "unknown",
      anticipated_stress: "unknown",
      anticipated_stress_for_date: "2026-11-10",
      early_wake_planned: "unknown",
      early_wake_target_time: null,
      early_wake_reason: null,
    },
  };
}
function entry(patch = {}): JournalEvent {
  return {
    id: "e1",
    kind: "drink",
    occurred_at: {
      utc: "2026-11-09T07:00:00Z",
      utc_offset_minutes: 60,
      local: "2026-11-09T08:00:00+01:00",
    },
    tracking_date: date,
    night_id: "n1",
    night_start_date: date,
    night_end_date: "2026-11-10",
    night_override: false,
    drink_type: "mate",
    volume_ml: 250,
    activity_type: null,
    intensity: null,
    duration_minutes: null,
    favorite_id: null,
    ...patch,
  };
}
function online(value: boolean) {
  Object.defineProperty(window.navigator, "onLine", {
    configurable: true,
    get: () => value,
  });
}
let view: DayView;
let posts: Record<string, unknown>[];
let eventPatch: ReturnType<typeof vi.spyOn>;
let patchDay: ReturnType<typeof vi.spyOn>;
let patchNight: ReturnType<typeof vi.spyOn>;
const choose = async (group: string, option: string) => {
  fireEvent.click(
    within(screen.getByRole("group", { name: group })).getByRole("button", {
      name: option,
    }),
  );
  await waitFor(() => expect(screen.queryByText(t("save.pending"))).toBeNull());
};
const idle = () =>
  waitFor(() => expect(screen.queryByText(t("save.pending"))).toBeNull());
/** Two-step time picker: hour first, then the quarter hour. */
async function pickTime(label: string, hhmm: string) {
  const [hour, minute] = hhmm.split(":");
  fireEvent.change(screen.getByLabelText(t("time.hour", { label })), {
    target: { value: hour },
  });
  await idle();
  fireEvent.change(screen.getByLabelText(t("time.minutes", { label })), {
    target: { value: minute },
  });
  await idle();
}
const pressed = (group: string) =>
  within(screen.getByRole("group", { name: group }))
    .getAllByRole("button")
    .filter((button) => button.getAttribute("aria-pressed") === "true")
    .map((button) => button.textContent);
async function open(kind = "Boisson") {
  fireEvent.click(screen.getByRole("button", { name: `＋ ${kind}` }));
  return screen.getByRole("dialog");
}
async function start() {
  render(<DayPage date={date} today onManageFavorites={vi.fn()} />);
  await screen.findByRole("heading", { name: t("today.evening") });
}
beforeEach(() => {
  online(true);
  view = emptyView();
  posts = [];
  // jsdom does not implement the browser's dialog methods; browser smoke covers focus.
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
  vi.spyOn(api, "dayView").mockImplementation(async () =>
    structuredClone(view),
  );
  vi.spyOn(api, "favorites").mockResolvedValue([]);
  patchDay = vi
    .spyOn(api, "patchDay")
    .mockImplementation(async (_date, body) => {
      Object.assign(view.day, body);
      for (const field of ["dinner_at", "late_sugar_at"] as const) {
        const input = body[field] as { at: string } | null | undefined;
        if (input)
          view.day[field] = {
            local: input.at,
            utc: input.at,
            utc_offset_minutes: 60,
          };
      }
      if (view.day.late_sugar !== "yes") view.day.late_sugar_at = null;
      return structuredClone(view.day);
    });
  patchNight = vi
    .spyOn(api, "patchNight")
    .mockImplementation(async (_date, body) => {
      Object.assign(view.night, body);
      if (view.night.early_wake_planned !== "yes") {
        view.night.early_wake_target_time = null;
        view.night.early_wake_reason = null;
      }
      return structuredClone(view.night);
    });
  eventPatch = vi
    .spyOn(api, "patchEvent")
    .mockImplementation(async (id, body) => {
      const saved = {
        ...view.events.find((item) => item.id === id)!,
        ...body,
        occurred_at: entry().occurred_at,
      } as JournalEvent;
      view.events = view.events.map((item) => (item.id === id ? saved : item));
      return structuredClone(saved);
    });
  vi.spyOn(api, "deleteEvent").mockImplementation(async (id) => {
    view.events = view.events.filter((item) => item.id !== id);
  });
  vi.spyOn(globalThis, "fetch").mockImplementation(async (_url, init) => {
    const body = JSON.parse(String(init?.body));
    posts.push(body);
    const saved = entry({
      ...body,
      occurred_at: entry().occurred_at,
      id: `e${posts.length}`,
    });
    view.events.push(saved);
    return new Response(JSON.stringify(saved), { status: 201 });
  });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("chronological context and autosave", () => {
  it("starts unanswered, with one column's ordered sections and collapsed advanced options", async () => {
    await start();
    expect(screen.getByRole("status").textContent).toContain("0/8");
    expect(
      screen.queryByRole("button", { name: t("answer.unknown") }),
    ).toBeNull();
    expect(
      screen
        .getAllByRole("heading", { level: 2 })
        .map((heading) => heading.textContent),
    ).toEqual([t("today.quick"), t("today.evening"), t("today.night")]);
    expect(document.querySelector("details")?.open).toBe(false);
    expect(screen.queryByRole("button", { name: t("common.save") })).toBeNull();
    expect(screen.queryByText(t("today.evening_help"))).toBeNull();
    fireEvent.click(
      screen.getByRole("button", {
        name: t("today.help", { section: t("today.evening") }),
      }),
    );
    expect(screen.getByText(t("today.evening_help"))).toBeTruthy();
  });
  it("saves sugar yes immediately without an invented time, and toggles back to unknown", async () => {
    await start();
    await choose(t("day.late_sugar"), t("answer.yes"));
    expect(patchDay).toHaveBeenCalledWith(date, { late_sugar: "yes" });
    expect(screen.getByLabelText(t("day.late_sugar_time"))).toBeTruthy();
    expect(
      screen.getByLabelText(t("today.progress", { count: 1 })).textContent,
    ).toContain("1/8");
    expect(screen.getAllByLabelText(t("today.answered"))).toHaveLength(1);
    await choose(t("day.late_sugar"), t("answer.yes"));
    expect(patchDay).toHaveBeenLastCalledWith(date, { late_sugar: "unknown" });
    expect(screen.queryByLabelText(t("day.late_sugar_time"))).toBeNull();
    expect(
      screen.getByLabelText(t("today.progress", { count: 0 })),
    ).toBeTruthy();
  });
  it("keeps absent stress, anticipated stress and explicit no independent", async () => {
    await start();
    await choose(t("day.experienced_stress"), t("stress.absent"));
    await choose(t("today.tomorrow_stress"), t("stress.high"));
    await choose(t("night.cat"), t("answer.no"));
    expect(patchDay).toHaveBeenCalledWith(date, {
      experienced_stress: "absent",
    });
    expect(patchNight).toHaveBeenCalledWith(date, {
      anticipated_stress: "high",
    });
    expect(
      screen.getByLabelText(t("today.progress", { count: 3 })),
    ).toBeTruthy();
  });
  it("counts dinner once, retains massive portions, and keeps gluten outside the core count", async () => {
    await start();
    await choose(t("day.dinner_quantity"), t("dinner.massive"));
    expect(
      screen.getByLabelText(t("today.progress", { count: 1 })),
    ).toBeTruthy();
    fireEvent.click(screen.getByText(t("today.advanced")));
    await choose(t("day.gluten"), t("answer.no"));
    expect(
      screen.getByLabelText(t("today.progress", { count: 1 })),
    ).toBeTruthy();
    await choose(t("day.dinner_quantity"), t("dinner.massive"));
    expect(patchDay).toHaveBeenLastCalledWith(date, {
      dinner_quantity: "unknown",
    });
  });
  it("saves early wake immediately, then its optional target, and clears on a second tap", async () => {
    await start();
    await choose(t("night.early_wake"), t("answer.yes"));
    expect(patchNight).toHaveBeenLastCalledWith(date, {
      early_wake_planned: "yes",
    });
    await pickTime(t("night.early_wake_target"), "06:30");
    expect(patchNight).toHaveBeenLastCalledWith(date, {
      early_wake_target_time: "06:30",
    });
    fireEvent.change(
      screen.getByLabelText(
        t("time.hour", { label: t("night.early_wake_target") }),
      ),
      { target: { value: "" } },
    );
    await idle();
    expect(patchNight).toHaveBeenLastCalledWith(date, {
      early_wake_target_time: null,
    });
    await choose(t("night.early_wake"), t("answer.yes"));
    expect(patchNight).toHaveBeenLastCalledWith(date, {
      early_wake_planned: "unknown",
    });
  });
});

it("keeps an ambiguous meal unsaved until the hidden DST choice is supplied", async () => {
  view.tracking_date = "2026-10-24";
  view.day.tracking_date = "2026-10-24";
  render(<DayPage date="2026-10-24" />);
  await screen.findByRole("heading", { name: t("today.evening") });
  await pickTime(t("day.dinner_time"), "02:30");
  expect(patchDay).not.toHaveBeenCalled();
  expect(screen.getByRole("alert").textContent).toContain(t("time.ambiguous"));
  const selector = screen.getByLabelText(t("time.offset"));
  expect(selector.closest("details")?.open).toBe(false);
  fireEvent.change(selector, { target: { value: "60" } });
  await waitFor(() =>
    expect(patchDay).toHaveBeenCalledWith("2026-10-24", {
      dinner_at: { at: "2026-10-25T02:30", utc_offset_minutes: 60 },
    }),
  );
});

it("autosaves the optional early-wake reason on change", async () => {
  await start();
  await choose(t("night.early_wake"), t("answer.yes"));
  fireEvent.change(screen.getByLabelText(t("night.early_wake_reason")), {
    target: { value: "Train" },
  });
  await waitFor(() =>
    expect(patchNight).toHaveBeenLastCalledWith(date, {
      early_wake_reason: "Train",
    }),
  );
});

it("never creates a duplicate when submitting an existing event editor with Enter", async () => {
  view.events = [entry()];
  await start();
  fireEvent.click(screen.getByRole("button", { name: /Modifier Maté/ }));
  fireEvent.submit(screen.getByRole("dialog").querySelector("form")!);
  await new Promise((resolve) => setTimeout(resolve, 20));
  expect(posts).toHaveLength(0);
});

describe("capture sheets", () => {
  it("creates independent drinks with adjustable volume, reset to 250 on every opening", async () => {
    await start();
    await open();
    await choose(t("favorite.drink"), t("drink.mate"));
    await choose(t("capture.volume"), "500 ml");
    fireEvent.click(screen.getByRole("button", { name: t("common.add") }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(posts[0]).toMatchObject({
      kind: "drink",
      drink_type: "mate",
      volume_ml: 500,
    });
    await open();
    expect(pressed(t("capture.volume"))).toEqual(["250 ml"]);
    fireEvent.click(screen.getByRole("button", { name: t("common.add") }));
    await waitFor(() => expect(posts).toHaveLength(2));
  });
  it.each([
    ["Sport", 30, "activity"],
    ["Sieste", 15, "nap"],
  ] as const)(
    "starts %s with a fresh default duration",
    async (label, duration, kind) => {
      await start();
      await open(label);
      expect(
        (screen.getByLabelText(t("capture.duration")) as HTMLInputElement)
          .value,
      ).toBe(String(duration));
      fireEvent.click(screen.getByRole("button", { name: t("common.add") }));
      await waitFor(() =>
        expect(posts[0]).toMatchObject({ kind, duration_minutes: duration }),
      );
      if (kind === "activity")
        expect(posts[0]).toMatchObject({
          activity_type: "walking",
          intensity: "medium",
        });
    },
  );
  it("copies a favorite into an independent entry with provenance and the fresh 250 ml default", async () => {
    vi.mocked(api.favorites).mockResolvedValue([
      { id: "f1", label: "Grand thé", drink_type: "black_tea", volume_ml: 500 },
    ]);
    vi.spyOn(api, "useFavorite").mockImplementation(async () => {
      const saved = entry({
        favorite_id: "f1",
        drink_type: "black_tea",
        volume_ml: 500,
      });
      view.events.push(saved);
      return saved;
    });
    await start();
    await open();
    fireEvent.click(screen.getByRole("button", { name: "Grand thé" }));
    expect(pressed(t("capture.volume"))).toEqual(["250 ml"]);
    expect(
      screen.queryByRole("button", { name: t("favorite.new") }),
    ).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: t("common.add") }));
    await waitFor(() =>
      expect(eventPatch).toHaveBeenCalledWith(
        "e1",
        expect.objectContaining({ volume_ml: 250 }),
      ),
    );
    expect(view.events[0].favorite_id).toBe("f1");
  });
  it("does not duplicate a favorite intake when adjustment fails and is retried", async () => {
    vi.mocked(api.favorites).mockResolvedValue([
      { id: "f1", label: "Thé", drink_type: "mate", volume_ml: 500 },
    ]);
    const useFavorite = vi
      .spyOn(api, "useFavorite")
      .mockImplementation(async () => {
        const saved = entry({ volume_ml: 500 });
        view.events.push(saved);
        return saved;
      });
    eventPatch.mockRejectedValueOnce(new Error("failure"));
    await start();
    await open();
    fireEvent.click(screen.getByRole("button", { name: "Thé" }));
    fireEvent.click(screen.getByRole("button", { name: t("common.add") }));
    await screen.findByText(`${t("save.failed")} ${t("error.generic")}`);
    fireEvent.click(screen.getByRole("button", { name: t("common.add") }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(useFavorite).toHaveBeenCalledTimes(1);
    expect(view.events).toHaveLength(1);
  });
  it("edits from an inline chip with autosave, keeps night radios collapsed, and deletes", async () => {
    view.events = [entry()];
    vi.spyOn(window, "confirm").mockReturnValue(true);
    await start();
    fireEvent.click(screen.getByRole("button", { name: /Modifier Maté/ }));
    expect(screen.getAllByRole("radio")[0].closest("details")?.open).toBe(
      false,
    );
    await choose(t("capture.volume"), "1 L");
    expect(eventPatch).toHaveBeenCalledWith("e1", { volume_ml: 1000 });
    await pickTime(t("time.label"), "09:45");
    expect(eventPatch).toHaveBeenLastCalledWith("e1", {
      occurred_at: { at: "2026-11-09T09:45" },
    });
    await waitFor(() =>
      expect(screen.queryByText(t("save.pending"))).toBeNull(),
    );
    fireEvent.click(
      within(screen.getByRole("dialog")).getByText(t("today.advanced")),
    );
    fireEvent.click(screen.getByRole("radio", { name: /Nuit précédente/ }));
    await waitFor(() =>
      expect(eventPatch).toHaveBeenCalledWith("e1", {
        night_start_date: "2026-11-08",
      }),
    );
    await waitFor(() =>
      expect(screen.queryByText(t("save.pending"))).toBeNull(),
    );
    fireEvent.click(screen.getByRole("button", { name: t("common.delete") }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(api.deleteEvent).toHaveBeenCalledWith("e1");
    expect(posts).toHaveLength(0);
  });
  it("offers fixed volumes and quarter-hour times without a now shortcut", async () => {
    await start();
    await open();
    expect(
      within(screen.getByRole("group", { name: t("capture.volume") }))
        .getAllByRole("button")
        .map((button) => button.textContent),
    ).toEqual(["250 ml", "500 ml", "750 ml", "1 L"]);
    expect(screen.queryByRole("button", { name: "Maintenant" })).toBeNull();
    const minutes = screen.getByLabelText(
      t("time.minutes", { label: t("time.label") }),
    ) as HTMLSelectElement;
    expect([...minutes.options].map((option) => option.value)).toEqual([
      "00",
      "15",
      "30",
      "45",
    ]);
    const hours = screen.getByLabelText(
      t("time.hour", { label: t("time.label") }),
    ) as HTMLSelectElement;
    expect(hours.options).toHaveLength(25);
    await pickTime(t("time.label"), "02:15");
    fireEvent.click(screen.getByRole("button", { name: t("common.add") }));
    await waitFor(() => expect(posts).toHaveLength(1));
    // Before 04:00 the time belongs to the next calendar date of the tracking day.
    expect(posts[0]).toMatchObject({
      volume_ml: 250,
      occurred_at: { at: "2026-11-10T02:15" },
    });
  });
  it.each(["Sport", "Sieste"])(
    "offers %s durations by quarter hour from 15 min to 2 h",
    async (label) => {
      await start();
      await open(label);
      const select = screen.getByLabelText(
        t("capture.duration"),
      ) as HTMLSelectElement;
      expect([...select.options].map((option) => option.textContent)).toEqual([
        "15 min",
        "30 min",
        "45 min",
        "1 h",
        "1 h 15",
        "1 h 30",
        "1 h 45",
        "2 h",
      ]);
      fireEvent.change(select, { target: { value: "90" } });
      fireEvent.click(screen.getByRole("button", { name: t("common.add") }));
      await waitFor(() =>
        expect(posts[0]).toMatchObject({
          kind: label === "Sport" ? "activity" : "nap",
          duration_minutes: 90,
        }),
      );
    },
  );
  it("shows a stored off-grid nap duration as it is", async () => {
    view.events = [
      entry({
        kind: "nap",
        drink_type: null,
        volume_ml: null,
        duration_minutes: 20,
      }),
    ];
    await start();
    fireEvent.click(screen.getByRole("button", { name: /Modifier Sieste/ }));
    const select = screen.getByLabelText(
      t("capture.duration"),
    ) as HTMLSelectElement;
    expect(select.value).toBe("20");
    expect(select.options[1].textContent).toBe("20 min");
  });
  it("shows stored off-grid values as they are", async () => {
    view.events = [
      entry({
        volume_ml: 330,
        occurred_at: {
          utc: "2026-11-09T07:10:00Z",
          utc_offset_minutes: 60,
          local: "2026-11-09T08:10:00+01:00",
        },
      }),
    ];
    await start();
    fireEvent.click(screen.getByRole("button", { name: /Modifier Maté/ }));
    expect(pressed(t("capture.volume"))).toEqual(["330 ml"]);
    expect(
      (
        screen.getByLabelText(
          t("time.minutes", { label: t("time.label") }),
        ) as HTMLSelectElement
      ).value,
    ).toBe("10");
  });
});

describe("truthful global save status", () => {
  it("refuses offline writes without a queue or replay", async () => {
    await start();
    await open();
    online(false);
    fireEvent.click(screen.getByRole("button", { name: t("common.add") }));
    await screen.findByText(t("save.disconnected"));
    expect(fetch).not.toHaveBeenCalled();
    online(true);
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(fetch).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeTruthy();
  });
  it.each(["rejection", "network"])(
    "reports a %s failure and keeps the sheet open",
    async (failure) => {
      if (failure === "network")
        vi.mocked(fetch).mockRejectedValue(new TypeError("Failed to fetch"));
      else
        vi.mocked(fetch).mockResolvedValue(
          new Response(
            JSON.stringify({ detail: { code: "invalid", message: "Refusé." } }),
            { status: 422 },
          ),
        );
      await start();
      await open();
      fireEvent.click(screen.getByRole("button", { name: t("common.add") }));
      await screen.findByText(
        failure === "network"
          ? t("save.disconnected")
          : `${t("save.failed")} Refusé.`,
      );
      expect(screen.getByRole("dialog")).toBeTruthy();
      expect(
        screen.getAllByText(
          failure === "network"
            ? t("save.disconnected")
            : `${t("save.failed")} Refusé.`,
        ),
      ).toHaveLength(1);
    },
  );
});
