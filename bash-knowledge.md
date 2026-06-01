```bash
# Why pipefail matters:
cat file.txt | grep "something" | sort
# Without pipefail: if cat fails, grep and sort still run, exit code is sort's
# With pipefail: if any command fails, the pipe's exit code reflects that failure
```

# `set` flags

```bash
set -e          # exit on any error
set -u          # treat unset variables as errors
set -o pipefail # if any command in a pipe fails, the whole pipe fails
```

# Equivalents:

```bash
set -o errexit   # same as set -e
set -o nounset   # same as set -u
set -o pipefail  # no short form — only set -o pipefail
```

So pipefail has no single-letter shorthand — set -o pipefail is the only way.

`-z` Zero-length string(empty string)
`-n` Non-zero-length string(not empty string)
Without the colon(:) -> Bash only cares if the variable was declared.
With the colon(:) -> Bash checks if the variable was declared AND if it has a value.

# All Variable Expansion Forms — Explained

## `${VAR}:-default`

> [!NOTE]
> use `VAR` if set and non-empty, otherwise use default OR
> use `default` if VAR is unset or empty, otherwise use VAR

```bash
echo "${VAR}:-fallback"
```

## `${VAR:?fallback}`

> [!NOTE]
> use replacement(after plus sign) if `VAR` set and non-empty
> use empty string if `VAR` is unset or empty

```bash
echo "${VAR:+fallback}"
```

## `${VAR:?must be set}`

> [!NOTE]
> uses `VAR` if set and non-empty, otherwise print an error and EXIT
> prints error and exit if `VAR` is unset or empty

```bash
echo "${VAR:?must be set}"
```

The pattern is: `:` means "also fail on empty". Without `:` means "only care about
unset, empty passes through."

# Quoting — The Most Important Quirk

```bash
NAME="John Doe"

# Without quotes — bash splits on spaces, treats as two arguments
echo $NAME          # works here but dangerous in other contexts

# With double quotes — variable expands but spaces preserved
echo "$NAME"        # prints: John Doe

# With single quotes — NO expansion at all, literal string
echo '$NAME'        # prints: $NAME

# Practical danger example
FILE="my file.txt"
rm $FILE            # WRONG — tries to delete "my" and "file.txt" separately
rm "$FILE"          # correct — treats as one argument
```

> [!TIP]
> **_Rule of thumb: always double-quote variables. The exceptions are rare and
> you'll learn them naturally._**

# `if` Statements
```bash
# Basic structure
if CONDITION; then
  # runs if condition is true
fi

# With else
if CONDITION; then
  # runs if true
else
  # runs if false
fi

# With else if
if CONDITION; then
  # runs if true
elif OTHER_CONDITION; then
  # runs if other condition is true
else
  # runs if none matched
fi
```

The semicolon before `then` is just a line separator. These are identical:
```bash
if CONDITION; then   # semicolon version (common)

if CONDITION         # newline version (also valid)
then
```

# The Condition — `[ ]` vs `[[ ]]`

This is the biggest bash quirk. The condition is actually a command that
returns 0 (true) or non-zero (false).

```bash
# [ ] — POSIX, available everywhere, has quirks
# [[ ]] — bash-specific, safer, more features. Prefer this.

NAME="deploy"

# String comparison
if [ "$NAME" = "deploy" ]; then    # = not == in [ ]
if [[ "$NAME" == "deploy" ]]; then # == works in [[ ]]
if [[ "$NAME" == dep* ]]; then     # glob matching works in [[ ]] only

# The [ ] quirk — always quote variables inside [ ]
if [ $NAME = "deploy" ]; then   # dangerous if NAME is empty or has spaces
if [ "$NAME" = "deploy" ]; then # safe

# [[ ]] doesn't need quotes for variables (but still good practice)
if [[ $NAME == "deploy" ]]; then  # safe even unquoted
```

# Exit Codes — How Conditions Actually Work

