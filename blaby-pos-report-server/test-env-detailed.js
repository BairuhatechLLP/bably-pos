// Comprehensive .env test
const path = require('path');
const fs = require('fs');

console.log('\n=== 🔍 ENVIRONMENT VARIABLES DEBUGGING ===\n');

// 1. Check if .env file exists
const envPath = path.join(__dirname, '.env');
console.log('1. Checking .env file location:');
console.log('   Path:', envPath);
console.log('   Exists:', fs.existsSync(envPath) ? '✅ Yes' : '❌ No');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  console.log('   Lines in file:', lines.length);
  console.log('   First 3 lines:');
  lines.slice(0, 3).forEach((line, i) => {
    console.log(`      ${i + 1}: ${line.substring(0, 50)}...`);
  });
}

console.log('\n2. Loading dotenv:');
require('dotenv').config();
console.log('   ✅ dotenv.config() called\n');

console.log('3. Environment Variables (what Node.js sees):');
console.log('   PORT:', process.env.PORT || '(not set)');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '***' : '(not set)');
console.log('\n4. Branch 1 Database Config:');
console.log('   BRANCH1_DB_HOST:', process.env.BRANCH1_DB_HOST || '❌ (not set - will use "localhost")');
console.log('   BRANCH1_DB_PORT:', process.env.BRANCH1_DB_PORT || '❌ (not set - will use "3306")');
console.log('   BRANCH1_DB_USERNAME:', process.env.BRANCH1_DB_USERNAME || '❌ (not set - will use "root")');
console.log('   BRANCH1_DB_PASSWORD:', process.env.BRANCH1_DB_PASSWORD ? `✅ Set (***${process.env.BRANCH1_DB_PASSWORD.slice(-3)})` : '❌ (not set - will use empty string)');
console.log('   BRANCH1_DB_DATABASE:', process.env.BRANCH1_DB_DATABASE || '❌ (not set - will use "branch1_pos")');
console.log('   BRANCH1_NAME:', process.env.BRANCH1_NAME || '❌ (not set - will use "Branch 1")');

console.log('\n5. What will be used for connection:');
const host = process.env.BRANCH1_DB_HOST || 'localhost';
const port = process.env.BRANCH1_DB_PORT || '3306';
const username = process.env.BRANCH1_DB_USERNAME || 'root';
const password = process.env.BRANCH1_DB_PASSWORD || '';
const database = process.env.BRANCH1_DB_DATABASE || 'branch1_pos';

console.log('   Host:', host);
console.log('   Port:', port);
console.log('   Username:', username);
console.log('   Password:', password ? `***${password.slice(-3)}` : '(empty)');
console.log('   Database:', database);

console.log('\n6. Testing MySQL connection command:');
console.log(`   mysql -h ${host} -P ${port} -u ${username} -p`);
console.log(`   (You'll need to enter password: ${password ? '***' : '(empty)'})`);

console.log('\n=== END DEBUG ===\n');
