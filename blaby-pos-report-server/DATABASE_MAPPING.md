# Database Structure Mapping

## ✅ Confirmed Tables (from user)

### Sales & Orders
- **Main Orders Table:** `order_master`
- **Order Line Items:** `order_items`

### Products
- **Main Products Table:** `product_master` (in schema: `nalakath_pmna_oct_2025`.`product_master`)
- **Product Categories:** `product_category` (stores different product categories)

### Authentication
- **Staff/User Login:** `user`

---

## 🔄 Table Mapping Changes Needed

### Current Implementation → Actual Database

| Entity File | Current Table Name | Actual Table Name | Status |
|-------------|-------------------|-------------------|---------|
| `order.entity.ts` | `orders` | `order_master` | ❌ Need to update |
| `order-item.entity.ts` | `order_items` | `order_items` | ✅ Correct |
| `product.entity.ts` | `products` | `product_master` | ❌ Need to update |
| `staff.entity.ts` | `staff` | `user` | ❌ Need to update |

---

## 📋 Pending Information Needed

### 1. order_master Table Structure
**Needed:** Run `DESCRIBE order_master;` or `SHOW COLUMNS FROM order_master;`

Expected columns to map:
- [ ] Order ID field
- [ ] Order number/reference
- [ ] Total amount
- [ ] Discount
- [ ] Tax
- [ ] Grand total
- [ ] Status (pending, completed, cancelled, etc.)
- [ ] Customer name
- [ ] Customer phone
- [ ] Payment method
- [ ] Notes/remarks
- [ ] Created date/time
- [ ] Updated date/time

### 2. order_items Table Structure
**Needed:** Run `DESCRIBE order_items;`

Expected columns to map:
- [ ] Item ID
- [ ] Order ID (FK to order_master)
- [ ] Product ID (FK to product_master)
- [ ] Product name (cached?)
- [ ] Quantity
- [ ] Unit price
- [ ] Subtotal
- [ ] Discount
- [ ] Created date/time

### 3. product_master Table Structure
**Needed:** Run `DESCRIBE product_master;`

Expected columns to map:
- [ ] Product ID
- [ ] Product name
- [ ] Description
- [ ] SKU code
- [ ] Barcode
- [ ] Selling price
- [ ] Cost price
- [ ] Stock quantity
- [ ] Category ID (FK to product_category?)
- [ ] Image URL
- [ ] Active/inactive status
- [ ] Created date/time
- [ ] Updated date/time

### 4. user Table Structure
**Needed:** Run `DESCRIBE user;`

Expected columns to map:
- [ ] User ID
- [ ] Name/full name
- [ ] Email (for login)
- [ ] Password (hashed)
- [ ] Phone number
- [ ] Role/user type (admin, manager, staff?)
- [ ] Active/inactive status
- [ ] Branch assignment (if exists)
- [ ] Created date/time
- [ ] Updated date/time

---

## 📊 Additional Tables Visible in Database

From the screenshots, other potentially useful tables:
- `sale_invoice` - Alternative sales table?
- `invoice_items` - Alternative order items?
- `staff_transactions` - Staff activity logs?
- `product_location_master` - Product locations/branches?
- `retailCustomer` - Customer database?
- `dining_table` - Restaurant/dine-in specific?
- `kitchen_display` - Kitchen orders?

**Question:** Are any of these tables needed for reporting?

---

## 🎯 Next Steps

1. **User to provide:** Column structures using `DESCRIBE` command
2. **User to provide:** Sample data from each table (1-2 rows)
3. **Developer to update:** All entity files with correct table/column names
4. **Developer to update:** All queries in `report-app.service.ts`
5. **Developer to test:** Database connections and queries

---

## 📝 Sample Data Request Format

Please provide output like this:

```sql
-- Example for order_master
DESCRIBE order_master;

-- Sample output format:
+----------------+--------------+------+-----+---------+----------------+
| Field          | Type         | Null | Key | Default | Extra          |
+----------------+--------------+------+-----+---------+----------------+
| id             | int(11)      | NO   | PRI | NULL    | auto_increment |
| order_no       | varchar(50)  | YES  |     | NULL    |                |
| total          | decimal(10,2)| YES  |     | 0.00    |                |
| ...            | ...          | ...  | ... | ...     | ...            |
+----------------+--------------+------+-----+---------+----------------+

-- Sample data:
SELECT * FROM order_master LIMIT 2;
```

---

**Status:** ⏳ Waiting for detailed column information from user
**Last Updated:** 2025-01-21
