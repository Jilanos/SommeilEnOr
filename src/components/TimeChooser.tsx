import type { MomentInput } from "../api";
import { t } from "../i18n";
import { offsetLabel, parisLocalInput, parisOffsetsFor } from "../time";

export interface TimeValue {
  mode: "now" | "custom";
  local: string;
  offset?: number;
}

export function nowValue(): TimeValue {
  return { mode: "now", local: parisLocalInput() };
}

export function customValue(local: string): TimeValue {
  return { mode: "custom", local };
}

/** MomentInput for the API: an actual instant for "now", Paris wall time otherwise. */
export function toMomentInput(value: TimeValue): MomentInput {
  if (value.mode === "now") return { at: new Date().toISOString() };
  return value.offset === undefined ? { at: value.local } : { at: value.local, utc_offset_minutes: value.offset };
}

export function timeProblem(value: TimeValue): string | null {
  if (value.mode === "now") return null;
  if (!value.local) return t("time.required");
  const offsets = parisOffsetsFor(value.local);
  if (offsets.length === 0) return t("time.nonexistent");
  if (offsets.length > 1 && value.offset === undefined) return t("time.ambiguous");
  return null;
}

interface Props {
  value: TimeValue;
  onChange: (value: TimeValue) => void;
  label?: string;
  allowNow?: boolean;
}

export function TimeChooser({ value, onChange, label = t("time.label"), allowNow = true }: Props) {
  const offsets = value.mode === "custom" && value.local ? parisOffsetsFor(value.local) : [];
  return (
    <div className="time-chooser">
      <span className="field-label">{label}</span>
      {allowNow && (
        <div className="choice">
          <button
            type="button"
            className={value.mode === "now" ? "chip chip-on" : "chip"}
            aria-pressed={value.mode === "now"}
            onClick={() => onChange(nowValue())}
          >
            {t("time.now")}
          </button>
          <button
            type="button"
            className={value.mode === "custom" ? "chip chip-on" : "chip"}
            aria-pressed={value.mode === "custom"}
            onClick={() => onChange(customValue(parisLocalInput()))}
          >
            {t("time.other")}
          </button>
        </div>
      )}
      {value.mode === "custom" && (
        <input
          type="datetime-local"
          aria-label={label}
          value={value.local}
          onChange={(event) => onChange(customValue(event.target.value))}
        />
      )}
      {offsets.length > 1 && (
        <select
          aria-label={t("time.offset")}
          value={value.offset ?? ""}
          onChange={(event) => onChange({ ...value, offset: event.target.value ? Number(event.target.value) : undefined })}
        >
          <option value="">{t("time.offset_choose")}</option>
          {offsets.map((offset) => (
            <option key={offset} value={offset}>
              {offsetLabel(offset)} {offset === 120 ? t("time.offset_summer") : t("time.offset_winter")}
            </option>
          ))}
        </select>
      )}
      {timeProblem(value) && value.mode === "custom" && value.local && <span className="error">{timeProblem(value)}</span>}
    </div>
  );
}
