// Script to check contact_master table structure
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

    // Show table structure
    const [columns] = await connection.query('DESCRIBE contact_master');
    console.log('\n📋 Table Structure (contact_master):');
    console.table(columns);

    // Show the actual user data
    const [users] = await connection.query(
      'SELECT * FROM contact_master WHERE email = ? AND companyId = ? LIMIT 1',
      ['ras@nalakath.com', 158]
    );

    console.log('\n👤 User Data:');
    if (users.length > 0) {
      console.log(users[0]);
    } else {
      console.log('❌ User not found with email: ras@nalakath.com and companyId: 158');

      // Check if user exists with different companyId
      const [allUsers] = await connection.query(
        'SELECT * FROM contact_master WHERE email = ? LIMIT 5',
        ['ras@nalakath.com']
      );

      if (allUsers.length > 0) {
        console.log('\n⚠️  Found user(s) with same email but different companyId:');
        console.table(allUsers);
      }
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkTable();
