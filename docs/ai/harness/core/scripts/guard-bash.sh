#!/usr/bin/env bash
#
# PreToolUse guard for the Bash tool.
#
# Reads the hook payload on stdin, inspects .tool_input.command only, and denies
# a fixed set of irreversible commands by printing a permission decision on
# stdout. Anything else is allowed silently (no output, exit 0).
#
# Fails closed: an empty, unparseable or command-less payload is denied, as is a
# missing jq. Never exits 1 or 2 -- those are read as hook errors and fail open.
#
# The command is tokenized once by awk, which tracks quote state. Rules then run
# over tokens and are anchored to the command word, so text inside a quoted
# argument (a commit message, an echo, a grep pattern) can never trigger a
# block, and a long command stays linear rather than quadratic.

set -uo pipefail

DENY_NO_JQ='{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"guard-bash: jq is not installed, so this Bash command could not be inspected. The guard fails closed and denies everything until it can read the payload. Safe alternative: install jq (brew install jq, or apt-get install jq) and re-run the command."}}'

# Emits the deny decision and stops. Exit 0 is deliberate: the JSON body carries
# the decision, a non-zero exit would be treated as a hook failure instead.
deny() {
  jq -cn --arg reason "$1" \
    '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$reason}}'
  exit 0
}

# True when $1 is empty or nothing but whitespace. A glob test rather than a
# pattern substitution, which is quadratic on bash 3.2 and would blow the hook
# timeout on multi-kilobyte commands.
is_blank() {
  case "$1" in
    *[![:space:]]*) return 1 ;;
    *) return 0 ;;
  esac
}

if ! command -v jq >/dev/null 2>&1; then
  printf '%s\n' "$DENY_NO_JQ"
  exit 0
fi

payload="$(cat)"

if is_blank "$payload"; then
  deny "guard-bash: the PreToolUse payload was empty, so the Bash command could not be inspected. The guard fails closed. Safe alternative: re-run the command once the hook receives a valid payload; if this repeats, the hook wiring in the core plugin's hooks.json is broken and has to be fixed before Bash can be used."
fi

if ! cmd="$(printf '%s' "$payload" |
  jq -r 'if (.tool_input.command | type) == "string" then .tool_input.command else "" end' 2>/dev/null)"; then
  deny "guard-bash: the PreToolUse payload was not valid JSON, so the Bash command could not be inspected. The guard fails closed. Safe alternative: report this to the user and ask them to check the hook wiring -- retrying the same Bash call will be denied again until the payload is well formed."
fi

if is_blank "$cmd"; then
  deny "guard-bash: the PreToolUse payload carried no .tool_input.command string, so there was nothing to inspect. The guard fails closed. Safe alternative: re-issue the Bash call with an explicit, non-empty command string."
fi

SESSION_CWD="$(printf '%s' "$payload" | jq -r '.cwd // ""' 2>/dev/null)"
[ -n "${SESSION_CWD:-}" ] || SESSION_CWD="${CLAUDE_PROJECT_DIR:-}"
[ -n "$SESSION_CWD" ] || SESSION_CWD="$PWD"

# ---------------------------------------------------------------------------
# Tokenizer
# ---------------------------------------------------------------------------
#
# Splits the command into segments and each segment into tokens, tracking quote
# state so that separators and redirections inside quotes stay literal text.
# Heredoc bodies and comments are dropped -- they are data, not commands. Output
# is one item per line so the reader never has to split on a separator character:
#   S<C|P>  starts a segment (P when it follows a pipe, C for any other boundary)
#   w<text> a word token
#   r<op>   a redirection operator
#   Z       end of input, flushes the last segment

