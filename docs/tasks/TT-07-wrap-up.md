# TT-07: Wrap-up

Status: Done

## Goal

The repository is ready to hand over: verified, documented, with the AI work record attached.

## Scope

- Unit tests for selectors and ordering, if any gaps remain.
- `/mobile-review` over the whole app; findings fixed or recorded in `docs/mobile-review.md`.
- A manual-pass checklist (`docs/manual-pass.md`) built from the kickoff decisions and the README feature list, covering iOS, Android and the restart scenarios. The agent never launches the app, so the human runs it.
- README brought up to date with the final state.
- `docs/ai/logs/`: a summary and a sanitized session log per task, linked to its task file and PR. TT-01 and the kickoff are the exception: they ran before the export existed and have a summary only.
- `docs/ai/harness/`: copies of the skills, hooks, agents and rules that were used.

## Out of scope

- New features.
- Screenshots.

## Acceptance criteria

- A clean clone runs with `yarn install` and `yarn run:ios` / `yarn run:android`.
- Every item of the checklist is checked off against the running app by the human.
- `yarn typecheck`, `yarn lint` and `yarn test` pass.
- No import breaks the FSD layer direction or bypasses a slice's `index.ts`.
- Tasks TT-02…TT-07 each have a log summary and a session log; TT-01 and the kickoff have a summary only.

## Dependencies

TT-05, TT-06.
