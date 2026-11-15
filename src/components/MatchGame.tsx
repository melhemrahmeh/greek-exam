import { useEffect, useMemo, useState } from "react";
import { FocusBar } from "./FocusBar";
import { Icon } from "./ui";
import { matchLessons, persons } from "../features/study/data";
import { shuffle } from "../features/study/utils";

type MatchGameProps = {
  onClose: () => void;
};

const tenseNames = { present: "Present", past: "Past", future: "Future" } as const;

export function MatchGame({ onClose }: MatchGameProps) {
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

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="app-shell">
      <FocusBar onClose={onClose} closeLabel="Close game" title={`Verb matching · Round ${roundIndex + 1}`} />
      <main className="container content focus-content">
        <div className="page-head">
          <div>
            <h1 lang="el">{lesson.label}</h1>
            <p>{lesson.notes}</p>
          </div>
          <span className="badge">{tenseNames[tenseKey]}</span>
        </div>

        <div className="match-score" aria-label={`${score.correct} correct, ${score.wrong} wrong`}>
          <span className="score-success">
            <Icon name="check" width={16} height={16} /> {score.correct}
          </span>
          <span className="score-danger">
            <Icon name="x" width={16} height={16} /> {score.wrong}
          </span>
        </div>

        <div className="match-layout">
          <div className="match-column" role="group" aria-label="Pronouns">
            <span className="field-label">Pronoun</span>
            {pronouns.map((pronoun, idx) => (
              <button
                key={pronoun}
                className={["match-chip", selectedPronoun === idx ? "selected" : "", matched.includes(idx) ? "resolved" : ""]
                  .filter(Boolean)
                  .join(" ")}
                aria-pressed={selectedPronoun === idx}
                disabled={matched.includes(idx)}
                lang="el"
                onClick={() => setSelectedPronoun(idx)}
              >
                {pronoun}
              </button>
            ))}
          </div>
          <div className="match-column" role="group" aria-label="Verb forms">
            <span className="field-label">Form</span>
            {rightOrder.map((form) => {
              const formIndex = forms.indexOf(form);
              return (
                <button
                  key={`${tenseKey}-${form}`}
                  className={matched.includes(formIndex) ? "match-chip resolved" : "match-chip"}
                  disabled={matched.includes(formIndex)}
                  lang="el"
                  onClick={() => {
                    if (selectedPronoun === null) return;
                    if (forms[selectedPronoun] === form) {
                      setMatched((value) => [...value, selectedPronoun]);
                      setScore((value) => ({ ...value, correct: value.correct + 1 }));
                      setFeedback(`Correct: ${pronouns[selectedPronoun]} → ${form}`);
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
        <p className="quiz-feedback" aria-live="polite">
          {feedback || <span className="muted">Tap a pronoun, then its matching verb form.</span>}
        </p>
      </main>
    </div>
  );
}
