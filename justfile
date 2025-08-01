# Craft Inventory Management System - Justfile
# Commands for managing the application across different environments

# Default recipe - show available commands
default:
    @just --list

# ============================================================================
# Git Operations
# ============================================================================

# Pull latest changes from main branch
pull:
    @echo "🔄 Pulling latest changes from main branch..."
    git checkout main
    git pull origin main
    @echo "✅ Successfully pulled latest changes"

# Check git status
status:
    @echo "📊 Git status:"
    git status --porcelain

# ============================================================================
# Environment Setup
# ============================================================================

# Setup environment files for standard mode (local development)
setup-env:
    @echo "⚙️ Setting up environment files for standard mode..."
    cp .env.example .env
    cp backend/.env.example backend/.env
    cp frontend/.env.example frontend/.env
    @echo "✅ Environment files created. Edit them as needed."

# Setup environment files for kiosk mode
setup-env-kiosk:
    @echo "⚙️ Setting up environment files for kiosk mode..."
    cp .env.kiosk.example .env.kiosk
    cp backend/.env.kiosk.example backend/.env.kiosk
    cp frontend/.env.kiosk.example frontend/.env.kiosk
    @echo "✅ Kiosk environment files created. Edit them as needed."

# Setup environment files for cloudflared mode (with tunnel)
setup-env-cloudflared:
    @echo "⚙️ Setting up environment files for cloudflared mode..."
    cp .env.cloudflared.example .env.cloudflared
    cp backend/.env.example backend/.env.cloudflared  
    cp frontend/.env.example frontend/.env.cloudflared
    @echo "✅ Cloudflared environment files created. Edit them as needed."

# ============================================================================
# Docker Build Operations
# ============================================================================

# Build containers for standard mode (local development)
build:
    @echo "🔨 Building containers for standard mode..."
    docker-compose build --no-cache
    @echo "✅ Standard mode containers built successfully"

# Build containers for kiosk mode
build-kiosk:
    @echo "🔨 Building containers for kiosk mode..."
    docker-compose -f docker-compose-kiosk.yml --env-file .env.kiosk build --no-cache
    @echo "✅ Kiosk mode containers built successfully"

# Build containers for cloudflared mode (with tunnel)
build-cloudflared:
    @echo "🔨 Building containers for cloudflared mode..."
    docker-compose -f docker-compose-cloudflared.yml --env-file .env.cloudflared build --no-cache
    @echo "✅ Cloudflared mode containers built successfully"

# Build all containers for all modes
build-all: build build-kiosk build-cloudflared
    @echo "🎉 All containers built successfully!"

# ============================================================================
# Docker Start Operations
# ============================================================================

# Start standard mode (local development)
start:
    @echo "🚀 Starting standard mode..."
    docker-compose up -d
    @echo "✅ Standard mode started!"
    @echo "🌐 Frontend: http://localhost:${FRONTEND_PORT:-3000}"
    @echo "🔌 Backend: http://localhost:${BACKEND_PORT:-8080}"

# Start kiosk mode (demo/presentation)
start-kiosk:
    @echo "🎪 Starting kiosk mode..."
    docker-compose -f docker-compose-kiosk.yml --env-file .env.kiosk up -d
    @echo "✅ Kiosk mode started!"
    @echo "🌐 Frontend: http://localhost:3001"
    @echo "🔌 Backend: http://localhost:8081"
    @echo "🔄 Database resets every 15 minutes"

# Start cloudflared mode (with Cloudflare tunnel)
start-cloudflared:
    @echo "☁️ Starting cloudflared mode..."
    docker-compose -f docker-compose-cloudflared.yml --env-file .env.cloudflared up -d
    @echo "✅ Cloudflared mode started!"
    @echo "🌐 Frontend: http://localhost:3002"
    @echo "🔌 Backend: http://localhost:8082"
    @echo "☁️ Cloudflare tunnel active (check tunnel dashboard for public URL)"

# ============================================================================
# Docker Stop Operations
# ============================================================================

# Stop standard mode
stop:
    @echo "⏹️ Stopping standard mode..."
    docker-compose down
    @echo "✅ Standard mode stopped"

# Stop kiosk mode
stop-kiosk:
    @echo "⏹️ Stopping kiosk mode..."
    docker-compose -f docker-compose-kiosk.yml --env-file .env.kiosk down
    @echo "✅ Kiosk mode stopped"

# Stop cloudflared mode
stop-cloudflared:
    @echo "⏹️ Stopping cloudflared mode..."
    docker-compose -f docker-compose-cloudflared.yml --env-file .env.cloudflared down
    @echo "✅ Cloudflared mode stopped"

# Stop all modes
stop-all: stop stop-kiosk stop-cloudflared
    @echo "🛑 All modes stopped"

# ============================================================================
# Combined Operations
# ============================================================================

# Full workflow: pull, setup env, build, and start standard mode
deploy: pull setup-env build start
    @echo "🎉 Standard mode fully deployed!"

