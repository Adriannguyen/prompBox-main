// Test auto-assign với sender không match
const fs = require('fs');
const path = require('path');

// Test data
const testMail = {
    "id": "test-no-match-" + Date.now(),
    "Subject": "Test No Auto-Assign",
    "From": "duongtest@gmail.com",  // Không match với bất kỳ member nào
    "To": "recipient@example.com",
    "Date": new Date().toISOString(),
    "Body": "Test mail không nên được auto-assign",
    "Type": "TO",
    "Status": "NON-REPLY"
};

// Tạo mail trong ReviewMail/pending
const reviewMailPath = "C:\\classifyMail\\ReviewMail\\pending";
const testMailFile = path.join(reviewMailPath, `${testMail.id}.json`);

// Ghi mail file
fs.writeFileSync(testMailFile, JSON.stringify(testMail, null, 2));
console.log(`✅ Created test mail: ${testMailFile}`);

// Call auto-assign API
const https = require('https');
const http = require('http');

const postData = JSON.stringify({});

const options = {
    hostname: '127.0.0.1',
    port: 3002,
    path: '/api/trigger-auto-assign',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        try {
            const result = JSON.parse(data);
            console.log('\n📊 Auto-assign results:');
            console.log(JSON.stringify(result, null, 2));
            
            // Check if our test mail was assigned
            const updatedMail = JSON.parse(fs.readFileSync(testMailFile, 'utf8'));
            
            if (updatedMail.assignedTo) {
                console.log('\n❌ ERROR: Mail was auto-assigned when it should NOT be!');
                console.log('Assigned to:', updatedMail.assignedTo);
            } else {
                console.log('\n✅ SUCCESS: Mail was NOT auto-assigned (correct behavior)');
            }
            
            // Cleanup
            fs.unlinkSync(testMailFile);
            console.log('🧹 Cleaned up test mail');
            
        } catch (error) {
            console.error('❌ Error parsing response:', error);
            
            // Cleanup on error
            if (fs.existsSync(testMailFile)) {
                fs.unlinkSync(testMailFile);
                console.log('🧹 Cleaned up test mail');
            }
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Error calling auto-assign API:', error);
    
    // Cleanup on error
    if (fs.existsSync(testMailFile)) {
        fs.unlinkSync(testMailFile);
        console.log('🧹 Cleaned up test mail');
    }
});

req.write(postData);
req.end();