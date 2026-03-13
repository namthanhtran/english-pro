# Lesson Module Enhancement Plan (12 Tasks)

> This document outlines all 12 small features suggested earlier and how they fit into the lesson flow. It is a planning reference only (no code changes).

## 1) Lesson Status Toggle
**Goal:** Let users mark lessons as Draft / In‑progress / Completed.
- UI: status badge + selector near lesson title.
- Backend: update `Lesson.status` via existing update endpoint.

## 2) Lesson Goals + Progress Bar
**Goal:** Allow setting a goal (e.g., “Learn 20 words”) and show progress.
- UI: numeric input + progress bar.
- Logic: progress = learned words / goal.
- Backend: store `goalWordsCount` on Lesson, return learned count.

## 3) Pinned Words
**Goal:** Mark important vocabulary.
- UI: star icon toggle on each word.
- Backend: `Word.isPinned` field.

## 4) Vocabulary Search + Filter
**Goal:** Find words quickly.
- UI: search box + “Pinned only” toggle.
- Logic: client filter or API query params.

## 5) Word Tags (noun/verb/idiom)
**Goal:** Categorize words.
- UI: tag chips + select/edit tags.
- Backend: `Word.tags` (string array or enum).

## 6) Pronunciation + Audio Link
**Goal:** Provide pronunciation help.
- UI: show pronunciation text + optional play button.
- Backend: `Word.pronunciation`, `Word.audioUrl`.

## 7) Personal Notes per Word
**Goal:** Let users write memory tips.
- UI: expandable textarea in word card.
- Backend: `Word.personalNote`.

## 8) Mini Quiz (3–5 Questions)
**Goal:** Quick self‑check per lesson.
- UI: “Start Quiz” button, show questions, score result.
- Backend: generate quiz, store attempt, return score.

## 9) Last Reviewed + Review Due
**Goal:** Track review schedule after quiz.
- UI: badge if review is due.
- Backend: `Lesson.lastReviewedAt`, `Lesson.nextReviewAt`.

## 10) Duplicate Lesson
**Goal:** Clone a lesson and its vocabulary.
- UI: “Duplicate” action in lesson menu.
- Backend: create new lesson + copy words in a transaction.

## 11) Export Lesson (CSV/PDF)
**Goal:** Download lesson data.
- UI: export dropdown (CSV/PDF).
- Backend: generate file and return download.

## 12) Practice Mode (Reveal Definitions)
**Goal:** Hide definitions until user clicks reveal.
- UI: toggle practice mode, “Reveal” button per word.
- Optional: mark word learned after reveal or after correct quiz.

---

## Suggested Implementation Order
1. Status + Goals + Progress (Tasks 1–2)
2. Pinned + Search + Tags (Tasks 3–5)
3. Pronunciation + Notes (Tasks 6–7)
4. Practice Mode (Task 12)
5. Mini Quiz + Review Schedule (Tasks 8–9)
6. Duplicate + Export (Tasks 10–11)

---

## Notes
- Keep inline errors in the UI (no full‑page alerts).
- Maintain existing styling and avoid unrelated refactors.
- Features can be rolled out incrementally.
