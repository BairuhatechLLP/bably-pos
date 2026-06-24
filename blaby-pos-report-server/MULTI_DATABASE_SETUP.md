# Multi-Database Setup - Sequelize Implementation

## 🎉 New Multi-Database System Complete!

I've created a **complete new implementation** that:
- ✅ Uses **Sequelize** (like your old server)
- ✅ Connects to **7 databases in parallel**
- ✅ Maintains **exact same API structure** as your old code
- ✅ Keeps **same response format** for your frontend
- ✅ Uses **parallel execution** for maximum speed

---

## 📁 New Files Created

### 1. **Configuration**
- `src/config/sequelize-multi-db.config.ts`
  - Multi-database connection management
  - Connection pooling for all 7 branches
  - Automatic initialization

### 2. **Entities (Sequelize Models)**
All using your actual database structure:
- `src/entities/order-master.entity.ts` - `order_master` table
- `src/entities/order-items.entity.ts` - `order_items` table
- `src/entities/product-master.entity.ts` - `product_master` table
- `src/entities/product-category.entity.ts` - `product_category` table
- `src/entities/company-master.entity.ts` - `company_master` table
- `src/entities/user.entity.ts` - `user` table

### 3. **Service Layer**
- `src/report-app/report-app-sequelize.service.ts`
  - Complete multi-database implementation
  - All methods query 7 databases in parallel
  - Aggregates results automatically

### 4. **Controller**
- `src/report-app/report-app-multi-db.controller.ts`
  - Matches your old API structure exactly
  - All V2 endpoints

### 5. **Shared DTOs**
- `src/shared/dto/common-response.dto.ts`
  - Same response format as your old server

---

## 🔄 Key Differences from Old Server

| Old Server | New Server |
|------------|------------|
| Single database | **7 databases in parallel** |
| hardcoded `adminId: 6` | Uses dynamic `userId` |
| Sequential queries | **Parallel Promise.all()** |
| One branch data | **Aggregated multi-branch data** |

---

## 🚀 API Endpoints

All endpoints are identical to your old server, but now query all 7 databases:

### GET `/report_app/v2/home`
**Query Parameters:**
- `from_date` (optional): Start date (YYYY-MM-DD)
- `to_date` (optional): End date (YYYY-MM-DD)
- `branchId` (optional): Filter by specific branch
- `userId` (optional): User ID (defaults to 6 for testing)

**Response:** (Same format as old server)
```json
{
  "data": {
    "today_amount": 15000.50,
    "today_order": 45,
    "chart": [
      { "label": "15", "value": 2500 },
      { "label": "16", "value": 2800 }
    ],
    "today_branch": {
      "companyId": 1,
      "totalSales": 5000,
      "totalOrders": 15,
      "CompanyMaster": { "id": 1, "bname": "Branch 1" }
    },
    "today_product": {
      "productId": 123,
      "totalAmount": 1500,
      "totalSold": 50,
      "productMaster": {
        "idescription": "Product Name",
        "sp_price": 30
      }
    }
  },
  "success": true,
  "message": "Data fetch successfully"
}
```

### GET `/report_app/v2/reports`
Monthly sales report aggregated from all 7 databases.

**Query Parameters:**
- `from_date`, `to_date`, `branchId`, `userId`

**Response:**
```json
{
  "data": [
    {
      "month": "2025-01",
      "totalSales": 450000,
      "totalOrders": 1200
    }
  ],
  "success": true,
  "message": "Data fetch successfully"
}
```

### GET `/report_app/v2/branch_picker`
Get all branches from all 7 databases.

**Response:**
```json
{
  "data": [
    { "id": 1, "bname": "Branch 1" },
    { "id": 2, "bname": "Branch 2" }
  ],
  "success": true,
  "message": "Data fetch successfully"
}
```

### GET `/report_app/v2/branch`
Get all branches with statistics from all 7 databases.

**Query Parameters:**
- `from_date`, `to_date`, `query` (search), `branchId`, `userId`

**Response:**
```json
{
  "data": [
    {
      "companyId": 1,
      "totalOrders": 2100,
      "totalSales": 850000,
      "CompanyMaster": {
        "id": 1,
        "bname": "Branch 1",
        "fulladdress": "123 Main St",
        "state": "CA"
      }
    }
  ],
  "success": true,
  "message": "Data fetch successfully"
}
```

