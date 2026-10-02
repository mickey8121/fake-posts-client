#!/usr/bin/env bash
#
# PostToolUse check hook for the Edit and Write tools.
#
# Runs the project's own check over the file that was just edited and hands the
# failure back to the model, so an error is fixed in the same turn instead of
# surfacing at ship time. This is a quality gate, not a security gate.
#
# The check is resolved through make, never through a hardcoded toolchain --
# this plugin runs in repositories with different stacks:
#   1. 'make check-file FILE=<path>' when the Makefile defines that target
#   2. 'make check'                  when it defines that one
#   3. otherwise nothing happens
#
# FILE is relative to the project root and make runs from there, so a recipe can
# write 'eslint "$(FILE)"' and have both the path and the tool's config resolve
# the way they would in a terminal.
#
# Targets are found by reading the Makefile rather than by probing with
# 'make -n': the probe would itself be an invocation, and a project that defines
# neither target must not see a make process at all. Once a rule is found, a dry
# run confirms it before make is asked to run it for effect, so a target that
# does not really exist is never invoked.
#
# Known limitation, accepted deliberately: a target reachable only through an
# 'include' is not seen here, so the hook stays silent on such a project. The
# templates in this kit ship a flat Makefile, and failing open beats guessing.
#
# Fails open everywhere else too. Missing jq, missing make, an unreadable
# payload, a check that hangs -- all exit 0 without a word. That is the opposite
# default from guard-bash.sh, and it is deliberate: a wrong block there is
# cheap, while a broken quality gate that paralyses editing is not.
#
# Success is equally silent. A "check passed" line on every edit would spend the
# model's context to say nothing.
#
# Exit 2 carries a failure. PostToolUse cannot undo the edit, so exit 2 is not a
# block -- it is feedback the model reads.

set -uo pipefail

MAX_LINES=50

# Budget for the whole script, not for one make call -- the dry run and the real
# run share it, so the worst case stays under the timeout on the hook entry
# however many times make has to be started. A junk value falls back to the
# default rather than making every check time out silently.
TIMEOUT="${CLAUDE_POST_EDIT_TIMEOUT:-10}"
case "$TIMEOUT" in
  '' | *[!0-9]* | 0) TIMEOUT=10 ;;
esac

# Seconds since the epoch, or 0 when date is unavailable -- the budget then
# degrades to per-invocation instead of breaking the arithmetic.
now() {
  local seconds
  seconds="$(date +%s 2>/dev/null)"
  case "$seconds" in
    '' | *[!0-9]*) printf '0' ;;
    *) printf '%s' "$seconds" ;;
  esac
}

# True when $1 is empty or nothing but whitespace. A glob test rather than a
# pattern substitution, which is quadratic on bash 3.2.
is_blank() {
  case "$1" in
    *[![:space:]]*) return 1 ;;
    *) return 0 ;;
  esac
}

command -v jq >/dev/null 2>&1 || exit 0

payload="$(cat)"
is_blank "$payload" && exit 0

file_path="$(printf '%s' "$payload" |
  jq -r 'if (.tool_input.file_path | type) == "string" then .tool_input.file_path else "" end' 2>/dev/null)" || exit 0
is_blank "$file_path" && exit 0

# Extension gate first: everything else leaves before any filesystem probing.
case "$file_path" in
  *.ts | *.tsx | *.js | *.jsx | *.mjs) ;;
  *) exit 0 ;;
esac

root="${CLAUDE_PROJECT_DIR:-}"
if is_blank "$root"; then
  root="$(printf '%s' "$payload" | jq -r '.cwd // ""' 2>/dev/null)" || exit 0
fi
is_blank "$root" && exit 0

# Resolves a directory to its physical path, or nothing when it does not exist.
# Both sides of the containment test below go through this, so a project reached
# by way of a symlink still compares equal.
abs_dir() {
  (cd "$1" 2>/dev/null && pwd -P)
}

