const fs = require("fs");
const path = require("path");

// Test the corrected auto-assignment logic
const testCorrectedAutoAssign = () => {
  console.log("🧪 Testing corrected auto-assignment logic");
  console.log("Groups → PIC lookup sequence");

  const ASSIGNMENT_DATA_PATH = "C:\\classifyMail\\AssignmentData";
  
  // Helper function to read JSON files
  const readJsonFile = (filePath) => {
    try {
      return JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (error) {
      console.error(`Error reading ${filePath}:`, error.message);
      return null;
    }
  };

  // Mock auto-assignment logic (simplified version of the corrected function)
  const testAutoAssign = (senderEmail) => {
    console.log(`\n🔍 Testing auto-assignment for: ${senderEmail}`);
    
    const groupsPath = path.join(ASSIGNMENT_DATA_PATH, "Groups");
    const picsPath = path.join(ASSIGNMENT_DATA_PATH, "PIC");

    if (!fs.existsSync(groupsPath) || !fs.existsSync(picsPath)) {
      console.log("❌ Missing Groups or PIC folders");
      return null;
    }

    const groupFiles = fs.readdirSync(groupsPath).filter(f => f.endsWith(".json"));
    const senderLower = senderEmail.toLowerCase().trim();

    // Step 1: Find group containing sender
    let matchedGroup = null;
    for (const file of groupFiles) {
      const groupData = readJsonFile(path.join(groupsPath, file));
      if (!groupData || !groupData.members) continue;

      const isMatch = groupData.members.some(
        member => member.toLowerCase().trim() === senderLower
      );

      if (isMatch) {
        matchedGroup = { data: groupData, file: file };
        console.log(`✅ Step 1: Found sender in group: ${groupData.name} (ID: ${groupData.id})`);
        break;
      }
    }

    if (!matchedGroup) {
      console.log("❌ Step 1: No group found for sender");
      return null;
    }

    // Step 2: Find PIC assigned to this group
    const groupId = matchedGroup.data.id;
    const picFiles = fs.readdirSync(picsPath).filter(f => f.endsWith(".json"));

    let assignedPic = null;
    for (const picFile of picFiles) {
      const picData = readJsonFile(path.join(picsPath, picFile));
      if (!picData) continue;

      if (picData.groups && picData.groups.includes(groupId)) {
        assignedPic = { data: picData, file: picFile };
        console.log(`✅ Step 2: Found PIC assigned to group: ${picData.name} (${picData.email})`);
        break;
      }
    }

    if (!assignedPic) {
      console.log("❌ Step 2: No PIC assigned to group");
      return null;
    }

    // Step 3: Would assign mail to PIC
    console.log(`🎯 Step 3: Would assign mail to PIC: ${assignedPic.data.name}`);
    return {
      group: matchedGroup.data,
      pic: assignedPic.data,
      assignment: {
        picId: assignedPic.data.id,
        picName: assignedPic.data.name,
        picEmail: assignedPic.data.email,
        groupId: matchedGroup.data.id,
        groupName: matchedGroup.data.name
      }
    };
  };

  // Test cases
  const testCases = [
    "duongg@gmail.com", // Should match Galaxy Store group and find Dương as PIC
    "sales@company.com", // Should match Galaxy Store group and find Dương as PIC  
    "apps.galaxy1@partner.samsung.com", // Should match Galaxy Store group
    "nonexistent@test.com" // Should not match any group
  ];

  console.log("📋 Test Cases:");
  testCases.forEach(email => {
    const result = testAutoAssign(email);
    if (result) {
      console.log(`✅ SUCCESS: ${email} → ${result.pic.name} via ${result.group.name}`);
    } else {
      console.log(`❌ FAILED: ${email} → No assignment`);
    }
  });

  // Show current structure for reference
  console.log("\n📁 Current Structure Reference:");
  
  const groupsPath = path.join(ASSIGNMENT_DATA_PATH, "Groups");
  const picsPath = path.join(ASSIGNMENT_DATA_PATH, "PIC");
  
  if (fs.existsSync(groupsPath)) {
    const groupFiles = fs.readdirSync(groupsPath).filter(f => f.endsWith(".json"));
    console.log(`\n🏢 Groups (${groupFiles.length}):`);
    groupFiles.forEach(file => {
      const groupData = readJsonFile(path.join(groupsPath, file));
      if (groupData) {
        console.log(`  - ${groupData.name} (ID: ${groupData.id})`);
        console.log(`    Members: ${(groupData.members || []).slice(0, 3).join(", ")}${groupData.members?.length > 3 ? "..." : ""}`);
      }
    });
  }

  if (fs.existsSync(picsPath)) {
    const picFiles = fs.readdirSync(picsPath).filter(f => f.endsWith(".json"));
    console.log(`\n👤 PICs (${picFiles.length}):`);
    picFiles.forEach(file => {
      const picData = readJsonFile(path.join(picsPath, file));
      if (picData) {
        console.log(`  - ${picData.name} (${picData.email})`);
        console.log(`    Assigned to groups: ${(picData.groups || []).join(", ")}`);
      }
    });
  }
};

testCorrectedAutoAssign();