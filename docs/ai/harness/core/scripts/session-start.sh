#!/usr/bin/env bash
#
# SessionStart context hook.
#
# Injects the repository state a session cannot know in advance: which branch is
# checked out, how far it has drifted from its upstream, how much work is
# uncommitted, what landed recently, which of the contract targets the project
# implements, and whether the local settings file is readable at all.
#
# What belongs here is exactly what changes between sessions. Anything stable --
# the stack, the conventions, the layout -- belongs in CLAUDE.md, where it is
# written once and read for free. Repeating it here would spend context on every
# session start to say what the model already has. The inverse is also true: a
# model that has to run 'git status' before it can act has paid a turn for
# something a hook can hand it before the first prompt.
#
# stdout on exit 0 is added to the model's context, so the whole budget is five
# short lines -- one per probe, each dropped when its probe has nothing to say.
# The ceiling is structural rather than enforced: every line is a single printf,
# and none of the values it interpolates can carry a newline.
#
# Everything is local. No fetch, no ls-remote, no package manager, nothing
# slower than 'git status'. Ahead/behind is read from the refs already on disk,
# so the counts are as stale as the last fetch -- which is the right trade: a
# session must not wait on the network to begin.
#
# Fails open everywhere, and more completely than post-edit.sh: no failure mode
# here produces output. A missing git, a directory that is not a repository, a
# probe that errors -- all leave in silence, and a probe that fails costs its
# own line and nothing else. The 'timeout' on the hook entry is the backstop for
# the one probe that can be slow on a cold repository.

set -uo pipefail

SUBJECT_WIDTH=60
SUBJECT_COUNT=3

# Nothing here needs the index, and a session start must never contend for its
# lock with a command the user is already running in another terminal.
export GIT_OPTIONAL_LOCKS=0

# True when $1 is empty or nothing but whitespace. A glob test rather than a
# pattern substitution, which is quadratic on bash 3.2.
is_blank() {
  case "$1" in
    *[![:space:]]*) return 1 ;;
    *) return 0 ;;
  esac
}

is_number() {
  case "$1" in
    '' | *[!0-9]*) return 1 ;;
    *) return 0 ;;
  esac
}

command -v git >/dev/null 2>&1 || exit 0

# Read once, up front, so the writer never meets a closed pipe -- and never when
# stdin is a terminal, so the script stays runnable by hand while debugging.
payload=""
[ -t 0 ] || payload="$(cat)"

root="${CLAUDE_PROJECT_DIR:-}"

# jq is optional here, unlike in post-edit.sh: this hook has a usable fallback,
# so a missing jq costs the payload's .cwd and nothing else.
if is_blank "$root" && ! is_blank "$payload" && command -v jq >/dev/null 2>&1; then
  root="$(printf '%s' "$payload" |
    jq -r 'if (.cwd | type) == "string" then .cwd else "" end' 2>/dev/null)" || root=""
fi

is_blank "$root" && root="$PWD"

root_abs="$(cd "$root" 2>/dev/null && pwd -P)"
[ -n "$root_abs" ] || exit 0

# Every probe goes through here: one place to pin the working directory, keep
# colour out of a stream that is context rather than a terminal, and drop the
# noise git writes when a ref or a revision does not exist.
git_q() {
  git --no-pager -c color.ui=false -C "$root_abs" "$@" 2>/dev/null
}

# The status of rev-parse is not enough on its own -- inside a bare repository
# it succeeds and prints 'false', and there is no working tree to report on.
[ "$(git_q rev-parse --is-inside-work-tree)" = "true" ] || exit 0

