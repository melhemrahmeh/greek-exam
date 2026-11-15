import { useState } from "react";
import { phraseSections } from "../../features/study/data";
import { DeckLayout, DeckRow } from "../DeckLayout";
import { EmptyState, ProgressBar, ScoreBadge, SearchField } from "../ui";

type PhrasesViewProps = {
  openPhrase: string | null;
  passedPhraseSections: number;
  totalPhraseSections: number;
  phrasesCompletionPercent: number;
  phraseSectionBestScores: Record<string, number | null>;
  phraseSectionPassFail: Record<string, { passed: number; failed: number }>;
  onSelectPhrase: (title: string | null) => void;
  onBuildPhraseQuiz: (direction: "gr-en" | "en-gr", sectionTitle?: string) => void;
};

export function PhrasesView({
  openPhrase,
  passedPhraseSections,
  totalPhraseSections,
  phrasesCompletionPercent,
  phraseSectionBestScores,
  phraseSectionPassFail,
  onSelectPhrase,
  onBuildPhraseQuiz,
}: PhrasesViewProps) {
  const [search, setSearch] = useState("");

  const normalizedSearch = search.trim().toLowerCase();
  const matchesSearch = (item: { gr: string; en: string }) =>
    item.gr.toLowerCase().includes(normalizedSearch) || item.en.toLowerCase().includes(normalizedSearch);

  const filteredSections = normalizedSearch
    ? phraseSections.filter((section) => section.title.toLowerCase().includes(normalizedSearch) || section.items.some(matchesSearch))
    : phraseSections;

  const selected = openPhrase ? phraseSections.find((section) => section.title === openPhrase) ?? null : null;
  const selectedItems =
    selected && normalizedSearch && !selected.title.toLowerCase().includes(normalizedSearch)
      ? selected.items.filter(matchesSearch)
      : (selected?.items ?? []);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Phrases</h1>
          <p>
            {passedPhraseSections} / {totalPhraseSections} sections passed
          </p>
        </div>
        <div className="btn-row">
          <button className="btn btn-secondary" onClick={() => onBuildPhraseQuiz("gr-en")}>
            Mixed GR → EN
          </button>
          <button className="btn btn-secondary" onClick={() => onBuildPhraseQuiz("en-gr")}>
            Mixed EN → GR
          </button>
        </div>
      </div>
      <ProgressBar value={phrasesCompletionPercent} label="Phrases completion" />

      <div className="toolbar">
        <SearchField label="Search" value={search} placeholder="Phrases in Greek or English" onChange={setSearch} />
      </div>

      <DeckLayout
        backLabel="All sections"
        onBack={() => onSelectPhrase(null)}
        list={
          filteredSections.length ? (
            <div className="rows">
              {filteredSections.map((section) => {
                const matchCount = normalizedSearch ? section.items.filter(matchesSearch).length : 0;
                const newCount = section.items.filter((item) => item.isNew).length;
                return (
                  <DeckRow
                    key={section.title}
                    title={`${section.icon} ${section.title}`}
                    meta={
                      normalizedSearch
                        ? `${matchCount} matching`
                        : `${section.items.length} phrases${newCount ? ` · ${newCount} new` : ""}`
                    }
                    score={phraseSectionBestScores[section.title] ?? null}
                    passFail={phraseSectionPassFail[section.title]}
                    active={openPhrase === section.title}
                    onSelect={() => onSelectPhrase(section.title)}
                  />
                );
              })}
            </div>
          ) : (
            <EmptyState>No phrases match “{search}”.</EmptyState>
          )
        }
        emptyDetail={<EmptyState icon="chat">Pick a section to see its phrases and start a quiz.</EmptyState>}
        detail={
          selected && (
            <section className="panel deck-panel" aria-labelledby="deck-title">
              <div className="deck-panel-head">
                <div>
                  <h2 id="deck-title">
                    {selected.icon} {selected.title}
                  </h2>
                  <span className="muted">{selected.items.length} phrases</span>
                </div>
                <ScoreBadge score={phraseSectionBestScores[selected.title] ?? null} />
              </div>
              <div className="btn-row direction-buttons">
                <button className="btn btn-primary" onClick={() => onBuildPhraseQuiz("gr-en", selected.title)}>
                  Greek → English
                </button>
                <button className="btn btn-secondary" onClick={() => onBuildPhraseQuiz("en-gr", selected.title)}>
                  English → Greek
                </button>
              </div>
              <div className="rows phrase-rows">
                {selectedItems.map((item) => (
                  <div key={`${selected.title}-${item.gr}`} className="row phrase-row">
                    <div className="row-main">
                      <strong className="greek" lang="el">
                        {item.gr}
                        {item.isNew && (
                          <span className="badge badge-brand phrase-new" lang="en">
                            New
                          </span>
                        )}
                      </strong>
                      {item.note && <small>{item.note}</small>}
                    </div>
                    <span className="phrase-en">{item.en}</span>
                  </div>
                ))}
              </div>
            </section>
          )
        }
      />
    </>
  );
}
