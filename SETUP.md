# 🚀 Quick Setup Guide

This guide will help you get the Craft Inventory Management System up and running quickly.

## Prerequisites

- **Docker** and **Docker Compose** installed
- **Node.js** (v16 or higher) for local development
- **Git** for cloning the repository

## Quick Start with Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd craft-inventory-app
   ```

2. **Set up environment files**
   ```bash
   # Backend environment
   cp backend/.env.template backend/.env
   
   # Frontend environment  
   cp frontend/.env.template frontend/.env.local
   ```

3. **Configure your environment**
   
   Edit `backend/.env`:
   ```env
   DATABASE_URL=postgres://craftuser:your_secure_password@172.28.1.2:5432/craftdb
   PORT=8080
   ```
   
   Edit `frontend/.env.local`:
   ```env
   VITE_API_BASE_URL=http://localhost:8080/api
   ```

4. **Start the application**
   ```bash
   # For Mac users
   docker-compose -f docker-compose-mac.yml up -d
   
   # For other systems
   docker-compose up -d
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080/api

## Kiosk Mode Setup

For public-facing kiosk installations:

1. **Use kiosk configuration**
   ```bash
   docker-compose -f docker-compose-kiosk.yml up -d
   ```

2. **Configure kiosk environment**
   ```bash
   cp backend/.env.template backend/.env.kiosk
   cp frontend/.env.template frontend/.env.kiosk
   ```
   
   Add to backend/.env.kiosk:
   ```env
   KIOSK_MODE=true
   KIOSK_RESET_INTERVAL_MINUTES=15
   ```
   
   Add to frontend/.env.kiosk:
   ```env
   VITE_KIOSK_MODE=true
   ```

### Configurable Reset Interval

You can customize how often the database resets in kiosk mode:

- **Quick demos**: `KIOSK_RESET_INTERVAL_MINUTES=5` (5 minutes)
- **Standard kiosk**: `KIOSK_RESET_INTERVAL_MINUTES=15` (15 minutes - default)  
- **Long sessions**: `KIOSK_RESET_INTERVAL_MINUTES=60` (1 hour)
- **Daily reset**: `KIOSK_RESET_INTERVAL_MINUTES=1440` (24 hours)

Valid range: 1-1440 minutes (1 minute to 24 hours)

## Manual Setup (Development)

If you prefer to run without Docker:

1. **Database Setup**
   - Install PostgreSQL
   - Create database: `craftdb`
   - Create user: `craftuser`

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.template .env
   # Configure your .env file
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp .env.template .env.local
   # Configure your .env.local file
   npm run dev
   ```

## Default Login

- **Username**: admin
- **Password**: admin123

⚠️ **Important**: Change the default password after first login!

## Environment Variables Reference

### Backend (.env)
- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Server port (default: 8080)
- `KIOSK_MODE`: Enable kiosk mode (true/false)
- `KIOSK_RESET_INTERVAL_MINUTES`: Reset interval in minutes (default: 15, range: 1-1440)
- `NODE_ENV`: Environment (development/production)

### Frontend (.env.local)
- `VITE_API_BASE_URL`: Backend API URL
- `VITE_KIOSK_MODE`: Enable frontend kiosk mode
- `VITE_DEFAULT_LANG`: Default language (en/it)

## Troubleshooting

### Common Issues

1. **Port conflicts**
   - Change ports in docker-compose.yml or .env files

2. **Database connection issues**
   - Verify DATABASE_URL in backend/.env
   - Ensure PostgreSQL is running

3. **CORS errors**
   - Check VITE_API_BASE_URL in frontend/.env.local
   - Verify backend is accessible

### Getting Help

- Check the logs: `docker-compose logs`
- Verify services: `docker-compose ps`
- Restart services: `docker-compose restart`

## Security Notes

- Always change default passwords
- Use strong passwords in production
- Keep .env files out of version control
- Use HTTPS in production
- Regular database backups recommended

## Next Steps

1. 📚 Read the full README.md for detailed information
2. 🔧 Customize the application for your needs
3. 📊 Import your inventory data
4. 👥 Set up user accounts
5. 🚀 Deploy to production

---

Happy crafting! 🎨✨
