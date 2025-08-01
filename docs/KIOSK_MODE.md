# Kiosk Demo Mode - Craft Inventory Management System

## 🎪 Overview

Kiosk Mode is a special feature of the Craft Inventory Management System that automatically resets the database every 15 minutes (configurable), restoring all data to the initial test values. This mode is perfect for demonstrations, trade shows, and testing environments where you need consistent, clean data.

## 🎯 Use Cases

- **Demonstrations & Presentations**: Always maintain clean, consistent data for demos
- **Trade Shows & Events**: Allow multiple users to test the application without accumulating clutter
- **Automated Testing**: Ensure a clean environment for each test cycle
- **Shared Development Environments**: Periodically restore initial state
- **Training & Education**: Provide consistent training scenarios
- **Proof of Concept**: Showcase features without permanent data modifications

## 🚀 Quick Setup

### Method 1: Dedicated Kiosk Environment (RECOMMENDED)

The easiest way to use Kiosk Mode is with the dedicated Docker Compose configuration:

```bash
# Start the isolated kiosk environment
docker-compose -f docker-compose-kiosk.yml up -d

# Access the kiosk application
# Frontend: http://localhost:3001
# Backend API: http://localhost:8081
```

**Benefits of the dedicated kiosk setup:**
- ✅ **Pre-configured**: KIOSK_MODE enabled by default
- ✅ **Isolated Ports**: No conflicts with standard environment (3001 vs 3000)
- ✅ **Separate Network**: Dedicated subnet (172.30.x.x) for complete isolation
- ✅ **Independent Database**: Separate database container (craftdb_kiosk)
- ✅ **Parallel Operation**: Can run alongside standard environment
- ✅ **Clean Separation**: No shared volumes or dependencies

### Method 2: Configure Existing Environment

Modify your existing `docker-compose.yml`:

```yaml
services:
  backend:
    environment:
      KIOSK_MODE: "true"                    # Enable kiosk mode
      KIOSK_RESET_INTERVAL_MINUTES: "15"    # Reset every 15 minutes (configurable)
```

## ⚙️ Configuration Options

### Environment Variables

Copy and customize the appropriate environment file:

```bash
# For kiosk backend configuration
cp backend/.env.kiosk.example backend/.env.kiosk

# For kiosk frontend configuration  
cp frontend/.env.kiosk.example frontend/.env.kiosk
```

**Key Kiosk Configuration Variables:**

| Variable | Default | Description |
|----------|---------|-------------|
| `KIOSK_MODE` | `"false"` | Enable/disable kiosk mode |
| `KIOSK_RESET_INTERVAL_MINUTES` | `"15"` | Minutes between automatic resets |
| `LOG_LEVEL` | `"info"` | Logging level for reset operations |
| `NODE_ENV` | `"production"` | Environment mode for kiosk |

## 🔄 Kiosk Mode Features

### Automatic Database Reset
- **Scheduled Resets**: Configurable interval (default: 15 minutes)
- **Complete Data Refresh**: All tables cleared and repopulated with test data
- **Consistent State**: Always returns to the same known state
- **Performance Optimized**: Fast reset operations with minimal downtime

### Manual Reset Capability
- **On-Demand Reset**: Trigger reset via API endpoint
- **Immediate Effect**: Instant database refresh without waiting for schedule
- **Status Monitoring**: Real-time information about reset status and timing

### Enhanced Logging
- **Detailed Reset Logs**: Complete information about reset operations
- **Performance Metrics**: Timing and success/failure tracking
- **Error Handling**: Comprehensive error reporting and recovery

### Safety Features
- **Environment Protection**: Only works when KIOSK_MODE is explicitly enabled
- **Confirmation Required**: Manual resets require explicit API calls
- **Status Verification**: Always check kiosk status before destructive operations

## 🔌 API Endpoints

### GET /api/kiosk/status

Returns comprehensive information about the kiosk mode status.

**Example Response (KIOSK_MODE=true):**

```json
{
  "kioskMode": true,
  "resetInterval": "15 minutes",
  "status": "ACTIVE - Automatic reset enabled",
  "message": "Database automatically resets every 15 minutes",
  "nextReset": "2025-08-01T10:45:00.000Z",
  "uptime": "8m 32s"
}
```