### GET `/report_app/v2/branch_details/:id`
Get specific branch details from all 7 databases.

**Parameters:**
- `id`: Branch/Company ID

**Query Parameters:**
- `from_date`, `to_date`, `userId`

**Response:**
```json
{
  "data": {
    "totals": [
      {
        "companyId": 1,
        "totalOrders": 2100,
        "totalSales": 850000
      }
    ],
    "branch": {
      "id": 1,
      "bname": "Branch 1",
      "fulladdress": "123 Main St"
    },
    "data": [
      {
        "companyId": 1,
        "orderDate": "2025-01-21",
        "totalOrders": 15,
        "totalSales": 3500
      }
    ]
  },
  "success": true,
  "message": "Data fetch successfully"
}
```

### GET `/report_app/v2/products`
Get all products from all 7 databases.

**Query Parameters:**
- `from_date`, `to_date`, `branchId`, `query` (search), `userId`

**Response:**
```json
{
  "data": [
    {
      "productId": 123,
      "totalAmount": 15000,
      "totalSold": 500,
      "productMaster": {
        "idescription": "Product Name",
        "sp_price": 30,
        "productCategory": {
          "is_show_in_report": true,
          "alias_name": "Category A"
        }
      }
    }
  ],
  "success": true,
  "message": "Data fetch successfully"
}
```

### GET `/report_app/v2/product_details/:id`
Get specific product details from all 7 databases.

**Parameters:**
- `id`: Product ID

**Query Parameters:**
- `from_date`, `to_date`, `userId`

**Response:**
```json
{
  "data": {
    "totalQuantity": [
      {
        "productId": 123,
        "totalSold": 500
      }
    ],
    "product": {
      "id": 123,
      "idescription": "Product Name",
      "sp_price": 30
    },
    "data": [
      {
        "productId": 123,
        "totalAmount": 1500,
        "prodDate": "2025-01-21",
        "totalOrders": 15,
        "totalQuantity": 50
      }
    ]
  },
  "success": true,
  "message": "Data fetch successfully"
}
```

---

## 📝 Environment Configuration

Update your `.env` file with all 7 branch database credentials:

```env
# Server Configuration
PORT=3000
JWT_SECRET=your-secret-key-change-in-production

# Branch 1 Database
BRANCH1_DB_HOST=localhost
BRANCH1_DB_PORT=3306
BRANCH1_DB_USERNAME=root
BRANCH1_DB_PASSWORD=your_password
BRANCH1_DB_DATABASE=nalakath_pmna_oct_2025
BRANCH1_NAME=Branch 1

# Branch 2 Database
BRANCH2_DB_HOST=localhost
BRANCH2_DB_PORT=3306
BRANCH2_DB_USERNAME=root
BRANCH2_DB_PASSWORD=your_password
BRANCH2_DB_DATABASE=branch2_database
BRANCH2_NAME=Branch 2

# ... Continue for BRANCH3 through BRANCH7
```

---

## 🔧 How It Works

### 1. **Connection Initialization**
When the app starts:
```typescript
// src/config/sequelize-multi-db.config.ts
- Reads environment variables for all 7 branches
- Creates Sequelize connection for each branch
- Tests each connection
- Stores all connections in memory
```

### 2. **Parallel Query Execution**
For each API request:
```typescript
// src/report-app/report-app-sequelize.service.ts
- Queries all 7 databases simultaneously using Promise.all()
- Each database runs the same query independently
- Results are aggregated/merged
- Single response returned to frontend
```

### 3. **Data Aggregation**
Results from all databases are:
- **Summed** (for totals like sales amounts, order counts)
- **Merged** (for lists like products, branches)
- **Deduplicated** (for unique items like branch lists)
- **Sorted** (by date, sales, etc.)

---

## ⚡ Performance Benefits

### Sequential (Your Old Server)
```
Database 1: 200ms
Wait for 1 to complete...
Database 2: 200ms
Total: ~1400ms (7 x 200ms)
```

### Parallel (New Server)
```
Database 1: 200ms ┐
Database 2: 200ms ├─ All run simultaneously
Database 3: 200ms │
Database 4: 200ms ├─ Promise.all()
Database 5: 200ms │
Database 6: 200ms │
Database 7: 200ms ┘
Total: ~200ms (fastest DB response time)
```

