# TT-01: Project setup

Status: Done

## Goal

Turn the untouched React Native template into a project that is ready for feature work: dependencies, scripts, harness, task files and README.

## Scope

- Build the untouched template on iOS and Android.
- Pin Yarn through `packageManager` and commit `yarn.lock`.
- Install the stack dependencies and pods.
- Scripts: `run:ios` (pods + launch), `run:android`, `typecheck`.
- Harness: `mickey-kit` marketplace with `core` and `mobile-rn` in `.claude/settings.json`; project layer via `/bootstrap`; conventions via `/mobile-rules`.
- `docs/`: kickoff, task files TT-01…TT-07, `ai/` with the log export script, `logs/` and `harness/`.
- README: description, scripts, stack and the reasoning behind it.
- GitHub repository and first push.

## Out of scope

- Any application code beyond the template.

## Acceptance criteria

- `yarn install` followed by `yarn run:ios` or `yarn run:android` launches the template app (checked manually by the human).
- Both platforms build with all native dependencies linked.
- `yarn typecheck`, `yarn lint` and `yarn test` pass.
- The harness plugins load in a new Claude Code session.
- `.claude/rules/mobile.md` exists and is approved.

## Dependencies

None.
