import { useState } from "react";
import type { FormEvent } from "react";
import type { Theme } from "../features/study/types";
import { ThemeToggle } from "./AppHeader";

type LoginScreenProps = {
  theme: Theme;
  onLogin: (name: string) => void;
  onToggleTheme: () => void;
};

export function LoginScreen({ theme, onLogin, onToggleTheme }: LoginScreenProps) {
  const [name, setName] = useState("");
  const trimmed = name.trim();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (trimmed) onLogin(trimmed);
  };

  return (
    <div className="login-shell">
      <div className="login-theme">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
      <main className="panel login-card">
        <span className="app-name">Greek Exam Studio</span>
        <h1>Who's studying?</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field-label">Your name</span>
            <input className="input" type="text" value={name} onChange={(event) => setName(event.target.value)} autoComplete="given-name" autoFocus />
          </label>
          <button className="btn btn-primary btn-block" type="submit" disabled={!trimmed}>
            Start studying
          </button>
        </form>
        <p className="muted login-note">Progress stays on this device. Use the same name to pick up where you left off.</p>
      </main>
    </div>
  );
}
