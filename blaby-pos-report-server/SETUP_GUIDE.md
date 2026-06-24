# Quick Setup Guide - Manager Server

## Step-by-Step Setup Instructions

### 1. Prerequisites Check

Before starting, ensure you have:
- [ ] Node.js v16 or higher installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Access credentials for all 7 branch databases
- [ ] Network access to all branch database servers

### 2. Installation

```bash
# Navigate to project directory
cd nalakath-report-v2

# Install all dependencies
npm install
```

### 3. Database Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Open `.env` file and update with your actual branch database credentials:

```env
# Branch 1 Configuration
BRANCH1_DB_HOST=192.168.1.10        # Replace with actual IP/hostname
BRANCH1_DB_PORT=3306
BRANCH1_DB_USERNAME=pos_user        # Replace with actual username
BRANCH1_DB_PASSWORD=your_password   # Replace with actual password
BRANCH1_DB_DATABASE=pos_branch1     # Replace with actual database name
BRANCH1_NAME=Main Branch            # Display name for this branch

# Branch 2 Configuration
BRANCH2_DB_HOST=192.168.1.20
BRANCH2_DB_PORT=3306
BRANCH2_DB_USERNAME=pos_user
BRANCH2_DB_PASSWORD=your_password
BRANCH2_DB_DATABASE=pos_branch2
BRANCH2_NAME=North Branch

# ... Continue for all 7 branches
```

3. Update JWT Secret (IMPORTANT for security):
```env
JWT_SECRET=your-very-long-random-secret-key-here-change-this-in-production
```

### 4. Verify Database Connectivity

Test connection to each branch database:

```bash
# Test MySQL connection (example for Branch 1)
mysql -h 192.168.1.10 -u pos_user -p pos_branch1
```

If you can't connect:
- Check IP address and port
- Verify username and password
- Ensure MySQL allows remote connections
- Check firewall rules

### 5. Database Schema Verification

The manager server expects these tables in each branch database:
- `orders`
- `order_items`
- `products`
- `staff`

To verify tables exist:
```sql
SHOW TABLES;
```

If your table names are different, update the entity files in `src/entities/` folder.

### 6. Start the Server

**Development Mode (with auto-reload):**
```bash
npm run start:dev
```

**Production Mode:**
```bash
# Build the project first
npm run build

# Then start in production mode
npm run start:prod
```

### 7. Verify Server is Running

You should see output like:
```
Manager Server initialized successfully
Connected to 7 branch databases
Manager Server is running on: http://localhost:3000
API Documentation:
  - POST /auth/staff/email-login
  - GET  /report_app/v2/home
  - GET  /report_app/v2/reports
  ...
```

### 8. Test API Endpoints

**Test the home endpoint:**
```bash
curl http://localhost:3000/report_app/v2/home
```

**Test the branch picker:**
```bash
curl http://localhost:3000/report_app/v2/branch_picker
```

**Test authentication:**
```bash
curl -X POST http://localhost:3000/auth/staff/email-login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-staff-email@example.com","password":"your-password"}'
```

### 9. Connect Your Report App

Update your existing report app's API base URL to point to this manager server:

**Before (Old Setup):**
```javascript
const API_BASE_URL = 'http://old-single-server:3000';
```

**After (New Setup):**
```javascript
const API_BASE_URL = 'http://manager-server-ip:3000';
```

Your report app doesn't need any code changes - all endpoints remain the same!

### 10. Common Issues & Solutions

#### Issue: "Can't connect to branch database"
**Solution:**
1. Verify credentials in `.env` file
2. Test MySQL connection manually
3. Check if MySQL allows remote connections:
   ```sql
   -- Run on branch database server
   SELECT user, host FROM mysql.user;
   CREATE USER 'pos_user'@'%' IDENTIFIED BY 'password';
   GRANT ALL PRIVILEGES ON pos_branch1.* TO 'pos_user'@'%';
   FLUSH PRIVILEGES;
   ```

#### Issue: "Table doesn't exist"
**Solution:**
- Check table names with `SHOW TABLES;`
- Update entity decorators in `src/entities/*.entity.ts`:
  ```typescript
  @Entity('your_actual_table_name')
  ```

#### Issue: "No data returned from endpoints"
**Solution:**
1. Check if databases have data
2. Verify order status values (cancelled orders are excluded)
3. Check date ranges in queries

#### Issue: "CORS error from report app"
**Solution:**
Update CORS settings in `src/main.ts`:
```typescript
app.enableCors({
  origin: 'http://your-report-app-url.com',  // Your report app URL
  methods: 'GET,POST,PUT,DELETE,PATCH',
  credentials: true,
});
```

### 11. Production Deployment Checklist

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Update CORS to allow only your report app domain
- [ ] Use HTTPS with SSL certificates
- [ ] Set `NODE_ENV=production` in environment
- [ ] Use a process manager (PM2, systemd, etc.)
- [ ] Set up logging and monitoring
- [ ] Configure firewall rules
- [ ] Backup database credentials securely
- [ ] Test all API endpoints
- [ ] Load test with expected traffic

### 12. Running with PM2 (Recommended for Production)

```bash
# Install PM2 globally
npm install -g pm2

# Build the project
npm run build

# Start with PM2
pm2 start dist/main.js --name manager-server

# Save PM2 configuration
pm2 save

# Set PM2 to start on system boot
pm2 startup
```

### 13. Monitoring

View server logs:
```bash
# Development mode - logs appear in terminal

# Production with PM2
pm2 logs manager-server

# View all running PM2 processes
pm2 list

# Monitor server resources
pm2 monit
```

### 14. Next Steps

1. Test all endpoints with your report app
2. Verify data aggregation is correct
3. Check report generation for all types
4. Test with real production data
5. Set up automated backups
6. Configure monitoring and alerts

## Support & Troubleshooting

If you encounter issues:

1. Check server logs for detailed error messages
2. Verify all 7 databases are accessible
3. Ensure table structures match the entities
4. Test database connections manually
5. Review the main README.md for detailed documentation

## Quick Reference - Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| JWT_SECRET | Secret key for JWT tokens | random-secret-key |
| BRANCHn_DB_HOST | Database host IP | 192.168.1.10 |
| BRANCHn_DB_PORT | Database port | 3306 |
| BRANCHn_DB_USERNAME | Database username | pos_user |
| BRANCHn_DB_PASSWORD | Database password | password123 |
| BRANCHn_DB_DATABASE | Database name | pos_branch1 |
| BRANCHn_NAME | Display name | Main Branch |

Replace `n` with numbers 1-7 for each branch.

---

**Congratulations!** Your Manager Server is now set up and ready to aggregate data from all 7 branches.
