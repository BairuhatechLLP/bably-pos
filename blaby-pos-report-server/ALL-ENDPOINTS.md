# All API Endpoints - Complete Reference

**Base URL:** `http://localhost:8063`

---

## 1. Authentication Endpoint

### POST /auth/staff/email-login
**Description:** Login with email and password to get JWT token

**Request:**
```bash
POST http://localhost:8063/auth/staff/email-login
Content-Type: application/json

{
  "email": "ras@nalakath.com",
  "password": "your-password"
}
```

**Test with cURL:**
```bash
curl -X POST http://localhost:8063/auth/staff/email-login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"ras@nalakath.com\",\"password\":\"your-password\"}"
```

**Response:**
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

---

## 2. Dashboard & Reports

### GET /report_app/v2/home
**Description:** Today's sales summary from all branches

**Request:**
```bash
GET http://localhost:8063/report_app/v2/home
```

**Test with cURL:**
```bash
curl http://localhost:8063/report_app/v2/home
```

**Test with Browser:**
```
http://localhost:8063/report_app/v2/home
```

**Response:**
```json
{
  "success": true,
  "data": {
    "todayOrders": 143,
    "todayAmount": 12011.50,
    "last7Days": [
      {"label": "Mon", "value": 150},
      {"label": "Tue", "value": 180}
    ],
    "topBranches": [...],
    "topProducts": [...]
  },
  "message": "Data fetch successfully"
}
```

---

### GET /report_app/v2/reports
**Description:** List of available report types

**Request:**
```bash
GET http://localhost:8063/report_app/v2/reports
```

**Test with cURL:**
```bash
curl http://localhost:8063/report_app/v2/reports
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Sales Report",
      "description": "Daily sales summary"
    },
    {
      "id": 2,
      "name": "Product Report",
      "description": "Product-wise sales"
    }
    // ... 10 report types
  ],
  "message": "Data fetch successfully"
}
```

---

## 3. Branch Endpoints

### GET /report_app/v2/branch_picker
**Description:** List of all branches (for dropdown/picker)

**Request:**
```bash
GET http://localhost:8063/report_app/v2/branch_picker
```

**Test with cURL:**
```bash
curl http://localhost:8063/report_app/v2/branch_picker
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "bname": "PMNA Branch",
      "address": "..."
    },
    {
      "id": 2,
      "bname": "Pulamanthole Branch",
      "address": "..."
    }
    // ... 36 branches total
  ],
  "message": "Data fetch successfully"
}
```

---

### GET /report_app/v2/branch
**Description:** Sales data grouped by branch

**Request:**
```bash
GET http://localhost:8063/report_app/v2/branch
```

**Optional Query Parameters:**
```bash
?from_date=2024-10-01    # Start date (YYYY-MM-DD)
?to_date=2024-10-31      # End date (YYYY-MM-DD)
?branchId=1              # Filter by specific branch
```

**Test with cURL:**
```bash
# All branches
curl http://localhost:8063/report_app/v2/branch

# Specific date range
curl "http://localhost:8063/report_app/v2/branch?from_date=2024-10-01&to_date=2024-10-31"

# Specific branch
curl "http://localhost:8063/report_app/v2/branch?branchId=1"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "companyId": 1,
      "branchName": "PMNA Branch",
      "totalOrders": 500,
      "totalSales": 125000.50
    },
    {
      "companyId": 2,
      "branchName": "Pulamanthole Branch",
      "totalOrders": 450,
      "totalSales": 98000.25
    }
    // ... 9 branches with sales
  ],
  "message": "Data fetch successfully"
}
```

---

### GET /report_app/v2/branch_details/:id
**Description:** Daily sales details for a specific branch (last 30 days by default)

**Request:**
```bash
GET http://localhost:8063/report_app/v2/branch_details/1
```

**URL Parameters:**
- `:id` - Branch/Company ID (e.g., 1, 2, 3)

**Optional Query Parameters:**
```bash
?from_date=2024-10-01    # Start date
?to_date=2024-10-31      # End date
```

**Test with cURL:**
```bash
# Branch ID 1 (last 30 days)
curl http://localhost:8063/report_app/v2/branch_details/1

# Branch ID 2 with date range
curl "http://localhost:8063/report_app/v2/branch_details/2?from_date=2024-10-01&to_date=2024-10-31"
```

