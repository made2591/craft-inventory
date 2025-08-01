#!/bin/bash
set -e

# Estrai l'host dal DATABASE_URL o usa il default
if [ -n "$DATABASE_URL" ]; then
  # Estrae l'host dal DATABASE_URL (formato: postgres://user:pass@host:port/db)
  host=$(echo "$DATABASE_URL" | sed -n 's|postgres://[^@]*@\([^:]*\):.*|\1|p')
else
  # Fallback al default
  host="172.28.1.2"
fi

echo "Waiting for PostgreSQL to be ready at $host..."
# Check if PostgreSQL is accepting connections
until nc -z -v -w30 "$host" 5432; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "PostgreSQL is up - checking database connection"
# Now try to connect to PostgreSQL
until PGPASSWORD=craftpassword psql -h "$host" -U "craftuser" -d "craftdb" -c '\q'; do
  echo "PostgreSQL database is not ready yet - sleeping"
  sleep 2
done

echo "PostgreSQL is ready - executing command"
exec "$@"