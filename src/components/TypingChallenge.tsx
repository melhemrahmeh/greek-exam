import { useMemo, useState } from "react";
import { AppHeader } from "./AppHeader";
import { TYPING_DRILL_LENGTH } from "../features/study/constants";
import { verbs } from "../features/study/data";
import { shuffle } from "../features/study/utils";
import type { Theme } from "../features/study/types";

type TypingChallengeProps = {
  onClose: () => void;
  onToggleTheme: () => void;
  theme: Theme;
};

export function TypingChallenge({ onClose, onToggleTheme, theme }: TypingChallengeProps) {
  const [queue, setQueue] = useState(() => shuffle(verbs).slice(0, TYPING_DRILL_LENGTH));
  const [index, setIndex] = useState(0);
  const [inputs, setInputs] = useState({ present: "", past: "", future: "" });
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState({ perfect: 0, attempted: 0 });

  const current = queue[index];
  const answers = useMemo(
    () => ({
      present: current.p[0],
      past: current.pa[0],
      future: current.f[0],
    }),
    [current],
  );

  const correctness = checked
    ? {
        present: inputs.present.trim() === answers.present,
        past: inputs.past.trim() === answers.past,
        future: inputs.future.trim() === answers.future,
      }
    : null;

  return (
    <div className="app-shell">
      <AppHeader
        title="Verb Form Drill"
        subtitle="Type the 1st-person singular forms from memory."
        eyebrow={`${index + 1} of ${queue.length}`}
        onBack={onClose}
        onToggleTheme={onToggleTheme}
        theme={theme}
      />
      <main className="content">
        <section className="panel">
          <div className="split-header">
            <div>
              <h3>{current.en}</h3>
              <p>{current.inf}</p>
            </div>
            <div className="pill">{score.perfect}/{score.attempted}</div>
          </div>
          <div className="form-grid">
            {(["present", "past", "future"] as const).map((key) => (
              <label key={key} className="field">
                <span>{key}</span>
                <input
                  value={inputs[key]}
                  onChange={(event) => setInputs((value) => ({ ...value, [key]: event.target.value }))}
                  className={!checked ? "" : correctness?.[key] ? "ok" : "bad"}
                />
                {checked && <small>Answer: {answers[key]}</small>}
              </label>
            ))}
          </div>
          <div className="quiz-actions">
            {!checked ? (
              <button
                className="primary-button"
                onClick={() => {
                  const nextCorrect = Object.entries(answers).every(([key, value]) => inputs[key as keyof typeof inputs].trim() === value);
                  setChecked(true);
                  setScore((value) => ({
                    perfect: value.perfect + (nextCorrect ? 1 : 0),
                    attempted: value.attempted + 1,
                  }));
                }}
              >
                Check answers
              </button>
            ) : (
              <button
                className="primary-button"
                onClick={() => {
                  setChecked(false);
                  setInputs({ present: "", past: "", future: "" });
                  if (index < queue.length - 1) {
                    setIndex((value) => value + 1);
                  } else {
                    setQueue(shuffle(verbs).slice(0, TYPING_DRILL_LENGTH));
                    setIndex(0);
                    setScore({ perfect: 0, attempted: 0 });
                  }
                }}
              >
                {index < queue.length - 1 ? "Next verb" : "Restart drill"}
              </button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
