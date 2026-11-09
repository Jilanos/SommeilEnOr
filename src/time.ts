/** Europe/Paris wall-clock helpers. The server is authoritative for tracking days. */

export const TIMEZONE = "Europe/Paris";
export const DAY_BOUNDARY_HOUR = 4;

const partsFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** "YYYY-MM-DDTHH:MM" Paris wall time of an instant. */
export function parisLocalInput(instant: Date = new Date()): string {
  const parts = Object.fromEntries(
    partsFormatter.formatToParts(instant).map((p) => [p.type, p.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function addDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

/** Default tracking date of a Paris wall time with the strict 04:00 boundary. */
export function trackingDateOf(localInput: string): string {
  const [datePart, timePart] = localInput.split("T");
  const hour = Number(timePart.slice(0, 2));
  return hour < DAY_BOUNDARY_HOUR ? addDays(datePart, -1) : datePart;
}

export function currentTrackingDate(now: Date = new Date()): string {
  return trackingDateOf(parisLocalInput(now));
}

/** "HH:MM" of an ISO local timestamp with offset ("2026-10-20T00:30:00+02:00"). */
export function timeOf(local: string): string {
  return local.slice(11, 16);
}

/** "YYYY-MM-DDTHH:MM" of an ISO local timestamp, for datetime-local inputs. */
export function inputOf(local: string): string {
  return local.slice(0, 16);
}

export function offsetLabel(minutes: number): string {
  const sign = minutes >= 0 ? "+" : "-";
  const abs = Math.abs(minutes);
  return `UTC${sign}${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
}

const dayFormatter = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDate(isoDate: string): string {
  return dayFormatter.format(new Date(`${isoDate}T12:00:00Z`));
}

/** UTC offsets (minutes) at which a Paris wall time exists: 0 (DST gap), 1, or 2 (repeated hour). */
export function parisOffsetsFor(localInput: string): number[] {
  const [datePart, timePart] = localInput.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  const wallAsUtc = Date.UTC(year, month - 1, day, hour, minute);
  return [60, 120].filter(
    (offset) =>
      parisLocalInput(new Date(wallAsUtc - offset * 60000)) === localInput,
  );
}

/** Wall times before 04:00 belong to the next calendar date of a tracking day. */
export function wallTimeOnTrackingDay(
  trackingDate: string,
  hhmm: string,
): string {
  const date =
    Number(hhmm.slice(0, 2)) < 4 ? addDays(trackingDate, 1) : trackingDate;
  return `${date}T${hhmm}`;
}

/** Compact local date for the capture header. */
export function formatCaptureDate(date: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "numeric",
    timeZone: "Europe/Paris",
  }).format(new Date(`${date}T12:00:00Z`));
}
