const fs = require("fs");
const path = require("path");

// Test auto-assignment with correct folder structure
const testCorrectStructure = () => {
  console.log("🧪 Testing auto-assignment with correct folder structure");

  const ASSIGNMENT_DATA_PATH = "C:\\classifyMail\\assignment";
  const MAIL_DATA_PATH = "C:\\classifyMail";

  console.log(`📁 Assignment data path: ${ASSIGNMENT_DATA_PATH}`);
  console.log(`📧 Mail data path: ${MAIL_DATA_PATH}`);

  // Check if folders exist
  const groupsPath = path.join(ASSIGNMENT_DATA_PATH, "Groups");
  const picsPath = path.join(ASSIGNMENT_DATA_PATH, "PIC");

  console.log(`🏢 Groups folder exists: ${fs.existsSync(groupsPath)}`);
  console.log(`👤 PICs folder exists: ${fs.existsSync(picsPath)}`);

  if (fs.existsSync(groupsPath)) {
    const groupFiles = fs
      .readdirSync(groupsPath)
      .filter((f) => f.endsWith(".json"));
    console.log(`📊 Found ${groupFiles.length} group files:`);

    groupFiles.forEach((file) => {
      const groupData = JSON.parse(
        fs.readFileSync(path.join(groupsPath, file), "utf8")
      );
      console.log(`  - ${groupData.name} (PIC: ${groupData.pic})`);
      console.log(`    Members: ${groupData.members.join(", ")}`);
    });
  }

  // Test mail creation with correct paths
  const testMail = {
    Subject: "Test Correct Structure Auto Assignment",
    From: "admin@company.com",
    Type: "To",
    Date: [new Date().toISOString().split("T")[0], "16:00"],
    SummaryContent: "Test with correct folder structure",
    id: "correct-structure-test",
    isRead: false,
  };

  console.log(`\n📬 Testing assignment for: ${testMail.From}`);

  // Simulate autoAssignLeaderBySenderGroup with correct paths
  const groupFiles = fs
    .readdirSync(groupsPath)
    .filter((f) => f.endsWith(".json"));

  for (const file of groupFiles) {
    const groupData = JSON.parse(
      fs.readFileSync(path.join(groupsPath, file), "utf8")
    );

    if (groupData.members) {
      const senderEmail = testMail.From.toLowerCase().trim();
      const isMatch = groupData.members.some(
        (member) =>
          member.toLowerCase().trim() === senderEmail ||
          (member.startsWith("*.") && senderEmail.endsWith(member.substring(2)))
      );

      if (isMatch) {
        console.log(`✅ MATCH FOUND!`);
        console.log(`   Group: ${groupData.name}`);
        console.log(`   PIC: ${groupData.pic} (${groupData.picEmail})`);
        console.log(
          `   Match type: ${member.startsWith("*.") ? "wildcard" : "exact"}`
        );

        // Add assignment to mail
        testMail.assignedTo = {
          type: "pic",
          picId: path.parse(file).name,
          picName: groupData.pic,
          picEmail: groupData.picEmail,
          assignedAt: new Date().toISOString(),
          assignedBy: "test_correct_structure",
          matchType: member.startsWith("*.") ? "wildcard_match" : "exact_email",
          groupId: path.parse(file).name,
          groupName: groupData.name,
        };

        break;
      }
    }
  }

  console.log(`\n📋 Final result:`);
  console.log(`   Has assignment: ${!!testMail.assignedTo}`);
  if (testMail.assignedTo) {
    console.log(`   Assigned to: ${testMail.assignedTo.picName}`);
    console.log(`   Group: ${testMail.assignedTo.groupName}`);
  }
};

testCorrectStructure();
