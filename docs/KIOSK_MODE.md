# Modalità KIOSK - Craft Inventory App

## Panoramica

La modalità KIOSK è una funzionalità speciale dell'applicazione Craft Inventory che permette di resettare automaticamente il database ogni 15 minuti, ripristinando tutti i dati ai valori di test iniziali.

## Casi d'uso

- **Demo e presentazioni**: Mantiene sempre dati puliti e consistenti
- **Fiere e eventi**: Permette a più utenti di testare l'applicazione senza accumulare dati spazzatura
- **Testing automatizzato**: Garantisce un ambiente pulito per ogni ciclo di test
- **Ambienti di sviluppo condivisi**: Ripristina lo stato iniziale periodicamente

## Configurazione

### Abilitazione tramite Docker Compose

Modifica il file `docker-compose.yml` o `docker-compose-mac.yml`:

```yaml
services:
  backend:
    environment:
      KIOSK_MODE: "true"  # Cambia da "false" a "true"
```

### Variabili d'ambiente supportate

- `KIOSK_MODE`: `"true"` o `"false"` (default: `"false"`)

## Funzionamento

### Reset automatico

- **Intervallo**: Ogni 15 minuti (900 secondi)
- **Primo reset**: 15 minuti dopo l'avvio del server
- **Reset successivi**: Ogni 15 minuti dal primo reset

### Operazioni eseguite durante il reset

1. **Inizio transazione**: Tutte le operazioni sono atomiche
2. **Disabilitazione vincoli FK**: Temporaneamente per permettere la pulizia
3. **Pulizia tabelle**: Eliminazione di tutti i dati dalle tabelle principali:
   - `transaction_materials`
   - `transactions`
   - `model_components`
   - `product_models`
   - `component_materials`
   - `components`
   - `materials`
   - `suppliers`
   - `customers`
   - `users`
4. **Riabilitazione vincoli FK**: Ripristino dei vincoli di integrità
5. **Ripopolamento**: Esecuzione dei file di inizializzazione:
   - `01-init.sql`: Creazione strutture (se necessario)
   - `02-seed-data.sql`: Inserimento dati di test
6. **Commit**: Conferma di tutte le modifiche

## API Endpoints

### GET /api/kiosk/status

Restituisce informazioni sullo stato della modalità KIOSK.

**Risposta di esempio (KIOSK_MODE=true):**
```json
{
  "kioskMode": true,
  "resetInterval": "15 minuti",
  "status": "ATTIVO - Reset automatico abilitato",
  "message": "Il database viene automaticamente resettato ogni 15 minuti"
}
```

**Risposta di esempio (KIOSK_MODE=false):**
```json
{
  "kioskMode": false,
  "resetInterval": null,
  "status": "DISATTIVO - Reset automatico disabilitato",
  "message": "Per abilitare la modalità kiosk, imposta KIOSK_MODE=true nel docker-compose"
}
```

### POST /api/kiosk/reset

Esegue un reset manuale del database.

**Requisiti:**
- `KIOSK_MODE` deve essere impostato a `"true"`

**Risposta di successo:**
```json
{
  "message": "Database resettato con successo",
  "timestamp": "2025-08-01T10:30:00.000Z",
  "kioskMode": true
}
```

**Risposta di errore (KIOSK_MODE=false):**
```json
{
  "error": "Reset manuale non consentito: KIOSK_MODE non è abilitato",
  "kioskMode": false
}
```

## Logging

### Log di avvio

Quando il server si avvia, viene mostrato lo stato della modalità KIOSK:

```
🏪 KIOSK MODE ENABLED: Database will be reset every 15 minutes
```

oppure

```
🔒 KIOSK MODE DISABLED: Database will not be automatically reset
```

### Log di reset automatico

Durante ogni reset automatico:

```
🔄 KIOSK MODE: Resetting database...
🔄 KIOSK MODE: Executing init file: 01-init.sql
🔄 KIOSK MODE: Executing init file: 02-seed-data.sql
✅ KIOSK MODE: Database reset completed successfully
```

### Log di reset manuale

Durante un reset tramite API:

```
🔄 API: Resetting database...
🔄 API: Executing init file: 01-init.sql
🔄 API: Executing init file: 02-seed-data.sql
✅ API: Database reset completed successfully
```

## Sicurezza

### Protezioni implementate

- ✅ **Reset manuale protetto**: Funziona solo se `KIOSK_MODE=true`
- ✅ **Transazioni atomiche**: Rollback automatico in caso di errore
- ✅ **Gestione errori**: Logging dettagliato degli errori
- ✅ **Disabilitazione opzionale**: Default su `false`

### Raccomandazioni

- ❌ **MAI usare in produzione**: La modalità KIOSK elimina TUTTI i dati
- ✅ **Solo per ambienti di test/demo**: Usa esclusivamente per scopi di testing
- ✅ **Backup preventivo**: Assicurati di avere backup prima di abilitare
- ✅ **Monitoraggio**: Verifica i log per assicurarti che tutto funzioni correttamente

## Troubleshooting

### Il reset non avviene

1. Verifica che `KIOSK_MODE="true"` (con virgolette)
2. Controlla i log del container backend
3. Verifica la connessione al database

### Errori durante il reset

1. Controlla i log per messaggi di errore dettagliati
2. Verifica che i file `init-db/*.sql` siano presenti e validi
3. Assicurati che il database sia accessibile

### Reset manuale non funziona

1. Verifica che `KIOSK_MODE="true"`
2. Controlla la risposta dell'API `/api/kiosk/status`
3. Verifica che l'endpoint `/api/kiosk/reset` sia accessibile

## Esempio completo

### 1. Abilitazione

```bash
# Modifica docker-compose.yml
vim docker-compose.yml

# Riavvia i container
docker-compose down
docker-compose up -d
```

### 2. Verifica stato

```bash
curl http://localhost:8080/api/kiosk/status
```

### 3. Reset manuale (opzionale)

```bash
curl -X POST http://localhost:8080/api/kiosk/reset
```

### 4. Monitoraggio

```bash
# Segui i log del backend
docker-compose logs -f backend
```