Everything in bash returns an exit code. `0` means success/true. Anything else
means failure/false. This is the opposite of most programming languages.

```bash
# if directly tests exit codes
if command -v docker; then   # prints /c/Program Files/Docker/Docker/resources/bin/docker
  echo "docker exists"
fi

# command -v NAME — finds where a command lives, like which but more reliable

# The [ ] and [[ ]] are actually commands themselves
# They return 0 if the test passes, 1 if it fails

# You can check exit codes manually with $?
ls /some/path
echo $?    # prints 0 if ls succeeded, non-zero if it failed
```

# `command` — Is It a Keyword?

`command -v NAME` — finds where a command lives, like `which` but more reliable:

```bash
command -v docker        # prints: /usr/bin/docker
command -v nonexistent   # prints nothing, exits with code 1
```

`command NAME` — runs a command while bypassing any shell functions or aliases with the same name:

```bash
# Imagine you defined a function called ls
ls() { echo "my custom ls"; }

ls              # calls your function
command ls      # bypasses your function, calls the real /bin/ls
```

So `-v` is just a flag meaning "find and verify" — command itself is the builtin.


# `&>/dev/null` — The Ampersand

`>` redirects stdout. `2>` redirects stderr (file descriptor 2). `&>` is shorthand for
"redirect both stdout AND stderr":
```bash
command > /dev/null 2> /dev/null  # long form — redirect each separately
command > /dev/null 2>&1          # another form — redirect stderr to wherever stdout goes
command &> /dev/null              # shorthand — both at once
```

# command -v vs [[command -v]]

`[[ ]]` expects a test expression — things like `-z`, `-f`, string comparisons.
You can't put arbitrary commands inside `[[ ]]`.

`command -v docker` is just a plain command — you use it directly in if without brackets:

```bash
# correct — if tests the exit code of command -v directly
if command -v docker &>/dev/null; then
  echo "docker exists"
fi

# WRONG — [[ ]] doesn't run commands like this
if [[ command -v docker ]]; then
  echo "docker exists"
fi
```

# `&&` and `||`

```bash
# && means "and then, if previous succeeded"
apt update && apt install docker    # only installs if update succeeded

# || means "or if previous failed"
rm file.txt || true    # if rm fails, || true makes overall result success
mkdir /dir || echo "already exists"

# Combining
command -v docker &>/dev/null && echo "installed" || echo "not installed"
```

# Functions

```bash
# Define
install_docker() {
  echo "Installing docker..."
  apt install -y docker-ce
}

# Call — no parentheses when calling
install_docker

# With arguments — $1, $2, etc.
greet() {
  echo "Hello, $1!"    # $1 is first argument
}

greet "deploy"   # prints: Hello, deploy!
```

# Function Arguments

Bash has no formal parameter names — you document them with comments:

```bash
# Creates a user and sets up their SSH directory
# Arguments:
#   $1 — username (string)
#   $2 — public key content (string)
#   $3 — sudo access (optional, "true" or "false", default: "false")
create_user() {
  local username="$1"        # local makes variable scoped to this function
  local public_key="$2"
  local sudo_access="${3:-false}"  # optional with default

  echo "Creating user: $username"
}
```

`local` is important — without it, variables inside functions are global and can
accidentally overwrite variables in the rest of your script. Always use `local`
inside functions.

The real documentation is the comment block above. There's no enforced convention
in bash — some people use the style above, others write:

```bash
# Usage: create_user USERNAME PUBLIC_KEY [SUDO_ACCESS]
```

# Common Pattern You'll See

```bash
# Redirect stderr to /dev/null — suppress error output
command 2>/dev/null

# Redirect both stdout and stderr to /dev/null — completely silent
command &>/dev/null

# Subshell — run commands in isolation, capture output
VERSION=$(docker --version)   # $() captures command output as a string
echo "Docker version: $VERSION"

# Default value — use fallback if variable is unset or empty
SIZE=${1:-1G}     # if $1 not provided, use "1G"
NAME=${VAR:-"default"}
```

