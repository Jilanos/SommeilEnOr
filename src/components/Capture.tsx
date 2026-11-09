import { useRef, useState } from "react";
import {
  ACTIVITY_TYPES,
  DRINK_TYPES,
  INTENSITIES,
  api,
  type ActivityType,
  type DrinkType,
  type EventKind,
  type Favorite,
  type Intensity,
  type JournalEvent,
} from "../api";
import { t } from "../i18n";
import {
  activityLabel,
  drinkLabel,
  intensityLabel,
  kindLabel,
} from "../labels";
import { addDays, currentTrackingDate, inputOf, timeOf } from "../time";
import type { Saver } from "../useSaver";
import { Choice } from "./Choice";
import { SaveStatus } from "./SaveStatus";
import { Sheet } from "./Sheet";
import {
  TimeChooser,
  customValue,
  nowValue,
  timeProblem,
  toMomentInput,
  type TimeValue,
} from "./TimeChooser";

export function describe(event: JournalEvent): string {
  if (event.kind === "drink")
    return `${drinkLabel(event.drink_type!)} · ${event.volume_ml} ml`;
  if (event.kind === "activity")
    return `${activityLabel(event.activity_type!)} · ${event.duration_minutes} min`;
  return `${kindLabel("nap")} · ${event.duration_minutes} min`;
}

export function EventChips({
  events,
  onEdit,
}: {
  events: JournalEvent[];
  onEdit: (event: JournalEvent) => void;
}) {
  return (
    <ul className="entry-chips">
      {events.map((event) => (
        <li key={event.id}>
          <button
            type="button"
            onClick={() => onEdit(event)}
            aria-label={t("today.edit_entry", {
              entry: describe(event),
              time: timeOf(event.occurred_at.local),
            })}
          >
            <span aria-hidden="true">
              {event.kind === "drink"
                ? "☕"
                : event.kind === "activity"
                  ? "↗"
                  : "☾"}
            </span>
            {describe(event)}
            <small>{timeOf(event.occurred_at.local)}</small>
          </button>
        </li>
      ))}
    </ul>
  );
}

