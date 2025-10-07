// Test với sender KHÔNG MATCH để đảm bảo KHÔNG bị auto-assign
const fs = require('fs');
const path = require('path');

// Test mail với sender HOÀN TOÀN không match
const testMail = {
    "id": "test-absolute-no-match-" + Date.now(),
    "Subject": "Test Absolute No Match",
    "From": "totally.random.email@unknowndomain.xyz",  // Hoàn toàn không match
    "To": "recipient@example.com",
    "Date": new Date().toISOString(),
    "Body": "Test mail TUYỆT ĐỐI không nên được auto-assign",
    "Type": "TO",
    "Status": "NON-REPLY"
};

console.log(`🧪 Testing with sender: ${testMail.From}`);
console.log(`📋 This sender should NOT match any group members`);

// Tạo mail trong ReviewMail/pending
const reviewMailPath = "C:\\classifyMail\\ReviewMail\\pending";
const testMailFile = path.join(reviewMailPath, `${testMail.id}.json`);

// Ghi mail file
fs.writeFileSync(testMailFile, JSON.stringify(testMail, null, 2));
console.log(`✅ Created test mail: ${testMailFile}`);

// Gọi API move-to-review để trigger auto-assign
const http = require('http');

const postData = JSON.stringify({
    mailId: testMail.id,
    mailData: testMail
});

const options = {
    hostname: '127.0.0.1',
    port: 3002,
    path: '/api/move-to-review',
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
            console.log('\n📊 Move-to-review API result:');
            console.log('Status:', result.success ? '✅ Success' : '❌ Failed');
            
            if (result.error) {
                console.log('Error:', result.error);
            }
            
            // Kiểm tra mail đã moved
            const pendingPath = path.join("C:\\classifyMail\\ReviewMail\\pending", `${testMail.id}.json`);
            const processedPath = path.join("C:\\classifyMail\\ReviewMail\\processed", `${testMail.id}.json`);
            
            let finalMailPath = null;
            if (fs.existsSync(pendingPath)) {
                finalMailPath = pendingPath;
                console.log('📁 Mail moved to: ReviewMail/pending');
            } else if (fs.existsSync(processedPath)) {
                finalMailPath = processedPath;
                console.log('📁 Mail moved to: ReviewMail/processed');
            }
            
            if (finalMailPath) {
                const finalMail = JSON.parse(fs.readFileSync(finalMailPath, 'utf8'));
                
                if (finalMail.assignedTo) {
                    console.log('\n❌ ERROR: Mail was auto-assigned when it should NOT be!');
                    console.log('🔍 Assignment details:');
                    console.log('  - PIC:', finalMail.assignedTo.picName);
                    console.log('  - Group:', finalMail.assignedTo.groupName || 'null');
                    console.log('  - GroupId:', finalMail.assignedTo.groupId || 'null'); 
                    console.log('  - Assigned at:', finalMail.assignedTo.assignedAt);
                    console.log('  - Reason:', finalMail.assignedTo.assignment_reason || 'not provided');
                    
                    console.log('\n🚨 THIS IS THE BUG - sender không match nhưng vẫn bị assign!');
                } else {
                    console.log('\n✅ SUCCESS: Mail was NOT auto-assigned (correct behavior)');
                    console.log('📧 Sender:', testMail.From);
                    console.log('🎯 No assignment = correct logic');
                }
                
                // Cleanup
                fs.unlinkSync(finalMailPath);
                console.log('🧹 Cleaned up test mail');
            } else {
                console.log('\n❌ ERROR: Could not find moved mail file');
                
                // Cleanup original if still exists
                if (fs.existsSync(testMailFile)) {
                    fs.unlinkSync(testMailFile);
                    console.log('🧹 Cleaned up original test mail');
                }
            }
            
        } catch (error) {
            console.error('❌ Error parsing response:', error);
            console.log('Raw response:', data);
            
            // Cleanup on error
            [testMailFile, pendingPath, processedPath].forEach(filePath => {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log('🧹 Cleaned up:', filePath);
                }
            });
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Error calling move-to-review API:', error);
    
    // Cleanup on error
    if (fs.existsSync(testMailFile)) {
        fs.unlinkSync(testMailFile);
        console.log('🧹 Cleaned up test mail');
    }
});

req.write(postData);
req.end();