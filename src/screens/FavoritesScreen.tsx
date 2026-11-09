import { useEffect, useState } from "react";
import { api, DRINK_TYPES, type DrinkType, type Favorite } from "../api";
import { Choice } from "../components/Choice";
import { SaveStatus } from "../components/SaveStatus";
import { t } from "../i18n";
import { drinkLabel } from "../labels";
import { errorMessage, useSaver } from "../useSaver";

export function FavoritesScreen({ onBack }: { onBack: () => void }) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [label, setLabel] = useState("");
  const [drink, setDrink] = useState<DrinkType>("green_tea");
  const [volume, setVolume] = useState("250");
  const [error, setError] = useState("");
  const saver = useSaver();
  const load = () =>
    api.favorites().then(
      (items) => {
        setFavorites(items);
        setError("");
      },
      (failure) => setError(errorMessage(failure)),
    );
  useEffect(() => {
    void load();
  }, []);
  return (
    <section className="card favorites-page">
      <div className="section-heading">
        <h1>{t("favorite.title")}</h1>
        <button type="button" onClick={onBack}>
          {t("today.back")}
        </button>
      </div>
      <SaveStatus saver={saver} />
      {error && (
        <p className="error">
          {error}
          <button onClick={() => void load()}>{t("common.retry")}</button>
        </p>
      )}
      <p className="hint">{t("favorite.hint")}</p>
      <ul className="events">
        {favorites.map((favorite) => (
          <li className="event row" key={favorite.id}>
            <span className="grow">
              {favorite.label}
              <small>
                {" "}
                · {drinkLabel(favorite.drink_type)} · {favorite.volume_ml} ml
              </small>
            </span>
            <button
              type="button"
              aria-label={t("favorite.delete", { label: favorite.label })}
              disabled={saver.state === "pending"}
              onClick={async () => {
                if (
                  !window.confirm(
                    t("favorite.delete_confirm", { label: favorite.label }),
                  )
                )
                  return;
                const done = await saver.run(() =>
                  api.deleteFavorite(favorite.id).then(() => true),
                );
                if (done)
                  setFavorites((items) =>
                    items.filter((item) => item.id !== favorite.id),
                  );
              }}
            >
              {t("common.delete")}
            </button>
          </li>
        ))}
      </ul>
      <form
        className="stack favorite-form"
        onSubmit={async (event) => {
          event.preventDefault();
          const saved = await saver.run(() =>
            api.createFavorite({
              label: label.trim(),
              drink_type: drink,
              volume_ml: Number(volume),
            }),
          );
          if (saved) {
            setFavorites((items) => [...items, saved]);
            setLabel("");
          }
        }}
      >
        <h2>{t("favorite.new")}</h2>
        <label>
          {t("favorite.label")}
          <input
            type="text"
            required
            maxLength={80}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </label>
        <Choice
          label={t("favorite.drink")}
          value={drink}
          options={DRINK_TYPES}
          optionLabel={drinkLabel}
          onChange={setDrink}
        />
        <label className="row">
          {t("capture.volume")}
          <input
            type="number"
            className="narrow"
            required
            min={1}
            max={5000}
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
          />
          ml
        </label>
        <button
          type="submit"
          className="primary"
          disabled={!label.trim() || saver.state === "pending"}
        >
          {t("common.add")}
        </button>
      </form>
    </section>
  );
}
