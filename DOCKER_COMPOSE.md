# Docker Compose Files

Questo progetto include diversi file docker-compose per varie situazioni con **completo isolamento** tra ambienti.

## 🔒 Isolamento Database

Ogni ambiente usa database completamente separati:

| Ambiente | Database | Network | Porta DB | Porta Backend |
|----------|----------|---------|----------|---------------|
| **Main** | `craftdb` | 172.28.x.x | 5432 | 8080 |
| **Kiosk** | `craftdb_kiosk` | 172.30.x.x | 5433 | 8081 |
| **macOS** | `craftdb` | 172.28.x.x | 5432 | 8080 |

## File disponibili

### `docker-compose.yml` (Standard)
- **Scopo**: Ambiente di sviluppo/produzione standard
- **Database**: `craftdb` su 172.28.1.2:5432
- **KIOSK_MODE**: Disabilitato (default)
- **Porte**: Frontend 3000, Backend 8080, Database 5432
- **Rete**: craft-network (172.28.x.x)

```bash
docker-compose up -d
```

### `docker-compose-mac.yml` (macOS)
- **Scopo**: Ottimizzato per sviluppo su macOS
- **Database**: `craftdb` su 172.28.1.2:5432 (condiviso con standard)
- **KIOSK_MODE**: Disabilitato (default)
- **Porte**: Frontend 3000, Backend 8080, Database 5432
- **Rete**: 172.28.x.x

```bash
docker-compose -f docker-compose-mac.yml up -d
```

### `docker-compose-kiosk.yml` (KIOSK Mode)
- **Scopo**: Ambiente dedicato per modalità KIOSK/demo (**COMPLETAMENTE ISOLATO**)
- **Database**: `craftdb_kiosk` su 172.30.1.2:5433 (**database separato**)
- **KIOSK_MODE**: Abilitato (default)
- **Reset automatico**: Ogni 15 minuti (configurabile)
- **Porte**: Frontend 3001, Backend 8081, Database 5433
- **Rete**: craft-kiosk-network (172.30.x.x)
- **Volume**: postgres_kiosk_data (**volume separato**)

```bash
docker-compose -f docker-compose-kiosk.yml up -d
```

## ✅ Vantaggi dell'Isolamento

- **Zero conflitti**: Kiosk e main possono girare simultaneamente
- **Dati separati**: Le demo non influenzano i dati di sviluppo  
- **Reset sicuri**: I reset kiosk non toccano il database principale
- **Configurazioni diverse**: Ogni ambiente ha le sue impostazioni
- **Porte diverse**: Nessun conflitto di porte

## Utilizzo consigliato

### Sviluppo normale
```bash
docker-compose up -d
# oppure su macOS
docker-compose -f docker-compose-mac.yml up -d
```

### Demo/Presentazioni/Fiere
```bash
docker-compose -f docker-compose-kiosk.yml up -d
```

### Test/Sviluppo parallelo
```bash
# Ambiente standard
docker-compose up -d

# Ambiente KIOSK (in parallelo)
docker-compose -f docker-compose-kiosk.yml up -d
```

## Porte utilizzate

| Ambiente | Frontend | Backend | Database |
|----------|----------|---------|----------|
| Standard | 3000     | 8080    | 5432     |
| macOS    | 3000     | 8080    | 5432     |
| KIOSK    | 3001     | 8081    | 5433     |

## Accesso rapido

- **Standard**: http://localhost:3000
- **KIOSK**: http://localhost:3001

## Note

- Tutti gli ambienti possono funzionare contemporaneamente
- L'ambiente KIOSK ha database e volumi separati
- Solo l'ambiente KIOSK ha il reset automatico abilitato di default
