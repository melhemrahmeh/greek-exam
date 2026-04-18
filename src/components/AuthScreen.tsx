import type { FormEvent } from "react";
import { AppHeader } from "./AppHeader";
import type { AuthMode, Theme } from "../features/study/types";

type AuthScreenProps = {
  mode: AuthMode;
  email: string;
  password: string;
  loading: boolean;
  error: string;
  message: string;
  configured: boolean;
  theme: Theme;
  onModeChange: (mode: AuthMode) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onToggleTheme: () => void;
};

export function AuthScreen({
  mode,
  email,
  password,
  loading,
  error,
  message,
  configured,
  theme,
  onModeChange,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onToggleTheme,
}: AuthScreenProps) {
  return (
    <div className="app-shell">
      <AppHeader
        title="Greek Exam Studio"
        subtitle="Sign in to sync your quiz progress, saved cards, and study history with Supabase."
        eyebrow="Cloud sync enabled"
        onToggleTheme={onToggleTheme}
        theme={theme}
      />
      <main className="content">
        <section className="panel auth-panel">
          <div className="split-header">
            <div>
              <h3>{mode === "login" ? "Login" : "Register"}</h3>
              <p>{configured ? "Your progress will save to your account instead of the browser." : "Add Supabase environment variables before signing in."}</p>
            </div>
            <div className="auth-toggle">
              <button className={mode === "login" ? "switch active" : "switch"} onClick={() => onModeChange("login")}>
                Login
              </button>
              <button className={mode === "register" ? "switch active" : "switch"} onClick={() => onModeChange("register")}>
                Register
              </button>
            </div>
          </div>

          {!configured && (
            <div className="empty-state">
              Supabase is not configured yet. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from `.env.example`, then run the SQL in `supabase/schema.sql`.
            </div>
          )}

          <form className="auth-form" onSubmit={onSubmit}>
            <label className="field">
              <span>Email</span>
              <input type="email" value={email} onChange={(event) => onEmailChange(event.target.value)} placeholder="you@example.com" />
            </label>
            <label className="field">
              <span>Password</span>
              <input type="password" value={password} onChange={(event) => onPasswordChange(event.target.value)} placeholder="At least 6 characters" />
            </label>
            <button className="primary-button" type="submit" disabled={loading || !configured}>
              {loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
            </button>
          </form>

          {error && <div className="feedback-box auth-error">{error}</div>}
          {message && <div className="feedback-box auth-message">{message}</div>}
        </section>
      </main>
    </div>
  );
}
