#!/bin/bash
# wait-for-postgres.sh

set -e

# Utilizziamo direttamente l'indirizzo IP statico
host="172.28.1.2"
cmd="$@"

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
exec $cmd