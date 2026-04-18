import { phraseSections } from "../../features/study/data";

type PhrasesViewProps = {
  openPhrase: string | null;
  passedPhraseSections: number;
  totalPhraseSections: number;
  phrasesCompletionPercent: number;
  phraseSectionBestScores: Record<string, number | null>;
  onTogglePhrase: (title: string) => void;
  onBuildPhraseQuiz: (direction: "gr-en" | "en-gr", sectionTitle?: string) => void;
};

export function PhrasesView({
  openPhrase,
  passedPhraseSections,
  totalPhraseSections,
  phrasesCompletionPercent,
  phraseSectionBestScores,
  onTogglePhrase,
  onBuildPhraseQuiz,
}: PhrasesViewProps) {
  return (
    <>
      <section className="panel">
        <div className="split-header">
          <div>
            <h3>Phrasebook</h3>
            <p>Practice a section on its own or launch a mixed phrase quiz across the whole phrasebook.</p>
          </div>
          <div className="phrase-actions">
            <button className="primary-button" onClick={() => onBuildPhraseQuiz("gr-en")}>
              Mixed Greek to English
            </button>
            <button className="secondary-button" onClick={() => onBuildPhraseQuiz("en-gr")}>
              Mixed English to Greek
            </button>
          </div>
        </div>

        <div className="completion-card">
          <div className="completion-head">
            <div>
              <span className="mini-label">Phrase completion</span>
              <strong>{passedPhraseSections} / {totalPhraseSections} passed</strong>
              <p>A phrase section counts as passed once your best section score is above 80%.</p>
            </div>
            <div className="completion-percent">{phrasesCompletionPercent}%</div>
          </div>
          <div className="progress-track completion-track">
            <div className="progress-fill" style={{ width: `${phrasesCompletionPercent}%` }} />
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="accordion-list">
          {phraseSections.map((section) => {
            const isOpen = openPhrase === section.title;
            const bestScore = phraseSectionBestScores[section.title];

            return (
              <article key={section.title} className="accordion-card">
                <button className="accordion-toggle" onClick={() => onTogglePhrase(section.title)}>
                  <span>{section.title}</span>
                  <span>{bestScore !== null ? `best ${bestScore}%` : isOpen ? "Hide" : "Show"}</span>
                </button>
                {isOpen && (
                  <div className="phrase-list">
                    <div className="phrase-actions">
                      <button className="primary-button" onClick={() => onBuildPhraseQuiz("gr-en", section.title)}>
                        Greek to English
                      </button>
                      <button className="secondary-button" onClick={() => onBuildPhraseQuiz("en-gr", section.title)}>
                        English to Greek
                      </button>
                    </div>
                    {section.items.map((item) => (
                      <div key={`${section.title}-${item.gr}`} className="phrase-row">
                        <div>
                          <strong>{item.gr}</strong>
                          <small>{item.note ?? section.title}</small>
                        </div>
                        <span>{item.en}</span>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
