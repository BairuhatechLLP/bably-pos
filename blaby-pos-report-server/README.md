# Nalakath Report V2 - Multi-Branch POS Reporting System

A high-performance NestJS application that aggregates live sales data from 7 branch POS databases with real-time updates and minimal latency.

## 🌟 Features

This server enables you to:
- **Multi-Database Integration** - Connects to 7 branch MySQL databases simultaneously
- **Real-Time Data** - WebSocket support for live updates every 10 seconds
- **High Performance** - Parallel query execution (70-85% faster than sequential)
- **Comprehensive Reports** - Monthly, yearly, popular items, and branch comparison reports
- **Staff Authentication** - JWT-based login across all branches
- **Live Dashboard** - Real-time sales summaries and statistics

## 🚀 Performance Optimizations

### Before vs After
- **Sequential Queries:** ~1.4-2 seconds for 7 databases
- **Parallel Queries:** ~200-400ms for 7 databases ⚡
- **WebSocket Updates:** Automatic every 10 seconds (no polling needed)

### Technologies
- Connection pooling (10 connections per branch)
- Query result caching (5-second duration)
- Parallel Promise execution
- Keep-alive connections

## Architecture

```
Manager Server (NestJS + TypeORM)
    ├── Branch 1 MySQL Database
    ├── Branch 2 MySQL Database
    ├── Branch 3 MySQL Database
    ├── Branch 4 MySQL Database
    ├── Branch 5 MySQL Database
    ├── Branch 6 MySQL Database
    └── Branch 7 MySQL Database
```

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Access to all 7 branch MySQL databases
- Network connectivity to all branch servers

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

3. Edit `.env` file with your branch database credentials:
```env
# Update these for each of your 7 branches
BRANCH1_DB_HOST=your-branch1-server-ip
BRANCH1_DB_PORT=3306
BRANCH1_DB_USERNAME=your-username
BRANCH1_DB_PASSWORD=your-password
BRANCH1_DB_DATABASE=branch1_database_name
BRANCH1_NAME=Branch 1 Display Name

# Repeat for BRANCH2, BRANCH3... BRANCH7
```

## Database Table Structure

The manager server expects the following tables in each branch database:

### Orders Table
```sql
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_number VARCHAR(255),
  total_amount DECIMAL(10,2),
  discount DECIMAL(10,2),
  tax DECIMAL(10,2),
  grand_total DECIMAL(10,2),
  status VARCHAR(50),
  customer_name VARCHAR(255),
  customer_phone VARCHAR(50),
  payment_method VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Order Items Table
```sql
CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT,
  product_id INT,
  product_name VARCHAR(255),
  quantity INT,
  price DECIMAL(10,2),
  subtotal DECIMAL(10,2),
  discount DECIMAL(10,2),
  created_at TIMESTAMP
);
```

### Products Table
```sql
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  description TEXT,
  sku VARCHAR(100),
  barcode VARCHAR(100),
  price DECIMAL(10,2),
  cost DECIMAL(10,2),
  stock_quantity INT,
  category VARCHAR(100),
  image_url VARCHAR(255),
  is_active BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Staff Table (for authentication)
```sql
CREATE TABLE staff (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  phone VARCHAR(50),
  role VARCHAR(50),
  is_active BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Note:** If your table names or column names are different, you need to update the entities in `src/entities/` folder.

## Running the Server

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

The server will start on port 3000 (or the port specified in your .env file).

## API Endpoints

### Authentication

#### POST /auth/staff/email-login
Login with staff email and password.

**Request:**
```json
{
  "email": "staff@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": 1,
      "name": "Staff Name",
      "email": "staff@example.com",
      "role": "admin"
    }
  }
}
```

---

### Report Endpoints

#### GET /report_app/v2/home
Get dashboard home data with summary from all branches.

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalSalesToday": 15000,
      "totalSalesThisMonth": 450000,
      "totalSalesThisYear": 5400000,
      "totalOrders": 12500,
      "totalOrdersToday": 45
    },
    "branches": [
      {
        "branchId": 1,
        "branchName": "Branch 1",
        "todaySales": 2500,
        "monthSales": 75000,
        "yearSales": 900000,
        "todayOrders": 8,
        "totalOrders": 2000
      }
    ]
  }
}
```

