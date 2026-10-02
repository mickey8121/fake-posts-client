# TT-01: Project setup

Task: [`docs/tasks/TT-01-project-setup.md`](../../tasks/TT-01-project-setup.md)

No session log: this task ran in the same session as the kickoff, before the one-task-one-session rule and the log export existed.

## Prompts

- "Let's go" on the agreed plan, after the project was created by hand.
- Follow-up decisions during the task: keep sanitized `.jsonl` session logs per task; keep `docs/ai/` in git; follow Feature-Sliced Design; the agent never launches the app on a simulator.
- `/bootstrap` and `/mobile-rules`, typed by the human — these skills cannot be started by the agent.

## What the agent did

- Built the untouched template for the iOS simulator and Android, then again with all native dependencies.
- Committed the template to `main` and moved the work to a branch.
- Installed the stack; added `redux`, a peer dependency of `redux-persist` that the plan had missed.
- Replaced the template run scripts with `run:ios` (pods + launch) and `run:android`; added `pods` and `typecheck`.
- Wrote the seven task files, the README, the kickoff log and the log export script.
- Enabled the harness plugins in `.claude/settings.json`.
- Reviewed the output of `/bootstrap` and `/mobile-rules` against the kickoff decisions.

## Decisions

- **Feature-Sliced Design.** Layers `app → screens → widgets → features → entities → shared`; `screens` stands for the FSD `pages` layer. Favorites are kept in the post entity, so the ordering selector does not import upwards from a feature.
- **Session logs.** A raw transcript carries local paths, account ids, the e-mail address and images; the export keeps prompts, replies and tool calls and strips the rest. A sanitized session is about 0.2 MB, so the logs are committed.
- **No simulator runs by the agent.** Verification is compile-only builds, type check, lint and tests; the human checks the running app.

## Problems

- **Wrong Ruby in the agent's shell.** `pod install` failed on the system Ruby 2.6; the fix was to put the rbenv shims on `PATH`.
- **Thinking is not in the transcript.** The plan was to keep the agent's reasoning in the session logs, but Claude Code does not store its text.
- **`make fmt` would have rewritten 401 files**, including vendored gems. Fixed with a `.prettierignore`.
- **CI would run Yarn 1.x.** Added `corepack enable` to the workflow.
- **Stale line in the generated `CLAUDE.md`.** `/bootstrap` ran before `/mobile-rules`, so it stated that no rules file exists; corrected.
- **The agent started a simulator launch** to check an acceptance criterion and was stopped; this became the no-simulator rule.

## Outcome

- Both platforms build; `make check` and `make test` pass.
- The template app launches through `yarn run:ios` and `yarn run:android` — checked by the human.
- Project layer in place: `Makefile`, `CLAUDE.md`, `.claude/rules/mobile.md`, CI workflow.
