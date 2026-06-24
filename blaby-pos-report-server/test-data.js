// Script to check what data exists in the database
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testData() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.BRANCH1_DB_HOST,
      port: process.env.BRANCH1_DB_PORT,
      user: process.env.BRANCH1_DB_USERNAME,
      password: process.env.BRANCH1_DB_PASSWORD,
      database: process.env.BRANCH1_DB_DATABASE,
    });

    console.log('✅ Connected to database:', process.env.BRANCH1_DB_DATABASE);

    // Check recent products
    const [products] = await connection.query(`
      SELECT productId, COUNT(*) as orderCount, SUM(quantity) as totalQuantity
      FROM order_items
      WHERE orderStatus != 'cancelled'
      GROUP BY productId
      ORDER BY COUNT(*) DESC
      LIMIT 10
    `);

    console.log('\n📦 Top 10 Products:');
    console.table(products);

    // Check companies/branches
    const [companies] = await connection.query(`
      SELECT id, bname as branchName
      FROM company_master
      LIMIT 10
    `);

    console.log('\n🏢 Companies/Branches:');
    console.table(companies);

    // Check recent order dates
    const [orderDates] = await connection.query(`
      SELECT
        DATE(createdAt) as orderDate,
        COUNT(*) as orderCount,
        SUM(total) as totalSales
      FROM order_master
      WHERE orderStatus != 'cancelled'
      GROUP BY DATE(createdAt)
      ORDER BY DATE(createdAt) DESC
      LIMIT 30
    `);

    console.log('\n📅 Recent Order Dates (Last 30 days):');
    console.table(orderDates);

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testData();
