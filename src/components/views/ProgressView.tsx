import { useState } from "react";
import type { DeckStats } from "../../features/study/types";

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

type DeckSort = "last" | "best" | "accuracy" | "az";
type DeckFamilyFilter = "all" | string;

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
};

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
}: ProgressViewProps) {
  const [deckSort, setDeckSort] = useState<DeckSort>("last");
  const [deckFamily, setDeckFamily] = useState<DeckFamilyFilter>("all");

  const families = Array.from(new Set(rankedDecks.map((d) => d.family)));

  const filteredDecks = rankedDecks.filter((d) => deckFamily === "all" || d.family === deckFamily);

  const sortedDecks = [...filteredDecks].sort((a, b) => {
    if (deckSort === "best") return b.stats.bestScore - a.stats.bestScore;
    if (deckSort === "accuracy") return b.accuracy - a.accuracy;
    if (deckSort === "az") return a.label.localeCompare(b.label);
    return b.stats.lastScore - a.stats.lastScore;
  });
  return (
    <>
      <section className="panel">
        <div className="split-header">
          <div>
            <h3>Progress board</h3>
            <p>Your saved quiz performance by family and by deck.</p>
          </div>
        </div>
        <div className="stats-grid">
          <article className="stat-panel">
            <span className="mini-label">Sessions</span>
            <strong>{totalSessions}</strong>
          </article>
          <article className="stat-panel">
            <span className="mini-label">Accuracy</span>
            <strong>{overallAccuracy}%</strong>
          </article>
          <article className="stat-panel">
            <span className="mini-label">Correct</span>
            <strong>{totalCorrect}</strong>
          </article>
          <article className="stat-panel">
            <span className="mini-label">Answered</span>
            <strong>{totalAttempted}</strong>
          </article>
        </div>
        <div className="completion-card">
          <div className="completion-head">
            <div>
              <span className="mini-label">Overall completion</span>
              <strong>{overallPassedUnits} / {overallTotalUnits} passed</strong>
              <p>Vocabulary, grammar, phrases, and verbs all count once their best score is above 80%.</p>
            </div>
            <div className="completion-percent">{overallCompletionPercent}%</div>
          </div>
          <div className="progress-track completion-track">
            <div className="progress-fill" style={{ width: `${overallCompletionPercent}%` }} />
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="split-header">
          <div>
            <h3>Completion by area</h3>
            <p>Each area tracks how many units are fully passed using the same 80% rule.</p>
          </div>
        </div>
        <div className="completion-grid">
          {completionByArea.map((area) => (
            <article key={area.label} className="completion-card compact-completion-card">
              <div className="completion-head">
                <div>
                  <span className="mini-label">{area.label}</span>
                  <strong>{area.passed} / {area.total} passed</strong>
                </div>
                <div className="completion-percent">{area.percent}%</div>
              </div>
              <div className="progress-track completion-track">
                <div className="progress-fill" style={{ width: `${area.percent}%` }} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel two-column">
        <div>
          <div className="split-header">
            <div>
              <h3>By family</h3>
              <p>Which study area is strongest overall.</p>
            </div>
          </div>
          <div className="list-stack">
            {familyStats.length ? (
              familyStats.map((family) => (
                <div key={family.label} className="list-row">
                  <div>
                    <strong>{family.label}</strong>
                    <small>{family.stats.sessions} sessions · best {family.stats.bestScore}%</small>
                  </div>
                  <span>{family.accuracy}% accuracy</span>
                </div>
              ))
            ) : (
              <div className="empty-state">Finish a few quizzes and your grouped progress will appear here.</div>
            )}
          </div>
        </div>

        <div>
          <div className="split-header">
            <div>
              <h3>By deck</h3>
              <p>Sort and filter to find retake targets.</p>
            </div>
          </div>

          <div className="filter-bar">
            <button className={deckFamily === "all" ? "filter-chip active" : "filter-chip"} onClick={() => setDeckFamily("all")}>
              All<span className="chip-count">{rankedDecks.length}</span>
            </button>
            {families.map((f) => (
              <button
                key={f}
                className={deckFamily === f ? "filter-chip active" : "filter-chip"}
                onClick={() => setDeckFamily(f)}
              >
                {f}<span className="chip-count">{rankedDecks.filter((d) => d.family === f).length}</span>
              </button>
            ))}
          </div>

          <div style={{ marginTop: 10, marginBottom: 6 }}>
            <select className="sort-select" value={deckSort} onChange={(e) => setDeckSort(e.target.value as DeckSort)}>
              <option value="last">Sort: Last score</option>
              <option value="best">Sort: Best score</option>
              <option value="accuracy">Sort: Accuracy</option>
              <option value="az">Sort: A &ndash; Z</option>
            </select>
          </div>

          <div className="list-stack">
            {sortedDecks.length ? (
              sortedDecks.map((deck) => (
                <div key={deck.deckId} className="list-row">
                  <div>
                    <strong>{deck.label}</strong>
                    <small>{deck.family} &middot; best {deck.stats.bestScore}% &middot; {deck.stats.sessions} session{deck.stats.sessions !== 1 ? "s" : ""}</small>
                  </div>
                  <span>last {deck.stats.lastScore}%</span>
                </div>
              ))
            ) : (
              <div className="empty-state">{rankedDecks.length ? "No decks in this family." : "No deck runs saved yet."}</div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
