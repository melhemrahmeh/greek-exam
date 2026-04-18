import VOCAB from "../../data/vocab.json";
import VERBS from "../../data/verbs.json";
import GRAMMAR from "../../data/grammar.json";
import GRAMMAR_QUIZ from "../../data/grammar-quiz.json";
import PERSONS from "../../data/persons.json";
import { matchLessons as rawMatchLessons, phraseSections as rawPhraseSections } from "../../data/extras";
import type { GrammarQuestion, GrammarTopic, Verb, VocabData } from "./types";

function looksBroken(value: string) {
  return /[ÃƒÃŽÃÃÃ°Ã¢]/.test(value);
}

function repairText(value: string): string {
  if (!looksBroken(value)) return value;
  try {
    const bytes = Uint8Array.from([...value].map((char) => char.charCodeAt(0)));
    const repaired = new TextDecoder("utf-8").decode(bytes);
    return repaired.includes("ï¿½") ? value : repaired;
  } catch {
    return value;
  }
}

function normalizeDeep<T>(value: T): T {
  if (typeof value === "string") return repairText(value) as T;
  if (Array.isArray(value)) return value.map((entry) => normalizeDeep(entry)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [repairText(key), normalizeDeep(entry)])) as T;
  }
  return value;
}

export const vocab = normalizeDeep(VOCAB as unknown as VocabData);
export const verbs = normalizeDeep(VERBS as Verb[]);
export const grammar = normalizeDeep(GRAMMAR as GrammarTopic[]);
export const grammarQuiz = normalizeDeep(GRAMMAR_QUIZ as GrammarQuestion[]);
export const persons = normalizeDeep(PERSONS as string[]);
export const phraseSections = normalizeDeep(rawPhraseSections);
export const matchLessons = normalizeDeep(rawMatchLessons);
