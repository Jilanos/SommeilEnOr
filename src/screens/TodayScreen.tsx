import { useEffect, useState } from "react";
import { currentTrackingDate } from "../time";
import { DayPage } from "./DayPage";
import { FavoritesScreen } from "./FavoritesScreen";

export function TodayScreen() {
  const [today, setToday] = useState(currentTrackingDate());
  const [favorites, setFavorites] = useState(false);
  useEffect(() => {
    const timer = window.setInterval(
      () => setToday(currentTrackingDate()),
      60_000,
    );
    return () => window.clearInterval(timer);
  }, []);
  if (favorites) return <FavoritesScreen onBack={() => setFavorites(false)} />;
  return (
    <DayPage
      key={today}
      date={today}
      today
      onManageFavorites={() => setFavorites(true)}
    />
  );
}
