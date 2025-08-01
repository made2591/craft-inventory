# Configuration Management Guide

This guide explains how to manage environment configurations for the Craft Inventory Management System.

## 🔧 Environment Files Configuration

### Main Development Environment
- **File**: `backend/.env`
- **Purpose**: Development and production configuration
- **Database**: `craftdb`
- **Kiosk Mode**: Disabled by default

### Kiosk Environment  
- **File**: `backend/.env.kiosk`
- **Purpose**: Public kiosk/demo configuration
- **Database**: `craftdb_kiosk` (completely isolated)
- **Kiosk Mode**: Enabled by default

## 📝 Local Customization

All `.env` files are **gitignored** for security and local customization:

```gitignore
# Environment files - keep these local
backend/.env
backend/.env.kiosk
frontend/.env.local
frontend/.env.kiosk
```

### Benefits:
- ✅ **Security**: No credentials in version control
- ✅ **Flexibility**: Each developer/deployment can have custom settings
- ✅ **Easy updates**: Change settings without affecting others
- ✅ **Environment isolation**: Different configs for different purposes

## ⚙️ Kiosk Reset Interval Configuration

### Customizing Reset Frequency

Edit `backend/.env.kiosk` to change the reset interval:

```env
# Standard kiosk setup
DATABASE_URL=postgres://craftuser:craftpassword@172.30.1.2:5432/craftdb_kiosk
PORT=8080
KIOSK_MODE=true
KIOSK_RESET_INTERVAL_MINUTES=15
```

### Common Configurations:

#### Quick Demos (5 minutes)
```env
KIOSK_RESET_INTERVAL_MINUTES=5
```

#### Trade Shows/Exhibitions (30 minutes)
```env
KIOSK_RESET_INTERVAL_MINUTES=30
```

#### Long Presentations (1 hour)
```env
KIOSK_RESET_INTERVAL_MINUTES=60
```

#### Daily Kiosks (24 hours)
```env
KIOSK_RESET_INTERVAL_MINUTES=1440
```

## 🚀 Usage Workflow

### Initial Setup
1. **Copy template files**:
   ```bash
   cp backend/.env.template backend/.env
   cp backend/.env.template backend/.env.kiosk
   cp frontend/.env.template frontend/.env.local
   cp frontend/.env.template frontend/.env.kiosk
   ```

2. **Customize your local configurations**:
   - Edit `backend/.env.kiosk` for your kiosk setup
   - Set your preferred `KIOSK_RESET_INTERVAL_MINUTES`
   - Configure database credentials if needed

3. **Start your environment**:
   ```bash
   # Main environment
   docker-compose up -d
   
   # Kiosk environment (with your custom interval)
   docker-compose -f docker-compose-kiosk.yml up -d
   ```

### Making Changes
1. **Edit `.env.kiosk` locally** - changes are not committed
2. **Restart container** to apply changes:
   ```bash
   docker-compose -f docker-compose-kiosk.yml restart backend-kiosk
   ```

3. **Check logs** to verify new settings:
   ```bash
   docker-compose -f docker-compose-kiosk.yml logs backend-kiosk
   ```

## 🔍 Verification

### Check Current Configuration
```bash
# Via API status endpoint
curl http://localhost:8081/api/kiosk/status

# Via container logs
docker-compose -f docker-compose-kiosk.yml logs backend-kiosk | grep "KIOSK MODE"
```

### Expected Output
```
🏪 KIOSK MODE ENABLED: Database will be reset every 15 minutes
🏪 KIOSK MODE: Reset interval set to 15 minutes (900000ms)
🏪 KIOSK MODE: First reset scheduled in 15 minutes at [timestamp]
```

## 🎯 Best Practices

1. **Never commit `.env` files** - they're gitignored for good reason
2. **Use templates** - `*.env.template` files show required variables
3. **Document custom configs** - add comments in your local `.env` files
4. **Test before demos** - verify reset intervals work as expected
5. **Backup configurations** - keep copies of working configurations
6. **Use appropriate intervals** - match reset frequency to your use case

## 🔧 Troubleshooting

### Configuration Not Applied
- **Check file location**: Ensure `.env.kiosk` is in `backend/` directory
- **Restart container**: `docker-compose -f docker-compose-kiosk.yml restart backend-kiosk`
- **Check logs**: Look for configuration loading messages

### Reset Not Working
- **Verify KIOSK_MODE=true** in `.env.kiosk`
- **Check interval value** is within valid range (1-1440)
- **Monitor logs** for reset execution messages

### Port Conflicts
- **Different environments use different ports** by design
- **Main**: 8080, **Kiosk**: 8081
- **Check if ports are available**: `lsof -i :8081`

---

This configuration approach ensures maximum flexibility while maintaining security and ease of use for both development and production deployments.
