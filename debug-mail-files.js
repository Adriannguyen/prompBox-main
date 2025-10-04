const fs = require("fs");
const path = require("path");

// Debug script to check mail files
const debugMailFiles = () => {
  const MAIL_DATA_PATH = "C:\\classifyMail";

  console.log("🔍 Debugging mail files...");

  // Check DungHan/mustRep
  const dungHanPath = path.join(MAIL_DATA_PATH, "DungHan", "mustRep");
  console.log(`📁 Checking: ${dungHanPath}`);

  if (fs.existsSync(dungHanPath)) {
    const files = fs
      .readdirSync(dungHanPath)
      .filter((f) => f.endsWith(".json"));
    console.log(`📧 Found ${files.length} JSON files`);

    files.forEach((file) => {
      try {
        const filePath = path.join(dungHanPath, file);
        const mailData = JSON.parse(fs.readFileSync(filePath, "utf8"));

        console.log(`\n📄 File: ${file}`);
        console.log(`   Subject: ${mailData.Subject}`);
        console.log(`   From: ${mailData.From}`);
        console.log(`   Has assignedTo: ${!!mailData.assignedTo}`);

        if (mailData.assignedTo) {
          console.log(`   Assigned to: ${mailData.assignedTo.picName}`);
        } else {
          console.log(`   ❌ NOT ASSIGNED - Should be processed!`);
        }
      } catch (error) {
        console.log(`❌ Error reading ${file}:`, error.message);
      }
    });
  } else {
    console.log(`❌ Directory does not exist: ${dungHanPath}`);
  }

  // Check Groups
  const groupsPath = path.join(MAIL_DATA_PATH, "Groups");
  console.log(`\n📁 Checking groups: ${groupsPath}`);

  if (fs.existsSync(groupsPath)) {
    const groupFiles = fs
      .readdirSync(groupsPath)
      .filter((f) => f.endsWith(".json"));
    console.log(`🏢 Found ${groupFiles.length} group files`);

    groupFiles.forEach((file) => {
      try {
        const groupData = JSON.parse(
          fs.readFileSync(path.join(groupsPath, file), "utf8")
        );
        console.log(`\n🏢 Group: ${groupData.name}`);
        console.log(`   PIC: ${groupData.pic} (${groupData.picEmail})`);
        console.log(`   Members: ${groupData.members.join(", ")}`);
      } catch (error) {
        console.log(`❌ Error reading group ${file}:`, error.message);
      }
    });
  } else {
    console.log(`❌ Groups directory does not exist: ${groupsPath}`);
  }
};

debugMailFiles();
