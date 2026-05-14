#!/bin/bash
# =============================================
# Simple script to pack only the telegram-bot app
# =============================================

echo "🚀 Starting Repomix for Telegram Bot..."

yarn repomix \
  --include "apps/telegram-bot/**,packages/eslint-config/**,packages/prettier-config/**,packages/typescript-config/**" \
  --ignore "apps/telegram-bot/src/lib/**" \
  --style markdown \
  --parsable-style
  -o telegram-bot.md

echo "✅ Done! output file: telegram-bot.md"
