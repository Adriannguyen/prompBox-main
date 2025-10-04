const fs = require("fs");
const path = require("path");

// Debug autoAssignLeaderBySenderGroup function
const debugAutoAssign = () => {
  console.log("🔧 Debugging autoAssignLeaderBySenderGroup function...");

  const ASSIGNMENT_DATA_PATH = "C:\\classifyMail";

  // Mock readJsonFile function
  const readJsonFile = (filePath) => {
    try {
      return JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (error) {
      console.log(`❌ Error reading ${filePath}:`, error.message);
      return null;
    }
  };

  // Mock writeJsonFile function
  const writeJsonFile = (filePath, data) => {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.log(`❌ Error writing ${filePath}:`, error.message);
      return false;
    }
  };

  // Copy the autoAssignLeaderBySenderGroup function
  const autoAssignLeaderBySenderGroup = (mailData, filePath = null) => {
    // Skip if already assigned
    if (mailData.assignedTo) {
      console.log(
        `📌 Mail already assigned to: ${mailData.assignedTo.picName}`
      );
      return mailData;
    }

    try {
      const groupsPath = path.join(ASSIGNMENT_DATA_PATH, "Groups");
      console.log(`🔍 Checking groups path: ${groupsPath}`);

      if (!fs.existsSync(groupsPath)) {
        console.log(`❌ Groups directory not found: ${groupsPath}`);
        return mailData;
      }

      const groupFiles = fs
        .readdirSync(groupsPath)
        .filter((f) => f.endsWith(".json"));

      console.log(
        `🔍 Checking ${groupFiles.length} groups for auto-assignment...`
      );

      const senderEmail = (mailData.From || mailData.EncryptedFrom || "")
        .toLowerCase()
        .trim();
      const senderDomain = senderEmail.includes("@")
        ? senderEmail.split("@")[1]
        : "";

      console.log(`📧 Sender: ${senderEmail}, Domain: ${senderDomain}`);

      // Priority 1: Exact email match
      for (const file of groupFiles) {
        const groupData = readJsonFile(path.join(groupsPath, file));
        if (!groupData || !groupData.members) {
          console.log(`⏭️ Skipping group ${file}: no data or members`);
          continue;
        }

        console.log(`🏢 Checking group: ${groupData.name}`);
        console.log(`   PIC: ${groupData.pic} (${groupData.picEmail})`);
        console.log(`   Members: ${groupData.members.join(", ")}`);

        const isExactMatch = groupData.members.some(
          (member) => member.toLowerCase().trim() === senderEmail
        );

        console.log(`   Exact match for ${senderEmail}: ${isExactMatch}`);

        if (isExactMatch && groupData.pic && groupData.picEmail) {
          console.log(
            `🎯 EXACT MATCH: Assigning mail from ${senderEmail} to group leader: ${groupData.pic}`
          );

          const updatedMailData = {
            ...mailData,
            assignedTo: {
              type: "pic",
              picId: path.parse(file).name,
              picName: groupData.pic,
              picEmail: groupData.picEmail,
              assignedAt: new Date().toISOString(),
              assignedBy: "system_auto",
              matchType: "exact_email",
              groupId: path.parse(file).name,
              groupName: groupData.name,
            },
          };

          return updatedMailData;
        }
      }

      console.log(`❌ No exact match found for sender: ${senderEmail}`);
      return mailData;
    } catch (error) {
      console.error("❌ Error in auto-assign leader:", error);
      return mailData;
    }
  };

  // Test with sample mail data
  const testMailData = {
    Subject: "Test Auto Assignment",
    From: "admin@company.com",
    Type: "To",
    Date: [new Date().toISOString().split("T")[0], "15:00"],
    SummaryContent: "Test mail for debugging",
    id: "debug-test-123",
    isRead: false,
  };

  console.log("\n📬 Testing with mail data:");
  console.log(`   Subject: ${testMailData.Subject}`);
  console.log(`   From: ${testMailData.From}`);

  const result = autoAssignLeaderBySenderGroup(testMailData);

  console.log("\n📋 Result:");
  if (result.assignedTo) {
    console.log(
      `✅ SUCCESS: Mail assigned to ${result.assignedTo.picName} (${result.assignedTo.picEmail})`
    );
    console.log(`   Match Type: ${result.assignedTo.matchType}`);
    console.log(`   Group: ${result.assignedTo.groupName}`);
  } else {
    console.log(`❌ FAILED: No assignment made`);
  }
};

// Run debug
debugAutoAssign();
