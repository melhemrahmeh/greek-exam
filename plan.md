# UI/UX Redesign Plan: Calmer, Clearer, Easier

Goal: make the app feel calm and focused. The learner should always know **what to do next**, with less visual noise and colors that mean something.

## What's wrong today

- **Too much decoration.** `App.css` has ~100 gradients, shadows and transforms. Almost every panel has a radial-gradient "glow" plus a linear gradient, and the dark theme uses hard-coded gradient colors instead of tokens. Everything competes for attention.
- **Colors don't carry meaning.** Brand teal, accent orange, success green and danger red appear as decoration on stat cards (`.stat-panel` variants, the mode cards at lines ~600–830), so color can't be used to signal state.
- **Huge headings.** Titles go up to `4.8rem`, with many `clamp(2rem…3.8rem)` sizes. On a phone the hero pushes the actual content below the fold.
- **The dashboard is heavy on text and light on action.** It opens with marketing copy ("Train the exam the way you actually revise…"), then KPIs, a completion card, two CTAs, two stat panels, a full deck list, favorites and mistakes, all at the same visual weight.
- **Everything is very round.** A 28px radius on every panel, pill buttons and nested cards with their own borders and shadows create "boxes inside boxes."
- **Navigation.** Six text tabs plus a profile button in the header. On mobile the tab bar wraps into 3 columns × 2 rows and takes up a lot of space.

## Design principles

1. **One primary action per screen.** Exactly one filled button, everything else secondary or ghost.
2. **Color = meaning.** Neutral by default. Brand color only for interactive or selected things. Green, amber and red only for score and state.
3. **Flat by default.** Use borders for structure and a shadow only for things that float (modals, the sticky tab bar).
4. **Fewer words.** Short labels. Move explanations into empty states, not onto every screen.
5. **Comfortable for long sessions.** Soft backgrounds, good contrast, no glowing gradients, and respect `prefers-reduced-motion`.

## Phase 1: Design tokens (foundation)

Replace the token block at the top of `src/App.css` with a smaller, stricter set, and remove the hard-coded colors throughout.

### Palette (light)

Warm, quiet neutrals with a muted Aegean blue as the single brand color.

| Token | Value | Use |
|---|---|---|
| `--bg` | `#f7f6f3` | page background (flat, no gradients) |
| `--surface` | `#ffffff` | panels and cards |
| `--surface-muted` | `#f1efea` | inputs, inactive chips, table stripes |
| `--border` | `#e4e1da` | all borders |
| `--text` | `#1f2328` | body text |
| `--text-muted` | `#5f6670` | secondary text (≥ 4.5:1 on white) |
| `--brand` | `#2f6f8f` | buttons, links, active tab, focus ring |
| `--brand-soft` | `#e6f0f5` | selected or hover backgrounds |
| `--success` | `#2e7d5b` / soft `#e5f3ec` | passed (score ≥ 80%), correct answer |
| `--warning` | `#b7791f` / soft `#fbf1df` | in progress (50–79%) |
| `--danger` | `#b4473c` / soft `#f9e8e6` | failed or wrong answer |

### Palette (dark)

Same roles. Lower saturation, no pure black.

| Token | Value |
|---|---|
| `--bg` | `#14171c` |
| `--surface` | `#1b1f26` |
| `--surface-muted` | `#232831` |
| `--border` | `#2e343e` |
| `--text` | `#e8eaed` |
| `--text-muted` | `#a3aab5` |
| `--brand` | `#7fb6d3` |
| `--brand-soft` | `#1f3340` |
| `--success` / `--warning` / `--danger` | `#6cc49a` / `#e0b25c` / `#ec8a7f` (soft variants: 15% mix with surface) |

### Scale tokens

- **Radius:** `--radius-sm: 8px` (inputs, chips), `--radius-md: 12px` (cards, buttons), `--radius-lg: 16px` (panels). Replace the 22–28px values.
- **Spacing:** a 4px grid with `--space-1` … `--space-8` (4, 8, 12, 16, 20, 24, 32, 40).
- **Shadow:** only `--shadow-float: 0 8px 24px rgb(0 0 0 / 0.08)`, for the sticky tab bar and the quiz summary overlay.
- **Type scale:** `--fs-xs 0.8rem`, `--fs-sm 0.9rem`, `--fs-md 1rem`, `--fs-lg 1.25rem`, `--fs-xl 1.6rem`, `--fs-2xl 2rem` (the page-title maximum). Body line-height 1.55.
- **Greek text:** set a font stack with good Greek glyphs, for example `"Inter", "Noto Sans", "Segoe UI", sans-serif` (Inter and Noto Sans both cover Greek). Show quiz prompts and Greek words a step larger (`--fs-xl`) so they're the focus.

### Remove

- The radial-gradient glows on `body` and on every panel.
- The per-card gradient backgrounds (`.stat-panel.standout`, the mode cards, the dark-theme overrides at ~lines 1020–1050).
- The gradient buttons. Primary becomes a flat `--brand` fill.

## Phase 2: Layout and navigation

- **Header:** shrink it to a single slim bar: app name on the left, then the exam countdown chip ("23 days to exam"), theme toggle and avatar on the right. Drop the big hero `h1` and subtitle on inner pages and keep a short page title in the content area instead.
- **Tabs:**
  - Desktop: a single row, sticky under the header, with an underline or soft-fill indicator for the active tab.
  - Mobile (≤ 680px): a **fixed bottom navigation** with 5 items (Home, Vocab, Verbs, Grammar, Phrases), each an icon plus a short label. Move "Progress" into Home and Profile, which leaves 5 tabs.
  - Use simple inline SVG icons (no icon library needed).
