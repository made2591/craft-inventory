# Cloudflared Directory

This directory contains Cloudflare tunnel configuration files.

## Setup Instructions

1. **Create your tunnel**:
   ```bash
   cloudflared tunnel create your-tunnel-name
   ```

2. **Copy the configuration example**:
   ```bash
   cp config.yml.example config.yml
   ```

3. **Edit config.yml** with your tunnel UUID and domain

4. **Copy your tunnel credentials**:
   ```bash
   cp ~/.cloudflared/your-tunnel-uuid.json ./
   ```

5. **Start the application**:
   ```bash
   docker-compose -f docker-compose-cloudflared.yml up -d
   ```

## Files

- `config.yml.example` - Configuration template
- `config.yml` - Your actual configuration (git ignored)
- `your-tunnel-uuid.json` - Tunnel credentials (git ignored)

## Security Note

The actual `config.yml` and `*.json` credential files are git ignored for security.
