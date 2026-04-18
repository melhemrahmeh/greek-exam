import { startTransition } from "react";
import type { View } from "../features/study/types";

type TabBarProps = {
  view: View;
  setView: (next: View) => void;
};

export function TabBar({ view, setView }: TabBarProps) {
  const tabs: Array<[Exclude<View, "profile">, string]> = [
    ["dashboard", "Dashboard"],
    ["vocab", "Vocab"],
    ["verbs", "Verbs"],
    ["grammar", "Grammar"],
    ["phrases", "Phrases"],
    ["progress", "Progress"],
  ];

  return (
    <nav className="tabbar">
      {tabs.map(([key, label]) => (
        <button
          key={key}
          className={view === key ? "tab active" : "tab"}
          onClick={() => startTransition(() => setView(key))}
          aria-label={label}
          title={label}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