**Example Response (KIOSK_MODE=false):**

```json
{
  "kioskMode": false,
  "resetInterval": null,
  "status": "INACTIVE - Automatic reset disabled", 
  "message": "To enable kiosk mode, set KIOSK_MODE=true in docker-compose"
}
```

### POST /api/kiosk/reset

Triggers an immediate manual database reset.

**Requirements:**
- `KIOSK_MODE` must be set to `"true"`

**Success Response:**

```json
{
  "message": "Database reset successfully completed",
  "timestamp": "2025-08-01T10:30:00.000Z",
  "kioskMode": true,
  "resetDuration": "2.1s"
}
```

**Error Response (KIOSK_MODE=false):**

```json
{
  "error": "Manual reset not allowed: KIOSK_MODE is not enabled",
  "kioskMode": false,
  "statusCode": 403
}
```

## 🔄 Reset Process Details

### Automatic Reset Schedule
- **Default Interval**: Every 15 minutes (configurable via `KIOSK_RESET_INTERVAL_MINUTES`)
- **First Reset**: 15 minutes after server startup
- **Subsequent Resets**: Every 15 minutes from the first reset
- **Precision**: Runs exactly at scheduled times

### Operations During Reset

1. **Transaction Start**: All operations are atomic
2. **Disable FK Constraints**: Temporarily disable for clean deletion
3. **Clear Tables**: Remove all data from core tables:
   - `transaction_items`
   - `transactions` 
   - `model_materials`
   - `inventory_items`
   - `model_components`
   - `product_models`
   - `component_materials`
   - `components`
   - `materials`
   - `suppliers`
   - `customers`
   - `users`
4. **Re-enable FK Constraints**: Restore referential integrity
5. **Repopulate Data**: Execute initialization files:
   - `01-init.sql`: Create structures (if needed)
   - `02-seed-data.sql`: Insert test data
6. **Commit Transaction**: Confirm all changes

## 📋 Logging & Monitoring

### Startup Logs

When the server starts, kiosk mode status is displayed:

```bash
🏪 KIOSK MODE ENABLED: Database will be reset every 15 minutes
⏰ Next reset scheduled for: 2025-08-01T10:45:00.000Z
```

or

```bash
🔒 KIOSK MODE DISABLED: Database will not be automatically reset
```

### Automatic Reset Logs

During each automatic reset:

```bash
🔄 KIOSK MODE: Starting scheduled database reset...
🔄 KIOSK MODE: Clearing all tables...
🔄 KIOSK MODE: Executing init file: 01-init.sql
🔄 KIOSK MODE: Executing init file: 02-seed-data.sql  
✅ KIOSK MODE: Database reset completed successfully in 2.1s
⏰ KIOSK MODE: Next reset scheduled for: 2025-08-01T11:00:00.000Z
```

### Manual Reset Logs

During API-triggered reset:

```bash
🔄 API RESET: Manual database reset requested...
🔄 API RESET: Clearing all tables...
🔄 API RESET: Executing init file: 01-init.sql
🔄 API RESET: Executing init file: 02-seed-data.sql
✅ API RESET: Database reset completed successfully in 1.8s
```

## 🔒 Security & Safety

### Built-in Protections

- ✅ **Environment Validation**: Only works when `KIOSK_MODE=true`
- ✅ **Atomic Transactions**: Automatic rollback on any error
- ✅ **Comprehensive Error Handling**: Detailed error logging and recovery
- ✅ **Default Disabled**: Safe default configuration
- ✅ **API Authentication**: Optional JWT protection for reset endpoints

### Production Safety Guidelines

- ❌ **NEVER use in production**: Kiosk mode DELETES ALL DATA
- ✅ **Test/Demo environments only**: Use exclusively for testing purposes
- ✅ **Backup before enabling**: Always have backups before enabling kiosk mode
- ✅ **Monitor logs**: Check logs regularly to ensure proper operation
- ✅ **Network isolation**: Use separate networks for kiosk environments

## 🛠 Troubleshooting

