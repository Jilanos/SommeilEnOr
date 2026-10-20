import { useState } from "react";
import { api } from "../api";
import { t } from "../i18n";
import { useSaver } from "../useSaver";
import { SaveStatus } from "./SaveStatus";

/** Private feature-suggestion control placed beside an action. Never creates a journal entry. */
export function SuggestButton({ context }: { context: string }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const saver = useSaver();

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!text.trim()) return;
    const saved = await saver.run(() => api.createSuggestion(context, text.trim()));
    if (saved) {
      setText("");
      setOpen(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="suggest"
        title={t("suggest.button")}
        aria-label={t("suggest.button")}
        onClick={() => setOpen(true)}
      >
        💡
      </button>
      {saver.state === "saved" && !open && <span className="save-status save-saved">{t("suggest.saved")}</span>}
      {open && (
        <div className="modal-backdrop" role="presentation" onClick={() => setOpen(false)}>
          <form
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={t("suggest.title")}
            onClick={(event) => event.stopPropagation()}
            onSubmit={submit}
          >
            <h3>{t("suggest.title")}</h3>
            <p className="hint">{t("suggest.hint")}</p>
            <textarea
              autoFocus
              rows={4}
              maxLength={4000}
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder={t("suggest.placeholder")}
            />
            <div className="row">
              <button type="submit" className="primary" disabled={!text.trim() || saver.state === "pending"}>
                {t("suggest.send")}
              </button>
              <button type="button" onClick={() => setOpen(false)}>
                {t("common.cancel")}
              </button>
              <SaveStatus saver={saver} />
            </div>
          </form>
        </div>
      )}
    </>
  );
}
