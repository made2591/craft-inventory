# Architettura dell'Applicazione di Gestione Magazzino per Artigianato

## Panoramica

Questa applicazione è progettata per gestire un magazzino virtuale per attività artigianali, con un backend in Rust e un frontend in Vue 3. L'applicazione utilizza servizi gratuiti per minimizzare i costi operativi.

## Stack Tecnologico

### Backend
- **Linguaggio**: Rust
- **Framework Web**: Actix-web
- **Database**: SQLite (file-based, senza costi)
- **ORM**: SQLx
- **Autenticazione**: JWT (JSON Web Tokens)

### Frontend
- **Framework**: Vue 3
- **State Management**: Pinia
- **Router**: Vue Router
- **UI Components**: Tailwind CSS o Bootstrap (opzionale)
- **HTTP Client**: Axios

## Struttura del Progetto

```
craft-inventory-app/
├── backend/
│   ├── migrations/        # Migrazioni del database
│   ├── src/
│   │   ├── controllers/   # Gestori delle richieste HTTP
│   │   ├── db/            # Configurazione e utilità del database
│   │   ├── models/        # Definizioni dei modelli di dati
│   │   ├── routes/        # Definizioni delle rotte API
│   │   ├── services/      # Logica di business
│   │   └── utils/         # Funzioni di utilità
│   └── Cargo.toml         # Configurazione del progetto Rust
├── frontend/
│   ├── public/            # Asset statici
│   └── src/
│       ├── assets/        # Immagini, font, ecc.
│       ├── components/    # Componenti Vue riutilizzabili
│       ├── router/        # Configurazione del router
│       ├── services/      # Servizi API
│       ├── store/         # Store Pinia
│       ├── utils/         # Funzioni di utilità
│       └── views/         # Componenti pagina
└── docs/                  # Documentazione
```

## Modelli di Dati

### Material (Materiale)
- Rappresenta i materiali grezzi utilizzati nella produzione
- Attributi: nome, descrizione, unità di misura, costo per unità, quantità in magazzino, livello minimo di scorta, fornitore

### ProductModel (Modello di Prodotto)
- Rappresenta un modello/design di prodotto che può essere realizzato
- Attributi: nome, descrizione, costo di produzione, prezzo di vendita, tempo di lavoro
- Relazione con Material attraverso ModelMaterial (molti a molti)

### InventoryItem (Articolo in Magazzino)
- Rappresenta un prodotto finito disponibile in magazzino
- Attributi: modello di riferimento, quantità, data di produzione, note

### Supplier (Fornitore)
- Rappresenta i fornitori di materiali
- Attributi: nome, persona di contatto, email, telefono, indirizzo, sito web, note

### Customer (Cliente)
- Rappresenta i clienti (privati, canali online, negozi fisici)
- Attributi: nome, tipo (privato, online, negozio), email, telefono, indirizzo, note

### Transaction (Transazione)
- Rappresenta le transazioni di vendita o acquisto
- Attributi: tipo (vendita/acquisto), data, cliente/fornitore, articoli, quantità, prezzo totale, stato

## Funzionalità Principali

1. **Gestione Materiali**
   - Aggiunta, modifica, eliminazione di materiali
   - Monitoraggio delle scorte
   - Avvisi per scorte basse

2. **Gestione Modelli di Prodotto**
   - Creazione di modelli con elenco dei materiali necessari
   - Calcolo automatico dei costi di produzione
   - Impostazione dei prezzi di vendita

3. **Gestione Magazzino**
   - Registrazione dei prodotti finiti
   - Monitoraggio delle quantità disponibili
   - Tracciamento della produzione

4. **Gestione Fornitori**
   - Registrazione e gestione dei fornitori
   - Storico degli acquisti

5. **Gestione Clienti**
   - Registrazione e gestione dei clienti
   - Storico degli ordini e delle vendite

6. **Reportistica**
   - Report sui costi e ricavi
   - Analisi delle vendite
   - Previsioni di scorte

## API Endpoints

### Materiali
- `GET /api/materials` - Lista di tutti i materiali
- `GET /api/materials/{id}` - Dettagli di un materiale specifico
- `POST /api/materials` - Crea un nuovo materiale
- `PUT /api/materials/{id}` - Aggiorna un materiale esistente
- `DELETE /api/materials/{id}` - Elimina un materiale

### Modelli di Prodotto
- `GET /api/models` - Lista di tutti i modelli
- `GET /api/models/{id}` - Dettagli di un modello specifico
- `POST /api/models` - Crea un nuovo modello
- `PUT /api/models/{id}` - Aggiorna un modello esistente
- `DELETE /api/models/{id}` - Elimina un modello

### Magazzino
- `GET /api/inventory` - Lista di tutti gli articoli in magazzino
- `GET /api/inventory/{id}` - Dettagli di un articolo specifico
- `POST /api/inventory` - Registra un nuovo articolo in magazzino
- `PUT /api/inventory/{id}` - Aggiorna un articolo esistente
- `DELETE /api/inventory/{id}` - Elimina un articolo

### Fornitori
- `GET /api/suppliers` - Lista di tutti i fornitori
- `GET /api/suppliers/{id}` - Dettagli di un fornitore specifico
- `POST /api/suppliers` - Registra un nuovo fornitore
- `PUT /api/suppliers/{id}` - Aggiorna un fornitore esistente
- `DELETE /api/suppliers/{id}` - Elimina un fornitore

### Clienti
- `GET /api/customers` - Lista di tutti i clienti
- `GET /api/customers/{id}` - Dettagli di un cliente specifico
- `POST /api/customers` - Registra un nuovo cliente
- `PUT /api/customers/{id}` - Aggiorna un cliente esistente
- `DELETE /api/customers/{id}` - Elimina un cliente

## Sicurezza

- Autenticazione basata su JWT
- Validazione degli input
- Protezione contro attacchi CSRF e XSS
- Gestione delle autorizzazioni basata su ruoli

## Deployment

Per mantenere i costi bassi o nulli, si consiglia:
- **Backend**: Deployment su VPS economico o servizio gratuito come Heroku (tier gratuito)
- **Frontend**: Hosting statico su GitHub Pages, Netlify o Vercel (tutti offrono piani gratuiti)
- **Database**: SQLite per ambienti di sviluppo e produzione con volumi bassi, o migrazione a PostgreSQL su servizi con tier gratuito

## Prossimi Passi

1. Implementare le migrazioni del database
2. Sviluppare le API REST per ogni entità
3. Creare l'interfaccia utente frontend
4. Implementare l'autenticazione e l'autorizzazione
5. Testare l'applicazione
6. Documentare l'API
7. Preparare l'ambiente di deployment