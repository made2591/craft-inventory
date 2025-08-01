# Environment Variables Configuration Guide

This guide explains how to set up environment variables for all Docker Compose configurations.

## Quick Setup

### Standard Mode
```bash
# Copy environment files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start application
docker-compose up -d
```

### Kiosk Mode
```bash
# Copy environment files  
cp .env.kiosk.example .env.kiosk
cp backend/.env.kiosk.example backend/.env.kiosk
cp frontend/.env.kiosk.example frontend/.env.kiosk

# Start application
docker-compose -f docker-compose-kiosk.yml --env-file .env.kiosk up -d
```

### Cloudflared Mode (Public Access)
```bash
# Copy environment files
cp .env.cloudflared.example .env.cloudflared
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Configure your Cloudflare tunnel name in .env.cloudflared
# CLOUDFLARE_TUNNEL_NAME=your-tunnel-name

# Start application
docker-compose -f docker-compose-cloudflared.yml --env-file .env.cloudflared up -d
```

## Environment Files Structure

### Root Level (.env files)
- **`.env`**: Docker Compose variables for local development
- **`.env.kiosk`**: Kiosk-specific Docker Compose configuration with tunnel support
- **`.env.cloudflared`**: Cloudflared mode configuration for public access

### Application Level
- **`backend/.env`**: Backend application configuration (shared between dev and cloudflared)
- **`backend/.env.kiosk`**: Backend kiosk-specific configuration
- **`frontend/.env`**: Frontend application configuration (shared between dev and cloudflared)
- **`frontend/.env.kiosk`**: Frontend kiosk-specific configuration

## Customization

You can customize any values in the `.env` files to match your environment:
- Change ports to avoid conflicts
- Modify database credentials
- Adjust network configurations
- Set different container names

All Docker Compose files now use environment variables, making deployment flexible and secure.
