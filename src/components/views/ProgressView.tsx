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

type ProgressViewProps = {
  totalSessions: number;
  overallAccuracy: number;
  totalCorrect: number;
  totalAttempted: number;
  familyStats: FamilyStat[];
  rankedDecks: RankedDeck[];
};

export function ProgressView({
  totalSessions,
  overallAccuracy,
  totalCorrect,
  totalAttempted,
  familyStats,
  rankedDecks,
}: ProgressViewProps) {
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
              <p>Latest score first, so retake targets stay obvious.</p>
            </div>
          </div>
          <div className="list-stack">
            {rankedDecks.length ? (
              rankedDecks.map((deck) => (
                <div key={deck.deckId} className="list-row">
                  <div>
                    <strong>{deck.label}</strong>
                    <small>{deck.family} · best {deck.stats.bestScore}%</small>
                  </div>
                  <span>last {deck.stats.lastScore}%</span>
                </div>
              ))
            ) : (
              <div className="empty-state">No deck runs saved yet.</div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