root_abs="$(abs_dir "$root")"
[ -n "$root_abs" ] || exit 0

case "$file_path" in
  /*) ;;
  *) file_path="$root_abs/$file_path" ;;
esac

file_dir="$(abs_dir "$(dirname "$file_path")")"
[ -n "$file_dir" ] || exit 0
file_abs="$file_dir/$(basename "$file_path")"

# '..' is already gone by now, so this also covers a path that tried to climb
# out of the project before coming back down somewhere else.
case "$file_abs" in
  "$root_abs"/*) ;;
  *) exit 0 ;;
esac
rel="${file_abs#"$root_abs"/}"

for segment in node_modules .next dist build coverage; do
  case "/$rel/" in
    */"$segment"/*) exit 0 ;;
  esac
done

makefile=""
for candidate in GNUmakefile makefile Makefile; do
  if [ -f "$root_abs/$candidate" ]; then
    makefile="$root_abs/$candidate"
    break
  fi
done
[ -n "$makefile" ] || exit 0

command -v make >/dev/null 2>&1 || exit 0

# True when the Makefile opens a rule for $1 at the start of a line. ':=' and
# '::=' are variable assignments rather than rules, and a comment cannot begin
# at column 0 with the target name.
defines_target() {
  grep -Eq "^$1[[:space:]]*(::?[^:=]|::?\$)" "$makefile" 2>/dev/null
}

if defines_target check-file; then
  target=check-file
  set -- check-file "FILE=$rel"
elif defines_target check; then
  target=check
  set -- check
else
  exit 0
fi

output="$(mktemp "${TMPDIR:-/tmp}/post-edit.XXXXXX")" || exit 0
trap 'rm -f "$output"' EXIT

cd "$root_abs" 2>/dev/null || exit 0

DEADLINE=$(($(now) + TIMEOUT))

# Runs "$@" with its output collected in $output and a watchdog on top. Returns
# the command's status, or 124 when the watchdog had to step in or the shared
# budget was already spent.
#
# Job control is switched on for the launch so the check becomes a process group
# leader. The kill then reaches everything the recipe spawned, including a child
# it orphaned -- a plain 'kill $pid' would leave those running. The redirection
# on the function body keeps bash's own job notices off the hook's stderr.
run_guarded() {
  local pid watcher status remaining
  remaining=$((DEADLINE - $(now)))
  [ "$remaining" -gt 0 ] || return 124
  set -m
  "$@" >"$output" 2>&1 &
  pid=$!
  set +m
  (
    sleep "$remaining"
    kill -TERM "-$pid" 2>/dev/null
    sleep 1
    kill -KILL "-$pid" 2>/dev/null
  ) &
  watcher=$!
  wait "$pid"
  status=$?
  kill "$watcher" 2>/dev/null
  wait "$watcher" 2>/dev/null
  [ "$status" -gt 128 ] && return 124
  # timeout is decided by the wall clock, not by the exit status — make 4.x converts a group TERM into a plain status 2
  [ "$(now)" -ge "$DEADLINE" ] && return 124 
  return "$status"
} 2>/dev/null

run_guarded make -n "$@" || exit 0

run_guarded make "$@"
status=$?
[ "$status" -eq 0 ] && exit 0
[ "$status" -eq 124 ] && exit 0

total="$(awk 'END {print NR + 0}' "$output")"
if [ "$total" -eq 0 ]; then
  printf 'post-edit: make %s failed for %s without printing anything\n' "$target" "$rel" >&2
  exit 2
fi

# awk rather than head so a final line without a newline cannot run into the
# marker below.
awk -v limit="$MAX_LINES" 'NR <= limit { print }' "$output" >&2
# The only reader here is the model. Without this line it would see 50 errors
# out of 200, fix them, and believe it was finished.
if [ "$total" -gt "$MAX_LINES" ]; then
  printf '... output truncated (%s more lines)\n' "$((total - MAX_LINES))" >&2
fi
exit 2
