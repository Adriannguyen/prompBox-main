const fs = require("fs");
const path = require("path");

// Fix auto-assignment for existing unassigned mails
const fixAutoAssignment = () => {
  console.log("=== FIXING AUTO-ASSIGNMENT ===");

  const ASSIGNMENT_DATA_PATH = "C:\\classifyMail";
  const mailFile = "C:\\classifyMail\\DungHan\\mustRep\\manual-test-123.json";

  // Read the mail file
  const mailData = JSON.parse(fs.readFileSync(mailFile, "utf8"));
  console.log("Original mail:", {
    Subject: mailData.Subject,
    From: mailData.From,
    hasAssignment: !!mailData.assignedTo,
  });

  // Read groups
  const groupsPath = path.join(ASSIGNMENT_DATA_PATH, "Groups");
  const groupFiles = fs
    .readdirSync(groupsPath)
    .filter((f) => f.endsWith(".json"));

  console.log(`Found ${groupFiles.length} groups`);

  // Check each group
  for (const file of groupFiles) {
    const groupData = JSON.parse(
      fs.readFileSync(path.join(groupsPath, file), "utf8")
    );
    console.log(`Group: ${groupData.name}`);
    console.log(`  PIC: ${groupData.pic} (${groupData.picEmail})`);
    console.log(`  Members: ${groupData.members.join(", ")}`);

    // Check if sender matches
    const senderEmail = mailData.From.toLowerCase().trim();
    const isMatch = groupData.members.some(
      (member) => member.toLowerCase().trim() === senderEmail
    );

    console.log(`  Match for ${senderEmail}: ${isMatch}`);

    if (isMatch) {
      // Add assignment
      mailData.assignedTo = {
        type: "pic",
        picId: path.parse(file).name,
        picName: groupData.pic,
        picEmail: groupData.picEmail,
        assignedAt: new Date().toISOString(),
        assignedBy: "manual_fix",
        matchType: "exact_email",
        groupId: path.parse(file).name,
        groupName: groupData.name,
      };

      // Save back to file
      fs.writeFileSync(mailFile, JSON.stringify(mailData, null, 2));

      console.log(`✅ ASSIGNED: ${mailData.Subject} → ${groupData.pic}`);
      break;
    }
  }

  // Check result
  const updatedMail = JSON.parse(fs.readFileSync(mailFile, "utf8"));
  console.log("Updated mail:", {
    Subject: updatedMail.Subject,
    From: updatedMail.From,
    hasAssignment: !!updatedMail.assignedTo,
    assignedTo: updatedMail.assignedTo
      ? updatedMail.assignedTo.picName
      : "None",
  });
};

try {
  fixAutoAssignment();
} catch (error) {
  console.error("ERROR:", error.message);
}