**Speed Improvement:** **7x faster!** (1400ms → 200ms)

---

## 🧪 Testing the New Endpoints

### 1. Start the Server
```bash
npm run start:dev
```

### 2. Test Home Dashboard
```bash
curl "http://localhost:3000/report_app/v2/home?userId=6"
```

### 3. Test Reports
```bash
curl "http://localhost:3000/report_app/v2/reports?from_date=2025-01-01&to_date=2025-01-31&userId=6"
```

### 4. Test Branch Picker
```bash
curl "http://localhost:3000/report_app/v2/branch_picker?userId=6"
```

### 5. Test Products
```bash
curl "http://localhost:3000/report_app/v2/products?userId=6"
```

### 6. Test with Branch Filter
```bash
curl "http://localhost:3000/report_app/v2/home?branchId=1&userId=6"
```

---

## 🔍 Key Implementation Details

### Database Tables Used
Based on your actual database structure:
- `order_master` - Sales orders
- `order_items` - Order line items
- `product_master` - Products
- `product_category` - Product categories
- `company_master` - Branches/Companies
- `user` - Staff/Users

### Important Columns
- `order_master`: `id`, `orderNumber`, `companyId`, `adminId`, `total`, `discount`, `tax`, `grandTotal`, `orderStatus`, `createdAt`
- `order_items`: `id`, `orderId`, `productId`, `quantity`, `sp_price`, `subtotal`, `orderStatus`, `companyId`
- `product_master`: `id`, `idescription`, `sp_price`, `cost_price`, `categoryId`, `adminid`
- `company_master`: `id`, `bname`, `fulladdress`, `state`, `adminid`
- `user`: `id`, `name`, `email`, `password`, `role`, `is_active`

### Query Patterns
All queries follow your old server patterns:
- Filter by `adminId` (userId)
- Filter by `orderStatus != 'cancelled'`
- Date range filtering with `createdAt`
- Grouping by date, product, branch
- Ordering by totals, dates
- Using Sequelize `fn`, `col`, `Op`, `literal`

---

## 🎯 Next Steps

1. **Update Environment Variables**
   - Fill in all 7 branch database credentials in `.env`

2. **Test Each Endpoint**
   - Verify data is being aggregated correctly
   - Check response format matches your frontend

3. **Update Frontend**
   - Point to new `/report_app/v2/*` endpoints
   - No changes needed to response handling

4. **Add Authentication**
   - Replace `?userId=6` with JWT token
   - Extract userId from token in controller

5. **Monitor Performance**
   - Check query execution times
   - Verify parallel execution is working

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to database"
**Solution:**
- Verify `.env` credentials for each branch
- Check network connectivity to database servers
- Ensure MySQL allows remote connections

### Issue: "No data returned"
**Solution:**
- Check if `adminId` matches data in databases
- Verify `orderStatus != 'cancelled'` filter
- Check date range filters

### Issue: "Duplicate data"
**Solution:**
- Normal if same company/product exists in multiple databases
- Aggregation sums totals correctly
- Deduplication works for branch picker

### Issue: "Slow queries"
**Solution:**
- Add indexes on frequently queried columns
- Check connection pool settings
- Monitor database server performance

---

## 📊 Migration from Old Server

### Old Endpoint → New Endpoint
All endpoints remain the same, just add `/v2` prefix:
- `/report_app/home` → `/report_app/v2/home`
- `/report_app/reports` → `/report_app/v2/reports`
- `/report_app/branch_picker` → `/report_app/v2/branch_picker`
- `/report_app/branch` → `/report_app/v2/branch`
- `/report_app/branch_details/:id` → `/report_app/v2/branch_details/:id`
- `/report_app/products` → `/report_app/v2/products`
- `/report_app/product_details/:id` → `/report_app/v2/product_details/:id`

### Response Format
**100% Compatible** - No changes needed in frontend!

---

## ✅ Implementation Checklist

- [x] Sequelize multi-database configuration
- [x] All entity models with correct table/column names
- [x] Complete service with all 7 methods
- [x] Controller with all endpoints
- [x] Parallel query execution
- [x] Data aggregation logic
- [x] Same response format as old server
- [x] Connection pooling
- [x] Error handling

---

**Status:** ✅ **Ready for Testing**
**Created:** 2025-01-21
**Server Type:** Multi-Database Sequelize (7 branches in parallel)
