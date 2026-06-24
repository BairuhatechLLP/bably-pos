# How to Add New Databases - Automatic Configuration

## Quick Answer: YES! ✅

**When you add a new database in the `.env` file, it will AUTOMATICALLY work in the report app!**

No code changes needed - just restart the server.

---

## How It Works

The system is designed to automatically detect and connect to databases 1-7 based on your `.env` configuration.

### Current Configuration Code

Location: `src/config/sequelize-multi-db.config.ts:37`

```typescript
// Initialize connections for all 7 branches
for (let i = 1; i <= 7; i++) {
  // Skip if database name is not configured
  const dbName = process.env[`BRANCH${i}_DB_DATABASE`];
  if (!dbName || dbName.trim() === '') {
    console.log(`⏭️  Skipping Branch ${i} - No database configured`);
    continue;
  }

  // Automatically connect to configured database
  // ... connection code
}
```

**This means:**
- The system loops through BRANCH1 to BRANCH7
- It checks if each branch has database configuration in `.env`
- If configured → Connects automatically ✅
- If not configured → Skips silently ⏭️

---

## How to Add Branch 6 Database

### Step 1: Edit `.env` File

Currently, Branch 6 is commented out:

```bash
# Branch 6 Database Configuration (Disabled - Database doesn't exist)
# BRANCH6_DB_HOST=62.210.171.34
# BRANCH6_DB_PORT=3306
# BRANCH6_DB_USERNAME=root
# BRANCH6_DB_PASSWORD=YOUR_DB_PASSWORD
# BRANCH6_DB_DATABASE=nalakath_branch6_oct_2025
# BRANCH6_NAME=nalakath_branch6_oct_2025
```

