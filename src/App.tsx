import { startTransition, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import VOCAB from "./data/vocab.json";
import VERBS from "./data/verbs.json";
import GRAMMAR from "./data/grammar.json";
import GRAMMAR_QUIZ from "./data/grammar-quiz.json";
import PERSONS from "./data/persons.json";
import { matchLessons as rawMatchLessons, phraseSections as rawPhraseSections } from "./data/extras";

type Theme = "light" | "dark";
type View = "dashboard" | "vocab" | "verbs" | "grammar" | "phrases" | "progress";
type VocabEntry = [string, string];
type VocabData = Record<string, VocabEntry[]>;
type Verb = { inf: string; en: string; type: string; p: string[]; pa: string[]; f: string[] };
type GrammarTopic = { t: string; c: string };
type GrammarQuestion = { q: string; a: string; wrong: string[]; topic: number };
type DeckStats = { attempted: number; correct: number; sessions: number; bestScore: number; lastScore: number };
type ReviewCard = { id: string; front: string; back: string; source: string };
type QuizItem = {
  id: string;
  prompt: string;
  choices: string[];
  answer: string;
  review: ReviewCard;
  detail?: string;
};
type QuizAnswer = { selected: string; correct: boolean } | null;
type StoredState = {
  theme: Theme;
  deckStats: Record<string, DeckStats>;
  favorites: ReviewCard[];
  mistakes: ReviewCard[];
};
type QuizSession = {
  kind: "quiz";
  deckId: string;
  title: string;
  subtitle?: string;
  items: QuizItem[];
};
type MatchSession = { kind: "match" };
type TypingSession = { kind: "typing" };
type Session = QuizSession | MatchSession | TypingSession;

const STORAGE_KEY = "greek-study-hub-v2";
const STANDARD_QUIZ_LENGTH = 24;
const LONG_QUIZ_LENGTH = 30;
const REVIEW_QUIZ_LENGTH = 24;
const TYPING_DRILL_LENGTH = 16;
const examDate = new Date("2026-05-19T00:00:00");
const tenseLabels = { p: "Present", pa: "Past", f: "Future" } as const;
const tenseGreek = { p: "Ενεστώτας", pa: "Αόριστος", f: "Μέλλοντας" } as const;
const typeDescriptions: Record<string, string> = {
  A: "Regular -ω verb. Great baseline pattern for fast conjugation work.",
  B1: "The -άω pattern. Watch the accented endings in the present tense.",
  B2: "The stressed -ώ pattern with characteristic -είς / -εί / -ούμε endings.",
  passive: "Reflexive/passive-style forms in -ομαι / -άμαι.",
  irregular: "High-frequency irregular verb. Best learned through repetition and recognition.",
  impersonal: "Impersonal form used the same way for every person.",
};

function looksBroken(value: string) {
  return /[ÃÎÏÐðâ]/.test(value);
}

function repairText(value: string): string {
  if (!looksBroken(value)) return value;
  try {
    const bytes = Uint8Array.from([...value].map((char) => char.charCodeAt(0)));
    const repaired = new TextDecoder("utf-8").decode(bytes);
    return repaired.includes("�") ? value : repaired;
  } catch {
    return value;
  }
}

function normalizeDeep<T>(value: T): T {
  if (typeof value === "string") return repairText(value) as T;
  if (Array.isArray(value)) return value.map((entry) => normalizeDeep(entry)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [repairText(key), normalizeDeep(entry)]),
    ) as T;
  }
  return value;
}

const vocab = normalizeDeep(VOCAB as unknown as VocabData);
const verbs = normalizeDeep(VERBS as Verb[]);
const grammar = normalizeDeep(GRAMMAR as GrammarTopic[]);
const grammarQuiz = normalizeDeep(GRAMMAR_QUIZ as GrammarQuestion[]);
const persons = normalizeDeep(PERSONS as string[]);
const phraseSections = normalizeDeep(rawPhraseSections);
const matchLessons = normalizeDeep(rawMatchLessons);

function shuffle<T>(items: T[]) {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function sampleUnique<T>(items: T[], count: number, key: (item: T) => string = (item) => String(item)) {
  const chosen: T[] = [];
  const seen = new Set<string>();
  for (const item of shuffle(items)) {
    const signature = key(item);
    if (seen.has(signature)) continue;
    seen.add(signature);
    chosen.push(item);
    if (chosen.length === count) break;
  }
  return chosen;
}

function percent(correct: number, total: number) {
  if (!total) return 0;
  return Math.round((correct / total) * 100);
}

function daysUntilExam() {
  const today = new Date();
  const diff = examDate.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diff / 86400000));
}

function safeTopicTitle(raw: string) {
  return raw.replace(/^\d+\.\s*/, "");
}

function toDeckStats(previous?: DeckStats): DeckStats {
  return previous ?? { attempted: 0, correct: 0, sessions: 0, bestScore: 0, lastScore: 0 };
}

function dedupeCards(cards: ReviewCard[]) {
  const seen = new Set<string>();
  return cards.filter((card) => {
    if (seen.has(card.id)) return false;
    seen.add(card.id);
    return true;
  });
}

function buildChoices(answer: string, pool: string[], count = 4) {
  const distractors = sampleUnique(
    pool.filter((entry) => entry !== answer),
    Math.max(0, count - 1),
  );
  return shuffle([answer, ...distractors]);
}

function getDeckFamily(deckId: string) {
  if (deckId.startsWith("vocab:")) return "Vocabulary";
  if (deckId.startsWith("verbs:")) return "Verbs";
  if (deckId.startsWith("grammar:")) return "Grammar";
  if (deckId.startsWith("phrases:")) return "Phrases";
  if (deckId.startsWith("review:")) return "Review";
  return "Other";
}

function formatDeckLabel(deckId: string) {
  const parts = deckId.split(":");
  if (parts[0] === "vocab") {
    const direction = parts[2] === "en-gr" ? "English to Greek" : "Greek to English";
    return `${parts[1]} · ${direction}`;
  }
  if (parts[0] === "verbs") {
    return parts[1] === "conjugation" ? "Verb Conjugation Builder" : "Verb Meanings";
  }
  if (parts[0] === "grammar") {
    if (parts[1] === "all") return "Grammar Mixed Quiz";
    const topicIndex = Number(parts[1]);
    return Number.isInteger(topicIndex) && grammar[topicIndex]
      ? safeTopicTitle(grammar[topicIndex].t)
      : "Grammar Topic";
  }
  if (parts[0] === "phrases") {
    const direction = parts[2] === "en-gr" ? "English to Greek" : "Greek to English";
    return `${parts[1] === "all" ? "Phrasebook Mixed" : parts[1]} · ${direction}`;
  }
  if (parts[0] === "review") {
    return parts[1] === "favorites" ? "Favorites Review" : "Mistakes Recovery";
  }
  return deckId;
}

function randomizeQuizSession(session: QuizSession): QuizSession {
  return {
    ...session,
    items: shuffle(session.items).map((item) => ({
      ...item,
      choices: shuffle(item.choices),
    })),
  };
}

