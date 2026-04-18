import { useState } from "react";
import { grammar } from "../../features/study/data";
import { safeTopicTitle } from "../../features/study/utils";

type GrammarFilter = "all" | "passed" | "not-passed";

type GrammarViewProps = {
  selectedGrammar: number | null;
  passedGrammarTopics: number;
  totalGrammarTopics: number;
  grammarCompletionPercent: number;
  grammarTopicBestScores: Array<number | null>;
  onSelectGrammar: (index: number) => void;
  onBuildGrammarQuiz: (topicIndex?: number) => void;
};

export function GrammarView({
  selectedGrammar,
  passedGrammarTopics,
  totalGrammarTopics,
  grammarCompletionPercent,
  grammarTopicBestScores,
  onSelectGrammar,
  onBuildGrammarQuiz,
}: GrammarViewProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<GrammarFilter>("all");

  const selectedGrammarData = selectedGrammar !== null ? grammar[selectedGrammar] : null;

  const normalizedSearch = search.trim().toLowerCase();
  const filteredTopics = grammar
    .map((topic, index) => ({ topic, index }))
    .filter(({ topic, index }) => {
      if (normalizedSearch && !safeTopicTitle(topic.t).toLowerCase().includes(normalizedSearch)) return false;
      if (filter === "passed" && (grammarTopicBestScores[index] === null || grammarTopicBestScores[index]! < 80)) return false;
      if (filter === "not-passed" && grammarTopicBestScores[index] !== null && grammarTopicBestScores[index]! >= 80) return false;
      return true;
    });

  return (
    <>
      <section className="panel">
        <div className="split-header">
          <div>
            <h3>Grammar topics</h3>
            <p>Open a topic for the notes, or run a mixed quiz for a broad exam check.</p>
          </div>
          <button className="primary-button" onClick={() => onBuildGrammarQuiz()}>
            Mixed grammar quiz
          </button>
        </div>

        <div className="completion-card">
          <div className="completion-head">
            <div>
              <span className="mini-label">Grammar completion</span>
              <strong>{passedGrammarTopics} / {totalGrammarTopics} passed</strong>
              <p>A topic counts as passed once its best topic quiz score is above 80%.</p>
            </div>
            <div className="completion-percent">{grammarCompletionPercent}%</div>
          </div>
          <div className="progress-track completion-track">
            <div className="progress-fill" style={{ width: `${grammarCompletionPercent}%` }} />
          </div>
        </div>

        <input
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search grammar topics"
        />

        <div className="filter-bar">
          <button className={filter === "all" ? "filter-chip active" : "filter-chip"} onClick={() => setFilter("all")}>
            All<span className="chip-count">{grammar.length}</span>
          </button>
          <button className={filter === "passed" ? "filter-chip active" : "filter-chip"} onClick={() => setFilter("passed")}>
            Passed<span className="chip-count">{passedGrammarTopics}</span>
          </button>
          <button className={filter === "not-passed" ? "filter-chip active" : "filter-chip"} onClick={() => setFilter("not-passed")}>
            Not passed<span className="chip-count">{totalGrammarTopics - passedGrammarTopics}</span>
          </button>
        </div>

        <div className="list-stack">
          {filteredTopics.map(({ topic, index }) => (
            <button key={topic.t} className="list-button list-row" onClick={() => onSelectGrammar(index)}>
              <div>
                <strong>{safeTopicTitle(topic.t)}</strong>
                <small>Topic {index + 1}{grammarTopicBestScores[index] !== null && grammarTopicBestScores[index]! >= 80 ? " \u2713" : ""}</small>
              </div>
              <span>{grammarTopicBestScores[index] !== null ? `best ${grammarTopicBestScores[index]}%` : selectedGrammar === index ? "open" : "view"}</span>
            </button>
          ))}
          {!filteredTopics.length && <div className="empty-state">No topics match your search or filter.</div>}
        </div>
      </section>

      {selectedGrammarData && (
        <section className="panel">
          <div className="split-header">
            <div>
              <h3>{safeTopicTitle(selectedGrammarData.t)}</h3>
              <p>Topic-specific notes and quiz entry point.</p>
            </div>
            <button className="secondary-button" onClick={() => onBuildGrammarQuiz(selectedGrammar ?? undefined)}>
              Quiz this topic
            </button>
          </div>
          <div className="grammar-card">{selectedGrammarData.c}</div>
        </section>
      )}
    </>
  );
}
