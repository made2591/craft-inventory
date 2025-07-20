# Stage 1: Build
FROM node:16-alpine as build-stage

WORKDIR /app

# Copia i file di configurazione
COPY package*.json ./

# Installa le dipendenze con npm ci per una build più affidabile
RUN npm ci || npm install

# Copia il codice sorgente
COPY . .

# Compila l'applicazione
RUN npm run build

# Stage 2: Production
FROM nginx:stable-alpine as production-stage

# Copia i file compilati dalla fase di build
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copia la configurazione di nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Esponi la porta
EXPOSE 80

# Avvia nginx
CMD ["nginx", "-g", "daemon off;"]