# Greek Exam Studio

A React + TypeScript study app for Greek A2 exam practice. The app combines vocabulary, verbs, grammar, phrasebook drills, review decks, progress tracking, and Supabase-backed account sync in one place.

## What This App Does

The app is designed around actual exam revision rather than isolated flashcards.

Main features:

- `Dashboard` with quick stats, review shortcuts, and deck performance
- `Vocab` categories such as family, numbers, food, etc.
- Best score shown for each vocab category so you can decide whether to retake it
- `Verbs` studio with:
  - meaning quiz
  - conjugation quiz
  - matching game
  - typing challenge
- `Grammar` topic browser plus mixed grammar quizzes
- `Phrases` phrasebook sections with section-specific or mixed quizzes
- `Progress` board with overall and per-family stats
- `Profile` access in the header, not the navbar
- Generated avatar based on the signed-in email
- Saved `favorites` and `mistakes` decks
- Automatic Supabase sync per user
- Light and dark theme support

## Tech Stack

- `React 19`
- `TypeScript`
- `Vite`
- `Supabase` for auth + persisted progress
- Plain CSS in `src/App.css`

## Scripts

From the project root:

```bash
npm install
npm run dev
npm run build
npm run preview
npm run lint
```

What they do:

- `npm run dev`: start the Vite dev server
- `npm run build`: type-check and create a production build
- `npm run preview`: locally preview the production build
- `npm run lint`: run ESLint

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your Supabase project values:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

If these variables are missing, the app still runs, but Supabase login and sync will not be available.

### 3. Create the Supabase table

Run the SQL in [supabase/schema.sql](/abs/path/c:/Users/es/Desktop/Greek/greek-exam/supabase/schema.sql:1) inside your Supabase SQL editor.

This creates:

- `public.user_progress`
- row-level security
- policies so users can only read/write their own progress

### 4. Start the app

```bash
npm run dev
```

## How Progress Sync Works

Supabase integration lives in [src/lib/supabase.ts](/abs/path/c:/Users/es/Desktop/Greek/greek-exam/src/lib/supabase.ts:1).

The app:

- creates a Supabase client only if env vars exist
- supports register/login via Supabase Auth
- loads saved progress from `user_progress`
- debounces writes before syncing back
- stores:
  - theme
  - deck stats
  - favorites
  - mistakes

The progress payload shape is defined by `StoredState` in [src/features/study/types.ts](/abs/path/c:/Users/es/Desktop/Greek/greek-exam/src/features/study/types.ts:16).

## Project Structure

```text
src/
  components/
    AppHeader.tsx
    AuthScreen.tsx
    MatchGame.tsx
    QuizRunner.tsx
    TabBar.tsx
    TypingChallenge.tsx
    views/
      DashboardView.tsx
      GrammarView.tsx
      PhrasesView.tsx
      ProfileView.tsx
      ProgressView.tsx
      VerbsView.tsx
      VocabView.tsx
  data/
    vocab.json
    verbs.json
    grammar.json
    grammar-quiz.json
    persons.json
    extras.ts
  features/
    study/
      constants.ts
      data.ts
      quizBuilders.ts
      types.ts
      utils.ts
  lib/
    supabase.ts
  App.tsx
  App.css
  main.tsx
supabase/
  schema.sql
```

## Architecture

The app was refactored so `App.tsx` acts mainly as the coordinator instead of holding the entire UI.

### Root coordinator

[src/App.tsx](/abs/path/c:/Users/es/Desktop/Greek/greek-exam/src/App.tsx:1) is responsible for:

- auth session handling
- sync/hydration with Supabase
- global app state
- current tab/view selection
- launching study sessions
- wiring shared props into the view components

### Reusable UI components

Components in `src/components/` handle reusable screens and shell-level UI:

- [AppHeader.tsx](/abs/path/c:/Users/es/Desktop/Greek/greek-exam/src/components/AppHeader.tsx:1): title bar, theme toggle, profile access
- [TabBar.tsx](/abs/path/c:/Users/es/Desktop/Greek/greek-exam/src/components/TabBar.tsx:1): main section navigation
- [AuthScreen.tsx](/abs/path/c:/Users/es/Desktop/Greek/greek-exam/src/components/AuthScreen.tsx:1): login/register screen
- [QuizRunner.tsx](/abs/path/c:/Users/es/Desktop/Greek/greek-exam/src/components/QuizRunner.tsx:1): multiple-choice quiz runtime
- [MatchGame.tsx](/abs/path/c:/Users/es/Desktop/Greek/greek-exam/src/components/MatchGame.tsx:1): pronoun/form matching mini-game
- [TypingChallenge.tsx](/abs/path/c:/Users/es/Desktop/Greek/greek-exam/src/components/TypingChallenge.tsx:1): typed recall drill

