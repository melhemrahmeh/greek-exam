import { startTransition } from "react";
import type { View } from "../features/study/types";
import { Icon } from "./ui";

type TabBarProps = {
  view: View;
  setView: (next: View) => void;
};

const tabs = [
  { key: "dashboard", label: "Home", icon: "home" },
  { key: "vocab", label: "Vocab", icon: "book" },
  { key: "verbs", label: "Verbs", icon: "verb" },
  { key: "grammar", label: "Grammar", icon: "grammar" },
  { key: "phrases", label: "Phrases", icon: "chat" },
] as const;

export function TabBar({ view, setView }: TabBarProps) {
  return (
    <nav className="tabbar" aria-label="Main">
      <div className="container">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className="tab"
            aria-current={view === tab.key ? "page" : undefined}
            onClick={() => startTransition(() => setView(tab.key))}
          >
            <Icon name={tab.icon} className="tab-icon" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
