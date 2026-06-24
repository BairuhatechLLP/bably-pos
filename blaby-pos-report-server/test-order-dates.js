const { Sequelize } = require('sequelize');
require('dotenv').config();

async function testOrderDates() {
  const sequelize = new Sequelize(
    process.env.BRANCH1_DB_DATABASE,
    process.env.BRANCH1_DB_USERNAME,
    process.env.BRANCH1_DB_PASSWORD,
    {
      host: process.env.BRANCH1_DB_HOST,
      port: parseInt(process.env.BRANCH1_DB_PORT || '3306'),
      dialect: 'mysql',
      logging: console.log,
    }
  );

  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // Test 1: Get recent orders with dates
    const [results] = await sequelize.query(`
      SELECT
        id,
        companyId,
        orderStatus,
        total,
        createdAt,
        DATE(createdAt) as order_date
      FROM order_master
      WHERE companyId = 158
      ORDER BY createdAt DESC
      LIMIT 10
    `);

    console.log('\n📊 Recent Orders for Company 158:');
    console.log(JSON.stringify(results, null, 2));

    // Test 2: Count orders by date
    const [dateCounts] = await sequelize.query(`
      SELECT
        DATE(createdAt) as order_date,
        COUNT(*) as order_count,
        SUM(total) as total_amount
      FROM order_master
      WHERE companyId = 158 AND orderStatus != 'cancelled'
      GROUP BY DATE(createdAt)
      ORDER BY order_date DESC
      LIMIT 10
    `);

    console.log('\n📅 Orders by Date:');
    console.log(JSON.stringify(dateCounts, null, 2));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

testOrderDates();
