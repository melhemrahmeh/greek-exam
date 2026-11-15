import type { ReactNode } from "react";
import { Icon, ProgressBar } from "./ui";

type FocusBarProps = {
  onClose: () => void;
  closeLabel?: string;
  title?: string;
  progress?: { current: number; total: number };
  actions?: ReactNode;
};

/** Slim top bar for focus mode (quiz runner and games): close, progress, a few actions. */
export function FocusBar({ onClose, closeLabel = "Close", title, progress, actions }: FocusBarProps) {
  return (
    <header className="focus-bar">
      <div className="container">
        <button className="icon-button" onClick={onClose} aria-label={closeLabel} title={`${closeLabel} (Esc)`}>
          <Icon name="close" />
        </button>
        <div className="focus-bar-middle">
          {progress ? (
            <>
              <ProgressBar value={(progress.current / progress.total) * 100} label="Quiz progress" />
              <span className="focus-bar-count">
                {progress.current} / {progress.total}
              </span>
            </>
          ) : (
            title && <span className="focus-bar-title">{title}</span>
          )}
        </div>
        {actions}
      </div>
    </header>
  );
}
