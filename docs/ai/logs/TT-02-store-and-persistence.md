# TT-02: Store and persistence

Task: [`docs/tasks/TT-02-store-and-persistence.md`](../../tasks/TT-02-store-and-persistence.md) · PR: [#2](https://github.com/mickey8121/fake-posts-client/pull/2)

Session log: [`TT-02-store-and-persistence.jsonl`](TT-02-store-and-persistence.jsonl) — exported as the last step before the final commit, so the PR hand-off after it is not in the log.

## Prompts

- "Read TT-02, check all requirements, ask if you have questions, make a plan."
- Answers to the plan's questions: favorites stay a plain array (the list order is derived from the posts cache plus the favorite ids, so the array's own order does not matter); the loader is for fetch requests only, so rehydration shows nothing; persist whitelist and the new Babel dependency approved.
- "Write the jsonl log in the close-out stage."

## What the agent did

- Refined the task file with the agreed decisions, then added `babel-plugin-module-resolver` and the six layer aliases to `babel.config.js`, `tsconfig.json` and `jest.config.js`.
- Built `shared/storage` (MMKV adapter for `redux-persist`), `entities/post` (type, posts cache with request flags, favorites, `sortPosts`, memoized `selectSortedPosts`) and `app/` (store factory, typed hooks, `StoreProvider` with `PersistGate`); wrapped `App.tsx`.
- Wrote 15 Jest tests: reducers, selector ordering and memoization, and a persistence round-trip through a second store on the same MMKV instance.
- Verified with `make check`, `make test` and compile-only Metro bundles for iOS and Android.

## Decisions

- **Favorites are a sorted array.** Inserting keeps ids ascending, so toggling any id twice restores the exact array, which the acceptance criterion needs. The order does not affect the list.
- **`posts` is the single cache.** Request flags are `listRequested` and `detailRequestedIds`; TT-03 flips them.
- **No loader on rehydration.** `PersistGate` renders `null`.
- **`timeout: 0` in the persist config.** MMKV reads are synchronous, so the 5 s fallback timer only kept Jest alive.
- **Typed hooks in `app/hooks.ts`**, as the task says.

## Problems

- **Jest could not load the dependencies.** The Redux packages and `react-native-mmkv` ship ESM and had to be added to `transformIgnorePatterns`; `react-native-nitro-modules` needs a stub in `jest.setup.js` because MMKV imports it even though it swaps in an in-memory mock under test.
- **A `moduleNameMapper` in `jest.config.js` replaces the preset's mapper** instead of merging, which broke `react-native`; the preset's entries are spread back in.
- **TS 6 rejects `paths` without `baseUrl` unless the targets start with `./`.**
- **Typed hooks and FSD pull in opposite directions.** Screens and widgets sit below `app/` but would import the hooks from it; to settle in TT-05. The agent first put a generic dispatch hook in `shared/lib`, then moved it after review because the task says `app/`.

## Follow-ups

- **TT-03:** the persist config whitelists whole slices, so request status and errors must live outside `posts`, or under a nested persist config with a blacklist.
- **TT-05:** decide how screens consume the typed hooks without importing upward.

## Outcome

- `make check` and `make test` pass; both platform bundles compile.
- "State survives a restart on both platforms" is for the human to check by hand.