# 1. Branch, and the drift from its upstream when it has one.
#
# symbolic-ref rather than 'rev-parse --abbrev-ref HEAD': it distinguishes a
# detached HEAD from a branch literally named HEAD, and it still answers on an
# unborn branch, where rev-parse has no commit to resolve.
line_branch() {
  local branch upstream counts behind="" ahead="" head
  branch="$(git_q symbolic-ref --quiet --short HEAD)"

  if is_blank "$branch"; then
    head="$(git_q rev-parse --short HEAD)"
    is_blank "$head" && return 0
    printf 'Branch: detached HEAD at %s\n' "$head"
    return 0
  fi

  upstream="$(git_q rev-parse --abbrev-ref --symbolic-full-name '@{upstream}')"
  if is_blank "$upstream"; then
    printf 'Branch: %s (no upstream)\n' "$branch"
    return 0
  fi

  # Left of the triple dot is the upstream, so the first count is what this
  # branch is missing and the second is what it has not published.
  counts="$(git_q rev-list --left-right --count "$upstream...HEAD")"
  read -r behind ahead <<<"$counts"
  if ! is_number "$behind" || ! is_number "$ahead"; then
    printf 'Branch: %s (tracking %s)\n' "$branch" "$upstream"
    return 0
  fi

  if [ "$ahead" -eq 0 ] && [ "$behind" -eq 0 ]; then
    printf 'Branch: %s (in sync with %s)\n' "$branch" "$upstream"
  else
    printf 'Branch: %s (%s ahead, %s behind %s)\n' \
      "$branch" "$ahead" "$behind" "$upstream"
  fi
}

# 2. How much work is sitting in the tree.
#
# One porcelain line is one path, so counting lines counts files: a path that is
# both staged and modified is a single entry, which is what the model needs to
# know. An untracked directory also collapses to one entry, and asking for the
# files inside it would mean walking trees that '.gitignore' exists to avoid.
line_worktree() {
  local status rc count
  status="$(git_q status --porcelain)"
  rc=$?
  [ "$rc" -eq 0 ] || return 0

  if is_blank "$status"; then
    printf 'Working tree clean\n'
    return 0
  fi

  count="$(printf '%s\n' "$status" | awk 'END {print NR + 0}')"
  if [ "$count" -eq 1 ]; then
    printf 'Uncommitted: 1 file\n'
  else
    printf 'Uncommitted: %s files\n' "$count"
  fi
}

# 3. What landed recently, on one line.
#
# Subjects are the cheapest signal for what the last session was doing. They are
# truncated because a repository with a commit template can carry subjects long
# enough to crowd out everything else on this list.
line_commits() {
  local subjects
  subjects="$(git_q log -n "$SUBJECT_COUNT" --pretty=format:%s |
    awk -v sep=' · ' -v limit="$SUBJECT_WIDTH" '
      {
        subject = $0
        if (length(subject) > limit) subject = substr(subject, 1, limit - 3) "..."
        line = (NR == 1 ? subject : line sep subject)
      }
      END { if (NR > 0) print line }
    ')"
  is_blank "$subjects" && return 0
  printf 'Recent: %s\n' "$subjects"
}

# 4. Which of the contract targets the project implements.
#
# Detection is post-edit.sh's, deliberately: the model should be told exactly
# what that hook will find when it next fires. Reading the Makefile rather than
# probing with make keeps this a file read, and a project implementing none of
# the contract never sees a make process at all. A target reachable only through
# an 'include' is missed here too -- the same accepted limitation.
line_make() {
  local makefile="" candidate target found=""

  for candidate in GNUmakefile makefile Makefile; do
    if [ -f "$root_abs/$candidate" ]; then
      makefile="$root_abs/$candidate"
      break
    fi
  done

  if [ -z "$makefile" ]; then
    printf 'Make contract: none\n'
    return 0
  fi

  # ':=' and '::=' open a variable assignment rather than a rule, and a comment
  # cannot begin at column 0 with the target name.
  for target in check check-file test; do
    if grep -Eq "^${target}[[:space:]]*(::?[^:=]|::?\$)" "$makefile" 2>/dev/null; then
      found="${found:+$found, }$target"
    fi
  done

  printf 'Make contract: %s\n' "${found:-none}"
}

# 5. A settings file the harness could not read.
#
# This one is worth a line because the failure is silent everywhere else: the
# session simply runs without the permissions the user believes they granted,
# usually after a hand edit that left the file truncated.
line_settings() {
  local settings="$root_abs/.claude/settings.local.json"
  [ -f "$settings" ] || return 0

  # Bounded read: anything past this is certainly not whitespace-only, so the
  # cut cannot change the verdict.
  if is_blank "$(head -c 65536 "$settings" 2>/dev/null)"; then
    printf 'Warning: .claude/settings.local.json is empty\n'
    return 0
  fi

  command -v jq >/dev/null 2>&1 || return 0
  jq empty "$settings" >/dev/null 2>&1 ||
    printf 'Warning: .claude/settings.local.json is not valid JSON\n'
}

line_branch
line_worktree
line_commits
line_make
line_settings

exit 0
