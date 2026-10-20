import type { ReactNode } from "react";
import type { Saver } from "../useSaver";
import { SaveStatus } from "./SaveStatus";
import { SuggestButton } from "./SuggestButton";

interface Props {
  label: string;
  context: string;
  saver?: Saver;
  hint?: string;
  children: ReactNode;
}

/** A labelled action with its save state and its feature-suggestion control. */
export function Field({ label, context, saver, hint, children }: Props) {
  return (
    <div className="field">
      <div className="field-head">
        <span className="field-label">{label}</span>
        <SuggestButton context={context} />
        {saver && <SaveStatus saver={saver} />}
      </div>
      {hint && <p className="hint">{hint}</p>}
      {children}
    </div>
  );
}
