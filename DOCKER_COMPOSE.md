# Docker Compose Files

Questo progetto include diversi file docker-compose per varie situazioni:

## File disponibili

### `docker-compose.yml` (Standard)
- **Scopo**: Ambiente di sviluppo/produzione standard
- **KIOSK_MODE**: Disabilitato (default)
- **Porte**: Frontend 3000, Backend 8080, Database 5432
- **Rete**: 172.28.x.x

```bash
docker-compose up -d
```

### `docker-compose-mac.yml` (macOS)
- **Scopo**: Ottimizzato per sviluppo su macOS
- **KIOSK_MODE**: Disabilitato (default)
- **Porte**: Frontend 3000, Backend 8080, Database 5432
- **Rete**: 172.28.x.x

```bash
docker-compose -f docker-compose-mac.yml up -d
```

### `docker-compose-kiosk.yml` (KIOSK Mode)
- **Scopo**: Ambiente dedicato per modalità KIOSK/demo
- **KIOSK_MODE**: Abilitato (default)
- **Porte**: Frontend 3001, Backend 8081, Database 5433
- **Rete**: 172.29.x.x
- **Reset automatico**: Ogni 15 minuti

```bash
docker-compose -f docker-compose-kiosk.yml up -d
```

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