function AppHeader({
  title,
  subtitle,
  eyebrow,
  onBack,
  onToggleTheme,
  theme,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  onBack?: () => void;
  onToggleTheme: () => void;
  theme: Theme;
}) {
  return (
    <header className="hero">
      <div className="hero-topline">
        {onBack ? (
          <button className="ghost-button" onClick={onBack}>
            ← Back
          </button>
        ) : (
          <span className="brand-chip">Greek A2 Builder</span>
        )}
        <button className="theme-button" onClick={onToggleTheme} aria-label="Toggle theme">
          {theme === "dark" ? "☀" : "☾"}
        </button>
      </div>
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </header>
  );
}

function TabBar({ view, setView }: { view: View; setView: (next: View) => void }) {
  const tabs: Array<[View, string]> = [
    ["dashboard", "Dashboard"],
    ["vocab", "Vocab"],
    ["verbs", "Verbs"],
    ["grammar", "Grammar"],
    ["phrases", "Phrases"],
    ["progress", "Progress"],
  ];

  return (
    <nav className="tabbar">
      {tabs.map(([key, label]) => (
        <button
          key={key}
          className={view === key ? "tab active" : "tab"}
          onClick={() => startTransition(() => setView(key))}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}

function QuizRunner({
  session,
  favorites,
  onToggleFavorite,
  onClose,
  onComplete,
  onRestart,
  onToggleTheme,
  theme,
}: {
  session: QuizSession;
  favorites: Set<string>;
  onToggleFavorite: (card: ReviewCard) => void;
  onClose: () => void;
  onComplete: (deckId: string, answers: QuizAnswer[], items: QuizItem[]) => void;
  onRestart: () => void;
  onToggleTheme: () => void;
  theme: Theme;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>(() => new Array(session.items.length).fill(null));
  const [showSummary, setShowSummary] = useState(false);
  const submittedRef = useRef(false);

  const current = session.items[index];
  const currentAnswer = answers[index];
  const answeredCount = answers.filter(Boolean).length;
  const correctCount = answers.filter((entry) => entry?.correct).length;
  const isDone = answeredCount === session.items.length;
  const wrongItems = session.items.filter((_, itemIndex) => !answers[itemIndex]?.correct);
  const wrongCount = wrongItems.length;
  const scorePercent = percent(correctCount, session.items.length);

  useEffect(() => {
    if (!isDone || submittedRef.current) return;
    submittedRef.current = true;
    onComplete(session.deckId, answers, session.items);
  }, [answers, isDone, onComplete, session.deckId, session.items]);

  const selected = currentAnswer?.selected;

  if (isDone && showSummary) {
    return (
      <div className="app-shell">
        <section className="quiz-header">
          <div className="quiz-header-top">
            <button className="ghost-button" onClick={onClose}>
              â† Back
            </button>
            <button className="theme-button" onClick={onToggleTheme} aria-label="Toggle theme">
              {theme === "dark" ? "â˜€" : "â˜¾"}
            </button>
          </div>
          <div className="quiz-head-meta">
            <span className="eyebrow">Quiz completed</span>
            {session.subtitle && <span className="quiz-subline">{session.subtitle}</span>}
          </div>
          <h1 className="quiz-title">{session.title}</h1>
        </section>
        <main className="content">
          <section className="panel quiz-summary">
            <div className="summary-hero">
              <span className="mini-label">Final result</span>
              <h2>{scorePercent}% score</h2>
              <p>
                {correctCount} correct out of {session.items.length}.{" "}
                {wrongCount ? "You have a few useful review targets below." : "Clean run. Nicely done."}
              </p>
            </div>

            <div className="summary-metrics">
              <div className="quiz-stat">
                Correct <strong>{correctCount}</strong>
              </div>
              <div className="quiz-stat">
                Missed <strong>{wrongCount}</strong>
              </div>
              <div className="quiz-stat">
                Accuracy <strong>{scorePercent}%</strong>
              </div>
            </div>

            <div className="summary-actions">
              <button className="primary-button" onClick={onRestart}>
                Retry quiz
              </button>
              <button
                className="secondary-button"
                disabled={!wrongCount}
                onClick={() => {
                  const firstWrongIndex = answers.findIndex((answer) => !answer?.correct);
                  if (firstWrongIndex >= 0) {
                    setIndex(firstWrongIndex);
                    setShowSummary(false);
                  }
                }}
              >
                Review mistakes
              </button>
              <button className="ghost-button" onClick={onClose}>
                Back to app
              </button>
            </div>

            <div className="summary-list">
              <div className="split-header">
                <div>
                  <h3>Quick recap</h3>
                  <p>Your missed prompts are listed first so it is easy to revisit weak spots.</p>
                </div>
              </div>
              {wrongCount ? (
                wrongItems.slice(0, 8).map((item) => (
                  <div key={item.id} className="list-row summary-row">
                    <div>
                      <strong>{item.prompt}</strong>
                      <small>{item.detail ?? item.review.source}</small>
                    </div>
                    <span>{item.answer}</span>
                  </div>
                ))
              ) : (
                <div className="empty-state">No mistakes in this run. Try another deck or increase the challenge.</div>
              )}
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <section className="quiz-header">
        <div className="quiz-header-top">
          <button className="ghost-button" onClick={onClose}>
            ← Back
          </button>
          <button className="theme-button" onClick={onToggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? "☀" : "☾"}
          </button>
        </div>
        <div className="quiz-head-meta">
          <span className="eyebrow">{index + 1} of {session.items.length}</span>
          {session.subtitle && <span className="quiz-subline">{session.subtitle}</span>}
        </div>
        <h1 className="quiz-title">{session.title}</h1>
      </section>
      <main className="content">
        <section className="panel quiz-panel">
          <div className="quiz-toolbar quiz-toolbar-top">
            <div className="quiz-stat">Correct <strong>{correctCount}</strong></div>
            <div className="quiz-stat">Answered <strong>{answeredCount}</strong></div>
            <button
              className={favorites.has(current.review.id) ? "pill favorite active" : "pill favorite"}
              onClick={() => onToggleFavorite(current.review)}
            >
              {favorites.has(current.review.id) ? "★ Saved" : "☆ Save"}
            </button>
          </div>

          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${((index + 1) / session.items.length) * 100}%` }} />
          </div>

          <div key={current.id} className="question-stage">
          <div className="prompt-card">
            <div className="prompt-label-row">
              <span className="mini-label">Prompt</span>
              {current.detail && <span className="prompt-detail">{current.detail}</span>}
            </div>
            <h2>{current.prompt}</h2>
          </div>

          <div className="choice-grid">
            {current.choices.map((choice, choiceIndex) => {
              const revealed = Boolean(currentAnswer);
              const isCorrect = choice === current.answer;
              const isSelected = selected === choice;
              const className = [
                "choice-card",
                revealed && isCorrect ? "correct" : "",
                revealed && isSelected && !isCorrect ? "wrong" : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <button
                  key={choice}
                  className={className}
                  onClick={() => {
                    if (currentAnswer) return;
                    const nextAnsweredCount = answeredCount + 1;
                    if (nextAnsweredCount === session.items.length) {
                      setShowSummary(true);
                    }
                    setAnswers((existing) => {
                      const next = [...existing];
                      next[index] = { selected: choice, correct: isCorrect };
                      return next;
                    });
                  }}
                >
                  <span className="choice-index">{String.fromCharCode(65 + choiceIndex)}</span>
                  <span className="choice-text">{choice}</span>
                  {revealed && isCorrect && <strong>✓</strong>}
                  {revealed && isSelected && !isCorrect && <strong>✕</strong>}
                </button>
              );
            })}
          </div>
          </div>

          <div className="quiz-actions">
            <button className="secondary-button" disabled={index === 0} onClick={() => setIndex((value) => value - 1)}>
              Previous
            </button>
            <button
              className="primary-button"
              disabled={!currentAnswer}
              onClick={() => setIndex((value) => Math.min(session.items.length - 1, value + 1))}
            >
              {index === session.items.length - 1 ? "Finish quiz" : "Next"}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

function MatchGame({
  onClose,
  onToggleTheme,
  theme,
}: {
  onClose: () => void;
  onToggleTheme: () => void;
  theme: Theme;
}) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [lessonIndex, setLessonIndex] = useState(0);
  const [tenseKey, setTenseKey] = useState<"present" | "past" | "future">("present");
  const [selectedPronoun, setSelectedPronoun] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<string>("");
  const [score, setScore] = useState({ correct: 0, wrong: 0 });

  const lesson = matchLessons[lessonIndex];
  const forms = lesson.tenses[tenseKey];
  const pronouns = persons;
  const rightOrder = useMemo(() => shuffle(forms), [forms]);

  const done = matched.length === pronouns.length;

  useEffect(() => {
    if (!done) return;
    const timer = window.setTimeout(() => {
      const nextRound = roundIndex + 1;
      const nextLessonIndex = nextRound % matchLessons.length;
      const nextTense = nextRound % 3 === 0 ? "present" : nextRound % 3 === 1 ? "past" : "future";
      setMatched([]);
      setSelectedPronoun(null);
      setFeedback("");
      setRoundIndex(nextRound);
      setLessonIndex(nextLessonIndex);
      setTenseKey(nextTense);
    }, 1100);
    return () => window.clearTimeout(timer);
  }, [done, roundIndex]);

  return (
    <div className="app-shell">
      <AppHeader
        title="Verb Matching"
        subtitle="Pair each pronoun with the correct form."
        eyebrow={`Round ${roundIndex + 1}`}
        onBack={onClose}
        onToggleTheme={onToggleTheme}
        theme={theme}
      />
      <main className="content">
        <section className="panel">
          <div className="split-header">
            <div>
              <h3>{lesson.label}</h3>
              <p>{lesson.notes}</p>
            </div>
            <div className="pill">{tenseKey}</div>
          </div>
          <div className="stats-inline">
            <span>✓ {score.correct}</span>
            <span>✕ {score.wrong}</span>
          </div>
          <div className="match-layout">
            <div className="match-column">
              <span className="mini-label">Pronouns</span>
              {pronouns.map((pronoun, idx) => (
                <button
                  key={pronoun}
                  className={[
                    "match-chip",
                    selectedPronoun === idx ? "selected" : "",
                    matched.includes(idx) ? "resolved" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  disabled={matched.includes(idx)}
                  onClick={() => setSelectedPronoun(idx)}
                >
                  {pronoun}
                </button>
              ))}
            </div>
            <div className="match-column">
              <span className="mini-label">Forms</span>
              {rightOrder.map((form) => {
                const formIndex = forms.indexOf(form);
                return (
                  <button
                    key={`${tenseKey}-${form}`}
                    className={matched.includes(formIndex) ? "match-chip resolved" : "match-chip"}
                    disabled={matched.includes(formIndex)}
                    onClick={() => {
                      if (selectedPronoun === null) return;
                      if (forms[selectedPronoun] === form) {
                        setMatched((value) => [...value, selectedPronoun]);
                        setScore((value) => ({ ...value, correct: value.correct + 1 }));
                        setFeedback(`${pronouns[selectedPronoun]} → ${form}`);
                      } else {
                        setScore((value) => ({ ...value, wrong: value.wrong + 1 }));
                        setFeedback("Not that one. Try another form.");
                      }
                      setSelectedPronoun(null);
                    }}
                  >
                    {form}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="feedback-box">{feedback || "Tap a pronoun, then choose its matching verb form."}</div>
        </section>
      </main>
    </div>
  );
}

function TypingChallenge({
  onClose,
  onToggleTheme,
  theme,
}: {
  onClose: () => void;
  onToggleTheme: () => void;
  theme: Theme;
}) {
  const [queue, setQueue] = useState(() => shuffle(verbs).slice(0, TYPING_DRILL_LENGTH));
  const [index, setIndex] = useState(0);
  const [inputs, setInputs] = useState({ present: "", past: "", future: "" });
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState({ perfect: 0, attempted: 0 });

  const current = queue[index];
  const answers = useMemo(
    () => ({
      present: current.p[0],
      past: current.pa[0],
      future: current.f[0],
    }),
    [current],
  );

  const correctness = checked
    ? {
        present: inputs.present.trim() === answers.present,
        past: inputs.past.trim() === answers.past,
        future: inputs.future.trim() === answers.future,
      }
    : null;

  return (
    <div className="app-shell">
      <AppHeader
        title="Verb Form Drill"
        subtitle="Type the 1st-person singular forms from memory."
        eyebrow={`${index + 1} of ${queue.length}`}
        onBack={onClose}
        onToggleTheme={onToggleTheme}
        theme={theme}
      />
      <main className="content">
        <section className="panel">
          <div className="split-header">
            <div>
              <h3>{current.en}</h3>
              <p>{current.inf}</p>
            </div>
            <div className="pill">{score.perfect}/{score.attempted}</div>
          </div>
          <div className="form-grid">
            {(["present", "past", "future"] as const).map((key) => (
              <label key={key} className="field">
                <span>{key}</span>
                <input
                  value={inputs[key]}
                  onChange={(event) => setInputs((value) => ({ ...value, [key]: event.target.value }))}
                  className={!checked ? "" : correctness?.[key] ? "ok" : "bad"}
                />
                {checked && <small>Answer: {answers[key]}</small>}
              </label>
            ))}
          </div>
          <div className="quiz-actions">
            {!checked ? (
              <button
                className="primary-button"
                onClick={() => {
                  const nextCorrect = Object.entries(answers).every(([key, value]) => inputs[key as keyof typeof inputs].trim() === value);
                  setChecked(true);
                  setScore((value) => ({
                    perfect: value.perfect + (nextCorrect ? 1 : 0),
                    attempted: value.attempted + 1,
                  }));
                }}
              >
                Check answers
              </button>
            ) : (
              <button
                className="primary-button"
                onClick={() => {
                  setChecked(false);
                  setInputs({ present: "", past: "", future: "" });
                  if (index < queue.length - 1) {
                    setIndex((value) => value + 1);
                  } else {
                    setQueue(shuffle(verbs).slice(0, TYPING_DRILL_LENGTH));
                    setIndex(0);
                    setScore({ perfect: 0, attempted: 0 });
                  }
                }}
              >
                {index < queue.length - 1 ? "Next verb" : "Restart drill"}
              </button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<View>("dashboard");
  const [session, setSession] = useState<Session | null>(null);
  const [stored, setStored] = useState<StoredState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return { theme: "light", deckStats: {}, favorites: [], mistakes: [] };
      }
      const parsed = JSON.parse(raw) as Partial<StoredState>;
      return {
        theme: parsed.theme === "dark" ? "dark" : "light",
        deckStats: parsed.deckStats ?? {},
        favorites: dedupeCards(parsed.favorites ?? []),
        mistakes: dedupeCards(parsed.mistakes ?? []),
      };
    } catch {
      return { theme: "light", deckStats: {}, favorites: [], mistakes: [] };
    }
  });
  const [theme, setTheme] = useState<Theme>(stored.theme);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedVerb, setSelectedVerb] = useState<number | null>(null);
  const [selectedGrammar, setSelectedGrammar] = useState<number | null>(null);
  const [verbSearch, setVerbSearch] = useState("");
  const [vocabSearch, setVocabSearch] = useState("");
  const deferredVerbSearch = useDeferredValue(verbSearch);
  const deferredVocabSearch = useDeferredValue(vocabSearch);
  const [tense, setTense] = useState<keyof typeof tenseLabels>("p");
  const [openPhrase, setOpenPhrase] = useState<string | null>(phraseSections[0]?.title ?? null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...stored, theme }));
  }, [stored, theme]);

  const saveState = (updater: (current: StoredState) => StoredState) => {
    setStored((current) => {
      const next = updater(current);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const favorites = useMemo(() => new Set(stored.favorites.map((card) => card.id)), [stored.favorites]);
  const categoryEntries = useMemo(() => Object.entries(vocab), []);
  const deckStatsEntries = useMemo(() => Object.entries(stored.deckStats), [stored.deckStats]);
  const totalWords = useMemo(() => categoryEntries.reduce((sum, [, entries]) => sum + entries.length, 0), [categoryEntries]);
  const totalVerbForms = verbs.length * 3 * persons.length;
  const totalCorrect = deckStatsEntries.reduce((sum, [, deck]) => sum + deck.correct, 0);
  const totalAttempted = deckStatsEntries.reduce((sum, [, deck]) => sum + deck.attempted, 0);
  const totalSessions = deckStatsEntries.reduce((sum, [, deck]) => sum + deck.sessions, 0);
  const overallAccuracy = percent(totalCorrect, totalAttempted);
  const selectedCategoryWords = selectedCategory ? vocab[selectedCategory] ?? [] : [];
  const filteredVerbs = useMemo(() => {
    const query = deferredVerbSearch.trim().toLowerCase();
    if (!query) return verbs;
    return verbs.filter(
      (verb) => verb.inf.toLowerCase().includes(query) || verb.en.toLowerCase().includes(query),
    );
  }, [deferredVerbSearch]);

  const filteredVocabResults = useMemo(() => {
    const query = deferredVocabSearch.trim().toLowerCase();
    if (!query) return [];
    return categoryEntries.flatMap(([category, entries]) =>
      entries
        .filter(([gr, en]) => gr.toLowerCase().includes(query) || en.toLowerCase().includes(query))
        .map(([gr, en]) => ({ category, gr, en })),
    );
  }, [categoryEntries, deferredVocabSearch]);

  const familyStats = useMemo(() => {
    const grouped = new Map<string, DeckStats>();
    for (const [deckId, stats] of deckStatsEntries) {
      const family = getDeckFamily(deckId);
      const current = grouped.get(family) ?? { attempted: 0, correct: 0, sessions: 0, bestScore: 0, lastScore: 0 };
      grouped.set(family, {
        attempted: current.attempted + stats.attempted,
        correct: current.correct + stats.correct,
        sessions: current.sessions + stats.sessions,
        bestScore: Math.max(current.bestScore, stats.bestScore),
        lastScore: stats.lastScore,
      });
    }
    return [...grouped.entries()]
      .map(([label, stats]) => ({
        label,
        accuracy: percent(stats.correct, stats.attempted),
        stats,
      }))
      .sort((left, right) => right.stats.sessions - left.stats.sessions || right.accuracy - left.accuracy);
  }, [deckStatsEntries]);

  const rankedDecks = useMemo(
    () =>
      [...deckStatsEntries]
        .map(([deckId, stats]) => ({
          deckId,
          label: formatDeckLabel(deckId),
          family: getDeckFamily(deckId),
          accuracy: percent(stats.correct, stats.attempted),
          stats,
        }))
        .sort((left, right) => right.stats.lastScore - left.stats.lastScore || right.accuracy - left.accuracy),
    [deckStatsEntries],
  );

  const strongestDeck = rankedDecks[0] ?? null;
  const needsWorkDeck =
    [...rankedDecks].sort((left, right) => left.stats.lastScore - right.stats.lastScore || left.accuracy - right.accuracy)[0] ??
    null;

  const launchQuiz = (quiz: QuizSession) => {
    setSession(quiz);
  };

  const toggleFavorite = (card: ReviewCard) => {
    saveState((current) => {
      const exists = current.favorites.some((entry) => entry.id === card.id);
      return {
        ...current,
        favorites: exists
          ? current.favorites.filter((entry) => entry.id !== card.id)
          : dedupeCards([card, ...current.favorites]),
      };
    });
  };

  const recordQuizOutcome = (deckId: string, answers: QuizAnswer[], items: QuizItem[]) => {
    const correct = answers.filter((entry) => entry?.correct).length;
    const wrongCards = items.filter((_, idx) => !answers[idx]?.correct).map((item) => item.review);
    saveState((current) => {
      const previous = toDeckStats(current.deckStats[deckId]);
      const lastScore = percent(correct, items.length);
      return {
        ...current,
        deckStats: {
          ...current.deckStats,
          [deckId]: {
            attempted: previous.attempted + items.length,
            correct: previous.correct + correct,
            sessions: previous.sessions + 1,
            bestScore: Math.max(previous.bestScore, lastScore),
            lastScore,
          },
        },
        mistakes: dedupeCards([...wrongCards, ...current.mistakes]).slice(0, 80),
      };
    });
  };

  const buildVocabQuiz = (category: string, direction: "gr-en" | "en-gr") => {
    const words = shuffle(vocab[category]).slice(0, Math.min(LONG_QUIZ_LENGTH, vocab[category].length));
    const items = words.map(([gr, en], idx) => {
      const prompt = direction === "gr-en" ? gr : en;
      const answer = direction === "gr-en" ? en : gr;
      const pool = vocab[category]
        .map((entry) => (direction === "gr-en" ? entry[1] : entry[0]))
        .filter((entry) => entry !== answer);
      const choices = buildChoices(answer, pool);
      return {
        id: `${category}-${direction}-${idx}`,
        prompt,
        choices,
        answer,
        review: { id: `vocab:${category}:${gr}`, front: gr, back: en, source: category },
      };
    });
    launchQuiz({
      kind: "quiz",
      deckId: `vocab:${category}:${direction}`,
      title: category,
      subtitle: direction === "gr-en" ? "Greek to English" : "English to Greek",
      items,
    });
  };

  const buildVerbMeaningQuiz = () => {
    const items = shuffle(verbs).slice(0, Math.min(STANDARD_QUIZ_LENGTH, verbs.length)).map((verb, idx) => {
      const wrong = sampleUnique(
        verbs.filter((entry) => entry.en !== verb.en).map((entry) => entry.en),
        3,
      );
      return {
        id: `verb-meaning-${idx}`,
        prompt: verb.inf,
        choices: buildChoices(verb.en, wrong),
        answer: verb.en,
        review: { id: `verb:${verb.inf}`, front: verb.inf, back: verb.en, source: "Verb meanings" },
        detail: verb.type.toUpperCase(),
      };
    });
    launchQuiz({ kind: "quiz", deckId: "verbs:meaning", title: "Verb Meanings", subtitle: "Match the verb to its meaning.", items });
  };

  const buildVerbConjugationQuiz = () => {
    const items = shuffle(verbs).slice(0, Math.min(STANDARD_QUIZ_LENGTH, verbs.length)).map((verb, idx) => {
      const tenseKeys: Array<keyof Pick<Verb, "p" | "pa" | "f">> = ["p", "pa", "f"];
      const tenseKey = tenseKeys[Math.floor(Math.random() * tenseKeys.length)];
      const personIndex = Math.floor(Math.random() * persons.length);
      const answer = verb[tenseKey][personIndex];
      const wrongPool = sampleUnique(
        verbs.filter((entry) => entry.inf !== verb.inf).map((entry) => entry[tenseKey][personIndex]),
        3,
      );
      return {
        id: `verb-form-${idx}`,
        prompt: `${verb.inf} — ${persons[personIndex]}`,
        choices: buildChoices(answer, wrongPool),
        answer,
        review: {
          id: `verb-form:${verb.inf}:${tenseKey}:${personIndex}`,
          front: `${verb.inf} / ${persons[personIndex]}`,
          back: answer,
          source: `${tenseLabels[tenseKey]} form`,
        },
        detail: `${tenseLabels[tenseKey]} (${tenseGreek[tenseKey]})`,
      };
    });
    launchQuiz({
      kind: "quiz",
      deckId: "verbs:conjugation",
      title: "Conjugation Builder",
      subtitle: "Pick the exact person and tense form.",
      items,
    });
  };

  const buildGrammarQuiz = (topicIndex?: number) => {
    const pool = topicIndex === undefined ? grammarQuiz : grammarQuiz.filter((entry) => entry.topic === topicIndex);
    const targetSize = topicIndex === undefined ? LONG_QUIZ_LENGTH : STANDARD_QUIZ_LENGTH;
    const items = shuffle(pool).slice(0, Math.min(targetSize, pool.length)).map((question, idx) => ({
      id: `grammar-${topicIndex ?? "all"}-${idx}`,
      prompt: question.q,
      choices: buildChoices(question.a, question.wrong),
      answer: question.a,
      review: {
        id: `grammar:${topicIndex ?? "all"}:${idx}:${question.q}`,
        front: question.q,
        back: question.a,
        source: topicIndex === undefined ? "Grammar mixed" : safeTopicTitle(grammar[topicIndex].t),
      },
    }));
    launchQuiz({
      kind: "quiz",
      deckId: topicIndex === undefined ? "grammar:all" : `grammar:${topicIndex}`,
      title: topicIndex === undefined ? "Grammar Mixed Quiz" : safeTopicTitle(grammar[topicIndex].t),
      subtitle: topicIndex === undefined ? "A broad A2 grammar check." : "Topic-focused review.",
      items,
    });
  };

  const openFavoritesQuiz = () => {
    const cards = stored.favorites.slice(0, REVIEW_QUIZ_LENGTH);
    if (!cards.length) return;
    const items = cards.map((card, idx) => {
      const otherAnswers = stored.favorites.filter((entry) => entry.id !== card.id).map((entry) => entry.back);
      const fallbackPool = categoryEntries.flatMap(([, entries]) => entries.map(([, en]) => en));
      const choices = buildChoices(card.back, otherAnswers.length >= 3 ? otherAnswers : fallbackPool);
      return {
        id: `favorite-${idx}`,
        prompt: card.front,
        choices,
        answer: card.back,
        review: card,
        detail: card.source,
      };
    });
    launchQuiz({
      kind: "quiz",
      deckId: "review:favorites",
      title: "Favorites Review",
      subtitle: "Practice the cards you saved.",
      items,
    });
  };

  const openMistakesQuiz = () => {
    const cards = stored.mistakes.slice(0, REVIEW_QUIZ_LENGTH);
    if (!cards.length) return;
    const items = cards.map((card, idx) => {
      const pool = categoryEntries.flatMap(([, entries]) => entries.map(([, en]) => en));
      return {
        id: `mistake-${idx}`,
        prompt: card.front,
        choices: buildChoices(card.back, pool),
        answer: card.back,
        review: card,
        detail: `From ${card.source}`,
      };
    });
    launchQuiz({
      kind: "quiz",
      deckId: "review:mistakes",
      title: "Mistakes Recovery",
      subtitle: "Revisit the cards you previously missed.",
      items,
    });
  };

  const buildPhraseQuiz = (direction: "gr-en" | "en-gr", sectionTitle?: string) => {
    const sourceSections = sectionTitle
      ? phraseSections.filter((section) => section.title === sectionTitle)
      : phraseSections;
    const phrasePool = sourceSections.flatMap((section) =>
      section.items.map((item) => ({
        ...item,
        section: section.title,
      })),
    );
    const allPhrases = phraseSections.flatMap((section) =>
      section.items.map((item) => ({
        ...item,
        section: section.title,
      })),
    );
    const targetSize = sectionTitle ? STANDARD_QUIZ_LENGTH : LONG_QUIZ_LENGTH;
    const sampled = shuffle(phrasePool).slice(0, Math.min(targetSize, phrasePool.length));
    const items = sampled.map((item, idx) => {
      const prompt = direction === "gr-en" ? item.gr : item.en;
      const answer = direction === "gr-en" ? item.en : item.gr;
      const choicePool = allPhrases
        .map((entry) => (direction === "gr-en" ? entry.en : entry.gr))
        .filter((entry) => entry !== answer);
      return {
        id: `phrase-${direction}-${sectionTitle ?? "all"}-${idx}`,
        prompt,
        choices: buildChoices(answer, choicePool),
        answer,
        review: {
          id: `phrase:${item.section}:${item.gr}`,
          front: item.gr,
          back: item.en,
          source: `Phrasebook: ${item.section}`,
        },
        detail: item.note ? `${item.section} · ${item.note}` : item.section,
      };
    });
    launchQuiz({
      kind: "quiz",
      deckId: `phrases:${sectionTitle ?? "all"}:${direction}`,
      title: sectionTitle ? `${sectionTitle} Quiz` : "Phrasebook Quiz",
      subtitle: direction === "gr-en" ? "Greek to English phrases" : "English to Greek phrases",
      items,
    });
  };

  if (session?.kind === "quiz") {
    return (
      <QuizRunner
        session={session}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        onClose={() => setSession(null)}
        onComplete={recordQuizOutcome}
        onRestart={() => setSession(randomizeQuizSession(session))}
        onToggleTheme={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
        theme={theme}
      />
    );
  }

  if (session?.kind === "match") {
    return (
      <MatchGame
        onClose={() => setSession(null)}
        onToggleTheme={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
        theme={theme}
      />
    );
  }

  if (session?.kind === "typing") {
    return (
      <TypingChallenge
        onClose={() => setSession(null)}
        onToggleTheme={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
        theme={theme}
      />
    );
  }

  const selectedVerbData = selectedVerb !== null ? verbs[selectedVerb] : null;
  const selectedGrammarData = selectedGrammar !== null ? grammar[selectedGrammar] : null;

  return (
    <div className="app-shell">
      <AppHeader
        title="Greek Exam Studio"
        subtitle="A cleaner A2 study app with vocab, conjugation, grammar, phrasebook, and progress."
        eyebrow={`${daysUntilExam()} days until the May 19, 2026 exam`}
        onToggleTheme={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
        theme={theme}
      />
      <TabBar view={view} setView={setView} />
      <main className="content">
        {view === "dashboard" && (
          <>
            <section className="dashboard-shell">
              <article className="dashboard-lead">
                <span className="mini-label">Study dashboard</span>
                <h2>Train the exam the way you actually revise</h2>
                <p>
                  Mix grammar, verbs, vocabulary, phrases, and recovery decks from one place instead of bouncing
                  around disconnected screens.
                </p>
                <div className="dashboard-kpis">
                  <div className="dashboard-kpi">
                    <strong>{overallAccuracy}%</strong>
                    <span>overall accuracy</span>
                  </div>
                  <div className="dashboard-kpi">
                    <strong>{totalSessions}</strong>
                    <span>quiz sessions</span>
                  </div>
                  <div className="dashboard-kpi">
                    <strong>{stored.mistakes.length}</strong>
                    <span>cards to recover</span>
                  </div>
                </div>
                <div className="dashboard-cta-row">
                  <button className="primary-button" onClick={() => buildGrammarQuiz()}>
                    Start mixed quiz
                  </button>
                  <button className="secondary-button" onClick={() => startTransition(() => setView("verbs"))}>
                    Open verb studio
                  </button>
                </div>
              </article>

              <div className="dashboard-side">
                <article className="stat-panel standout">
                  <span className="mini-label">Coverage</span>
                  <strong>{totalWords}</strong>
                  <p>{categoryEntries.length} vocab categories and {phraseSections.length} phrase sections ready.</p>
                </article>
                <article className="stat-panel">
                  <span className="mini-label">Verb engine</span>
                  <strong>{verbs.length}</strong>
                  <p>{totalVerbForms} forms across present, past, and future drills.</p>
                </article>
              </div>
            </section>

            <section className="panel">
              <div className="split-header">
                <div>
                  <h3>Training modes</h3>
                  <p>Clearer entry points for the parts of the exam you actually want to target.</p>
                </div>
              </div>
              <div className="dashboard-mode-grid">
                <button className="dashboard-mode dashboard-mode-blue" onClick={() => buildGrammarQuiz()}>
                  <span className="mini-label">Mixed</span>
                  <strong>Grammar pressure test</strong>
                  <span>Run a broad rule check with exam-style wording.</span>
                </button>
                <button className="dashboard-mode dashboard-mode-amber" onClick={buildVerbConjugationQuiz}>
                  <span className="mini-label">Verbs</span>
                  <strong>Conjugation sprint</strong>
                  <span>Train tense and person recognition with longer sessions.</span>
                </button>
                <button className="dashboard-mode dashboard-mode-green" onClick={() => setSession({ kind: "match" })}>
                  <span className="mini-label">Game</span>
                  <strong>Pronoun matcher</strong>
                  <span>Quick, interactive practice pulled from the original build.</span>
                </button>
                <button className="dashboard-mode dashboard-mode-rose" onClick={() => setSession({ kind: "typing" })}>
                  <span className="mini-label">Recall</span>
                  <strong>Typing drill</strong>
                  <span>Force active memory instead of passive recognition.</span>
                </button>
              </div>
            </section>

            <section className="panel">
              <div className="split-header">
                <div>
                  <h3>Next best moves</h3>
                  <p>Shortcuts that keep the app feeling alive instead of making you search around.</p>
                </div>
              </div>
              <div className="dashboard-utility-grid">
                <button className="mini-card utility-card" disabled={!stored.favorites.length} onClick={openFavoritesQuiz}>
                  <span className="mini-label">Saved</span>
                  <strong>{stored.favorites.length}</strong>
                  <span>Favorites review</span>
                </button>
                <button className="mini-card utility-card" disabled={!stored.mistakes.length} onClick={openMistakesQuiz}>
                  <span className="mini-label">Recovery</span>
                  <strong>{stored.mistakes.length}</strong>
                  <span>Mistakes review</span>
                </button>
                <button className="mini-card utility-card" onClick={() => startTransition(() => setView("phrases"))}>
                  <span className="mini-label">Phrases</span>
                  <strong>{phraseSections.length}</strong>
                  <span>Phrasebook sections</span>
                </button>
                <button className="mini-card utility-card" onClick={() => startTransition(() => setView("progress"))}>
                  <span className="mini-label">Stats</span>
                  <strong>{deckStatsEntries.length}</strong>
                  <span>Tracked quiz decks</span>
                </button>
              </div>
            </section>
          </>
        )}

        {view === "vocab" && !selectedCategory && (
          <section className="panel">
            <div className="split-header">
              <div>
                <h3>Vocabulary search</h3>
                <p>Search across the full list or open a category to quiz it.</p>
              </div>
            </div>
            <input
              className="search-input"
              placeholder="Search Greek or English..."
              value={vocabSearch}
              onChange={(event) => setVocabSearch(event.target.value)}
            />
            {deferredVocabSearch.trim() ? (
              <div className="list-stack">
                {filteredVocabResults.slice(0, 60).map((entry) => (
                  <div key={`${entry.category}-${entry.gr}-${entry.en}`} className="list-row">
                    <div>
                      <strong>{entry.gr}</strong>
                      <small>{entry.category}</small>
                    </div>
                    <span>{entry.en}</span>
                  </div>
                ))}
                {!filteredVocabResults.length && <div className="empty-state">No matching words yet.</div>}
              </div>
            ) : (
              <div className="list-stack">
                {categoryEntries.map(([category, entries]) => (
                  <button key={category} className="list-row list-button" onClick={() => setSelectedCategory(category)}>
                    <div>
                      <strong>{category}</strong>
                      <small>{entries.length} words</small>
                    </div>
                    <span>Open →</span>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {view === "vocab" && selectedCategory && (
          <section className="panel">
            <div className="split-header">
              <div>
                <h3>{selectedCategory}</h3>
                <p>{selectedCategoryWords.length} words with two-way quiz modes.</p>
              </div>
              <button className="secondary-button" onClick={() => setSelectedCategory(null)}>
                Back
              </button>
            </div>
            <div className="quiz-actions">
              <button className="primary-button" onClick={() => buildVocabQuiz(selectedCategory, "gr-en")}>
                Greek → English
              </button>
              <button className="secondary-button" onClick={() => buildVocabQuiz(selectedCategory, "en-gr")}>
                English → Greek
              </button>
            </div>
            <div className="list-stack">
              {selectedCategoryWords.map(([gr, en]) => (
                <div key={`${gr}-${en}`} className="list-row">
                  <div>
                    <strong>{gr}</strong>
                  </div>
                  <span>{en}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {view === "verbs" && !selectedVerbData && (
          <section className="panel">
            <div className="verb-studio">
              <div className="verb-studio-head">
                <div>
                  <span className="mini-label">Verb studio</span>
                  <h3>Browse, compare, and drill verbs without the dead list feel</h3>
                  <p>Use the quick modes or open any verb to inspect its forms cleanly.</p>
                </div>
                <div className="verb-studio-stats">
                  <div className="verb-studio-pill">
                    <strong>{verbs.length}</strong>
                    <span>verbs</span>
                  </div>
                  <div className="verb-studio-pill">
                    <strong>{filteredVerbs.length}</strong>
                    <span>shown</span>
                  </div>
                  <div className="verb-studio-pill">
                    <strong>{totalVerbForms}</strong>
                    <span>forms</span>
                  </div>
                </div>
              </div>

              <div className="verb-action-grid">
                <button className="verb-action-card action-meaning" onClick={buildVerbMeaningQuiz}>
                  <span className="mini-label">Recognition</span>
                  <strong>Meanings</strong>
                  <span>Recognize core verbs fast</span>
                </button>
                <button className="verb-action-card action-conjugation" onClick={buildVerbConjugationQuiz}>
                  <span className="mini-label">Accuracy</span>
                  <strong>Conjugation</strong>
                  <span>Spot the right tense and person</span>
                </button>
                <button className="verb-action-card action-match" onClick={() => setSession({ kind: "match" })}>
                  <span className="mini-label">Interactive</span>
                  <strong>Match game</strong>
                  <span>Pronouns and endings</span>
                </button>
                <button className="verb-action-card action-typing" onClick={() => setSession({ kind: "typing" })}>
                  <span className="mini-label">Recall</span>
                  <strong>Typing drill</strong>
                  <span>Recall forms from memory</span>
                </button>
              </div>
            </div>
            <input
              className="search-input"
              placeholder="Search Greek infinitive or English meaning..."
              value={verbSearch}
              onChange={(event) => setVerbSearch(event.target.value)}
            />
            <div className="verb-results-head">
              <span className="section-label">Verb browser</span>
              <span className="verb-results-count">{filteredVerbs.length} results</span>
            </div>
            <div className="verb-browser-grid">
              {filteredVerbs.map((verb) => {
                const index = verbs.indexOf(verb);
                return (
                  <button key={`${verb.inf}-${verb.en}`} className="verb-browser-card" onClick={() => setSelectedVerb(index)}>
                    <div className="verb-browser-top">
                      <span className={`verb-type-badge type-${verb.type.toLowerCase()}`}>{verb.type.toUpperCase()}</span>
                      <span className="verb-browser-link">Open</span>
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
            {!filteredVerbs.length && <div className="empty-state">No matching verbs yet. Try a Greek stem or an English meaning.</div>}
          </section>
        )}

        {view === "verbs" && selectedVerbData && (
          <section className="panel">
            <div className="verb-detail-hero">
              <div className="verb-detail-copy">
                <span className={`verb-type-badge type-${selectedVerbData.type.toLowerCase()}`}>{selectedVerbData.type.toUpperCase()}</span>
                <h3>{selectedVerbData.inf}</h3>
                <p>{selectedVerbData.en}</p>
                <div className="verb-detail-glance">
                  <div className="verb-glance-card">
                    <small>Present</small>
                    <strong>{selectedVerbData.p[0]}</strong>
                  </div>
                  <div className="verb-glance-card">
                    <small>Past</small>
                    <strong>{selectedVerbData.pa[0]}</strong>
                  </div>
                  <div className="verb-glance-card">
                    <small>Future</small>
                    <strong>{selectedVerbData.f[0]}</strong>
                  </div>
                </div>
              </div>
              <div className="verb-detail-actions">
                <button className="secondary-button" onClick={() => setSelectedVerb(null)}>
                  Back to browser
                </button>
                <div className="type-card verb-detail-note">
                  <p>{typeDescriptions[selectedVerbData.type] ?? "Core study verb."}</p>
                </div>
              </div>
            </div>
            <div className="tense-switcher">
              {(["p", "pa", "f"] as const).map((key) => (
                <button key={key} className={tense === key ? "switch active" : "switch"} onClick={() => setTense(key)}>
                  {tenseLabels[key]}
                </button>
              ))}
            </div>
            <div className="conjugation-grid">
              {persons.map((person, idx) => (
                <article key={person} className="conjugation-card">
                  <small>{person}</small>
                  <strong>{selectedVerbData[tense][idx]}</strong>
                  <span>{tenseGreek[tense]}</span>
                </article>
              ))}
            </div>
          </section>
        )}

        {view === "grammar" && !selectedGrammarData && (
          <section className="panel">
            <div className="split-header">
              <div>
                <h3>Grammar map</h3>
                <p>Theory notes, topic drills, and an all-topic quiz for exam prep.</p>
              </div>
              <button className="primary-button" onClick={() => buildGrammarQuiz()}>
                Mixed quiz
              </button>
            </div>
            <div className="list-stack">
              {grammar.map((topic, idx) => (
                <button key={topic.t} className="list-row list-button" onClick={() => setSelectedGrammar(idx)}>
                  <div>
                    <strong>{safeTopicTitle(topic.t)}</strong>
                    <small>{grammarQuiz.filter((entry) => entry.topic === idx).length} questions</small>
                  </div>
                  <span>Open →</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {view === "grammar" && selectedGrammarData && (
          <section className="panel">
            <div className="split-header">
              <div>
                <h3>{safeTopicTitle(selectedGrammarData.t)}</h3>
                <p>Study note with linked quiz support.</p>
              </div>
              <button className="secondary-button" onClick={() => setSelectedGrammar(null)}>
                Back
              </button>
            </div>
            <article className="grammar-card">{selectedGrammarData.c}</article>
            <div className="quiz-actions">
              <button className="primary-button" onClick={() => buildGrammarQuiz(selectedGrammar!)}>
                Quiz this topic
              </button>
            </div>
          </section>
        )}

        {view === "phrases" && (
          <section className="panel">
            <div className="split-header">
              <div>
                <h3>Phrasebook</h3>
                <p>Useful real-life Greek pulled over from the original HTML study sheet, now with two-way phrase exams.</p>
              </div>
            </div>
            <div className="quiz-actions">
              <button className="primary-button" onClick={() => buildPhraseQuiz("gr-en")}>
                Quiz Greek → English
              </button>
              <button className="secondary-button" onClick={() => buildPhraseQuiz("en-gr")}>
                Quiz English → Greek
              </button>
            </div>
            <div className="accordion-list">
              {phraseSections.map((section) => {
                const open = openPhrase === section.title;
                return (
                  <article key={section.title} className="accordion-card">
                    <button className="accordion-toggle" onClick={() => setOpenPhrase(open ? null : section.title)}>
                      <span>{section.icon} {section.title}</span>
                      <strong>{open ? "−" : "+"}</strong>
                    </button>
                    {open && (
                      <div className="phrase-list">
                        <div className="phrase-actions">
                          <button className="primary-button" onClick={() => buildPhraseQuiz("gr-en", section.title)}>
                            {section.title} GR → EN
                          </button>
                          <button className="secondary-button" onClick={() => buildPhraseQuiz("en-gr", section.title)}>
                            {section.title} EN → GR
                          </button>
                        </div>
                        {section.items.map((item) => (
                          <div key={`${section.title}-${item.gr}`} className="phrase-row">
                            <div>
                              <strong>{item.gr}</strong>
                              {item.note && <small>{item.note}</small>}
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
        )}

        {view === "progress" && (
          <>
            <section className="panel">
              <div className="split-header">
                <div>
                  <h3>General quiz statistics</h3>
                  <p>Track total study volume, accuracy, strongest areas, and the decks that need another pass.</p>
                </div>
                <button
                  className="danger-button"
                  onClick={() => {
                    const next: StoredState = { theme, deckStats: {}, favorites: [], mistakes: [] };
                    setStored(next);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
                  }}
                >
                  Reset progress
                </button>
              </div>
              <div className="stats-grid">
                <article className="stat-panel">
                  <span className="mini-label">Sessions</span>
                  <strong>{totalSessions}</strong>
                  <p>Total completed quiz runs across the whole app.</p>
                </article>
                <article className="stat-panel">
                  <span className="mini-label">Questions</span>
                  <strong>{totalAttempted}</strong>
                  <p>Total answered prompts from vocab, grammar, verbs, phrases, and review decks.</p>
                </article>
                <article className="stat-panel">
                  <span className="mini-label">Accuracy</span>
                  <strong>{overallAccuracy}%</strong>
                  <p>{totalCorrect} correct answers recorded so far.</p>
                </article>
                <article className="stat-panel">
                  <span className="mini-label">Decks trained</span>
                  <strong>{deckStatsEntries.length}</strong>
                  <p>Unique quiz decks with saved performance history.</p>
                </article>
              </div>
              {deckStatsEntries.length ? (
                <div className="two-column progress-layout">
                  <div className="list-stack">
                    <div className="section-label">By area</div>
                    {familyStats.map((family) => (
                      <div key={family.label} className="list-row">
                        <div>
                          <strong>{family.label}</strong>
                          <small>{family.stats.sessions} sessions · {family.stats.attempted} questions</small>
                        </div>
                        <span>{family.accuracy}% accuracy</span>
                      </div>
                    ))}
                  </div>

                  <div className="list-stack">
                    <div className="section-label">Highlights</div>
                    {strongestDeck && (
                      <div className="list-row">
                        <div>
                          <strong>Strongest recent deck</strong>
                          <small>{strongestDeck.family}</small>
                        </div>
                        <span>{strongestDeck.label} · {strongestDeck.stats.lastScore}%</span>
                      </div>
                    )}
                    {needsWorkDeck && (
                      <div className="list-row">
                        <div>
                          <strong>Needs another pass</strong>
                          <small>{needsWorkDeck.family}</small>
                        </div>
                        <span>{needsWorkDeck.label} · {needsWorkDeck.stats.lastScore}%</span>
                      </div>
                    )}
                    <div className="list-row">
                      <div>
                        <strong>Saved for review</strong>
                        <small>Custom study backlog</small>
                      </div>
                      <span>{stored.favorites.length} favorites · {stored.mistakes.length} mistakes</span>
                    </div>
                  </div>
                </div>
              ) : null}
              <div className="list-stack">
                {Object.entries(stored.deckStats).length ? (
                  Object.entries(stored.deckStats).map(([deckId, stats]) => (
                    <div key={deckId} className="list-row">
                      <div>
                        <strong>{formatDeckLabel(deckId)}</strong>
                        <small>{getDeckFamily(deckId)} - {stats.sessions} sessions</small>
                      </div>
                      <span>last {stats.lastScore}% - best {stats.bestScore}%</span>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">No tracked sessions yet. Start a quiz and your stats will appear here.</div>
                )}
              </div>
            </section>

            <section className="panel">
              <div className="split-header">
                <div>
                  <h3>Deck performance</h3>
                  <p>Every quiz deck, ordered by latest score so it is easy to spot what is strong and what still needs work.</p>
                </div>
              </div>
              <div className="list-stack">
                {rankedDecks.length ? (
                  rankedDecks.map((deck) => (
                    <div key={deck.deckId} className="list-row">
                      <div>
                        <strong>{deck.label}</strong>
                        <small>{deck.family} · {deck.stats.sessions} sessions · best {deck.stats.bestScore}%</small>
                      </div>
                      <span>last {deck.stats.lastScore}% · accuracy {deck.accuracy}%</span>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">No deck history yet. Once you finish quizzes, they will show up here automatically.</div>
                )}
              </div>
            </section>

            <section className="panel two-column">
              <div>
                <div className="split-header">
                  <div>
                    <h3>Favorites</h3>
                    <p>{stored.favorites.length} saved review cards</p>
                  </div>
                  <button className="secondary-button" disabled={!stored.favorites.length} onClick={openFavoritesQuiz}>
                    Study
                  </button>
                </div>
                <div className="list-stack compact">
                  {stored.favorites.slice(0, 12).map((card) => (
                    <div key={card.id} className="list-row">
                      <div>
                        <strong>{card.front}</strong>
                        <small>{card.source}</small>
                      </div>
                      <span>{card.back}</span>
                    </div>
                  ))}
                  {!stored.favorites.length && <div className="empty-state">Save cards from any quiz to build a custom review deck.</div>}
                </div>
              </div>

              <div>
                <div className="split-header">
                  <div>
                    <h3>Mistakes</h3>
                    <p>{stored.mistakes.length} cards to revisit</p>
                  </div>
                  <button className="secondary-button" disabled={!stored.mistakes.length} onClick={openMistakesQuiz}>
                    Recover
                  </button>
                </div>
                <div className="list-stack compact">
                  {stored.mistakes.slice(0, 12).map((card) => (
                    <div key={card.id} className="list-row">
                      <div>
                        <strong>{card.front}</strong>
                        <small>{card.source}</small>
                      </div>
                      <span>{card.back}</span>
                    </div>
                  ))}
                  {!stored.mistakes.length && <div className="empty-state">Wrong quiz answers will automatically show up here.</div>}
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
