#!/usr/bin/env bash

set -eu

FILE="text-file.txt"
IP="192.168.0.1"


# On your IP experiment — one gotcha worth a note: with a repeated single group
# like (\.[0-9]{1,3}){3}, BASH_REMATCH[1] holds only the last iteration that
# group matched, so for 192.168.0.1 you'd get .1, not all three octets.
# A repeated group captures once, overwritten each repeat.
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

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "$SCRIPT_DIR"
