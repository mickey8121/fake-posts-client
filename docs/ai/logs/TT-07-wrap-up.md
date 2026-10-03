# TT-07: Wrap-up

Task: [`docs/tasks/TT-07-wrap-up.md`](../../tasks/TT-07-wrap-up.md) · PR: [#7](https://github.com/mickey8121/fake-posts-client/pull/7)

Session log: [`TT-07-wrap-up.jsonl`](TT-07-wrap-up.jsonl) — this session plus a short second one that tried to run `/mobile-review` before the plugin had loaded; merged by time. Exported as the last step before opening the PR, so the hand-off after it is not in the log.

## Prompts

- "Task TT-07: read it, check all requirements, ask me if you have questions and make a plan. Use /screen and /entity where appropriate."
- Answers to the plan's questions: keep the TT-01 no-log exception, build the checklist from the kickoff only, drop screenshots from the task, record review results in a new file under `docs/`.
- "Go ahead with the plan."
- "Go on — run `/mobile-rn:mobile-review src/` yourself and do the points one by one."

## What the agent did

- Found that neither `/screen` nor `/entity` applies: this task adds no slice. Both skills were copied into the harness folder because earlier tasks consulted them.
- Refined the task file: screenshots removed from scope and criteria, the TT-01 and kickoff log exception written into the criteria, the manual pass turned into a checklist file.
- Checked the tree before the review: favorites-first ordering already has seven direct tests through `selectSortedPosts`, so no test was added; a grep found no import against the layer direction, no cross-slice import and no deep path; a clean clone of `main` passes `yarn install --immutable`, `make check` and `make test`.
- Ran `/mobile-review src/` — 40 files, three lenses, one unprimed `mobile-reviewer` agent each. The first attempt failed because the plugin skills had not loaded in the session; after a restart the skill and the agent were available.
- Fixed four of the five findings and kept one by design; the full report is in [`docs/mobile-review.md`](../../mobile-review.md).
- Wrote [`docs/manual-pass.md`](../../manual-pass.md), the checklist for the human run on iOS and Android.
- Updated the README (image-cache note after a restart, links to the new docs) and the stale `src/` line in `CLAUDE.md`; added `mobile-review`, `mobile-reviewer`, `screen` and `entity` to the harness folder.
- Verified with `make check`, `make test` and a compile-only bundle for both platforms.

## Decisions

- **The details loader stays.** The review flagged that the screen waits for `GET /posts/{id}` although the post is already in the store. That wait is the spec (kickoff decision 3, TT-06), so it is recorded as kept by design, not fixed.
- **The toggle feature lost its model segment.** `useToggleFavorite` now lives in `entities/post`, and `ToggleFavoriteButton` reads the entity hooks directly. A forwarding hook in the feature carried two names for one action and added nothing.
- **Bottom safe-area inset on both scroll containers**, because the Android project is edge-to-edge. It is not verified on a device; it is on the manual pass.
- **Unfixed notes go in `docs/mobile-review.md`**, not the task file or the README: dead `app/hooks.ts`, `getItemLayout` ignoring the list padding, shadows below Android API 28, one re-sort per first details visit.

## Problems

- `/mobile-review` was unknown in the first session: the `mobile-rn` plugin was enabled in `.claude/settings.json` but its skills and agents were not registered. The skill forbids substituting another agent, so the work stopped until a session with the plugin loaded.
- The app rewrote `.claude/settings.json` (key order and formatting only) when the plugin loaded. Not part of this change; left out of the commit.
- The TT-01 and kickoff log gap is a documented exception, not a defect: both ran before the export existed.

## Follow-ups

- **Human:** run [`docs/manual-pass.md`](../../manual-pass.md) on iOS and Android, including the restart scenarios and the scroll-to-the-end check for the safe-area fix.
- CI runs `make check` only; `make test` is not part of it. Left as is — outside this task.

## Outcome

- `make check` and `make test` pass (41 tests); both platform bundles compile.
- A clean clone installs and passes the same checks.
- Tasks TT-02…TT-07 have a summary and a session log; TT-01 and the kickoff have a summary only.
