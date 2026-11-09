import { useEffect, useState } from "react";
import { ApiError, api, type User } from "./api";
import { t } from "./i18n";
import { AuthScreen } from "./screens/AuthScreen";
import { ExportScreen } from "./screens/ExportScreen";
import { HistoryScreen } from "./screens/HistoryScreen";
import { SuggestionsScreen } from "./screens/SuggestionsScreen";
import { TodayScreen } from "./screens/TodayScreen";
import { errorMessage } from "./useSaver";

type Tab = "today" | "history" | "suggestions" | "export";
const TABS: Tab[] = ["today", "history", "suggestions", "export"];
const tabLabel = (tab: Tab) =>
  ({ today: t("nav.today"), history: t("nav.history"), suggestions: t("nav.suggestions"), export: t("nav.export") })[tab];

function useOnline(): boolean {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return online;
}

export function App({ updateReady }: { updateReady: (() => void) | null }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [bootError, setBootError] = useState("");
  const [tab, setTab] = useState<Tab>("today");
  const online = useOnline();

  useEffect(() => {
    api.me().then(setUser, (error) => {
      if (error instanceof ApiError && error.status === 401) setUser(null);
      else setBootError(errorMessage(error));
    });
  }, [online]);

  const banners = (
    <>
      {!online && (
        <div className="banner banner-offline" role="alert">
          {t("banner.offline")}
        </div>
      )}
      {updateReady && (
        <div className="banner banner-update">
          {t("banner.update")} <button onClick={updateReady}>{t("banner.update_apply")}</button>
        </div>
      )}
    </>
  );

  if (user === undefined) {
    return (
      <>
        {banners}
        <main className="auth">
          <h1>SommeilEnOr</h1>
          <p className={bootError ? "error" : "hint"}>{bootError || t("common.loading")}</p>
        </main>
      </>
    );
  }
  if (user === null) {
    return (
      <>
        {banners}
        <AuthScreen onAuthenticated={setUser} />
      </>
    );
  }

  return (
    <>
      {banners}
      <header className="topbar">
        <strong>SommeilEnOr</strong>
        <span className="hint grow">{user.email}</span>
        <button
          type="button"
          className="link"
          onClick={() => api.logout().finally(() => setUser(null))}
        >
          {t("auth.logout")}
        </button>
      </header>
      <nav className="tabs" aria-label={t("nav.label")}>
        {TABS.map((item) => (
          <button key={item} type="button" className={item === tab ? "tab tab-on" : "tab"} aria-current={item === tab} onClick={() => setTab(item)}>
            {tabLabel(item)}
          </button>
        ))}
      </nav>
      <main className={`content${tab === "today" ? " content-today" : ""}`}>
        {tab === "today" && <TodayScreen />}
        {tab === "history" && <HistoryScreen />}
        {tab === "suggestions" && <SuggestionsScreen />}
        {tab === "export" && <ExportScreen />}
      </main>
    </>
  );
}