### Reset Not Occurring

1. **Check Environment Variable**: Ensure `KIOSK_MODE="true"` (with quotes)
2. **Review Backend Logs**: Check container logs for error messages
3. **Verify Database Connection**: Ensure database is accessible
4. **Check Timing**: Wait for the full interval (15 minutes by default)

### Reset Errors

1. **Review Error Logs**: Check detailed error messages in backend logs
2. **Validate Init Files**: Ensure `init-db/*.sql` files are present and valid
3. **Database Connectivity**: Verify database connection and permissions
4. **SQL Syntax**: Check for syntax errors in initialization scripts

### Manual Reset Not Working

1. **Environment Check**: Verify `KIOSK_MODE="true"`
2. **Status API**: Check response from `/api/kiosk/status`
3. **Endpoint Accessibility**: Ensure `/api/kiosk/reset` is reachable
4. **Permission Issues**: Check for any authentication requirements

### Performance Issues

1. **Reset Duration**: Monitor reset completion times in logs
2. **Database Load**: Check for concurrent operations during reset
3. **Resource Limits**: Ensure adequate memory and CPU resources
4. **Network Latency**: Consider database connection performance

## 📚 Complete Usage Examples

### Dedicated Kiosk Environment (Recommended)

```bash
# 1. Start isolated kiosk environment
docker-compose -f docker-compose-kiosk.yml up -d

# 2. Verify kiosk status
curl http://localhost:8081/api/kiosk/status

# 3. Access kiosk application
# Frontend: http://localhost:3001
# Backend: http://localhost:8081

# 4. Trigger manual reset (optional)
curl -X POST http://localhost:8081/api/kiosk/reset

# 5. Monitor logs
docker-compose -f docker-compose-kiosk.yml logs -f backend
```

### Convert Existing Environment

```bash
# 1. Modify docker-compose.yml
# Add: KIOSK_MODE: "true" to backend environment

# 2. Restart services
docker-compose down
docker-compose up -d

# 3. Verify activation
curl http://localhost:8080/api/kiosk/status

# 4. Monitor first reset
docker-compose logs -f backend
```

### Testing Kiosk Integration

```bash
# Test status endpoint
curl -s http://localhost:8081/api/kiosk/status | jq .

# Test manual reset
curl -s -X POST http://localhost:8081/api/kiosk/reset | jq .

# Monitor reset logs
docker-compose -f docker-compose-kiosk.yml logs --tail=50 backend

# Check application state after reset
curl http://localhost:8081/api/materials
```

## 🎯 Best Practices

### For Demonstrations
- **Pre-demo Setup**: Start kiosk mode 30 minutes before presentation
- **Status Verification**: Always check kiosk status before demo starts
- **Backup Plan**: Know manual reset endpoint in case of issues
- **Audience Interaction**: Let attendees know about the auto-reset feature

### For Development
- **Isolated Testing**: Use dedicated kiosk environment for testing
- **Clean State Testing**: Rely on automatic resets for consistent test data
- **Performance Testing**: Monitor reset performance and database load
- **Feature Development**: Test kiosk-related features in kiosk environment

### For Trade Shows
- **Extended Runtime**: Consider longer reset intervals for busy demonstrations
- **Monitoring Setup**: Monitor logs and status throughout the event
- **Fallback Options**: Have manual reset capability readily available
- **User Education**: Inform users about the demonstration nature of the environment

## 🏁 Conclusion

This comprehensive kiosk mode provides a robust, safe, and feature-rich solution for demonstrations, testing, and educational purposes while maintaining complete data safety and system reliability. 

**Key Benefits:**
- **Zero Configuration**: Works out of the box with dedicated Docker Compose
- **Complete Isolation**: Separate environment prevents any impact on production systems  
- **Reliable Reset**: Atomic operations ensure consistent database state
- **Comprehensive Monitoring**: Detailed logging and status APIs for full visibility
- **Production Safe**: Multiple safety mechanisms prevent accidental production usage

Whether you're showcasing your craft inventory system at a trade show, providing training to new users, or testing new features, kiosk mode ensures a professional, reliable, and safe demonstration environment.