# shellcheck disable=SC2016  # awk program: must reach awk unexpanded
AWK_TOKENIZE='
function flushtok() {
  if (has) { gsub(/\n/, " ", tok); print "w" tok; tok = ""; has = 0 }
}
function endseg(newsep) {
  flushtok(); print "S" newsep
}
BEGIN {
  SQC = sprintf("%c", 39); DQC = sprintf("%c", 34)
  state = 0; tok = ""; has = 0; skipping = 0; buf = ""
  print "SC"
}
{
  line = $0
  if (skipping) {
    t = line; sub(/^[ \t]*/, "", t); sub(/[ \t]*$/, "", t)
    if (t == hd) { skipping = 0 }
    next
  }
  buf = buf line "\n"
  if (match(line, /<<-?[ \t]*[^ \t<>&|;()]+/)) {
    s = substr(line, RSTART, RLENGTH)
    sub(/^<<-?[ \t]*/, "", s)
    gsub(SQC, "", s); gsub(DQC, "", s)
    if (s ~ /^[A-Za-z_][A-Za-z0-9_]*$/) { hd = s; skipping = 1 }
  }
}
END {
  n = length(buf); i = 1
  while (i <= n) {
    c = substr(buf, i, 1)
    if (state == 1) {
      if (c == SQC) { state = 0 } else { tok = tok c; has = 1 }
      i++; continue
    }
    if (state == 2) {
      if (c == "\\") {
        d = substr(buf, i + 1, 1)
        if (d == "\n") { i += 2; continue }
        if (d == "$" || d == DQC || d == "\\") { tok = tok d; has = 1; i += 2; continue }
        tok = tok c; has = 1; i++; continue
      }
      if (c == DQC) { state = 0; i++; continue }
      tok = tok c; has = 1; i++; continue
    }
    if (c == "\\") {
      d = substr(buf, i + 1, 1)
      if (d == "\n") { i += 2; continue }
      if (d == "") { i++; continue }
      tok = tok d; has = 1; i += 2; continue
    }
    if (c == SQC) { state = 1; has = 1; i++; continue }
    if (c == DQC) { state = 2; has = 1; i++; continue }
    # A word-initial # comments out the rest of the line. Mid-word (a/b#c) it is
    # literal, so has == 0 is the whole test. The newline is left in place: it
    # still has to end the segment.
    if (c == "#" && has == 0) {
      while (i <= n && substr(buf, i, 1) != "\n") { i++ }
      continue
    }
    if (c == ">" || c == "<" || (c == "&" && substr(buf, i + 1, 1) == ">")) {
      flushtok(); op = ""
      while (i <= n) {
        e = substr(buf, i, 1)
        if (e == ">" || e == "<" || e == "&" || e == "|") { op = op e; i++ } else { break }
        if (length(op) >= 3) { break }
      }
      print "r" op; continue
    }
    if (c == "|") {
      if (substr(buf, i + 1, 1) == "|") { endseg("C"); i += 2 } else { endseg("P"); i++ }
      continue
    }
    if (c == "&") {
      if (substr(buf, i + 1, 1) == "&") { endseg("C"); i += 2 } else { endseg("C"); i++ }
      continue
    }
    if (c == ";" || c == "(" || c == ")" || c == "\n" || c == "`") { endseg("C"); i++; continue }
    if (c == " " || c == "\t") { flushtok(); i++; continue }
    tok = tok c; has = 1; i++
  }
  flushtok(); print "Z"
}
'

# ---------------------------------------------------------------------------
# Target predicates
# ---------------------------------------------------------------------------

# True when $1 names a .env file holding real secrets. Placeholder templates are
# excluded so the "write the example file instead" advice below stays usable, and
# so are names whose real extension is a log or config type (build.env.log,
# docker-compose.env.yml), which are not dotenv files at all.
is_env_file() {
  local base="${1##*/}"
  case "$base" in
    .env) return 0 ;;
    .env.*)
      local suffix="${base#.env.}"
      case "$suffix" in
        *.*) return 1 ;;
        example | sample | template | dist | defaults) return 1 ;;
        log | yml | yaml | json | txt | md | new | tmp | lock) return 1 ;;
        *) return 0 ;;
      esac
      ;;
    *.env) return 0 ;;
    *) return 1 ;;
  esac
}

deny_env_write() {
  deny "guard-bash: blocked a write into the .env file '$1'. Redirecting or tee-ing into a .env file overwrites live secrets that are not in version control and cannot be recovered. Safe alternative: write the placeholder instead ('.env.example' and similar template names are not blocked), or ask the user to edit '$1' themselves. Reading is not blocked -- 'cat $1' and 'grep ... $1' still work."
}

