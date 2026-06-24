# Postman Testing Guide - Step by Step

## Prerequisites
- Postman installed
- Server running on `http://localhost:8063`

---

## Test 1: Home Dashboard ✅

**Method:** `GET`
**URL:** `http://localhost:8063/report_app/v2/home`

**Steps:**
1. Open Postman
2. Click "New" → "HTTP Request"
3. Set method to `GET`
4. Paste URL: `http://localhost:8063/report_app/v2/home`
5. Click "Send"

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "todayOrders": 0,
    "todayAmount": 0,
    "last7Days": [...],
    "topBranches": [...],
    "topProducts": [...]
  },
  "message": "Data fetch successfully"
}
```

**Status:** Should be `200 OK`

---

## Test 2: Reports List ✅

**Method:** `GET`
**URL:** `http://localhost:8063/report_app/v2/reports`

**Steps:**
1. New Request
2. Method: `GET`
3. URL: `http://localhost:8063/report_app/v2/reports`
4. Click "Send"

**Expected Response:**
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Sales Report", ... },
    { "id": 2, "name": "Product Report", ... }
    // ... 10 report types
  ],
  "message": "Data fetch successfully"
}
```

**Status:** Should be `200 OK`

---

## Test 3: Branch Picker ✅

**Method:** `GET`
**URL:** `http://localhost:8063/report_app/v2/branch_picker`

**Steps:**
1. New Request
2. Method: `GET`
3. URL: `http://localhost:8063/report_app/v2/branch_picker`
4. Click "Send"

**Expected Response:**
```json
{
  "success": true,
  "data": [
    { "id": 1, "bname": "Branch Name", ... },
    // ... 36 branches
  ],
  "message": "Data fetch successfully"
}
```

**Status:** Should be `200 OK`

---

## Test 4: Branch Sales ✅

**Method:** `GET`
**URL:** `http://localhost:8063/report_app/v2/branch`

**Steps:**
1. New Request
2. Method: `GET`
3. URL: `http://localhost:8063/report_app/v2/branch`
4. Click "Send"

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "companyId": 1,
      "branchName": "PMNA",
      "totalOrders": 500,
      "totalSales": 125000.50
    }
    // ... 9 branches
  ],
  "message": "Data fetch successfully"
}
```

**Status:** Should be `200 OK`

---

## Test 5: Branch Details - ID 1 ✅

**Method:** `GET`
**URL:** `http://localhost:8063/report_app/v2/branch_details/1`

**Steps:**
1. New Request
2. Method: `GET`
3. URL: `http://localhost:8063/report_app/v2/branch_details/1`
4. Click "Send"

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "totals": [{
      "companyId": 1,
      "totalOrders": 500,
      "totalSales": 125000.50
    }],
    "branch": {
      "id": 1,
      "bname": "Branch Name"
    },
    "data": [
      {
        "companyId": 1,
        "orderDate": "2024-10-22",
        "totalOrders": 15,
        "totalSales": 4500.00
      }
      // ... daily data for last 30 days
    ]
  },
  "message": "Data fetch successfully"
}
```

**Status:** Should be `200 OK`

---

## Test 6: Product Details - ID 610 ✅

**Method:** `GET`
**URL:** `http://localhost:8063/report_app/v2/product_details/610`

**Steps:**
1. New Request
2. Method: `GET`
3. URL: `http://localhost:8063/report_app/v2/product_details/610`
4. Click "Send"

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "totalQuantity": [{
      "productId": 610,
      "totalSold": 11302
    }],
    "product": {
      "id": 610,
      "idescription": "Avil Milk Sp",
      "sp_price": 25.00
    },
    "data": [
      {
        "productId": 610,
        "prodDate": "2024-10-22",
        "totalAmount": 1250.00,
        "totalOrders": 20,
        "totalQuantity": 50
      }
      // ... daily data
    ]
  },
  "message": "Data fetch successfully"
}
```

**Status:** Should be `200 OK`

---

## Test 7: Products - Search "Milk" ✅

**Method:** `GET`
**URL:** `http://localhost:8063/report_app/v2/products?query=milk`

**Steps:**
1. New Request
2. Method: `GET`
3. URL: `http://localhost:8063/report_app/v2/products?query=milk`
4. Click "Send"

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "productId": 610,
      "idescription": "Avil Milk Sp",
      "sp_price": 25.00,
      "totalAmount": 282550.00,
      "totalSold": 11302,
      "branchId": 1
    }
    // ... milk products
  ],
  "message": "Data fetch successfully"
}
```

**Status:** Should be `200 OK`

---

## Test 8: Login (Optional) 🔐

**Method:** `POST`
**URL:** `http://localhost:8063/auth/staff/email-login`

**Steps:**
1. New Request
2. Method: `POST`
3. URL: `http://localhost:8063/auth/staff/email-login`
4. Go to "Body" tab
5. Select "raw"
6. Select "JSON" from dropdown
7. Paste this:
```json
{
  "email": "ras@nalakath.com",
  "password": "your-password-here"
}
```
8. Click "Send"

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 123,
      "email": "ras@nalakath.com",
      "companyId": 158
    }
  },
  "message": "Login successful"
}
```

**Status:** Should be `200 OK`

---

## Testing with Query Parameters

### Example 1: Branch with Date Range

**URL:** `http://localhost:8063/report_app/v2/branch?from_date=2024-10-01&to_date=2024-10-31`

