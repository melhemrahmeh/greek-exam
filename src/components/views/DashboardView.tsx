import type { DeckStats, ReviewCard } from "../../features/study/types";

type RankedDeck = {
  deckId: string;
  label: string;
  family: string;
  accuracy: number;
  stats: DeckStats;
};

type DashboardViewProps = {
  overallAccuracy: number;
  totalSessions: number;
  mistakesCount: number;
  totalWords: number;
  categoryCount: number;
  phraseSectionCount: number;
  verbsCount: number;
  totalVerbForms: number;
  rankedDecks: RankedDeck[];
  favorites: ReviewCard[];
  mistakes: ReviewCard[];
  onStartMixedGrammar: () => void;
  onOpenVerbs: () => void;
  onOpenFavoritesQuiz: () => void;
  onOpenMistakesQuiz: () => void;
};

export function DashboardView({
  overallAccuracy,
  totalSessions,
  mistakesCount,
  totalWords,
  categoryCount,
  phraseSectionCount,
  verbsCount,
  totalVerbForms,
  rankedDecks,
  favorites,
  mistakes,
  onStartMixedGrammar,
  onOpenVerbs,
  onOpenFavoritesQuiz,
  onOpenMistakesQuiz,
}: DashboardViewProps) {
  return (
    <>
      <section className="dashboard-shell">
        <article className="dashboard-lead">
          <span className="mini-label">Study dashboard</span>
          <h2>Train the exam the way you actually revise</h2>
          <p>Mix grammar, verbs, vocabulary, phrases, and recovery decks from one place instead of bouncing around disconnected screens.</p>
          <div className="dashboard-kpis">
            <div className="dashboard-kpi">
              <strong>{overallAccuracy}%</strong>
              <span>overall accuracy</span>
            </div>
            <div className="dashboard-kpi">
              <strong>{totalSessions}</strong>
              <span>quiz sessions</span>
            </div>
            <div className="dashboard-kpi">
              <strong>{mistakesCount}</strong>
              <span>cards to recover</span>
            </div>
          </div>
          <div className="dashboard-cta-row">
            <button className="primary-button" onClick={onStartMixedGrammar}>
              Start mixed quiz
            </button>
            <button className="secondary-button" onClick={onOpenVerbs}>
              Open verb studio
            </button>
          </div>
        </article>

        <div className="dashboard-side">
          <article className="stat-panel standout">
            <span className="mini-label">Coverage</span>
            <strong>{totalWords}</strong>
            <p>{categoryCount} vocab categories and {phraseSectionCount} phrase sections ready.</p>
          </article>
          <article className="stat-panel">
            <span className="mini-label">Verb engine</span>
            <strong>{verbsCount}</strong>
            <p>{totalVerbForms} forms across present, past, and future drills.</p>
          </article>
        </div>
      </section>

      <section className="panel">
        <div className="split-header">
          <div>
            <h3>Deck performance</h3>
            <p>Every quiz deck, ordered by latest score so it is easy to spot what is strong and what still needs work.</p>
          </div>
        </div>
        <div className="list-stack">
          {rankedDecks.length ? (
            rankedDecks.map((deck) => (
              <div key={deck.deckId} className="list-row">
                <div>
                  <strong>{deck.label}</strong>
                  <small>{deck.family} · {deck.stats.sessions} sessions · best {deck.stats.bestScore}%</small>
                </div>
                <span>last {deck.stats.lastScore}% · accuracy {deck.accuracy}%</span>
              </div>
            ))
          ) : (
            <div className="empty-state">No deck history yet. Once you finish quizzes, they will show up here automatically.</div>
          )}
        </div>
      </section>

      <section className="panel two-column">
        <div>
          <div className="split-header">
            <div>
              <h3>Favorites</h3>
              <p>{favorites.length} saved review cards</p>
            </div>
            <button className="secondary-button" disabled={!favorites.length} onClick={onOpenFavoritesQuiz}>
              Study
            </button>
          </div>
          <div className="list-stack compact">
            {favorites.slice(0, 12).map((card) => (
              <div key={card.id} className="list-row">
                <div>
                  <strong>{card.front}</strong>
                  <small>{card.source}</small>
                </div>
                <span>{card.back}</span>
              </div>
            ))}
            {!favorites.length && <div className="empty-state">Save cards from any quiz to build a custom review deck.</div>}
          </div>
        </div>

        <div>
          <div className="split-header">
            <div>
              <h3>Mistakes</h3>
              <p>{mistakes.length} cards to revisit</p>
            </div>
            <button className="secondary-button" disabled={!mistakes.length} onClick={onOpenMistakesQuiz}>
              Recover
            </button>
          </div>
          <div className="list-stack compact">
            {mistakes.slice(0, 12).map((card) => (
              <div key={card.id} className="list-row">
                <div>
                  <strong>{card.front}</strong>
                  <small>{card.source}</small>
                </div>
                <span>{card.back}</span>
              </div>
            ))}
            {!mistakes.length && <div className="empty-state">Wrong quiz answers will automatically show up here.</div>}
          </div>
        </div>
      </section>
    </>
  );
}
