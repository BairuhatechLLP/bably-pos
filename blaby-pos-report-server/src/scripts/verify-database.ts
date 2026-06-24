import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';

dotenv.config();

async function verifyDatabase() {
  // console.log('🔍 Starting Database Verification...\n');

  const requiredTables = [
    'order_master',
    'order_items',
    'product_master',
    'product_category',
    'company_master',
  ];

  // Check all 5 active branches
  for (let i = 1; i <= 5; i++) {
    const dbName = process.env[`BRANCH${i}_DB_DATABASE`];
    const host = process.env[`BRANCH${i}_DB_HOST`];
    const port = parseInt(process.env[`BRANCH${i}_DB_PORT`] || '3306');
    const username = process.env[`BRANCH${i}_DB_USERNAME`];
    const password = process.env[`BRANCH${i}_DB_PASSWORD`];

    if (!dbName) {
      console.log(`⏭️  Skipping Branch ${i} - Not configured\n`);
      continue;
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 Branch ${i}: ${dbName}`);
    console.log(`${'='.repeat(60)}`);

    try {
      const sequelize = new Sequelize({
        dialect: 'mysql',
        host,
        port,
        username,
        password,
        database: dbName,
        logging: false,
      });

      // Test connection
      await sequelize.authenticate();
      console.log(`✅ Connection: SUCCESS`);

      // Check each required table
      for (const tableName of requiredTables) {
        try {
          // company_master doesn't have timestamp columns
          const hasTimestamps = tableName !== 'company_master';

          const query = hasTimestamps
            ? `SELECT COUNT(*) as count, MIN(createdAt) as oldest_record, MAX(createdAt) as newest_record FROM ${tableName}`
            : `SELECT COUNT(*) as count FROM ${tableName}`;

          const [results] = await sequelize.query(query);

          const data = results[0] as any;
          console.log(`\n📋 Table: ${tableName}`);
          console.log(`   ├─ Exists: YES`);
          console.log(`   ├─ Total Records: ${data.count}`);
          if (hasTimestamps && data.count > 0) {
            console.log(`   ├─ Oldest Record: ${data.oldest_record}`);
            console.log(`   └─ Newest Record: ${data.newest_record}`);
          } else if (data.count === 0) {
            console.log(`   └─ ⚠️  Warning: Table is EMPTY`);
          } else {
            console.log(`   └─ No timestamp columns (as expected)`);
          }
        } catch (error) {
          console.log(`\n📋 Table: ${tableName}`);
          console.log(`   └─ ❌ ERROR: ${error.message}`);
        }
      }

      // Check if there are any orders today
      try {
        const [todayOrders] = await sequelize.query(`
          SELECT
            COUNT(*) as todayorder,
            SUM(total) as todayamount
          FROM order_master
          WHERE DATE(createdAt) = CURDATE()
            AND orderStatus != 'cancelled'
        `);

        const today = todayOrders[0] as any;
        console.log(
          `\n📅 Today's Orders (${new Date().toISOString().split('T')[0]}):`,
        );
        console.log(`   ├─ Total Orders: ${today.todayorder}`);
        console.log(`   └─ Total Amount: ${today.todayamount || 0}`);
      } catch (error) {
        console.log(`\n📅 Today's Orders: ERROR - ${error.message}`);
      }

      await sequelize.close();
    } catch (error) {
      console.log(`❌ Connection: FAILED`);
      console.log(`   Error: ${error.message}`);
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('✅ Database verification complete!');
  console.log(`${'='.repeat(60)}\n`);
}

// Run the verification
verifyDatabase().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
