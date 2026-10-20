import { useEffect, useState } from "react";
import { api, type Night, type Stress, type YesNo } from "../api";
import { t } from "../i18n";
import { STRESS, YES_NO, stressLabel, yesNoLabel } from "../labels";
import { formatDate } from "../time";
import { useSaver } from "../useSaver";
import { Choice } from "./Choice";
import { Field } from "./Field";

interface Props {
  night: Night;
  onChange: (night: Night) => void;
}

export function NightEditor({ night, onChange }: Props) {
  const catSaver = useSaver();
  const stressSaver = useSaver();
  const wakeSaver = useSaver();
  const [planned, setPlanned] = useState(night.early_wake_planned === "yes");
  const [target, setTarget] = useState(night.early_wake_target_time ?? "");
  const [reason, setReason] = useState(night.early_wake_reason ?? "");

  useEffect(() => {
    setPlanned(night.early_wake_planned === "yes");
    setTarget(night.early_wake_target_time ?? "");
    setReason(night.early_wake_reason ?? "");
  }, [night]);

  async function patch(saver: ReturnType<typeof useSaver>, body: Record<string, unknown>) {
    const saved = await saver.run(() => api.patchNight(night.start_date, body));
    if (saved) onChange(saved);
  }

  function chooseWake(value: YesNo) {
    if (value === "yes") {
      setPlanned(true);
      return;
    }
    setPlanned(false);
    void patch(wakeSaver, { early_wake_planned: value });
  }

  return (
    <section className="card">
      <h2>{t("night.title", { start: formatDate(night.start_date), end: formatDate(night.end_date) })}</h2>
      <p className="hint">{t("night.habitual")}</p>
      <Field label={t("night.cat")} context="night.cat" saver={catSaver}>
        <Choice<YesNo>
          label={t("night.cat")}
          value={night.cat_presence}
          options={YES_NO}
          optionLabel={yesNoLabel}
          onChange={(value) => void patch(catSaver, { cat_presence: value })}
        />
      </Field>
      <Field
        label={t("night.anticipated_stress", { date: formatDate(night.anticipated_stress_for_date) })}
        context="night.anticipated_stress"
        saver={stressSaver}
        hint={t("night.anticipated_stress_hint")}
      >
        <Choice<Stress>
          label={t("night.anticipated_stress", { date: formatDate(night.anticipated_stress_for_date) })}
          value={night.anticipated_stress}
          options={STRESS}
          optionLabel={stressLabel}
          onChange={(value) => void patch(stressSaver, { anticipated_stress: value })}
        />
      </Field>
      <Field label={t("night.early_wake")} context="night.early_wake" saver={wakeSaver} hint={t("night.early_wake_hint")}>
        <Choice<YesNo>
          label={t("night.early_wake")}
          value={planned ? "yes" : night.early_wake_planned}
          options={YES_NO}
          optionLabel={yesNoLabel}
          onChange={chooseWake}
        />
        {planned && (
          <form
            className="row"
            onSubmit={(event) => {
              event.preventDefault();
              void patch(wakeSaver, {
                early_wake_planned: "yes",
                early_wake_target_time: target,
                early_wake_reason: reason,
              });
            }}
          >
            <label>
              {t("night.early_wake_target")}{" "}
              <input type="time" required value={target} onChange={(event) => setTarget(event.target.value)} />
            </label>
            <label className="grow">
              {t("night.early_wake_reason")}{" "}
              <input type="text" maxLength={500} value={reason} onChange={(event) => setReason(event.target.value)} />
            </label>
            <button type="submit" className="primary" disabled={!target}>
              {t("common.save")}
            </button>
          </form>
        )}
      </Field>
    </section>
  );
}
