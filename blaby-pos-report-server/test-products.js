// Test products endpoint
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 8063,
  path: '/report_app/v2/products',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('\n✅ Status Code:', res.statusCode);
    console.log('\n📦 Response:');
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json, null, 2));

      if (json.data && Array.isArray(json.data)) {
        console.log('\n📊 Total products:', json.data.length);
        if (json.data.length > 0) {
          console.log('\n🔝 Top 5 products:');
          json.data.slice(0, 5).forEach((product, index) => {
            console.log(`${index + 1}. ${product.idescription} - Sold: ${product.totalSold}, Amount: ${product.totalAmount}`);
          });
        }
      }
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
});

req.end();
