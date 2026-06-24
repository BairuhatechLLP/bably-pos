// Script to check product_master table structure
const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkTable() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.BRANCH1_DB_HOST,
      port: process.env.BRANCH1_DB_PORT,
      user: process.env.BRANCH1_DB_USERNAME,
      password: process.env.BRANCH1_DB_PASSWORD,
      database: process.env.BRANCH1_DB_DATABASE,
    });

    console.log('✅ Connected to database:', process.env.BRANCH1_DB_DATABASE);

    // Show product_master table structure
    const [productColumns] = await connection.query('DESCRIBE product_master');
    console.log('\n📋 Table Structure (product_master):');
    console.table(productColumns);

    // Show product_category table structure
    const [categoryColumns] = await connection.query('DESCRIBE product_category');
    console.log('\n📋 Table Structure (product_category):');
    console.table(categoryColumns);

    // Show sample join to see what works
    const [sampleData] = await connection.query(`
      SELECT pm.*, pc.alias_name, pc.is_show_in_report
      FROM product_master pm
      LEFT JOIN product_category pc ON pm.categoryid = pc.id
      LIMIT 5
    `);
    console.log('\n📦 Sample Join (testing column names):');
    console.table(sampleData);

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkTable();
