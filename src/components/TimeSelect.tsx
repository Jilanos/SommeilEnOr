import { useState } from "react";
import { t } from "../i18n";

const HOURS = Array.from({ length: 24 }, (_, hour) =>
  String(hour).padStart(2, "0"),
);
export const QUARTERS = ["00", "15", "30", "45"];

/**
 * Two-step "HH:MM" picker: hour first, then a quarter of an hour.
 * An empty value shows both placeholders; an off-grid minute is shown as-is.
 */
export function TimeSelect({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (hhmm: string) => void;
  disabled?: boolean;
}) {
  const [hour, minute] = value ? value.split(":") : ["", ""];
  // A minute picked before the hour waits locally until the hour completes it.
  const [pendingMinute, setPendingMinute] = useState("");
  const shownMinute = minute || pendingMinute;
  const minutes =
    minute && !QUARTERS.includes(minute) ? [...QUARTERS, minute].sort() : QUARTERS;
  return (
    <span className="time-select" role="group" aria-label={label}>
      <select
        aria-label={t("time.hour", { label })}
        value={hour}
        disabled={disabled}
        onChange={(event) => {
          const next = event.target.value;
          setPendingMinute("");
          onChange(next ? `${next}:${shownMinute || "00"}` : "");
        }}
      >
        <option value="">--</option>
        {HOURS.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <span aria-hidden="true">h</span>
      <select
        aria-label={t("time.minutes", { label })}
        value={shownMinute}
        disabled={disabled}
        onChange={(event) => {
          const next = event.target.value;
          if (hour) onChange(`${hour}:${next}`);
          else setPendingMinute(next);
        }}
      >
        {!shownMinute && <option value="">--</option>}
        {minutes.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </span>
  );
}
