const fs = require("fs");
const path = require("path");

// Test auto-assignment with AssignmentData structure
const testAssignmentDataStructure = () => {
  console.log("🧪 Testing auto-assignment with AssignmentData structure");

  const ASSIGNMENT_DATA_PATH = "C:\\classifyMail\\AssignmentData";
  const MAIL_DATA_PATH = "C:\\classifyMail";

  // Check structure
  console.log("📁 Checking AssignmentData structure:");
  const groupsPath = path.join(ASSIGNMENT_DATA_PATH, "Groups");
  const picsPath = path.join(ASSIGNMENT_DATA_PATH, "PIC");
  const assignmentsPath = path.join(ASSIGNMENT_DATA_PATH, "Assignments");

  console.log(`🏢 Groups: ${fs.existsSync(groupsPath) ? "✅" : "❌"}`);
  console.log(`👤 PICs: ${fs.existsSync(picsPath) ? "✅" : "❌"}`);
  console.log(
    `📋 Assignments: ${fs.existsSync(assignmentsPath) ? "✅" : "❌"}`
  );

  // List groups
  if (fs.existsSync(groupsPath)) {
    const groupFiles = fs
      .readdirSync(groupsPath)
      .filter((f) => f.endsWith(".json"));
    console.log(`\n📊 Found ${groupFiles.length} groups:`);
    groupFiles.forEach((file) => {
      try {
        const groupData = JSON.parse(
          fs.readFileSync(path.join(groupsPath, file), "utf8")
        );
        console.log(`  - ${groupData.name}`);
        console.log(`    PIC: ${groupData.pic} (${groupData.picEmail})`);
        console.log(`    Members: ${groupData.members.join(", ")}`);
      } catch (error) {
        console.log(`  - ${file} (Error: ${error.message})`);
      }
    });
  }

  // Test assignment logic
  console.log("\n🎯 Testing assignment logic:");
  const testEmails = [
    "admin@company.com", // Should match IT Support Group (exact)
    "sales@company.com", // Should match Company IT Dept (wildcard *.company.com)
    "external@other.com", // Should not match
  ];

  testEmails.forEach((email) => {
    console.log(`\n📧 Testing: ${email}`);
    let found = false;

    if (fs.existsSync(groupsPath)) {
      const groupFiles = fs
        .readdirSync(groupsPath)
        .filter((f) => f.endsWith(".json"));

      for (const file of groupFiles) {
        try {
          const groupData = JSON.parse(
            fs.readFileSync(path.join(groupsPath, file), "utf8")
          );

          if (groupData.members) {
            // Check exact match
            const exactMatch = groupData.members.some(
              (member) =>
                member.toLowerCase().trim() === email.toLowerCase().trim()
            );

            // Check wildcard match
            const wildcardMatch = groupData.members.some((member) => {
              if (member.startsWith("*.")) {
                const domain = member.substring(2).toLowerCase();
                return (
                  email.toLowerCase().includes("@") &&
                  email.toLowerCase().endsWith(domain)
                );
              }
              return false;
            });

            if (exactMatch) {
              console.log(
                `  ✅ EXACT MATCH → ${groupData.name} (${groupData.pic})`
              );
              found = true;
              break;
            } else if (wildcardMatch) {
              console.log(
                `  ✅ WILDCARD MATCH → ${groupData.name} (${groupData.pic})`
              );
              found = true;
              break;
            }
          }
        } catch (error) {
          console.log(`  ❌ Error reading ${file}: ${error.message}`);
        }
      }
    }

    if (!found) {
      console.log(`  ❌ NO MATCH`);
    }
  });

  console.log("\n🎉 Test completed! Structure is ready for auto-assignment.");
};

testAssignmentDataStructure();
