// Script to activate ras@nalakath.com account
const mysql = require('mysql2/promise');
require('dotenv').config();

async function activateAdmin() {
  try {
    // Connect to Branch 1 database
    const connection = await mysql.createConnection({
      host: process.env.BRANCH1_DB_HOST,
      port: process.env.BRANCH1_DB_PORT,
      user: process.env.BRANCH1_DB_USERNAME,
      password: process.env.BRANCH1_DB_PASSWORD,
      database: process.env.BRANCH1_DB_DATABASE,
    });

    console.log('✅ Connected to database:', process.env.BRANCH1_DB_DATABASE);

    // Check current status
    const [users] = await connection.query(
      'SELECT id, name, email, companyId, is_active FROM contact_master WHERE email = ? AND companyId = ?',
      ['ras@nalakath.com', 158]
    );

    if (users.length === 0) {
      console.log('❌ User not found!');
      console.log('📝 Please check if the user exists with:');
      console.log('   - Email: ras@nalakath.com');
      console.log('   - CompanyId: 158');
      await connection.end();
      return;
    }

    console.log('\n📋 Current User Status:');
    console.log(users[0]);

    // Activate the account
    const [result] = await connection.query(
      'UPDATE contact_master SET is_active = 1 WHERE email = ? AND companyId = ?',
      ['ras@nalakath.com', 158]
    );

    console.log('\n✅ Account activated successfully!');
    console.log('📊 Rows affected:', result.affectedRows);

    // Verify update
    const [updatedUsers] = await connection.query(
      'SELECT id, name, email, companyId, is_active FROM contact_master WHERE email = ? AND companyId = ?',
      ['ras@nalakath.com', 158]
    );

    console.log('\n📋 Updated User Status:');
    console.log(updatedUsers[0]);

    await connection.end();
    console.log('\n🎉 Done! You can now login with ras@nalakath.com');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

activateAdmin();
