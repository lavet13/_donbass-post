#!/bin/bash

# Runs ONCE, only on first container init — when /var/lib/mysql is empty and the
# entrypoint is creating the MYSQL_DATABASE for the first time. The mysql image
# executes files in /docker-entrypoint-initdb.d/ at that moment and never again;
# a container restart with an existing data volume SKIPS this entirely.
# So: creates the read-only ODBC user against the freshly-created database.
# (A .sh file — not .sql — because only .sh init scripts see the container's
# environment, which is how ${MYSQL_ODBC_PASSWORD} etc. resolve without hardcoding.)

mysql -u root -p"$MYSQL_ROOT_PASSWORD" <<SQL
CREATE USER IF NOT EXISTS '${MYSQL_ODBC_USER}'@'%' IDENTIFIED BY '${MYSQL_ODBC_PASSWORD}';
GRANT SELECT ON \`${MYSQL_DATABASE}\`.* TO '${MYSQL_ODBC_USER}'@'%';
FLUSH PRIVILEGES;
SQL
