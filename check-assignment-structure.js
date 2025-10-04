const fs = require("fs");
const path = require("path");

// Check actual AssignmentData folder structure
const checkAssignmentDataStructure = () => {
  console.log("🔍 Checking AssignmentData folder structure...");

  const ASSIGNMENT_DATA_PATH = "C:\\classifyMail\\AssignmentData";

  console.log(`📁 Checking: ${ASSIGNMENT_DATA_PATH}`);

  if (!fs.existsSync(ASSIGNMENT_DATA_PATH)) {
    console.log("❌ AssignmentData folder does not exist");
    return;
  }

  // List all folders and files
  const items = fs.readdirSync(ASSIGNMENT_DATA_PATH, { withFileTypes: true });

  console.log("📋 Contents of AssignmentData:");
  items.forEach((item) => {
    if (item.isDirectory()) {
      console.log(`📁 ${item.name}/`);

      // List contents of subfolder
      const subPath = path.join(ASSIGNMENT_DATA_PATH, item.name);
      const subItems = fs.readdirSync(subPath);
      subItems.forEach((subItem) => {
        console.log(`   📄 ${subItem}`);
      });
    } else {
      console.log(`📄 ${item.name}`);
    }
  });

  // Check specific folders
  const groupsPath = path.join(ASSIGNMENT_DATA_PATH, "Groups");
  const picsPath = path.join(ASSIGNMENT_DATA_PATH, "PIC");

  console.log(`\n🏢 Groups folder exists: ${fs.existsSync(groupsPath)}`);
  console.log(`👤 PIC folder exists: ${fs.existsSync(picsPath)}`);

  if (fs.existsSync(groupsPath)) {
    const groupFiles = fs
      .readdirSync(groupsPath)
      .filter((f) => f.endsWith(".json"));
    console.log(`📊 Groups found: ${groupFiles.length}`);
    groupFiles.forEach((file) => {
      try {
        const groupData = JSON.parse(
          fs.readFileSync(path.join(groupsPath, file), "utf8")
        );
        console.log(
          `  - ${groupData.name} (PIC: ${groupData.pic || "No PIC"})`
        );
      } catch (error) {
        console.log(`  - ${file} (Error reading)`);
      }
    });
  }

  if (fs.existsSync(picsPath)) {
    const picFiles = fs
      .readdirSync(picsPath)
      .filter((f) => f.endsWith(".json"));
    console.log(`👥 PICs found: ${picFiles.length}`);
    picFiles.forEach((file) => {
      try {
        const picData = JSON.parse(
          fs.readFileSync(path.join(picsPath, file), "utf8")
        );
        console.log(`  - ${picData.name} (${picData.email || "No email"})`);
      } catch (error) {
        console.log(`  - ${file} (Error reading)`);
      }
    });
  }
};

checkAssignmentDataStructure();
