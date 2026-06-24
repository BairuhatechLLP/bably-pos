# Setup Checklist

Use this checklist to ensure your Manager Server is properly configured and ready to use.

## Pre-Installation Checklist

- [ ] Node.js v16 or higher installed
- [ ] npm installed and working
- [ ] Have access credentials for all 7 branch databases
- [ ] Can connect to all 7 branch database servers from this machine
- [ ] Know the table names in your branch databases

## Installation Checklist

- [ ] Navigated to project directory
- [ ] Ran `npm install` successfully
- [ ] All dependencies installed without errors
- [ ] Created `.env` file from `.env.example`

## Database Configuration Checklist

For each of the 7 branches, verify you have updated `.env` with:

### Branch 1
- [ ] BRANCH1_DB_HOST (IP address or hostname)
- [ ] BRANCH1_DB_PORT (usually 3306)
- [ ] BRANCH1_DB_USERNAME
- [ ] BRANCH1_DB_PASSWORD
- [ ] BRANCH1_DB_DATABASE (database name)
- [ ] BRANCH1_NAME (display name)

### Branch 2
- [ ] BRANCH2_DB_HOST
- [ ] BRANCH2_DB_PORT
- [ ] BRANCH2_DB_USERNAME
- [ ] BRANCH2_DB_PASSWORD
- [ ] BRANCH2_DB_DATABASE
- [ ] BRANCH2_NAME

### Branch 3
- [ ] BRANCH3_DB_HOST
- [ ] BRANCH3_DB_PORT
- [ ] BRANCH3_DB_USERNAME
- [ ] BRANCH3_DB_PASSWORD
- [ ] BRANCH3_DB_DATABASE
- [ ] BRANCH3_NAME

### Branch 4
- [ ] BRANCH4_DB_HOST
- [ ] BRANCH4_DB_PORT
- [ ] BRANCH4_DB_USERNAME
- [ ] BRANCH4_DB_PASSWORD
- [ ] BRANCH4_DB_DATABASE
- [ ] BRANCH4_NAME

### Branch 5
- [ ] BRANCH5_DB_HOST
- [ ] BRANCH5_DB_PORT
- [ ] BRANCH5_DB_USERNAME
- [ ] BRANCH5_DB_PASSWORD
- [ ] BRANCH5_DB_DATABASE
- [ ] BRANCH5_NAME

### Branch 6
- [ ] BRANCH6_DB_HOST
- [ ] BRANCH6_DB_PORT
- [ ] BRANCH6_DB_USERNAME
- [ ] BRANCH6_DB_PASSWORD
- [ ] BRANCH6_DB_DATABASE
- [ ] BRANCH6_NAME

### Branch 7
- [ ] BRANCH7_DB_HOST
- [ ] BRANCH7_DB_PORT
- [ ] BRANCH7_DB_USERNAME
- [ ] BRANCH7_DB_PASSWORD
- [ ] BRANCH7_DB_DATABASE
- [ ] BRANCH7_NAME

## Security Configuration Checklist

- [ ] Changed JWT_SECRET to a strong random value
- [ ] JWT_SECRET is at least 32 characters long
- [ ] Never committed `.env` file to version control
- [ ] Added `.env` to `.gitignore`

## Database Connectivity Test

Test connection to each branch database:

- [ ] Branch 1: Can connect with `mysql -h HOST -u USER -p DATABASE`
- [ ] Branch 2: Can connect with `mysql -h HOST -u USER -p DATABASE`
- [ ] Branch 3: Can connect with `mysql -h HOST -u USER -p DATABASE`
- [ ] Branch 4: Can connect with `mysql -h HOST -u USER -p DATABASE`
- [ ] Branch 5: Can connect with `mysql -h HOST -u USER -p DATABASE`
- [ ] Branch 6: Can connect with `mysql -h HOST -u USER -p DATABASE`
- [ ] Branch 7: Can connect with `mysql -h HOST -u USER -p DATABASE`

## Database Schema Verification

For each branch database, verify these tables exist:

### Branch 1
- [ ] `orders` table exists
- [ ] `order_items` table exists
- [ ] `products` table exists
- [ ] `staff` table exists

### Branch 2
- [ ] `orders` table exists
- [ ] `order_items` table exists
- [ ] `products` table exists
- [ ] `staff` table exists

### Branch 3
- [ ] `orders` table exists
- [ ] `order_items` table exists
- [ ] `products` table exists
- [ ] `staff` table exists

### Branch 4
- [ ] `orders` table exists
- [ ] `order_items` table exists
- [ ] `products` table exists
- [ ] `staff` table exists

### Branch 5
- [ ] `orders` table exists
- [ ] `order_items` table exists
- [ ] `products` table exists
- [ ] `staff` table exists

### Branch 6
- [ ] `orders` table exists
- [ ] `order_items` table exists
- [ ] `products` table exists
- [ ] `staff` table exists

### Branch 7
- [ ] `orders` table exists
- [ ] `order_items` table exists
- [ ] `products` table exists
- [ ] `staff` table exists

**If table names are different**, update entity files in `src/entities/`

## Entity Configuration Checklist

If your table/column names differ from the defaults:

