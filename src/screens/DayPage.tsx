import { useCallback, useEffect, useState } from "react";
import { api, type DayView, type JournalEvent } from "../api";
import { DayEditor } from "../components/DayEditor";
import { EventList } from "../components/EventList";
import { NightEditor } from "../components/NightEditor";
import { t } from "../i18n";
import { formatDate } from "../time";
import { errorMessage } from "../useSaver";

/** Tracking day context, its following night and its events; reloads when `version` changes. */
export function DayPage({ date, version }: { date: string; version: number }) {
  const [view, setView] = useState<DayView | null>(null);
  const [error, setError] = useState("");

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
  }, [load, version]);

  if (error) {
    return (
      <p className="error">
        {error} <button onClick={() => void load()}>{t("common.retry")}</button>
      </p>
    );
  }
  if (!view || view.tracking_date !== date) return <p className="hint">{t("common.loading")}</p>;

  const replace = (event: JournalEvent) => void load().then(() => event);
  const remove = () => void load();
  const reassignedIn = view.night_events.filter((event) => event.tracking_date !== date);

  return (
    <>
      <section className="card">
        <h2>{t("day.events", { date: formatDate(date) })}</h2>
        <EventList events={view.events} empty={t("day.events_empty")} onChanged={replace} onDeleted={remove} />
        {reassignedIn.length > 0 && (
          <>
            <h3>{t("night.reassigned_in")}</h3>
            <EventList events={reassignedIn} empty="" onChanged={replace} onDeleted={remove} />
          </>
        )}
      </section>
      <DayEditor day={view.day} onChange={(day) => setView({ ...view, day })} />
      <NightEditor night={view.night} onChange={(night) => setView({ ...view, night })} />
    </>
  );
}
