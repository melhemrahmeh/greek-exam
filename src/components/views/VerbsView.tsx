import { tenseGreek, tenseLabels, typeDescriptions } from "../../features/study/constants";
import { persons, verbs } from "../../features/study/data";

type VerbsViewProps = {
  selectedVerb: number | null;
  verbSearch: string;
  tense: keyof typeof tenseLabels;
  verbMeaningBestScore: number | null;
  verbConjugationBestScore: number | null;
  passedVerbDecks: number;
  verbsCompletionPercent: number;
  onSelectVerb: (index: number) => void;
  onVerbSearchChange: (value: string) => void;
  onTenseChange: (tense: keyof typeof tenseLabels) => void;
  onMeaningQuiz: () => void;
  onConjugationQuiz: () => void;
  onOpenMatch: () => void;
  onOpenTyping: () => void;
};

function getTypeClassName(type: string) {
  return `verb-type-badge type-${type.toLowerCase()}`;
}

export function VerbsView({
  selectedVerb,
  verbSearch,
  tense,
  verbMeaningBestScore,
  verbConjugationBestScore,
  passedVerbDecks,
  verbsCompletionPercent,
  onSelectVerb,
  onVerbSearchChange,
  onTenseChange,
  onMeaningQuiz,
  onConjugationQuiz,
  onOpenMatch,
  onOpenTyping,
}: VerbsViewProps) {
  const filteredVerbs = verbs.filter((verb) => {
    const query = verbSearch.trim().toLowerCase();
    if (!query) return true;
    return verb.inf.toLowerCase().includes(query) || verb.en.toLowerCase().includes(query) || verb.type.toLowerCase().includes(query);
  });

  const selectedVerbData = selectedVerb !== null ? verbs[selectedVerb] : null;

  return (
    <>
      <section className="verb-studio">
        <div className="completion-card">
          <div className="completion-head">
            <div>
              <span className="mini-label">Verb completion</span>
              <strong>{passedVerbDecks} / 2 passed</strong>
              <p>The two quiz decks count as passed once their best score is above 80%.</p>
            </div>
            <div className="completion-percent">{verbsCompletionPercent}%</div>
          </div>
          <div className="progress-track completion-track">
            <div className="progress-fill" style={{ width: `${verbsCompletionPercent}%` }} />
          </div>
        </div>

        <div className="verb-studio-head">
          <div>
            <span className="mini-label">Verb studio</span>
            <h3>Meanings, conjugation, matching, and quick recall in one place.</h3>
            <p>Use the best scores to judge whether the deck deserves a retake, then inspect a verb in detail below.</p>
          </div>
          <div className="verb-studio-stats">
            <div className="verb-studio-pill">
              <strong>{verbs.length}</strong>
              <span>verbs</span>
            </div>
            <div className="verb-studio-pill">
              <strong>{persons.length}</strong>
              <span>persons</span>
            </div>
            <div className="verb-studio-pill">
              <strong>{verbMeaningBestScore !== null ? `${verbMeaningBestScore}%` : "--"}</strong>
              <span>best meaning score</span>
            </div>
            <div className="verb-studio-pill">
              <strong>{verbConjugationBestScore !== null ? `${verbConjugationBestScore}%` : "--"}</strong>
              <span>best conjugation score</span>
            </div>
          </div>
        </div>

        <div className="verb-action-grid">
          <button className="verb-action-card action-meaning" onClick={onMeaningQuiz}>
            <span className="mini-label">Quiz</span>
            <strong>Verb meanings</strong>
            <span>Match infinitives to English meanings.</span>
            <span>{verbMeaningBestScore !== null ? `Best: ${verbMeaningBestScore}%` : "No score yet"}</span>
          </button>
          <button className="verb-action-card action-conjugation" onClick={onConjugationQuiz}>
            <span className="mini-label">Quiz</span>
            <strong>Conjugation builder</strong>
            <span>Pick the exact form for person and tense.</span>
            <span>{verbConjugationBestScore !== null ? `Best: ${verbConjugationBestScore}%` : "No score yet"}</span>
          </button>
          <button className="verb-action-card action-match" onClick={onOpenMatch}>
            <span className="mini-label">Game</span>
            <strong>Verb matching</strong>
            <span>Fast pairing drill for pronouns and forms.</span>
            <span>Pattern recognition</span>
          </button>
          <button className="verb-action-card action-typing" onClick={onOpenTyping}>
            <span className="mini-label">Drill</span>
            <strong>Typing challenge</strong>
            <span>Recall first-person forms from memory.</span>
            <span>Speed + recall</span>
          </button>
        </div>
      </section>

      <section className="panel">
        <div className="split-header">
          <div>
            <h3>Verb browser</h3>
            <p>Search by infinitive, meaning, or type and open any verb for its full forms.</p>
          </div>
        </div>

        <input className="search-input" value={verbSearch} onChange={(event) => onVerbSearchChange(event.target.value)} placeholder="Search verbs" />

        <div className="verb-results-head">
          <span className="verb-results-count">{filteredVerbs.length} result(s)</span>
        </div>

        <div className="verb-browser-grid">
          {filteredVerbs.map((verb) => {
            const actualIndex = verbs.findIndex((entry) => entry.inf === verb.inf);
            return (
              <button key={verb.inf} className="verb-browser-card" onClick={() => onSelectVerb(actualIndex)}>
                <div className="verb-browser-top">
                  <span className={getTypeClassName(verb.type)}>{verb.type}</span>
                  <span className="verb-browser-link">{selectedVerb === actualIndex ? "Open" : "Inspect"}</span>
                </div>
                <strong>{verb.inf}</strong>
                <small>{verb.en}</small>
                <div className="verb-browser-preview">
                  <span>{verb.p[0]}</span>
                  <span>{verb.pa[0]}</span>
                  <span>{verb.f[0]}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {selectedVerbData && (
        <section className="panel">
          <div className="verb-detail-hero">
            <div className="verb-detail-copy">
              <span className="mini-label">Selected verb</span>
              <h3>{selectedVerbData.inf}</h3>
              <p>{selectedVerbData.en}</p>
              <div className="verb-detail-glance">
                <div className="verb-glance-card">
                  <small>Type</small>
                  <strong>{selectedVerbData.type}</strong>
                </div>
                <div className="verb-glance-card">
                  <small>Current tense</small>
                  <strong>{tenseLabels[tense]}</strong>
                </div>
                <div className="verb-glance-card">
                  <small>Greek label</small>
                  <strong>{tenseGreek[tense]}</strong>
                </div>
              </div>
            </div>

            <aside className="verb-detail-note">
              <span className="mini-label">Type note</span>
              <p>{typeDescriptions[selectedVerbData.type] ?? "Use the conjugation table below to memorize this pattern."}</p>
            </aside>
          </div>

          <div className="tense-switcher">
            {(Object.keys(tenseLabels) as Array<keyof typeof tenseLabels>).map((tenseKey) => (
              <button key={tenseKey} className={tense === tenseKey ? "switch active" : "switch"} onClick={() => onTenseChange(tenseKey)}>
                {tenseLabels[tenseKey]}
              </button>
            ))}
          </div>

          <table className="verb-table">
            <thead>
              <tr>
                <th>Person</th>
                <th>{tenseLabels[tense]}</th>
              </tr>
            </thead>
            <tbody>
              {persons.map((person, index) => (
                <tr key={`${selectedVerbData.inf}-${person}`}>
                  <td>{person}</td>
                  <td>{selectedVerbData[tense][index]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </>
  );
}
