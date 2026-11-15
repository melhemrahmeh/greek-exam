import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { FocusBar } from "./FocusBar";
import { TYPING_DRILL_LENGTH } from "../features/study/constants";
import { verbs } from "../features/study/data";
import { shuffle } from "../features/study/utils";

type TypingChallengeProps = {
  onClose: () => void;
};

const fieldLabels = { present: "Present", past: "Past", future: "Future" } as const;

export function TypingChallenge({ onClose }: TypingChallengeProps) {
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

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const check = () => {
    const nextCorrect = Object.entries(answers).every(([key, value]) => inputs[key as keyof typeof inputs].trim() === value);
    setChecked(true);
    setScore((value) => ({
      perfect: value.perfect + (nextCorrect ? 1 : 0),
      attempted: value.attempted + 1,
    }));
  };

  const next = () => {
    setChecked(false);
    setInputs({ present: "", past: "", future: "" });
    if (index < queue.length - 1) {
      setIndex((value) => value + 1);
    } else {
      setQueue(shuffle(verbs).slice(0, TYPING_DRILL_LENGTH));
      setIndex(0);
      setScore({ perfect: 0, attempted: 0 });
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (checked) next();
    else check();
  };

  return (
    <div className="app-shell">
      <FocusBar
        onClose={onClose}
        closeLabel="Close drill"
        progress={{ current: index + 1, total: queue.length }}
        actions={
          <span className="badge" title="Perfect answers so far">
            {score.perfect}/{score.attempted}
          </span>
        }
      />
      <main className="container content focus-content">
        <div className="quiz-prompt">
          <span className="muted">Type the 1st-person singular forms</span>
          <h1>{current.en}</h1>
          <span className="greek" lang="el">
            {current.inf}
          </span>
        </div>
        <form className="typing-form" onSubmit={handleSubmit}>
          {(["present", "past", "future"] as const).map((key, i) => (
            <label key={`${index}-${key}`} className="field">
              <span className="field-label">{fieldLabels[key]}</span>
              <input
                className={!checked ? "input" : correctness?.[key] ? "input is-correct" : "input is-wrong"}
                value={inputs[key]}
                lang="el"
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                autoFocus={i === 0}
                readOnly={checked}
                onChange={(event) => setInputs((value) => ({ ...value, [key]: event.target.value }))}
              />
              {checked && (
                <small className={correctness?.[key] ? "score-success" : "score-danger"}>
                  {correctness?.[key] ? "✓ Correct" : `✕ Answer: ${answers[key]}`}
                </small>
              )}
            </label>
          ))}
          <div className="quiz-footer">
            <span />
            <button className="btn btn-primary quiz-next" type="submit">
              {!checked ? "Check" : index < queue.length - 1 ? "Next verb" : "Restart drill"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
