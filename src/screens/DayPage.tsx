import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  api,
  type DayView,
  type EventKind,
  type Favorite,
  type JournalEvent,
} from "../api";
import { CaptureSheet, EventChips } from "../components/Capture";
import { Choice } from "../components/Choice";
import { SaveStatus } from "../components/SaveStatus";
import { SectionHelp } from "../components/SectionHelp";
import {
  customValue,
  TimeChooser,
  timeProblem,
  toMomentInput,
  type TimeValue,
} from "../components/TimeChooser";
import { TimeSelect } from "../components/TimeSelect";
import { t } from "../i18n";
import {
  DINNER_QUANTITIES,
  STRESS,
  YES_NO,
  dinnerLabel,
  stressLabel,
  yesNoLabel,
} from "../labels";
import { formatCaptureDate, timeOf, wallTimeOnTrackingDay } from "../time";
import { errorMessage, useSaver } from "../useSaver";

function Question({
  label,
  answered,
  children,
  wide = false,
}: {
  label: string;
  answered: boolean;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className={`question${answered ? " answered" : ""}${wide ? " question-wide" : ""}`}
    >
      <span className="question-label">
        {answered && (
          <span className="answer-check" aria-label={t("today.answered")}>
            ✓{" "}
          </span>
        )}
        {label}
      </span>
      <div className="question-controls">{children}</div>
    </div>
  );
}

/** Toggle the pressed answer off; unknown is stored, never a visible option. */
function Answer<T extends string>({
  label,
  value,
  options,
  optionLabel,
  onChange,
  disabled,
}: {
  label: string;
  value: T;
  options: readonly T[];
  optionLabel: (value: T) => string;
  onChange: (value: T) => void;
  disabled: boolean;
}) {
  return (
    <Choice
      label={label}
      value={value}
      options={options.filter((option) => option !== "unknown")}
      optionLabel={optionLabel}
      disabled={disabled}
      onChange={(next) => onChange(next === value ? ("unknown" as T) : next)}
    />
  );
}

