# 00: Kickoff

Planning session before any code. No task file — the outcome is [`docs/kickoff.md`](../../kickoff.md).

## Opening prompt

The spec was attached as a document, with a request to do five things before starting:

- discuss every gap in the spec and close the open questions;
- agree on how the project is run — `docs/tasks/`, connecting the personal harness after init;
- pick the packages;
- assemble the init commands;
- decide how the Claude Code work is logged for hand-over.

## What the agent did

- Read the spec and its three screenshots, the harness repository, and the local toolchain versions.
- Listed eight gaps in the spec with a proposed default for each.
- Proposed the stack, the task breakdown `TT-01` … `TT-07`, and the log format.
- Checked package versions and the React Native CLI flags against npm instead of relying on memory.

## Decisions made by the human

- Image URLs are generated once and stored with the post; one picture, two resolutions.
- `/posts/{id}` is called on first open only, and noted as redundant in the README.
- Ordering by `id`. The agent first proposed local timestamps; this was rejected because the API has none.
- Errors as an alert with refetch; image skeleton and "error" states; dark palette.
- MMKV instead of the proposed AsyncStorage.
- Local task ids instead of a tracker; per-task summaries instead of full transcripts.
- All project work in English.

## Decisions changed during the session

- **Package manager.** npm was proposed, pnpm was requested, and Yarn was chosen after the agent pointed out that pnpm needs a hoisted linker for React Native and loses its main advantage, while Yarn is what the template is set up for.
- **React Query.** Considered and dropped: the spec asks for fetch-once persisted state, which is the opposite of a refetching cache.
- **Setup split.** Creating the project (three commands) was taken out of the plan as a manual step; everything inside the repository stayed as `TT-01`.

## Problems

- **`yarn install` failed during `init`.** The CLI wrote its Yarn config into the parent directory, which also held a stale empty `yarn.lock`, so Yarn treated the parent as the project. The agent found the stray files, and the fix was to move the config into the project and remove the leftovers.

## Outcome

- `docs/kickoff.md` — decisions, stack, process, plan.
- Project created with React Native 0.87.1 and Yarn 3.6.4.
