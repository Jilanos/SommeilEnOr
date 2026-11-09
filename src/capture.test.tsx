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
    fireEvent.change(screen.getByLabelText(t("night.early_wake_target")), {
      target: { value: "06:30" },
    });
    await waitFor(() =>
      expect(patchNight).toHaveBeenLastCalledWith(date, {
        early_wake_target_time: "06:30",
      }),
    );
    await waitFor(() =>
      expect(screen.queryByText(t("save.pending"))).toBeNull(),
    );
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
  fireEvent.change(screen.getByLabelText(t("day.dinner_time")), {
    target: { value: "02:30" },
  });
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
    fireEvent.change(screen.getByLabelText(t("capture.volume")), {
      target: { value: "500" },
    });
    fireEvent.click(screen.getByRole("button", { name: t("common.add") }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(posts[0]).toMatchObject({
      kind: "drink",
      drink_type: "mate",
      volume_ml: 500,
    });
    await open();
    expect(
      (screen.getByLabelText(t("capture.volume")) as HTMLInputElement).value,
    ).toBe("250");
    fireEvent.click(screen.getByRole("button", { name: t("common.add") }));
    await waitFor(() => expect(posts).toHaveLength(2));
  });
  it.each([
    ["Sport", 30, "activity"],
    ["Sieste", 20, "nap"],
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
    expect(
      (screen.getByLabelText(t("capture.volume")) as HTMLInputElement).value,
    ).toBe("250");
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
    fireEvent.change(screen.getByLabelText(t("capture.volume")), {
      target: { value: "300" },
    });
    await waitFor(() =>
      expect(eventPatch).toHaveBeenCalledWith("e1", { volume_ml: 300 }),
    );
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
  it("refuses invalid volume without posting", async () => {
    await start();
    await open();
    fireEvent.change(screen.getByLabelText(t("capture.volume")), {
      target: { value: "0" },
    });
    expect(
      (
        screen.getByRole("button", {
          name: t("common.add"),
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    expect(posts).toHaveLength(0);
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
