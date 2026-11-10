import { startTransition, useEffect, useMemo, useState } from "react";
import "./App.css";
import { AppHeader } from "./components/AppHeader";
import { LoginScreen } from "./components/LoginScreen";
import { MatchGame } from "./components/MatchGame";
import { QuizRunner } from "./components/QuizRunner";
import { TabBar } from "./components/TabBar";
import { TypingChallenge } from "./components/TypingChallenge";
import { DashboardView } from "./components/views/DashboardView";
import { GrammarView } from "./components/views/GrammarView";
import { PhrasesView } from "./components/views/PhrasesView";
import { ProfileView } from "./components/views/ProfileView";
import { ProgressView } from "./components/views/ProgressView";
import { VerbsView } from "./components/views/VerbsView";
import { VocabView } from "./components/views/VocabView";
import { emptyStoredState, PASS_THRESHOLD, tenseLabels } from "./features/study/constants";
import { grammar, phraseSections, verbs, vocab } from "./features/study/data";
import {
  buildGrammarQuizSession,
  buildPhraseQuizSession,
  buildReviewQuizSession,
  buildVerbConjugationQuizSession,
  buildVerbMeaningQuizSession,
  buildVerbTranslationQuizSession,
  buildVocabQuizSession,
} from "./features/study/quizBuilders";
import type { DeckStats, QuizAnswer, QuizItem, ReviewCard, StoredState, StudySession, Theme, View } from "./features/study/types";
import {
  daysUntilExam,
  dedupeCards,
  formatDeckLabel,
  getBestScore,
  getDeckFamily,
  percent,
  randomizeQuizSession,
  toDeckStats,
} from "./features/study/utils";
import { loadCurrentUser, loadProgress, saveCurrentUser, saveProgress } from "./lib/storage";

