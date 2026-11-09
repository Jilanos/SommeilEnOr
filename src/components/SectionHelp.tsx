import { useId, useState } from "react";
import { t } from "../i18n";
import { SuggestButton } from "./SuggestButton";

export function SectionHelp({
  section,
  text,
  context,
}: {
  section: string;
  text: string;
  context: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className="section-help">
      <button
        type="button"
        className="help-button"
        aria-label={t("today.help", { section })}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
      >
        ?
      </button>
      {open && (
        <div id={id} className="help-content">
          <p>{text}</p>
          <SuggestButton context={context} />
        </div>
      )}
    </div>
  );
}
