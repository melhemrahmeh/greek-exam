import { getAvatarStyle, getInitials } from "../features/study/utils";
import type { Theme } from "../features/study/types";

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  onBack?: () => void;
  onToggleTheme: () => void;
  onOpenProfile?: () => void;
  profileEmail?: string;
  profileActive?: boolean;
  theme: Theme;
};

export function AppHeader({
  title,
  subtitle,
  eyebrow,
  onBack,
  onToggleTheme,
  onOpenProfile,
  profileEmail,
  profileActive,
  theme,
}: AppHeaderProps) {
  return (
    <header className="hero">
      <div className="hero-topline">
        {onBack ? (
          <button className="ghost-button" onClick={onBack}>
            {"\u2190"} Back
          </button>
        ) : (
          <span className="brand-chip">Greek A2 Builder</span>
        )}
        <div className="hero-actions">
          {profileEmail && onOpenProfile && (
            <button
              className={profileActive ? "header-profile-button active" : "header-profile-button"}
              onClick={onOpenProfile}
              aria-label="Open profile"
              title={profileEmail}
            >
              <span className="header-profile-avatar" style={getAvatarStyle(profileEmail)} aria-hidden="true">
                {getInitials(profileEmail)}
              </span>
              <span className="header-profile-copy">
                <strong>Profile</strong>
                <small>{profileEmail}</small>
              </span>
            </button>
          )}
          <button className="theme-button" onClick={onToggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? "\u2600" : "\u263E"}
          </button>
        </div>
      </div>
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </header>
  );
}
