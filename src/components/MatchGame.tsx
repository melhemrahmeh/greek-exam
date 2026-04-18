import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "./AppHeader";
import { matchLessons, persons } from "../features/study/data";
import { shuffle } from "../features/study/utils";
import type { Theme } from "../features/study/types";

type MatchGameProps = {
  onClose: () => void;
  onToggleTheme: () => void;
  theme: Theme;
};

export function MatchGame({ onClose, onToggleTheme, theme }: MatchGameProps) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [lessonIndex, setLessonIndex] = useState(0);
  const [tenseKey, setTenseKey] = useState<"present" | "past" | "future">("present");
  const [selectedPronoun, setSelectedPronoun] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<string>("");
  const [score, setScore] = useState({ correct: 0, wrong: 0 });

  const lesson = matchLessons[lessonIndex];
  const forms = lesson.tenses[tenseKey];
  const pronouns = persons;
  const rightOrder = useMemo(() => shuffle(forms), [forms]);

  const done = matched.length === pronouns.length;

  useEffect(() => {
    if (!done) return;
    const timer = window.setTimeout(() => {
      const nextRound = roundIndex + 1;
      const nextLessonIndex = nextRound % matchLessons.length;
      const nextTense = nextRound % 3 === 0 ? "present" : nextRound % 3 === 1 ? "past" : "future";
      setMatched([]);
      setSelectedPronoun(null);
      setFeedback("");
      setRoundIndex(nextRound);
      setLessonIndex(nextLessonIndex);
      setTenseKey(nextTense);
    }, 1100);
    return () => window.clearTimeout(timer);
  }, [done, roundIndex]);

  return (
    <div className="app-shell">
      <AppHeader
        title="Verb Matching"
        subtitle="Pair each pronoun with the correct form."
        eyebrow={`Round ${roundIndex + 1}`}
        onBack={onClose}
        onToggleTheme={onToggleTheme}
        theme={theme}
      />
      <main className="content">
        <section className="panel">
          <div className="split-header">
            <div>
              <h3>{lesson.label}</h3>
              <p>{lesson.notes}</p>
            </div>
            <div className="pill">{tenseKey}</div>
          </div>
          <div className="stats-inline">
            <span>{"\u2713"} {score.correct}</span>
            <span>{"\u2715"} {score.wrong}</span>
          </div>
          <div className="match-layout">
            <div className="match-column">
              <span className="mini-label">Pronouns</span>
              {pronouns.map((pronoun, idx) => (
                <button
                  key={pronoun}
                  className={[
                    "match-chip",
                    selectedPronoun === idx ? "selected" : "",
                    matched.includes(idx) ? "resolved" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  disabled={matched.includes(idx)}
                  onClick={() => setSelectedPronoun(idx)}
                >
                  {pronoun}
                </button>
              ))}
            </div>
            <div className="match-column">
              <span className="mini-label">Forms</span>
              {rightOrder.map((form) => {
                const formIndex = forms.indexOf(form);
                return (
                  <button
                    key={`${tenseKey}-${form}`}
                    className={matched.includes(formIndex) ? "match-chip resolved" : "match-chip"}
                    disabled={matched.includes(formIndex)}
                    onClick={() => {
                      if (selectedPronoun === null) return;
                      if (forms[selectedPronoun] === form) {
                        setMatched((value) => [...value, selectedPronoun]);
                        setScore((value) => ({ ...value, correct: value.correct + 1 }));
                        setFeedback(`${pronouns[selectedPronoun]} \u2192 ${form}`);
                      } else {
                        setScore((value) => ({ ...value, wrong: value.wrong + 1 }));
                        setFeedback("Not that one. Try another form.");
                      }
                      setSelectedPronoun(null);
                    }}
                  >
                    {form}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="feedback-box">{feedback || "Tap a pronoun, then choose its matching verb form."}</div>
        </section>
      </main>
    </div>
  );
}
