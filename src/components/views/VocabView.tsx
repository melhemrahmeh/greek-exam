import { useState } from "react";
import type { VocabEntry } from "../../features/study/types";

type VocabSort = "default" | "az" | "score" | "words";

type VocabViewProps = {
  categoryEntries: [string, VocabEntry[]][];
  vocabCategoryBestScores: Record<string, number | null>;
  passedCategories: number;
  totalCategories: number;
  completionPercent: number;
  selectedCategory: string | null;
  vocabSearch: string;
  onSelectCategory: (category: string) => void;
  onVocabSearchChange: (value: string) => void;
  onStartQuiz: (category: string, direction: "gr-en" | "en-gr") => void;
};

const sortOptions: { key: VocabSort; label: string }[] = [
  { key: "default", label: "Default" },
  { key: "az", label: "A \u2013 Z" },
  { key: "score", label: "By score" },
  { key: "words", label: "Most words" },
];

export function VocabView({
  categoryEntries,
  vocabCategoryBestScores,
  passedCategories,
  totalCategories,
  completionPercent,
  selectedCategory,
  vocabSearch,
  onSelectCategory,
  onVocabSearchChange,
  onStartQuiz,
}: VocabViewProps) {
  const [sort, setSort] = useState<VocabSort>("default");
  const [showAll, setShowAll] = useState(false);

  const normalizedQuery = vocabSearch.trim().toLowerCase();
  const filteredCategories = normalizedQuery
    ? categoryEntries.filter(([category, entries]) => {
        if (category.toLowerCase().includes(normalizedQuery)) return true;
        return entries.some(([gr, en]) => gr.toLowerCase().includes(normalizedQuery) || en.toLowerCase().includes(normalizedQuery));
      })
    : categoryEntries;

  const sortedCategories = [...filteredCategories].sort((a, b) => {
    if (sort === "az") return a[0].localeCompare(b[0]);
    if (sort === "words") return b[1].length - a[1].length;
    if (sort === "score") {
      const sa = vocabCategoryBestScores[a[0]] ?? -1;
      const sb = vocabCategoryBestScores[b[0]] ?? -1;
      return sb - sa;
    }
    return 0;
  });

  const selectedWords = selectedCategory ? categoryEntries.find(([category]) => category === selectedCategory)?.[1] ?? [] : [];
  const selectedCategoryBestScore = selectedCategory ? vocabCategoryBestScores[selectedCategory] ?? null : null;

  return (
    <section className="panel vocab-shell">
      <div className="split-header">
        <div>
          <h3>Vocabulary decks</h3>
          <p>Open a category, check your best score, and jump back into the direction you want to improve.</p>
        </div>
      </div>

      <div className="vocab-progress-card">
        <div className="vocab-progress-head">
          <div>
            <span className="mini-label">Category completion</span>
            <strong>
              {passedCategories} / {totalCategories} passed
            </strong>
            <p>Categories count as passed once your best score is above 80%.</p>
          </div>
          <div className="vocab-progress-percent">{completionPercent}%</div>
        </div>
        <div className="progress-track vocab-progress-track">
          <div className="progress-fill" style={{ width: `${completionPercent}%` }} />
        </div>
      </div>

      <input
        className="search-input"
        value={vocabSearch}
        onChange={(event) => onVocabSearchChange(event.target.value)}
        placeholder="Search categories or words"
      />

      <div className="filter-bar">
        {sortOptions.map((opt) => (
          <button
            key={opt.key}
            className={sort === opt.key ? "filter-chip active" : "filter-chip"}
            onClick={() => setSort(opt.key)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="vocab-layout">
        <aside className="vocab-sidebar">
          <div className="vocab-list">
            {sortedCategories.map(([category, entries]) => {
              const isActive = selectedCategory === category;
              const bestScore = vocabCategoryBestScores[category];

              return (
                <button
                  key={category}
                  className={isActive ? "vocab-category-card active" : "vocab-category-card"}
                  onClick={() => onSelectCategory(category)}
                >
                  <div className="vocab-category-main">
                    <strong>{category}</strong>
                    <small>
                      {entries.length} words
                      {bestScore !== null && bestScore >= 80 ? " \u2713" : ""}
                    </small>
                  </div>
                  <div className="vocab-category-score">
                    <span className="section-label">Best</span>
                    <strong>{bestScore !== null ? `${bestScore}%` : "--"}</strong>
                    {bestScore !== null && (
                      <span className="score-bar-mini">
                        <span className="score-bar-mini-fill" style={{ width: `${bestScore}%` }} />
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
            {!sortedCategories.length && <div className="empty-state">No vocab matches that search yet.</div>}
          </div>
        </aside>

        <div className="vocab-detail">
          {selectedCategory ? (
            <>
              <div className="vocab-detail-card">
                <div className="vocab-detail-top">
                  <div>
                    <span className="mini-label">Selected deck</span>
                    <h3>{selectedCategory}</h3>
                    <p>
                      {selectedWords.length} words
                      {selectedCategoryBestScore !== null ? ` \u00b7 best score ${selectedCategoryBestScore}%` : " \u00b7 no saved score yet"}
                    </p>
                  </div>
                  <div className="vocab-detail-score">
                    <small>Best score</small>
                    <strong>{selectedCategoryBestScore !== null ? `${selectedCategoryBestScore}%` : "--"}</strong>
                  </div>
                </div>

                <div className="vocab-actions">
                  <button className="primary-button" onClick={() => onStartQuiz(selectedCategory, "gr-en")}>
                    Greek to English
                  </button>
                  <button className="secondary-button" onClick={() => onStartQuiz(selectedCategory, "en-gr")}>
                    English to Greek
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <span style={{ color: "var(--text-muted)", fontSize: "0.88rem", fontWeight: 700 }}>
                  {showAll ? selectedWords.length : Math.min(selectedWords.length, 18)} / {selectedWords.length} words
                </span>
                {selectedWords.length > 18 && (
                  <button className="filter-chip" onClick={() => setShowAll(!showAll)}>
                    {showAll ? "Show less" : `Show all ${selectedWords.length}`}
                  </button>
                )}
              </div>

              <div className="vocab-preview">
                {(showAll ? selectedWords : selectedWords.slice(0, 18)).map(([gr, en], i) => (
                  <div key={`${selectedCategory}-${gr}`} className="vocab-word-row">
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span className="vocab-word-index">{i + 1}</span>
                      <div>
                        <strong>{gr}</strong>
                        <small>{selectedCategory}</small>
                      </div>
                    </div>
                    <span>{en}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">Pick a vocab category to see its score, preview its words, and launch a quiz.</div>
          )}
        </div>
      </div>
    </section>
  );
}
