#!/bin/bash
set -e

# Use environment variables or fallback to defaults
POSTGRES_USER=${POSTGRES_USER:-craftuser}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-craftpassword}
POSTGRES_DB=${POSTGRES_DB:-craftdb}
POSTGRES_HOST=${POSTGRES_HOST:-172.28.1.2}
POSTGRES_PORT=${POSTGRES_PORT:-5432}

# Estrai l'host dal DATABASE_URL o usa il default
if [ -n "$DATABASE_URL" ]; then
  # Estrae l'host dal DATABASE_URL (formato: postgres://user:pass@host:port/db)
  host=$(echo "$DATABASE_URL" | sed -n 's|postgres://[^@]*@\([^:]*\):.*|\1|p')
else
  # Fallback al POSTGRES_HOST
  host="$POSTGRES_HOST"
fi

echo "Waiting for PostgreSQL to be ready at $host..."
echo "Using credentials: $POSTGRES_USER / [password hidden] / $POSTGRES_DB"

# Check if PostgreSQL is accepting connections
until nc -z -v -w30 "$host" "$POSTGRES_PORT"; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "PostgreSQL is up - checking database connection"
# Now try to connect to PostgreSQL using environment variables
until PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$host" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q'; do
  echo "PostgreSQL database is not ready yet - sleeping"
  sleep 2
done

echo "PostgreSQL is ready - executing command"
exec "$@"