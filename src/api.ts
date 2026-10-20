/** Online-only API client. Failures are reported, never queued or retried. */

export type YesNo = "yes" | "no" | "unknown";
export type Stress = "absent" | "medium" | "high" | "unknown";
export type DinnerQuantity = "small" | "medium" | "big" | "massive" | "unknown";
export type DrinkType = "green_tea" | "black_tea" | "mate" | "infusion";
export type ActivityType = "walking" | "running" | "cycling" | "strength" | "other";
export type Intensity = "low" | "medium" | "high";
export type EventKind = "drink" | "activity" | "nap";

export const DRINK_TYPES: DrinkType[] = ["green_tea", "black_tea", "mate", "infusion"];
export const ACTIVITY_TYPES: ActivityType[] = ["walking", "running", "cycling", "strength", "other"];
export const INTENSITIES: Intensity[] = ["low", "medium", "high"];

export interface Moment {
  utc: string;
  utc_offset_minutes: number;
  local: string;
}

export interface MomentInput {
  at: string;
  utc_offset_minutes?: number;
}

export interface JournalEvent {
  id: string;
  kind: EventKind;
  occurred_at: Moment;
  tracking_date: string;
  night_id: string;
  night_start_date: string;
  night_end_date: string;
  night_override: boolean;
  drink_type: DrinkType | null;
  volume_ml: number | null;
  activity_type: ActivityType | null;
  intensity: Intensity | null;
  duration_minutes: number | null;
  favorite_id: string | null;
}

export interface Day {
  id: string | null;
  tracking_date: string;
  alcohol: YesNo;
  gluten: YesNo;
  experienced_stress: Stress;
  evening_noncaffeinated_drink: YesNo;
  late_sugar: YesNo;
  late_sugar_at: Moment | null;
  dinner_at: Moment | null;
  dinner_quantity: DinnerQuantity;
}

export interface Night {
  id: string | null;
  start_date: string;
  end_date: string;
  cat_presence: YesNo;
  anticipated_stress: Stress;
  anticipated_stress_for_date: string;
  early_wake_planned: YesNo;
  early_wake_target_time: string | null;
  early_wake_reason: string | null;
}

export interface DayView {
  tracking_date: string;
  day: Day;
  night: Night;
  events: JournalEvent[];
  night_events: JournalEvent[];
}

export interface Favorite {
  id: string;
  label: string;
  drink_type: DrinkType;
  volume_ml: number;
}

export interface Suggestion {
  id: string;
  action_context: string;
  text: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly options: number[] = [],
  ) {
    super(message);
  }
}

/** The request could not reach the server (offline or network failure). */
export class DisconnectedError extends Error {}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    throw new DisconnectedError("offline");
  }
  let response: Response;
  try {
    response = await fetch(path, {
      method,
      credentials: "same-origin",
      headers: body === undefined ? {} : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new DisconnectedError("network");
  }
  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = data?.detail;
    if (detail && typeof detail === "object" && !Array.isArray(detail)) {
      throw new ApiError(response.status, detail.code, detail.message, detail.options ?? []);
    }
    const message = Array.isArray(detail) ? detail.map((d: { msg: string }) => d.msg).join(" ; ") : "";
    throw new ApiError(response.status, response.status === 422 ? "validation" : "http", message);
  }
  return data as T;
}

export const api = {
  me: () => request<User>("GET", "/api/auth/me"),
  register: (email: string, password: string) =>
    request<User>("POST", "/api/auth/register", { email, password }),
  login: (email: string, password: string) => request<User>("POST", "/api/auth/login", { email, password }),
  logout: () => request<void>("POST", "/api/auth/logout"),

  trackingDays: () => request<string[]>("GET", "/api/tracking-days"),
  dayView: (date: string) => request<DayView>("GET", `/api/days/${date}`),
  patchDay: (date: string, patch: Record<string, unknown>) => request<Day>("PATCH", `/api/days/${date}`, patch),
  patchNight: (date: string, patch: Record<string, unknown>) =>
    request<Night>("PATCH", `/api/nights/${date}`, patch),

  createEvent: (body: Record<string, unknown>) => request<JournalEvent>("POST", "/api/events", body),
  patchEvent: (id: string, patch: Record<string, unknown>) =>
    request<JournalEvent>("PATCH", `/api/events/${id}`, patch),
  deleteEvent: (id: string) => request<void>("DELETE", `/api/events/${id}`),

  favorites: () => request<Favorite[]>("GET", "/api/favorites"),
  createFavorite: (body: Omit<Favorite, "id">) => request<Favorite>("POST", "/api/favorites", body),
  deleteFavorite: (id: string) => request<void>("DELETE", `/api/favorites/${id}`),
  useFavorite: (id: string, occurred_at: MomentInput) =>
    request<JournalEvent>("POST", `/api/favorites/${id}/use`, { occurred_at }),

  suggestions: () => request<Suggestion[]>("GET", "/api/suggestions"),
  createSuggestion: (action_context: string, text: string) =>
    request<Suggestion>("POST", "/api/suggestions", { action_context, text }),
  deleteSuggestion: (id: string) => request<void>("DELETE", `/api/suggestions/${id}`),
};
