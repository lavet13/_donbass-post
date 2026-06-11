#!/usr/bin/env bash

set -eu

FILE="text-file.txt"
IP="192.168.0.1"

if [[ $IP =~ ^[0-9]{1,3}(\.[0-9]{1,3}){3}$ ]]; then
  echo "Looks like a valid IP structure."
  echo "${BASH_REMATCH[0]}"
  echo "${BASH_REMATCH[1]}"
fi


demo() {
  echo "in ${FUNCNAME[0]} at line $LINENO";
}
demo

VAR="hello"
EMPTY=""
# ${VAR:+replacement}  → "replacement" if VAR set+non-empty, else "" (opposite of `:-`)
echo "${VAR:+found}"        # found
echo "${EMPTY:+found}"      # (empty)

# ${VAR+replacement}  → "replacement" if VAR set(even if empty), else "" (opposite of `:-`)
echo "${VAR+found}" # found
echo "${EMPTY+found}" # found

if [[ -s "$(dirname $0)/test.txt" ]]; then
  echo "test.txt exists and non-empty"
else
  echo "test.txt not exists or empty"
fi
