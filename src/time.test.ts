import { describe, expect, it } from "vitest";
import { wallTimeOnTrackingDay } from "./components/DayEditor";
import { timeProblem, toMomentInput } from "./components/TimeChooser";
import { addDays, parisLocalInput, parisOffsetsFor, trackingDateOf } from "./time";

describe("tracking day (strict 04:00 Europe/Paris)", () => {
  it.each([
    ["2026-10-20T00:30", "2026-10-19"],
    ["2026-10-20T03:59", "2026-10-19"],
    ["2026-10-20T04:00", "2026-10-20"],
    ["2026-10-20T05:00", "2026-10-20"],
    ["2026-10-20T08:00", "2026-10-20"],
    ["2026-10-20T23:45", "2026-10-20"],
  ])("%s belongs to %s", (local, expected) => {
    expect(trackingDateOf(local)).toBe(expected);
  });

  it("adds days across month and year ends", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("maps evening and after-midnight times onto the tracking day", () => {
    expect(wallTimeOnTrackingDay("2026-10-19", "22:45")).toBe("2026-10-19T22:45");
    expect(wallTimeOnTrackingDay("2026-10-19", "00:30")).toBe("2026-10-20T00:30");
  });
});

describe("Paris wall time and DST", () => {
  it("formats instants in Europe/Paris", () => {
    expect(parisLocalInput(new Date("2026-10-19T22:30:00Z"))).toBe("2026-10-20T00:30");
    expect(parisLocalInput(new Date("2026-01-10T03:30:00Z"))).toBe("2026-01-10T04:30");
  });

  it("detects skipped and repeated hours", () => {
    expect(parisOffsetsFor("2026-03-29T02:30")).toEqual([]);
    expect(parisOffsetsFor("2026-10-25T02:30")).toEqual([60, 120]);
    expect(parisOffsetsFor("2026-07-01T12:00")).toEqual([120]);
  });

  it("requires an offset choice only for a repeated hour", () => {
    expect(timeProblem({ mode: "custom", local: "2026-10-25T02:30" })).not.toBeNull();
    expect(timeProblem({ mode: "custom", local: "2026-10-25T02:30", offset: 60 })).toBeNull();
    expect(timeProblem({ mode: "custom", local: "2026-03-29T02:30", offset: 60 })).not.toBeNull();
    expect(toMomentInput({ mode: "custom", local: "2026-10-25T02:30", offset: 60 })).toEqual({
      at: "2026-10-25T02:30",
      utc_offset_minutes: 60,
    });
  });

  it("sends the actual instant for 'now'", () => {
    expect(toMomentInput({ mode: "now", local: "" }).at).toMatch(/Z$/);
  });
});
