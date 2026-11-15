import { useState } from "react";
import type { VocabEntry } from "../../features/study/types";
import { DeckLayout, DeckRow } from "../DeckLayout";
import { EmptyState, ProgressBar, ScoreBadge, SearchField, Segmented } from "../ui";

type VocabSort = "default" | "az" | "score" | "words";

type VocabViewProps = {
  categoryEntries: [string, VocabEntry[]][];
  vocabCategoryBestScores: Record<string, number | null>;
  vocabCategoryPassFail: Record<string, { passed: number; failed: number }>;
  passedCategories: number;
  totalCategories: number;
  completionPercent: number;
  selectedCategory: string | null;
  vocabSearch: string;
  onSelectCategory: (category: string | null) => void;
  onVocabSearchChange: (value: string) => void;
  onStartQuiz: (category: string, direction: "gr-en" | "en-gr") => void;
  onStartMixedQuiz: (direction: "gr-en" | "en-gr") => void;
};

const sortOptions = [
  { value: "default", label: "Default" },
  { value: "az", label: "A–Z" },
  { value: "score", label: "Score" },
  { value: "words", label: "Size" },
] as const;

const PREVIEW_COUNT = 18;

export function VocabView({
  categoryEntries,
  vocabCategoryBestScores,
  vocabCategoryPassFail,
  passedCategories,
  totalCategories,
  completionPercent,
  selectedCategory,
  vocabSearch,
  onSelectCategory,
  onVocabSearchChange,
  onStartQuiz,
  onStartMixedQuiz,
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
    if (sort === "score") return (vocabCategoryBestScores[b[0]] ?? -1) - (vocabCategoryBestScores[a[0]] ?? -1);
    return 0;
  });

  const selectedWords = selectedCategory ? (categoryEntries.find(([category]) => category === selectedCategory)?.[1] ?? []) : [];
  const visibleWords = showAll ? selectedWords : selectedWords.slice(0, PREVIEW_COUNT);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Vocabulary</h1>
          <p>
            {passedCategories} / {totalCategories} categories passed
          </p>
        </div>
        <div className="btn-row">
          <button className="btn btn-secondary" onClick={() => onStartMixedQuiz("gr-en")} title="30 random words from all categories">
            Random GR → EN
          </button>
          <button className="btn btn-secondary" onClick={() => onStartMixedQuiz("en-gr")} title="30 random words from all categories">
            Random EN → GR
          </button>
        </div>
      </div>
      <ProgressBar value={completionPercent} label="Vocabulary completion" />

      <div className="toolbar">
        <SearchField label="Search" value={vocabSearch} placeholder="Categories or words" onChange={onVocabSearchChange} />
        <Segmented label="Sort categories" value={sort} options={sortOptions} onChange={setSort} />
      </div>

      <DeckLayout
        backLabel="All categories"
        onBack={() => onSelectCategory(null)}
        list={
          sortedCategories.length ? (
            <div className="rows">
              {sortedCategories.map(([category, entries]) => (
                <DeckRow
                  key={category}
                  title={category}
                  meta={`${entries.length} words`}
                  score={vocabCategoryBestScores[category] ?? null}
                  passFail={vocabCategoryPassFail[category]}
                  active={selectedCategory === category}
                  onSelect={() => {
                    setShowAll(false);
                    onSelectCategory(category);
                  }}
                />
              ))}
            </div>
          ) : (
            <EmptyState>No categories match “{vocabSearch}”.</EmptyState>
          )
        }
        emptyDetail={<EmptyState icon="book">Pick a category to see its words and start a quiz.</EmptyState>}
        detail={
          selectedCategory && (
            <section className="panel deck-panel" aria-labelledby="deck-title">
              <div className="deck-panel-head">
                <div>
                  <h2 id="deck-title">{selectedCategory}</h2>
                  <span className="muted">{selectedWords.length} words</span>
                </div>
                <ScoreBadge score={vocabCategoryBestScores[selectedCategory] ?? null} />
              </div>
              <div className="btn-row direction-buttons">
                <button className="btn btn-primary" onClick={() => onStartQuiz(selectedCategory, "gr-en")}>
                  Greek → English
                </button>
                <button className="btn btn-secondary" onClick={() => onStartQuiz(selectedCategory, "en-gr")}>
                  English → Greek
                </button>
              </div>

              <table className="word-table">
                <caption className="visually-hidden">Words in {selectedCategory}</caption>
                <tbody>
                  {visibleWords.map(([gr, en]) => (
                    <tr key={`${selectedCategory}-${gr}`}>
                      <td className="greek" lang="el">
                        {gr}
                      </td>
                      <td>{en}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {selectedWords.length > PREVIEW_COUNT && (
                <button className="btn btn-ghost" onClick={() => setShowAll((v) => !v)}>
                  {showAll ? "Show fewer" : `Show all ${selectedWords.length} words`}
                </button>
              )}
            </section>
          )
        }
      />
    </>
  );
}
