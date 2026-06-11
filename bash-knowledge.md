# Bash Knowledge

A personal reference for writing safe, maintainable bash scripts.

---

## Shebang

```bash
#!/usr/bin/env bash   # preferred — asks env to find bash in PATH (portable)
#!/bin/bash           # hardcoded — fails if bash isn't at /bin/bash (NixOS, some macOS)
```

Use `#!/usr/bin/env bash` by default.

---

## Strict Mode

```bash
set -euo pipefail
```

| Flag | Long form         | Effect                                                  |
| ---- | ----------------- | ------------------------------------------------------- |
| `-e` | `set -o errexit`  | exit immediately if any command fails (non-zero exit)   |
| `-u` | `set -o nounset`  | treat use of an unset variable as an error              |
| -    | `set -o pipefail` | a pipe fails if ANY command in it fails (no short form) |

```bash
# Why pipefail matters:
cat file.txt | grep "x" | sort
# Without pipefail: if cat fails, the pipe's exit code is sort's (probably 0) → failure hidden
# With pipefail:    the pipe's exit code reflects the first failing command
```

`pipefail` has no single-letter shorthand — `set -o pipefail` is the only spelling.

---

## Variables

```bash
NAME="deploy"        # correct — NO spaces around =
NAME = "deploy"      # WRONG — bash thinks NAME is a command

echo "$NAME"         # read with $ — always double-quote
echo "${NAME}name"   # braces isolate the variable name from surrounding text
echo "$NAMEname"     # empty — bash looks for a variable called NAMEname
```

---

## Quoting — the most important quirk

```bash
NAME="John Doe"

echo $NAME           # works here but dangerous — splits on spaces into 2 words
echo "$NAME"         # John Doe — expands, spaces preserved
echo '$NAME'         # $NAME — single quotes = literal, NO expansion

FILE="my file.txt"
rm $FILE             # WRONG — tries to delete "my" AND "file.txt"
rm "$FILE"           # correct — one argument
```

**Rule of thumb: always double-quote variables.** Exceptions are rare.

---

## Variable Expansion Forms

The colon `:` means "also treat empty as unset". Without `:`, only truly unset triggers it.

```bash
VAR="hello"   EMPTY=""   # UNSET = never assigned

# ${VAR:-default}  → use VAR if set+non-empty, else "default"
echo "${VAR:-fallback}"     # hello
echo "${EMPTY:-fallback}"   # fallback
echo "${UNSET:-fallback}"   # fallback

# ${VAR-default}   → use VAR if set (even if empty), else "default"
echo "${EMPTY-fallback}"    # (empty)
echo "${UNSET-fallback}"    # fallback

# ${VAR:+replacement}  → "replacement" if VAR set+non-empty, else "" (opposite of :-)
echo "${VAR:+found}"        # found
echo "${EMPTY:+found}"      # (empty)

# ${VAR:?message}  → use VAR if set+non-empty, else print message and EXIT
echo "${VAR:?must be set}"  # hello
echo "${UNSET:?must be set}"# exits: "UNSET: must be set"
```

### The `${VAR+x}` pattern (safe checks under `set -u`)

```bash
# +x expands to "x" if VAR is set, "" if unset — never touches VAR directly,
# so it won't crash under set -u
if [[ -z "${VAR+x}" ]]; then echo "VAR is unset"; fi
if [[ -n "${VAR+x}" ]]; then echo "VAR is set (maybe empty)"; fi
if [[ -n "${VAR:+x}" ]]; then echo "VAR is set AND non-empty"; fi
```

`x` is just a conventional placeholder — any non-empty string works.

---

## `if` Statements

```bash
if CONDITION; then
  # true branch
elif OTHER; then
  # else-if branch
else
  # fallback
fi
```

The `;` before `then` is just a line separator — `if CONDITION; then` and
`if CONDITION` / newline / `then` are identical.

### `if` tests an EXIT CODE, not a value

`0` = success/true, anything else = failure/false (opposite of most languages).
Any command can follow `if` — no brackets required:

```bash
if command -v docker &>/dev/null; then echo "docker exists"; fi
if grep -q "x" file;            then echo "found"; fi
if id "deploy" &>/dev/null;     then echo "user exists"; fi
```

Here `&>/dev/null` silences the command's normal output — you only care about the
exit code (does the user exist? yes/no), not the text it would print.

Check the last exit code manually with `$?`:

