import { getInitials } from "../features/study/utils";
import type { Theme } from "../features/study/types";
import { Icon } from "./ui";

type AppHeaderProps = {
  daysToExam?: number;
  onToggleTheme: () => void;
  onOpenProfile?: () => void;
  profileName?: string;
  profileActive?: boolean;
  theme: Theme;
};

export function AppHeader({ daysToExam, onToggleTheme, onOpenProfile, profileName, profileActive, theme }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="container">
        <span className="app-name">Greek Exam Studio</span>
        <div className="header-actions">
          {typeof daysToExam === "number" && daysToExam > 0 && (
            <span className="countdown-chip">
              {daysToExam} {daysToExam === 1 ? "day" : "days"} to exam
            </span>
          )}
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          {profileName && onOpenProfile && (
            <button
              className="avatar-button"
              onClick={onOpenProfile}
              aria-label={`Profile: ${profileName}`}
              aria-current={profileActive ? "page" : undefined}
              title={profileName}
            >
              <span className="avatar" aria-hidden="true">
                {getInitials(profileName)}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export function ThemeToggle({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button className="icon-button" onClick={onToggle} aria-label={`Switch to ${next} theme`} title={`Switch to ${next} theme`}>
      <Icon name={theme === "dark" ? "sun" : "moon"} />
    </button>
  );
}
