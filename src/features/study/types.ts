export type Theme = "light" | "dark";
export type View = "dashboard" | "vocab" | "verbs" | "grammar" | "phrases" | "progress" | "profile";
export type VocabEntry = [string, string];
export type VocabData = Record<string, VocabEntry[]>;
export type Verb = { inf: string; en: string; type: string; p: string[]; pa: string[]; f: string[] };
export type GrammarTopic = { t: string; c: string };
export type GrammarQuestion = { q: string; a: string; wrong: string[]; topic: number };
export type DeckStats = {
  attempted: number;
  correct: number;
  sessions: number;
  bestScore: number;
  lastScore: number;
  passed: number;
  failed: number;
};
export type ReviewCard = { id: string; front: string; back: string; source: string };
export type QuizItem = {
  id: string;
  prompt: string;
  choices: string[];
  answer: string;
  review: ReviewCard;
  detail?: string;
};
export type QuizAnswer = { selected: string; correct: boolean } | null;
export type StoredState = {
  theme: Theme;
  deckStats: Record<string, DeckStats>;
  favorites: ReviewCard[];
  mistakes: ReviewCard[];
};
export type QuizSession = {
  kind: "quiz";
  deckId: string;
  title: string;
  subtitle?: string;
  items: QuizItem[];
};
export type MatchSession = { kind: "match" };
export type TypingSession = { kind: "typing" };
export type StudySession = QuizSession | MatchSession | TypingSession;
export type AuthMode = "login" | "register";
