// Test trực tiếp trigger-auto-assign với mail a@gmail.com
const fs = require('fs');
const path = require('path');

// Tạo test mail trong ReviewMail/pending với sender a@gmail.com
const testMail = {
    "id": "test-trigger-assign-" + Date.now(),
    "Subject": "Test Trigger Assign",
    "From": "a@gmail.com",
    "To": "recipient@example.com",
    "Date": new Date().toISOString(),
    "Body": "Test trigger auto-assign",
    "Type": "TO",
    "Status": "NON-REPLY"
};

const reviewMailPath = "C:\\classifyMail\\ReviewMail\\pending";
const testMailFile = path.join(reviewMailPath, `${testMail.id}.json`);

// Ghi mail file
fs.writeFileSync(testMailFile, JSON.stringify(testMail, null, 2));
console.log(`✅ Created test mail: ${testMailFile}`);
console.log(`📧 Sender: ${testMail.From} (should match Marketing Team)`);

// Call trigger-auto-assign API
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
            console.log('\n📊 Trigger auto-assign results:');
            console.log(`   Total checked: ${result.totalChecked}`);
            console.log(`   Total assigned: ${result.assignedCount}`);
            
            // Tìm result cho mail test của chúng ta
            const ourMailResult = result.results.find(r => r.file === `${testMail.id}.json`);
            
            if (ourMailResult) {
                console.log(`\n🎯 Our test mail result:`);
                console.log(`   File: ${ourMailResult.file}`);
                console.log(`   Folder: ${ourMailResult.folder}`);
                console.log(`   Success: ${ourMailResult.success}`);
                
                if (ourMailResult.success) {
                    console.log(`   ✅ ASSIGNED TO:`);
                    console.log(`      PIC: ${ourMailResult.assignment.picName}`);
                    console.log(`      Group: ${ourMailResult.assignment.groupName}`);
                    console.log(`      Group ID: ${ourMailResult.assignment.groupId}`);
                    console.log(`      Reason: ${ourMailResult.assignment.assignment_reason}`);
                    
                    // Verify file updated
                    const updatedMail = JSON.parse(fs.readFileSync(testMailFile, 'utf8'));
                    if (updatedMail.assignedTo) {
                        console.log(`\n   📄 File confirmation: ASSIGNED`);
                        console.log(`      To: ${updatedMail.assignedTo.picName}`);
                        console.log(`      Group: ${updatedMail.assignedTo.groupName}`);
                    } else {
                        console.log(`\n   ❌ File confirmation: NOT ASSIGNED (inconsistent!)`);
                    }
                } else {
                    console.log(`   ❌ ASSIGNMENT FAILED:`);
                    console.log(`      Error: ${ourMailResult.error}`);
                }
            } else {
                console.log(`\n❌ Could not find our test mail in results`);
                console.log(`Expected file: ${testMail.id}.json`);
            }
            
            // Cleanup
            fs.unlinkSync(testMailFile);
            console.log('\n🧹 Cleaned up test mail');
            
        } catch (error) {
            console.error('❌ Error parsing response:', error);
            console.log('Raw response:', data);
            
            // Cleanup on error
            if (fs.existsSync(testMailFile)) {
                fs.unlinkSync(testMailFile);
                console.log('🧹 Cleaned up test mail');
            }
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Error calling trigger-auto-assign API:', error);
    
    // Cleanup on error
    if (fs.existsSync(testMailFile)) {
        fs.unlinkSync(testMailFile);
        console.log('🧹 Cleaned up test mail');
    }
});

req.write(postData);
req.end();