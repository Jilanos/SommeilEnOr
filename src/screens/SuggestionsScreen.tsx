import { useEffect, useState } from "react";
import { api, type Suggestion } from "../api";
import { SaveStatus } from "../components/SaveStatus";
import { SuggestButton } from "../components/SuggestButton";
import { t } from "../i18n";
import { errorMessage, useSaver } from "../useSaver";

export function SuggestionsScreen() {
  const [items, setItems] = useState<Suggestion[] | null>(null);
  const [error, setError] = useState("");
  const saver = useSaver();

  useEffect(() => {
    api.suggestions().then(setItems, (failure) => setError(errorMessage(failure)));
  }, []);

  async function remove(item: Suggestion) {
    if (!window.confirm(t("suggestions.delete.confirm"))) return;
    const done = await saver.run(() => api.deleteSuggestion(item.id).then(() => true));
    if (done) setItems((current) => (current ?? []).filter((s) => s.id !== item.id));
  }

  return (
    <section className="card">
      <div className="field-head">
        <h2>{t("suggestions.title")}</h2>
        <SuggestButton context="suggestions.list" />
        <SaveStatus saver={saver} />
      </div>
      <p className="hint">{t("suggestions.hint")}</p>
      {error && <p className="error">{error}</p>}
      {items && items.length === 0 && <p className="hint">{t("suggestions.empty")}</p>}
      <ul className="events">
        {items?.map((item) => (
          <li key={item.id} className="event">
            <div className="event-line">
              <span className="grow">
                <small className="hint">
                  {new Date(item.created_at).toLocaleString("fr-FR", { timeZone: "Europe/Paris" })} · {item.action_context}
                </small>
                <br />
                <span className="pre">{item.text}</span>
              </span>
              <button type="button" className="danger" onClick={() => void remove(item)}>
                {t("common.delete")}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
