const fs = require("fs");
const path = require("path");

// Test enhanced auto-assignment functionality
const testEnhancedAutoAssign = () => {
  const ASSIGNMENT_DATA_PATH = "C:\\classifyMail";
  const MAIL_DATA_PATH = "C:\\classifyMail";

  console.log("🧪 Testing Enhanced Auto-Assignment");

  // 1. Create test group with domain members
  const groupsPath = path.join(ASSIGNMENT_DATA_PATH, "Groups");
  if (!fs.existsSync(groupsPath)) {
    fs.mkdirSync(groupsPath, { recursive: true });
  }

  const testGroup = {
    id: "test-company-group",
    name: "Company IT Department",
    description: "Handles all IT related emails",
    pic: "John Smith",
    picEmail: "john.smith@company.com",
    members: [
      "admin@company.com", // Exact email match
      "*.company.com", // Wildcard domain match
      "support@company.com", // Another exact match
      "it-help@company.com", // Another exact match
    ],
    createdAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(groupsPath, "test-company-group.json"),
    JSON.stringify(testGroup, null, 2)
  );

  console.log("✅ Created test group with domain matching");

  // 2. Create test mails without assignment
  const mustRepPath = path.join(MAIL_DATA_PATH, "DungHan", "mustRep");
  if (!fs.existsSync(mustRepPath)) {
    fs.mkdirSync(mustRepPath, { recursive: true });
  }

  const testMails = [
    {
      id: "test-exact-match",
      Subject: "Test Exact Email Match",
      From: "admin@company.com",
      Type: "To",
      Date: [new Date().toISOString().split("T")[0], "14:30"],
      SummaryContent: "Test mail for exact email matching",
      isRead: false,
    },
    {
      id: "test-wildcard-match",
      Subject: "Test Wildcard Domain Match",
      From: "sales@company.com",
      Type: "To",
      Date: [new Date().toISOString().split("T")[0], "14:35"],
      SummaryContent: "Test mail for wildcard domain matching",
      isRead: false,
    },
    {
      id: "test-no-match",
      Subject: "Test No Match",
      From: "external@external.com",
      Type: "To",
      Date: [new Date().toISOString().split("T")[0], "14:40"],
      SummaryContent: "Test mail that should not match any group",
      isRead: false,
    },
  ];

  testMails.forEach((mail) => {
    fs.writeFileSync(
      path.join(mustRepPath, `${mail.id}.json`),
      JSON.stringify(mail, null, 2)
    );
  });

  console.log("✅ Created 3 test mails (2 should match, 1 should not)");

  // 3. Display test setup
  console.log("\n📋 Test Setup Complete:");
  console.log("🏢 Group: Company IT Department");
  console.log("👤 PIC: John Smith (john.smith@company.com)");
  console.log("📧 Members:");
  console.log("   - admin@company.com (exact)");
  console.log("   - *.company.com (wildcard)");
  console.log("   - support@company.com (exact)");
  console.log("   - it-help@company.com (exact)");
  console.log("\n📬 Test Mails:");
  console.log("   1. admin@company.com → Should match (exact)");
  console.log("   2. sales@company.com → Should match (wildcard)");
  console.log("   3. external@external.com → Should NOT match");

  console.log(
    "\n🚀 Now run: curl -X POST http://localhost:3002/api/refresh-pics"
  );
  console.log('Or use the "Refresh PICs" button in the frontend');
};

// Run test
testEnhancedAutoAssign();
