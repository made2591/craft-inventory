FROM node:18-bullseye-slim

WORKDIR /app

# Installa le dipendenze necessarie per PostgreSQL
RUN apt-get update && apt-get install -y postgresql-client netcat && rm -rf /var/lib/apt/lists/*

# Copia i file di configurazione
COPY package*.json ./

# Installa le dipendenze
RUN npm install

# Copia il codice sorgente
COPY . .

# Esponi la porta
EXPOSE 8080

# Script di entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Comando di avvio
ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "server.js"]