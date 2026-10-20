import { useState } from "react";
import {
  ACTIVITY_TYPES,
  DRINK_TYPES,
  INTENSITIES,
  api,
  type ActivityType,
  type DrinkType,
  type Favorite,
  type Intensity,
  type JournalEvent,
} from "../api";
import { t } from "../i18n";
import { activityLabel, drinkLabel, intensityLabel } from "../labels";
import { useSaver } from "../useSaver";
import { Choice } from "./Choice";
import { Field } from "./Field";
import { timeProblem, toMomentInput, type TimeValue } from "./TimeChooser";

interface CaptureProps {
  time: TimeValue;
  onSaved: (event: JournalEvent) => void;
}

export function DrinkCapture({
  time,
  onSaved,
  favorites,
  onFavoritesChange,
}: CaptureProps & { favorites: Favorite[]; onFavoritesChange: (favorites: Favorite[]) => void }) {
  const saver = useSaver();
  const favoriteSaver = useSaver();
  const [volume, setVolume] = useState("250");
  const [showFavoriteForm, setShowFavoriteForm] = useState(false);
  const [favorite, setFavorite] = useState<{ label: string; drink_type: DrinkType; volume: string }>({
    label: "",
    drink_type: "green_tea",
    volume: "250",
  });
  const problem = timeProblem(time);
  const volumeValue = Number(volume);
  const volumeValid = Number.isFinite(volumeValue) && volumeValue > 0;

  async function addDrink(drink_type: DrinkType) {
    if (problem || !volumeValid) return;
    const saved = await saver.run(() =>
      api.createEvent({ kind: "drink", occurred_at: toMomentInput(time), drink_type, volume_ml: volumeValue }),
    );
    if (saved) onSaved(saved);
  }

  async function useFavorite(item: Favorite) {
    if (problem) return;
    const saved = await saver.run(() => api.useFavorite(item.id, toMomentInput(time)));
    if (saved) onSaved(saved);
  }

  async function createFavorite(event: React.FormEvent) {
    event.preventDefault();
    const created = await favoriteSaver.run(() =>
      api.createFavorite({ label: favorite.label.trim(), drink_type: favorite.drink_type, volume_ml: Number(favorite.volume) }),
    );
    if (created) {
      onFavoritesChange([...favorites, created]);
      setShowFavoriteForm(false);
      setFavorite({ label: "", drink_type: "green_tea", volume: "250" });
    }
  }

  async function removeFavorite(item: Favorite) {
    if (!window.confirm(t("favorite.delete_confirm", { label: item.label }))) return;
    const done = await favoriteSaver.run(() => api.deleteFavorite(item.id).then(() => true));
    if (done) onFavoritesChange(favorites.filter((f) => f.id !== item.id));
  }

  return (
    <section className="card">
      <h2>{t("capture.drinks")}</h2>
      <Field label={t("capture.drink.add")} context="drink.add" saver={saver} hint={t("capture.drink.hint")}>
        <label className="row">
          {t("capture.volume")}{" "}
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={5000}
            value={volume}
            onChange={(event) => setVolume(event.target.value)}
            className="narrow"
          />{" "}
          ml
        </label>
        {!volumeValid && <span className="error">{t("capture.volume_invalid")}</span>}
        <div className="quick-grid">
          {DRINK_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              className="quick"
              disabled={!!problem || !volumeValid || saver.state === "pending"}
              onClick={() => void addDrink(type)}
            >
              {drinkLabel(type)}
            </button>
          ))}
        </div>
      </Field>
      <Field label={t("favorite.title")} context="favorite.use" saver={favoriteSaver} hint={t("favorite.hint")}>
        <div className="quick-grid">
          {favorites.map((item) => (
            <span key={item.id} className="favorite">
              <button
                type="button"
                className="quick"
                disabled={!!problem || saver.state === "pending"}
                onClick={() => void useFavorite(item)}
              >
                ★ {item.label}
                <small>
                  {drinkLabel(item.drink_type)} · {item.volume_ml} ml
                </small>
              </button>
              <button
                type="button"
                className="icon"
                aria-label={t("favorite.delete", { label: item.label })}
                onClick={() => void removeFavorite(item)}
              >
                ✕
              </button>
            </span>
          ))}
          {favorites.length === 0 && <span className="hint">{t("favorite.empty")}</span>}
        </div>
        {showFavoriteForm ? (
          <form className="stack" onSubmit={createFavorite}>
            <input
              type="text"
              required
              maxLength={80}
              placeholder={t("favorite.label")}
              aria-label={t("favorite.label")}
              value={favorite.label}
              onChange={(event) => setFavorite({ ...favorite, label: event.target.value })}
            />
            <Choice<DrinkType>
              label={t("favorite.drink")}
              value={favorite.drink_type}
              options={DRINK_TYPES}
              optionLabel={drinkLabel}
              onChange={(drink_type) => setFavorite({ ...favorite, drink_type })}
            />
            <label className="row">
              {t("capture.volume")}{" "}
              <input
                type="number"
                min={1}
                max={5000}
                required
                className="narrow"
                value={favorite.volume}
                onChange={(event) => setFavorite({ ...favorite, volume: event.target.value })}
              />{" "}
              ml
            </label>
            <div className="row">
              <button type="submit" className="primary">
                {t("common.save")}
              </button>
              <button type="button" onClick={() => setShowFavoriteForm(false)}>
                {t("common.cancel")}
              </button>
            </div>
          </form>
        ) : (
          <button type="button" onClick={() => setShowFavoriteForm(true)}>
            {t("favorite.new")}
          </button>
        )}
      </Field>
    </section>
  );
}

