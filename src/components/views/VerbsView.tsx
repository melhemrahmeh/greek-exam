import { tenseGreek, tenseLabels, typeDescriptions } from "../../features/study/constants";
import { persons, verbs } from "../../features/study/data";
import { formatPassFail } from "../../features/study/utils";
import { useState } from "react";
import { DeckLayout } from "../DeckLayout";
import { EmptyState, ProgressBar, ScoreBadge, SearchField, Segmented } from "../ui";

const verbTypes = ["All", "A", "B1", "B2", "passive", "irregular"] as const;
type VerbTypeFilter = (typeof verbTypes)[number];
type TenseKey = keyof typeof tenseLabels;

type PassFail = { passed: number; failed: number };

type VerbsViewProps = {
  selectedVerb: number | null;
  verbSearch: string;
  tense: TenseKey;
  verbMeaningBestScore: number | null;
  verbConjugationBestScore: number | null;
  verbTranslationBestScore: number | null;
  verbMeaningPassFail: PassFail;
  verbConjugationPassFail: PassFail;
  verbTranslationPassFail: PassFail;
  passedVerbDecks: number;
  verbsCompletionPercent: number;
  onSelectVerb: (index: number | null) => void;
  onVerbSearchChange: (value: string) => void;
  onTenseChange: (tense: TenseKey) => void;
  onMeaningQuiz: () => void;
  onTranslationQuiz: () => void;
  onConjugationQuiz: () => void;
  onOpenMatch: () => void;
  onOpenTyping: () => void;
};

const tenseOptions = (Object.keys(tenseLabels) as TenseKey[]).map((key) => ({ value: key, label: tenseLabels[key] }));

export function VerbsView({
  selectedVerb,
  verbSearch,
  tense,
  verbMeaningBestScore,
  verbConjugationBestScore,
  verbTranslationBestScore,
  verbMeaningPassFail,
  verbConjugationPassFail,
  verbTranslationPassFail,
  passedVerbDecks,
  verbsCompletionPercent,
  onSelectVerb,
  onVerbSearchChange,
  onTenseChange,
  onMeaningQuiz,
  onTranslationQuiz,
  onConjugationQuiz,
  onOpenMatch,
  onOpenTyping,
}: VerbsViewProps) {
  const [typeFilter, setTypeFilter] = useState<VerbTypeFilter>("All");

  const query = verbSearch.trim().toLowerCase();
  const filteredVerbs = verbs
    .map((verb, index) => ({ verb, index }))
    .filter(({ verb }) => {
      if (typeFilter !== "All" && verb.type.toLowerCase() !== typeFilter.toLowerCase()) return false;
      if (!query) return true;
      return verb.inf.toLowerCase().includes(query) || verb.en.toLowerCase().includes(query) || verb.type.toLowerCase().includes(query);
    });

  const typeOptions = verbTypes.map((type) => ({ value: type, label: type }));
  const selectedVerbData = selectedVerb !== null ? verbs[selectedVerb] : null;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Verbs</h1>
          <p>
            {passedVerbDecks} / 2 core quizzes passed · {verbs.length} verbs
          </p>
        </div>
      </div>
      <ProgressBar value={verbsCompletionPercent} label="Verbs completion" />

      <section className="section" aria-labelledby="quizzes-title">
        <h2 id="quizzes-title" className="group-title">
          Quizzes
        </h2>
        <div className="mode-grid">
          <ModeCard
            title="Meanings"
            description="Match infinitives to their English meaning."
            score={verbMeaningBestScore}
            passFail={verbMeaningPassFail}
            onStart={onMeaningQuiz}
          />
          <ModeCard
            title="All translations"
            description={`Translate every verb in the deck (${verbs.length}).`}
            score={verbTranslationBestScore}
            passFail={verbTranslationPassFail}
            onStart={onTranslationQuiz}
          />
          <ModeCard
            title="Conjugation"
            description="Pick the right form for person and tense."
            score={verbConjugationBestScore}
            passFail={verbConjugationPassFail}
            onStart={onConjugationQuiz}
          />
        </div>
      </section>

      <section className="section" aria-labelledby="games-title">
        <h2 id="games-title" className="group-title">
          Games
        </h2>
        <div className="mode-grid">
          <ModeCard title="Matching" description="Pair each pronoun with its verb form." onStart={onOpenMatch} />
          <ModeCard title="Typing" description="Type present, past and future from memory." onStart={onOpenTyping} />
        </div>
      </section>

      <section className="section" aria-labelledby="browser-title">
        <h2 id="browser-title" className="group-title">
          Verb browser
        </h2>
        <div className="toolbar">
          <SearchField label="Search" value={verbSearch} placeholder="Infinitive, meaning or type" onChange={onVerbSearchChange} />
          <Segmented label="Verb type" value={typeFilter} options={typeOptions} onChange={setTypeFilter} />
        </div>

        <DeckLayout
          backLabel="All verbs"
          onBack={() => onSelectVerb(null)}
          list={
            filteredVerbs.length ? (
              <div className="rows">
                {filteredVerbs.map(({ verb, index }) => (
                  <button
                    key={verb.inf}
                    className="row deck-row"
                    aria-current={selectedVerb === index ? "true" : undefined}
                    onClick={() => onSelectVerb(index)}
                  >
                    <div className="row-main">
                      <strong lang="el">{verb.inf}</strong>
                      <small>{verb.en}</small>
                    </div>
                    <span className="badge">{verb.type}</span>
                  </button>
                ))}
              </div>
            ) : (
              <EmptyState>No verbs match your search.</EmptyState>
            )
          }
          emptyDetail={<EmptyState icon="verb">Pick a verb to see its conjugation.</EmptyState>}
          detail={
            selectedVerbData && (
              <section className="panel deck-panel" aria-labelledby="verb-title">
                <div className="deck-panel-head">
                  <div>
                    <h2 id="verb-title" lang="el">
                      {selectedVerbData.inf}
                    </h2>
                    <span className="muted">{selectedVerbData.en}</span>
                  </div>
                  <span className="badge">Type {selectedVerbData.type}</span>
                </div>
                <p className="muted prose">{typeDescriptions[selectedVerbData.type] ?? "Use the table below to learn this pattern."}</p>

                <div className="tense-row">
                  <Segmented label="Tense" value={tense} options={tenseOptions} onChange={onTenseChange} />
                  <span className="muted" lang="el">
                    {tenseGreek[tense]}
                  </span>
                </div>

                <table className="conj-table">
                  <caption className="visually-hidden">
                    {selectedVerbData.inf}, {tenseLabels[tense]}
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Person</th>
                      <th scope="col">{tenseLabels[tense]}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {persons.map((person, index) => (
                      <tr key={`${selectedVerbData.inf}-${person}`}>
                        <td lang="el">{person}</td>
                        <td className="greek" lang="el">
                          {selectedVerbData[tense][index]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )
          }
        />
      </section>
    </>
  );
}

function ModeCard({
  title,
  description,
  score,
  passFail,
  onStart,
}: {
  title: string;
  description: string;
  score?: number | null;
  passFail?: PassFail;
  onStart: () => void;
}) {
  const passFailText = passFail ? formatPassFail(passFail.passed, passFail.failed) : "";
  return (
    <button className="panel mode-card" onClick={onStart}>
      <span className="mode-card-head">
        <strong>{title}</strong>
        {score !== undefined && <ScoreBadge score={score} title={passFailText || undefined} />}
      </span>
      <span className="muted">{description}</span>
    </button>
  );
}
