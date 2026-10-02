# Harness

Copies of the skills, hooks and rules used while building this project, kept here for review.

The harness itself is installed as Claude Code plugins from a private marketplace (see `.claude/settings.json`); the copies in this directory are not what the agent loads. A part is copied here when a task first uses it.

| Path | What it is | First used |
|---|---|---|
| `core/hooks/`, `core/scripts/` | Session hooks: a guard for dangerous shell commands, a per-file check after every edit, a session-start summary of the repository state | TT-01 |
| `core/skills/bootstrap/` | `/bootstrap` — drafts the project layer: `Makefile`, `CLAUDE.md`, `.claude/settings.json`, CI workflow | TT-01 |
| `mobile-rn/skills/mobile-rules/` | `/mobile-rules` — drafts `.claude/rules/mobile.md`, the app conventions | TT-01 |
| `mobile-rn/agents/mobile-surveyor.md` | Read-only agent that `/mobile-rules` dispatches to survey the tree | TT-01 |

The project's own rules, which the agent does load, are in the repository itself: [`CLAUDE.md`](../../../CLAUDE.md) and [`.claude/rules/mobile.md`](../../../.claude/rules/mobile.md).