**Test Different Branches:**
```bash
curl http://localhost:8063/report_app/v2/branch_details/1
curl http://localhost:8063/report_app/v2/branch_details/2
curl http://localhost:8063/report_app/v2/branch_details/3
curl http://localhost:8063/report_app/v2/branch_details/158
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totals": [
      {
        "companyId": 1,
        "totalOrders": 500,
        "totalSales": 125000.50
      }
    ],
    "branch": {
      "id": 1,
      "bname": "PMNA Branch",
      "address": "..."
    },
    "data": [
      {
        "companyId": 1,
        "orderDate": "2024-10-22",
        "totalOrders": 15,
        "totalSales": 4500.00
      },
      {
        "companyId": 1,
        "orderDate": "2024-10-21",
        "totalOrders": 12,
        "totalSales": 3800.00
      }
      // ... daily data for last 30 days
    ]
  },
  "message": "Data fetch successfully"
}
```

---

## 4. Product Endpoints

### GET /report_app/v2/products
**Description:** All products with sales data from all branches

**⚠️ WARNING:** This endpoint returns 11,434 products and takes 60-70 seconds to complete.

**Request:**
```bash
GET http://localhost:8063/report_app/v2/products
```

**Optional Query Parameters:**
```bash
?from_date=2024-10-01    # Start date
?to_date=2024-10-31      # End date
?branchId=1              # Filter by branch
?query=milk              # Search by product name
```

**Test with cURL:**
```bash
# All products (WARNING: Takes 60-70 seconds!)
curl http://localhost:8063/report_app/v2/products

# Search for specific product
curl "http://localhost:8063/report_app/v2/products?query=milk"

# Products from specific branch
curl "http://localhost:8063/report_app/v2/products?branchId=1"

# Products in date range
curl "http://localhost:8063/report_app/v2/products?from_date=2024-10-01&to_date=2024-10-31"
```

**Response:**
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
    },
    {
      "productId": 2,
      "idescription": "Fresh Milk 500ml",
      "sp_price": 30.00,
      "totalAmount": 150000.00,
      "totalSold": 5000,
      "branchId": 1
    }
    // ... 11,434 products total
  ],
  "message": "Data fetch successfully"
}
```

---

### GET /report_app/v2/product_details/:id
**Description:** Daily sales details for a specific product (last 30 days by default)

**Request:**
```bash
GET http://localhost:8063/report_app/v2/product_details/610
```

**URL Parameters:**
- `:id` - Product ID (e.g., 610, 2, 15)

**Optional Query Parameters:**
```bash
?from_date=2024-10-01    # Start date
?to_date=2024-10-31      # End date
?companyId=1             # Filter by branch/company
```

**Test with cURL:**
```bash
# Product ID 610 (last 30 days)
curl http://localhost:8063/report_app/v2/product_details/610

# Product ID 2 with date range
curl "http://localhost:8063/report_app/v2/product_details/2?from_date=2024-10-01&to_date=2024-10-31"

# Product from specific branch
curl "http://localhost:8063/report_app/v2/product_details/610?companyId=1"
```

**Test Different Products:**
```bash
curl http://localhost:8063/report_app/v2/product_details/610
curl http://localhost:8063/report_app/v2/product_details/2
curl http://localhost:8063/report_app/v2/product_details/15
curl http://localhost:8063/report_app/v2/product_details/100
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalQuantity": [
      {
        "productId": 610,
        "totalSold": 11302
      }
    ],
    "product": {
      "id": 610,
      "idescription": "Avil Milk Sp",
      "sp_price": 25.00,
      "categoryId": 5
    },
    "data": [
      {
        "productId": 610,
        "prodDate": "2024-10-22",
        "totalAmount": 1250.00,
        "totalOrders": 20,
        "totalQuantity": 50
      },
      {
        "productId": 610,
        "prodDate": "2024-10-21",
        "totalAmount": 1500.00,
        "totalOrders": 25,
        "totalQuantity": 60
      }
      // ... daily data for last 30 days
    ]
  },
  "message": "Data fetch successfully"
}
```

---

## Quick Test Script (Windows)

Save this as `test-all.bat`:

```batch
@echo off
echo ========================================
echo Testing All Endpoints
echo ========================================
echo.

echo 1. Testing Home...
curl http://localhost:8063/report_app/v2/home
echo.
echo.

echo 2. Testing Reports...
curl http://localhost:8063/report_app/v2/reports
echo.
echo.

echo 3. Testing Branch Picker...
curl http://localhost:8063/report_app/v2/branch_picker
echo.
echo.

echo 4. Testing Branch...
curl http://localhost:8063/report_app/v2/branch
echo.
echo.

echo 5. Testing Branch Details (ID=1)...
curl http://localhost:8063/report_app/v2/branch_details/1
echo.
echo.

