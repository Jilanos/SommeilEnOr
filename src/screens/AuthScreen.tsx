import { useState } from "react";
import { api, type User } from "../api";
import { t } from "../i18n";
import { errorMessage } from "../useSaver";

export function AuthScreen({ onAuthenticated }: { onAuthenticated: (user: User) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const user = mode === "login" ? await api.login(email, password) : await api.register(email, password);
      onAuthenticated(user);
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="auth">
      <h1>SommeilEnOr</h1>
      <p className="hint">{t("auth.tagline")}</p>
      <form className="card stack" onSubmit={submit}>
        <h2>{mode === "login" ? t("auth.login") : t("auth.register")}</h2>
        <label className="stack">
          {t("auth.email")}
          <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="stack">
          {t("auth.password")}
          <input
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={mode === "register" ? 10 : undefined}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {mode === "register" && <p className="hint">{t("auth.password_hint")}</p>}
        {error && <p className="error" role="alert">{error}</p>}
        <button type="submit" className="primary" disabled={pending}>
          {mode === "login" ? t("auth.login") : t("auth.register")}
        </button>
        <button type="button" className="link" onClick={() => setMode(mode === "login" ? "register" : "login")}>
          {mode === "login" ? t("auth.to_register") : t("auth.to_login")}
        </button>
      </form>
    </main>
  );
}
