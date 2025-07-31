# Stage 1: Build
FROM node:20-bullseye-slim AS build

WORKDIR /app

# Copia i file di configurazione
COPY package*.json ./

# Installa le dipendenze con npm ci per una build più affidabile
RUN npm ci || npm install

# Copia il codice sorgente
COPY . .

# Stage 2: Production
FROM node:20-bullseye-slim AS production

# Crea un utente non-root per eseguire l'applicazione
RUN groupadd -r nodejs && useradd -r -g nodejs -m -d /home/nodejs nodejs

WORKDIR /app

# Installa PostgreSQL 14 client e netcat
RUN apt-get update && \
    apt-get install -y curl gnupg2 netcat-openbsd ca-certificates lsb-release --no-install-recommends && \
    sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list' && \
    curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /etc/apt/trusted.gpg.d/postgresql.gpg && \
    apt-get update && \
    apt-get install -y postgresql-client-14 --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Copia i file di configurazione e le dipendenze dalla fase di build
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/server.js ./
COPY --from=build /app/routes ./routes
COPY --from=build /app/migrations ./migrations
COPY --from=build /app/init-db ./init-db

# Crea le cartelle per i backup e gli upload
RUN mkdir -p /app/backups /app/uploads && \
    chmod 777 /app/backups /app/uploads

# Script di entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Esponi la porta
EXPOSE 8080

# Cambia proprietario dei file
RUN chown -R nodejs:nodejs /app /entrypoint.sh

# Passa all'utente non-root
USER nodejs

# Comando di avvio
ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "server.js"]