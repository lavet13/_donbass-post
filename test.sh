#!/usr/bin/env bash

set -eu

FILE="text-file.txt"
IP="192.168.0.1"

if [[ $IP =~ ^[0-9]{1,3}(\.[0-9]{1,3}){3}$ ]]; then
  echo "Looks like a valid IP structure."
  echo "${BASH_REMATCH[0]}"
  echo "${BASH_REMATCH[1]}"
fi
