import { useState } from "react";
import type { DeckStats } from "../../features/study/types";
import { EmptyState, ProgressBar, ScoreBadge, Segmented } from "../ui";

type FamilyStat = {
  label: string;
  accuracy: number;
  stats: DeckStats;
};

type RankedDeck = {
  deckId: string;
  label: string;
  family: string;
  accuracy: number;
  stats: DeckStats;
};

type DeckSort = "last" | "best" | "az";

type ProgressViewProps = {
  totalSessions: number;
  overallAccuracy: number;
  totalCorrect: number;
  totalAttempted: number;
  overallCompletionPercent: number;
  overallPassedUnits: number;
  overallTotalUnits: number;
  completionByArea: Array<{ label: string; passed: number; total: number; percent: number }>;
  familyStats: FamilyStat[];
  rankedDecks: RankedDeck[];
  onStartQuiz: () => void;
};

const sortOptions = [
  { value: "last", label: "Last" },
  { value: "best", label: "Best" },
  { value: "az", label: "A–Z" },
] as const;

const familyOrder = ["Vocabulary", "Verbs", "Grammar", "Phrases", "Review", "Other"];

export function ProgressView({
  totalSessions,
  overallAccuracy,
  totalCorrect,
  totalAttempted,
  overallCompletionPercent,
  overallPassedUnits,
  overallTotalUnits,
  completionByArea,
  familyStats,
  rankedDecks,
  onStartQuiz,
}: ProgressViewProps) {
  const [deckSort, setDeckSort] = useState<DeckSort>("last");

  const sortDecks = (decks: RankedDeck[]) =>
    [...decks].sort((a, b) => {
      if (deckSort === "best") return b.stats.bestScore - a.stats.bestScore;
      if (deckSort === "az") return a.label.localeCompare(b.label);
      return b.stats.lastScore - a.stats.lastScore;
    });

  const groups = familyOrder
    .map((family) => ({
      family,
      summary: familyStats.find((entry) => entry.label === family),
      decks: sortDecks(rankedDecks.filter((deck) => deck.family === family)),
    }))
    .filter((group) => group.decks.length);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Progress</h1>
          <p>
            {overallPassedUnits} / {overallTotalUnits} units passed · {overallCompletionPercent}%
          </p>
        </div>
      </div>
      <ProgressBar value={overallCompletionPercent} label="Overall completion" />

      <section className="stat-strip" aria-label="Totals">
        <div className="stat">
          <strong>{totalSessions}</strong>
          <span>sessions</span>
        </div>
        <div className="stat">
          <strong>{totalAttempted ? `${overallAccuracy}%` : "–"}</strong>
          <span>accuracy</span>
        </div>
        <div className="stat">
          <strong>{totalCorrect}</strong>
          <span>correct</span>
        </div>
        <div className="stat">
          <strong>{totalAttempted}</strong>
          <span>answered</span>
        </div>
      </section>

      <section className="section" aria-labelledby="areas-title">
        <h2 id="areas-title">By area</h2>
        <div className="panel panel-flush">
          <div className="rows">
            {completionByArea.map((area) => (
              <div key={area.label} className="row area-row">
                <div className="row-main area-main">
                  <strong>{area.label}</strong>
                  <ProgressBar value={area.percent} label={`${area.label} progress`} success={area.total > 0 && area.passed === area.total} />
                </div>
                <span className="row-meta">
                  {area.passed} / {area.total} passed
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="decks-title">
        <div className="section-head">
          <h2 id="decks-title">Deck performance</h2>
          {rankedDecks.length > 0 && <Segmented label="Sort decks" value={deckSort} options={sortOptions} onChange={setDeckSort} />}
        </div>

        {groups.length ? (
          groups.map((group) => (
            <div key={group.family} className="deck-group">
              <div className="deck-group-head">
                <h3>{group.family}</h3>
                {group.summary && (
                  <span className="muted">
                    {group.summary.stats.sessions} sessions · {group.summary.accuracy}% accuracy
                  </span>
                )}
              </div>
              <div className="panel panel-flush">
                <div className="rows">
                  {group.decks.map((deck) => (
                    <div key={deck.deckId} className="row">
                      <div className="row-main">
                        <strong>{deck.label}</strong>
                        <small>
                          Last {deck.stats.lastScore}% · {deck.stats.sessions} {deck.stats.sessions === 1 ? "session" : "sessions"}
                        </small>
                      </div>
                      <ScoreBadge score={deck.stats.sessions ? deck.stats.bestScore : null} title="Best score" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="panel">
            <EmptyState
              icon="chart"
              action={
                <button className="btn btn-primary" onClick={onStartQuiz}>
                  Start a quiz
                </button>
              }
            >
              No quiz history yet. Finish a quiz and your scores show up here.
            </EmptyState>
          </div>
        )}
      </section>
    </>
  );
}