# Full workflow: pull, setup env, build, and start kiosk mode
deploy-kiosk: pull setup-env-kiosk build-kiosk start-kiosk
    @echo "🎉 Kiosk mode fully deployed!"

# Full workflow: pull, setup env, build, and start cloudflared mode
deploy-cloudflared: pull setup-env-cloudflared build-cloudflared start-cloudflared
    @echo "🎉 Cloudflared mode fully deployed!"

# ============================================================================
# Development Operations
# ============================================================================

# Restart standard mode (stop, build, start)
restart: stop build start
    @echo "🔄 Standard mode restarted"

# Restart kiosk mode (stop, build, start)
restart-kiosk: stop-kiosk build-kiosk start-kiosk
    @echo "🔄 Kiosk mode restarted"

# Restart kiosk mode completely (clean volume, build, start)
restart-kiosk-clean: clean-kiosk build-kiosk start-kiosk
    @echo "🔄 Kiosk mode completely restarted with fresh database"

# Restart cloudflared mode (stop, build, start)
restart-cloudflared: stop-cloudflared build-cloudflared start-cloudflared
    @echo "🔄 Cloudflared mode restarted"

# Restart cloudflared mode completely (clean volume, build, start)
restart-cloudflared-clean: clean-cloudflared build-cloudflared start-cloudflared
    @echo "🔄 Cloudflared mode completely restarted with fresh database"

# Show logs for standard mode
logs:
    @echo "📋 Showing logs for standard mode..."
    docker-compose logs -f

# Show logs for kiosk mode
logs-kiosk:
    @echo "📋 Showing logs for kiosk mode..."
    docker-compose -f docker-compose-kiosk.yml --env-file .env.kiosk logs -f

# Show logs for cloudflared mode
logs-cloudflared:
    @echo "📋 Showing logs for cloudflared mode..."
    docker-compose -f docker-compose-cloudflared.yml --env-file .env.cloudflared logs -f

# ============================================================================
# Maintenance Operations
# ============================================================================

# Clean up Docker system (remove unused containers, networks, images)
clean:
    @echo "🧹 Cleaning up Docker system..."
    docker system prune -f
    docker volume prune -f
    @echo "✅ Docker system cleaned"

# Clean kiosk mode completely (remove volume and containers)
clean-kiosk:
    @echo "🧹 Cleaning kiosk mode completely..."
    docker-compose -f docker-compose-kiosk.yml --env-file .env.kiosk down -v
    docker volume rm craft-inventory-app_postgres_kiosk_data || true
    @echo "✅ Kiosk mode cleaned completely"

# Clean cloudflared mode completely (remove volume and containers)
clean-cloudflared:
    @echo "🧹 Cleaning cloudflared mode completely..."
    docker-compose -f docker-compose-cloudflared.yml --env-file .env.cloudflared down -v
    docker volume rm craft-inventory-app_postgres_cloudflared_data || true
    @echo "✅ Cloudflared mode cleaned completely"

# Show status of all containers
ps:
    @echo "📊 Container status:"
    docker ps -a

# Show disk usage
disk-usage:
    @echo "💾 Docker disk usage:"
    docker system df

# ============================================================================
# Database Operations
# ============================================================================

# Connect to standard mode database
db:
    @echo "🗄️ Connecting to standard mode database..."
    docker-compose exec postgres psql -U craftuser craftdb

# Connect to kiosk mode database
db-kiosk:
    @echo "🗄️ Connecting to kiosk mode database..."
    docker-compose -f docker-compose-kiosk.yml --env-file .env.kiosk exec postgres-kiosk psql -U kiosk_db_m8n7 craftdb

# Connect to cloudflared mode database
db-cloudflared:
    @echo "🗄️ Connecting to cloudflared mode database..."
    docker-compose -f docker-compose-cloudflared.yml --env-file .env.cloudflared exec postgres-cloudflared psql -U cloud_db_x7z4 craftdb

# Backup standard mode database
backup:
    @echo "💾 Backing up standard mode database..."
    docker-compose exec postgres pg_dump -U craftuser craftdb > backup-$(date +%Y%m%d-%H%M%S).sql
    @echo "✅ Database backup created"

# ============================================================================
# Testing Operations
# ============================================================================

# Test if kiosk mode is working (check reset endpoint)
test-kiosk:
    @echo "🧪 Testing kiosk mode..."
    curl -s http://localhost:8081/api/kiosk/status | jq .
    @echo "✅ Kiosk mode test completed"

# Health check for all services
health:
    @echo "🏥 Health check for all services..."
    @echo "Standard mode backend:"
    curl -s http://localhost:8080/api/materials || echo "❌ Standard backend not responding"
    @echo "\nKiosk mode backend:"
    curl -s http://localhost:8081/api/kiosk/status || echo "❌ Kiosk backend not responding"
    @echo "\nCloudflared mode backend:"
    curl -s http://localhost:8082/api/materials || echo "❌ Cloudflared backend not responding"
    @echo "✅ Health check completed"
