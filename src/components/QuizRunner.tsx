import { useEffect, useRef, useState } from "react";
import type { QuizAnswer, QuizItem, QuizSession, ReviewCard, Theme } from "../features/study/types";
import { percent } from "../features/study/utils";

type QuizRunnerProps = {
  session: QuizSession;
  favorites: Set<string>;
  onToggleFavorite: (card: ReviewCard) => void;
  onClose: () => void;
  onComplete: (deckId: string, answers: QuizAnswer[], items: QuizItem[]) => void;
  onRestart: () => void;
  onToggleTheme: () => void;
  theme: Theme;
};

export function QuizRunner({
  session,
  favorites,
  onToggleFavorite,
  onClose,
  onComplete,
  onRestart,
  onToggleTheme,
  theme,
}: QuizRunnerProps) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>(() => new Array(session.items.length).fill(null));
  const [showSummary, setShowSummary] = useState(false);
  const submittedRef = useRef(false);

  const current = session.items[index];
  const currentAnswer = answers[index];
  const answeredCount = answers.filter(Boolean).length;
  const correctCount = answers.filter((entry) => entry?.correct).length;
  const isDone = answeredCount === session.items.length;
  const wrongItems = session.items.filter((_, itemIndex) => !answers[itemIndex]?.correct);
  const wrongCount = wrongItems.length;
  const scorePercent = percent(correctCount, session.items.length);

  useEffect(() => {
    if (!isDone || submittedRef.current) return;
    submittedRef.current = true;
    onComplete(session.deckId, answers, session.items);
  }, [answers, isDone, onComplete, session.deckId, session.items]);

  const selected = currentAnswer?.selected;

  if (isDone && showSummary) {
    return (
      <div className="app-shell">
        <section className="quiz-header">
          <div className="quiz-header-top">
            <button className="ghost-button" onClick={onClose}>
              {"\u2190"} Back
            </button>
            <button className="theme-button" onClick={onToggleTheme} aria-label="Toggle theme">
              {theme === "dark" ? "\u2600" : "\u263E"}
            </button>
          </div>
          <div className="quiz-head-meta">
            <span className="eyebrow">Quiz completed</span>
            {session.subtitle && <span className="quiz-subline">{session.subtitle}</span>}
          </div>
          <h1 className="quiz-title">{session.title}</h1>
        </section>
        <main className="content">
          <section className="panel quiz-summary">
            <div className="summary-hero">
              <span className="mini-label">Final result</span>
              <h2>{scorePercent}% score</h2>
              <p>
                {correctCount} correct out of {session.items.length}.{" "}
                {wrongCount ? "You have a few useful review targets below." : "Clean run. Nicely done."}
              </p>
            </div>

            <div className="summary-metrics">
              <div className="quiz-stat">
                Correct <strong>{correctCount}</strong>
              </div>
              <div className="quiz-stat">
                Missed <strong>{wrongCount}</strong>
              </div>
              <div className="quiz-stat">
                Accuracy <strong>{scorePercent}%</strong>
              </div>
            </div>

            <div className="summary-actions">
              <button className="primary-button" onClick={onRestart}>
                Retry quiz
              </button>
              <button
                className="secondary-button"
                disabled={!wrongCount}
                onClick={() => {
                  const firstWrongIndex = answers.findIndex((answer) => !answer?.correct);
                  if (firstWrongIndex >= 0) {
                    setIndex(firstWrongIndex);
                    setShowSummary(false);
                  }
                }}
              >
                Review mistakes
              </button>
              <button className="ghost-button" onClick={onClose}>
                Back to app
              </button>
            </div>

            <div className="summary-list">
              <div className="split-header">
                <div>
                  <h3>Quick recap</h3>
                  <p>Your missed prompts are listed first so it is easy to revisit weak spots.</p>
                </div>
              </div>
              {wrongCount ? (
                wrongItems.slice(0, 8).map((item) => (
                  <div key={item.id} className="list-row summary-row">
                    <div>
                      <strong>{item.prompt}</strong>
                      <small>{item.detail ?? item.review.source}</small>
                    </div>
                    <span>{item.answer}</span>
                  </div>
                ))
              ) : (
                <div className="empty-state">No mistakes in this run. Try another deck or increase the challenge.</div>
              )}
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <section className="quiz-header">
        <div className="quiz-header-top">
          <button className="ghost-button" onClick={onClose}>
            {"\u2190"} Back
          </button>
          <button className="theme-button" onClick={onToggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? "\u2600" : "\u263E"}
          </button>
        </div>
        <div className="quiz-head-meta">
          <span className="eyebrow">
            {index + 1} of {session.items.length}
          </span>
          {session.subtitle && <span className="quiz-subline">{session.subtitle}</span>}
        </div>
        <h1 className="quiz-title">{session.title}</h1>
      </section>
      <main className="content">
        <section className="panel quiz-panel">
          <div className="quiz-toolbar quiz-toolbar-top">
            <div className="quiz-stat">
              Correct <strong>{correctCount}</strong>
            </div>
            <div className="quiz-stat">
              Answered <strong>{answeredCount}</strong>
            </div>
            <button
              className={favorites.has(current.review.id) ? "pill favorite active" : "pill favorite"}
              onClick={() => onToggleFavorite(current.review)}
            >
              {favorites.has(current.review.id) ? "\u2605 Saved" : "\u2606 Save"}
            </button>
          </div>

          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${((index + 1) / session.items.length) * 100}%` }} />
          </div>

          <div key={current.id} className="question-stage">
            <div className="prompt-card">
              <div className="prompt-label-row">
                <span className="mini-label">Prompt</span>
                {current.detail && <span className="prompt-detail">{current.detail}</span>}
              </div>
              <h2>{current.prompt}</h2>
            </div>

            <div className="choice-grid">
              {current.choices.map((choice, choiceIndex) => {
                const revealed = Boolean(currentAnswer);
                const isCorrect = choice === current.answer;
                const isSelected = selected === choice;
                const className = [
                  "choice-card",
                  revealed && isCorrect ? "correct" : "",
                  revealed && isSelected && !isCorrect ? "wrong" : "",
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <button
                    key={choice}
                    className={className}
                    onClick={() => {
                      if (currentAnswer) return;
                      const nextAnsweredCount = answeredCount + 1;
                      if (nextAnsweredCount === session.items.length) {
                        setShowSummary(true);
                      }
                      setAnswers((existing) => {
                        const next = [...existing];
                        next[index] = { selected: choice, correct: isCorrect };
                        return next;
                      });
                    }}
                  >
                    <span className="choice-index">{String.fromCharCode(65 + choiceIndex)}</span>
                    <span className="choice-text">{choice}</span>
                    {revealed && isCorrect && <strong>{"\u2713"}</strong>}
                    {revealed && isSelected && !isCorrect && <strong>{"\u2715"}</strong>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="quiz-actions">
            <button className="secondary-button" disabled={index === 0} onClick={() => setIndex((value) => value - 1)}>
              Previous
            </button>
            <button
              className="primary-button"
              disabled={!currentAnswer}
              onClick={() => setIndex((value) => Math.min(session.items.length - 1, value + 1))}
            >
              {index === session.items.length - 1 ? "Finish quiz" : "Next"}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
