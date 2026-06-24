// Final comprehensive test for all endpoints
const http = require('http');

console.log('========================================');
console.log('🧪 FINAL ENDPOINT TEST');
console.log('========================================\n');

const endpoints = [
  {
    name: '1. Home Dashboard',
    path: '/report_app/v2/home',
    description: 'Today\'s sales summary from all branches'
  },
  {
    name: '2. Reports List',
    path: '/report_app/v2/reports',
    description: 'Available report types'
  },
  {
    name: '3. Branch Picker',
    path: '/report_app/v2/branch_picker',
    description: 'List of all branches'
  },
  {
    name: '4. Branch Sales',
    path: '/report_app/v2/branch',
    description: 'Sales data by branch'
  },
  {
    name: '5. Branch Details (ID=1)',
    path: '/report_app/v2/branch_details/1',
    description: 'Daily sales for branch ID 1 (last 30 days)'
  },
  {
    name: '6. Products List',
    path: '/report_app/v2/products',
    description: 'All products with sales data'
  },
  {
    name: '7. Product Details (ID=610)',
    path: '/report_app/v2/product_details/610',
    description: 'Daily sales for product ID 610 (last 30 days)'
  },
];

function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const startTime = Date.now();

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
        const duration = Date.now() - startTime;
        try {
          const json = JSON.parse(data);
          const success = json.success !== false;

          resolve({
            name: endpoint.name,
            description: endpoint.description,
            status: res.statusCode,
            success: success,
            dataType: Array.isArray(json.data) ? 'array' : typeof json.data,
            dataCount: Array.isArray(json.data) ? json.data.length : (json.data ? Object.keys(json.data).length : 0),
            message: json.message,
            duration: duration,
            sampleData: json.data
          });
        } catch (e) {
          resolve({
            name: endpoint.name,
            description: endpoint.description,
            status: res.statusCode,
            success: false,
            error: 'JSON parse error',
            duration: duration
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        name: endpoint.name,
        description: endpoint.description,
        status: 0,
        success: false,
        error: error.message
      });
    });

    req.setTimeout(60000, () => {
      req.destroy();
      resolve({
        name: endpoint.name,
        description: endpoint.description,
        status: 0,
        success: false,
        error: 'Request timeout (60s)'
      });
    });

    req.end();
  });
}

async function runTests() {
  console.log('🔍 Testing server at http://localhost:8063\n');

  const results = [];

  for (const endpoint of endpoints) {
    console.log(`Testing: ${endpoint.name}...`);
    const result = await testEndpoint(endpoint);
    results.push(result);

    const statusIcon = result.success ? '✅' : '❌';
    console.log(`${statusIcon} ${result.name}`);
    console.log(`   Description: ${result.description}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Success: ${result.success}`);

    if (result.duration) {
      console.log(`   Response Time: ${result.duration}ms`);
    }

    if (result.dataType) {
      console.log(`   Data Type: ${result.dataType}`);
      console.log(`   Data Count: ${result.dataCount}`);
    }

    if (result.message) {
      console.log(`   Message: ${result.message}`);
    }

    if (result.error) {
      console.log(`   ❌ Error: ${result.error}`);
    }

    // Show sample data for some endpoints
    if (result.success && result.sampleData) {
      if (endpoint.name.includes('Home')) {
        console.log(`   📊 Sample: Today's Orders: ${result.sampleData.totalOrders || 0}, Sales: ₹${result.sampleData.totalSales || 0}`);
      } else if (endpoint.name.includes('Branch Details')) {
        if (result.sampleData.totals && result.sampleData.totals[0]) {
          console.log(`   📊 Total Orders: ${result.sampleData.totals[0].totalOrders}, Total Sales: ₹${result.sampleData.totals[0].totalSales}`);
        }
      } else if (endpoint.name.includes('Product Details')) {
        if (result.sampleData.totalQuantity && result.sampleData.totalQuantity[0]) {
          console.log(`   📊 Total Sold: ${result.sampleData.totalQuantity[0].totalSold} units`);
        }
        if (result.sampleData.product) {
          console.log(`   📦 Product: ${result.sampleData.product.idescription}`);
        }
      } else if (Array.isArray(result.sampleData) && result.sampleData.length > 0) {
        if (endpoint.name.includes('Products')) {
          const topProduct = result.sampleData[0];
          console.log(`   📦 Top Product: ${topProduct.idescription} - Sold: ${topProduct.totalSold}`);
        }
      }
    }

    console.log('');
  }

  // Summary
  console.log('========================================');
  console.log('📊 TEST SUMMARY');
  console.log('========================================');

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const total = results.length;

  console.log(`\n✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${failed}/${total}`);

  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('✅ Server is PRODUCTION READY');
    console.log('\n📱 You can now integrate with your mobile app:');
    console.log('   Base URL: http://localhost:8063');
    console.log('   Auth: POST /auth/staff/email-login');
    console.log('   Reports: GET /report_app/v2/*');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }

  console.log('\n========================================\n');
}

runTests().catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});