### View components

Components in `src/components/views/` render each major area:

- `DashboardView`
- `VocabView`
- `VerbsView`
- `GrammarView`
- `PhrasesView`
- `ProgressView`
- `ProfileView`

These are intentionally more presentational and receive their state/actions from `App.tsx`.

### Study feature module

`src/features/study/` contains the app’s domain logic:

- [types.ts](/abs/path/c:/Users/es/Desktop/Greek/greek-exam/src/features/study/types.ts:1): shared TypeScript types
- [constants.ts](/abs/path/c:/Users/es/Desktop/Greek/greek-exam/src/features/study/constants.ts:1): quiz lengths, exam date, labels, avatar palettes
- [data.ts](/abs/path/c:/Users/es/Desktop/Greek/greek-exam/src/features/study/data.ts:1): normalized imported data
- [quizBuilders.ts](/abs/path/c:/Users/es/Desktop/Greek/greek-exam/src/features/study/quizBuilders.ts:1): functions that create quiz sessions
- [utils.ts](/abs/path/c:/Users/es/Desktop/Greek/greek-exam/src/features/study/utils.ts:1): scoring, shuffling, deck labels, avatar helpers, stored-state normalization

## Data Sources

Static learning content lives in `src/data/`.

- `vocab.json`: grouped vocabulary categories
- `verbs.json`: infinitive, English meaning, type, and conjugation arrays
- `grammar.json`: grammar explanations/topics
- `grammar-quiz.json`: question bank for grammar quizzes
- `persons.json`: pronouns/person labels used in conjugation tables
- `extras.ts`: phrasebook sections and matching-game lessons

### Text normalization

[src/features/study/data.ts](/abs/path/c:/Users/es/Desktop/Greek/greek-exam/src/features/study/data.ts:1) includes a small normalization layer to repair broken text encoding when imported data contains mojibake-like characters. That means the app tries to clean incoming strings before the rest of the UI uses them.

## Study Modes

### Dashboard

The dashboard gives you:

- overall accuracy
- total sessions
- mistakes count
- deck ranking by recent score
- favorites preview
- mistakes preview

### Vocabulary

[VocabView.tsx](/abs/path/c:/Users/es/Desktop/Greek/greek-exam/src/components/views/VocabView.tsx:1) lets you:

- browse vocab categories
- search categories or words
- view the best saved score per category
- preview words before opening a quiz
- launch both `Greek -> English` and `English -> Greek` quizzes

Best vocab category scores are computed from deck stats for:

- `vocab:<category>:gr-en`
- `vocab:<category>:en-gr`

The UI shows the highest of the two.

### Verbs

[VerbsView.tsx](/abs/path/c:/Users/es/Desktop/Greek/greek-exam/src/components/views/VerbsView.tsx:1) includes:

- verb search
- verb detail browser
- tense switcher
- verb meanings quiz
- conjugation builder quiz
- matching game
- typing challenge

It also shows best historical scores for:

- `verbs:meaning`
- `verbs:conjugation`

### Grammar

Grammar mode supports:

- browsing topic explanations
- opening a single topic
- launching a mixed quiz over all topics
- launching a quiz for a specific topic

### Phrases

Phrase mode supports:

- grouped phrase sections
- accordion-style browsing
- mixed phrase quizzes
- section-specific phrase quizzes
- both quiz directions

### Progress

The progress board summarizes:

- total sessions
- total correct answers
- total attempted answers
- overall accuracy
- grouped stats by deck family
- individual deck performance

Deck families are derived in [utils.ts](/abs/path/c:/Users/es/Desktop/Greek/greek-exam/src/features/study/utils.ts:62) from deck ids such as `vocab:*`, `verbs:*`, `grammar:*`, `phrases:*`, and `review:*`.

### Profile

Profile access is intentionally in the header, not the tab bar.

Profile shows:

- generated avatar based on email
- inferred display name from email
- current theme
- tracked deck count
- best deck
- retake target
- sessions / accuracy / saved cards
- shortcuts to progress, favorites, mistakes, reset, and logout

## Quiz System

Quiz sessions are plain objects with a common structure:

- `deckId`
- `title`
- `subtitle`
- `items`

Each item contains:

- `prompt`
- `choices`
- `answer`
- `review`
- optional `detail`

This structure is defined in [src/features/study/types.ts](/abs/path/c:/Users/es/Desktop/Greek/greek-exam/src/features/study/types.ts:10) and produced by [src/features/study/quizBuilders.ts](/abs/path/c:/Users/es/Desktop/Greek/greek-exam/src/features/study/quizBuilders.ts:1).

