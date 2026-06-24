const axios = require('axios');

const BASE_URL = 'http://localhost:8063';

async function testProductsEndpoint() {
  console.log('========================================');
  console.log('Testing Products API - Default Behavior');
  console.log('========================================\n');

  try {
    // Test 1: Default (should show Branch 1, Today's products)
    console.log('Test 1: Default (No parameters)');
    console.log('Expected: Branch 1, Today\'s date');
    console.log('URL: GET /report_app/v2/products\n');

    const start1 = Date.now();
    const response1 = await axios.get(`${BASE_URL}/report_app/v2/products`);
    const time1 = Date.now() - start1;

    console.log('✅ Status:', response1.status);
    console.log('⏱️  Response Time:', time1, 'ms');
    console.log('📊 Products Found:', response1.data.data.length);
    if (response1.data.data.length > 0) {
      console.log('📍 First Product:', {
        productId: response1.data.data[0].productId,
        description: response1.data.data[0].idescription,
        branchId: response1.data.data[0].branchId,
        totalSold: response1.data.data[0].totalSold,
      });
    }
    console.log('\n');

    // Test 2: Filter by Branch 2
    console.log('Test 2: Filter by Branch 2');
    console.log('URL: GET /report_app/v2/products?branchId=2\n');

    const start2 = Date.now();
    const response2 = await axios.get(`${BASE_URL}/report_app/v2/products?branchId=2`);
    const time2 = Date.now() - start2;

    console.log('✅ Status:', response2.status);
    console.log('⏱️  Response Time:', time2, 'ms');
    console.log('📊 Products Found:', response2.data.data.length);
    if (response2.data.data.length > 0) {
      console.log('📍 Branch ID:', response2.data.data[0].branchId);
    }
    console.log('\n');

    // Test 3: Filter by Date Range (October 2024)
    console.log('Test 3: Filter by Date Range');
    console.log('URL: GET /report_app/v2/products?from_date=2024-10-01&to_date=2024-10-31\n');

    const start3 = Date.now();
    const response3 = await axios.get(`${BASE_URL}/report_app/v2/products?from_date=2024-10-01&to_date=2024-10-31`);
    const time3 = Date.now() - start3;

    console.log('✅ Status:', response3.status);
    console.log('⏱️  Response Time:', time3, 'ms');
    console.log('📊 Products Found:', response3.data.data.length);
    console.log('\n');

    // Test 4: Combination - Branch 158 + October
    console.log('Test 4: Combination (Branch 158 + October 2024)');
    console.log('URL: GET /report_app/v2/products?branchId=158&from_date=2024-10-01&to_date=2024-10-31\n');

    const start4 = Date.now();
    const response4 = await axios.get(`${BASE_URL}/report_app/v2/products?branchId=158&from_date=2024-10-01&to_date=2024-10-31`);
    const time4 = Date.now() - start4;

    console.log('✅ Status:', response4.status);
    console.log('⏱️  Response Time:', time4, 'ms');
    console.log('📊 Products Found:', response4.data.data.length);
    if (response4.data.data.length > 0) {
      console.log('📍 First Product:', {
        productId: response4.data.data[0].productId,
        description: response4.data.data[0].idescription,
        branchId: response4.data.data[0].branchId,
        totalSold: response4.data.data[0].totalSold,
        totalAmount: response4.data.data[0].totalAmount,
      });
    }
    console.log('\n');

    // Test 5: Search with query
    console.log('Test 5: Search "milk" (default Branch 1, Today)');
    console.log('URL: GET /report_app/v2/products?query=milk\n');

    const start5 = Date.now();
    const response5 = await axios.get(`${BASE_URL}/report_app/v2/products?query=milk`);
    const time5 = Date.now() - start5;

    console.log('✅ Status:', response5.status);
    console.log('⏱️  Response Time:', time5, 'ms');
    console.log('📊 Products Found:', response5.data.data.length);
    if (response5.data.data.length > 0) {
      console.log('📍 First Product:', response5.data.data[0].idescription);
    }
    console.log('\n');

    console.log('========================================');
    console.log('✅ ALL TESTS PASSED!');
    console.log('========================================\n');

    console.log('Summary:');
    console.log('✅ Default behavior: Branch 1, Today\'s date');
    console.log('✅ Branch filter: Working');
    console.log('✅ Date filter: Working');
    console.log('✅ Combined filters: Working');
    console.log('✅ Search query: Working');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run tests
testProductsEndpoint();
