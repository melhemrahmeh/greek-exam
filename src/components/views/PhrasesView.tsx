import { useState } from "react";
import { phraseSections } from "../../features/study/data";
import { formatPassFail } from "../../features/study/utils";

type PhrasesViewProps = {
  openPhrase: string | null;
  passedPhraseSections: number;
  totalPhraseSections: number;
  phrasesCompletionPercent: number;
  phraseSectionBestScores: Record<string, number | null>;
  phraseSectionPassFail: Record<string, { passed: number; failed: number }>;
  onTogglePhrase: (title: string) => void;
  onBuildPhraseQuiz: (direction: "gr-en" | "en-gr", sectionTitle?: string) => void;
};

export function PhrasesView({
  openPhrase,
  passedPhraseSections,
  totalPhraseSections,
  phrasesCompletionPercent,
  phraseSectionBestScores,
  phraseSectionPassFail,
  onTogglePhrase,
  onBuildPhraseQuiz,
}: PhrasesViewProps) {
  const [search, setSearch] = useState("");

  const normalizedSearch = search.trim().toLowerCase();
  const filteredSections = normalizedSearch
    ? phraseSections
        .map((section) => ({
          ...section,
          items: section.items.filter(
            (item) =>
              item.gr.toLowerCase().includes(normalizedSearch) ||
              item.en.toLowerCase().includes(normalizedSearch)
          ),
        }))
        .filter((section) => section.items.length > 0 || section.title.toLowerCase().includes(normalizedSearch))
    : phraseSections;

  const totalPhrases = phraseSections.reduce((sum, s) => sum + s.items.length, 0);

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
        <input
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search phrases in Greek or English"
        />
        <div style={{ display: "flex", gap: 12, marginTop: 10, color: "var(--text-muted)", fontSize: "0.86rem", fontWeight: 700 }}>
          <span>{phraseSections.length} sections</span>
          <span>{totalPhrases} phrases</span>
          {normalizedSearch && <span>{filteredSections.reduce((s, sec) => s + sec.items.length, 0)} matches</span>}
        </div>

        <div className="accordion-list">
          {filteredSections.map((section) => {
            const isOpen = openPhrase === section.title || !!normalizedSearch;
            const bestScore = phraseSectionBestScores[section.title];
            const passFail = phraseSectionPassFail[section.title] ?? { passed: 0, failed: 0 };
            const passFailText = formatPassFail(passFail.passed, passFail.failed);

            return (
              <article key={section.title} className="accordion-card">
                <button className="accordion-toggle" onClick={() => onTogglePhrase(section.title)}>
                  <span>
                    {section.icon} {section.title}
                    <span className="word-count-badge" style={{ marginLeft: 8 }}>{section.items.length}</span>
                    {passFailText && (
                      <span className="word-count-badge" style={{ marginLeft: 8 }}>{passFailText}</span>
                    )}
                  </span>
                  <span>{bestScore !== null ? `best ${bestScore}%` : isOpen && !normalizedSearch ? "Hide" : "Show"}</span>
                </button>
                {isOpen && (
                  <div className="phrase-list">
                    {!normalizedSearch && (
                      <div className="phrase-actions">
                        <button className="primary-button" onClick={() => onBuildPhraseQuiz("gr-en", section.title)}>
                          Greek to English
                        </button>
                        <button className="secondary-button" onClick={() => onBuildPhraseQuiz("en-gr", section.title)}>
                          English to Greek
                        </button>
                      </div>
                    )}
                    {section.items.map((item, i) => (
                      <div key={`${section.title}-${item.gr}`} className="phrase-row">
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <span className="phrase-row-index">{i + 1}</span>
                          <div>
                            <strong>{item.gr}</strong>
                            <small>{item.note ?? section.title}</small>
                          </div>
                        </div>
                        <span>{item.en}</span>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
          {!filteredSections.length && <div className="empty-state">No phrases match your search.</div>}
        </div>
      </section>
    </>
  );
}
