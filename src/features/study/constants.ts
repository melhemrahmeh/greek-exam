import type { StoredState } from "./types";

export const STANDARD_QUIZ_LENGTH = 24;
export const LONG_QUIZ_LENGTH = 30;
export const REVIEW_QUIZ_LENGTH = 24;
export const TYPING_DRILL_LENGTH = 16;
export const examDate = new Date("2026-05-19T00:00:00");
export const tenseLabels = { p: "Present", pa: "Past", f: "Future" } as const;
export const tenseGreek = {
  p: "\u0395\u03BD\u03B5\u03C3\u03C4\u03CE\u03C4\u03B1\u03C2",
  pa: "\u0391\u03CC\u03C1\u03B9\u03C3\u03C4\u03BF\u03C2",
  f: "\u039C\u03AD\u03BB\u03BB\u03BF\u03BD\u03C4\u03B1\u03C2",
} as const;
export const typeDescriptions: Record<string, string> = {
  A: "Regular -\u03C9 verb. Great baseline pattern for fast conjugation work.",
  B1: "The -\u03AC\u03C9 pattern. Watch the accented endings in the present tense.",
  B2: "The stressed -\u03CE pattern with characteristic -\u03B5\u03AF\u03C2 / -\u03B5\u03AF / -\u03BF\u03CD\u03BC\u03B5 endings.",
  passive: "Reflexive/passive-style forms in -\u03BF\u03BC\u03B1\u03B9 / -\u03AC\u03BC\u03B1\u03B9.",
  irregular: "High-frequency irregular verb. Best learned through repetition and recognition.",
  impersonal: "Impersonal form used the same way for every person.",
};

export const emptyStoredState: StoredState = {
  theme: "light",
  deckStats: {},
  favorites: [],
  mistakes: [],
};

export const avatarPalettes = [
  ["#126b78", "#2f92a0"],
  ["#c9812f", "#e0a14a"],
  ["#1f7a58", "#3fa67f"],
  ["#8a4138", "#c5665b"],
  ["#4450b8", "#6777db"],
] as const;
