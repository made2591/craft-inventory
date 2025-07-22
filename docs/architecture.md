# Architettura dell'Applicazione di Gestione Magazzino per Artigianato

## Panoramica

Questa applicazione è progettata per gestire un magazzino virtuale per attività artigianali, con un backend in Node.js e un frontend in Vue 3. L'applicazione utilizza PostgreSQL come database per garantire robustezza e scalabilità.

## Stack Tecnologico

### Backend
- **Linguaggio**: JavaScript (Node.js)
- **Framework Web**: Express.js
- **Database**: PostgreSQL
- **Containerizzazione**: Docker e Docker Compose
- **Autenticazione**: JWT (JSON Web Tokens)

### Frontend
- **Framework**: Vue 3
- **Router**: Vue Router
- **HTTP Client**: Axios
- **UI Components**: CSS personalizzato con design responsive

## Struttura del Progetto

```
craft-inventory-app/
├── backend/
│   ├── migrations/        # Migrazioni del database
│   ├── init-db/           # Script di inizializzazione del database
│   ├── routes/            # Definizioni delle rotte API
│   ├── server.js          # Entry point del server
│   ├── Dockerfile         # Configurazione Docker per il backend
│   └── package.json       # Dipendenze del backend
├── frontend/
│   ├── public/            # Asset statici
│   ├── src/
│   │   ├── assets/        # Immagini, font, ecc.
│   │   ├── components/    # Componenti Vue riutilizzabili
│   │   ├── router/        # Configurazione del router
│   │   ├── services/      # Servizi API
│   │   ├── store/         # Store per la gestione dello stato
│   │   ├── utils/         # Funzioni di utilità
│   │   └── views/         # Componenti pagina
│   ├── Dockerfile         # Configurazione Docker per il frontend
│   └── package.json       # Dipendenze del frontend
├── docker-compose.yml     # Configurazione Docker Compose
└── docs/                  # Documentazione
```

## Modelli di Dati

### Material (Materiale)
- Rappresenta i materiali grezzi utilizzati nella produzione
- Attributi: id, nome, descrizione, unità di misura, costo per unità, quantità in magazzino, livello minimo di scorta, fornitore, link al fornitore

### ProductModel (Modello di Prodotto)
- Rappresenta un modello/design di prodotto che può essere realizzato
- Attributi: id, nome, descrizione, SKU, costo di produzione, prezzo di vendita, tempo di lavoro
- Relazione con Material attraverso ModelComponent (molti a molti)

### Component (Componente)
- Rappresenta i componenti utilizzati nei modelli di prodotto
- Attributi: id, nome, SKU, descrizione, quantità disponibile
- Utilizzato nei modelli di prodotto

### InventoryItem (Articolo in Magazzino)
- Rappresenta un prodotto finito disponibile in magazzino
- Attributi: id, modello di riferimento, quantità, data di produzione, note

### Supplier (Fornitore)
- Rappresenta i fornitori di materiali
- Attributi: id, nome, persona di contatto, email, telefono, indirizzo, sito web, note, link

### Customer (Cliente)
- Rappresenta i clienti (privati, canali online, negozi fisici)
- Attributi: id, nome, tipo (privato, online, negozio), email, telefono, indirizzo, note, link

### Transaction (Transazione)
- Rappresenta le transazioni di vendita o acquisto
- Attributi: id, tipo (vendita/acquisto), data, cliente/fornitore, articoli, quantità, prezzo totale, stato

### TransactionItem (Elemento di Transazione)
- Rappresenta gli elementi inclusi in una transazione
- Attributi: id, transazione di riferimento, materiale o modello di prodotto, quantità, prezzo unitario

## Funzionalità Principali

1. **Gestione Materiali**
   - Aggiunta, modifica, eliminazione di materiali
   - Monitoraggio delle scorte
   - Avvisi per scorte basse
   - Storico degli acquisti per ogni materiale

2. **Gestione Modelli di Prodotto**
   - Creazione di modelli con elenco dei componenti necessari
   - Calcolo automatico dei costi di produzione
   - Impostazione dei prezzi di vendita
   - Gestione SKU

3. **Gestione Magazzino**
   - Registrazione dei prodotti finiti
   - Monitoraggio delle quantità disponibili
   - Tracciamento della produzione
   - Storico delle vendite per ogni articolo

4. **Gestione Fornitori**
   - Registrazione e gestione dei fornitori
   - Storico degli acquisti
   - Collegamenti esterni ai siti dei fornitori

5. **Gestione Clienti**
   - Registrazione e gestione dei clienti
   - Storico degli ordini e delle vendite
   - Collegamenti esterni ai profili dei clienti

6. **Gestione Transazioni**
   - Registrazione di acquisti e vendite
   - Gestione dello stato delle transazioni (in attesa, completata, annullata)
   - Aggiornamento automatico delle scorte in base alle transazioni
   - Paginazione delle transazioni per una migliore gestione

7. **Reportistica**
   - Report sui costi e ricavi
   - Analisi delle vendite
   - Previsioni di scorte

