#!/bin/bash
# =============================================
# Simple script to pack only the telegram-bot app
# =============================================

echo "🚀 Starting Repomix for Telegram Bot..."

yarn repomix \
  --include "apps/telegram-bot/**/*" \
  --ignore "apps/telegram-bot/src/lib/**" \
  --style markdown \
  -o telegram-bot.md

echo "✅ Done! Output file: telegram-bot.md"
echo "   Total tokens were ~30k last time — ready for Claude / Grok / GPT"