---

#### GET /report_app/v2/reports
Get various report types.

**Query Parameters:**
- `type`: Report type (monthly, yearly, popular_items, branch_comparison)
- `startDate`: Start date (YYYY-MM-DD)
- `endDate`: End date (YYYY-MM-DD)

**Examples:**
```
GET /report_app/v2/reports?type=monthly&startDate=2024-01-01&endDate=2024-12-31
GET /report_app/v2/reports?type=popular_items
GET /report_app/v2/reports?type=branch_comparison
```

---

#### GET /report_app/v2/branch_picker
Get all branches for dropdown/picker.

**Response:**
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Branch 1" },
    { "id": 2, "name": "Branch 2" }
  ]
}
```

---

#### GET /report_app/v2/branch
Get all branches with statistics.

---

#### GET /report_app/v2/branch_details/:id
Get detailed information about a specific branch.

**Example:**
```
GET /report_app/v2/branch_details/1
```

---

#### GET /report_app/v2/products
Get all products from all branches or a specific branch.

**Query Parameters:**
- `branchId` (optional): Filter by specific branch

**Examples:**
```
GET /report_app/v2/products
GET /report_app/v2/products?branchId=1
```

---

#### GET /report_app/v2/product_details/:id
Get detailed product information.

**Query Parameters:**
- `branchId` (optional): Filter by specific branch

---

## 🔌 WebSocket Real-Time Updates

Connect from your frontend using Socket.IO for live data:

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000/live-reports');

socket.on('liveDataUpdate', (data) => {
  console.log('Live dashboard data:', data);
  // Update your UI with the latest data
});

// Automatically receives updates every 10 seconds
// Also receives immediate data on connection
```

## 🔗 Connecting Your Report App

Update your report app's base URL to point to this manager server:

```javascript
const API_BASE_URL = 'http://your-manager-server-ip:3000';
const WS_URL = 'ws://your-manager-server-ip:3000/live-reports';

// Your existing endpoints will work the same way
// POST /auth/staff/email-login
// GET /report_app/v2/home
// GET /report_app/v2/reports
// etc.
```

## Security Recommendations

1. **Change JWT Secret**: Update `JWT_SECRET` in `.env` with a strong random string
2. **Enable CORS**: Update CORS settings in `src/main.ts` to allow only your report app's domain
3. **Use HTTPS**: In production, use HTTPS with SSL certificates
4. **Secure Database Credentials**: Use environment variables and never commit `.env` to version control
5. **Network Security**: Ensure manager server can access all branch databases through secure network/VPN

## Troubleshooting

### Can't connect to branch database
- Verify database host, port, username, and password in `.env`
- Check network connectivity: `ping branch-server-ip`
- Ensure MySQL allows remote connections
- Check firewall rules on branch servers

### Table not found errors
- Verify table names match your actual database schema
- Update entity files in `src/entities/` if your table names are different

### No data returned
- Check if branch databases have data
- Verify the `status` column in orders (cancelled orders are excluded)
- Check the date ranges for reports

## Project Structure

```
src/
├── auth/                 # Authentication module
├── config/               # Configuration files
├── database/             # Database module
├── entities/             # TypeORM entities
├── report-app/           # Report endpoints
├── app.module.ts         # Main application module
└── main.ts               # Application entry point
```

## Customization

### Adjusting for Different Table/Column Names

If your database has different table or column names, update the entities in `src/entities/`:

```typescript
// Example: If your orders table is called "sales"
@Entity('sales')  // Change table name here
export class Order {
  // Update column names as needed
  @Column({ name: 'order_no' })  // If column is named differently
  order_number: string;
}
```

## License

UNLICENSED - Private use only
