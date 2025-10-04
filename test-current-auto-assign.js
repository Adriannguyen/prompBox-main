const fs = require("fs");
const path = require("path");

// Test the current server.js auto-assignment function
const testCurrentServerAutoAssign = () => {
  console.log("🧪 Testing current server.js auto-assignment function");

  // Load the actual server.js file content to check the function
  const serverJsPath = path.join(__dirname, "mail-server", "server.js");
  const serverContent = fs.readFileSync(serverJsPath, "utf8");

  // Check if the function uses the new logic (looking for PIC folder)
  const hasNewLogic = serverContent.includes('path.join(ASSIGNMENT_DATA_PATH, "PIC")');
  const hasOldLogic = serverContent.includes('groupData.pic && groupData.picEmail');
  
  console.log(`📁 Has new PIC folder logic: ${hasNewLogic ? "✅" : "❌"}`);
  console.log(`🔄 Has old group.pic logic: ${hasOldLogic ? "❌ (should be removed)" : "✅"}`);

  if (hasNewLogic && !hasOldLogic) {
    console.log("✅ Server.js function has been correctly updated!");
  } else if (hasOldLogic) {
    console.log("❌ Server.js still contains old logic that needs to be removed");
  } else {
    console.log("❓ Unable to determine function status");
  }

  // Also check if assignToPic function exists
  const hasAssignToPic = serverContent.includes('const assignToPic =');
  const hasOldAssignToGroup = serverContent.includes('const assignToGroup =');
  
  console.log(`🎯 Has new assignToPic function: ${hasAssignToPic ? "✅" : "❌"}`);
  console.log(`🔄 Has old assignToGroup function: ${hasOldAssignToGroup ? "❌ (should be removed)" : "✅"}`);

  // Show function signature from actual file
  const funcMatch = serverContent.match(/const autoAssignLeaderBySenderGroup = \([\s\S]*?\) => \{[\s\S]*?\n\}/);
  if (funcMatch) {
    console.log("\n📝 Current function preview:");
    console.log(funcMatch[0].substring(0, 500) + "...");
  }

  return { hasNewLogic, hasOldLogic, hasAssignToPic };
};

// Also test if any mail files use auto-assignment
const testMailAutoAssignment = () => {
  console.log("\n🔍 Testing auto-assignment on actual mail file...");
  
  const MAIL_PATH = "C:\\classifyMail";
  
  if (!fs.existsSync(MAIL_PATH)) {
    console.log("❌ Mail folder not found");
    return;
  }

  // Find a mail file to test
  const mailFiles = fs.readdirSync(MAIL_PATH).filter(f => f.endsWith(".json"));
  
  if (mailFiles.length === 0) {
    console.log("❌ No mail files found");
    return;
  }

  // Use first mail file
  const testMailFile = mailFiles[0];
  const mailPath = path.join(MAIL_PATH, testMailFile);
  
  console.log(`📧 Testing with mail file: ${testMailFile}`);
  
  try {
    const mailData = JSON.parse(fs.readFileSync(mailPath, "utf8"));
    const sender = mailData.From || mailData.EncryptedFrom || "unknown";
    
    console.log(`📧 Sender: ${sender}`);
    console.log(`🎯 Current assignment: ${mailData.assignedTo ? mailData.assignedTo.picName : "None"}`);
    
    // Check if sender should match a group
    const ASSIGNMENT_DATA_PATH = "C:\\classifyMail\\AssignmentData";
    const groupsPath = path.join(ASSIGNMENT_DATA_PATH, "Groups");
    
    if (fs.existsSync(groupsPath)) {
      const groupFiles = fs.readdirSync(groupsPath).filter(f => f.endsWith(".json"));
      
      for (const groupFile of groupFiles) {
        const groupData = JSON.parse(fs.readFileSync(path.join(groupsPath, groupFile), "utf8"));
        if (groupData.members) {
          const isMatch = groupData.members.some(member => 
            member.toLowerCase().trim() === sender.toLowerCase().trim()
          );
          
          if (isMatch) {
            console.log(`🎯 Should match group: ${groupData.name} (ID: ${groupData.id})`);
            
            // Check if there's a PIC for this group
            const picsPath = path.join(ASSIGNMENT_DATA_PATH, "PIC");
            if (fs.existsSync(picsPath)) {
              const picFiles = fs.readdirSync(picsPath).filter(f => f.endsWith(".json"));
              
              for (const picFile of picFiles) {
                const picData = JSON.parse(fs.readFileSync(path.join(picsPath, picFile), "utf8"));
                if (picData.groups && picData.groups.includes(groupData.id)) {
                  console.log(`✅ Should assign to PIC: ${picData.name} (${picData.email})`);
                  break;
                }
              }
            }
            break;
          }
        }
      }
    }
    
  } catch (error) {
    console.error("❌ Error reading mail file:", error.message);
  }
};

testCurrentServerAutoAssign();
testMailAutoAssignment();