```bash
ls /some/path
echo $?    # 0 if ls succeeded, non-zero if it failed
```

---

## `[ ]` vs `[[ ]]`

```bash
# [ ]  — POSIX, portable, quirky
# [[ ]] — bash-only, safer, more features. PREFER THIS.

if [ "$NAME" = "deploy" ];  then ...   # = (single) in [ ]
if [[ "$NAME" == "deploy" ]]; then ... # == works in [[ ]]
if [[ "$NAME" == dep* ]];    then ...  # glob matching — [[ ]] only

# [ ] needs variables quoted or it breaks on empty/spaces:
if [ $NAME = "deploy" ];   then ...    # dangerous
if [ "$NAME" = "deploy" ]; then ...    # safe
# [[ ]] is safe even unquoted (but quote anyway out of habit)
```

You can NOT put a plain command inside `[[ ]]`:

```bash
if [[ command -v docker ]]; then ...   # WRONG — [[ ]] wants a test expression
if command -v docker; then ...         # correct
```

---

## Common Test Conditions

```bash
# Strings
[[ -z "$VAR" ]]      # true if EMPTY (zero length)
[[ -n "$VAR" ]]      # true if NON-empty
[[ "$A" == "$B" ]]   # equal
[[ "$A" != "$B" ]]   # not equal

# Files
[ -f "/path" ]       # exists and is a regular file
[ -d "/path" ]       # exists and is a directory
[ -r "/path" ]       # readable
[ -s "/path" ]       # exists AND is non-empty
[ ! -f "/path" ]     # ! negates — does NOT exist

# Numbers — -eq -ne -lt -gt -le -ge
[[ $N -eq 0 ]]       # equal
[[ $N -ne 0 ]]       # not equal
[[ $N -gt 5 ]]       # greater than
[[ $N -lt 10 ]]      # less than
[[ $N -le 10 ]]      # less than or equal
[[ $N -ge 5 ]]       # greater than or equal
```

---

## `&&` and `||`

```bash
apt update && apt install docker   # install only if update succeeded
rm file.txt || true                # if rm fails, || true forces success (survives set -e)
mkdir /dir || echo "exists"
command -v docker &>/dev/null && echo "yes" || echo "no"
```

---

## Arithmetic

```bash
COUNT=$((COUNT + 1))          # arithmetic expansion — no $ needed on inner vars
(( COUNT++ ))                 # statement form, increments in place
(( COUNT > 5 )) && echo "big" # arithmetic as a condition
RESULT=$(( (A + B) * 2 ))     # + - * / % ** ( )
```

`$(( ))` is INTEGER ONLY — no floats. For decimals use `awk` or `bc`.

---

## Redirection Operators

```bash
# Output
command > file       # stdout → file (overwrite)
command >> file      # stdout → file (append)
command 2> file      # stderr → file (overwrite)
command 2>> file     # stderr → file (append)
command &> file      # BOTH stdout+stderr → file (overwrite)
command &>> file     # BOTH → file (append)
command 2>&1         # send stderr to wherever stdout currently goes
command > file 2>&1  # ORDER MATTERS: stdout→file first, then stderr→same place

# Input
command < file       # file contents → stdin

# Here-document — multi-line stdin until the delimiter
cat << EOF
line one
$HOME expands here
EOF

cat << 'EOF'
$HOME printed literally (quoted delimiter = no expansion)
EOF

# Here-string — a single string → stdin
grep "word" <<< "this string has the word"
wc -w <<< "count these words"   # 3

# Pipes
cmd1 | cmd2          # stdout of cmd1 → stdin of cmd2
cmd1 |& cmd2         # stdout AND stderr of cmd1 → stdin of cmd2
```

Memorize first: `>` `>>` `2>` `&>` `|` `<<<`

### stdin / stdout / stderr (the three streams)

Every program has three default channels, numbered as file descriptors:

- **stdin (fd 0)** — the inbox. Default source: keyboard. Replaced by `< file`.
- **stdout (fd 1)** — the outbox for normal results. Default: terminal. Redirected by `>`.
- **stderr (fd 2)** — a SEPARATE outbox for errors/warnings. Default: terminal too,
  but kept distinct so you can redirect it independently. (This is why Docker
  Compose warnings still appear even when you redirect normal output.)

---

## `tee` — write to a file AND stdout at once

