#!/usr/bin/env bash

set -euo pipefail

# FRUITS=("apple" "banana" "cherry")    # or multi-line in parens
#
# for F in "${FRUITS[@]}"; do
#   echo "$F"
# done
#
#
# for i in {1..5}; do
#   echo "${i}"
# done

SWAP_SIZE="1G"

# INFO: `while [[ $# -gt 0 ]]` skips the whole body when there are 0 args.
# So the case's `*` default only fires for an unknown arg that was ACTUALLY passed —
# it does NOT fire for "no arguments at all". Defaults for no-args are set before the loop.
while [[ $# -gt 0 ]]; do
  case "$1" in
    --swap)
      if [[ -n "${2-}" && "$2" != --* ]]; then
        SWAP_SIZE="${2^^}"
        shift
      fi
      shift
      ;;
    --test)
      shift
      ;;
    *)
      echo "Unknown argument: $1"
      echo "Usage: bash setup-debian.sh [--swap [SIZE]] [--ssh-port PORT] [--harden-ssh]"
      exit 1
      ;;
  esac
done

echo "$SWAP_SIZE"

show() {
  echo "count with $@: $#"      # number of args
  for a in "$@"; do echo "@ → [$a]"; done   # each arg intact (spaces preserved)
  for a in "$*"; do echo "* → [$a]"; done   # ONE iteration, everything joined
}

create_user() {
  local username="${1-noname}"
  local extra_group="${2-nogroup}"

  echo "$username:$extra_group"
  show "$username" "$extra_group"
}

create_user "deploy" "docker"

NAME="telegram-bot"

echo "${NAME/bot/BOT}" # telegram-BOT — replace first
echo "${NAME//e/*}"    # t*l*gram-bot — replace all

printf "%-20s %s\n" "Container" "Status"

# Practical use: a log helper that auto-tags WHO logged
log() { echo "${FUNCNAME[0]} | [${FUNCNAME[1]}] $*"; }   # [1] = caller of log()
deploy() { log "starting"; }            # → [deploy] starting
deploy

# $FUNCNAME — call-stack array, only meaningful inside a function.
#   [0] = current function, [1] = its caller, [2] = caller's caller ...
outer() { inner; }
inner() {
  echo "running: ${FUNCNAME[0]}"    # inner
  echo "called by: ${FUNCNAME[1]}"  # outer
}
outer
