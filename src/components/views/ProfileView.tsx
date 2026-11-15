import type { DeckStats, ReviewCard, Theme } from "../../features/study/types";
import { getInitials } from "../../features/study/utils";
import { Icon } from "../ui";

type RankedDeck = {
  deckId: string;
  label: string;
  family: string;
  accuracy: number;
  stats: DeckStats;
};

type ProfileViewProps = {
  profileName: string;
  theme: Theme;
  trackedDecks: number;
  strongestDeck: RankedDeck | null;
  needsWorkDeck: RankedDeck | null;
  totalSessions: number;
  overallAccuracy: number;
  favorites: ReviewCard[];
  mistakes: ReviewCard[];
  onToggleTheme: () => void;
  onLogout: () => void;
  onOpenProgress: () => void;
  onResetProgress: () => void;
};

export function ProfileView({
  profileName,
  theme,
  trackedDecks,
  strongestDeck,
  needsWorkDeck,
  totalSessions,
  overallAccuracy,
  favorites,
  mistakes,
  onToggleTheme,
  onLogout,
  onOpenProgress,
  onResetProgress,
}: ProfileViewProps) {
  return (
    <>
      <section className="profile-head">
        <span className="avatar avatar-lg" aria-hidden="true">
          {getInitials(profileName)}
        </span>
        <div>
          <h1>{profileName}</h1>
          <p className="muted">Progress is saved on this device.</p>
        </div>
        <button className="btn btn-ghost profile-switch" onClick={onLogout}>
          Switch user
        </button>
      </section>

      <section className="stat-strip" aria-label="Your stats">
        <div className="stat">
          <strong>{totalSessions}</strong>
          <span>sessions</span>
        </div>
        <div className="stat">
          <strong>{totalSessions ? `${overallAccuracy}%` : "–"}</strong>
          <span>accuracy</span>
        </div>
        <div className="stat">
          <strong>{favorites.length}</strong>
          <span>favorites</span>
        </div>
        <div className="stat">
          <strong>{mistakes.length}</strong>
          <span>mistakes saved</span>
        </div>
      </section>

      <section className="panel panel-flush" aria-label="Profile">
        <div className="rows">
          <div className="row">
            <div className="row-main">
              <strong>Best deck</strong>
              <small>{strongestDeck?.label ?? "Finish a quiz to set a benchmark."}</small>
            </div>
            <span className="row-end">{strongestDeck ? `${strongestDeck.stats.bestScore}%` : "–"}</span>
          </div>
          <div className="row">
            <div className="row-main">
              <strong>Retake target</strong>
              <small>{needsWorkDeck?.label ?? "Your weakest deck will show here."}</small>
            </div>
            <span className="row-end">{needsWorkDeck ? `${needsWorkDeck.stats.lastScore}%` : "–"}</span>
          </div>
          <button className="row" onClick={onOpenProgress}>
            <div className="row-main">
              <strong>Progress</strong>
              <small>{trackedDecks} tracked decks</small>
            </div>
            <span className="row-end">
              <Icon name="chart" width={18} height={18} />
            </span>
          </button>
          <button className="row" onClick={onToggleTheme}>
            <div className="row-main">
              <strong>Theme</strong>
              <small>{theme === "dark" ? "Dark" : "Light"}</small>
            </div>
            <span className="row-end">
              <Icon name={theme === "dark" ? "sun" : "moon"} width={18} height={18} />
            </span>
          </button>
        </div>
      </section>

      <section className="danger-zone" aria-label="Danger zone">
        <button className="btn btn-danger-text" onClick={onResetProgress}>
          Reset progress
        </button>
        <p className="muted">Clears every score, favorite and saved mistake for {profileName}. This can't be undone.</p>
      </section>
    </>
  );
}
