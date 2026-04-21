import { LONG_QUIZ_LENGTH, REVIEW_QUIZ_LENGTH, STANDARD_QUIZ_LENGTH, tenseGreek, tenseLabels } from "./constants";
import { grammar, grammarQuiz, persons, phraseSections, verbs, vocab } from "./data";
import type { QuizSession, ReviewCard } from "./types";
import { buildChoices, safeTopicTitle, sampleUnique, shuffle } from "./utils";

export function buildVocabQuizSession(category: string, direction: "gr-en" | "en-gr"): QuizSession {
  const words = shuffle(vocab[category]).slice(0, Math.min(LONG_QUIZ_LENGTH, vocab[category].length));
  const items = words.map(([gr, en], idx) => {
    const prompt = direction === "gr-en" ? gr : en;
    const answer = direction === "gr-en" ? en : gr;
    const pool = vocab[category]
      .map((entry) => (direction === "gr-en" ? entry[1] : entry[0]))
      .filter((entry) => entry !== answer);

    return {
      id: `${category}-${direction}-${idx}`,
      prompt,
      choices: buildChoices(answer, pool),
      answer,
      review: { id: `vocab:${category}:${gr}`, front: gr, back: en, source: category },
    };
  });

  return {
    kind: "quiz",
    deckId: `vocab:${category}:${direction}`,
    title: category,
    subtitle: direction === "gr-en" ? "Greek to English" : "English to Greek",
    items,
  };
}

export function buildVerbMeaningQuizSession(): QuizSession {
  const items = shuffle(verbs)
    .slice(0, Math.min(STANDARD_QUIZ_LENGTH, verbs.length))
    .map((verb, idx) => {
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

  return {
    kind: "quiz",
    deckId: "verbs:meaning",
    title: "Verb Meanings",
    subtitle: "Match the verb to its meaning.",
    items,
  };
}

export function buildVerbTranslationQuizSession(): QuizSession {
  const items = shuffle(verbs).map((verb, idx) => {
    const wrong = sampleUnique(
      verbs.filter((entry) => entry.en !== verb.en).map((entry) => entry.en),
      3,
    );

    return {
      id: `verb-translation-${idx}`,
      prompt: verb.inf,
      choices: buildChoices(verb.en, wrong),
      answer: verb.en,
      review: { id: `verb:${verb.inf}`, front: verb.inf, back: verb.en, source: "All verb translations" },
      detail: verb.type.toUpperCase(),
    };
  });

  return {
    kind: "quiz",
    deckId: "verbs:translation-all",
    title: "All Verb Translations",
    subtitle: `Translate every verb (${verbs.length} total).`,
    items,
  };
}

export function buildVerbConjugationQuizSession(): QuizSession {
  const items = shuffle(verbs)
    .slice(0, Math.min(STANDARD_QUIZ_LENGTH, verbs.length))
    .map((verb, idx) => {
      const tenseKeys: Array<keyof Pick<(typeof verbs)[number], "p" | "pa" | "f">> = ["p", "pa", "f"];
      const tenseKey = tenseKeys[Math.floor(Math.random() * tenseKeys.length)];
      const personIndex = Math.floor(Math.random() * persons.length);
      const answer = verb[tenseKey][personIndex];
      const wrongPool = sampleUnique(
        verbs.filter((entry) => entry.inf !== verb.inf).map((entry) => entry[tenseKey][personIndex]),
        3,
      );

      return {
        id: `verb-form-${idx}`,
        prompt: `${verb.inf} - ${persons[personIndex]}`,
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

  return {
    kind: "quiz",
    deckId: "verbs:conjugation",
    title: "Conjugation Builder",
    subtitle: "Pick the exact person and tense form.",
    items,
  };
}

export function buildGrammarQuizSession(topicIndex?: number): QuizSession {
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

  return {
    kind: "quiz",
    deckId: topicIndex === undefined ? "grammar:all" : `grammar:${topicIndex}`,
    title: topicIndex === undefined ? "Grammar Mixed Quiz" : safeTopicTitle(grammar[topicIndex].t),
    subtitle: topicIndex === undefined ? "A broad A2 grammar check." : "Topic-focused review.",
    items,
  };
}

export function buildPhraseQuizSession(direction: "gr-en" | "en-gr", sectionTitle?: string): QuizSession {
  const sourceSections = sectionTitle ? phraseSections.filter((section) => section.title === sectionTitle) : phraseSections;
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

  return {
    kind: "quiz",
    deckId: `phrases:${sectionTitle ?? "all"}:${direction}`,
    title: sectionTitle ? `${sectionTitle} Quiz` : "Phrasebook Quiz",
    subtitle: direction === "gr-en" ? "Greek to English phrases" : "English to Greek phrases",
    items,
  };
}

export function buildReviewQuizSession(
  deckId: "review:favorites" | "review:mistakes",
  title: string,
  subtitle: string,
  cards: ReviewCard[],
  fallbackPool: string[],
): QuizSession | null {
  const sourceCards = cards.slice(0, REVIEW_QUIZ_LENGTH);
  if (!sourceCards.length) return null;

  const items = sourceCards.map((card, idx) => {
    const siblingBacks = sourceCards.filter((entry) => entry.id !== card.id).map((entry) => entry.back);

    return {
      id: `${deckId}-${idx}`,
      prompt: card.front,
      choices: buildChoices(card.back, siblingBacks.length >= 3 ? siblingBacks : fallbackPool),
      answer: card.back,
      review: card,
      detail: deckId === "review:mistakes" ? `From ${card.source}` : card.source,
    };
  });

  return {
    kind: "quiz",
    deckId,
    title,
    subtitle,
    items,
  };
}
