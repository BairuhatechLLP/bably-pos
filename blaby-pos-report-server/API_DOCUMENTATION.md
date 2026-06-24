# Nalakath Report V2 - API Documentation

## Project Overview
A high-performance reporting system that aggregates live data from 7 branch POS databases with real-time updates and minimal latency.

---

## 🚀 Performance Features

### Optimizations Implemented:
1. **Parallel Query Execution** - All 7 databases queried simultaneously (70-85% faster)
2. **Connection Pooling** - 10 persistent connections per branch (70 total)
3. **Query Caching** - 5-second cache duration for TypeORM queries
4. **WebSocket Support** - Real-time data updates every 10 seconds

### Expected Performance:
- **Sequential (Before):** ~1.4-2 seconds for 7 databases
- **Parallel (After):** ~200-400ms for 7 databases
- **WebSocket:** Automatic updates without polling

---

## 📊 Step 2: Database Configuration

### Multi-Database Setup

#### Environment Variables (.env)
```env
# Server Configuration
PORT=3000
JWT_SECRET=your-secret-key-change-in-production

# Branch 1-7 Database Configuration
BRANCH1_DB_HOST=localhost
BRANCH1_DB_PORT=3306
BRANCH1_DB_USERNAME=root
BRANCH1_DB_PASSWORD=password
BRANCH1_DB_DATABASE=branch1_pos
BRANCH1_NAME=Branch 1

# ... (repeat for BRANCH2 through BRANCH7)
```

#### Database Entities Created:

**1. Staff Entity** (`src/entities/staff.entity.ts`)
- Fields: id, name, email, password, phone, role, is_active
- Used for authentication across all branches

**2. Order Entity** (`src/entities/order.entity.ts`)
- Fields: id, order_number, total_amount, discount, tax, grand_total, status, customer info
- Core entity for sales reporting

**3. Product Entity** (`src/entities/product.entity.ts`)
- Fields: id, name, sku, barcode, price, cost, stock_quantity, category
- Used for inventory and product analysis

**4. OrderItem Entity** (`src/entities/order-item.entity.ts`)
- Fields: id, order_id, product_id, quantity, price, subtotal
- Links orders to products

#### Database Module (`src/database/database.module.ts`)
- Dynamically connects to all 7 branch databases
- Provides `BRANCH_DATA_SOURCES` and `BRANCH_CONFIGS` globally
- Optimized with connection pooling and keep-alive

---

## 🔐 Step 3: API Development

### 1. Authentication System

#### Base URL: `/auth/staff`

#### POST `/auth/staff/email-login`
Login for staff members across all 7 branches.

**Request Body:**
```json
{
  "email": "staff@example.com",
  "password": "password123"
}
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
      "name": "John Doe",
      "email": "staff@example.com",
      "role": "admin",
      "phone": "+1234567890"
    }
  }
}
```

**Features:**
- Searches all 7 branch databases for staff credentials
- Password hashing with bcrypt
- JWT token with 7-day expiration
- Role-based access (admin, manager, staff)

---

### 2. Dashboard APIs

#### Base URL: `/report_app/v2`

#### GET `/report_app/v2/home`
Get comprehensive dashboard home data from all branches.

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalSalesToday": 15000.50,
      "totalSalesThisMonth": 450000.00,
      "totalSalesThisYear": 5400000.00,
      "totalOrders": 12500,
      "totalOrdersToday": 45
    },
    "branches": [
      {
        "branchId": 1,
        "branchName": "Branch 1",
        "todaySales": 2500.00,
        "monthSales": 75000.00,
        "yearSales": 850000.00,
        "todayOrders": 8,
        "totalOrders": 2100
      }
      // ... 6 more branches
    ]
  }
}
```

**Performance:** ~200-400ms (parallel execution)

---

#### GET `/report_app/v2/branch_picker`
Get list of all branches for selection dropdown.

**Response:**
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Branch 1" },
    { "id": 2, "name": "Branch 2" },
    // ... remaining branches
  ]
}
```

---

