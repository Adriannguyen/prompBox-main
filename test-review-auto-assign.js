const fs = require('fs');
const path = require('path');

// Test auto-assignment functionality for ReviewMail
console.log('🧪 Testing ReviewMail Auto-Assignment');
console.log('======================================');

// Configuration
const BASE_PATH = 'C:\\classifyMail';
const REVIEW_MAIL_PENDING = path.join(BASE_PATH, 'ReviewMail', 'pending');
const ASSIGNMENT_DATA_PATH = path.join(BASE_PATH, 'AssignmentData');

// Create test structures if they don't exist
function createTestStructure() {
  console.log('📁 Creating test directory structure...');
  
  [REVIEW_MAIL_PENDING].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created: ${dir}`);
    } else {
      console.log(`📂 Already exists: ${dir}`);
    }
  });
}

// Create test group with domain/email members
function createTestGroup() {
  console.log('\n👥 Creating test group...');
  
  const groupDir = path.join(ASSIGNMENT_DATA_PATH, 'Groups');
  if (!fs.existsSync(groupDir)) {
    fs.mkdirSync(groupDir, { recursive: true });
  }
  
  const testGroupId = 'test-group-' + Date.now();
  const testGroup = {
    id: testGroupId,
    name: 'Test IT Department',
    description: 'Test group for auto-assignment',
    members: [
      'test@company.com',
      '*.company.com',
      'admin@testdomain.com'
    ],
    createdAt: new Date().toISOString()
  };
  
  const groupPath = path.join(groupDir, `${testGroupId}.json`);
  fs.writeFileSync(groupPath, JSON.stringify(testGroup, null, 2));
  
  console.log(`✅ Created test group: ${testGroupId}`);
  console.log(`📧 Members: ${testGroup.members.join(', ')}`);
  
  return { testGroupId, testGroup };
}

// Create test PIC for the group
function createTestPIC(groupId) {
  console.log('\n👤 Creating test PIC...');
  
  const picDir = path.join(ASSIGNMENT_DATA_PATH, 'PIC');
  if (!fs.existsSync(picDir)) {
    fs.mkdirSync(picDir, { recursive: true });
  }
  
  const testPicId = 'test-pic-' + Date.now();
  const testPic = {
    id: testPicId,
    name: 'Test PIC Manager',
    email: 'testpic@company.com',
    groups: [groupId],
    createdAt: new Date().toISOString()
  };
  
  const picPath = path.join(picDir, `${testPicId}.json`);
  fs.writeFileSync(picPath, JSON.stringify(testPic, null, 2));
  
  console.log(`✅ Created test PIC: ${testPicId}`);
  console.log(`👤 Name: ${testPic.name}`);
  console.log(`📧 Email: ${testPic.email}`);
  
  return { testPicId, testPic };
}

// Create test mail in ReviewMail/pending
function createTestMails() {
  console.log('\n📧 Creating test mails in ReviewMail/pending...');
  
  const testMails = [
    {
      id: 'test-mail-exact-match-' + Date.now(),
      Subject: 'Test Auto-Assign - Exact Email Match',
      From: 'test@company.com', // Exact match with group member
      Type: 'To',
      Date: ['2025-01-15', '14:30'],
      SummaryContent: 'This mail should auto-assign - exact email match',
      category: 'ReviewMail',
      originalCategory: 'DungHan',
      originalStatus: 'mustRep'
    },
    {
      id: 'test-mail-domain-match-' + Date.now(),
      Subject: 'Test Auto-Assign - Domain Wildcard Match',
      From: 'someone@company.com', // Should match *.company.com
      Type: 'To', 
      Date: ['2025-01-15', '14:35'],
      SummaryContent: 'This mail should auto-assign - domain wildcard match',
      category: 'ReviewMail',
      originalCategory: 'DungHan',
      originalStatus: 'mustRep'
    },
    {
      id: 'test-mail-no-match-' + Date.now(),
      Subject: 'Test Auto-Assign - No Match',
      From: 'someone@otherdomain.com', // Should NOT match
      Type: 'To',
      Date: ['2025-01-15', '14:40'],
      SummaryContent: 'This mail should NOT auto-assign - no match',
      category: 'ReviewMail',
      originalCategory: 'DungHan', 
      originalStatus: 'mustRep'
    }
  ];
  
  const createdMails = [];
  
  testMails.forEach(mail => {
    const mailPath = path.join(REVIEW_MAIL_PENDING, `${mail.id}.json`);
    fs.writeFileSync(mailPath, JSON.stringify(mail, null, 2));
    console.log(`✅ Created test mail: ${mail.id}`);
    console.log(`   📧 From: ${mail.From}`);
    console.log(`   📋 Subject: ${mail.Subject}`);
    
    createdMails.push({ ...mail, filePath: mailPath });
  });
  
  return createdMails;
}

// Test auto-assignment API call
async function testAutoAssignAPI() {
  console.log('\n🔧 Testing auto-assignment API...');
  
  try {
    // Use fetch to call the API
    const response = await fetch('http://localhost:3002/api/trigger-auto-assign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('📊 Auto-assignment API results:');
      console.log(`   ✅ Success: ${result.success}`);
      console.log(`   📧 Assigned: ${result.assignedCount}`);
      console.log(`   📊 Total checked: ${result.totalChecked}`);
      
      if (result.results && result.results.length > 0) {
        console.log('\n📋 Individual results:');
        result.results.forEach(r => {
          if (r.success) {
            console.log(`   ✅ ${r.file}: Assigned to ${r.assignment?.picName} (${r.assignment?.groupName})`);
          } else {
            console.log(`   ❌ ${r.file}: ${r.error}`);
          }
        });
      }
      
      return result;
    } else {
      console.log(`❌ API call failed: ${response.status} ${response.statusText}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ API call error: ${error.message}`);
    return null;
  }
}

// Check results by reading files
function checkResults(testMails) {
  console.log('\n🔍 Checking assignment results...');
  
  testMails.forEach(mail => {
    try {
      if (fs.existsSync(mail.filePath)) {
        const updatedMail = JSON.parse(fs.readFileSync(mail.filePath, 'utf8'));
        
        console.log(`\n📧 ${mail.Subject}:`);
        console.log(`   📧 From: ${mail.From}`);
        
        if (updatedMail.assignedTo) {
          console.log(`   ✅ ASSIGNED to: ${updatedMail.assignedTo.picName}`);
          console.log(`   👥 Group: ${updatedMail.assignedTo.groupName}`);
          console.log(`   🤖 Auto-assigned: ${updatedMail.assignedTo.auto_assigned}`);
          console.log(`   💡 Reason: ${updatedMail.assignedTo.assignment_reason}`);
        } else {
          console.log(`   ❌ NOT ASSIGNED`);
        }
      } else {
        console.log(`   ⚠️ File not found: ${mail.filePath}`);
      }
    } catch (error) {
      console.log(`   ❌ Error reading file: ${error.message}`);
    }
  });
}

// Clean up test data
function cleanup(groupId, picId, testMails) {
  console.log('\n🧹 Cleaning up test data...');
  
  try {
    // Delete test mails
    testMails.forEach(mail => {
      if (fs.existsSync(mail.filePath)) {
        fs.unlinkSync(mail.filePath);
        console.log(`🗑️ Deleted test mail: ${mail.id}`);
      }
    });
    
    // Delete test group
    const groupPath = path.join(ASSIGNMENT_DATA_PATH, 'Groups', `${groupId}.json`);
    if (fs.existsSync(groupPath)) {
      fs.unlinkSync(groupPath);
      console.log(`🗑️ Deleted test group: ${groupId}`);
    }
    
    // Delete test PIC
    const picPath = path.join(ASSIGNMENT_DATA_PATH, 'PIC', `${picId}.json`);
    if (fs.existsSync(picPath)) {
      fs.unlinkSync(picPath);
      console.log(`🗑️ Deleted test PIC: ${picId}`);
    }
    
    console.log('✅ Cleanup completed');
  } catch (error) {
    console.error('❌ Cleanup error:', error.message);
  }
}

// Main test execution
async function runTest() {
  try {
    createTestStructure();
    
    const { testGroupId } = createTestGroup();
    const { testPicId } = createTestPIC(testGroupId);
    const testMails = createTestMails();
    
    console.log('\n⏳ Waiting 2 seconds for file operations...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const apiResult = await testAutoAssignAPI();
    
    console.log('\n⏳ Waiting 2 seconds for auto-assignment...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    checkResults(testMails);
    
    console.log('\n📊 Test Summary:');
    console.log('================');
    if (apiResult && apiResult.success) {
      console.log('✅ Auto-assignment API is working');
      console.log(`📧 Mails processed: ${apiResult.totalChecked}`);
      console.log(`🎯 Mails assigned: ${apiResult.assignedCount}`);
      
      if (apiResult.assignedCount > 0) {
        console.log('✅ ReviewMail auto-assignment is WORKING!');
      } else {
        console.log('⚠️ No mails were auto-assigned (check group/PIC setup)');
      }
    } else {
      console.log('❌ Auto-assignment API failed or server not running');
    }
    
    // Cleanup
    cleanup(testGroupId, testPicId, testMails);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Check if global fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
  console.log('⚠️ This test requires Node.js 18+ or you need to install node-fetch');
  console.log('Installing node-fetch...');
  
  try {
    const { default: fetch } = require('node-fetch');
    global.fetch = fetch;
  } catch (error) {
    console.log('❌ node-fetch not available. Please run: npm install node-fetch');
    process.exit(1);
  }
}

// Run the test
runTest();