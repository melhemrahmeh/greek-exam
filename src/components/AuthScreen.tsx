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
        subtitle="Sign in to keep your study progress, saved cards, and history available each time you come back."
        eyebrow="Personal study space"
        onToggleTheme={onToggleTheme}
        theme={theme}
      />
      <main className="content">
        <section className="panel auth-panel">
          <div className="split-header">
            <div>
              <h3>{mode === "login" ? "Login" : "Register"}</h3>
              <p>{configured ? "Your progress and saved cards will be ready when you return." : "Sign-in is unavailable until the app setup is completed."}</p>
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
              Sign-in is currently unavailable in this build.
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