- [ ] Updated `@Entity()` decorators with actual table names
- [ ] Updated `@Column()` decorators with actual column names
- [ ] Verified entity fields match database columns
- [ ] Tested with actual database

## Server Startup Checklist

- [ ] Started server with `npm run start:dev`
- [ ] Server started without errors
- [ ] Saw "Manager Server initialized successfully"
- [ ] Saw "Connected to 7 branch databases"
- [ ] Server is running on port 3000 (or configured port)

## API Endpoint Testing

Test each endpoint to verify it's working:

### Authentication
- [ ] POST /auth/staff/email-login returns JWT token
- [ ] Can login with valid credentials
- [ ] Invalid credentials return 401 error

### Home & Reports
- [ ] GET /report_app/v2/home returns data
- [ ] GET /report_app/v2/reports works
- [ ] GET /report_app/v2/reports?type=monthly returns monthly data
- [ ] GET /report_app/v2/reports?type=yearly returns yearly data
- [ ] GET /report_app/v2/reports?type=popular_items returns popular items
- [ ] GET /report_app/v2/reports?type=branch_comparison returns comparison

### Branches
- [ ] GET /report_app/v2/branch_picker returns 7 branches
- [ ] GET /report_app/v2/branch returns branch statistics
- [ ] GET /report_app/v2/branch_details/1 returns branch 1 details
- [ ] GET /report_app/v2/branch_details/2 returns branch 2 details

### Products
- [ ] GET /report_app/v2/products returns all products
- [ ] GET /report_app/v2/products?branchId=1 returns branch 1 products
- [ ] GET /report_app/v2/product_details/[id] returns product details

## Data Verification Checklist

- [ ] Home endpoint shows data from all 7 branches
- [ ] Sales totals are accurate (manually verified)
- [ ] Order counts are correct
- [ ] Branch names display correctly
- [ ] Product data is correct
- [ ] Dates and timestamps are in correct timezone

## Report App Integration Checklist

- [ ] Updated report app's API base URL
- [ ] Report app can connect to manager server
- [ ] Login works from report app
- [ ] Home dashboard loads correctly
- [ ] All reports load correctly
- [ ] Branch picker works
- [ ] Product lists work
- [ ] No CORS errors

## Production Deployment Checklist

- [ ] Set NODE_ENV=production
- [ ] Updated CORS to allow only report app domain
- [ ] Using strong JWT secret
- [ ] Database credentials are secure
- [ ] Built project with `npm run build`
- [ ] Tested production build locally
- [ ] Set up process manager (PM2/systemd)
- [ ] Configured HTTPS/SSL
- [ ] Set up firewall rules
- [ ] Configured logging
- [ ] Set up monitoring/alerts
- [ ] Created backup strategy
- [ ] Documented deployment process
- [ ] Tested failover scenarios

## Security Hardening Checklist

- [ ] Changed default JWT secret
- [ ] Using HTTPS in production
- [ ] CORS restricted to known domains
- [ ] Database users have minimal permissions
- [ ] Using VPN or secure network for DB connections
- [ ] Firewall rules configured
- [ ] No sensitive data in logs
- [ ] `.env` file permissions set correctly (not world-readable)
- [ ] No credentials in code
- [ ] Dependencies updated to latest secure versions

## Monitoring & Maintenance Checklist

- [ ] Set up logging system
- [ ] Configured log rotation
- [ ] Set up uptime monitoring
- [ ] Set up error alerting
- [ ] Configured performance monitoring
- [ ] Created runbook for common issues
- [ ] Documented backup/restore procedures
- [ ] Scheduled regular security updates
- [ ] Created disaster recovery plan

## Performance Optimization Checklist

- [ ] Tested with expected load
- [ ] Response times are acceptable
- [ ] No memory leaks observed
- [ ] Database queries are optimized
- [ ] Considered caching for frequent queries
- [ ] Network latency to branches is acceptable
- [ ] Server resources (CPU/RAM) are adequate

## Documentation Checklist

- [ ] Read README.md completely
- [ ] Read SETUP_GUIDE.md
- [ ] Reviewed API_EXAMPLES.md
- [ ] Read PROJECT_SUMMARY.md
- [ ] Team members trained on system
- [ ] Troubleshooting procedures documented
- [ ] Contact information for support updated

## Final Verification

- [ ] All 7 branches showing data correctly
- [ ] Report app fully functional
- [ ] No errors in server logs
- [ ] Performance is satisfactory
- [ ] Security measures in place
- [ ] Backup system working
- [ ] Monitoring active
- [ ] Team is trained
- [ ] Documentation complete
- [ ] Ready for production use

---

## Quick Test Commands

```bash
# Test server is running
curl http://localhost:3000/report_app/v2/branch_picker

# Test home data
curl http://localhost:3000/report_app/v2/home

# Test login
curl -X POST http://localhost:3000/auth/staff/email-login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"your-password"}'

# Test monthly report
curl "http://localhost:3000/report_app/v2/reports?type=monthly"
```

---

## Sign-Off

Once all items are checked:

- [ ] System tested by: _________________ Date: _________
- [ ] Approved by: _________________ Date: _________
- [ ] Production deployment date: _________
- [ ] Go-live date: _________

---

**Status**: Ready for deployment when all items are checked ✓
