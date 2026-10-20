import { useEffect, useState } from "react";
import { api } from "../api";
import { SuggestButton } from "../components/SuggestButton";
import { t } from "../i18n";
import { addDays, currentTrackingDate, formatDate } from "../time";
import { DayPage } from "./DayPage";

export function HistoryScreen() {
  const [date, setDate] = useState(addDays(currentTrackingDate(), -1));
  const [dates, setDates] = useState<string[]>([]);

  useEffect(() => {
    api.trackingDays().then(setDates, () => undefined);
  }, [date]);

  return (
    <>
      <section className="card">
        <div className="row">
          <button type="button" onClick={() => setDate(addDays(date, -1))} aria-label={t("history.previous")}>
            ←
          </button>
          <input type="date" aria-label={t("history.date")} value={date} onChange={(e) => e.target.value && setDate(e.target.value)} />
          <button type="button" onClick={() => setDate(addDays(date, 1))} aria-label={t("history.next")}>
            →
          </button>
          <SuggestButton context="history.navigate" />
        </div>
        <p className="hint">{t("history.hint", { date: formatDate(date) })}</p>
        {dates.length > 0 && (
          <div className="choice wrap" aria-label={t("history.recorded")}>
            {dates.slice(0, 30).map((item) => (
              <button key={item} type="button" className={item === date ? "chip chip-on" : "chip"} onClick={() => setDate(item)}>
                {item}
              </button>
            ))}
          </div>
        )}
      </section>
      <DayPage date={date} version={0} />
    </>
  );
}