echo 6. Testing Product Details (ID=610)...
curl http://localhost:8063/report_app/v2/product_details/610
echo.
echo.

echo 7. Testing Products (WARNING: Takes 60-70 seconds)...
curl http://localhost:8063/report_app/v2/products?query=milk
echo.
echo.

echo ========================================
echo All Tests Completed!
echo ========================================
pause
```

---

## Quick Test with Node.js

Use the test scripts already created:

```bash
# Test all endpoints (recommended)
node final-test.js

# Test all endpoints (quick version)
node test-all-endpoints.js

# Test only products endpoint
node test-products.js
```

---

## Endpoint Summary Table

| # | Method | Endpoint | Description | Speed | Data Count |
|---|--------|----------|-------------|-------|------------|
| 1 | POST | `/auth/staff/email-login` | Login | Fast | 1 token |
| 2 | GET | `/report_app/v2/home` | Dashboard | 3.8s | 5 items |
| 3 | GET | `/report_app/v2/reports` | Report list | 1.8s | 10 items |
| 4 | GET | `/report_app/v2/branch_picker` | Branch list | 0.7s | 36 branches |
| 5 | GET | `/report_app/v2/branch` | Branch sales | 3.0s | 9 items |
| 6 | GET | `/report_app/v2/branch_details/:id` | Branch details | 1.5s | ~30 days |
| 7 | GET | `/report_app/v2/products` | All products | 60-70s | 11,434 products |
| 8 | GET | `/report_app/v2/product_details/:id` | Product details | 3.6s | ~30 days |

---

## Common Query Parameters

All report endpoints support these optional parameters:

| Parameter | Format | Description | Example |
|-----------|--------|-------------|---------|
| `from_date` | YYYY-MM-DD | Start date | `?from_date=2024-10-01` |
| `to_date` | YYYY-MM-DD | End date | `?to_date=2024-10-31` |
| `branchId` | Number | Filter by branch | `?branchId=1` |
| `query` | String | Search text | `?query=milk` |

**Combine multiple parameters:**
```bash
?from_date=2024-10-01&to_date=2024-10-31&branchId=1&query=milk
```

---

## Testing with Postman

Import this collection:

```json
{
  "info": {
    "name": "Nalakath Report API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "url": "http://localhost:8063/auth/staff/email-login",
        "body": {
          "mode": "raw",
          "raw": "{\"email\":\"ras@nalakath.com\",\"password\":\"your-password\"}"
        }
      }
    },
    {
      "name": "Home",
      "request": {
        "method": "GET",
        "url": "http://localhost:8063/report_app/v2/home"
      }
    },
    {
      "name": "Reports",
      "request": {
        "method": "GET",
        "url": "http://localhost:8063/report_app/v2/reports"
      }
    },
    {
      "name": "Branch Picker",
      "request": {
        "method": "GET",
        "url": "http://localhost:8063/report_app/v2/branch_picker"
      }
    },
    {
      "name": "Branch",
      "request": {
        "method": "GET",
        "url": "http://localhost:8063/report_app/v2/branch"
      }
    },
    {
      "name": "Branch Details",
      "request": {
        "method": "GET",
        "url": "http://localhost:8063/report_app/v2/branch_details/1"
      }
    },
    {
      "name": "Products",
      "request": {
        "method": "GET",
        "url": "http://localhost:8063/report_app/v2/products?query=milk"
      }
    },
    {
      "name": "Product Details",
      "request": {
        "method": "GET",
        "url": "http://localhost:8063/report_app/v2/product_details/610"
      }
    }
  ]
}
```

---

## Browser Testing

Open these URLs directly in your browser:

1. Home: http://localhost:8063/report_app/v2/home
2. Reports: http://localhost:8063/report_app/v2/reports
3. Branch Picker: http://localhost:8063/report_app/v2/branch_picker
4. Branch: http://localhost:8063/report_app/v2/branch
5. Branch Details: http://localhost:8063/report_app/v2/branch_details/1
6. Product Details: http://localhost:8063/report_app/v2/product_details/610
7. Products (Search): http://localhost:8063/report_app/v2/products?query=milk

---

## Response Format

All endpoints return this format:

```json
{
  "success": true,          // or false if error
  "data": { ... },          // the actual data
  "message": "Success msg"  // human-readable message
}
```

**Error Response:**
```json
{
  "success": false,
  "data": {},
  "message": "Error description"
}
```

---

## Need Help?

- Run `node final-test.js` to test all endpoints automatically
- Check `TEST-RESULTS.md` for detailed test results
- Check server logs for error messages
- Verify server is running on port 8063
