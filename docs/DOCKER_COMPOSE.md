# Docker Compose Configuration Guide

This project includes three Docker Compose configurations designed for different deployment scenarios with **complete environment isolation** between configurations.

## 🔒 Environment Architecture

Each environment is completely isolated with separate databases, networks, and volumes:

| Environment | Purpose | Database | Network Subnet | DB Port | Backend Port | Frontend Port | Special Features |
|-------------|---------|----------|----------------|---------|--------------|---------------|-------------------|
| **Standard** | Local Development | `craftdb` | 172.28.x.x | 5432 | 8080 | 3000 | Local development optimized |
| **Kiosk** | Demo/Presentations | `craftdb` | 172.30.x.x | 5433 | 8081 | 3001 | Auto-reset every 15min + Cloudflare tunnel support |
| **Cloudflared** | Public Access | `craftdb` | 172.28.x.x | 5432 | 8080 | 3000 | Integrated Cloudflare tunnel |

## 📋 Available Configurations

### `docker-compose.yml` (Standard Local Development)

**Purpose**: Local development environment optimized for development workflow

- **Target Use**: Local development, testing, debugging
- **Database**: `craftdb` on 172.28.1.2:5432
- **Kiosk Mode**: Disabled by default
- **Ports**: Frontend (3000), Backend (8080), Database (5432)
- **Network**: craft-network (172.28.x.x subnet)
- **Volume**: postgres_data (persistent storage)
- **Special Features**: Development-optimized, hot reload support

**Quick Start:**
```bash
# Start local development environment
docker-compose up -d

# Access application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
# Database: localhost:5432
```

**Environment Configuration:**
```bash
# Copy environment template
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start development
docker-compose up -d
```

### `docker-compose-kiosk.yml` (Demo/Kiosk Mode)

**Purpose**: Completely isolated environment for demonstrations, trade shows, and kiosk deployments

- **Target Use**: Trade shows, demos, presentations, kiosk mode (**COMPLETELY ISOLATED**)
- **Database**: `craftdb` on 172.30.1.2:5433 (**separate database**)
- **Kiosk Mode**: Enabled by default with automatic 15-minute resets
- **Ports**: Frontend (3001), Backend (8081), Database (5433)
- **Network**: craft-kiosk-network (172.30.x.x subnet)
- **Volume**: postgres_kiosk_data (**separate volume**)
- **Cloudflare Tunnel**: Optional support for public demo access
- **Reset Interval**: Configurable via `KIOSK_RESET_INTERVAL_MINUTES`

**Quick Start:**
```bash
# Start isolated kiosk environment
cp .env.kiosk.example .env.kiosk
# Optional: Configure CLOUDFLARE_TUNNEL_NAME for public access
docker-compose -f docker-compose-kiosk.yml up -d

# Access kiosk demo
# Local: http://localhost:3001
# Backend API: http://localhost:8081
# Public: https://your-kiosk-domain.com (if tunnel configured)

# Check kiosk status
curl http://localhost:8081/api/kiosk/status

# Monitor auto-reset logs
docker-compose -f docker-compose-kiosk.yml logs -f backend-kiosk
```

**Kiosk Features:**
- **Automatic Database Reset**: Every 15 minutes (configurable)
- **Manual Reset API**: On-demand reset via `/api/kiosk/reset`
- **Complete Isolation**: No shared resources with other environments
- **Demo Safety**: Cannot affect development data
- **Cloudflare Tunnel**: Optional public access for remote demos
- **Status Monitoring**: Real-time kiosk status via API

### `docker-compose-cloudflared.yml` (Public Access via Cloudflare Tunnel)

**Purpose**: Production-ready deployment with integrated Cloudflare tunnel for secure public access

- **Target Use**: Production deployment, public access, secure remote access
- **Database**: `craftdb` on 172.28.1.2:5432
- **Kiosk Mode**: Disabled (standard application mode)
- **Ports**: Frontend (3000), Backend (8080), Database (5432)
- **Network**: craft-network (172.28.x.x subnet)
- **Volume**: postgres_data_cloudflared (separate from dev)
- **Cloudflare Tunnel**: Integrated cloudflared container for secure public access
- **Security**: No exposed ports, all traffic through secure tunnel

