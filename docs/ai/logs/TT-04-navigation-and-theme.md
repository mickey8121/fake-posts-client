# TT-04: Navigation and theme

Task: [`docs/tasks/TT-04-navigation-and-theme.md`](../../tasks/TT-04-navigation-and-theme.md) · PR: [#4](https://github.com/mickey8121/fake-posts-client/pull/4)

Session log: [`TT-04-navigation-and-theme.jsonl`](TT-04-navigation-and-theme.jsonl) — exported as the last step before the merge, so the hand-off after it is not in the log.

## Prompts

- "Read TT-04, check all requirements, ask if you have questions, make a plan."
- Answers to the plan's questions: `boxShadow` for shadows, the native header styled from the theme, replace the template `App.tsx` and drop its dependency.
- "Go ahead with the plan."
- "Add the mobile.md rule to this PR" and a correction of a wrong statement about the TT-03 PR's contents.
- "Add the TT-04 session log, then merge the PR and close the task."

## What the agent did

- Built `shared/theme` (palette, spacing, radii, typography, `boxShadow` tokens).
- Added placeholder `PostsScreen` and `DetailsScreen` in `screens/`; `DetailsScreen` takes `postId` through `StaticScreenProps`, so params are inferred and `screens/` never imports from `app/`.
- Added the static native stack in `app/Navigation.tsx` with a navigation theme and header built from the tokens, and registered `RootParamList` once.
- Replaced the template `App.tsx`; removed `@react-native/new-app-screen`.
- Refined the task file and settled the shadow convention in `.claude/rules/mobile.md` after the draft was approved.
- Verified with `make check`, `make test` and compile-only Metro bundles for iOS and Android.

## Decisions

- **`boxShadow` over `shadow*` + `elevation`.** One style object renders the same on both platforms with no `Platform.OS` branches. Cost: on Android the blur needs API 28+, and `minSdkVersion` is 24.
- **Native header kept**, styled from the theme, so the native back gesture and transitions stay as they are.
- **Dark-only.** The system color scheme is ignored and the status bar is always light.
- **Temporary navigation button** on `PostsScreen` with a hardcoded post id, to exercise typed params; TT-05 replaces it.

## Problems

- **React Navigation is ESM** and had to be added to `transformIgnorePatterns` in `jest.config.js`, otherwise the App test failed.
- **Tooling detours:** zsh aborted a command on an unmatched `--include=*.ts` glob, and BSD `sed` rejected a GNU-style multi-line replacement.
- **A wrong claim in a reply:** the agent said the TT-03 PR "also included docs/ai/logs/TT-04-…"; it included the TT-03 log. Corrected in the conversation.

## Follow-ups

- **Human check:** the back gesture on both platforms, and that shadows look alike. Not done by the agent: the app is never launched in a session.
- **TT-05:** replaces the temporary button and the `PostsScreen` placeholder.

## Outcome

- `make check` and `make test` pass; both platform bundles compile.
- The acceptance criteria that need a running app (back gesture, shadow parity) are for the human to verify by hand.
