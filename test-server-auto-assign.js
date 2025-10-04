const fs = require("fs");
const path = require("path");

// Test auto-assignment by directly calling the server function
const testServerAutoAssign = () => {
  console.log("🧪 Testing server auto-assignment directly...");

  const ASSIGNMENT_DATA_PATH = "C:\\classifyMail";
  const MAIL_DATA_PATH = "C:\\classifyMail";

  // Mock functions from server
  const readJsonFile = (filePath) => {
    try {
      return JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (error) {
      console.error(`Error reading ${filePath}:`, error.message);
      return null;
    }
  };

  const writeJsonFile = (filePath, data) => {
    try {
      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`Error writing ${filePath}:`, error.message);
      return false;
    }
  };

  // Copy enhanced autoAssignLeaderBySenderGroup from server.js
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
        if (!groupData || !groupData.members) continue;

        const isExactMatch = groupData.members.some(
          (member) => member.toLowerCase().trim() === senderEmail
        );

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

          // Save updated mail data back to file if filePath provided
          if (filePath) {
            try {
              const success = writeJsonFile(filePath, updatedMailData);
              if (success) {
                console.log(`💾 Saved auto-assigned mail data to ${filePath}`);
              } else {
                console.error(
                  `❌ Failed to save auto-assigned mail data to ${filePath}`
                );
              }
            } catch (saveError) {
              console.error("❌ Error saving auto-assigned mail:", saveError);
            }
          }

          return updatedMailData;
        }
      }

      // Priority 2: Domain match
      if (senderDomain) {
        for (const file of groupFiles) {
          const groupData = readJsonFile(path.join(groupsPath, file));
          if (!groupData || !groupData.members) continue;

          const isDomainMatch = groupData.members.some((member) => {
            const memberDomain = member.includes("@")
              ? member.split("@")[1].toLowerCase()
              : "";
            return memberDomain === senderDomain;
          });

          if (isDomainMatch && groupData.pic && groupData.picEmail) {
            console.log(
              `🎯 DOMAIN MATCH: Assigning mail from ${senderEmail} to group leader: ${groupData.pic}`
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
                matchType: "domain_match",
                groupId: path.parse(file).name,
                groupName: groupData.name,
              },
            };

            if (filePath) {
              const success = writeJsonFile(filePath, updatedMailData);
              if (success) {
                console.log(`💾 Saved auto-assigned mail data to ${filePath}`);
              }
            }

            return updatedMailData;
          }
        }
      }

      // Priority 3: Wildcard domain match (*.company.com)
      if (senderDomain) {
        for (const file of groupFiles) {
          const groupData = readJsonFile(path.join(groupsPath, file));
          if (!groupData || !groupData.members) continue;

          const isWildcardMatch = groupData.members.some((member) => {
            if (member.startsWith("*.")) {
              const wildcardDomain = member.substring(2).toLowerCase();
              return senderDomain.endsWith(wildcardDomain);
            }
            return false;
          });

          if (isWildcardMatch && groupData.pic && groupData.picEmail) {
            console.log(
              `🎯 WILDCARD MATCH: Assigning mail from ${senderEmail} to group leader: ${groupData.pic}`
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
                matchType: "wildcard_match",
                groupId: path.parse(file).name,
                groupName: groupData.name,
              },
            };

            if (filePath) {
              const success = writeJsonFile(filePath, updatedMailData);
              if (success) {
                console.log(`💾 Saved auto-assigned mail data to ${filePath}`);
              }
            }

            return updatedMailData;
          }
        }
      }

      console.log(`❌ No group found for sender: ${senderEmail}`);
      return mailData;
    } catch (error) {
      console.error("❌ Error in auto-assign leader:", error);
      return mailData;
    }
  };

  // Test mail creation like server API
  const createAndAssignMail = (subject, from, type = "To") => {
    console.log(`\n🎯 Creating and auto-assigning mail: ${subject}`);
    console.log(`   From: ${from}`);

    const mailId = Date.now().toString();
    const fileName = `${mailId}.json`;
    const filePath = path.join(MAIL_DATA_PATH, "DungHan/mustRep", fileName);

    let mailData = {
      Subject: subject,
      From: from,
      Type: type,
      Date: [
        new Date().toISOString().split("T")[0],
        new Date().toTimeString().slice(0, 5),
      ],
      SummaryContent: "Sample content for testing purposes",
      id: mailId,
      isRead: false,
    };

    // Auto-assign leader based on sender's group
    console.log(`🎯 Auto-assigning leader for new mail from: ${from}`);
    mailData = autoAssignLeaderBySenderGroup(mailData, null);

    // Write file with assignment
    if (writeJsonFile(filePath, mailData)) {
      console.log(`📧 Mail created: ${fileName}`);

      if (mailData.assignedTo) {
        console.log(
          `✅ Mail auto-assigned to: ${mailData.assignedTo.picName} (${mailData.assignedTo.picEmail})`
        );
      } else {
        console.log(`ℹ️ No auto-assignment found for sender: ${from}`);
      }

      return { success: true, fileName, mailData };
    } else {
      console.log(`❌ Failed to create mail file`);
      return { success: false, error: "Failed to create mail file" };
    }
  };

  // Test with different email addresses
  console.log("🧪 Testing email assignments:");

  // Test 1: Exact match
  createAndAssignMail("Test Exact Match", "admin@company.com", "To");

  // Test 2: Wildcard match
  createAndAssignMail("Test Wildcard Match", "sales@company.com", "To");

  // Test 3: No match
  createAndAssignMail("Test No Match", "external@external.com", "To");
};

// Run test
testServerAutoAssign();