**Quick Start:**
```bash
# Setup Cloudflare tunnel first (see Cloudflare Setup section)
cp .env.cloudflared.example .env.cloudflared
# Configure your tunnel name in .env.cloudflared

# Start with Cloudflare tunnel
docker-compose -f docker-compose-cloudflared.yml up -d

# Access
# Local: http://localhost:3000
# Public: https://your-domain.com (via tunnel)
# Backend API: http://localhost:8080 (local) or https://api.your-domain.com (public)
```

**Cloudflared Features:**
- **Secure Public Access**: No firewall configuration needed
- **Zero Trust Security**: All traffic through Cloudflare's secure tunnel
- **Custom Domains**: Use your own domain with SSL
- **Production Ready**: Optimized for production workloads
- **DDoS Protection**: Built-in Cloudflare protection

## ☁️ Cloudflare Tunnel Setup

Both kiosk and cloudflared modes support Cloudflare tunnels. Here's how to set them up:

### 1. Install Cloudflared CLI
```bash
# macOS
brew install cloudflared

# Linux
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
```

### 2. Authenticate and Create Tunnel
```bash
# Login to Cloudflare
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create your-tunnel-name
```

### 3. Configure Tunnel
```bash
# Create cloudflared directory if not exists
mkdir -p ./cloudflared

# Copy config example
cp ./cloudflared/config.yml.example ./cloudflared/config.yml

# Edit config.yml with your tunnel UUID and domain
# Copy tunnel credentials
cp ~/.cloudflared/your-tunnel-uuid.json ./cloudflared/
```

### 4. Update Environment Variables
```bash
# For production cloudflared mode
echo "CLOUDFLARE_TUNNEL_NAME=your-tunnel-name" >> .env.cloudflared

# For kiosk mode with tunnel
echo "CLOUDFLARE_TUNNEL_NAME=your-kiosk-tunnel-name" >> .env.kiosk
```

## 🚀 Multi-Environment Deployment

### Running Multiple Environments Simultaneously

All three environments can run in parallel without conflicts:

```bash
# Start local development
docker-compose up -d

# Start kiosk environment in parallel (different ports/networks)
docker-compose -f docker-compose-kiosk.yml up -d

# Start cloudflared environment (different volume)
docker-compose -f docker-compose-cloudflared.yml up -d

# Now you have all three running:
# Development: http://localhost:3000
# Kiosk: http://localhost:3001 + https://kiosk-domain.com
# Production: http://localhost:3000 + https://your-domain.com
```

### Environment Status Check

```bash
# Check development environment
docker-compose ps
curl http://localhost:8080/api/materials

# Check kiosk environment
docker-compose -f docker-compose-kiosk.yml ps
curl http://localhost:8081/api/kiosk/status

# Check cloudflared environment
docker-compose -f docker-compose-cloudflared.yml ps
curl http://localhost:8080/api/materials
```

## ⚙️ Configuration Management

### Environment Variables

Each configuration uses different environment files:

**Standard Development:**
```bash
.env                     # Docker Compose variables
backend/.env            # Backend configuration
frontend/.env           # Frontend configuration
```

**Kiosk Mode:**
```bash
.env.kiosk              # Docker Compose + Cloudflare variables
backend/.env.kiosk      # Backend kiosk configuration
frontend/.env.kiosk     # Frontend kiosk configuration
```

**Cloudflared Mode:**
```bash
.env.cloudflared        # Docker Compose + Cloudflare variables
backend/.env            # Backend configuration (shared with dev)
frontend/.env           # Frontend configuration (shared with dev)
```

### Network Configuration

**Development/Cloudflared Networks:**
- **Network Name**: craft-network
- **Subnet**: 172.28.0.0/16
- **Gateway**: 172.28.0.1
- **Database IP**: 172.28.1.2
- **Backend IP**: 172.28.1.3
- **Frontend IP**: 172.28.1.4
- **Cloudflared IP**: 172.28.1.5 (cloudflared mode only)

**Kiosk Network:**
- **Network Name**: craft-kiosk-network
- **Subnet**: 172.30.0.0/16
- **Gateway**: 172.30.0.1
- **Database IP**: 172.30.1.2
- **Backend IP**: 172.30.1.3
- **Frontend IP**: 172.30.1.4
- **Cloudflared IP**: 172.30.1.5

