
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

## ${VAR}:-default

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
Rule of thumb: always double-quote variables. The exceptions are rare and you'll
learn them naturally.

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
if command -v docker; then   # runs docker --version, checks if it succeeded
  echo "docker exists"
fi

# The [ ] and [[ ]] are actually commands themselves
# They return 0 if the test passes, 1 if it fails

# You can check exit codes manually with $?
ls /some/path
echo $?    # prints 0 if ls succeeded, non-zero if it failed
```

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