#### GET `/report_app/v2/branch`
Get all branches with detailed statistics.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Branch 1",
      "totalOrders": 2100,
      "totalProducts": 450,
      "todaySales": 2500.00,
      "todayOrders": 8
    }
    // ... 6 more branches
  ]
}
```

---

#### GET `/report_app/v2/branch_details/:id`
Get detailed information for a specific branch.

**Parameters:**
- `id` - Branch ID (1-7)

**Response:**
```json
{
  "success": true,
  "data": {
    "branch": {
      "id": 1,
      "name": "Branch 1"
    },
    "statistics": {
      "totalOrders": 2100,
      "totalProducts": 450,
      "todaySales": 2500.00,
      "todayOrders": 8,
      "monthSales": 75000.00,
      "monthOrders": 234
    },
    "recentOrders": [ /* Last 10 orders */ ],
    "topProducts": [ /* Top 10 products by quantity */ ]
  }
}
```

---

### 3. Report APIs

#### GET `/report_app/v2/reports`
Get various report types with filtering.

**Query Parameters:**
- `type` (optional): `monthly` | `yearly` | `popular_items` | `branch_comparison`
- `startDate` (optional): Start date in ISO format
- `endDate` (optional): End date in ISO format

**Without type parameter:** Returns all report types

**Response (All Reports):**
```json
{
  "success": true,
  "data": {
    "monthly": [ /* Monthly aggregated data */ ],
    "yearly": [ /* Yearly aggregated data */ ],
    "popularItems": [ /* Top 50 products */ ],
    "branchComparison": [ /* Branch performance comparison */ ]
  }
}
```

---

#### Monthly Sales Report
**Query:** `GET /report_app/v2/reports?type=monthly&startDate=2025-01-01&endDate=2025-12-31`

**Response:**
```json
{
  "success": true,
  "reportType": "monthly",
  "data": [
    {
      "month": "2025-01",
      "totalSales": 450000.00,
      "orderCount": 1200,
      "branches": {
        "Branch 1": { "sales": 75000.00, "orders": 200 },
        "Branch 2": { "sales": 65000.00, "orders": 180 }
        // ... remaining branches
      }
    }
    // ... more months
  ]
}
```

---

#### Yearly Sales Report
**Query:** `GET /report_app/v2/reports?type=yearly`

**Response:**
```json
{
  "success": true,
  "reportType": "yearly",
  "data": [
    {
      "year": 2025,
      "totalSales": 5400000.00,
      "orderCount": 12500,
      "branches": {
        "Branch 1": { "sales": 850000.00, "orders": 2100 }
        // ... remaining branches
      }
    }
  ]
}
```

---

#### Popular Items Report
**Query:** `GET /report_app/v2/reports?type=popular_items&startDate=2025-01-01&endDate=2025-12-31`

**Response:**
```json
{
  "success": true,
  "reportType": "popular_items",
  "data": [
    {
      "productId": 123,
      "productName": "Product A",
      "totalQuantity": 5000,
      "totalRevenue": 125000.00,
      "orderCount": 1500
    }
    // ... top 50 items
  ]
}
```

---

#### Branch Comparison Report
**Query:** `GET /report_app/v2/reports?type=branch_comparison&startDate=2025-01-01&endDate=2025-12-31`

**Response:**
```json
{
  "success": true,
  "reportType": "branch_comparison",
  "data": [
    {
      "branchId": 1,
      "branchName": "Branch 1",
      "totalSales": 850000.00,
      "orderCount": 2100,
      "averageOrderValue": 404.76
    }
    // ... sorted by totalSales descending
  ]
}
```

---

### 4. Product APIs

#### GET `/report_app/v2/products`
Get all products from all branches.

**Query Parameters:**
- `branchId` (optional): Filter by specific branch

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "name": "Product A",
      "sku": "SKU123",
      "price": 25.00,
      "stock_quantity": 100,
      "category": "Electronics",
      "is_active": true,
      "branchId": 1,
      "branchName": "Branch 1"
    }
    // ... all products from all branches
  ]
}
```

---

#### GET `/report_app/v2/product_details/:id`
Get detailed product information across branches.

**Parameters:**
- `id` - Product ID

**Query Parameters:**
- `branchId` (optional): Filter by specific branch

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "name": "Product A",
      "sku": "SKU123",
      "price": 25.00,
      "stock_quantity": 100,
      "branchId": 1,
      "branchName": "Branch 1",
      "salesStats": {
        "totalQuantitySold": 500,
        "totalRevenue": 12500.00,
        "orderCount": 150
      }
    }
    // ... same product from other branches
  ]
}
```

---

## 🔴 Real-Time WebSocket API

### WebSocket Endpoint: `ws://localhost:3000/live-reports`

#### Client Connection Example (JavaScript):
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000/live-reports');

// Listen for live data updates
socket.on('liveDataUpdate', (data) => {
  console.log('Live dashboard data:', data);
  // Update your UI with the latest data
});

// Automatically receives updates every 10 seconds
// Also receives immediate data on connection
```

#### Event: `liveDataUpdate`
Broadcasts the same data as `/report_app/v2/home` endpoint every 10 seconds.

**Benefits:**
- No need for constant API polling
- Real-time updates across all clients
- Minimal server load
- Instant data on connection

---

## 🏗️ Architecture Summary

### Database Layer
- 7 MySQL databases (one per branch)
- TypeORM with connection pooling (10 connections per branch)
- Query result caching (5-second duration)
- Parallel query execution across all branches

### API Layer
- NestJS framework
- RESTful endpoints for dashboard and reports
- WebSocket gateway for real-time updates
- JWT authentication with bcrypt password hashing

### Performance Optimizations
1. **Parallel Execution:** All branch queries run simultaneously
2. **Connection Pooling:** Persistent connections reduce overhead
3. **Query Caching:** Reduces database load for frequent queries
4. **WebSocket:** Eliminates polling overhead

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Update `.env` file with your database credentials for all 7 branches.

### 3. Run the Server
```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

### 4. Test the APIs
Server runs on `http://localhost:3000`

**Test Authentication:**
```bash
curl -X POST http://localhost:3000/auth/staff/email-login \
  -H "Content-Type: application/json" \
  -d '{"email":"staff@example.com","password":"password123"}'
```

**Test Dashboard:**
```bash
curl http://localhost:3000/report_app/v2/home
```

---

## 📝 Notes

- All timestamps are in UTC
- All monetary values are in decimal format (precision: 10, scale: 2)
- JWT tokens expire after 7 days
- WebSocket updates occur every 10 seconds
- Query cache duration is 5 seconds
- All endpoints return consistent `{success: boolean, data: any}` structure

---

## 🔒 Security Considerations

1. **Change JWT_SECRET** in production to a strong random string
2. **Update CORS settings** in WebSocket gateway for production
3. **Use HTTPS** for production deployment
4. **Implement rate limiting** for authentication endpoints
5. **Add request validation** using class-validator DTOs
6. **Enable database SSL** connections for production

---

## 📈 Future Enhancements

- [ ] Add pagination for large data sets
- [ ] Implement advanced filtering and search
- [ ] Add data export (CSV, Excel, PDF)
- [ ] Create scheduled reports via email
- [ ] Add real-time notifications for critical events
- [ ] Implement role-based access control (RBAC) guards
- [ ] Add API rate limiting
- [ ] Implement request/response logging

---

**Last Updated:** 2025-01-21
**Version:** 2.0
**Author:** Nalakath Report System
