import type { MomentInput } from "../api";
import { t } from "../i18n";
import {
  offsetLabel,
  parisOffsetsFor,
  timeOf,
  wallTimeOnTrackingDay,
} from "../time";
import { TimeSelect } from "./TimeSelect";

/** Paris wall time "YYYY-MM-DDTHH:MM" (empty when unset), with an optional DST offset. */
export interface TimeValue {
  local: string;
  offset?: number;
}

export function customValue(local: string): TimeValue {
  return { local };
}

/** MomentInput for the API: Paris wall time, with the offset when it was chosen. */
export function toMomentInput(value: TimeValue): MomentInput {
  return value.offset === undefined
    ? { at: value.local }
    : { at: value.local, utc_offset_minutes: value.offset };
}

export function timeProblem(value: TimeValue): string | null {
  if (!value.local) return t("time.required");
  const offsets = parisOffsetsFor(value.local);
  if (offsets.length === 0) return t("time.nonexistent");
  if (offsets.length > 1 && value.offset === undefined)
    return t("time.ambiguous");
  return null;
}

interface Props {
  value: TimeValue;
  onChange: (value: TimeValue) => void;
  /** Tracking day of the time: hours before 04:00 fall on the next calendar date. */
  date: string;
  label?: string;
  disabled?: boolean;
}

/** Hour and quarter-hour of a tracking day, plus the hidden DST offset choice. */
export function TimeChooser({
  value,
  onChange,
  date,
  label = t("time.label"),
  disabled,
}: Props) {
  const offsets = value.local ? parisOffsetsFor(value.local) : [];
  const problem = value.local ? timeProblem(value) : null;
  return (
    <div className="time-chooser">
      <span className="field-label">{label}</span>
      <TimeSelect
        label={label}
        value={value.local ? timeOf(value.local) : ""}
        disabled={disabled}
        onChange={(hhmm) =>
          onChange(customValue(hhmm ? wallTimeOnTrackingDay(date, hhmm) : ""))
        }
      />
      {offsets.length > 1 && (
        <details className="advanced">
          <summary>{t("today.advanced")}</summary>
          <select
            aria-label={t("time.offset")}
            value={value.offset ?? ""}
            onChange={(event) =>
              onChange({
                ...value,
                offset: event.target.value
                  ? Number(event.target.value)
                  : undefined,
              })
            }
          >
            <option value="">{t("time.offset_choose")}</option>
            {offsets.map((offset) => (
              <option key={offset} value={offset}>
                {offsetLabel(offset)}{" "}
                {offset === 120
                  ? t("time.offset_summer")
                  : t("time.offset_winter")}
              </option>
            ))}
          </select>
        </details>
      )}
      {problem && <span className="error">{problem}</span>}
    </div>
  );
}
