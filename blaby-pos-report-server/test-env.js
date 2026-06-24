// Quick test to verify .env variables are loading
require('dotenv').config();

console.log('\n🔍 Environment Variables Test:\n');
console.log('BRANCH1_DB_HOST:', process.env.BRANCH1_DB_HOST || '(not set)');
console.log('BRANCH1_DB_PORT:', process.env.BRANCH1_DB_PORT || '(not set)');
console.log('BRANCH1_DB_USERNAME:', process.env.BRANCH1_DB_USERNAME || '(not set)');
console.log('BRANCH1_DB_PASSWORD:', process.env.BRANCH1_DB_PASSWORD ? '***' + process.env.BRANCH1_DB_PASSWORD.slice(-3) : '(not set)');
console.log('BRANCH1_DB_DATABASE:', process.env.BRANCH1_DB_DATABASE || '(not set)');
console.log('BRANCH1_NAME:', process.env.BRANCH1_NAME || '(not set)');
console.log('\n');
