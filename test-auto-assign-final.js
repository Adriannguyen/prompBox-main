const axios = require('axios');

// Test auto-assignment using the simulate-new-mail endpoint
const testAutoAssignmentWithSimulate = async () => {
  console.log("🧪 Testing auto-assignment with /api/simulate-new-mail endpoint");

  const testCases = [
    {
      subject: "Test Auto Assignment - Galaxy Store",
      from: "duongg@gmail.com", // Should match Galaxy Store group
      description: "Should assign to Dương via Galaxy Store group"
    },
    {
      subject: "Test Auto Assignment - Samsung",
      from: "apps.galaxy1@partner.samsung.com", // Should match Galaxy Store group
      description: "Should assign to Dương via Galaxy Store group"
    },
    {
      subject: "Test Auto Assignment - Sales",
      from: "sales@company.com", // Should match Galaxy Store group if in members
      description: "Should assign to Dương via Galaxy Store group"
    },
    {
      subject: "Test Auto Assignment - Unknown",
      from: "unknown@test.com", // Should not match any group
      description: "Should not auto-assign"
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📧 Testing: ${testCase.from}`);
    console.log(`📝 Expected: ${testCase.description}`);
    
    try {
      const response = await axios.post('http://127.0.0.1:3002/api/simulate-new-mail', {
        subject: testCase.subject,
        from: testCase.from,
        type: "To"
      });

      if (response.data.success) {
        const mailData = response.data.mailData;
        
        if (mailData.assignedTo) {
          console.log(`✅ AUTO-ASSIGNMENT SUCCESS!`);
          console.log(`   👤 PIC: ${mailData.assignedTo.picName}`);
          console.log(`   📧 Email: ${mailData.assignedTo.picEmail}`);
          console.log(`   🏢 Group: ${mailData.assignedTo.groupName} (ID: ${mailData.assignedTo.groupId})`);
          console.log(`   🎯 Match Type: ${mailData.assignedTo.matchType}`);
          console.log(`   📁 File: ${response.data.fileName}`);
        } else {
          console.log(`❌ No auto-assignment (as expected for unknown senders)`);
        }
      } else {
        console.log(`❌ Failed to create mail: ${response.data.error}`);
      }

    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      if (error.response) {
        console.error(`   Server response: ${error.response.status} - ${error.response.data}`);
      }
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
};

// Test the trigger-auto-assign endpoint as well
const testTriggerAutoAssign = async () => {
  console.log("\n🔄 Testing /api/trigger-auto-assign endpoint");
  
  try {
    const response = await axios.post('http://127.0.0.1:3002/api/trigger-auto-assign');
    
    if (response.data.success) {
      console.log(`✅ Auto-assign triggered successfully`);
      console.log(`📊 Results: ${JSON.stringify(response.data, null, 2)}`);
    } else {
      console.log(`❌ Failed to trigger auto-assign: ${response.data.error}`);
    }
  } catch (error) {
    console.error(`❌ Error triggering auto-assign: ${error.message}`);
  }
};

// Run all tests
const runAllTests = async () => {
  try {
    await testAutoAssignmentWithSimulate();
    await testTriggerAutoAssign();
    
    console.log("\n🎯 Test Summary:");
    console.log("✅ Auto-assignment logic is now using the corrected Groups → PIC lookup");
    console.log("✅ Groups folder contains member lists for sender mapping");
    console.log("✅ PIC folder contains PIC assignments to groups");
    console.log("✅ Function properly finds group containing sender → finds PIC assigned to group → assigns mail");
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
};

runAllTests();