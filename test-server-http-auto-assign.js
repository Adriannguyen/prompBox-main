const fs = require("fs");
const path = require("path");

// Test auto-assignment by making HTTP request to server
const testServerAutoAssignment = async () => {
  console.log("🧪 Testing server auto-assignment via HTTP request");

  // Check if server is running
  const axios = require('axios');
  
  try {
    const response = await axios.get('http://127.0.0.1:3002/health');
    console.log('✅ Server is running');
  } catch (error) {
    console.log('❌ Server is not running. Please start the server first.');
    return;
  }

  // Create test mail data that should trigger auto-assignment
  const testMail = {
    From: "duongg@gmail.com", // Should match Galaxy Store group
    Subject: "Test Auto Assignment",
    Body: "This is a test mail for auto-assignment",
    Date: new Date().toISOString(),
    isEncrypted: false
  };

  console.log(`📧 Testing auto-assignment for: ${testMail.From}`);

  try {
    // Send test mail to server
    const response = await axios.post('http://127.0.0.1:3002/api/mails', testMail);
    
    if (response.data && response.data.assignedTo) {
      console.log(`✅ AUTO-ASSIGNMENT SUCCESS!`);
      console.log(`   🎯 Assigned to: ${response.data.assignedTo.picName}`);
      console.log(`   📧 PIC Email: ${response.data.assignedTo.picEmail}`);
      console.log(`   🏢 Group: ${response.data.assignedTo.groupName}`);
      console.log(`   🔄 Match Type: ${response.data.assignedTo.matchType}`);
    } else {
      console.log(`❌ AUTO-ASSIGNMENT FAILED - No assignment data in response`);
      console.log(`Response:`, response.data);
    }

  } catch (error) {
    console.error('❌ Error testing auto-assignment:', error.message);
    if (error.response) {
      console.error('Server response:', error.response.data);
    }
  }
};

// Also test with another email that should work
const testMultipleEmails = async () => {
  console.log("\n🔄 Testing multiple email auto-assignments...");
  
  const testEmails = [
    "duongg@gmail.com", // Should match Galaxy Store
    "sales@company.com", // Should match Galaxy Store (if in members)
    "apps.galaxy1@partner.samsung.com", // Should match Galaxy Store
  ];

  const axios = require('axios');

  for (const email of testEmails) {
    console.log(`\n📧 Testing: ${email}`);
    
    const testMail = {
      From: email,
      Subject: `Test Auto Assignment for ${email}`,
      Body: "This is a test mail for auto-assignment",
      Date: new Date().toISOString(),
      isEncrypted: false
    };

    try {
      const response = await axios.post('http://127.0.0.1:3002/api/mails', testMail);
      
      if (response.data && response.data.assignedTo) {
        console.log(`   ✅ Assigned to: ${response.data.assignedTo.picName} via ${response.data.assignedTo.groupName}`);
      } else {
        console.log(`   ❌ No assignment`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
};

// Run tests
const runTests = async () => {
  try {
    await testServerAutoAssignment();
    await testMultipleEmails();
  } catch (error) {
    console.error('Test failed:', error.message);
  }
};

runTests();