/** Shared context editor also keeps unrestricted historical capture and corrections. */
export function DayPage({
  date,
  today = false,
  onManageFavorites,
}: {
  date: string;
  today?: boolean;
  onManageFavorites?: () => void;
}) {
  const [view, setView] = useState<DayView | null>(null);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [error, setError] = useState("");
  const [sheet, setSheet] = useState<{
    kind: EventKind;
    event?: JournalEvent;
  } | null>(null);
  const [ambiguousTime, setAmbiguousTime] = useState<{
    field: "dinner_at" | "late_sugar_at";
    value: TimeValue;
  } | null>(null);
  const saver = useSaver();
  const load = useCallback(async () => {
    try {
      setView(await api.dayView(date));
      setError("");
    } catch (failure) {
      setError(errorMessage(failure));
    }
  }, [date]);
  useEffect(() => {
    void load();
    api.favorites().then(setFavorites, () => undefined);
  }, [load]);

  if (error)
    return (
      <p className="error">
        {error} <button onClick={() => void load()}>{t("common.retry")}</button>
      </p>
    );
  if (!view || view.tracking_date !== date)
    return <p className="hint">{t("common.loading")}</p>;
  const { day, night } = view;
  const pending = saver.state === "pending";
  async function patchDay(body: Record<string, unknown>) {
    const saved = await saver.run(() => api.patchDay(date, body));
    if (saved)
      setView((current) => (current ? { ...current, day: saved } : current));
  }
  async function patchNight(body: Record<string, unknown>) {
    const saved = await saver.run(() => api.patchNight(date, body));
    if (saved)
      setView((current) => (current ? { ...current, night: saved } : current));
  }
  function changeMoment(field: "dinner_at" | "late_sugar_at", time: string) {
    if (!time) {
      setAmbiguousTime(null);
      void patchDay({ [field]: null });
      return;
    }
    const value = customValue(wallTimeOnTrackingDay(date, time));
    if (timeProblem(value)) {
      setAmbiguousTime({ field, value });
      return;
    }
    setAmbiguousTime(null);
    void patchDay({ [field]: toMomentInput(value) });
  }
  const dinnerAnswered = !!day.dinner_at || day.dinner_quantity !== "unknown";
  const answered = [
    dinnerAnswered,
    day.alcohol !== "unknown",
    day.late_sugar !== "unknown",
    day.evening_noncaffeinated_drink !== "unknown",
    day.experienced_stress !== "unknown",
    night.anticipated_stress !== "unknown",
    night.cat_presence !== "unknown",
    night.early_wake_planned !== "unknown",
  ].filter(Boolean).length;
  const edit = (event: JournalEvent) => setSheet({ kind: event.kind, event });
  const savedEvent = (event: JournalEvent) => {
    setView((current) =>
      current
        ? {
            ...current,
            events: [
              ...current.events.filter((item) => item.id !== event.id),
              ...(event.tracking_date === date ? [event] : []),
            ].sort((a, b) =>
              a.occurred_at.utc.localeCompare(b.occurred_at.utc),
            ),
            night_events: [
              ...current.night_events.filter((item) => item.id !== event.id),
              ...(event.night_start_date === date ? [event] : []),
            ],
          }
        : current,
    );
  };
  const yesNo = (
    label: string,
    value: typeof day.alcohol,
    change: (value: typeof day.alcohol) => void,
  ) => (
    <Answer
      label={label}
      value={value}
      options={YES_NO}
      optionLabel={yesNoLabel}
      onChange={change}
      disabled={pending}
    />
  );
  return (
    <div className="journal-page">
      <header className="journal-heading">
        <div>
          <h1>
            {today ? t("nav.today") : t("today.journal")}{" "}
            <span>· {formatCaptureDate(date)}</span>
          </h1>
          <p className="hint">{t("today.subtitle")}</p>
        </div>
        <span
          className="progress"
          role="status"
          aria-label={t("today.progress", { count: answered })}
        >
          {answered}/8 <span aria-hidden="true">✓</span>
        </span>
      </header>
      {!sheet && (
        <div className="global-save">
          <SaveStatus saver={saver} />
        </div>
      )}
      <section className="card quick-capture" aria-label={t("today.quick")}>
        <div className="section-heading">
          <h2>{t("today.quick")}</h2>
          <SectionHelp
            section={t("today.quick")}
            context="capture"
            text={t("today.quick_help")}
          />
        </div>
        <div className="quick-actions">
          {(["drink", "activity", "nap"] as const).map((kind) => (
            <button
              type="button"
              key={kind}
              className="quick"
              onClick={() => setSheet({ kind })}
            >
              ＋{" "}
              {kind === "drink"
                ? t("kind.drink")
                : kind === "activity"
                  ? t("today.sport")
                  : t("kind.nap")}
            </button>
          ))}
        </div>
        {view.events.length ? (
          <EventChips events={view.events} onEdit={edit} />
        ) : (
          <p className="empty-entries">{t("today.empty")}</p>
        )}
      </section>
      <section className="card context-section" aria-labelledby="evening-title">
        <div className="section-heading">
          <h2 id="evening-title">{t("today.evening")}</h2>
          <SectionHelp
            section={t("today.evening")}
            context="day.evening"
            text={t("today.evening_help")}
          />
        </div>
        <Question label={t("day.dinner")} answered={dinnerAnswered} wide>
          <TimeSelect
            label={t("day.dinner_time")}
            disabled={pending}
            value={
              ambiguousTime?.field === "dinner_at"
                ? timeOf(ambiguousTime.value.local)
                : day.dinner_at
                  ? timeOf(day.dinner_at.local)
                  : ""
            }
            onChange={(hhmm) => changeMoment("dinner_at", hhmm)}
          />
          <Answer
            label={t("day.dinner_quantity")}
            value={day.dinner_quantity}
            options={DINNER_QUANTITIES}
            optionLabel={dinnerLabel}
            disabled={pending}
            onChange={(value) => void patchDay({ dinner_quantity: value })}
          />
        </Question>
        <Question label={t("day.alcohol")} answered={day.alcohol !== "unknown"}>
          {yesNo(
            t("day.alcohol"),
            day.alcohol,
            (value) => void patchDay({ alcohol: value }),
          )}
        </Question>
        <Question
          label={t("day.late_sugar")}
          answered={day.late_sugar !== "unknown"}
        >
          {yesNo(
            t("day.late_sugar"),
            day.late_sugar,
            (value) => void patchDay({ late_sugar: value }),
          )}
          {day.late_sugar === "yes" && (
            <div className="optional-time">
              <span aria-hidden="true">{t("today.optional_time")}</span>
              <TimeSelect
                label={t("day.late_sugar_time")}
                disabled={pending}
                value={
                  ambiguousTime?.field === "late_sugar_at"
                    ? timeOf(ambiguousTime.value.local)
                    : day.late_sugar_at
                      ? timeOf(day.late_sugar_at.local)
                      : ""
                }
                onChange={(hhmm) => changeMoment("late_sugar_at", hhmm)}
              />
            </div>
          )}
        </Question>
        <Question
          label={t("day.evening_drink")}
          answered={day.evening_noncaffeinated_drink !== "unknown"}
        >
          {yesNo(
            t("day.evening_drink"),
            day.evening_noncaffeinated_drink,
            (value) => void patchDay({ evening_noncaffeinated_drink: value }),
          )}
        </Question>
      </section>
      <section className="card context-section" aria-labelledby="night-title">
        <div className="section-heading">
          <h2 id="night-title">{t("today.night")}</h2>
          <SectionHelp
            section={t("today.night")}
            context="night"
            text={t("today.night_help")}
          />
        </div>
        <Question
          label={t("day.experienced_stress")}
          answered={day.experienced_stress !== "unknown"}
        >
          <Answer
            label={t("day.experienced_stress")}
            value={day.experienced_stress}
            options={STRESS}
            optionLabel={stressLabel}
            disabled={pending}
            onChange={(value) => void patchDay({ experienced_stress: value })}
          />
        </Question>
        <Question
          label={t("today.tomorrow_stress")}
          answered={night.anticipated_stress !== "unknown"}
        >
          <Answer
            label={t("today.tomorrow_stress")}
            value={night.anticipated_stress}
            options={STRESS}
            optionLabel={stressLabel}
            disabled={pending}
            onChange={(value) => void patchNight({ anticipated_stress: value })}
          />
        </Question>
        <Question
          label={t("night.cat")}
          answered={night.cat_presence !== "unknown"}
        >
          {yesNo(
            t("night.cat"),
            night.cat_presence,
            (value) => void patchNight({ cat_presence: value }),
          )}
        </Question>
        <Question
          label={t("night.early_wake")}
          answered={night.early_wake_planned !== "unknown"}
        >
          {yesNo(
            t("night.early_wake"),
            night.early_wake_planned,
            (value) => void patchNight({ early_wake_planned: value }),
          )}
          {night.early_wake_planned === "yes" && (
            <div className="optional-time">
              <span aria-hidden="true">{t("night.early_wake_target")}</span>
              <TimeSelect
                label={t("night.early_wake_target")}
                disabled={pending}
                value={night.early_wake_target_time ?? ""}
                onChange={(hhmm) =>
                  void patchNight({ early_wake_target_time: hhmm || null })
                }
              />
            </div>
          )}
        </Question>
      </section>
      {ambiguousTime && (
        <p className="error" role="alert">
          {timeProblem(ambiguousTime.value)} {t("today.resolve_time")}
        </p>
      )}
      <details className="advanced card">
        <summary>{t("today.advanced")}</summary>
        <Question label={t("day.gluten")} answered={day.gluten !== "unknown"}>
          {yesNo(
            t("day.gluten"),
            day.gluten,
            (value) => void patchDay({ gluten: value }),
          )}
        </Question>
        {night.early_wake_planned === "yes" && (
          <label className="stack">
            {t("night.early_wake_reason")}
            <input
              type="text"
              maxLength={500}
              defaultValue={night.early_wake_reason ?? ""}
              onChange={(e) => {
                if (e.target.value !== (night.early_wake_reason ?? ""))
                  void patchNight({
                    early_wake_reason: e.target.value || null,
                  });
              }}
            />
          </label>
        )}
        {ambiguousTime && (
          <TimeChooser
            date={date}
            value={ambiguousTime.value}
            onChange={(value) => {
              setAmbiguousTime({ ...ambiguousTime, value });
              if (!timeProblem(value)) {
                void patchDay({ [ambiguousTime.field]: toMomentInput(value) });
                setAmbiguousTime(null);
              }
            }}
          />
        )}
        <p className="hint">{t("today.advanced_help")}</p>
        {view.night_events.some((event) => event.tracking_date !== date) && (
          <>
            <h3>{t("night.reassigned_in")}</h3>
            <EventChips
              events={view.night_events.filter(
                (event) => event.tracking_date !== date,
              )}
              onEdit={edit}
            />
          </>
        )}
        {onManageFavorites && (
          <button type="button" onClick={onManageFavorites}>
            {t("today.manage_favorites")}
          </button>
        )}
      </details>
      {sheet && (
        <CaptureSheet
          key={sheet.event?.id ?? sheet.kind}
          kind={sheet.kind}
          event={sheet.event}
          date={date}
          favorites={favorites}
          saver={saver}
          onSaved={savedEvent}
          onDeleted={(id) =>
            setView((current) =>
              current
                ? {
                    ...current,
                    events: current.events.filter((event) => event.id !== id),
                    night_events: current.night_events.filter(
                      (event) => event.id !== id,
                    ),
                  }
                : current,
            )
          }
          onClose={() => setSheet(null)}
        />
      )}
    </div>
  );
}
