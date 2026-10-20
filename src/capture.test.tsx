import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DrinkCapture } from "./components/Capture";
import { customValue } from "./components/TimeChooser";
import { message as fr } from "./i18n";

function setOnline(value: boolean) {
  Object.defineProperty(window.navigator, "onLine", { configurable: true, get: () => value });
}

const saved = {
  id: "e1",
  kind: "drink",
  occurred_at: { utc: "2026-10-20T06:00:00Z", utc_offset_minutes: 120, local: "2026-10-20T08:00:00+02:00" },
  drink_type: "mate",
  volume_ml: 250,
};

describe("online-only drink capture", () => {
  beforeEach(() => setOnline(true));
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  function renderCapture(onSaved = vi.fn()) {
    render(
      <DrinkCapture
        time={customValue("2026-10-20T08:00")}
        onSaved={onSaved}
        favorites={[]}
        onFavoritesChange={() => undefined}
      />,
    );
    return onSaved;
  }

  it("posts one independent intake per tap and reports it saved", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(saved), { status: 201, headers: { "Content-Type": "application/json" } }),
    );
    const onSaved = renderCapture();
    fireEvent.click(screen.getByRole("button", { name: fr("drink.mate") }));
    await waitFor(() => expect(screen.getByText(fr("save.saved"))).toBeTruthy());
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/events");
    expect(JSON.parse(String(init?.body))).toEqual({
      kind: "drink",
      occurred_at: { at: "2026-10-20T08:00" },
      drink_type: "mate",
      volume_ml: 250,
    });
    expect(onSaved).toHaveBeenCalledOnce();
  });

  it("refuses to save while offline and never queues the write", async () => {
    setOnline(false);
    const fetchMock = vi.spyOn(globalThis, "fetch");
    const onSaved = renderCapture();
    fireEvent.click(screen.getByRole("button", { name: fr("drink.green_tea") }));
    await waitFor(() => expect(screen.getByText(fr("save.disconnected"))).toBeTruthy());
    expect(fetchMock).not.toHaveBeenCalled();
    expect(onSaved).not.toHaveBeenCalled();
    setOnline(true);
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows a failed state when the server rejects the save", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ detail: { code: "nap_overlap", message: "Refusé." } }), { status: 422 }),
    );
    renderCapture();
    fireEvent.click(screen.getByRole("button", { name: fr("drink.infusion") }));
    await waitFor(() => expect(screen.getByText(`${fr("save.failed")} Refusé.`)).toBeTruthy());
  });

  it("reports a network failure as disconnected", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("Failed to fetch"));
    renderCapture();
    fireEvent.click(screen.getByRole("button", { name: fr("drink.black_tea") }));
    await waitFor(() => expect(screen.getByText(fr("save.disconnected"))).toBeTruthy());
  });

  it("places a feature-suggestion control beside the action", () => {
    renderCapture();
    expect(screen.getAllByRole("button", { name: fr("suggest.button") }).length).toBeGreaterThanOrEqual(2);
  });
});