deny_rm_target() {
  deny "guard-bash: blocked a recursive rm targeting '$1'. Deleting the filesystem root, the home directory or the project directory itself destroys data that no VCS or backup step here can restore. Safe alternative: name the specific subdirectory you actually want gone, for example 'rm -rf ./node_modules' or 'rm -rf ./dist'. Never pass /, ~, \$HOME or \$CLAUDE_PROJECT_DIR itself to rm -r."
}

RE_TARGET_ROOT='^/+[*.]*$'
# shellcheck disable=SC2016  # matches the literal text $HOME in the command
RE_TARGET_HOME='^(~|\$HOME)/*\**$'
# shellcheck disable=SC2016  # matches the literal text $CLAUDE_PROJECT_DIR
RE_TARGET_PROJECT='^\$CLAUDE_PROJECT_DIR/*\**$'

check_rm_target() {
  local tok="$1" norm="$1"
  # shellcheck disable=SC2016  # literal brace strings used to normalize ${VAR}
  local open='${' close='}'
  norm="${norm//$open/\$}"
  norm="${norm//$close/}"

  if [[ $norm =~ $RE_TARGET_ROOT ]] ||
    [[ $norm =~ $RE_TARGET_HOME ]] ||
    [[ $norm =~ $RE_TARGET_PROJECT ]]; then
    deny_rm_target "$tok"
  fi

  while [ -n "$norm" ]; do
    case "$norm" in
      *'*') norm="${norm%'*'}" ;;
      */) norm="${norm%/}" ;;
      *) break ;;
    esac
  done

  if [ -n "${HOME:-}" ] && [ "$HOME" != "/" ] && [ "$norm" = "${HOME%/}" ]; then
    deny_rm_target "$tok"
  fi
  if [ -n "${CLAUDE_PROJECT_DIR:-}" ] && [ "$CLAUDE_PROJECT_DIR" != "/" ] &&
    [ "$norm" = "${CLAUDE_PROJECT_DIR%/}" ]; then
    deny_rm_target "$tok"
  fi
}