export default function App() {
  const [view, setView] = useState<View>("dashboard");
  const [session, setSession] = useState<StudySession | null>(null);
  const [userName, setUserName] = useState<string | null>(loadCurrentUser);
  const [stored, setStored] = useState<StoredState>(() => (userName ? loadProgress(userName) : emptyStoredState));
  const [theme, setTheme] = useState<Theme>(stored.theme);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedVerb, setSelectedVerb] = useState<number | null>(null);
  const [selectedGrammar, setSelectedGrammar] = useState<number | null>(null);
  const [verbSearch, setVerbSearch] = useState("");
  const [vocabSearch, setVocabSearch] = useState("");
  const [tense, setTense] = useState<keyof typeof tenseLabels>("p");
  const [openPhrase, setOpenPhrase] = useState<string | null>(phraseSections[0]?.title ?? null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    if (!userName) return;
    saveProgress(userName, { ...stored, theme });
  }, [userName, stored, theme]);

  const saveState = (updater: (current: StoredState) => StoredState) => {
    setStored((current) => updater(current));
  };

  const handleToggleTheme = () => {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      setStored((storedState) => ({ ...storedState, theme: next }));
      return next;
    });
  };

  const favorites = useMemo(() => new Set(stored.favorites.map((card) => card.id)), [stored.favorites]);
  const categoryEntries = useMemo(() => Object.entries(vocab), []);
  const deckStatsEntries = useMemo(() => Object.entries(stored.deckStats), [stored.deckStats]);
  const totalWords = useMemo(() => categoryEntries.reduce((sum, [, entries]) => sum + entries.length, 0), [categoryEntries]);
  const totalVerbForms = verbs.length * 3;
  const totalCorrect = deckStatsEntries.reduce((sum, [, deck]) => sum + deck.correct, 0);
  const totalAttempted = deckStatsEntries.reduce((sum, [, deck]) => sum + deck.attempted, 0);
  const totalSessions = deckStatsEntries.reduce((sum, [, deck]) => sum + deck.sessions, 0);
  const overallAccuracy = percent(totalCorrect, totalAttempted);
  const vocabCategoryBestScores = useMemo(
    () =>
      Object.fromEntries(
        categoryEntries.map(([category]) => [
          category,
          getBestScore(stored.deckStats[`vocab:${category}:gr-en`]?.bestScore, stored.deckStats[`vocab:${category}:en-gr`]?.bestScore),
        ]),
      ) as Record<string, number | null>,
    [categoryEntries, stored.deckStats],
  );
  const vocabCategoryPassFail = useMemo(
    () =>
      Object.fromEntries(
        categoryEntries.map(([category]) => {
          const a = toDeckStats(stored.deckStats[`vocab:${category}:gr-en`]);
          const b = toDeckStats(stored.deckStats[`vocab:${category}:en-gr`]);
          return [category, { passed: a.passed + b.passed, failed: a.failed + b.failed }];
        }),
      ) as Record<string, { passed: number; failed: number }>,
    [categoryEntries, stored.deckStats],
  );
  const passedVocabCategories = useMemo(
    () => categoryEntries.filter(([category]) => (vocabCategoryBestScores[category] ?? 0) > 80).length,
    [categoryEntries, vocabCategoryBestScores],
  );
  const vocabCompletionPercent = categoryEntries.length ? Math.round((passedVocabCategories / categoryEntries.length) * 100) : 0;
  const verbMeaningBestScore = stored.deckStats["verbs:meaning"]?.bestScore ?? null;
  const verbConjugationBestScore = stored.deckStats["verbs:conjugation"]?.bestScore ?? null;
  const verbTranslationBestScore = stored.deckStats["verbs:translation-all"]?.bestScore ?? null;
  const verbMeaningPassFail = useMemo(() => {
    const s = toDeckStats(stored.deckStats["verbs:meaning"]);
    return { passed: s.passed, failed: s.failed };
  }, [stored.deckStats]);
  const verbConjugationPassFail = useMemo(() => {
    const s = toDeckStats(stored.deckStats["verbs:conjugation"]);
    return { passed: s.passed, failed: s.failed };
  }, [stored.deckStats]);
  const verbTranslationPassFail = useMemo(() => {
    const s = toDeckStats(stored.deckStats["verbs:translation-all"]);
    return { passed: s.passed, failed: s.failed };
  }, [stored.deckStats]);
  const grammarTopicBestScores = useMemo(
    () =>
      grammar.map((_, index) => stored.deckStats[`grammar:${index}`]?.bestScore ?? null),
    [stored.deckStats],
  );
  const grammarTopicPassFail = useMemo(
    () =>
      grammar.map((_, index) => {
        const s = toDeckStats(stored.deckStats[`grammar:${index}`]);
        return { passed: s.passed, failed: s.failed };
      }),
    [stored.deckStats],
  );
  const passedGrammarTopics = grammarTopicBestScores.filter((score) => (score ?? 0) > 80).length;
  const grammarCompletionPercent = grammar.length ? Math.round((passedGrammarTopics / grammar.length) * 100) : 0;
  const phraseSectionBestScores = useMemo(
    () =>
      Object.fromEntries(
        phraseSections.map((section) => [
          section.title,
          getBestScore(stored.deckStats[`phrases:${section.title}:gr-en`]?.bestScore, stored.deckStats[`phrases:${section.title}:en-gr`]?.bestScore),
        ]),
      ) as Record<string, number | null>,
    [stored.deckStats],
  );
  const phraseSectionPassFail = useMemo(
    () =>
      Object.fromEntries(
        phraseSections.map((section) => {
          const a = toDeckStats(stored.deckStats[`phrases:${section.title}:gr-en`]);
          const b = toDeckStats(stored.deckStats[`phrases:${section.title}:en-gr`]);
          return [section.title, { passed: a.passed + b.passed, failed: a.failed + b.failed }];
        }),
      ) as Record<string, { passed: number; failed: number }>,
    [stored.deckStats],
  );
  const passedPhraseSections = useMemo(
    () => phraseSections.filter((section) => (phraseSectionBestScores[section.title] ?? 0) > 80).length,
    [phraseSectionBestScores],
  );
  const phrasesCompletionPercent = phraseSections.length ? Math.round((passedPhraseSections / phraseSections.length) * 100) : 0;
  const passedVerbDecks = [verbMeaningBestScore, verbConjugationBestScore].filter((score) => (score ?? 0) > 80).length;
  const verbsCompletionPercent = Math.round((passedVerbDecks / 2) * 100);
  const overallPassedUnits = passedVocabCategories + passedGrammarTopics + passedPhraseSections + passedVerbDecks;
  const overallTotalUnits = categoryEntries.length + grammar.length + phraseSections.length + 2;
  const overallCompletionPercent = overallTotalUnits ? Math.round((overallPassedUnits / overallTotalUnits) * 100) : 0;
  const completionByArea = [
    { label: "Vocabulary", passed: passedVocabCategories, total: categoryEntries.length, percent: vocabCompletionPercent },
    { label: "Grammar", passed: passedGrammarTopics, total: grammar.length, percent: grammarCompletionPercent },
    { label: "Phrases", passed: passedPhraseSections, total: phraseSections.length, percent: phrasesCompletionPercent },
    { label: "Verbs", passed: passedVerbDecks, total: 2, percent: verbsCompletionPercent },
  ];
  const familyStats = useMemo(() => {
    const grouped = new Map<string, DeckStats>();

    for (const [deckId, rawStats] of deckStatsEntries) {
      const stats = toDeckStats(rawStats);
      const family = getDeckFamily(deckId);
      const current = grouped.get(family) ?? toDeckStats();
      grouped.set(family, {
        attempted: current.attempted + stats.attempted,
        correct: current.correct + stats.correct,
        sessions: current.sessions + stats.sessions,
        bestScore: Math.max(current.bestScore, stats.bestScore),
        lastScore: stats.lastScore,
        passed: current.passed + stats.passed,
        failed: current.failed + stats.failed,
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
    [...rankedDecks].sort((left, right) => left.stats.lastScore - right.stats.lastScore || left.accuracy - right.accuracy)[0] ?? null;
  const fallbackAnswerPool = useMemo(() => categoryEntries.flatMap(([, entries]) => entries.map(([, en]) => en)), [categoryEntries]);

  const launchQuiz = (nextSession: StudySession | null) => {
    if (nextSession) setSession(nextSession);
  };

  const toggleFavorite = (card: ReviewCard) => {
    saveState((current) => {
      const exists = current.favorites.some((entry) => entry.id === card.id);
      return {
        ...current,
        favorites: exists ? current.favorites.filter((entry) => entry.id !== card.id) : dedupeCards([card, ...current.favorites]),
      };
    });
  };

  const recordQuizOutcome = (deckId: string, answers: QuizAnswer[], items: QuizItem[]) => {
    const correct = answers.filter((entry) => entry?.correct).length;
    const wrongCards = items.filter((_, idx) => !answers[idx]?.correct).map((item) => item.review);

    saveState((current) => {
      const previous = toDeckStats(current.deckStats[deckId]);
      const lastScore = percent(correct, items.length);
      const didPass = lastScore >= PASS_THRESHOLD;
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
            passed: previous.passed + (didPass ? 1 : 0),
            failed: previous.failed + (didPass ? 0 : 1),
          },
        },
        mistakes: dedupeCards([...wrongCards, ...current.mistakes]).slice(0, 80),
      };
    });
  };

  const openFavoritesQuiz = () => {
    launchQuiz(
      buildReviewQuizSession("review:favorites", "Favorites Review", "Practice the cards you saved.", stored.favorites, fallbackAnswerPool),
    );
  };

  const openMistakesQuiz = () => {
    launchQuiz(
      buildReviewQuizSession(
        "review:mistakes",
        "Mistakes Recovery",
        "Revisit the cards you previously missed.",
        stored.mistakes,
        fallbackAnswerPool,
      ),
    );
  };

  const handleLogin = (name: string) => {
    const progress = loadProgress(name);
    saveCurrentUser(name);
    setUserName(name);
    setStored(progress);
    setTheme(progress.theme);
  };

  const handleLogout = () => {
    saveCurrentUser(null);
    setUserName(null);
    setStored(emptyStoredState);
    setSession(null);
    setView("dashboard");
    setSelectedCategory(null);
    setSelectedVerb(null);
    setSelectedGrammar(null);
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
        onToggleTheme={handleToggleTheme}
        theme={theme}
      />
    );
  }

  if (session?.kind === "match") {
    return <MatchGame onClose={() => setSession(null)} onToggleTheme={handleToggleTheme} theme={theme} />;
  }

  if (session?.kind === "typing") {
    return <TypingChallenge onClose={() => setSession(null)} onToggleTheme={handleToggleTheme} theme={theme} />;
  }

  if (!userName) {
    return <LoginScreen theme={theme} onLogin={handleLogin} onToggleTheme={handleToggleTheme} />;
  }

  return (
    <div className="app-shell">
      <AppHeader
        title="Greek Exam Studio"
        subtitle="A cleaner A2 study app with vocab, conjugation, grammar, phrasebook, and progress."
        eyebrow={`${daysUntilExam()} days until the May 19, 2026 exam`}
        onOpenProfile={() => startTransition(() => setView("profile"))}
        profileName={userName}
        profileActive={view === "profile"}
        onToggleTheme={handleToggleTheme}
        theme={theme}
      />
      <TabBar view={view} setView={setView} />
      <main className="content">
        {view === "dashboard" && (
          <DashboardView
            overallAccuracy={overallAccuracy}
            totalSessions={totalSessions}
            mistakesCount={stored.mistakes.length}
            overallCompletionPercent={overallCompletionPercent}
            overallPassedUnits={overallPassedUnits}
            overallTotalUnits={overallTotalUnits}
            totalWords={totalWords}
            categoryCount={categoryEntries.length}
            phraseSectionCount={phraseSections.length}
            verbsCount={verbs.length}
            totalVerbForms={totalVerbForms}
            rankedDecks={rankedDecks}
            favorites={stored.favorites}
            mistakes={stored.mistakes}
            onStartMixedGrammar={() => launchQuiz(buildGrammarQuizSession())}
            onOpenVerbs={() => startTransition(() => setView("verbs"))}
            onOpenFavoritesQuiz={openFavoritesQuiz}
            onOpenMistakesQuiz={openMistakesQuiz}
          />
        )}

        {view === "vocab" && (
          <VocabView
            categoryEntries={categoryEntries}
            vocabCategoryBestScores={vocabCategoryBestScores}
            vocabCategoryPassFail={vocabCategoryPassFail}
            passedCategories={passedVocabCategories}
            totalCategories={categoryEntries.length}
            completionPercent={vocabCompletionPercent}
            selectedCategory={selectedCategory}
            vocabSearch={vocabSearch}
            onSelectCategory={setSelectedCategory}
            onVocabSearchChange={setVocabSearch}
            onStartQuiz={(category, direction) => launchQuiz(buildVocabQuizSession(category, direction))}
          />
        )}

        {view === "verbs" && (
          <VerbsView
            selectedVerb={selectedVerb}
            verbSearch={verbSearch}
            tense={tense}
            verbMeaningBestScore={verbMeaningBestScore}
            verbConjugationBestScore={verbConjugationBestScore}
            verbTranslationBestScore={verbTranslationBestScore}
            verbMeaningPassFail={verbMeaningPassFail}
            verbConjugationPassFail={verbConjugationPassFail}
            verbTranslationPassFail={verbTranslationPassFail}
            passedVerbDecks={passedVerbDecks}
            verbsCompletionPercent={verbsCompletionPercent}
            onSelectVerb={setSelectedVerb}
            onVerbSearchChange={setVerbSearch}
            onTenseChange={setTense}
            onMeaningQuiz={() => launchQuiz(buildVerbMeaningQuizSession())}
            onTranslationQuiz={() => launchQuiz(buildVerbTranslationQuizSession())}
            onConjugationQuiz={() => launchQuiz(buildVerbConjugationQuizSession())}
            onOpenMatch={() => setSession({ kind: "match" })}
            onOpenTyping={() => setSession({ kind: "typing" })}
          />
        )}

        {view === "grammar" && (
          <GrammarView
            selectedGrammar={selectedGrammar}
            passedGrammarTopics={passedGrammarTopics}
            totalGrammarTopics={grammar.length}
            grammarCompletionPercent={grammarCompletionPercent}
            grammarTopicBestScores={grammarTopicBestScores}
            grammarTopicPassFail={grammarTopicPassFail}
            onSelectGrammar={setSelectedGrammar}
            onBuildGrammarQuiz={(topicIndex) => launchQuiz(buildGrammarQuizSession(topicIndex))}
          />
        )}

        {view === "phrases" && (
          <PhrasesView
            openPhrase={openPhrase}
            passedPhraseSections={passedPhraseSections}
            totalPhraseSections={phraseSections.length}
            phrasesCompletionPercent={phrasesCompletionPercent}
            phraseSectionBestScores={phraseSectionBestScores}
            phraseSectionPassFail={phraseSectionPassFail}
            onTogglePhrase={(title) => setOpenPhrase((current) => (current === title ? null : title))}
            onBuildPhraseQuiz={(direction, sectionTitle) => launchQuiz(buildPhraseQuizSession(direction, sectionTitle))}
          />
        )}

        {view === "progress" && (
          <ProgressView
            totalSessions={totalSessions}
            overallAccuracy={overallAccuracy}
            totalCorrect={totalCorrect}
            totalAttempted={totalAttempted}
            overallCompletionPercent={overallCompletionPercent}
            overallPassedUnits={overallPassedUnits}
            overallTotalUnits={overallTotalUnits}
            completionByArea={completionByArea}
            familyStats={familyStats}
            rankedDecks={rankedDecks}
          />
        )}

        {view === "profile" && (
          <ProfileView
            profileName={userName}
            theme={theme}
            trackedDecks={deckStatsEntries.length}
            strongestDeck={strongestDeck}
            needsWorkDeck={needsWorkDeck}
            totalSessions={totalSessions}
            overallAccuracy={overallAccuracy}
            totalCorrect={totalCorrect}
            favorites={stored.favorites}
            mistakes={stored.mistakes}
            onToggleTheme={handleToggleTheme}
            onLogout={handleLogout}
            onOpenProgress={() => startTransition(() => setView("progress"))}
            onOpenFavoritesQuiz={openFavoritesQuiz}
            onOpenMistakesQuiz={openMistakesQuiz}
            onResetProgress={() => {
              const confirmed = window.confirm(
                "Reset all progress? This clears every deck score, pass/fail count, favorite, and saved mistake. This cannot be undone.",
              );
              if (confirmed) setStored({ theme, deckStats: {}, favorites: [], mistakes: [] });
            }}
          />
        )}
      </main>
    </div>
  );
}