**To enable it, just uncomment (remove the #):**

```bash
# Branch 6 Database Configuration
BRANCH6_DB_HOST=62.210.171.34
BRANCH6_DB_PORT=3306
BRANCH6_DB_USERNAME=root
BRANCH6_DB_PASSWORD=YOUR_DB_PASSWORD
BRANCH6_DB_DATABASE=nalakath_YOUR_NEW_DATABASE_NAME_oct_2025
BRANCH6_NAME=Your Branch 6 Name
```

### Step 2: Update Database Name

Replace `nalakath_YOUR_NEW_DATABASE_NAME_oct_2025` with your actual database name.

For example:
```bash
BRANCH6_DB_DATABASE=nalakath_malappuram_oct_2025
BRANCH6_NAME=Malappuram Branch
```

### Step 3: Restart Server

```bash
npm run start:dev
```

### Step 4: Verify Connection

You should see in the console:

```
✅ Connected to Malappuram Branch database: nalakath_malappuram_oct_2025
🎯 Successfully connected to 6 branch databases
```

**That's it! Branch 6 data will now be included in all reports automatically!**

---

## Example: Adding Multiple New Branches

### Current Status
```
Branch 1: ✅ Connected (nalakath_pmna_oct_2025)
Branch 2: ✅ Connected (nalakath_pulamanthole_oct_2025)
Branch 3: ✅ Connected (nalakath_koppam_oct_2025)
Branch 4: ✅ Connected (nalakath_55_oct_2025)
Branch 5: ✅ Connected (nalakath_ekm_oct_2025)
Branch 6: ⏭️  Skipped (not configured)
Branch 7: ⏭️  Skipped (not configured)
```

### After Adding Branch 6 & 7

Edit `.env`:

```bash
# Branch 6 - Malappuram
BRANCH6_DB_HOST=62.210.171.34
BRANCH6_DB_PORT=3306
BRANCH6_DB_USERNAME=root
BRANCH6_DB_PASSWORD=YOUR_DB_PASSWORD
BRANCH6_DB_DATABASE=nalakath_malappuram_oct_2025
BRANCH6_NAME=Malappuram

# Branch 7 - Calicut
BRANCH7_DB_HOST=62.210.171.34
BRANCH7_DB_PORT=3306
BRANCH7_DB_USERNAME=root
BRANCH7_DB_PASSWORD=YOUR_DB_PASSWORD
BRANCH7_DB_DATABASE=nalakath_calicut_oct_2025
BRANCH7_NAME=Calicut
```

Restart server, and you'll see:

```
Branch 1: ✅ Connected (nalakath_pmna_oct_2025)
Branch 2: ✅ Connected (nalakath_pulamanthole_oct_2025)
Branch 3: ✅ Connected (nalakath_koppam_oct_2025)
Branch 4: ✅ Connected (nalakath_55_oct_2025)
Branch 5: ✅ Connected (nalakath_ekm_oct_2025)
Branch 6: ✅ Connected (nalakath_malappuram_oct_2025)  ← NEW!
Branch 7: ✅ Connected (nalakath_calicut_oct_2025)      ← NEW!

🎯 Successfully connected to 7 branch databases
```

---

## What Data Will Be Included Automatically?

Once a new database is added, it will be automatically included in:

✅ **All Report Endpoints:**
- `/report_app/v2/home` - Dashboard with new branch data
- `/report_app/v2/reports` - Report list
- `/report_app/v2/branch_picker` - New branch will appear here
- `/report_app/v2/branch` - Sales from new branch
- `/report_app/v2/branch_details/:id` - New branch details
- `/report_app/v2/products` - Products from new branch
- `/report_app/v2/product_details/:id` - Product sales from new branch

The system automatically:
- Queries all connected databases in parallel
- Aggregates data from all branches
- Returns combined results

---

## Important Notes

### 1. Database Must Exist First
```bash
# Create the database on MySQL server first
CREATE DATABASE nalakath_newbranch_oct_2025;
```

### 2. Same Schema Required
The new database must have the same table structure:
- `order_master`
- `order_items`
- `product_master`
- `product_category`
- `company_master`
- `user`

### 3. Maximum 7 Branches
Current limit: BRANCH1 to BRANCH7

**To add more than 7 branches:**
You would need to update the config file:

```typescript
// In src/config/sequelize-multi-db.config.ts:37
// Change from:
for (let i = 1; i <= 7; i++) {
// To:
for (let i = 1; i <= 10; i++) {  // Support 10 branches
```

### 4. Connection Testing
After adding a new database, test it:

```bash
node final-test.js
```

---

## Troubleshooting

### Problem: New branch not connecting

**Check 1: Database exists?**
```bash
mysql -h 62.210.171.34 -u root -p -e "SHOW DATABASES LIKE 'nalakath%';"
```

**Check 2: .env file saved?**
Make sure you saved the `.env` file after editing.

**Check 3: Server restarted?**
```bash
# Kill and restart
npx kill-port 8063
npm run start:dev
```

**Check 4: Look for error messages**
Check the console output for:
- Connection errors
- Authentication failures
- Database not found errors

### Problem: Data not showing from new branch

**Check 1: Does the branch have data?**
```bash
mysql -h 62.210.171.34 -u root -p nalakath_newbranch_oct_2025 \
  -e "SELECT COUNT(*) FROM order_master WHERE DATE(createdAt) = CURDATE();"
```

**Check 2: Company/Branch records exist?**
```bash
mysql -h 62.210.171.34 -u root -p nalakath_newbranch_oct_2025 \
  -e "SELECT id, bname FROM company_master;"
```

---

## Summary

### To Add a New Database:

1. ✅ **Edit `.env`** - Uncomment or add BRANCH6/BRANCH7 configuration
2. ✅ **Set database name** - Use the correct database name
3. ✅ **Restart server** - `npm run start:dev`
4. ✅ **Verify connection** - Look for "✅ Connected" message
5. ✅ **Test endpoints** - Run `node final-test.js`

**No code changes needed! The system automatically detects and uses new databases.**

---

## Quick Reference

### Environment Variables Format

```bash
BRANCH{N}_DB_HOST=database_host
BRANCH{N}_DB_PORT=3306
BRANCH{N}_DB_USERNAME=database_user
BRANCH{N}_DB_PASSWORD=database_password
BRANCH{N}_DB_DATABASE=database_name
BRANCH{N}_NAME=friendly_branch_name
```

Replace `{N}` with branch number (1-7).

### Current System Capacity

- **Maximum Branches:** 7 (can be increased in config)
- **Auto-Detection:** YES ✅
- **Hot Reload:** NO - Requires server restart
- **Code Changes Needed:** NO ✅

---

## Need More Than 7 Branches?

If you need to support more than 7 branches, I can help you:
1. Modify the config to support unlimited branches
2. Add dynamic branch configuration
3. Implement hot-reload without server restart

Just let me know! 😊
