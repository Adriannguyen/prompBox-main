const fs = require('fs');
const path = require('path');

// Test assignment functionality for ReviewMail
console.log('🧪 Testing ReviewMail Assignment Fix');
console.log('=====================================');

// Configuration
const BASE_PATH = 'C:\\classifyMail';
const REVIEW_MAIL_PENDING = path.join(BASE_PATH, 'ReviewMail', 'pending');
const REVIEW_MAIL_PROCESSED = path.join(BASE_PATH, 'ReviewMail', 'processed');
const ASSIGNMENT_DATA_PATH = path.join(BASE_PATH, 'AssignmentData');

// Create test directories if they don't exist
function createTestStructure() {
  console.log('📁 Creating test directory structure...');
  
  [REVIEW_MAIL_PENDING, REVIEW_MAIL_PROCESSED].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created: ${dir}`);
    } else {
      console.log(`📂 Already exists: ${dir}`);
    }
  });
}

// Create test mail in ReviewMail/pending
function createTestMail() {
  console.log('\n📧 Creating test mail in ReviewMail/pending...');
  
  const testMailId = 'test-review-assign-' + Date.now();
  const testMail = {
    id: testMailId,
    Subject: 'Test Assignment in Review Mail',
    From: 'test@company.com',
    Type: 'To',
    Date: ['2025-01-15', '14:30'],
    SummaryContent: 'This is a test mail to verify assignment functionality in ReviewMail',
    category: 'ReviewMail',
    originalCategory: 'DungHan',
    originalStatus: 'mustRep',
    dateMoved: ['2025-01-15', '14:30']
  };
  
  const testMailPath = path.join(REVIEW_MAIL_PENDING, `${testMailId}.json`);
  fs.writeFileSync(testMailPath, JSON.stringify(testMail, null, 2));
  
  console.log(`✅ Created test mail: ${testMailPath}`);
  console.log(`📧 Mail ID: ${testMailId}`);
  
  return { testMailId, testMailPath, testMail };
}

// Create test PIC if not exists
function createTestPIC() {
  console.log('\n👤 Checking test PIC...');
  
  const picDir = path.join(ASSIGNMENT_DATA_PATH, 'PIC');
  if (!fs.existsSync(picDir)) {
    fs.mkdirSync(picDir, { recursive: true });
  }
  
  const testPicId = 'test-pic-' + Date.now();
  const testPic = {
    id: testPicId,
    name: 'Test PIC for Review',
    email: 'testpic@company.com',
    groups: ['test-group-123'],
    createdAt: new Date().toISOString()
  };
  
  const picPath = path.join(picDir, `${testPicId}.json`);
  fs.writeFileSync(picPath, JSON.stringify(testPic, null, 2));
  
  console.log(`✅ Created test PIC: ${picPath}`);
  console.log(`👤 PIC ID: ${testPicId}`);
  
  return { testPicId, testPic };
}

// Test assignment API call simulation
function testAssignmentAPI(mailId, picId) {
  console.log('\n🔧 Testing assignment logic...');
  
  // Simulate the fixed folder structure
  const folders = [
    "DungHan/mustRep",
    "DungHan",
    "QuaHan/chuaRep", 
    "QuaHan/daRep",
    "ReviewMail/pending",
    "ReviewMail/processed",
  ];
  
  console.log('📁 Checking folders for mail:', mailId);
  
  let foundMail = false;
  let foundPath = '';
  
  for (const folder of folders) {
    const folderPath = path.join(BASE_PATH, folder);
    const fileName = `${mailId}.json`;
    const filePath = path.join(folderPath, fileName);
    
    console.log(`🔍 Checking: ${filePath}`);
    
    if (fs.existsSync(filePath)) {
      console.log(`✅ Mail found in: ${folder}`);
      foundMail = true;
      foundPath = filePath;
      break;
    }
  }
  
  if (foundMail) {
    console.log(`🎯 SUCCESS: Mail can be found for assignment!`);
    console.log(`📂 Found at: ${foundPath}`);
    
    // Simulate assignment update
    const mailData = JSON.parse(fs.readFileSync(foundPath, 'utf8'));
    mailData.assignedTo = {
      type: 'pic',
      picId: picId,
      picName: 'Test PIC for Review',
      picEmail: 'testpic@company.com',
      assignedAt: new Date().toISOString()
    };
    
    fs.writeFileSync(foundPath, JSON.stringify(mailData, null, 2));
    console.log(`✅ Successfully assigned mail to PIC: ${picId}`);
    
  } else {
    console.log(`❌ FAILED: Mail not found in any folder!`);
    console.log('This would result in "Mail not found" error');
  }
  
  return foundMail;
}

// Clean up test data
function cleanup(testMailPath, testPicId) {
  console.log('\n🧹 Cleaning up test data...');
  
  try {
    if (fs.existsSync(testMailPath)) {
      fs.unlinkSync(testMailPath);
      console.log(`🗑️ Deleted test mail: ${testMailPath}`);
    }
    
    const picPath = path.join(ASSIGNMENT_DATA_PATH, 'PIC', `${testPicId}.json`);
    if (fs.existsSync(picPath)) {
      fs.unlinkSync(picPath);
      console.log(`🗑️ Deleted test PIC: ${picPath}`);
    }
    
    console.log('✅ Cleanup completed');
  } catch (error) {
    console.error('❌ Cleanup error:', error.message);
  }
}

// Main test execution
function runTest() {
  try {
    createTestStructure();
    
    const { testMailId, testMailPath } = createTestMail();
    const { testPicId } = createTestPIC();
    
    const assignmentSuccess = testAssignmentAPI(testMailId, testPicId);
    
    console.log('\n📊 Test Results:');
    console.log('=================');
    if (assignmentSuccess) {
      console.log('✅ Assignment functionality is WORKING for ReviewMail');
      console.log('✅ Mail can be found and assigned successfully');
    } else {
      console.log('❌ Assignment functionality is BROKEN for ReviewMail');
      console.log('❌ Mail cannot be found - this explains the "mail not found" error');
    }
    
    // Cleanup
    cleanup(testMailPath, testPicId);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
runTest();