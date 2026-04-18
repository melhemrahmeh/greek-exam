import type { DeckStats, ReviewCard, Theme } from "../../features/study/types";
import { getAvatarStyle, getInitials, getProfileName } from "../../features/study/utils";

type RankedDeck = {
  deckId: string;
  label: string;
  family: string;
  accuracy: number;
  stats: DeckStats;
};

type ProfileViewProps = {
  profileEmail: string;
  theme: Theme;
  trackedDecks: number;
  isSyncing: boolean;
  strongestDeck: RankedDeck | null;
  needsWorkDeck: RankedDeck | null;
  totalSessions: number;
  overallAccuracy: number;
  totalCorrect: number;
  favorites: ReviewCard[];
  mistakes: ReviewCard[];
  authLoading: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
  onOpenProgress: () => void;
  onOpenFavoritesQuiz: () => void;
  onOpenMistakesQuiz: () => void;
  onResetProgress: () => void;
};

export function ProfileView({
  profileEmail,
  theme,
  trackedDecks,
  isSyncing,
  strongestDeck,
  needsWorkDeck,
  totalSessions,
  overallAccuracy,
  totalCorrect,
  favorites,
  mistakes,
  authLoading,
  onToggleTheme,
  onLogout,
  onOpenProgress,
  onOpenFavoritesQuiz,
  onOpenMistakesQuiz,
  onResetProgress,
}: ProfileViewProps) {
  const profileName = getProfileName(profileEmail);
  const profileInitials = getInitials(profileEmail);
  const profileAvatarStyle = getAvatarStyle(profileEmail);

  return (
    <>
      <section className="panel profile-shell">
        <div className="profile-card">
          <div className="profile-hero">
            <div className="profile-avatar" style={profileAvatarStyle} aria-hidden="true">
              {profileInitials}
            </div>
            <div className="profile-copy">
              <span className="mini-label">Account</span>
              <h3>{profileName}</h3>
              <p>{profileEmail}</p>
            </div>
          </div>
          <div className="profile-status-row">
            <div className="pill">{theme === "dark" ? "Dark mode" : "Light mode"}</div>
            <div className="pill">{trackedDecks} tracked decks</div>
            {isSyncing && <div className="pill">Syncing...</div>}
          </div>
          <div className="profile-highlight-row">
            <div className="profile-highlight">
              <small>Best deck</small>
              <strong>{strongestDeck ? `${strongestDeck.stats.bestScore}%` : "--"}</strong>
              <span>{strongestDeck?.label ?? "Finish a quiz to set your first benchmark."}</span>
            </div>
            <div className="profile-highlight">
              <small>Retake target</small>
              <strong>{needsWorkDeck ? `${needsWorkDeck.stats.lastScore}%` : "--"}</strong>
              <span>{needsWorkDeck?.label ?? "Your next weak spot will show up here."}</span>
            </div>
          </div>
          <div className="profile-actions">
            <button className="secondary-button" onClick={onToggleTheme}>
              Toggle theme
            </button>
            <button className="ghost-button" onClick={onLogout} disabled={authLoading}>
              Logout
            </button>
          </div>
        </div>

        <div className="profile-summary">
          <article className="stat-panel">
            <span className="mini-label">Sessions</span>
            <strong>{totalSessions}</strong>
            <p>Total completed quiz runs saved to your account.</p>
          </article>
          <article className="stat-panel">
            <span className="mini-label">Accuracy</span>
            <strong>{overallAccuracy}%</strong>
            <p>{totalCorrect} correct answers synced so far.</p>
          </article>
          <article className="stat-panel">
            <span className="mini-label">Saved cards</span>
            <strong>{favorites.length}</strong>
            <p>Favorites plus mistake recovery are attached to this profile.</p>
          </article>
        </div>
      </section>

      <section className="panel">
        <div className="split-header">
          <div>
            <h3>Account actions</h3>
            <p>Quick controls for your synced study profile.</p>
          </div>
        </div>
        <div className="dashboard-utility-grid">
          <button className="mini-card utility-card" onClick={onOpenProgress}>
            <span className="mini-label">Stats</span>
            <strong>{trackedDecks}</strong>
            <span>Open progress board</span>
          </button>
          <button className="mini-card utility-card" onClick={onOpenFavoritesQuiz} disabled={!favorites.length}>
            <span className="mini-label">Review</span>
            <strong>{favorites.length}</strong>
            <span>Favorites deck</span>
          </button>
          <button className="mini-card utility-card" onClick={onOpenMistakesQuiz} disabled={!mistakes.length}>
            <span className="mini-label">Recover</span>
            <strong>{mistakes.length}</strong>
            <span>Mistakes deck</span>
          </button>
          <button className="mini-card utility-card" onClick={onResetProgress}>
            <span className="mini-label">Reset</span>
            <strong>0</strong>
            <span>Clear synced progress</span>
          </button>
        </div>
      </section>
    </>
  );
}