## API Endpoints

### Materiali
- `GET /api/materials` - Lista di tutti i materiali con paginazione
- `GET /api/materials/{id}` - Dettagli di un materiale specifico
- `GET /api/materials/{id}/purchases` - Storico degli acquisti di un materiale specifico
- `POST /api/materials` - Crea un nuovo materiale
- `PUT /api/materials/{id}` - Aggiorna un materiale esistente
- `DELETE /api/materials/{id}` - Elimina un materiale

### Modelli di Prodotto
- `GET /api/models` - Lista di tutti i modelli con paginazione
- `GET /api/models/{id}` - Dettagli di un modello specifico
- `POST /api/models` - Crea un nuovo modello
- `PUT /api/models/{id}` - Aggiorna un modello esistente
- `DELETE /api/models/{id}` - Elimina un modello

### Componenti
- `GET /api/components` - Lista di tutti i componenti con paginazione
- `GET /api/components/{id}` - Dettagli di un componente specifico
- `POST /api/components` - Crea un nuovo componente
- `PUT /api/components/{id}` - Aggiorna un componente esistente
- `DELETE /api/components/{id}` - Elimina un componente

### Magazzino
- `GET /api/inventory` - Lista di tutti gli articoli in magazzino con paginazione
- `GET /api/inventory/{id}` - Dettagli di un articolo specifico
- `GET /api/inventory/{id}/sales` - Storico delle vendite di un articolo specifico
- `POST /api/inventory` - Registra un nuovo articolo in magazzino
- `PUT /api/inventory/{id}` - Aggiorna un articolo esistente
- `DELETE /api/inventory/{id}` - Elimina un articolo

### Fornitori
- `GET /api/suppliers` - Lista di tutti i fornitori con paginazione
- `GET /api/suppliers/{id}` - Dettagli di un fornitore specifico
- `POST /api/suppliers` - Registra un nuovo fornitore
- `PUT /api/suppliers/{id}` - Aggiorna un fornitore esistente
- `DELETE /api/suppliers/{id}` - Elimina un fornitore

### Clienti
- `GET /api/customers` - Lista di tutti i clienti con paginazione
- `GET /api/customers/{id}` - Dettagli di un cliente specifico
- `POST /api/customers` - Registra un nuovo cliente
- `PUT /api/customers/{id}` - Aggiorna un cliente esistente
- `DELETE /api/customers/{id}` - Elimina un cliente

### Transazioni
- `GET /api/transactions` - Lista di tutte le transazioni con paginazione
- `GET /api/transactions/{id}` - Dettagli di una transazione specifica
- `POST /api/transactions` - Crea una nuova transazione
- `PUT /api/transactions/{id}` - Aggiorna una transazione esistente
- `DELETE /api/transactions/{id}` - Elimina una transazione

## Funzionalità di Paginazione

L'applicazione implementa la paginazione lato server per migliorare le prestazioni e l'esperienza utente:

- Tutte le liste principali (materiali, modelli, inventario, transazioni) supportano la paginazione
- Parametri di query supportati:
  - `page`: numero di pagina (default: 1)
  - `limit`: elementi per pagina (default: 10)
  - Filtri specifici per ogni endpoint (es. `type`, `modelId`, ecc.)
- Risposta paginata standard:
  ```json
  {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 100,
      "totalPages": 10
    }
  }
  ```

## Interfaccia Utente

L'interfaccia utente è progettata per essere intuitiva e responsive, con le seguenti caratteristiche:

1. **Dashboard**
   - Panoramica delle scorte
   - Avvisi per scorte basse
   - Transazioni recenti

2. **Gestione Materiali**
   - Lista materiali con filtri e paginazione
   - Form di creazione/modifica
   - Visualizzazione dettagli con storico acquisti

3. **Gestione Modelli**
   - Lista modelli con filtri e paginazione
   - Form di creazione/modifica con aggiunta componenti
   - Visualizzazione dettagli

4. **Gestione Magazzino**
   - Lista articoli con filtri e paginazione
   - Form di creazione/modifica
   - Visualizzazione dettagli con storico vendite

5. **Gestione Transazioni**
   - Lista transazioni con filtri e paginazione
   - Form di creazione/modifica
   - Visualizzazione dettagli

## Deployment

L'applicazione è containerizzata con Docker per facilitare il deployment:

- **Backend**: Container Node.js con Express
- **Frontend**: Container Nginx che serve l'applicazione Vue compilata
- **Database**: Container PostgreSQL
- **Networking**: Configurato tramite Docker Compose

## Sicurezza

- Validazione degli input
- Protezione contro attacchi CSRF e XSS
- Sanitizzazione dei dati
- Gestione sicura delle transazioni nel database

## Funzionalità Future

1. Autenticazione e gestione utenti
2. Sistema di notifiche per scorte basse
3. Integrazione con servizi di e-commerce
4. App mobile per la gestione in mobilità
5. Generazione di report avanzati e grafici
6. Gestione di più magazzini/location
7. Sistema di prenotazione e ordini