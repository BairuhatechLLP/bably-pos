# API Examples & Testing Guide

This document provides example requests and responses for all API endpoints.

## Base URL
```
http://localhost:3000
```

Replace `localhost:3000` with your actual manager server URL.

---

## Authentication

### POST /auth/staff/email-login

**Description:** Login with staff email and password to get JWT token.

**Request:**
```bash
curl -X POST http://localhost:3000/auth/staff/email-login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin",
      "phone": "+1234567890"
    }
  }
}
```

**Response (Error):**
```json
{
  "statusCode": 401,
  "message": "Invalid email or password"
}
```

---

## Report Endpoints

### GET /report_app/v2/home

**Description:** Get dashboard summary data from all 7 branches.

**Request:**
```bash
curl http://localhost:3000/report_app/v2/home
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalSalesToday": 15250.50,
      "totalSalesThisMonth": 456780.25,
      "totalSalesThisYear": 5678900.00,
      "totalOrders": 12567,
      "totalOrdersToday": 47
    },
    "branches": [
      {
        "branchId": 1,
        "branchName": "Main Branch",
        "todaySales": 2500.00,
        "monthSales": 75000.00,
        "yearSales": 900000.00,
        "todayOrders": 8,
        "totalOrders": 2100
      },
      {
        "branchId": 2,
        "branchName": "North Branch",
        "todaySales": 1800.50,
        "monthSales": 62000.00,
        "yearSales": 780000.00,
        "todayOrders": 6,
        "totalOrders": 1850
      }
      // ... other 5 branches
    ]
  }
}
```

---

### GET /report_app/v2/reports

**Description:** Get various types of reports with optional filters.

#### Example 1: Get Monthly Sales Report

**Request:**
```bash
curl "http://localhost:3000/report_app/v2/reports?type=monthly&startDate=2024-01-01&endDate=2024-12-31"
```

**Response:**
```json
{
  "success": true,
  "reportType": "monthly",
  "data": [
    {
      "month": "2024-12",
      "totalSales": 450000.00,
      "orderCount": 1200,
      "branches": {
        "Main Branch": { "sales": 75000.00, "orders": 200 },
        "North Branch": { "sales": 62000.00, "orders": 180 },
        "South Branch": { "sales": 68000.00, "orders": 190 }
        // ... other branches
      }
    },
    {
      "month": "2024-11",
      "totalSales": 420000.00,
      "orderCount": 1150,
      "branches": {
        "Main Branch": { "sales": 70000.00, "orders": 195 }
        // ... other branches
      }
    }
    // ... other months
  ]
}
```

#### Example 2: Get Yearly Sales Report

**Request:**
```bash
curl "http://localhost:3000/report_app/v2/reports?type=yearly"
```

**Response:**
```json
{
  "success": true,
  "reportType": "yearly",
  "data": [
    {
      "year": 2024,
      "totalSales": 5400000.00,
      "orderCount": 14500,
      "branches": {
        "Main Branch": { "sales": 900000.00, "orders": 2400 },
        "North Branch": { "sales": 780000.00, "orders": 2100 }
        // ... other branches
      }
    },
    {
      "year": 2023,
      "totalSales": 4800000.00,
      "orderCount": 13200,
      "branches": {
        "Main Branch": { "sales": 820000.00, "orders": 2200 }
        // ... other branches
      }
    }
  ]
}
```

#### Example 3: Get Popular Items Report

**Request:**
```bash
curl "http://localhost:3000/report_app/v2/reports?type=popular_items&startDate=2024-01-01&endDate=2024-12-31"
```

**Response:**
```json
{
  "success": true,
  "reportType": "popular_items",
  "data": [
    {
      "productId": 45,
      "productName": "Coffee - Espresso",
      "totalQuantity": 2450,
      "totalRevenue": 122500.00,
      "orderCount": 1850
    },
    {
      "productId": 78,
      "productName": "Sandwich - Club",
      "totalQuantity": 1890,
      "totalRevenue": 94500.00,
      "orderCount": 1650
    },
    {
      "productId": 23,
      "productName": "Juice - Orange Fresh",
      "totalQuantity": 1675,
      "totalRevenue": 50250.00,
      "orderCount": 1420
    }
    // ... up to 50 items
  ]
}
```

