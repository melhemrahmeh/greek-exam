import { verbs } from "./data";
import type { Verb } from "./types";

export type VerbLevel = {
  id: number;
  name: string;
  verbs: Verb[];
};

const levelNames = ["Starter", "Basics", "Everyday", "Intermediate", "Upper intermediate", "Advanced"];

/**
 * verbs.json is ordered roughly by frequency (έχω, κάνω, πάω… first), so splitting it into
 * equal chunks gives levels from easiest to hardest.
 */
const levelSize = Math.ceil(verbs.length / levelNames.length);

export const verbLevels: VerbLevel[] = levelNames.map((name, index) => ({
  id: index + 1,
  name,
  verbs: verbs.slice(index * levelSize, (index + 1) * levelSize),
}));

export function getVerbLevel(inf: string) {
  return verbLevels.find((level) => level.verbs.some((verb) => verb.inf === inf)) ?? null;
}

/** Review card ids for verb meaning questions look like `verb:<infinitive>`. */
export const verbReviewId = (inf: string) => `verb:${inf}`;
export const infFromReviewId = (id: string) => (id.startsWith("verb:") ? id.slice("verb:".length) : null);
