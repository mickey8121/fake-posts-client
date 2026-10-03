# TT-05: PostsScreen

Task: [`docs/tasks/TT-05-posts-screen.md`](../../tasks/TT-05-posts-screen.md) · PR: opened from `feat/tt-05-posts-screen`

Session log: [`TT-05-posts-screen.jsonl`](TT-05-posts-screen.jsonl) — exported when the PR was opened, so the hand-off after it is not in the log.

## Prompts

- "Read TT-05, check all requirements, ask if you have questions, make a plan. Use /screen and /entity where appropriate."
- Answers to the plan's questions: entity-local typed Redux hooks, truncated fixed-height cards, the favorite end-to-end criterion deferred to TT-06.
- "Go ahead with the plan."
- "Yes to both: add the mobile.md rule and open the PR."

## What the agent did

- Found that neither `/screen` nor `/entity` applies: both stop when the target already exists, and `screens/posts` and `entities/post` were created in earlier tasks. The code was written by hand against `.claude/rules/mobile.md`.
- Built `shared/ui` (`RemoteImage` with a shimmering loading block and a centered "error", plus `Shimmer`) and a `typography.micro` token so the label fits in 32×32.
- Extended `entities/post` with `usePostList`, `getListView` and a memoized, fixed-height `PostCard`.
- Added `widgets/post-list`: a `FlatList` with `getItemLayout`, the default `ActivityIndicator`, and a non-cancelable `Alert` with a single "Refetch" button.
- Replaced the `PostsScreen` placeholder and its temporary button; navigation goes through an `onPostPress` callback.
- Refined the task file and wrote the "Lists and images" section of `mobile.md` after the full draft was approved; the matching Gap entry was removed.
- Verified with `make check`, `make test` and compile-only Metro bundles for iOS and Android.

## Decisions

- **Entity-local typed hooks.** `app/hooks.ts` is not importable from lower layers, so the post entity defines its own dispatch and selector hooks from `PostRootState`.
- **Truncated, fixed-height cards** (title 1 line, body 2 lines) so the list can use `getItemLayout`.
- **A single, non-cancelable alert button** so a failed first load cannot leave the user on a blank screen.
- **The favorite end-to-end criterion moves to TT-06**, where the toggle button lands. The highlight and ordering are built here and covered by the existing selector tests.

## Problems

- `StyleSheet.absoluteFillObject` is gone from the RN 0.87 types; `StyleSheet.absoluteFill` is used instead.
- The App test now renders the list, which dispatches the request, so the test stubs `fetch` with a never-resolving promise.

## Follow-ups

- **Human check:** first-launch loader, relaunch without a request, the offline alert and refetch, scroll smoothness, shadow parity. The agent never launches the app.
- **TT-06:** the favorite toggle and the end-to-end favorite check.

## Outcome

- `make check` and `make test` pass (33 tests); both platform bundles compile.
- The acceptance criteria that need a running app are for the human to verify by hand.