export function ActivityCapture({ time, onSaved }: CaptureProps) {
  const saver = useSaver();
  const [type, setType] = useState<ActivityType>("walking");
  const [intensity, setIntensity] = useState<Intensity>("medium");
  const [duration, setDuration] = useState("30");
  const problem = timeProblem(time);
  const minutes = Number(duration);
  const valid = Number.isInteger(minutes) && minutes > 0;

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (problem || !valid) return;
    const saved = await saver.run(() =>
      api.createEvent({
        kind: "activity",
        occurred_at: toMomentInput(time),
        activity_type: type,
        intensity,
        duration_minutes: minutes,
      }),
    );
    if (saved) onSaved(saved);
  }

  return (
    <section className="card">
      <h2>{t("capture.activity")}</h2>
      <Field label={t("capture.activity_add")} context="activity.add" saver={saver} hint={t("capture.activity_hint")}>
        <form className="stack" onSubmit={save}>
          <Choice<ActivityType> label={t("capture.activity_type")} value={type} options={ACTIVITY_TYPES} optionLabel={activityLabel} onChange={setType} />
          <Choice<Intensity> label={t("capture.intensity")} value={intensity} options={INTENSITIES} optionLabel={intensityLabel} onChange={setIntensity} />
          <label className="row">
            {t("capture.duration")}{" "}
            <input type="number" min={1} max={1440} className="narrow" value={duration} onChange={(event) => setDuration(event.target.value)} />{" "}
            min
          </label>
          {!valid && <span className="error">{t("capture.duration_invalid")}</span>}
          <button type="submit" className="primary" disabled={!!problem || !valid || saver.state === "pending"}>
            {t("capture.activity_save")}
          </button>
        </form>
      </Field>
    </section>
  );
}

export function NapCapture({ time, onSaved }: CaptureProps) {
  const saver = useSaver();
  const [duration, setDuration] = useState("20");
  const problem = timeProblem(time);
  const minutes = Number(duration);
  const valid = Number.isInteger(minutes) && minutes > 0;

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (problem || !valid) return;
    const saved = await saver.run(() =>
      api.createEvent({ kind: "nap", occurred_at: toMomentInput(time), duration_minutes: minutes }),
    );
    if (saved) onSaved(saved);
  }

  return (
    <section className="card">
      <h2>{t("capture.nap")}</h2>
      <Field label={t("capture.nap_add")} context="nap.add" saver={saver} hint={t("capture.nap_hint")}>
        <form className="row" onSubmit={save}>
          <label>
            {t("capture.duration")}{" "}
            <input type="number" min={1} max={1440} className="narrow" value={duration} onChange={(event) => setDuration(event.target.value)} />{" "}
            min
          </label>
          <button type="submit" className="primary" disabled={!!problem || !valid || saver.state === "pending"}>
            {t("capture.nap_save")}
          </button>
        </form>
        {!valid && <span className="error">{t("capture.duration_invalid")}</span>}
      </Field>
    </section>
  );
}
