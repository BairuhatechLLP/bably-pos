const mysql = require('mysql2/promise');

async function checkCompanyIds() {
  console.log('========================================');
  console.log('Checking Company/Branch IDs in Database');
  console.log('========================================\n');

  const databases = [
    { name: 'Branch 1', db: 'nalakath_pmna_oct_2025' },
    { name: 'Branch 2', db: 'nalakath_pulamanthole_oct_2025' },
    { name: 'Branch 3', db: 'nalakath_koppam_oct_2025' },
    { name: 'Branch 4', db: 'nalakath_55_oct_2025' },
    { name: 'Branch 5', db: 'nalakath_ekm_oct_2025' }
  ];

  for (const branch of databases) {
    try {
      const connection = await mysql.createConnection({
        host: '62.210.171.34',
        port: 3306,
        user: 'root',
        password: 'YOUR_DB_PASSWORD',
        database: branch.db
      });

      console.log(`\n📍 ${branch.name} (${branch.db})`);
      console.log('─'.repeat(50));

      // Check company_master table
      const [companies] = await connection.query(`
        SELECT id, bname
        FROM company_master
        ORDER BY id
        LIMIT 10
      `);

      console.log('\nCompany IDs found:');
      companies.forEach(company => {
        console.log(`  - ID: ${company.id}, Name: ${company.bname}`);
      });

      // Check if there are any orders today (2025)
      const [ordersToday] = await connection.query(`
        SELECT
          companyId,
          COUNT(*) as orderCount,
          SUM(total) as totalSales,
          DATE(createdAt) as orderDate
        FROM order_master
        WHERE DATE(createdAt) >= '2025-01-01'
        GROUP BY companyId, DATE(createdAt)
        ORDER BY orderDate DESC
        LIMIT 5
      `);

      console.log('\nRecent Orders (2025):');
      if (ordersToday.length > 0) {
        ordersToday.forEach(order => {
          console.log(`  - CompanyID: ${order.companyId}, Date: ${order.orderDate}, Orders: ${order.orderCount}, Sales: ₹${order.totalSales}`);
        });
      } else {
        console.log('  ⚠️  No orders in 2025 yet');
      }

      // Check if there are any orders in 2024
      const [orders2024] = await connection.query(`
        SELECT
          companyId,
          COUNT(*) as orderCount,
          SUM(total) as totalSales,
          DATE(createdAt) as orderDate
        FROM order_master
        WHERE DATE(createdAt) >= '2024-01-01' AND DATE(createdAt) < '2025-01-01'
        GROUP BY companyId, DATE(createdAt)
        ORDER BY orderDate DESC
        LIMIT 5
      `);

      console.log('\nRecent Orders (2024):');
      if (orders2024.length > 0) {
        orders2024.forEach(order => {
          console.log(`  - CompanyID: ${order.companyId}, Date: ${order.orderDate}, Orders: ${order.orderCount}, Sales: ₹${order.totalSales}`);
        });
      } else {
        console.log('  ⚠️  No orders in 2024');
      }

      // Check product sales
      const [productSales] = await connection.query(`
        SELECT
          oi.productId,
          pm.idescription,
          COUNT(DISTINCT oi.orderId) as orderCount,
          SUM(oi.quantity) as totalQuantity
        FROM order_items oi
        INNER JOIN order_master om ON oi.orderId = om.id
        INNER JOIN product_master pm ON oi.productId = pm.id
        WHERE DATE(om.createdAt) >= '2024-10-01' AND DATE(om.createdAt) <= '2024-10-31'
        GROUP BY oi.productId, pm.idescription
        ORDER BY totalQuantity DESC
        LIMIT 5
      `);

      console.log('\nTop Products (Oct 2024):');
      if (productSales.length > 0) {
        productSales.forEach(product => {
          console.log(`  - ${product.idescription} (ID: ${product.productId}): ${product.totalQuantity} units, ${product.orderCount} orders`);
        });
      } else {
        console.log('  ⚠️  No product sales in October 2024');
      }

      await connection.end();

    } catch (error) {
      console.error(`❌ Error checking ${branch.name}:`, error.message);
    }
  }

  console.log('\n========================================');
  console.log('✅ Check Complete');
  console.log('========================================');
}

checkCompanyIds();
