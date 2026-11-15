import type { ReactNode } from "react";
import { Icon, ScoreBadge } from "./ui";
import { formatPassFail } from "../features/study/utils";

type DeckRowProps = {
  title: string;
  meta: string;
  score: number | null;
  passFail?: { passed: number; failed: number };
  active: boolean;
  onSelect: () => void;
};

/** One deck in a list: title, a short meta line, and a score badge. Pass/fail counts live in the tooltip. */
export function DeckRow({ title, meta, score, passFail, active, onSelect }: DeckRowProps) {
  const passFailText = passFail ? formatPassFail(passFail.passed, passFail.failed) : "";
  return (
    <button className="row deck-row" aria-current={active ? "true" : undefined} onClick={onSelect} title={passFailText || undefined}>
      <div className="row-main">
        <strong>{title}</strong>
        <small>{meta}</small>
      </div>
      <ScoreBadge score={score} title={passFailText || undefined} />
    </button>
  );
}

type DeckLayoutProps = {
  list: ReactNode;
  detail: ReactNode | null;
  emptyDetail: ReactNode;
  backLabel: string;
  onBack: () => void;
};

/**
 * List + detail. On desktop the detail is a side panel; on mobile the detail replaces the list
 * and shows a back button.
 */
export function DeckLayout({ list, detail, emptyDetail, backLabel, onBack }: DeckLayoutProps) {
  return (
    <div className={detail ? "deck-layout has-selection" : "deck-layout"}>
      <div className="deck-list panel panel-flush">{list}</div>
      <div className="deck-detail">
        {detail ? (
          <>
            <button className="btn btn-ghost deck-back" onClick={onBack}>
              <Icon name="back" width={18} height={18} />
              {backLabel}
            </button>
            {detail}
          </>
        ) : (
          <div className="panel deck-detail-empty">{emptyDetail}</div>
        )}
      </div>
    </div>
  );
}
