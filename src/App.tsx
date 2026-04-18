import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import "./App.css";
import { AppHeader } from "./components/AppHeader";
import { AuthScreen } from "./components/AuthScreen";
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
import { emptyStoredState, tenseLabels } from "./features/study/constants";
import { phraseSections, verbs, vocab } from "./features/study/data";
import {
  buildGrammarQuizSession,
  buildPhraseQuizSession,
  buildReviewQuizSession,
  buildVerbConjugationQuizSession,
  buildVerbMeaningQuizSession,
  buildVocabQuizSession,
} from "./features/study/quizBuilders";
import type { QuizAnswer, QuizItem, ReviewCard, StoredState, StudySession, Theme, View } from "./features/study/types";
import {
  daysUntilExam,
  dedupeCards,
  formatDeckLabel,
  getBestScore,
  getDeckFamily,
  normalizeStoredState,
  percent,
  randomizeQuizSession,
  toDeckStats,
} from "./features/study/utils";
import { supabase, supabaseConfigured } from "./lib/supabase";

export default function App() {
  const [view, setView] = useState<View>("dashboard");
  const [session, setSession] = useState<StudySession | null>(null);
  const [stored, setStored] = useState<StoredState>(emptyStoredState);
  const [theme, setTheme] = useState<Theme>("light");
  const [authSession, setAuthSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(!supabaseConfigured);
  const [isSyncing, setIsSyncing] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedVerb, setSelectedVerb] = useState<number | null>(null);
  const [selectedGrammar, setSelectedGrammar] = useState<number | null>(null);
  const [verbSearch, setVerbSearch] = useState("");
  const [vocabSearch, setVocabSearch] = useState("");
  const [tense, setTense] = useState<keyof typeof tenseLabels>("p");
  const [openPhrase, setOpenPhrase] = useState<string | null>(phraseSections[0]?.title ?? null);
  const hasHydratedProgress = useRef(false);
  const lastSavedPayload = useRef("");
  const authUserId = authSession?.user?.id ?? null;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    if (!supabase) return;

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setAuthSession(data.session);
      setAuthReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setAuthSession(nextSession);
      if (!nextSession) {
        hasHydratedProgress.current = false;
        lastSavedPayload.current = "";
        setStored(emptyStoredState);
        setSession(null);
      }
      setAuthReady(true);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!authUserId || !supabase) return;

    let active = true;
    const client = supabase;

    (async () => {
      setIsSyncing(true);
      const { data, error } = await client.from("user_progress").select("data").eq("user_id", authUserId).maybeSingle();
      if (!active) return;

      if (error) {
        setAuthError(error.message);
      } else {
        const normalized = normalizeStoredState(data?.data as Partial<StoredState> | null);
        setStored(normalized);
        setTheme(normalized.theme);
        lastSavedPayload.current = JSON.stringify(normalized);
        hasHydratedProgress.current = true;
      }

      setIsSyncing(false);
    })();

    return () => {
      active = false;
    };
  }, [authUserId]);

  useEffect(() => {
    if (!authReady || !authUserId || !supabase || !hasHydratedProgress.current) return;

    const client = supabase;
    const payload = { ...stored, theme };
    const serialized = JSON.stringify(payload);
    if (serialized === lastSavedPayload.current) return;

    setIsSyncing(true);
    lastSavedPayload.current = serialized;
    const timeout = window.setTimeout(async () => {
      const { error } = await client.from("user_progress").upsert({
        user_id: authUserId,
        data: payload,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        setAuthError(error.message);
      }

      setIsSyncing(false);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [authReady, authUserId, stored, theme]);

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
  const familyStats = useMemo(() => {
    const grouped = new Map<string, { attempted: number; correct: number; sessions: number; bestScore: number; lastScore: number }>();

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
    [...rankedDecks].sort((left, right) => left.stats.lastScore - right.stats.lastScore || left.accuracy - right.accuracy)[0] ?? null;
  const fallbackAnswerPool = useMemo(() => categoryEntries.flatMap(([, entries]) => entries.map(([, en]) => en)), [categoryEntries]);
  const verbMeaningBestScore = stored.deckStats["verbs:meaning"]?.bestScore ?? null;
  const verbConjugationBestScore = stored.deckStats["verbs:conjugation"]?.bestScore ?? null;
  const profileEmail = authSession?.user?.email ?? "";

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

  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) {
      setAuthError("Supabase is not configured yet.");
      return;
    }

    setAuthLoading(true);
    setAuthError("");
    setAuthMessage("");

    const credentials = {
      email: authEmail.trim(),
      password: authPassword,
    };

    const { error } =
      authMode === "login"
        ? await supabase.auth.signInWithPassword(credentials)
        : await supabase.auth.signUp(credentials);

    if (error) {
      setAuthError(error.message);
    } else if (authMode === "register") {
      setAuthMessage("Account created. Check your email if your Supabase project requires confirmation.");
      setAuthMode("login");
    }

    setAuthLoading(false);
  };

  const handleLogout = async () => {
    if (!supabase) return;
    setAuthLoading(true);
    setAuthError("");
    await supabase.auth.signOut();
    setSession(null);
    setView("dashboard");
    setSelectedCategory(null);
    setSelectedVerb(null);
    setSelectedGrammar(null);
    setAuthLoading(false);
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

  if (!authReady) {
    return (
      <div className="app-shell">
        <main className="content">
          <section className="panel auth-panel">
            <div className="empty-state">Loading your account...</div>
          </section>
        </main>
      </div>
    );
  }

  if (!authSession) {
    return (
      <AuthScreen
        mode={authMode}
        email={authEmail}
        password={authPassword}
        loading={authLoading}
        error={authError}
        message={authMessage}
        configured={supabaseConfigured}
        theme={theme}
        onModeChange={setAuthMode}
        onEmailChange={setAuthEmail}
        onPasswordChange={setAuthPassword}
        onSubmit={handleAuthSubmit}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  return (
    <div className="app-shell">
      <AppHeader
        title="Greek Exam Studio"
        subtitle="A cleaner A2 study app with vocab, conjugation, grammar, phrasebook, and progress."
        eyebrow={`${daysUntilExam()} days until the May 19, 2026 exam`}
        onOpenProfile={() => startTransition(() => setView("profile"))}
        profileEmail={authSession.user.email}
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
            onSelectVerb={setSelectedVerb}
            onVerbSearchChange={setVerbSearch}
            onTenseChange={setTense}
            onMeaningQuiz={() => launchQuiz(buildVerbMeaningQuizSession())}
            onConjugationQuiz={() => launchQuiz(buildVerbConjugationQuizSession())}
            onOpenMatch={() => setSession({ kind: "match" })}
            onOpenTyping={() => setSession({ kind: "typing" })}
          />
        )}

        {view === "grammar" && (
          <GrammarView
            selectedGrammar={selectedGrammar}
            onSelectGrammar={setSelectedGrammar}
            onBuildGrammarQuiz={(topicIndex) => launchQuiz(buildGrammarQuizSession(topicIndex))}
          />
        )}

        {view === "phrases" && (
          <PhrasesView
            openPhrase={openPhrase}
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
            familyStats={familyStats}
            rankedDecks={rankedDecks}
          />
        )}

        {view === "profile" && (
          <ProfileView
            profileEmail={profileEmail}
            theme={theme}
            trackedDecks={deckStatsEntries.length}
            isSyncing={isSyncing}
            strongestDeck={strongestDeck}
            needsWorkDeck={needsWorkDeck}
            totalSessions={totalSessions}
            overallAccuracy={overallAccuracy}
            totalCorrect={totalCorrect}
            favorites={stored.favorites}
            mistakes={stored.mistakes}
            authLoading={authLoading}
            onToggleTheme={handleToggleTheme}
            onLogout={handleLogout}
            onOpenProgress={() => startTransition(() => setView("progress"))}
            onOpenFavoritesQuiz={openFavoritesQuiz}
            onOpenMistakesQuiz={openMistakesQuiz}
            onResetProgress={() => setStored({ theme, deckStats: {}, favorites: [], mistakes: [] })}
          />
        )}
      </main>
    </div>
  );
}
