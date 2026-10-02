# TT-07: Wrap-up

Status: Todo

## Goal

The repository is ready to hand over: verified on both platforms, documented, with the AI work record attached.

## Scope

- Unit tests for selectors and ordering, if any gaps remain.
- `/mobile-review` over the whole app; findings fixed or recorded.
- Full manual pass of the spec on iOS and Android, including the restart scenarios.
- README brought up to date with the final state.
- `docs/ai/logs/`: a summary and a sanitized session log per task, linked to its task file and PR.
- `docs/ai/harness/`: copies of the skills, hooks and rules that were used.
- Screenshots of the app and of the AI sessions.

## Out of scope

- New features.

## Acceptance criteria

- A clean clone runs with `yarn install` and `yarn run:ios` / `yarn run:android`.
- Every item of the spec is checked off against the running app.
- `yarn typecheck`, `yarn lint` and `yarn test` pass.
- No import breaks the FSD layer direction or bypasses a slice's `index.ts`.
- Every task TT-01…TT-07 has a log summary and a session log.

## Dependencies

TT-05, TT-06.
