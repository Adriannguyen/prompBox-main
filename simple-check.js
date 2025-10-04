console.log("Simple test start");

const fs = require("fs");
const path = require("path");

// Check if mail file exists and has assignment
const checkLatestMail = () => {
  const mustRepPath = "C:\\classifyMail\\DungHan\\mustRep";
  console.log("Checking mail files...");

  if (!fs.existsSync(mustRepPath)) {
    console.log("Directory does not exist:", mustRepPath);
    return;
  }

  const files = fs
    .readdirSync(mustRepPath)
    .filter((f) => f.endsWith(".json"))
    .sort((a, b) => {
      const aTime = fs.statSync(path.join(mustRepPath, a)).mtime;
      const bTime = fs.statSync(path.join(mustRepPath, b)).mtime;
      return bTime - aTime;
    });

  console.log(`Found ${files.length} mail files`);

  if (files.length > 0) {
    const latestFile = files[0];
    console.log(`Latest file: ${latestFile}`);

    try {
      const mailData = JSON.parse(
        fs.readFileSync(path.join(mustRepPath, latestFile), "utf8")
      );
      console.log("Subject:", mailData.Subject);
      console.log("From:", mailData.From);
      console.log("Has assignedTo:", !!mailData.assignedTo);

      if (mailData.assignedTo) {
        console.log("Assigned to:", mailData.assignedTo.picName);
        console.log("Group:", mailData.assignedTo.groupName);
      }
    } catch (error) {
      console.log("Error reading file:", error.message);
    }
  }
};

checkLatestMail();
console.log("Simple test end");
