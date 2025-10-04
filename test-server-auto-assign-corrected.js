const fs = require("fs");
const path = require("path");

// Test the actual corrected server function
const testServerAutoAssign = () => {
  console.log("🧪 Testing actual server auto-assignment function");

  // Import the server logic (mock the required parts)
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

  // Helper function to write JSON files
  const writeJsonFile = (filePath, data) => {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`Error writing ${filePath}:`, error.message);
      return false;
    }
  };

  // Copy of the corrected autoAssignLeaderBySenderGroup function
  const autoAssignLeaderBySenderGroup = (mailData, filePath = null) => {
    // Skip if already assigned
    if (mailData.assignedTo) {
      console.log(`📌 Mail already assigned to: ${mailData.assignedTo.picName}`);
      return mailData;
    }

    try {
      const groupsPath = path.join(ASSIGNMENT_DATA_PATH, "Groups");
      const picsPath = path.join(ASSIGNMENT_DATA_PATH, "PIC");

      if (!fs.existsSync(groupsPath)) {
        console.log(`❌ Groups directory not found: ${groupsPath}`);
        return mailData;
      }

      if (!fs.existsSync(picsPath)) {
        console.log(`❌ PIC directory not found: ${picsPath}`);
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

      // Step 1: Find group containing sender
      let matchedGroup = null;
      let matchType = null;

      // Priority 1: Exact email match
      for (const file of groupFiles) {
        const groupData = readJsonFile(path.join(groupsPath, file));
        if (!groupData || !groupData.members) continue;

        const isExactMatch = groupData.members.some(
          (member) => member.toLowerCase().trim() === senderEmail
        );

        if (isExactMatch) {
          matchedGroup = { data: groupData, file: file };
          matchType = "exact_email";
          console.log(`🎯 EXACT MATCH: Found sender in group: ${groupData.name}`);
          break;
        }
      }

      // Priority 2: Domain match
      if (!matchedGroup && senderDomain) {
        for (const file of groupFiles) {
          const groupData = readJsonFile(path.join(groupsPath, file));
          if (!groupData || !groupData.members) continue;

          const isDomainMatch = groupData.members.some((member) => {
            const memberDomain = member.includes("@")
              ? member.split("@")[1].toLowerCase()
              : "";
            return memberDomain === senderDomain;
          });

          if (isDomainMatch) {
            matchedGroup = { data: groupData, file: file };
            matchType = "domain_match";
            console.log(`🎯 DOMAIN MATCH: Found sender domain in group: ${groupData.name}`);
            break;
          }
        }
      }

      // Priority 3: Wildcard domain match (*.company.com)
      if (!matchedGroup && senderDomain) {
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

          if (isWildcardMatch) {
            matchedGroup = { data: groupData, file: file };
            matchType = "wildcard_match";
            console.log(`🎯 WILDCARD MATCH: Found sender domain in group: ${groupData.name}`);
            break;
          }
        }
      }

      if (!matchedGroup) {
        console.log(`❌ No group found for sender: ${senderEmail}`);
        return mailData;
      }

      // Step 2: Find PIC assigned to this group
      const groupId = path.parse(matchedGroup.file).name;
      const picFiles = fs
        .readdirSync(picsPath)
        .filter((f) => f.endsWith(".json"));

      console.log(`🔍 Looking for PIC assigned to group ${groupId}...`);

      let assignedPic = null;
      for (const picFile of picFiles) {
        const picData = readJsonFile(path.join(picsPath, picFile));
        if (!picData) continue;

        // Check if this PIC is assigned to the matched group
        if (picData.groups && picData.groups.includes(groupId)) {
          assignedPic = { data: picData, file: picFile };
          console.log(`👤 Found PIC assigned to group: ${picData.name} (${picData.email})`);
          break;
        }
      }

      if (!assignedPic) {
        console.log(`❌ No PIC assigned to group: ${matchedGroup.data.name}`);
        return mailData;
      }

      // Step 3: Assign mail to PIC
      console.log(
        `✅ Assigning mail from ${senderEmail} to PIC: ${assignedPic.data.name}`
      );
      return assignToPic(
        mailData,
        matchedGroup.data,
        assignedPic.data,
        filePath,
        matchType
      );

    } catch (error) {
      console.error("❌ Error in auto-assign leader:", error);
      return mailData;
    }
  };

  // Helper function to assign mail to PIC
  const assignToPic = (mailData, groupData, picData, filePath, matchType) => {
    const updatedMailData = {
      ...mailData,
      assignedTo: {
        type: "pic",
        picId: picData.id,
        picName: picData.name,
        picEmail: picData.email,
        assignedAt: new Date().toISOString(),
        assignedBy: "system_auto",
        matchType: matchType,
        groupId: groupData.id,
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
  };

  // Test with sample mail data
  const testMail = {
    id: "test-mail-" + Date.now(),
    From: "duongg@gmail.com",
    Subject: "Test Auto Assignment",
    Body: "This is a test mail for auto-assignment",
    Date: new Date().toISOString()
  };

  console.log("\n📧 Testing with sample mail:");
  console.log(`From: ${testMail.From}`);
  console.log(`Subject: ${testMail.Subject}`);

  const result = autoAssignLeaderBySenderGroup(testMail);

  console.log("\n📋 Assignment Result:");
  if (result.assignedTo) {
    console.log(`✅ SUCCESS - Mail assigned to:`);
    console.log(`   PIC: ${result.assignedTo.picName} (${result.assignedTo.picEmail})`);
    console.log(`   Group: ${result.assignedTo.groupName}`);
    console.log(`   Match Type: ${result.assignedTo.matchType}`);
    console.log(`   Assigned At: ${result.assignedTo.assignedAt}`);
  } else {
    console.log(`❌ FAILED - Mail not assigned`);
  }

  return result;
};

testServerAutoAssign();