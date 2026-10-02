# FakePostsClient

A small bare React Native app for iOS and Android. It lists posts from JSONPlaceholder, gives each one a FakerJS image, and has a details screen. Favorites float to the top of the list. Everything is fetched once and persisted across restarts.

## Stack

- React Native 0.87.1 (bare, no Expo), React 19.2, TypeScript
- React Navigation 7 (native stack)
- Redux Toolkit + `react-redux`, persisted with `redux-persist` over `react-native-mmkv`
- `@faker-js/faker` for images
- Jest (`@react-native/jest-preset`), ESLint (`@react-native/eslint-config`), Prettier
- Yarn 3.6.4 via Corepack, `nodeLinker: node-modules`

## Map

- `App.tsx`, `index.js` — app entry
- `__tests__/` — Jest tests
- `android/` — native Android project
- `ios/` — native iOS project (CocoaPods; Ruby gems via `Gemfile`)
- `docs/` — kickoff decisions (`kickoff.md`), per-task specs (`tasks/`), AI session logs and harness (`ai/`)
- `src/` — not created yet; planned as Feature-Sliced Design layers (`app`, `screens`, `widgets`, `features`, `entities`, `shared`), see README

## Commands

The `Makefile` is the contract the harness reads — target *names* are the
interface, the recipes behind them are this project's business. The hooks and
skills never invoke a package manager directly.

| Target | What it runs | Who calls it |
|---|---|---|
| `check-file FILE=<path>` | ESLint on one file, zero warnings | the `post-edit` hook, after every edit |
| `check` | `tsc --noEmit`, then `eslint .` | `/ship` and CI |
| `test` | Jest | `/ship` and CI |
| `fmt` | Prettier over the whole tree | humans and skills, never automatically |

Day-to-day commands that are not part of the contract:

- `yarn start` — Metro bundler
- `yarn pods` — Ruby gems + CocoaPods install
- `yarn run:ios` — pods, then build and launch on the iOS simulator
- `yarn run:android` — build and launch on an Android emulator or device

## Conventions

How this project *writes* things is decided once and written down under
`.claude/rules/`, read at a declared path and authoritative where it applies.
A rules file that exists governs alone: the skill reading it does not fall back
to imitating neighbouring code, and where the file and the tree disagree the
file wins and the disagreement is reported rather than reconciled.

- `.claude/rules/mobile.md` — app conventions for `src/`: FSD layout, slice anatomy, naming, navigation, data layer, styling, testing. Read by the `mobile-rn` skills (`/entity`, `/screen`, `/mobile-review`).

These files are owned by a human. A skill may draft one and must show the whole
draft first; nothing lands without an explicit yes.

## Hard conventions

- **Never launch the app on a simulator or emulator.** Verify with compile-only builds, `make check` and `make test`; live checks are done by the human, by hand.
- **Everything is English** — code, comments, docs, task files, commits, PRs.
- **One task — one session.** Tasks live in `docs/tasks/TT-NN-<slug>.md`; branches are `<type>/tt-nn-<slug>`, PRs `TT-NN: <task-name>`.

## Gotchas

- **CocoaPods needs Ruby 3.x.** With the macOS system Ruby 2.6 `bundle` fails on the Bundler version in `Gemfile.lock`; in a non-interactive shell put `~/.rbenv/shims` on `PATH` first.
- **Yarn is 3.6.4 through Corepack.** A global Yarn 1.x refuses to run in this project; run `corepack enable` once.
- **A stray `yarn.lock` or `package.json` in a parent directory** makes Yarn treat the parent as the project root.
- **`react-native-mmkv` 4.x needs `react-native-nitro-modules`** installed next to it.