# All Redirection Operators

```bash
# == Output redirects ==========================================================

command > file        # redirect stdout to file (overwrites)
command >> file       # redirect stdout to file (appends)
command 2> file       # redirect stderr to file (overwrites)
command 2>> file      # redirect stderr to file (appends)
command &> file       # redirect both stdout and stderr to file (overwrites)
command &>> file      # redirect both stdout and stderr to file (appends)
command 2>&1          # redirect stderr to wherever stdout is currently going

# Real example of 2>&1:
command > file 2>&1   # stdout → file, then stderr → same place as stdout (file)
# Note: order matters — 2>&1 must come AFTER the > file

# == Input redirects ===========================================================

command < file        # feed file contents as stdin to command

# Here-document — feed multiple lines as stdin, ends at the delimiter
cat << EOF
line one
line two
EOF

# Here-document without variable expansion (single-quoted delimiter)
cat << 'EOF'
$HOME won't expand here — printed literally
EOF

# Here-string — feed a single string as stdin
# <<< sends a string directly to a command's stdin
grep "word" <<< "this string contains the word here"
# equivalent to: echo "this string contains the word here" | grep "word"

# == Pipes =====================================================================

command1 | command2        # stdout of command1 becomes stdin of command2
command1 |& command2       # stdout AND stderr of command1 → stdin of command2

# == Practical combinations ====================================================

# Silence a command completely
command &> /dev/null

# Capture output into a variable
OUTPUT=$(command 2>&1)     # capture both stdout and stderr

# Log stdout to file, show stderr in terminal
command > logfile.txt

# Append to a log file
echo "$(date): something happened" >> /var/log/myapp.log

# Feed a string into a command without echo
wc -w <<< "count these words"   # prints: 3
```
> [!IMPORTANT]
> The most important ones to memorize: `>`, `>>`, `2>`, `&>`, `|`, and `<<<`.

# Special Variables

```bash
$0    # name of the script itself
$1    # first argument
$2    # second argument
$#    # number of arguments
$@    # all arguments as separate words
$?    # exit code of the last command
$$    # PID (process ID) of current script
$!    # PID of last background command
```

# Special Variables with `${}` — Your Prints Are Wrong

You cannot nest $ inside ${}. These are wrong:

```bash
echo "${$0}"   # WRONG — ${ } expects a variable name, not another $
echo "${$1}"   # WRONG
```

# Correct syntax:

```bash
echo "Name of the script itself - ${0}"
echo "First argument - ${1:-no argument provided}"
echo "Second argument - ${2:-no argument provided}"
echo "Number of arguments - $#"
echo "All arguments as separate words - $@"
echo "Exit code of the last command - $?"
echo "PID (process ID) of current script -  $$"
echo "PID of last background command - ${!:-no value}"
```

# Arrays and For Loops — Before You Try

```bash
# == Defining arrays ===========================================================

# Space-separated values in parentheses
FRUITS=("apple" "banana" "cherry")

# Multi-line (same thing, more readable)
FRUITS=(
  "apple"
  "banana"
  "cherry"
)

# == Accessing arrays ==========================================================

echo "${FRUITS[0]}"     # apple — zero-indexed
echo "${FRUITS[1]}"     # banana
echo "${FRUITS[-1]}"    # cherry — last element

echo "${FRUITS[@]}"     # all elements: apple banana cherry
echo "${#FRUITS[@]}"    # number of elements: 3

# == For loop ==================================================================

for ITEM in "${FRUITS[@]}"; do
  echo "$ITEM"
done
# prints each fruit on its own line

# == Classic C-style for loop (counting) =======================================

for ((i=0; i<3; i++)); do
  echo "index $i: ${FRUITS[$i]}"
done

# == For loop over a range =====================================================

for i in {1..5}; do
  echo "$i"
done
# prints 1 2 3 4 5 on separate lines

# == The [@] vs [*] distinction ================================================

NAMES=("John Doe" "Jane Smith")

for NAME in "${NAMES[@]}"; do   # correct — each element stays intact
  echo "$NAME"
done
# John Doe
# Jane Smith

for NAME in "${NAMES[*]}"; do   # WRONG — joins all into one string
  echo "$NAME"
done
# John Doe Jane Smith  (one iteration, everything joined)
```

