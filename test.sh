#!/usr/bin/env bash

set -eu

# # Fails if VAR is unset OR empty — the strict one you just used
# ${VAR:?error message}
#
# # Fails only if VAR is completely unset — empty string passes through
# ${VAR?error message}
#
# # Uses default if VAR is unset OR empty
# ${VAR:-default value}
#
# # Uses default only if VAR is completely unset — empty string uses empty
# ${VAR-default value}
#
# # Replaces with value if VAR IS set and non-empty — opposite of :-
# ${VAR:+replacement}
#
# # Replaces with value only if VAR is set (even if empty)
# ${VAR+replacement}

# -z Zero-length string(empty string)
# -n Non-zero-length string(not empty string)
# Without the colon(:) -> Bash only cares if the variable was declared.
# With the colon(:) -> Bash checks if the variable was declared AND if it has a value.

FILE="text-file.txt"
IP="192.168.0.1"

if [[ $IP =~ ^[0-9]{1,3}(\.[0-9]{1,3}){3}$ ]]; then
  echo "Looks like a valid IP structure."
  echo "${BASH_REMATCH[0]}"
  echo "${BASH_REMATCH[1]}"
fi

# Unset
if [[ -z "${VAR+x}" ]]; then
  echo "VAR is truly unset/we don't care if variable is going to be declared with empty value"
fi

# Set but Empty
if [[ -n "${VAR+x}" && -z "$VAR" ]]; then
  echo "VAR exists, but it's just empty quotes."
fi

# Set and Non-empty
if [[ -n "${VAR:+x}" ]]; then
  echo "VAR exists and has a real value"
fi

echo "Name of the script itself - ${0}"
echo "First argument - ${1:-no argument provided}"
echo "Second argument - ${2:-no argument provided}"
echo "Number of arguments - $#"
echo "All arguments as separate words - $@"
echo "Exit code of the last command - $?"
echo "PID (process ID) of current script -  $$"
echo "PID of last background command - ${!:-no value}"
