# === Stage 1: Builder ========================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package manifests first — Docker caches layers in order.
# If these files don't change, yarn install is skipped on next build.
COPY package.json yarn.lock .yarnrc.yml ./

# Copy the .yarn directory (contains yarn 4 release itself)
COPY .yarn/releases/ .yarn/releases/

# Copy all workspace package.json files so yarn can resolve the workspace graph
# without copying all source code yet
COPY packages/eslint-config/package.json packages/eslint-config/
COPY packages/typescript-config/package.json packages/typescript-config/
COPY packages/prettier-config/package.json packages/prettier-config/
COPY apps/telegram-bot/package.json apps/telegram-bot/

# Install ALL dependencies (including devDeps needed for build)
RUN yarn install --check-cache

# Now copy source code (separate from install — preserves cache on code changes)
COPY packages/eslint-config/ packages/eslint-config/
COPY packages/typescript-config/ packages/typescript-config/
COPY packages/prettier-config/ packages/prettier-config/
COPY apps/telegram-bot/ apps/telegram-bot/

# Generate Prisma client (must happen before build)
RUN yarn workspace @donbass-post/tg-bot db:generate

# Build the bot (tsup compiles TypeScript → dist/)
RUN yarn workspace @donbass-post/tg-bot build

# === Stage 2: Runner =========================================================
FROM node:22-alpine AS runner

WORKDIR /app

# Copy package manifests again for production install
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/releases/ .yarn/releases/

COPY packages/eslint-config/package.json packages/eslint-config/
COPY packages/typescript-config/package.json packages/typescript-config/
COPY packages/prettier-config/package.json packages/prettier-config/
COPY apps/telegram-bot/package.json apps/telegram-bot/

# Install ONLY production dependencies — no devDeps
RUN yarn workspaces focus @donbass-post/tg-bot --production

# Copy compiled output from builder stage
COPY --from=builder /app/apps/telegram-bot/dist/ apps/telegram-bot/dist/

# Copy Prisma schema and generated client from builder
# (Prisma client is generated code, not a devDep artifact)
COPY --from=builder /app/apps/telegram-bot/src/prisma/ apps/telegram-bot/src/prisma/
COPY --from=builder /app/apps/telegram-bot/src/lib/prisma/ apps/telegram-bot/src/lib/prisma/
COPY --from=builder /app/apps/telegram-bot/prisma.config.ts apps/telegram-bot/prisma.config.ts

WORKDIR /app/apps/telegram-bot

# Why USER node?
# The node Docker image ships with a built-in unprivileged user called node.
# Running as root inside a container means if someone exploits your app, they
# have root inside the container — which can lead to escaping to the host.
# Running as node limits the blast radius.

# Run as non-root user for security — never run Node as root in production
USER node

# This is the single process Docker manages — no PM2
CMD ["node", "dist/server.js"]