# Common Test Conditions

```bash
# String tests
[[ -z "$VAR" ]]       # true if string is EMPTY (zero length)
[[ -n "$VAR" ]]       # true if string is NOT empty
[[ "$A" == "$B" ]]    # strings are equal
[[ "$A" != "$B" ]]    # strings are not equal

# File tests
[ -f "/path/file" ]   # true if file EXISTS and is a regular file
[ -d "/path/dir" ]    # true if directory exists
[ -r "/path/file" ]   # true if file is readable
[ ! -f "/path" ]      # ! negates — true if file does NOT exist

# Number comparisons — use -eq, -ne, -lt, -gt, -le, -ge
[[ $COUNT -eq 0 ]]    # equal
[[ $COUNT -ne 0 ]]    # not equal
[[ $COUNT -gt 5 ]]    # greater than
[[ $COUNT -lt 10 ]]   # less than
[[ $COUNT -le 10 ]]  # less than or equal to 10
[[ $COUNT -ge 5 ]]   # greater than or equal to 5

# Command existence check
command -v docker     # exits 0 if docker exists in PATH, non-zero if not
```

# `while` and `case` — Used in Argument Parsing

```bash
# while loop
while [[ $# -gt 0 ]]; do   # $# is argument count, loop while > 0
  echo "$1"                  # $1 is current argument
  shift                      # shift moves $2→$1, $3→$2, reduces $# by 1
done

# case — bash's switch statement
case "$1" in
  --swap)
    echo "swap flag"
    ;;           # ;; ends each case — like break
  --help)
    echo "help"
    ;;
  *)             # * is the default/catch-all
    echo "unknown"
    ;;
esac             # esac is "case" backwards — ends the case block
```

# set -u and Unset Variables — The ${VAR+x} Pattern

```bash
# ${VAR+x} is safe — it expands to "x" if VAR is set, empty if unset
# Never crashes because you're not accessing VAR directly
if [[ -z "${VAR+x}" ]]; then
  echo "VAR is unset" # +x produced empty string -> -z is true
fi

if [[ -n "${VAR+x}" ]]; then
  echo "VAR is set" # +x produced "x" → -n is true
fi

if [[ -n "${VAR:+x}" ]]; then
  echo "VAR is set and non-empty"  # :+x only produces "x" if non-empty too
fi
```
The `x` is just a conventional placeholder — any non-empty string works.
You'll also see `${VAR+1}` or `${VAR+yes}` in the wild.

