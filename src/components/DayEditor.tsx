import { useEffect, useState } from "react";
import { api, type Day, type DinnerQuantity, type Stress, type YesNo } from "../api";
import { t } from "../i18n";
import { DINNER_QUANTITIES, STRESS, YES_NO, dinnerLabel, stressLabel, yesNoLabel } from "../labels";
import { addDays, formatDate, timeOf } from "../time";
import { useSaver } from "../useSaver";
import { Choice } from "./Choice";
import { Field } from "./Field";

/** Wall time on a tracking day: times before 04:00 fall on the next calendar date. */
export function wallTimeOnTrackingDay(trackingDate: string, hhmm: string): string {
  const date = Number(hhmm.slice(0, 2)) < 4 ? addDays(trackingDate, 1) : trackingDate;
  return `${date}T${hhmm}`;
}

interface Props {
  day: Day;
  onChange: (day: Day) => void;
}

function YesNoField({ day, field, label, context, onChange }: {
  day: Day;
  field: "alcohol" | "gluten" | "evening_noncaffeinated_drink";
  label: string;
  context: string;
  onChange: (day: Day) => void;
}) {
  const saver = useSaver();
  async function choose(value: YesNo) {
    const saved = await saver.run(() => api.patchDay(day.tracking_date, { [field]: value }));
    if (saved) onChange(saved);
  }
  return (
    <Field label={label} context={context} saver={saver}>
      <Choice label={label} value={day[field]} options={YES_NO} optionLabel={yesNoLabel} onChange={choose} />
    </Field>
  );
}

export function DayEditor({ day, onChange }: Props) {
  const date = day.tracking_date;
  const stressSaver = useSaver();
  const dinnerSaver = useSaver();
  const sugarSaver = useSaver();
  const [dinnerTime, setDinnerTime] = useState(day.dinner_at ? timeOf(day.dinner_at.local) : "");
  const [sugarTime, setSugarTime] = useState(day.late_sugar_at ? timeOf(day.late_sugar_at.local) : "");
  const [sugarYes, setSugarYes] = useState(day.late_sugar === "yes");

  useEffect(() => {
    setDinnerTime(day.dinner_at ? timeOf(day.dinner_at.local) : "");
    setSugarTime(day.late_sugar_at ? timeOf(day.late_sugar_at.local) : "");
    setSugarYes(day.late_sugar === "yes");
  }, [day]);

  async function patch(saver: ReturnType<typeof useSaver>, body: Record<string, unknown>) {
    const saved = await saver.run(() => api.patchDay(date, body));
    if (saved) onChange(saved);
  }

  function chooseSugar(value: YesNo) {
    if (value === "yes") {
      setSugarYes(true);
      if (sugarTime) void patch(sugarSaver, { late_sugar: "yes", late_sugar_at: { at: wallTimeOnTrackingDay(date, sugarTime) } });
      return;
    }
    setSugarYes(false);
    void patch(sugarSaver, { late_sugar: value });
  }

  return (
    <section className="card">
      <h2>{t("day.title", { date: formatDate(date) })}</h2>
      <Field label={t("day.dinner")} context="day.dinner" saver={dinnerSaver}>
        <div className="row">
          <input
            type="time"
            aria-label={t("day.dinner_time")}
            value={dinnerTime}
            onChange={(event) => setDinnerTime(event.target.value)}
            onBlur={() => {
              const current = day.dinner_at ? timeOf(day.dinner_at.local) : "";
              if (dinnerTime === current) return;
              void patch(dinnerSaver, { dinner_at: dinnerTime ? { at: wallTimeOnTrackingDay(date, dinnerTime) } : null });
            }}
          />
        </div>
        <Choice<DinnerQuantity>
          label={t("day.dinner_quantity")}
          value={day.dinner_quantity}
          options={DINNER_QUANTITIES}
          optionLabel={dinnerLabel}
          onChange={(value) => void patch(dinnerSaver, { dinner_quantity: value })}
        />
      </Field>
      <YesNoField day={day} field="alcohol" label={t("day.alcohol")} context="day.alcohol" onChange={onChange} />
      <YesNoField day={day} field="gluten" label={t("day.gluten")} context="day.gluten" onChange={onChange} />
      <Field label={t("day.late_sugar")} context="day.late_sugar" saver={sugarSaver} hint={t("day.late_sugar_hint")}>
        <Choice<YesNo>
          label={t("day.late_sugar")}
          value={sugarYes ? "yes" : day.late_sugar}
          options={YES_NO}
          optionLabel={yesNoLabel}
          onChange={chooseSugar}
        />
        {sugarYes && (
          <div className="row">
            <label>
              {t("day.late_sugar_time")}{" "}
              <input
                type="time"
                value={sugarTime}
                onChange={(event) => setSugarTime(event.target.value)}
                onBlur={() => {
                  const current = day.late_sugar_at ? timeOf(day.late_sugar_at.local) : "";
                  if (!sugarTime || sugarTime === current) return;
                  void patch(sugarSaver, { late_sugar: "yes", late_sugar_at: { at: wallTimeOnTrackingDay(date, sugarTime) } });
                }}
              />
            </label>
            {!sugarTime && <span className="hint">{t("day.late_sugar_time_needed")}</span>}
          </div>
        )}
      </Field>
      <YesNoField
        day={day}
        field="evening_noncaffeinated_drink"
        label={t("day.evening_drink")}
        context="day.evening_drink"
        onChange={onChange}
      />
      <Field label={t("day.experienced_stress")} context="day.experienced_stress" saver={stressSaver}>
        <Choice<Stress>
          label={t("day.experienced_stress")}
          value={day.experienced_stress}
          options={STRESS}
          optionLabel={stressLabel}
          onChange={(value) => void patch(stressSaver, { experienced_stress: value })}
        />
      </Field>
    </section>
  );
}
