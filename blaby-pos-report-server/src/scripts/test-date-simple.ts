import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';
import moment from 'moment';

dotenv.config();

// OLD implementation (BROKEN)
async function formatDateOLD(date: any) {
  const format = `YYYY-MM-DD HH:mm:ss`;
  const formated = moment(date || new Date(), format)
    .utcOffset(0, true)
    .toDate();
  return formated;
}

// NEW implementation (FIXED)
async function formatDate(date: any) {
  return moment(date || new Date()).toDate();
}

async function testDateIssue() {
  // console.log('🔍 Testing Date Formatting Issue...\n');

  const dbName = process.env.BRANCH1_DB_DATABASE;
  const host = process.env.BRANCH1_DB_HOST;
  const port = parseInt(process.env.BRANCH1_DB_PORT || '3306');
  const username = process.env.BRANCH1_DB_USERNAME;
  const password = process.env.BRANCH1_DB_PASSWORD;

  const sequelize = new Sequelize({
    dialect: 'mysql',
    host,
    port,
    username,
    password,
    database: dbName,
    logging: false,
  });

  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    // Current date info
    const now = new Date();
    console.log('📅 Current Date Information:');
    console.log(`   JavaScript Date: ${now}`);
    console.log(`   ISO String: ${now.toISOString()}`);
    console.log(`   Local String: ${now.toLocaleString()}`);
    console.log(`   Timezone Offset: ${now.getTimezoneOffset()} minutes`);

    // Test OLD implementation (BROKEN)
    const date = new Date();
    const startDateOLD = await formatDateOLD(moment(date).startOf('day'));
    const endDateOLD = await formatDateOLD(moment(date).endOf('day'));

    console.log('\n❌ OLD Implementation (BROKEN - with UTC conversion):');
    console.log(`   Start Date: ${startDateOLD}`);
    console.log(`   End Date: ${endDateOLD}`);

    // Test NEW implementation (FIXED)
    const startDateNEW = await formatDate(moment(date).startOf('day'));
    const endDateNEW = await formatDate(moment(date).endOf('day'));

    console.log('\n✅ NEW Implementation (FIXED - no UTC conversion):');
    console.log(`   Start Date: ${startDateNEW}`);
    console.log(`   End Date: ${endDateNEW}`);

    // Query 1: Using OLD implementation (BROKEN)
    console.log('\n❌ Query 1: Using OLD formatDate (BROKEN)');
    const [result1] = await sequelize.query(
      `
      SELECT
        COUNT(*) as todayorder,
        SUM(total) as todayamount
      FROM order_master
      WHERE createdAt BETWEEN ? AND ?
        AND orderStatus != 'cancelled'
    `,
      {
        replacements: [startDateOLD, endDateOLD],
      },
    );
    console.log('Result:', result1[0]);

    // Query 2: Using NEW implementation (FIXED)
    console.log('\n✅ Query 2: Using NEW formatDate (FIXED)');
    const [result2] = await sequelize.query(
      `
      SELECT
        COUNT(*) as todayorder,
        SUM(total) as todayamount
      FROM order_master
      WHERE createdAt BETWEEN ? AND ?
        AND orderStatus != 'cancelled'
    `,
      {
        replacements: [startDateNEW, endDateNEW],
      },
    );
    console.log('Result:', result2[0]);

    // Query 3: Using CURDATE() (like verification script)
    console.log('\n📊 Query 3: Using CURDATE() (MySQL native)');
    const [result3] = await sequelize.query(`
      SELECT
        COUNT(*) as todayorder,
        SUM(total) as todayamount
      FROM order_master
      WHERE DATE(createdAt) = CURDATE()
        AND orderStatus != 'cancelled'
    `);
    console.log('Result:', result3[0]);

    // Check what the server time is
    console.log('\n🕐 MySQL Server Time:');
    const [serverTime] = await sequelize.query(
      'SELECT NOW() as server_time, CURDATE() as current_date',
    );
    console.log(serverTime[0]);

    // Check recent records
    console.log('\n📅 Recent Orders (Last 5):');
    const [recentOrders] = await sequelize.query(`
      SELECT id, createdAt, total, orderStatus
      FROM order_master
      ORDER BY createdAt DESC
      LIMIT 5
    `);
    console.log(recentOrders);

    await sequelize.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

testDateIssue();
