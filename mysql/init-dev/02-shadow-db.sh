#!/bin/bash

# Dev/CI only — creates the throwaway shadow database Prisma Migrate replays
# migrations into (drift checks, migrate dev). Prisma OWNS and repeatedly WIPES
# this DB, so it must be empty and separate from donbass_post_orders. Grant the
# app user CREATE/DROP here so migrate can reset it. NOT needed in prod
# (migrate deploy uses no shadow DB) — this file belongs to the dev compose only.

mysql -u root -p"$MYSQL_ROOT_PASSWORD" <<SQL
CREATE DATABASE IF NOT EXISTS \`${MYSQL_SHADOW_DATABASE}\`;
GRANT ALL PRIVILEGES ON \`${MYSQL_SHADOW_DATABASE}\`.* TO '${MYSQL_USER}'@'%';
FLUSH PRIVILEGES;
SQL
