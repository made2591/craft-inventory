#!/bin/bash
# wait-for-postgres.sh

set -e

# Use environment variables or fallback to defaults
POSTGRES_USER=${POSTGRES_USER:-craftuser}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-craftpassword}
POSTGRES_DB=${POSTGRES_DB:-craftdb}
POSTGRES_HOST=${POSTGRES_HOST:-172.28.1.2}
POSTGRES_PORT=${POSTGRES_PORT:-5432}

cmd="$@"

echo "Waiting for PostgreSQL to be ready at $POSTGRES_HOST:$POSTGRES_PORT..."
echo "Using credentials: $POSTGRES_USER / [password hidden] / $POSTGRES_DB"

# Check if PostgreSQL is accepting connections
until nc -z -v -w30 "$POSTGRES_HOST" "$POSTGRES_PORT"; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "PostgreSQL is up - checking database connection"
# Now try to connect to PostgreSQL using environment variables
until PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q'; do
  echo "PostgreSQL database is not ready yet - sleeping"
  sleep 2
done

echo "PostgreSQL is ready - executing command"
exec $cmd