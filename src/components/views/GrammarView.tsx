import { grammar } from "../../features/study/data";
import { safeTopicTitle } from "../../features/study/utils";

type GrammarViewProps = {
  selectedGrammar: number | null;
  onSelectGrammar: (index: number) => void;
  onBuildGrammarQuiz: (topicIndex?: number) => void;
};

export function GrammarView({ selectedGrammar, onSelectGrammar, onBuildGrammarQuiz }: GrammarViewProps) {
  const selectedGrammarData = selectedGrammar !== null ? grammar[selectedGrammar] : null;

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

        <div className="list-stack">
          {grammar.map((topic, index) => (
            <button key={topic.t} className="list-button list-row" onClick={() => onSelectGrammar(index)}>
              <div>
                <strong>{safeTopicTitle(topic.t)}</strong>
                <small>Topic {index + 1}</small>
              </div>
              <span>{selectedGrammar === index ? "open" : "view"}</span>
            </button>
          ))}
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