#### Example 4: Get Branch Comparison Report

**Request:**
```bash
curl "http://localhost:3000/report_app/v2/reports?type=branch_comparison&startDate=2024-01-01&endDate=2024-12-31"
```

**Response:**
```json
{
  "success": true,
  "reportType": "branch_comparison",
  "data": [
    {
      "branchId": 1,
      "branchName": "Main Branch",
      "totalSales": 900000.00,
      "orderCount": 2400,
      "averageOrderValue": 375.00
    },
    {
      "branchId": 3,
      "branchName": "South Branch",
      "totalSales": 850000.00,
      "orderCount": 2350,
      "averageOrderValue": 361.70
    },
    {
      "branchId": 2,
      "branchName": "North Branch",
      "totalSales": 780000.00,
      "orderCount": 2100,
      "averageOrderValue": 371.43
    }
    // ... sorted by total sales descending
  ]
}
```

#### Example 5: Get All Reports at Once

**Request:**
```bash
curl "http://localhost:3000/report_app/v2/reports?startDate=2024-01-01&endDate=2024-12-31"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "monthly": [ /* monthly report data */ ],
    "yearly": [ /* yearly report data */ ],
    "popularItems": [ /* popular items data */ ],
    "branchComparison": [ /* branch comparison data */ ]
  }
}
```

---

### GET /report_app/v2/branch_picker

**Description:** Get simple list of all branches for dropdown/picker components.

**Request:**
```bash
curl http://localhost:3000/report_app/v2/branch_picker
```

