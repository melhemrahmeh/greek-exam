import { useState } from "react";
import type { FormEvent } from "react";
import { AppHeader } from "./AppHeader";
import type { Theme } from "../features/study/types";

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
    <div className="app-shell">
      <AppHeader
        title="Greek Exam Studio"
        subtitle="Enter your name to keep your study progress, saved cards, and history on this device."
        eyebrow="Personal study space"
        onToggleTheme={onToggleTheme}
        theme={theme}
      />
      <main className="content">
        <section className="panel auth-panel">
          <div>
            <h3>Who's studying?</h3>
            <p>Progress is saved in this browser under your name. Use the same name to pick up where you left off.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Name</span>
              <input type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" autoFocus />
            </label>
            <button className="primary-button" type="submit" disabled={!trimmed}>
              Start studying
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
