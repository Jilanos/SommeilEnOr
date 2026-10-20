import { SuggestButton } from "../components/SuggestButton";
import { t } from "../i18n";

export function ExportScreen() {
  return (
    <section className="card">
      <div className="field-head">
        <h2>{t("export.title")}</h2>
        <SuggestButton context="export" />
      </div>
      <p>{t("export.description")}</p>
      <div className="row">
        <a className="button primary" href="/api/export.json" download>
          {t("export.json")}
        </a>
        <a className="button primary" href="/api/export.zip" download>
          {t("export.csv")}
        </a>
      </div>
      <p className="hint">{t("export.hint")}</p>
    </section>
  );
}
