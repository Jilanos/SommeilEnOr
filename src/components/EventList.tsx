import { useState } from "react";
import {
  ACTIVITY_TYPES,
  DRINK_TYPES,
  INTENSITIES,
  api,
  type ActivityType,
  type DrinkType,
  type Intensity,
  type JournalEvent,
} from "../api";
import { t } from "../i18n";
import { activityLabel, drinkLabel, intensityLabel, kindLabel } from "../labels";
import { addDays, formatDate, inputOf, offsetLabel, timeOf } from "../time";
import { useSaver } from "../useSaver";
import { Choice } from "./Choice";
import { SaveStatus } from "./SaveStatus";
import { SuggestButton } from "./SuggestButton";
import { TimeChooser, customValue, timeProblem, toMomentInput, type TimeValue } from "./TimeChooser";

export function describe(event: JournalEvent): string {
  if (event.kind === "drink") return `${drinkLabel(event.drink_type!)} · ${event.volume_ml} ml`;
  if (event.kind === "activity")
    return `${activityLabel(event.activity_type!)} · ${intensityLabel(event.intensity!)} · ${event.duration_minutes} min`;
  return `${kindLabel("nap")} · ${event.duration_minutes} min`;
}

type NightChoice = "default" | "previous" | "custom";

function EventEditor({ event, onDone }: { event: JournalEvent; onDone: (event: JournalEvent | null) => void }) {
  const saver = useSaver();
  const [time, setTime] = useState<TimeValue>({
    ...customValue(inputOf(event.occurred_at.local)),
    offset: event.occurred_at.utc_offset_minutes,
  });
  const [drinkType, setDrinkType] = useState<DrinkType>(event.drink_type ?? "green_tea");
  const [volume, setVolume] = useState(String(event.volume_ml ?? ""));
  const [activityType, setActivityType] = useState<ActivityType>(event.activity_type ?? "walking");
  const [intensity, setIntensity] = useState<Intensity>(event.intensity ?? "medium");
  const [duration, setDuration] = useState(String(event.duration_minutes ?? ""));
  const previous = addDays(event.tracking_date, -1);
  const [nightChoice, setNightChoice] = useState<NightChoice>(
    !event.night_override ? "default" : event.night_start_date === previous ? "previous" : "custom",
  );
  const [nightDate, setNightDate] = useState(event.night_start_date);

  async function save(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    if (timeProblem(time)) return;
    const body: Record<string, unknown> = { occurred_at: toMomentInput(time) };
    if (event.kind === "drink") Object.assign(body, { drink_type: drinkType, volume_ml: Number(volume) });
    if (event.kind === "activity")
      Object.assign(body, { activity_type: activityType, intensity, duration_minutes: Number(duration) });
    if (event.kind === "nap") body.duration_minutes = Number(duration);
    body.night_start_date = nightChoice === "default" ? null : nightChoice === "previous" ? previous : nightDate;
    const saved = await saver.run(() => api.patchEvent(event.id, body));
    if (saved) onDone(saved);
  }

  return (
    <form className="stack editor" onSubmit={save}>
      <TimeChooser value={time} onChange={setTime} allowNow={false} label={t("event.time")} />
      {event.kind === "drink" && (
        <>
          <Choice<DrinkType> label={t("favorite.drink")} value={drinkType} options={DRINK_TYPES} optionLabel={drinkLabel} onChange={setDrinkType} />
          <label className="row">
            {t("capture.volume")}{" "}
            <input type="number" min={1} max={5000} required className="narrow" value={volume} onChange={(e) => setVolume(e.target.value)} /> ml
          </label>
        </>
      )}
      {event.kind === "activity" && (
        <>
          <Choice<ActivityType> label={t("capture.activity_type")} value={activityType} options={ACTIVITY_TYPES} optionLabel={activityLabel} onChange={setActivityType} />
          <Choice<Intensity> label={t("capture.intensity")} value={intensity} options={INTENSITIES} optionLabel={intensityLabel} onChange={setIntensity} />
        </>
      )}
      {event.kind !== "drink" && (
        <label className="row">
          {t("capture.duration")}{" "}
          <input type="number" min={1} max={1440} required className="narrow" value={duration} onChange={(e) => setDuration(e.target.value)} /> min
        </label>
      )}
      <fieldset>
        <legend>{t("event.night")}</legend>
        <label>
          <input type="radio" checked={nightChoice === "default"} onChange={() => setNightChoice("default")} />{" "}
          {t("event.night_default")}
        </label>
        <label>
          <input type="radio" checked={nightChoice === "previous"} onChange={() => setNightChoice("previous")} />{" "}
          {t("event.night_previous", { date: formatDate(previous) })}
        </label>
        <label>
          <input type="radio" checked={nightChoice === "custom"} onChange={() => setNightChoice("custom")} />{" "}
          {t("event.night_custom")}{" "}
          <input
            type="date"
            aria-label={t("event.night_custom")}
            value={nightDate}
            onChange={(e) => {
              setNightDate(e.target.value);
              setNightChoice("custom");
            }}
          />
        </label>
      </fieldset>
      <div className="row">
        <button type="submit" className="primary" disabled={saver.state === "pending"}>
          {t("common.save")}
        </button>
        <button type="button" onClick={() => onDone(null)}>
          {t("common.cancel")}
        </button>
        <SaveStatus saver={saver} />
      </div>
    </form>
  );
}

function EventRow({ event, onChanged, onDeleted }: {
  event: JournalEvent;
  onChanged: (event: JournalEvent) => void;
  onDeleted: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const saver = useSaver();

  async function remove() {
    if (!window.confirm(t("event.delete.confirm"))) return;
    const done = await saver.run(() => api.deleteEvent(event.id).then(() => true));
    if (done) onDeleted(event.id);
  }

  return (
    <li className="event">
      <div className="event-line">
        <span className="event-time" title={offsetLabel(event.occurred_at.utc_offset_minutes)}>
          {timeOf(event.occurred_at.local)}
        </span>
        <span className="grow">
          {describe(event)}
          {event.favorite_id && <small> ★</small>}
          <br />
          <small className="hint">
            {t("event.night_label", { date: formatDate(event.night_start_date) })}
            {event.night_override && ` · ${t("event.night_manual")}`}
          </small>
        </span>
        <button type="button" onClick={() => setEditing(!editing)}>
          {t("common.edit")}
        </button>
        <button type="button" className="danger" onClick={() => void remove()}>
          {t("common.delete")}
        </button>
        <SuggestButton context={`event.${event.kind}.edit`} />
        <SaveStatus saver={saver} />
      </div>
      {editing && (
        <EventEditor
          event={event}
          onDone={(saved) => {
            setEditing(false);
            if (saved) onChanged(saved);
          }}
        />
      )}
    </li>
  );
}

export function EventList({ events, empty, onChanged, onDeleted }: {
  events: JournalEvent[];
  empty: string;
  onChanged: (event: JournalEvent) => void;
  onDeleted: (id: string) => void;
}) {
  if (events.length === 0) return <p className="hint">{empty}</p>;
  return (
    <ul className="events">
      {events.map((event) => (
        <EventRow key={event.id} event={event} onChanged={onChanged} onDeleted={onDeleted} />
      ))}
    </ul>
  );
}