**Do you need `[ ]` instead of `[[ ]]` here?** No — `[[ ]]` handles all these expansion
forms perfectly. `[ ]` is only necessary for POSIX portability (running on shells
that aren't bash). Since your scripts use `#!/usr/bin/env bash`, stick with
`[[ ]]` throughout.

# `#!/usr/bin/env bash` vs `#!/bin/bash`

```bash
#!/bin/bash          # hardcoded path — fails if bash isn't at /bin/bash
#!/usr/bin/env bash  # asks env to find bash in PATH — more portable
```

On most Linux servers bash is at `/bin/bash` so both work. But on some systems
(NixOS, some macOS setups) bash is elsewhere, and env finds it correctly.
Use `#!/usr/bin/env bash` as your default.

# Pattern Matching and Regex in `[[ ]]`

`[[ ]]` supports two kinds of matching:

**Glob patterns with** `==`:

```bash
NAME="telegram-bot-1"

# * matches anything
[[ "$NAME" == telegram* ]]     # true — starts with telegram
[[ "$NAME" == *bot* ]]         # true — contains bot
[[ "$NAME" == *-1 ]]           # true — ends with -1

# ? matches exactly one character
[[ "$NAME" == telegram-bo? ]]  # false — too many chars

# [abc] matches one character from the set
[[ "$NAME" == t[aeiou]* ]]     # true — t followed by a vowel

# Important: the pattern must NOT be quoted
[[ "$NAME" == "telegram*" ]]   # WRONG — quotes make it literal, not a glob
[[ "$NAME" == telegram* ]]     # correct
```

# Regex with `=~`:

```bash
NAME="telegram-bot-1"

# =~ uses Extended Regular Expressions (ERE)
[[ "$NAME" =~ ^telegram ]]        # true — starts with telegram (^ = start)
[[ "$NAME" =~ [0-9]+$ ]]          # true — ends with one or more digits
[[ "$NAME" =~ ^[a-z-]+$ ]]        # false — has digits
[[ "$NAME" =~ bot-[0-9] ]]        # true — bot- followed by a digit

# Capture groups — matched groups go into BASH_REMATCH array
[[ "$NAME" =~ ([a-z]+)-([a-z]+)-([0-9]+) ]]
echo "${BASH_REMATCH[0]}"   # telegram-bot-1 (whole match)
echo "${BASH_REMATCH[1]}"   # telegram (first group)
echo "${BASH_REMATCH[2]}"   # bot (second group)
echo "${BASH_REMATCH[3]}"   # 1 (third group)

# Important: regex also must NOT be quoted
[[ "$NAME" =~ "^telegram" ]]   # WRONG — treats ^ as literal character
[[ "$NAME" =~ ^telegram ]]     # correct
```

Key ERE syntax you'll use most:

```bash
^     # start of string
$     # end of string
.     # any single character
*     # zero or more of previous
+     # one or more of previous
?     # zero or one of previous
[abc] # one character from set
[^abc]# one character NOT in set
[0-9] # digit
[a-z] # lowercase letter
\d    # digit (not always supported — use [0-9] to be safe)
(a|b) # a or b
```

# String Formatting

```bash
# == printf — more control than echo ==========================================

printf "%-20s %s\n" "Container" "Status"   # left-align in 20 chars
printf "%-20s %s\n" "telegram-bot" "UP"
# Container            Status
# telegram-bot         UP

# \n is newline, \t is tab — echo doesn't always handle these consistently
printf "line one\nline two\n"

# == String length =============================================================

NAME="deploy"
echo "${#NAME}"    # 6 — number of characters

# == Substring =================================================================

NAME="telegram-bot"
echo "${NAME:0:8}"    # telegram — start at 0, take 8 chars
echo "${NAME:9}"      # bot — start at 9, take rest

# == Upper/lowercase ===========================================================

NAME="Deploy"
echo "${NAME,,}"   # deploy — all lowercase
echo "${NAME^^}"   # DEPLOY — all uppercase

# == String replacement ========================================================

NAME="telegram-bot-old"
echo "${NAME/old/new}"    # telegram-bot-new — replace first match
echo "${NAME//o/0}"       # telegram-b0t-0ld — replace all matches
```

# `trap` — cleanup on exit:

```bash
# Runs cleanup function when script exits for any reason
# Essential for scripts that create temp files or need teardown
trap cleanup EXIT
trap 'echo "Error on line $LINENO"' ERR

cleanup() {
  rm -f /tmp/tempfile
}
```

# `read` — interactive input:

```bash
read -p "Enter username: " USERNAME
read -s -p "Enter password: " PASSWORD  # -s hides input
echo "Got: $USERNAME"
```

# `tee` — write to file AND stdout simultaneously:

```bash
command | tee logfile.txt    # shows output AND saves it
command | tee -a logfile.txt # same but appends
```

# Process substitution:

```bash
diff <(command1) <(command2)   # compare outputs of two commands
```

# `$LINENO` and `$FUNCNAME`:

```bash
echo "Error at line $LINENO in function ${FUNCNAME[0]}"
```
