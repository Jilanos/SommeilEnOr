import { t } from "../i18n";
import type { Saver } from "../useSaver";

export function SaveStatus({ saver }: { saver: Saver }) {
  if (saver.state === "idle") return null;
  const text = {
    pending: t("save.pending"),
    saved: t("save.saved"),
    failed: `${t("save.failed")} ${saver.message}`,
    disconnected: t("save.disconnected"),
  }[saver.state];
  return (
    <span className={`save-status save-${saver.state}`} role="status" aria-live="polite">
      {text}
    </span>
  );
}
