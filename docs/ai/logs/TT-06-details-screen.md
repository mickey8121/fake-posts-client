# TT-06: DetailsScreen

Task: [`docs/tasks/TT-06-details-screen.md`](../../tasks/TT-06-details-screen.md) · PR: [#6](https://github.com/mickey8121/fake-posts-client/pull/6)

Session log: [`TT-06-details-screen.jsonl`](TT-06-details-screen.jsonl) — exported as the last step before opening the PR, so the hand-off after it is not in the log.

## Prompts

- "Task TT-06: read it, check all requirements, ask me if you have questions and make a plan. Use /screen and /entity where appropriate."
- Answers to the plan's questions: the error alert offers "Refetch" and "Back"; the toggle button reads "Add to favorites" / "Remove from favorites" and turns dark red when on.
- "Go ahead with the plan."
- "Checked on both platforms, log session, push and open the PR."

## What the agent did

- Found that neither `/screen` nor `/entity` applies: both stop when the target already exists, and `screens/details` and `entities/post` were created in earlier tasks. `features/toggle-favorite` is a new feature slice, which neither skill covers. The code was written by hand against `.claude/rules/mobile.md`.
- Extended `entities/post` with `getDetailView`, `usePost`, `useIsFavorite` and `useFavoriteToggle`, and exported `IMAGE_SIZE` so the screen does not repeat it.
- Added `features/toggle-favorite`: `useToggleFavorite` and a memoized `ToggleFavoriteButton`.
- Replaced the `DetailsScreen` placeholder: 300×300 `RemoteImage`, title, body, the toggle button, the default `ActivityIndicator`, and a non-cancelable `Alert`.
- Refined the task file with the agreed alert buttons, the button states and the end-to-end favorite check moved over from TT-05.
- Verified with `make check` and `make test`.

## Decisions

- **Loader on the first open.** The post is already in the store from the list, but the detail request still fires and the loader shows until it returns, as the spec says.
- **"Refetch" + "Back" in the alert.** Unlike the list, the details screen is not a dead end when the request fails, so the user can return to the list instead of waiting for the network.
- **No new reducers or thunks.** TT-02 and TT-03 already guard the request with the persisted `detailRequestedIds` and keep the image URLs, so this task only adds hooks and UI.
- **The feature reaches the store through entity hooks.** `app/hooks.ts` is off-limits below `app/`, so the entity exports `useIsFavorite` and `useFavoriteToggle` and keeps its typed dispatch private.

## Problems

- A review pass found that the plan promised a restart test that had not been written yet. Added one: it rehydrates storage that already marks a post as requested and checks `fetch` is not called.
- `IMAGE_SIZE` was defined twice (screen and `enrichPost`); the screen now imports it from `@entities/post`.

## Follow-ups

- **TT-07:** wrap-up, `/mobile-review` over the whole app, README, harness copy and screenshots.

## Outcome

- `make check` and `make test` pass (41 tests).
- The human checked the acceptance criteria on iOS and Android, including the restart scenarios and the favorite → go back check.
