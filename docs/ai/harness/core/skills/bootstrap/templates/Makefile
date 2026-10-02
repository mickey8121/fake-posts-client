# ---------------------------------------------------------------------------
# Contract Makefile (claude-kit). The target NAMES are the contract; the
# commands behind them are this project's business. Consumers:
#
#   check-file  <- post-edit hook, after every Claude edit (keep it fast:
#                  linting only, seconds not minutes; type checking belongs
#                  in `check` — the LSP already reports type errors live)
#   check       <- /ship skill and CI: the full static pass
#   test        <- /ship skill and CI
#   fmt         <- humans and skills, never called automatically
#
# Rules the hooks rely on:
#   - Recipes are indented with a TAB, not spaces ("missing separator"
#     means spaces sneaked in).
#   - Targets must be defined flat in this file. The hooks find them by
#     reading the Makefile, so a target behind `include` is invisible.
#   - FILE arrives project-relative and make runs from the project root,
#     so tool configs resolve exactly as they do in a terminal.
#   - A target you don't need can be deleted: the hooks skip silently
#     when a target is absent. Don't leave a target with an empty or
#     placeholder recipe — post-edit would run it and trust its exit code.
# ---------------------------------------------------------------------------

.PHONY: check check-file test fmt

# Fast per-file lint. Example (TypeScript):
#   pnpm exec eslint --max-warnings 0 "$(FILE)"
check-file:
	@echo "check-file: fill in this recipe (see header)" && exit 1

# Full static pass: types + lint over the whole project. Example:
#   pnpm exec tsc --noEmit
#   pnpm exec eslint . --max-warnings 0
check:
	@echo "check: fill in this recipe (see header)" && exit 1

# The test suite. Example:
#   pnpm exec vitest run
test:
	@echo "test: fill in this recipe (see header)" && exit 1

# Formatter, run on demand. Example:
#   pnpm exec prettier --write .
fmt:
	@echo "fmt: fill in this recipe (see header)" && exit 1