# Denies git reset --hard only when the target work tree has changes that exist
# nowhere but on disk. $1 is a 'git -C' value if the command carried one, $2 the
# directory the command actually runs in.
check_reset_hard() {
  local gitdir="$1" track="$2" dir status
  if [ -n "$gitdir" ]; then
    case "$gitdir" in
      /*) dir="$gitdir" ;;
      *) dir="$track/$gitdir" ;;
    esac
  else
    dir="$track"
  fi

  if ! command -v git >/dev/null 2>&1; then
    deny "guard-bash: blocked 'git reset --hard' because git is not on PATH, so the guard could not check whether uncommitted work would be destroyed. The guard fails closed. Safe alternative: run 'git stash push -u' from a shell where git is available, then retry the reset."
  fi

  git -C "$dir" rev-parse --is-inside-work-tree >/dev/null 2>&1 || return 0

  git -C "$dir" diff --quiet >/dev/null 2>&1
  status=$?
  if [ "$status" -eq 1 ]; then
    deny "guard-bash: blocked 'git reset --hard' while the working tree in '$dir' has unstaged changes. Those edits exist only on disk -- not in the index and not in any commit -- so the reset would delete them with no way back. Safe alternative: save them first in the same command, which this guard allows: 'git stash push -u && git reset --hard' (recover with 'git stash pop'), or commit them on a scratch branch."
  elif [ "$status" -ne 0 ]; then
    deny "guard-bash: blocked 'git reset --hard' because 'git diff --quiet' in '$dir' failed, so the guard could not tell whether uncommitted work would be destroyed. The guard fails closed. Safe alternative: run 'git status' to see what state the repository is in, save anything unsaved with 'git stash push -u', then retry."
  fi
}

# ---------------------------------------------------------------------------
# Rule evaluation
# ---------------------------------------------------------------------------

# Tokenizes $1 and applies every rule to it. Recurses one level into 'sh -c' and
# 'eval' payloads so those cannot be used to smuggle a blocked command past the
# command-word anchoring; $2 is the recursion depth.
scan_command() {
  local raw="$1" depth="$2"
  [ "$depth" -gt 3 ] && return 0

  local tokenized
  tokenized="$(printf '%s' "$raw" | awk "$AWK_TOKENIZE")"
  [ -n "$tokenized" ] || return 0

  local pipe_fetch=0 saved_work=0
  local cwd_track="$SESSION_CWD"
  local line kind text
  local words=() sep="C" next_sep="C" expect_target=0 have_seg=0

  while IFS= read -r line; do
    kind="${line:0:1}"
    text="${line:1}"

    if [ "$kind" = "r" ]; then
      case "$text" in
        *'>'*) expect_target=1 ;;
        *) expect_target=0 ;;
      esac
      continue
    fi

    if [ "$kind" = "w" ]; then
      if [ "$expect_target" -eq 1 ]; then
        expect_target=0
        is_env_file "$text" && deny_env_write "$text"
      fi
      words[${#words[@]}]="$text"
      continue
    fi

    # S or Z: evaluate the segment that just ended, then start the next one.
    next_sep="$text"
    if [ "$have_seg" -eq 0 ] || [ ${#words[@]} -eq 0 ]; then
      words=()
      expect_target=0
      have_seg=1
      sep="$next_sep"
      continue
    fi

    # Resolve the command word, stepping over environment assignments, shell
    # keywords and transparent wrappers so '/bin/rm', 'sudo -u root rm' and
    # 'env FOO=1 git' are recognised as rm and git.
    local ci=0 cw="" w base
    while [ "$ci" -lt ${#words[@]} ]; do
      w="${words[ci]}"
      base="${w##*/}"
      if [[ $w =~ ^[A-Za-z_][A-Za-z0-9_]*= ]]; then
        ci=$((ci + 1))
        continue
      fi
      case "$base" in
        '{' | '}' | '!' | then | do | done | else | elif | fi | if | while | until)
          ci=$((ci + 1))
          continue
          ;;
        env | command | builtin | nohup | time | nice | exec | stdbuf | setsid)
          ci=$((ci + 1))
          while [ "$ci" -lt ${#words[@]} ] && [[ ${words[ci]} == -* ]]; do ci=$((ci + 1)); done
          continue
          ;;
        sudo | doas)
          ci=$((ci + 1))
          while [ "$ci" -lt ${#words[@]} ] && [[ ${words[ci]} == -* ]]; do
            case "${words[ci]}" in
              -u | -g | -p | -C | -h | -r | -t | -U) ci=$((ci + 2)) ;;
              *) ci=$((ci + 1)) ;;
            esac
          done
          continue
          ;;
        xargs)
          ci=$((ci + 1))
          while [ "$ci" -lt ${#words[@]} ] && [[ ${words[ci]} == -* ]]; do
            case "${words[ci]}" in
              -n | -I | -i | -P | -d | -s | -a | -L) ci=$((ci + 2)) ;;
              *) ci=$((ci + 1)) ;;
            esac
          done
          continue
          ;;
        *)
          cw="$base"
          break
          ;;
      esac
    done

    # --- 5. remote fetch piped into a shell -------------------------------
    if [ "$sep" = "P" ]; then
      case "$cw" in
        sh | bash | zsh)
          if [ "$pipe_fetch" -eq 1 ]; then
            deny "guard-bash: blocked piping a remote download into a shell (curl/wget | sh). This runs unreviewed remote code with your full privileges, and the content can change between the moment it is read and the moment it is run. Safe alternative: download it first, read it, then run it -- 'curl -fsSL <url> -o /tmp/install.sh', inspect /tmp/install.sh, then 'bash /tmp/install.sh'. For packages prefer the platform manager (brew, apt, npm)."
          fi
          ;;
      esac
    else
      pipe_fetch=0
    fi
    case "$cw" in
      curl | wget) pipe_fetch=1 ;;
    esac

    local ai target

    case "$cw" in
      git)
        # Skip git's own global options to find the subcommand.
        local gi=$((ci + 1)) sub="" gitdir=""
        while [ "$gi" -lt ${#words[@]} ]; do
          case "${words[gi]}" in
            -C)
              gitdir="${words[$((gi + 1))]:-}"
              gi=$((gi + 2))
              ;;
            -c) gi=$((gi + 2)) ;;
            -*) gi=$((gi + 1)) ;;
            *)
              sub="${words[gi]}"
              break
              ;;
          esac
        done

        # --- 1. force push ------------------------------------------------
        if [ "$sub" = "push" ]; then
          local forced=0
          for ((ai = gi + 1; ai < ${#words[@]}; ai++)); do
            case "${words[ai]}" in
              --force-with-lease | --force-with-lease=* | --force-if-includes) ;;
              --force) forced=1 ;;
              --*) ;;
              -*) [[ ${words[ai]} =~ ^-[a-zA-Z0-9]*f[a-zA-Z0-9]*$ ]] && forced=1 ;;
            esac
          done
          if [ "$forced" -eq 1 ]; then
            deny "guard-bash: blocked 'git push --force' (or -f). An unconditional force push overwrites remote commits that were never fetched, silently destroying work pushed by someone else. Safe alternative: use 'git push --force-with-lease', which aborts if the remote moved since your last fetch. If the remote branch genuinely has to be discarded, ask the user to run the plain force push themselves."
          fi
        fi

        # --- 4. git reset --hard over unstaged work -----------------------
        if [ "$sub" = "reset" ] && [ "$saved_work" -eq 0 ]; then
          for ((ai = gi + 1; ai < ${#words[@]}; ai++)); do
            if [ "${words[ai]}" = "--hard" ]; then
              check_reset_hard "$gitdir" "$cwd_track"
              break
            fi
          done
        fi

        # An earlier stash or commit in the same command already put the work
        # somewhere recoverable, so a later reset --hard is not destructive.
        case "$sub" in
          stash | commit) saved_work=1 ;;
        esac
        ;;

      rm)
        # --- 2. recursive rm of /, ~, $HOME or $CLAUDE_PROJECT_DIR --------
        local recursive=0
        for ((ai = ci + 1; ai < ${#words[@]}; ai++)); do
          case "${words[ai]}" in
            --recursive) recursive=1 ;;
            --*) ;;
            -*) [[ ${words[ai]} =~ ^-[a-zA-Z0-9]*[rR][a-zA-Z0-9]*$ ]] && recursive=1 ;;
          esac
        done
        if [ "$recursive" -eq 1 ]; then
          for ((ai = ci + 1; ai < ${#words[@]}; ai++)); do
            case "${words[ai]}" in
              -*) ;;
              *) check_rm_target "${words[ai]}" ;;
            esac
          done
        fi
        ;;

      tee)
        # --- 3. tee into a .env file (redirections handled above) ---------
        for ((ai = ci + 1; ai < ${#words[@]}; ai++)); do
          case "${words[ai]}" in
            -*) ;;
            *) is_env_file "${words[ai]}" && deny_env_write "${words[ai]}" ;;
          esac
        done
        ;;

      cd)
        target="${words[$((ci + 1))]:-}"
        case "$target" in
          '' | -*) ;;
          /*) cwd_track="$target" ;;
          *) cwd_track="$cwd_track/$target" ;;
        esac
        ;;
    esac

    # Look inside 'sh -c ...' and 'eval ...' so the anchoring above cannot be
    # sidestepped by wrapping the command in another shell.
    case "$cw" in
      sh | bash | zsh | ksh)
        for ((ai = ci + 1; ai < ${#words[@]}; ai++)); do
          if [ "${words[ai]}" = "-c" ]; then
            scan_command "${words[$((ai + 1))]:-}" $((depth + 1))
            break
          fi
        done
        ;;
      eval)
        local joined=""
        for ((ai = ci + 1; ai < ${#words[@]}; ai++)); do
          joined="$joined ${words[ai]}"
        done
        scan_command "$joined" $((depth + 1))
        ;;
    esac

    words=()
    expect_target=0
    sep="$next_sep"
  done <<<"$tokenized"
}

scan_command "$cmd" 1

exit 0
