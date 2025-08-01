# Craft Inventory Management System

A comprehensive inventory management application for artisan businesses, designed to track materials, components, finished products, and transactions with ease.

## 🚀 Quick Start

### Option 1: Standard Mode (Recommended for Local Development)

```bash
# Clone and start
git clone https://github.com/made2591/craft-inventory.git
cd craft-inventory-app

# Copy environment configuration
cp .env.example .env

# Start the application
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
```

### Option 2: Kiosk Demo Mode (Perfect for Presentations)

```bash
# Start isolated kiosk environment with tunnel support
cp .env.kiosk.example .env.kiosk
# Edit .env.kiosk to configure your tunnel name (optional)
docker-compose -f docker-compose-kiosk.yml up -d

# Access the kiosk demo
# Local: http://localhost:3001
# Backend API: http://localhost:8081
# Public: https://your-kiosk-tunnel-domain.com (if tunnel configured)
# Note: Database resets every 15 minutes with fresh demo data
```

### Option 3: Cloudflared Mode (Public Access via Cloudflare Tunnel)

```bash
# Setup cloudflare tunnel first (see Cloudflare Tunnel Setup section)
cp .env.cloudflared.example .env.cloudflared
# Edit .env.cloudflared to configure your tunnel name

# Start with Cloudflare tunnel
docker-compose -f docker-compose-cloudflared.yml up -d

# Access locally: http://localhost:3000
# Access globally: https://your-tunnel-domain.com
```

## ☁️ Cloudflare Tunnel Setup

To use the cloudflared mode for public access:

1. **Install Cloudflare CLI** (cloudflared):

   ```bash
   # macOS
   brew install cloudflared
   
   # Linux
   wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
   sudo dpkg -i cloudflared-linux-amd64.deb
   ```

2. **Authenticate with Cloudflare**:

   ```bash
   cloudflared tunnel login
   ```

3. **Create a tunnel**:

   ```bash
   cloudflared tunnel create your-tunnel-name
   ```

4. **Configure the tunnel** by creating `./cloudflared/config.yml`:

   ```yaml
   tunnel: your-tunnel-uuid
   credentials-file: /etc/cloudflared/your-tunnel-uuid.json
   
   ingress:
     - hostname: your-domain.com
       service: http://172.28.1.4:80  # Frontend container
     - service: http_status:404
   ```

5. **Update environment variables** in `.env.cloudflared`:

   ```bash
   CLOUDFLARE_TUNNEL_NAME=your-tunnel-name
   CLOUDFLARE_CONFIG_PATH=./cloudflared
   ```

6. **Copy tunnel credentials** to the cloudflared directory:

   ```bash
   cp ~/.cloudflared/your-tunnel-uuid.json ./cloudflared/
   ```

**Note**: Both kiosk mode and cloudflared mode support Cloudflare tunnels. Kiosk mode adds automatic database resets every 15 minutes for demonstration purposes, while cloudflared mode is designed for persistent public access.

## 🔐 Default Login

- **Username**: admin
- **Password**: admin123

⚠️ **Change the default password after first login!**

## 🎯 Key Features

- **Complete Inventory Management**: Track materials, components, and finished products
- **Transaction Management**: Handle purchases from suppliers and sales to customers
- **Multi-Language Support**: Available in English and Italian
- **Kiosk Demo Mode**: Automatic database reset every 15 minutes for demos
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **RESTful API**: Clean API architecture for easy integration

## 🛠 Technology Stack

- **Backend**: Node.js with Express.js framework
- **Frontend**: Vue 3 with Vue Router and responsive CSS
- **Database**: PostgreSQL with automated migrations
- **Containerization**: Docker and Docker Compose

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[📋 Setup Guide](docs/SETUP.md)** | Detailed installation and configuration instructions |
| **[🏗 Architecture Guide](docs/architecture.md)** | System architecture and API documentation |
| **[🎪 Kiosk Mode Guide](docs/KIOSK_MODE.md)** | Complete kiosk mode setup and usage |
| **[🐳 Docker Guide](docs/DOCKER_COMPOSE.md)** | Docker deployment configurations |

## ⚙️ Environment Configuration

The application supports comprehensive environment configuration for different deployment modes:

- **`.env.example`**: Standard mode (local development) configuration template
- **`.env.kiosk.example`**: Kiosk demo mode configuration template  
- **`.env.cloudflared.example`**: Cloudflared mode (with tunnel) configuration template
- **`backend/.env.example`**: Backend application configuration template
- **`backend/.env.kiosk.example`**: Backend kiosk mode configuration template
- **`frontend/.env.example`**: Frontend application configuration template
- **`frontend/.env.kiosk.example`**: Frontend kiosk configuration template

Copy the appropriate example files to remove the `.example` extension and customize for your environment.

## 🎪 Kiosk Demo Mode

Perfect for trade shows and demonstrations:

- **Automatic Reset**: Database resets every 15 minutes with fresh test data
- **Complete Isolation**: Separate database and network from standard mode
- **Manual Reset**: API endpoint for on-demand database reset
- **Status Monitoring**: Real-time status API for kiosk state
- **Same as Cloudflared**: Uses the same infrastructure as cloudflared mode but for demo purposes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for your own craft business or as a learning resource.

---

**Need help?** Check out the [detailed documentation](docs/) or open an issue on GitHub.
