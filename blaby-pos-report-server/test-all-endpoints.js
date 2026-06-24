// Test all endpoints to verify the server is ready
const http = require('http');

const endpoints = [
  { name: 'Home', path: '/report_app/v2/home' },
  { name: 'Reports', path: '/report_app/v2/reports' },
  { name: 'Branch Picker', path: '/report_app/v2/branch_picker' },
  { name: 'Branch', path: '/report_app/v2/branch' },
  { name: 'Branch Details (ID=1)', path: '/report_app/v2/branch_details/1' },
  { name: 'Products', path: '/report_app/v2/products' },
  { name: 'Product Details (ID=610)', path: '/report_app/v2/product_details/610' },
];

function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 8063,
      path: endpoint.path,
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({
            name: endpoint.name,
            status: res.statusCode,
            success: json.success !== false,
            dataType: Array.isArray(json.data) ? 'array' : typeof json.data,
            dataCount: Array.isArray(json.data) ? json.data.length : Object.keys(json.data || {}).length,
            message: json.message
          });
        } catch (e) {
          resolve({
            name: endpoint.name,
            status: res.statusCode,
            success: false,
            error: 'JSON parse error'
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        name: endpoint.name,
        status: 0,
        success: false,
        error: error.message
      });
    });

    req.end();
  });
}

async function testAll() {
  console.log('========================================');
  console.log('🧪 Testing All Endpoints');
  console.log('========================================\n');

  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);

    const statusIcon = result.success ? '✅' : '❌';
    console.log(`${statusIcon} ${result.name}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Success: ${result.success}`);
    if (result.dataType) {
      console.log(`   Data Type: ${result.dataType}`);
      console.log(`   Data Count: ${result.dataCount}`);
    }
    if (result.message) {
      console.log(`   Message: ${result.message}`);
    }
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    console.log('');
  }

  console.log('========================================');
  console.log('✅ All Endpoint Tests Completed!');
  console.log('========================================');
}

testAll();