**Steps:**
1. New Request
2. Method: `GET`
3. URL: `http://localhost:8063/report_app/v2/branch`
4. Go to "Params" tab
5. Add parameters:
   - Key: `from_date`, Value: `2024-10-01`
   - Key: `to_date`, Value: `2024-10-31`
6. Click "Send"

### Example 2: Products by Branch

**URL:** `http://localhost:8063/report_app/v2/products?branchId=1&query=milk`

**Steps:**
1. New Request
2. Method: `GET`
3. URL: `http://localhost:8063/report_app/v2/products`
4. Go to "Params" tab
5. Add parameters:
   - Key: `branchId`, Value: `1`
   - Key: `query`, Value: `milk`
6. Click "Send"

### Example 3: Product Details with Date Range

**URL:** `http://localhost:8063/report_app/v2/product_details/610?from_date=2024-10-01&to_date=2024-10-31`

**Steps:**
1. New Request
2. Method: `GET`
3. URL: `http://localhost:8063/report_app/v2/product_details/610`
4. Go to "Params" tab
5. Add parameters:
   - Key: `from_date`, Value: `2024-10-01`
   - Key: `to_date`, Value: `2024-10-31`
6. Click "Send"

---

## Common Test Data

### Branch IDs to Test:
- `1` - PMNA Branch
- `2` - Pulamanthole Branch
- `3` - Koppam Branch
- `158` - Main Branch

### Product IDs to Test:
- `610` - Avil Milk Sp (11,302 units sold)
- `2` - Product ID 2
- `15` - Product ID 15
- `100` - Product ID 100

### Date Ranges to Test:
- Today: No parameters (default)
- Last 7 days: `from_date=2024-10-15&to_date=2024-10-22`
- Last 30 days: `from_date=2024-09-22&to_date=2024-10-22`
- October 2024: `from_date=2024-10-01&to_date=2024-10-31`

### Search Queries to Test:
- `milk` - Find milk products
- `avil` - Find Avil products
- `fresh` - Find fresh products

---

## Quick Copy-Paste URLs

```
# 1. Home Dashboard
http://localhost:8063/report_app/v2/home

# 2. Reports List
http://localhost:8063/report_app/v2/reports

# 3. Branch Picker
http://localhost:8063/report_app/v2/branch_picker

# 4. Branch Sales
http://localhost:8063/report_app/v2/branch

# 5. Branch Details - ID 1
http://localhost:8063/report_app/v2/branch_details/1

# 6. Branch Details - ID 2
http://localhost:8063/report_app/v2/branch_details/2

# 7. Branch Details - ID 158
http://localhost:8063/report_app/v2/branch_details/158

# 8. Product Details - ID 610
http://localhost:8063/report_app/v2/product_details/610

# 9. Product Details - ID 2
http://localhost:8063/report_app/v2/product_details/2

# 10. Products - Search Milk
http://localhost:8063/report_app/v2/products?query=milk

# 11. Products - By Branch
http://localhost:8063/report_app/v2/products?branchId=1

# 12. Branch with Date Range
http://localhost:8063/report_app/v2/branch?from_date=2024-10-01&to_date=2024-10-31

# 13. Product Details with Date Range
http://localhost:8063/report_app/v2/product_details/610?from_date=2024-10-01&to_date=2024-10-31
```

---

## Troubleshooting

### Error: "ECONNREFUSED"
**Solution:** Server is not running. Start it:
```bash
npm run start:dev
```

### Error: "No Data Found"
**Possible Reasons:**
1. No data exists for that branch/product
2. No data in the date range specified
3. Database connection issue

**Try:**
- Different branch ID
- Different product ID
- Remove date filters (use default last 30 days)

### Response takes too long
**If testing `/products` without query:**
- This is normal! It processes 11,434 products
- Takes 60-70 seconds
- Use `?query=milk` to filter and speed up

### Status 500 - Internal Server Error
**Check:**
1. Server console for error messages
2. Database connections are working
3. .env file is configured correctly

---

## Expected Response Times

| Endpoint | Response Time |
|----------|---------------|
| Home | ~3.8s |
| Reports | ~1.8s |
| Branch Picker | ~0.7s |
| Branch | ~3.0s |
| Branch Details | ~1.5s |
| Products (with query) | ~5-10s |
| Products (all) | ~60-70s |
| Product Details | ~3.6s |

---

## All Tests Checklist

Use this checklist to verify all endpoints:

- [ ] Test 1: Home Dashboard
- [ ] Test 2: Reports List
- [ ] Test 3: Branch Picker
- [ ] Test 4: Branch Sales
- [ ] Test 5: Branch Details (ID=1)
- [ ] Test 6: Product Details (ID=610)
- [ ] Test 7: Products Search
- [ ] Test 8: Branch with Date Filter
- [ ] Test 9: Product with Date Filter
- [ ] Test 10: Login (Optional)

**When all checked ✅, your server is production ready!**

---

## Need Help?

- Check server logs for errors
- Verify server is running: `http://localhost:8063`
- Run automated test: `node final-test.js`
- Check `TEST-RESULTS.md` for detailed results
