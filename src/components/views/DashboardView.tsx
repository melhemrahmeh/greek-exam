import { useState } from "react";
import type { ReviewCard } from "../../features/study/types";
import { Icon, ProgressBar } from "../ui";

export type ContinueTarget = {
  title: string;
  detail: string;
  onStart: () => void;
};

export type AreaProgress = {
  label: string;
  passed: number;
  total: number;
  percent: number;
  onOpen: () => void;
};

type DashboardViewProps = {
  profileName: string;
  continueTarget: ContinueTarget;
  overallAccuracy: number;
  totalSessions: number;
  mistakesCount: number;
  areas: AreaProgress[];
  favorites: ReviewCard[];
  mistakes: ReviewCard[];
  onOpenFavoritesQuiz: () => void;
  onOpenMistakesQuiz: () => void;
  onOpenProgress: () => void;
};

export function DashboardView({
  profileName,
  continueTarget,
  overallAccuracy,
  totalSessions,
  mistakesCount,
  areas,
  favorites,
  mistakes,
  onOpenFavoritesQuiz,
  onOpenMistakesQuiz,
  onOpenProgress,
}: DashboardViewProps) {
  return (
    <>
      <h1 className="visually-hidden">Home</h1>

      <section className="panel continue-card" aria-labelledby="continue-title">
        <div className="continue-copy">
          <span className="muted">Hi {profileName.split(" ")[0]}, up next</span>
          <h2 id="continue-title">{continueTarget.title}</h2>
          <p className="muted">{continueTarget.detail}</p>
        </div>
        <button className="btn btn-primary continue-button" onClick={continueTarget.onStart}>
          Continue
        </button>
      </section>

      <section className="stat-strip" aria-label="Summary">
        <div className="stat">
          <strong>{totalSessions ? `${overallAccuracy}%` : "–"}</strong>
          <span>accuracy</span>
        </div>
        <div className="stat">
          <strong>{totalSessions}</strong>
          <span>sessions</span>
        </div>
        <div className="stat">
          <strong>{mistakesCount}</strong>
          <span>cards to review</span>
        </div>
      </section>

      <section className="section" aria-labelledby="areas-title">
        <div className="section-head">
          <h2 id="areas-title">Your areas</h2>
          <button className="btn btn-ghost" onClick={onOpenProgress}>
            <Icon name="chart" width={18} height={18} />
            All progress
          </button>
        </div>
        <div className="panel panel-flush">
          <div className="rows">
            {areas.map((area) => (
              <button key={area.label} className="row area-row" onClick={area.onOpen}>
                <div className="row-main area-main">
                  <strong>{area.label}</strong>
                  <ProgressBar value={area.percent} label={`${area.label} progress`} success={area.passed === area.total && area.total > 0} />
                </div>
                <span className="row-meta">
                  {area.passed} / {area.total} passed
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="review-title">
        <div className="section-head">
          <h2 id="review-title">Review</h2>
        </div>
        <div className="review-grid">
          <ReviewCardBox
            title="Favorites"
            cards={favorites}
            emptyText="Star a card during any quiz to save it here."
            onStudy={onOpenFavoritesQuiz}
          />
          <ReviewCardBox
            title="Mistakes"
            cards={mistakes}
            emptyText="No mistakes yet. Wrong answers from quizzes land here."
            onStudy={onOpenMistakesQuiz}
          />
        </div>
      </section>
    </>
  );
}

function ReviewCardBox({
  title,
  cards,
  emptyText,
  onStudy,
}: {
  title: string;
  cards: ReviewCard[];
  emptyText: string;
  onStudy: () => void;
}) {
  const [open, setOpen] = useState(false);
  const listId = `review-${title.toLowerCase()}`;

  return (
    <article className="panel review-card">
      <div className="review-card-head">
        <div>
          <h3>{title}</h3>
          <span className="muted">
            {cards.length} {cards.length === 1 ? "card" : "cards"}
          </span>
        </div>
        <button className="btn btn-secondary" disabled={!cards.length} onClick={onStudy}>
          Study
        </button>
      </div>
      {cards.length ? (
        <>
          <button className="btn btn-ghost review-toggle" aria-expanded={open} aria-controls={listId} onClick={() => setOpen((v) => !v)}>
            {open ? "Hide cards" : "Show cards"}
          </button>
          {open && (
            <div id={listId} className="rows review-rows">
              {cards.slice(0, 12).map((card) => (
                <div key={card.id} className="row">
                  <div className="row-main">
                    <strong>{card.front}</strong>
                    <small>{card.source}</small>
                  </div>
                  <span className="row-end">{card.back}</span>
                </div>
              ))}
              {cards.length > 12 && <p className="muted review-more">+{cards.length - 12} more</p>}
            </div>
          )}
        </>
      ) : (
        <p className="muted">{emptyText}</p>
      )}
    </article>
  );
}
