# Stage 1: Build
FROM node:20-alpine as build-stage

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

# Crea un utente non-root
RUN addgroup -g 101 -S nginx-app && \
    adduser -S -D -H -u 101 -h /var/cache/nginx -s /sbin/nologin -G nginx-app -g nginx-app nginx-app

# Copia i file compilati dalla fase di build
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copia la configurazione di nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Imposta le autorizzazioni corrette
RUN chown -R nginx-app:nginx-app /usr/share/nginx/html && \
    chown -R nginx-app:nginx-app /var/cache/nginx && \
    chown -R nginx-app:nginx-app /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx-app:nginx-app /var/run/nginx.pid

# Esponi la porta
EXPOSE 80

# Passa all'utente non-root
USER nginx-app

# Avvia nginx
CMD ["nginx", "-g", "daemon off;"]