```bash
command | tee log.txt        # shows output AND saves it
command | tee -a log.txt     # append instead of overwrite
command | tee file > /dev/null  # save only, suppress the stdout copy
```

The killer use: writing a root-owned file via sudo, where a plain `>` redirect
would run in YOUR shell and be denied:

```bash
sudo cat << EOF > /etc/some.conf   # FAILS — redirect runs as non-root
sudo tee /etc/some.conf << EOF     # WORKS — tee itself runs as root
```

---

## Process Substitution `<(cmd)`

Turns a command's OUTPUT into a temporary FILENAME (a live pipe like `/dev/fd/63`),
so commands that expect file arguments can read command output:

```bash
diff <(echo -e "a\nb\nc") <(echo -e "a\nx\nc")   # compare two command outputs
cat <(echo hi)     # hi — cat reads the pipe
echo <(echo hi)    # /dev/fd/63 — echo just prints the filename, doesn't read it
```

### Reading `diff` output

```
2c2          # line 2 of file1 Changed to line 2 of file2 (a=added, d=deleted)
< b          # '<' = file1 side
---
> x          # '>' = file2 side
```

---

## Arrays and Loops

```bash
FRUITS=("apple" "banana" "cherry")    # or multi-line in parens

echo "${FRUITS[0]}"     # apple — zero-indexed
echo "${FRUITS[-1]}"    # cherry — last
echo "${FRUITS[@]}"     # all elements
echo "${#FRUITS[@]}"    # count: 3

# for over elements
for F in "${FRUITS[@]}"; do echo "$F"; done

# C-style counting loop
for ((i=0; i<3; i++)); do echo "$i: ${FRUITS[$i]}"; done

# range
for i in {1..5}; do echo "$i"; done
```

### `[@]` vs `[*]` — the distinction is about QUOTING

```bash
NAMES=("John Doe" "Jane Smith")

"${NAMES[@]}"   # → "John Doe" "Jane Smith"  (each element a separate word) ✅
"${NAMES[*]}"   # → "John Doe Jane Smith"     (all joined into ONE word by IFS)
 ${NAMES[@]}    # → John Doe Jane Smith        (UNquoted — splits into 4 words)
 ${NAMES[*]}    # → John Doe Jane Smith        (UNquoted — also 4 words)
```

UNquoted, `[@]` and `[*]` behave identically (both split). The difference appears
ONLY when quoted. **Always use `"${arr[@]}"` quoted** — it's the only form that
preserves elements containing spaces.

---

## `while` and `case`

```bash
while [[ $# -gt 0 ]]; do   # loop while arguments remain ($# = arg count)
  echo "$1"
  shift                     # $2→$1, $3→$2, decrements $#
done

case "$1" in
  --swap) echo "swap" ;;    # ;; ends a branch (like break)
  --help) echo "help" ;;
  *)      echo "unknown" ;; # * = catch-all
esac                        # "case" backwards
```

---

## Functions

```bash
# Document arguments in a comment — bash has no named parameters.
# Arguments:
#   $1 — username (string)
#   $2 — extra group to add (string)
create_user() {
  local username="$1"       # local = scoped to the function (ALWAYS use it)
  local group="$2"
  echo "creating $username in $group"
}

create_user "deploy" "docker"   # call without parentheses
```

Without `local`, variables leak into global scope and can clobber outer variables.

---

## Special Variables

```bash
$0    # script name
$1 $2 # positional arguments
$#    # argument count
$@    # all arguments (use "$@" — each stays a separate word)
$?    # exit code of last command
$$    # PID of current script
$!    # PID of last background command
```

Do NOT nest `$` inside `${ }`:

```bash
echo "${$0}"   # WRONG
echo "$0"      # correct
echo "${1:-no argument provided}"   # correct — with a default
```

---

## Pattern Matching in `[[ ]]`

### Glob with `==` (pattern must NOT be quoted)

```bash
NAME="telegram-bot-1"
[[ "$NAME" == telegram* ]]   # starts with
[[ "$NAME" == *bot* ]]       # contains
[[ "$NAME" == *-1 ]]         # ends with
[[ "$NAME" == "telegram*" ]] # WRONG — quotes make * literal
```

### Regex with `=~` (ERE; pattern must NOT be quoted)

