import type { VocabEntry } from "../../features/study/types";

type VocabViewProps = {
  categoryEntries: [string, VocabEntry[]][];
  vocabCategoryBestScores: Record<string, number | null>;
  selectedCategory: string | null;
  vocabSearch: string;
  onSelectCategory: (category: string) => void;
  onVocabSearchChange: (value: string) => void;
  onStartQuiz: (category: string, direction: "gr-en" | "en-gr") => void;
};

export function VocabView({
  categoryEntries,
  vocabCategoryBestScores,
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
    <section className="panel">
      <div className="split-header">
        <div>
          <h3>Vocabulary decks</h3>
          <p>Open a category, see your best historical score, and decide whether it needs another retake.</p>
        </div>
      </div>

      <input
        className="search-input"
        value={vocabSearch}
        onChange={(event) => onVocabSearchChange(event.target.value)}
        placeholder="Search categories or words"
      />

      <div className="two-column progress-layout">
        <div className="list-stack">
          {filteredCategories.map(([category, entries]) => (
            <button key={category} className="list-button list-row" onClick={() => onSelectCategory(category)}>
              <div>
                <strong>{category}</strong>
                <small>{entries.length} words</small>
              </div>
              <span>{vocabCategoryBestScores[category] !== null ? `best ${vocabCategoryBestScores[category]}%` : "no score yet"}</span>
            </button>
          ))}
          {!filteredCategories.length && <div className="empty-state">No vocab matches that search yet.</div>}
        </div>

        <div className="list-stack">
          {selectedCategory ? (
            <>
              <div className="split-header">
                <div>
                  <h3>{selectedCategory}</h3>
                  <p>{selectedCategoryBestScore !== null ? `Best score: ${selectedCategoryBestScore}%` : "No saved score for this category yet."}</p>
                </div>
              </div>
              <div className="phrase-actions">
                <button className="primary-button" onClick={() => onStartQuiz(selectedCategory, "gr-en")}>
                  Greek to English
                </button>
                <button className="secondary-button" onClick={() => onStartQuiz(selectedCategory, "en-gr")}>
                  English to Greek
                </button>
              </div>
              <div className="list-stack compact">
                {selectedWords.slice(0, 18).map(([gr, en]) => (
                  <div key={`${selectedCategory}-${gr}`} className="list-row">
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
            <div className="empty-state">Pick a vocab category to see the word preview and launch drills.</div>
          )}
        </div>
      </div>
    </section>
  );
}
