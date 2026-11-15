import { useEffect, useRef, useState } from "react";
import type { QuizAnswer, QuizItem, QuizSession, ReviewCard } from "../features/study/types";
import { getScoreClass, getScoreState, percent } from "../features/study/utils";
import { FocusBar } from "./FocusBar";
import { Icon } from "./ui";

type QuizRunnerProps = {
  session: QuizSession;
  favorites: Set<string>;
  onToggleFavorite: (card: ReviewCard) => void;
  onClose: () => void;
  onComplete: (deckId: string, answers: QuizAnswer[], items: QuizItem[]) => void;
  onRestart: () => void;
};

const summaryLine = {
  success: "Passed. Nicely done.",
  warning: "Getting there. One more run should do it.",
  danger: "Worth another pass. Review the misses first.",
  new: "",
};

export function QuizRunner({ session, favorites, onToggleFavorite, onClose, onComplete, onRestart }: QuizRunnerProps) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>(() => new Array(session.items.length).fill(null));
  const [showSummary, setShowSummary] = useState(false);
  const [reviewList, setReviewList] = useState<"mistakes" | "flagged" | null>(null);
  const [flagged, setFlagged] = useState<Set<string>>(() => new Set());
  const submittedRef = useRef(false);
  const reviewRef = useRef<HTMLDivElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (reviewList) reviewRef.current?.scrollIntoView({ block: "start" });
  }, [reviewList]);

  const total = session.items.length;
  const current = session.items[index];
  const currentAnswer = answers[index];
  const answeredCount = answers.filter(Boolean).length;
  const correctCount = answers.filter((entry) => entry?.correct).length;
  const isDone = answeredCount === total;
  const isLast = index === total - 1;
  const wrongItems = session.items.filter((_, itemIndex) => !answers[itemIndex]?.correct);
  const flaggedItems = session.items.filter((item) => flagged.has(item.id));
  const scorePercent = percent(correctCount, total);
  const isFavorite = favorites.has(current.review.id);
  const isFlagged = flagged.has(current.id);

  useEffect(() => {
    if (!isDone || submittedRef.current) return;
    submittedRef.current = true;
    onComplete(session.deckId, answers, session.items);
  }, [answers, isDone, onComplete, session.deckId, session.items]);

  const answer = (choice: string) => {
    if (currentAnswer) return;
    setAnswers((existing) => {
      const next = [...existing];
      next[index] = { selected: choice, correct: choice === current.answer };
      return next;
    });
  };

  const goNext = () => {
    if (!currentAnswer) return;
    if (isLast) {
      if (isDone) setShowSummary(true);
      return;
    }
    setIndex((value) => value + 1);
  };

  const toggleFlag = () => {
    setFlagged((existing) => {
      const next = new Set(existing);
      if (next.has(current.id)) next.delete(current.id);
      else next.add(current.id);
      return next;
    });
  };

  // Move focus to Next once answered, so Enter / Space continue naturally.
  useEffect(() => {
    if (currentAnswer && !showSummary) nextRef.current?.focus();
  }, [currentAnswer, showSummary]);

  // Keyboard: 1–4 answer, Enter next, Esc close.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (showSummary) return;
      const number = Number(event.key);
      if (Number.isInteger(number) && number >= 1 && number <= current.choices.length) {
        event.preventDefault();
        answer(current.choices[number - 1]);
        return;
      }
      if (event.key === "Enter" && currentAnswer && document.activeElement !== nextRef.current) {
        event.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (isDone && showSummary) {
    const state = getScoreState(scorePercent);
    const reviewItems = reviewList === "flagged" ? flaggedItems : wrongItems;

    return (
      <div className="app-shell">
        <FocusBar onClose={onClose} title={session.title} />
        <main className="container content focus-content">
          <section className="panel summary" aria-labelledby="summary-title">
            <span className="muted">{session.title}</span>
            <h1 id="summary-title" className={`summary-score ${getScoreClass(scorePercent)}`}>
              {scorePercent}%
            </h1>
            <p>
              {correctCount} of {total} correct. {summaryLine[state]}
            </p>
            <div className="summary-actions">
              {wrongItems.length > 0 && (
                <button className="btn btn-primary" onClick={() => setReviewList("mistakes")}>
                  Review mistakes ({wrongItems.length})
                </button>
              )}
              <button
                className={wrongItems.length ? "btn btn-secondary" : "btn btn-primary"}
                onClick={() => {
                  setReviewList(null);
                  onRestart();
                }}
              >
                Retry
              </button>
              {flaggedItems.length > 0 && (
                <button className="btn btn-secondary" onClick={() => setReviewList("flagged")}>
                  Flagged ({flaggedItems.length})
                </button>
              )}
              <button className="btn btn-ghost" onClick={onClose}>
                Done
              </button>
            </div>
          </section>

          {reviewList && (
            <section ref={reviewRef} className="panel panel-flush" aria-label={reviewList === "flagged" ? "Flagged cards" : "Mistakes"}>
              <div className="rows">
                {reviewItems.map((item) => {
                  const wasCorrect = answers[session.items.indexOf(item)]?.correct;
                  return (
                    <div key={item.id} className="row">
                      <div className="row-main">
                        <strong>{item.prompt}</strong>
                        <small>
                          {item.detail ?? item.review.source}
                          {reviewList === "flagged" && (wasCorrect ? " · correct" : " · missed")}
                        </small>
                      </div>
                      <span className="row-end">{item.answer}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <FocusBar
        onClose={onClose}
        closeLabel="Close quiz"
        progress={{ current: index + 1, total }}
        actions={
          <>
            <button
              className="icon-button"
              aria-pressed={isFlagged}
              aria-label={isFlagged ? "Unflag question" : "Flag question for review"}
              title={isFlagged ? "Flagged" : "Flag for review"}
              onClick={toggleFlag}
            >
              <Icon name={isFlagged ? "flag-filled" : "flag"} />
            </button>
            <button
              className="icon-button"
              aria-pressed={isFavorite}
              aria-label={isFavorite ? "Remove from favorites" : "Save to favorites"}
              title={isFavorite ? "Saved to favorites" : "Save to favorites"}
              onClick={() => onToggleFavorite(current.review)}
            >
              <Icon name={isFavorite ? "star-filled" : "star"} />
            </button>
          </>
        }
      />
      <main className="container content focus-content quiz">
        <div key={current.id} className="quiz-prompt">
          {current.detail && <span className="muted">{current.detail}</span>}
          <h1>{current.prompt}</h1>
        </div>

        <div className="choices" role="group" aria-label="Answer choices">
          {current.choices.map((choice, choiceIndex) => {
            const revealed = Boolean(currentAnswer);
            const isCorrect = choice === current.answer;
            const isSelected = currentAnswer?.selected === choice;
            const state = revealed && isCorrect ? "correct" : revealed && isSelected ? "wrong" : "";
            return (
              <button
                key={choice}
                className={state ? `choice ${state}` : "choice"}
                disabled={revealed && !state}
                aria-disabled={revealed}
                onClick={() => answer(choice)}
              >
                <span className="choice-key" aria-hidden="true">
                  {choiceIndex + 1}
                </span>
                <span className="choice-text">{choice}</span>
                {state === "correct" && (
                  <span className="choice-mark">
                    <Icon name="check" />
                    <span className="visually-hidden">Correct answer</span>
                  </span>
                )}
                {state === "wrong" && (
                  <span className="choice-mark">
                    <Icon name="x" />
                    <span className="visually-hidden">Your answer, wrong</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <p className="quiz-feedback" aria-live="polite">
          {currentAnswer
            ? currentAnswer.correct
              ? "Correct."
              : `Not quite. The answer is “${current.answer}”.`
            : <span className="muted">Press 1–{current.choices.length} to answer</span>}
        </p>

        <div className="quiz-footer">
          <button className="btn btn-ghost" disabled={index === 0} onClick={() => setIndex((value) => value - 1)}>
            Previous
          </button>
          <button ref={nextRef} className="btn btn-primary quiz-next" disabled={!currentAnswer} onClick={goNext}>
            {isLast ? "See results" : "Next"}
          </button>
        </div>
      </main>
    </div>
  );
}
