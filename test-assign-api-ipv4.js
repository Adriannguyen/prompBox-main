const http = require('http');

// Test API assign-mail
const testAssignAPI = () => {
  console.log('🧪 Testing /api/assign-mail endpoint...');
  
  const postData = JSON.stringify({
    mailId: 'test-mail-id',
    picId: 'test-pic-id',
    assignmentType: 'pic'
  });

  const options = {
    hostname: '127.0.0.1',  // Use IPv4 instead of localhost
    port: 3002,
    path: '/api/assign-mail',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`📊 Status Code: ${res.statusCode}`);
    console.log(`📝 Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('📄 Response Body:', data);
      
      if (res.statusCode === 404) {
        console.log('❌ API endpoint NOT found - this explains the 404 error!');
        console.log('🔍 The /api/assign-mail endpoint does not exist in server.js');
      } else if (res.statusCode === 400) {
        console.log('✅ API endpoint found - Bad request (expected for test data)');
      } else if (res.statusCode === 500) {
        console.log('✅ API endpoint found - Internal server error (expected for test data)');
      } else {
        console.log(`📊 API endpoint found with status: ${res.statusCode}`);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Error:', error.message);
  });

  req.write(postData);
  req.end();
};

// Test if server is responding
const testServerHealth = () => {
  console.log('🔍 Testing server health...');
  
  const options = {
    hostname: '127.0.0.1',
    port: 3002,
    path: '/api/mail-stats',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`📊 Health check status: ${res.statusCode}`);
    
    if (res.statusCode === 200) {
      console.log('✅ Server is responding');
      console.log('🔄 Now testing assign-mail API...\n');
      testAssignAPI();
    } else {
      console.log('❌ Server health check failed');
    }
  });

  req.on('error', (error) => {
    console.error('❌ Server connection error:', error.message);
  });

  req.end();
};

// Run tests
console.log('🚀 Starting API endpoint tests...');
console.log('===================================');
testServerHealth();