That design makes it easy to:

- reuse one quiz runner for many deck types
- record results consistently
- save review cards consistently
- compute best scores per deck

## State Model

Important state concepts:

- `view`: which major section is open
- `session`: active study runtime (`quiz`, `match`, or `typing`)
- `stored`: persisted user progress
- `theme`: light or dark
- selection state for vocab, verbs, grammar, and phrase sections

Persisted progress shape:

```ts
type StoredState = {
  theme: "light" | "dark";
  deckStats: Record<string, DeckStats>;
  favorites: ReviewCard[];
  mistakes: ReviewCard[];
};
```

## Styling

Most styling is in [src/App.css](/abs/path/c:/Users/es/Desktop/Greek/greek-exam/src/App.css:1).

The styling approach is:

- CSS custom properties for theme colors
- one shared file for layout and component styling
- responsive grid-based layouts
- light and dark theme variants via `data-theme`

## Build Notes

Production build output goes to `dist/`.

Current known note:

- Vite may warn that the main JS chunk is larger than `500 kB` after minification

That is a warning, not a build failure.

## Suggested Small Improvements

These are realistic next steps that fit the current codebase without requiring a big rewrite.

### UX improvements

- Add a `last played` label per deck in the progress board.
- Add a `retake recommended` badge when a deck's best score is below a threshold.
- Add a confirmation step before `Reset progress`.
- Add keyboard shortcuts during quizzes such as `1-4` for answers and `Enter` for next.
- Restore the last opened tab after login so users return to where they left off.
- Add a small `recent activity` section on the dashboard showing the latest completed decks.

### Learning improvements

- Track accuracy separately for `Greek -> English` and `English -> Greek` vocab directions.
- Add a `hard cards` list in addition to favorites and mistakes.
- Show `mistakes by category` so weak vocab areas are easier to spot.
- Add simple spaced-review ordering for favorites and mistakes instead of always taking the first slice.
- Add a daily or weekly study streak counter.

### Code improvements

- Extract Supabase hydration/save logic into a hook like `useProgressSync`.
- Extract derived stats like `rankedDecks`, `familyStats`, and overall accuracy into a hook like `useProgressMetrics`.
- Split `src/App.css` into smaller feature-based style files if it grows further.
- Add a small `features/auth/` module if auth behavior expands beyond the current screen and sync flow.
- Add unit tests for helpers like `getBestScore`, `formatDeckLabel`, `normalizeStoredState`, and quiz builders.

### Performance improvements

- Code-split heavy screens with `lazy()` to reduce the main bundle size.
- Delay loading certain data-heavy study areas until the user opens them.
- Profile the app and only add extra memoization where it gives a measurable benefit.

### Data improvements

- Clean the source JSON and phrase data to proper UTF-8 so the repair layer becomes only a fallback.
- Add development-time validation for imported verb/vocab structures.
- Add a content checklist for new verbs, grammar questions, and vocab categories to keep the data consistent.

## How To Extend The App

### Add a vocab category

Edit `src/data/vocab.json` and add a new category key with `[greek, english]` pairs.

### Add verbs

Edit `src/data/verbs.json` with:

- `inf`
- `en`
- `type`
- `p`
- `pa`
- `f`

Each tense array should align with the people in `src/data/persons.json`.

### Add grammar topics

- add explanation text to `src/data/grammar.json`
- add quiz items to `src/data/grammar-quiz.json`

### Add phrasebook sections

Edit `src/data/extras.ts` and update `phraseSections`.

### Add a new study mode

Typical path:

1. Add any new types in `src/features/study/types.ts` if needed.
2. Add constants or helpers in `src/features/study/constants.ts` / `utils.ts`.
3. Create session builders in `src/features/study/quizBuilders.ts` if it is quiz-based.
4. Build a reusable component in `src/components/`.
5. Add a routed view in `src/components/views/`.
6. Wire it through `src/App.tsx`.

## Troubleshooting

### Supabase login does not work

Check:

- `.env` exists
- `VITE_SUPABASE_URL` is correct
- `VITE_SUPABASE_ANON_KEY` is correct
- the SQL schema has been applied

### Progress is not saving

Check:

- the user is logged in
- `user_progress` exists
- RLS policies were created successfully
- your Supabase project allows the current auth flow

### Greek text looks corrupted

The app already tries to repair some broken text imports in `src/features/study/data.ts`, but the best fix is still to store the source data in proper UTF-8.

## Development Notes

- The app uses `startTransition` in navigation flows to keep UI updates smoother.
- Data is mostly static and local, while progress is remote and user-specific.
- `App.tsx` is intentionally thinner now; most screen logic lives in dedicated view components.

## License

No license file is currently included in this repository.
