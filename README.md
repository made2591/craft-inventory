# Craft Inventory App

Un'applicazione per la gestione dell'inventario di prodotti artigianali, materiali e transazioni.

## Panoramica

Questa applicazione è progettata per aiutare gli artigiani a gestire il loro inventario, tracciare materiali, componenti, prodotti finiti e transazioni di vendita e acquisto.

## Tecnologie utilizzate

- **Backend**: Node.js con Express
- **Frontend**: Vue 3
- **Database**: PostgreSQL
- **Containerizzazione**: Docker e Docker Compose

## Struttura del progetto

- `backend/`: API server Node.js
- `frontend/`: Applicazione Vue.js
- `docs/`: Documentazione del progetto

## Requisiti

- Docker e Docker Compose
- Node.js (per lo sviluppo locale)
- npm o yarn (per lo sviluppo locale)

## Avvio dell'applicazione

1. Clona il repository
2. Esegui `docker-compose up -d` nella directory principale
3. Accedi all'applicazione su http://localhost:3000

## Dati di test

L'applicazione viene inizializzata con dati di test per facilitare lo sviluppo e il testing. Ecco una panoramica dei dati disponibili:

### Fornitori

- **Forniture Artigianali Srl**: Fornitore principale di materiali di base
- **Tessuti & Filati**: Specializzato in tessuti di alta qualità
- **Legno Pregiato SpA**: Fornitore di legni pregiati e materiali per lavorazione

### Materiali

- **Cotone organico**: Cotone 100% organico certificato (SKU: MAT001)
- **Lana merino**: Lana merino di alta qualità (SKU: MAT002)
- **Legno di noce**: Legno di noce italiano stagionato (SKU: MAT003)
- **Pelle conciata al vegetale**: Pelle di alta qualità conciata al vegetale (SKU: MAT004)
- **Filo di cotone**: Filo di cotone per cuciture resistenti (SKU: MAT005)

### Componenti

- **Manico in pelle**: Manico in pelle per borse (SKU: COMP001)
- **Cerniera metallica**: Cerniera in metallo di alta qualità (SKU: COMP002)
- **Bottone in legno**: Bottone decorativo in legno di noce (SKU: COMP003)
- **Fodera in cotone**: Fodera interna in cotone (SKU: COMP004)

### Modelli di prodotto

- **Borsa Tote**: Borsa tote in cotone organico (SKU: MOD001)
- **Portafoglio in pelle**: Portafoglio artigianale in pelle conciata al vegetale (SKU: MOD002)
- **Sciarpa in lana**: Sciarpa in lana merino lavorata a mano (SKU: MOD003)

### Articoli in magazzino

- 10 Borse Tote
- 15 Portafogli in pelle
- 8 Sciarpe in lana

### Clienti

- **Boutique Artigianale**: Negozio fisico a Milano
- **Mario Bianchi**: Cliente privato
- **Artigianato Online**: Marketplace online

### Transazioni

- **Acquisti**:
  - Ordine trimestrale tessuti da Tessuti & Filati (completato)
  - Rifornimento legno da Legno Pregiato SpA (completato)
  - Ordine pelle e accessori da Forniture Artigianali Srl (in attesa)

- **Vendite**:
  - Ordine mensile da Boutique Artigianale (completato)
  - Ordine da cliente privato Mario Bianchi (completato)
  - Ordine da marketplace Artigianato Online (in attesa)

## Utente di test

- **Username**: admin
- **Email**: admin@craftinventory.com
- **Password**: admin123

## Sviluppo

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run serve
```

## Licenza

MIT