#!/bin/bash
# =============================================
# Simple script to pack only the react web app
# =============================================

echo "🚀 Starting Repomix for React SPA..."

yarn repomix \
  --include "apps/web/**,packages/**" \
  --style markdown \
  --parsable-style
  -o telegram-bot.md

echo "✅ Done! output file: telegram-bot.md"