## 🔧 Advanced Operations

### Database Management

**Development Environment:**
```bash
# Database backup
docker-compose exec postgres pg_dump -U craftuser craftdb > dev_backup.sql

# Database restore
docker-compose exec -T postgres psql -U craftuser craftdb < dev_backup.sql

# Database shell access
docker-compose exec postgres psql -U craftuser craftdb
```

**Kiosk Environment:**
```bash
# Database backup (separate kiosk database)
docker-compose -f docker-compose-kiosk.yml exec postgres-kiosk pg_dump -U craftuser craftdb > kiosk_backup.sql

# Database shell access
docker-compose -f docker-compose-kiosk.yml exec postgres-kiosk psql -U craftuser craftdb
```

**Cloudflared Environment:**
```bash
# Database backup
docker-compose -f docker-compose-cloudflared.yml exec postgres pg_dump -U craftuser craftdb > prod_backup.sql

# Database shell access
docker-compose -f docker-compose-cloudflared.yml exec postgres psql -U craftuser craftdb
```

### Log Management

```bash
# View logs for specific environment
docker-compose logs -f backend
docker-compose -f docker-compose-kiosk.yml logs -f backend-kiosk
docker-compose -f docker-compose-cloudflared.yml logs -f backend

# View cloudflared tunnel logs
docker-compose -f docker-compose-kiosk.yml logs -f cloudflared-kiosk
docker-compose -f docker-compose-cloudflared.yml logs -f cloudflared
```

## 🛠 Troubleshooting

### Port Conflicts

```bash
# Check what's using a port
lsof -i :3000
lsof -i :3001
lsof -i :8080
lsof -i :8081

# Kill processes using ports
sudo kill -9 <PID>
```

### Tunnel Issues

```bash
# Check tunnel status
docker-compose -f docker-compose-cloudflared.yml logs cloudflared

# Test tunnel connectivity
cloudflared tunnel info your-tunnel-name

# Restart tunnel
docker-compose -f docker-compose-cloudflared.yml restart cloudflared
```

### Clean Restart

```bash
# Complete environment cleanup and restart
docker-compose down -v
docker-compose -f docker-compose-kiosk.yml down -v
docker-compose -f docker-compose-cloudflared.yml down -v
docker system prune -f
docker-compose up -d --build
```

## 📊 Environment Comparison

| Feature | Development | Kiosk | Cloudflared |
|---------|-------------|-------|-------------|
| **Purpose** | Local Dev | Demo/Kiosk | Production |
| **Database** | craftdb | craftdb (isolated) | craftdb (isolated) |
| **Ports** | 3000/8080 | 3001/8081 | 3000/8080 |
| **Network** | 172.28.x.x | 172.30.x.x | 172.28.x.x |
| **Auto-Reset** | No | Yes (15min) | No |
| **Cloudflare Tunnel** | No | Optional | Integrated |
| **Data Persistence** | Full | Demo Only | Full |
| **Isolation Level** | Standard | Complete | Complete |
| **Public Access** | No | Optional | Yes |
| **Parallel Execution** | Yes | Yes | Yes |

## 🎯 Best Practices

### For Development
- Use `docker-compose.yml` for local development
- Keep environment files (.env) outside version control
- Use hot reload for faster development cycle
- Test locally before deploying to production

### For Production
- Use `docker-compose-cloudflared.yml` with proper tunnel setup
- Implement proper backup strategies
- Monitor tunnel health and application logs
- Use production-grade environment variables

### For Demonstrations
- Always use `docker-compose-kiosk.yml` for demos
- Configure tunnel for remote demo access if needed
- Test auto-reset functionality before presentations
- Monitor kiosk status during events

### Security Considerations
- Never commit actual environment files to version control
- Use strong passwords and secure tunnel credentials
- Regularly rotate tunnel credentials
- Monitor access logs for unusual activity

This comprehensive Docker Compose setup provides maximum flexibility while ensuring complete isolation between different deployment scenarios, with integrated Cloudflare tunnel support for secure public access.
