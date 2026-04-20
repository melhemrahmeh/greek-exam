import type { CSSProperties } from "react";
import { avatarPalettes, examDate } from "./constants";
import { grammar } from "./data";
import type { DeckStats, QuizSession, ReviewCard, StoredState } from "./types";

export function shuffle<T>(items: T[]) {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function sampleUnique<T>(items: T[], count: number, key: (item: T) => string = (item) => String(item)) {
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

export function percent(correct: number, total: number) {
  if (!total) return 0;
  return Math.round((correct / total) * 100);
}

export function daysUntilExam() {
  const today = new Date();
  const diff = examDate.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diff / 86400000));
}

export function safeTopicTitle(raw: string) {
  return raw.replace(/^\d+\.\s*/, "");
}

export function toDeckStats(previous?: Partial<DeckStats>): DeckStats {
  return {
    attempted: previous?.attempted ?? 0,
    correct: previous?.correct ?? 0,
    sessions: previous?.sessions ?? 0,
    bestScore: previous?.bestScore ?? 0,
    lastScore: previous?.lastScore ?? 0,
    passed: previous?.passed ?? 0,
    failed: previous?.failed ?? 0,
  };
}

export function dedupeCards(cards: ReviewCard[]) {
  const seen = new Set<string>();
  return cards.filter((card) => {
    if (seen.has(card.id)) return false;
    seen.add(card.id);
    return true;
  });
}

export function normalizeStoredState(value?: Partial<StoredState> | null): StoredState {
  return {
    theme: value?.theme === "dark" ? "dark" : "light",
    deckStats: value?.deckStats ?? {},
    favorites: dedupeCards(value?.favorites ?? []),
    mistakes: dedupeCards(value?.mistakes ?? []),
  };
}

export function buildChoices(answer: string, pool: string[], count = 4) {
  const distractors = sampleUnique(
    pool.filter((entry) => entry !== answer),
    Math.max(0, count - 1),
  );
  return shuffle([answer, ...distractors]);
}

export function getDeckFamily(deckId: string) {
  if (deckId.startsWith("vocab:")) return "Vocabulary";
  if (deckId.startsWith("verbs:")) return "Verbs";
  if (deckId.startsWith("grammar:")) return "Grammar";
  if (deckId.startsWith("phrases:")) return "Phrases";
  if (deckId.startsWith("review:")) return "Review";
  return "Other";
}

export function formatDeckLabel(deckId: string) {
  const parts = deckId.split(":");
  if (parts[0] === "vocab") {
    const direction = parts[2] === "en-gr" ? "English to Greek" : "Greek to English";
    return `${parts[1]} \u00B7 ${direction}`;
  }
  if (parts[0] === "verbs") {
    return parts[1] === "conjugation" ? "Verb Conjugation Builder" : "Verb Meanings";
  }
  if (parts[0] === "grammar") {
    if (parts[1] === "all") return "Grammar Mixed Quiz";
    const topicIndex = Number(parts[1]);
    return Number.isInteger(topicIndex) && grammar[topicIndex] ? safeTopicTitle(grammar[topicIndex].t) : "Grammar Topic";
  }
  if (parts[0] === "phrases") {
    const direction = parts[2] === "en-gr" ? "English to Greek" : "Greek to English";
    return `${parts[1] === "all" ? "Phrasebook Mixed" : parts[1]} \u00B7 ${direction}`;
  }
  if (parts[0] === "review") {
    return parts[1] === "favorites" ? "Favorites Review" : "Mistakes Recovery";
  }
  return deckId;
}

export function randomizeQuizSession(session: QuizSession): QuizSession {
  return {
    ...session,
    items: shuffle(session.items).map((item) => ({
      ...item,
      choices: shuffle(item.choices),
    })),
  };
}

export function formatPassFail(passed: number, failed: number) {
  const parts: string[] = [];
  if (passed > 0) parts.push(`${passed} passed`);
  if (failed > 0) parts.push(`${failed} failed`);
  return parts.join(" / ");
}

export function getBestScore(...scores: Array<number | undefined>) {
  const validScores = scores.filter((score): score is number => typeof score === "number");
  return validScores.length ? Math.max(...validScores) : null;
}

export function getInitials(email: string) {
  const localPart = email.split("@")[0] ?? "";
  const parts = localPart.split(/[._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }
  return localPart.slice(0, 2).toUpperCase() || "GR";
}

export function getProfileName(email: string) {
  const localPart = email.split("@")[0] ?? "Greek learner";
  const parts = localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1));

  if (!parts.length) return "Greek learner";
  return parts.join(" ");
}

export function getAvatarStyle(email: string): CSSProperties {
  const seed = [...email].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const [start, end] = avatarPalettes[seed % avatarPalettes.length];
  return {
    background: `linear-gradient(135deg, ${start}, ${end})`,
  };
}
