import { useState } from "react";
import { grammar } from "../../features/study/data";
import { isPassed, safeTopicTitle } from "../../features/study/utils";
import { DeckLayout, DeckRow } from "../DeckLayout";
import { EmptyState, ProgressBar, ScoreBadge, SearchField, Segmented } from "../ui";

type GrammarFilter = "all" | "passed" | "not-passed";

type GrammarViewProps = {
  selectedGrammar: number | null;
  passedGrammarTopics: number;
  totalGrammarTopics: number;
  grammarCompletionPercent: number;
  grammarTopicBestScores: Array<number | null>;
  grammarTopicPassFail: Array<{ passed: number; failed: number }>;
  onSelectGrammar: (index: number | null) => void;
  onBuildGrammarQuiz: (topicIndex?: number) => void;
};

export function GrammarView({
  selectedGrammar,
  passedGrammarTopics,
  totalGrammarTopics,
  grammarCompletionPercent,
  grammarTopicBestScores,
  grammarTopicPassFail,
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
      const passed = isPassed(grammarTopicBestScores[index]);
      if (filter === "passed" && !passed) return false;
      if (filter === "not-passed" && passed) return false;
      return true;
    });

  const filterOptions = [
    { value: "all", label: `All ${totalGrammarTopics}` },
    { value: "passed", label: `Passed ${passedGrammarTopics}` },
    { value: "not-passed", label: `To do ${totalGrammarTopics - passedGrammarTopics}` },
  ] as const;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Grammar</h1>
          <p>
            {passedGrammarTopics} / {totalGrammarTopics} topics passed
          </p>
        </div>
        <button className="btn btn-secondary" onClick={() => onBuildGrammarQuiz()}>
          Mixed quiz
        </button>
      </div>
      <ProgressBar value={grammarCompletionPercent} label="Grammar completion" />

      <div className="toolbar">
        <SearchField label="Search" value={search} placeholder="Grammar topics" onChange={setSearch} />
        <Segmented label="Filter topics" value={filter} options={filterOptions} onChange={setFilter} />
      </div>

      <DeckLayout
        backLabel="All topics"
        onBack={() => onSelectGrammar(null)}
        list={
          filteredTopics.length ? (
            <div className="rows">
              {filteredTopics.map(({ topic, index }) => (
                <DeckRow
                  key={topic.t}
                  title={safeTopicTitle(topic.t)}
                  meta={`Topic ${index + 1}`}
                  score={grammarTopicBestScores[index]}
                  passFail={grammarTopicPassFail[index]}
                  active={selectedGrammar === index}
                  onSelect={() => onSelectGrammar(index)}
                />
              ))}
            </div>
          ) : (
            <EmptyState>No topics match your search or filter.</EmptyState>
          )
        }
        emptyDetail={<EmptyState icon="grammar">Pick a topic to read the notes and quiz yourself.</EmptyState>}
        detail={
          selectedGrammarData &&
          selectedGrammar !== null && (
            <section className="panel deck-panel" aria-labelledby="deck-title">
              <div className="deck-panel-head">
                <div>
                  <h2 id="deck-title">{safeTopicTitle(selectedGrammarData.t)}</h2>
                  <span className="muted">Topic {selectedGrammar + 1}</span>
                </div>
                <ScoreBadge score={grammarTopicBestScores[selectedGrammar]} />
              </div>
              <div className="btn-row">
                <button className="btn btn-primary" onClick={() => onBuildGrammarQuiz(selectedGrammar)}>
                  Quiz this topic
                </button>
              </div>
              <div className="grammar-notes prose">{selectedGrammarData.c}</div>
            </section>
          )
        }
      />
    </>
  );
}