/** New entries are composed once; existing entries autosave each valid change. */
export function CaptureSheet({
  kind,
  event,
  favorites,
  date,
  saver,
  onSaved,
  onDeleted,
  onClose,
}: {
  kind: EventKind;
  event?: JournalEvent;
  favorites: Favorite[];
  date: string;
  saver: Saver;
  onSaved: (event: JournalEvent) => void;
  onDeleted: (id: string) => void;
  onClose: () => void;
}) {
  const [time, setTime] = useState<TimeValue>(
    event
      ? {
          ...customValue(inputOf(event.occurred_at.local)),
          offset: event.occurred_at.utc_offset_minutes,
        }
      : date === currentTrackingDate()
        ? nowValue()
        : customValue(`${date}T12:00`),
  );
  const [drink, setDrink] = useState<DrinkType>(
    event?.drink_type ?? "green_tea",
  );
  const [volume, setVolume] = useState(String(event?.volume_ml ?? 250));
  const [activity, setActivity] = useState<ActivityType>(
    event?.activity_type ?? "walking",
  );
  const [intensity, setIntensity] = useState<Intensity>(
    event?.intensity ?? "medium",
  );
  const [duration, setDuration] = useState(
    String(event?.duration_minutes ?? (kind === "nap" ? 20 : 30)),
  );
  const created = useRef<JournalEvent | null>(null);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [nightChoice, setNightChoice] = useState(
    event?.night_override ? "custom" : "default",
  );
  const [nightDate, setNightDate] = useState(event?.night_start_date ?? date);
  const pending = saver.state === "pending";
  const problem = timeProblem(time);
  const amount = Number(kind === "drink" ? volume : duration);
  const valid =
    amount > 0 &&
    amount <= (kind === "drink" ? 5000 : 1440) &&
    (kind === "drink" || Number.isInteger(amount));

  async function update(body: Record<string, unknown>) {
    if (!event) return;
    const saved = await saver.run(() => api.patchEvent(event.id, body));
    if (saved) onSaved(saved);
  }
  async function create(form: React.FormEvent) {
    form.preventDefault();
    if (event || pending || problem || !valid) return;
    const occurredAt = toMomentInput(time);
    const saved = await saver.run(async () => {
      // Favorite endpoint preserves provenance; the adjustment remains local to this new entry.
      if (kind === "drink" && (favoriteId || created.current)) {
        const fresh = !created.current;
        const entry =
          created.current ?? (await api.useFavorite(favoriteId!, occurredAt));
        created.current = entry;
        onSaved(entry);
        if (
          fresh &&
          entry.volume_ml === Number(volume) &&
          entry.drink_type === drink
        )
          return entry;
        return api.patchEvent(entry.id, {
          drink_type: drink,
          volume_ml: Number(volume),
          occurred_at: occurredAt,
        });
      }
      return api.createEvent({
        kind,
        occurred_at: occurredAt,
        ...(kind === "drink"
          ? { drink_type: drink, volume_ml: Number(volume) }
          : {
              duration_minutes: Number(duration),
              ...(kind === "activity"
                ? { activity_type: activity, intensity }
                : {}),
            }),
      });
    });
    if (saved) {
      onSaved(saved);
      onClose();
    }
  }
  function changeTime(value: TimeValue) {
    setTime(value);
    if (!timeProblem(value)) void update({ occurred_at: toMomentInput(value) });
  }
  const title = event
    ? t("today.edit_kind", { kind: kindLabel(kind) })
    : t("today.add_kind", { kind: kindLabel(kind) });
  return (
    <Sheet title={title} onClose={onClose}>
      <SaveStatus saver={saver} />
      <form className="stack" onSubmit={create}>
        {kind === "drink" && (
          <>
            {!event && favorites.length > 0 && (
              <div className="favorite-picker">
                <span className="field-label">{t("favorite.title")}</span>
                <div className="choice">
                  {favorites.map((favorite) => (
                    <button
                      type="button"
                      key={favorite.id}
                      className={
                        favoriteId === favorite.id ? "chip chip-on" : "chip"
                      }
                      aria-pressed={favoriteId === favorite.id}
                      onClick={() => {
                        setFavoriteId(favorite.id);
                        setDrink(favorite.drink_type);
                      }}
                    >
                      {favorite.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <Choice
              label={t("favorite.drink")}
              value={drink}
              options={DRINK_TYPES}
              optionLabel={drinkLabel}
              disabled={pending}
              onChange={(value) => {
                setDrink(value);
                setFavoriteId(null);
                void update({ drink_type: value });
              }}
            />
            <label className="row">
              {t("capture.volume")}
              <input
                type="number"
                aria-label={t("capture.volume")}
                className="narrow"
                required
                min={1}
                max={5000}
                step="any"
                value={volume}
                onChange={(e) => {
                  const value = e.target.value;
                  setVolume(value);
                  if (+value > 0 && +value <= 5000)
                    void update({ volume_ml: +value });
                }}
              />
              ml
            </label>
          </>
        )}
        {kind === "activity" && (
          <>
            <Choice
              label={t("capture.activity_type")}
              value={activity}
              options={ACTIVITY_TYPES}
              optionLabel={activityLabel}
              disabled={pending}
              onChange={(value) => {
                setActivity(value);
                void update({ activity_type: value });
              }}
            />
            <Choice
              label={t("capture.intensity")}
              value={intensity}
              options={INTENSITIES}
              optionLabel={intensityLabel}
              disabled={pending}
              onChange={(value) => {
                setIntensity(value);
                void update({ intensity: value });
              }}
            />
          </>
        )}
        {kind !== "drink" && (
          <label className="row">
            {t("capture.duration")}
            <input
              type="number"
              aria-label={t("capture.duration")}
              className="narrow"
              min={1}
              max={1440}
              required
              value={duration}
              onChange={(e) => {
                const value = e.target.value;
                setDuration(value);
                if (+value > 0 && +value <= 1440 && Number.isInteger(+value))
                  void update({ duration_minutes: +value });
              }}
            />
            min
          </label>
        )}
        {!valid && (
          <p className="error" role="alert">
            {kind === "drink"
              ? t("capture.volume_invalid")
              : t("capture.duration_invalid")}
          </p>
        )}
        <TimeChooser value={time} onChange={changeTime} allowNow={!event} />
        {event && (
          <details className="advanced">
            <summary>{t("today.advanced")}</summary>
            <fieldset>
              <legend>{t("event.night")}</legend>
              {["default", "previous", "custom"].map((choice) => (
                <label key={choice}>
                  <input
                    type="radio"
                    name="night"
                    checked={nightChoice === choice}
                    disabled={pending}
                    onChange={() => {
                      setNightChoice(choice);
                      void update({
                        night_start_date:
                          choice === "default"
                            ? null
                            : choice === "previous"
                              ? addDays(event.tracking_date, -1)
                              : nightDate,
                      });
                    }}
                  />
                  {choice === "default"
                    ? t("event.night_default")
                    : choice === "previous"
                      ? t("event.night_previous", {
                          date: addDays(event.tracking_date, -1),
                        })
                      : t("event.night_custom")}
                </label>
              ))}
              <input
                type="date"
                aria-label={t("event.night_custom")}
                value={nightDate}
                onChange={(e) => {
                  setNightDate(e.target.value);
                  if (e.target.value) {
                    setNightChoice("custom");
                    void update({ night_start_date: e.target.value });
                  }
                }}
              />
            </fieldset>
          </details>
        )}
        <div className="sheet-actions">
          {event ? (
            <>
              <button
                type="button"
                className="danger"
                disabled={pending}
                onClick={async () => {
                  if (!window.confirm(t("event.delete.confirm"))) return;
                  const done = await saver.run(() =>
                    api.deleteEvent(event.id).then(() => true),
                  );
                  if (done) {
                    onDeleted(event.id);
                    onClose();
                  }
                }}
              >
                {t("common.delete")}
              </button>
              <button type="button" className="primary" onClick={onClose}>
                {t("common.close")}
              </button>
            </>
          ) : (
            <button
              type="submit"
              className="primary"
              disabled={pending || !!problem || !valid}
            >
              {t("common.add")}
            </button>
          )}
        </div>
      </form>
    </Sheet>
  );
}
