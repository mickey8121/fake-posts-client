# TT-03: API and faker enrichment

Task: [`docs/tasks/TT-03-api-and-faker.md`](../../tasks/TT-03-api-and-faker.md) · PR: [#3](https://github.com/mickey8121/fake-posts-client/pull/3)

Session log: [`TT-03-api-and-faker.jsonl`](TT-03-api-and-faker.jsonl) — exported as the last step before the final commit, so the PR hand-off after it is not in the log.

## Prompts

- "Read TT-03, check all requirements, ask if you have questions, make a plan."
- Answers to the plan's questions: the picture seed is derived from the post id; faker is imported as a minimal instance, not the root package.
- "Add a request timeout — 20 seconds, then an error as an Alert with a refetch button. Fix my decision and go on."

## What the agent did

- Refined the task file with the agreed decisions, including the 20 s timeout. The `Alert` itself stays in TT-05 and TT-06; here a timeout is a failed request with a readable message.
- Built `shared/api` (`fetch` client with `AbortController` timeout) and `entities/post/api` (DTO, `getPosts`, `getPost`, mapping with enrichment).
- Added `loadPosts` and `loadPost(id)` thunks guarded by `condition` (flag set or request in flight), a non-persisted `postRequests` slice, and reducers that keep existing image URLs. `postsLoaded` and `postLoaded` were replaced by the thunks' `fulfilled` handlers.
- Wrote and updated Jest tests (26 in total): reducers, selectors, persistence including "status is not persisted", thunks with a mocked `fetch`, and the client timeout under fake timers.
- Verified with `make check`, `make test` and compile-only Metro bundles for iOS and Android.

## Decisions

- **Picture seed = post id.** A shared `faker` instance is re-seeded before each of the two `image.url` calls, so thumbnail and image carry the same picsum seed and the result is stable even if the cache is lost.
- **Request status in its own slice.** TT-02 left the choice open; a separate slice keeps the persist whitelist unchanged, and a request in flight when the app is killed cannot come back as `pending`.
- **`condition` instead of checks in the UI.** Double dispatch (StrictMode, rapid taps) is skipped without any `rejected` action.
- **Image URLs are first-write-wins** in the reducers, so `/posts/{id}` can never change a picture.
- **Faker from `@faker-js/faker/locale/base`.** It exposes a ready instance and `image.url` needs no locale data.

## Problems

- **Faker is ESM** and had to be added to `transformIgnorePatterns` in `jest.config.js`.
- **Bundle size.** The `en` locale entry added about 470 KB to the release bundle; on review the `base` entry turned out to be enough and costs about 185 KB.
- **Review caught two things before the PR:** a test importing a slice file by a deep path, and a state cast in a reducer; both were removed.
- **Tooling detours:** BSD `sed` rejected a multi-line replacement, and `global` is not typed in the TS config (`globalThis` is used for the `fetch` mock).

## Follow-ups

- **TT-05, TT-06:** the loader, the `Alert` with a refetch button, and the thunk dispatch from screens; the typed hooks question from TT-02 is still open.
- TT-02's task file still said `In progress` after its merge; fixed in this PR together with TT-03's own status.

## Outcome

- `make check` and `make test` pass; both platform bundles compile.
- "The list and each detail are requested once across restarts" is covered by tests; the real restart check on both platforms is for the human to do by hand.
