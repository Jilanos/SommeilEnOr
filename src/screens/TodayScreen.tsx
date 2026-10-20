import { useEffect, useState } from "react";
import { api, type Favorite } from "../api";
import { ActivityCapture, DrinkCapture, NapCapture } from "../components/Capture";
import { TimeChooser, nowValue, type TimeValue } from "../components/TimeChooser";
import { t } from "../i18n";
import { currentTrackingDate, formatDate, trackingDateOf } from "../time";
import { DayPage } from "./DayPage";

export function TodayScreen() {
  const [time, setTime] = useState<TimeValue>(nowValue());
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [version, setVersion] = useState(0);
  const [today, setToday] = useState(currentTrackingDate());

  useEffect(() => {
    api.favorites().then(setFavorites, () => undefined);
    const timer = window.setInterval(() => setToday(currentTrackingDate()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const target = time.mode === "now" ? today : time.local ? trackingDateOf(time.local) : today;
  const saved = () => setVersion((v) => v + 1);

  return (
    <>
      <section className="card sticky-time">
        <TimeChooser value={time} onChange={setTime} />
        <p className="hint">{t("capture.tracking_day", { date: formatDate(target) })}</p>
      </section>
      <DrinkCapture time={time} onSaved={saved} favorites={favorites} onFavoritesChange={setFavorites} />
      <ActivityCapture time={time} onSaved={saved} />
      <NapCapture time={time} onSaved={saved} />
      <DayPage date={today} version={version} />
    </>
  );
}
