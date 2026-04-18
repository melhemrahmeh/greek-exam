import type { VocabEntry } from "../../features/study/types";

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
  const normalizedQuery = vocabSearch.trim().toLowerCase();
  const filteredCategories = normalizedQuery
    ? categoryEntries.filter(([category, entries]) => {
        if (category.toLowerCase().includes(normalizedQuery)) return true;
        return entries.some(([gr, en]) => gr.toLowerCase().includes(normalizedQuery) || en.toLowerCase().includes(normalizedQuery));
      })
    : categoryEntries;

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

      <div className="vocab-layout">
        <aside className="vocab-sidebar">
          <div className="vocab-list">
            {filteredCategories.map(([category, entries]) => {
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
                    <small>{entries.length} words</small>
                  </div>
                  <div className="vocab-category-score">
                    <span className="section-label">Best</span>
                    <strong>{bestScore !== null ? `${bestScore}%` : "--"}</strong>
                  </div>
                </button>
              );
            })}
            {!filteredCategories.length && <div className="empty-state">No vocab matches that search yet.</div>}
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
                      {selectedCategoryBestScore !== null ? ` · best score ${selectedCategoryBestScore}%` : " · no saved score yet"}
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

              <div className="vocab-preview">
                {selectedWords.slice(0, 18).map(([gr, en]) => (
                  <div key={`${selectedCategory}-${gr}`} className="vocab-word-row">
                    <div>
                      <strong>{gr}</strong>
                      <small>{selectedCategory}</small>
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