```bash
[[ "$NAME" =~ ^telegram ]]   # starts with
[[ "$NAME" =~ [0-9]+$ ]]     # ends with digits

# Capture groups land in BASH_REMATCH
[[ "$NAME" =~ ([a-z]+)-([a-z]+)-([0-9]+) ]]
echo "${BASH_REMATCH[0]}"    # telegram-bot-1 (whole match)
echo "${BASH_REMATCH[1]}"    # telegram (group 1)
```

ERE essentials: `^ $ . * + ? [abc] [^abc] [0-9] [a-z] (a|b)`
(Use `[0-9]` rather than `\d` — `\d` isn't reliably supported.)

### BRE vs ERE — why `sed` needs backslashes

`sed` uses **Basic** Regular Expressions by default, where `? + ( )` are LITERAL
and must be escaped to get special meaning:

```bash
# \? = zero or one of the preceding element (here: an optional '#')
sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
#         ^#\?  matches both "PermitRootLogin yes" AND "#PermitRootLogin yes"
```

In ERE (`grep -E`, `[[ =~ ]]`) you'd write plain `#?`. Same meaning, different escaping.

---

## String Manipulation

```bash
NAME="telegram-bot"
echo "${#NAME}"        # 12 — length
echo "${NAME:0:8}"     # telegram — substring (start 0, length 8)
echo "${NAME:9}"       # bot — from index 9 to end
echo "${NAME^^}"       # TELEGRAM-BOT — uppercase
echo "${NAME,,}"       # telegram-bot — lowercase
echo "${NAME/bot/BOT}" # telegram-BOT — replace first
echo "${NAME//o/0}"    # telegram-b0t — replace all

# printf — aligned columns, reliable \n \t
printf "%-20s %s\n" "Container" "Status"
```

---

## `command` builtin

```bash
command -v docker      # prints path if found, exits non-zero if not (like `which`, better)
command ls             # run real ls, bypassing any function/alias named ls
type command           # "command is a shell builtin" — implemented inside bash, not on disk
```

Builtins (`echo cd set export local shift read command`) live in bash's own code;
external commands (`ls grep sed`) are files found via `$PATH`.

---

## `.` / `source`

```bash
. /etc/os-release        # identical to: source /etc/os-release
```

Runs the file IN THE CURRENT SHELL (not a child process), so variables it defines
become available afterward. `/etc/os-release` is plain `KEY=value` lines:

```bash
DISTRO_ID="$(. /etc/os-release && echo "$ID")"   # → "debian" / "ubuntu"
```

---

## Sourcing a config file (with a guard)

```bash
ENV_FILE="$(dirname "$0")/health-check.env"   # find it next to the script
if [[ ! -f "$ENV_FILE" ]]; then
  echo "❌ Missing $ENV_FILE — copy the .example and fill it in"
  exit 1
fi
source "$ENV_FILE"   # NOTE: this EXECUTES the file — only source files you trust
```

---

## `trap` — run code on exit / error (the real home of `$LINENO`)

```bash
# Cleanup on ANY exit
trap 'rm -f /tmp/tempfile' EXIT

# Report WHERE a failure happened
# $LINENO = current line, $BASH_COMMAND = the command that ran, $? = its exit code
trap 'echo "✗ line $LINENO: [$BASH_COMMAND] exited $?" >&2' ERR
```

`$FUNCNAME` is an array of the call stack — niche, useful only inside logging
helpers: `FUNCNAME[0]` is the current function, `FUNCNAME[1]` is its caller.

---

## `read` — interactive input

```bash
read -p "Username: " USERNAME
read -s -p "Password: " PASSWORD   # -s hides typing
```

---

## Argument Parsing Template

```bash
SWAP_ENABLED=false
SWAP_SIZE="1G"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --swap)
      SWAP_ENABLED=true
      # optional value: take $2 only if it exists and isn't another flag
      if [[ -n "${2-}" && "${2}" != --* ]]; then
        SWAP_SIZE="$2"
        shift
      fi
      shift
      ;;
    *)
      echo "Unknown argument: $1"
      exit 1
      ;;
  esac
done
```

---

## Delivering a script from a public repo

```bash
curl -fsSL https://raw.githubusercontent.com/USER/REPO/main/scripts/setup.sh \
  | bash -s -- --swap 1G
```

- `curl -f` fail on HTTP error `-s` silent `-S` but still show real errors `-L` follow redirects
- `bash -s` read script from stdin (the pipe)
- `--` end bash's own options; everything after goes to the SCRIPT as `$1 $2 ...`