**Response:**
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Main Branch" },
    { "id": 2, "name": "North Branch" },
    { "id": 3, "name": "South Branch" },
    { "id": 4, "name": "East Branch" },
    { "id": 5, "name": "West Branch" },
    { "id": 6, "name": "Downtown Branch" },
    { "id": 7, "name": "Airport Branch" }
  ]
}
```

---

### GET /report_app/v2/branch

**Description:** Get all branches with current statistics.

**Request:**
```bash
curl http://localhost:3000/report_app/v2/branch
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Main Branch",
      "totalOrders": 2400,
      "totalProducts": 156,
      "todaySales": 2500.00,
      "todayOrders": 8
    },
    {
      "id": 2,
      "name": "North Branch",
      "totalOrders": 2100,
      "totalProducts": 142,
      "todaySales": 1800.50,
      "todayOrders": 6
    }
    // ... all 7 branches
  ]
}
```

---

### GET /report_app/v2/branch_details/:id

**Description:** Get detailed information about a specific branch.

**Request:**
```bash
curl http://localhost:3000/report_app/v2/branch_details/1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "branch": {
      "id": 1,
      "name": "Main Branch"
    },
    "statistics": {
      "totalOrders": 2400,
      "totalProducts": 156,
      "todaySales": 2500.00,
      "todayOrders": 8,
      "monthSales": 75000.00,
      "monthOrders": 250
    },
    "recentOrders": [
      {
        "id": 5678,
        "order_number": "ORD-2024-5678",
        "grand_total": 125.50,
        "status": "completed",
        "customer_name": "John Doe",
        "created_at": "2024-12-20T14:30:00.000Z"
      }
      // ... up to 10 recent orders
    ],
    "topProducts": [
      {
        "productId": 45,
        "productName": "Coffee - Espresso",
        "totalQuantity": 450,
        "totalRevenue": 22500.00
      }
      // ... top 10 products
    ]
  }
}
```

---

### GET /report_app/v2/products

**Description:** Get products from all branches or a specific branch.

#### Example 1: Get All Products from All Branches

**Request:**
```bash
curl http://localhost:3000/report_app/v2/products
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 45,
      "name": "Coffee - Espresso",
      "description": "Fresh espresso coffee",
      "sku": "COF-ESP-001",
      "barcode": "1234567890123",
      "price": 50.00,
      "cost": 20.00,
      "stock_quantity": 120,
      "category": "Beverages",
      "image_url": "https://example.com/images/coffee.jpg",
      "is_active": true,
      "branchId": 1,
      "branchName": "Main Branch",
      "created_at": "2024-01-15T10:00:00.000Z",
      "updated_at": "2024-12-01T08:30:00.000Z"
    }
    // ... all products from all branches
  ]
}
```

#### Example 2: Get Products from Specific Branch

**Request:**
```bash
curl "http://localhost:3000/report_app/v2/products?branchId=1"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 45,
      "name": "Coffee - Espresso",
      "price": 50.00,
      "stock_quantity": 120,
      "category": "Beverages",
      "branchId": 1,
      "branchName": "Main Branch"
      // ... other product fields
    }
    // ... products only from branch 1
  ]
}
```

---

### GET /report_app/v2/product_details/:id

**Description:** Get detailed product information with sales statistics.

#### Example 1: Get Product from All Branches

**Request:**
```bash
curl http://localhost:3000/report_app/v2/product_details/45
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 45,
      "name": "Coffee - Espresso",
      "description": "Fresh espresso coffee",
      "sku": "COF-ESP-001",
      "price": 50.00,
      "cost": 20.00,
      "stock_quantity": 120,
      "category": "Beverages",
      "branchId": 1,
      "branchName": "Main Branch",
      "salesStats": {
        "totalQuantitySold": 450,
        "totalRevenue": 22500.00,
        "orderCount": 380
      }
    },
    {
      "id": 45,
      "name": "Coffee - Espresso",
      "sku": "COF-ESP-001",
      "price": 50.00,
      "stock_quantity": 95,
      "branchId": 2,
      "branchName": "North Branch",
      "salesStats": {
        "totalQuantitySold": 380,
        "totalRevenue": 19000.00,
        "orderCount": 310
      }
    }
    // ... same product from other branches
  ]
}
```

#### Example 2: Get Product from Specific Branch

**Request:**
```bash
curl "http://localhost:3000/report_app/v2/product_details/45?branchId=1"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 45,
    "name": "Coffee - Espresso",
    "description": "Fresh espresso coffee",
    "sku": "COF-ESP-001",
    "price": 50.00,
    "stock_quantity": 120,
    "branchId": 1,
    "branchName": "Main Branch",
    "salesStats": {
      "totalQuantitySold": 450,
      "totalRevenue": 22500.00,
      "orderCount": 380
    }
  }
}
```

---

## Testing with Postman

### Import Collection

Create a new Postman collection with these requests:

1. **Login** - POST /auth/staff/email-login
2. **Home Data** - GET /report_app/v2/home
3. **Monthly Report** - GET /report_app/v2/reports?type=monthly
4. **Yearly Report** - GET /report_app/v2/reports?type=yearly
5. **Popular Items** - GET /report_app/v2/reports?type=popular_items
6. **Branch Comparison** - GET /report_app/v2/reports?type=branch_comparison
7. **Branch Picker** - GET /report_app/v2/branch_picker
8. **All Branches** - GET /report_app/v2/branch
9. **Branch Details** - GET /report_app/v2/branch_details/1
10. **All Products** - GET /report_app/v2/products
11. **Product Details** - GET /report_app/v2/product_details/45

### Environment Variables in Postman

```
BASE_URL: http://localhost:3000
JWT_TOKEN: (set after login)
```

---

## JavaScript/TypeScript Examples

### Example: Login and Get Home Data

```javascript
// Login
const loginResponse = await fetch('http://localhost:3000/auth/staff/email-login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'password123'
  })
});

const loginData = await loginResponse.json();
const token = loginData.data.token;

// Get Home Data
const homeResponse = await fetch('http://localhost:3000/report_app/v2/home', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const homeData = await homeResponse.json();
console.log(homeData);
```

### Example: Get Monthly Report

```javascript
const startDate = '2024-01-01';
const endDate = '2024-12-31';

const response = await fetch(
  `http://localhost:3000/report_app/v2/reports?type=monthly&startDate=${startDate}&endDate=${endDate}`
);

const reportData = await response.json();
console.log(reportData.data);
```

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Invalid request parameters"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Invalid email or password"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Product with ID 999 not found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Error fetching branch details: Connection refused"
}
```

---

## Notes

- All date parameters should be in `YYYY-MM-DD` format
- All monetary values are returned as numbers with 2 decimal places
- Cancelled orders are automatically excluded from sales reports
- Products with `is_active: false` are excluded from product listings
- All timestamps are in ISO 8601 format (UTC)