- **Content width:** keep `max-width: 1120px`, but cap text blocks at ~70ch for readability.
- **Nesting:** at most one bordered box level. Rows inside a panel use dividers, not their own borders and shadows.

## Phase 3: Screen by screen

### Home (Dashboard)

Rebuild around **"what should I study now?"**

1. **Continue card** at the top, as the one primary action: "Continue: Food vocabulary (last 62%)". Pick the weakest recent deck, or the next unpassed area for a new user.
2. **Today strip:** 3 small numbers in one row (accuracy, sessions, cards to review). Plain text, no gradient tiles.
3. **Area progress:** 4 compact rows (Vocabulary, Grammar, Phrases, Verbs), each with a thin progress bar and "x / y passed". Each row opens its area. This replaces the big completion card and the stat panels.
4. **Review:** Favorites and Mistakes as two small cards, each with a count and a "Study" button. Hide the 12-item lists behind "Show cards."
5. Move the full "Deck performance" list to Progress.

Remove the marketing heading and paragraph.

### Vocab, Grammar, Phrases (deck lists)

- Use a consistent **deck card**: title, word count, and a **score badge** colored by the state rules below. Avoid a wall of numbers. Put pass/fail counts in a tooltip or the detail view.
- Make the search field full-width at the top, with the sort control as a small segmented control beside it.
- Selecting a category opens the detail view on mobile, or a side panel on desktop. Show the two quiz directions as two clear buttons: "Greek → English" (primary) and "English → Greek" (secondary).

### Verbs

- Make the tense switcher a segmented control (Present / Past / Future) with the selected tense highlighted.
- Show the conjugation table as a clean two-column table (person | form), with the Greek form in a larger size and alternating `--surface-muted` rows.
- Group the 5 practice modes into "Quizzes" (meaning, translation, conjugation) and "Games" (match, typing), each a small card with a one-line description.

### Quiz runner (the most important screen)

- **Focus mode:** hide the tab bar. Show only a slim top bar with ✕ close, a progress bar ("7 / 20") and the favorite star.
- Show the prompt large and centered. Stack the answer choices as full-width buttons with ≥ 48px touch targets, numbered 1–4.
- **Feedback:** the correct choice gets a green border, a soft background and a ✓. A wrong pick gets a red border and a ✗. Always pair color with an icon or text so it doesn't rely on color alone. Keep the "Next" button in the same spot every time.
- **Keyboard:** `1–4` to answer, `Enter` for next, `Esc` to close (already on the README wishlist).
- **Summary:** a big score number colored by state, one sentence, then "Review mistakes" (primary when there are mistakes) and "Retry" / "Done". No confetti or heavy animation.

### Progress

- Gets the deck performance list from the dashboard.
- Group decks by area. Each row shows the label, a best-score badge, the last score and the number of sessions.
- Optional: one simple bar chart of the last 10 sessions' scores (inline SVG, no library).

### Profile and login

- Login: a centered card with the name field and a "Start studying" button, plus a short note that progress stays on this device. No hero.
- Profile: avatar, name, a "Switch user" ghost button, and "Reset progress" as a **danger** text button at the bottom, visually separated from everything else.

## Phase 4: Consistent states and components

- **Score badge rule** (used everywhere): no attempts → neutral "New"; < 50% → danger; 50–79% → warning; ≥ 80% → success "Passed". Today a deck counts as passed above 80%, so check whether exactly 80% should count, and align the rule with `PASS_THRESHOLD`.
- **Buttons:** only three variants.
  - Primary: brand fill, white text.
  - Secondary: a border with brand text.
  - Ghost: text only.
  - All buttons get a `:focus-visible` ring (`2px solid var(--brand)`, offset 2px) and a 44px minimum height.
- **Empty states:** a short icon, one sentence and one action button ("No mistakes yet. Take a quiz to find weak spots → Start quiz").
- **Motion:** 150ms ease transitions on hover and selection only. Wrap everything in `@media (prefers-reduced-motion: reduce)` to turn it off. Remove `scroll-behavior: smooth` for reduced-motion users.
- **Accessibility:** check contrast to WCAG AA, add `aria-current="page"` on the active tab and `aria-live="polite"` for quiz feedback, and add visible labels on all inputs.

## Phase 5: CSS cleanup

`App.css` is 2,248 lines. While restyling:

- Split it into `tokens.css`, `base.css` (reset and typography), `components.css` (buttons, cards, badges, inputs, tabs) and one file per screen.
- Delete selectors that no longer exist in the components (check with grep before removing).
- Replace hard-coded hex and rgba values with tokens. Target: no color literal outside `tokens.css`.

## Suggested order and effort

| Step | Work | Size |
|---|---|---|
| 1 | Tokens, remove gradients and glows, flatten shadows, smaller radius and type scale | M |
| 2 | Button, badge, card and input components, plus focus states | S |
| 3 | Slim header, sticky tabs, mobile bottom nav | M |
| 4 | Quiz runner focus mode, feedback and keyboard shortcuts | M |
| 5 | Dashboard rebuild around "Continue" | M |
| 6 | Deck list cards (Vocab, Grammar, Phrases), Verbs table and tense control | M |
| 7 | Progress page with the moved deck list, then profile and login polish | S |
| 8 | CSS file split and dead-selector cleanup | S |

Steps 1–2 alone will make the biggest visible difference: the app goes from "busy" to "calm" without touching any screen logic.

## Out of scope

- New features beyond the "Continue" recommendation and keyboard shortcuts.
- Changes to the data files or quiz logic.
- Adding a UI framework or component library. Plain CSS stays.
