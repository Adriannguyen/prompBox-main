const path = require("path");
const fs = require("fs");

// Test the fixed logic for determining target folder
function testMoveLogic() {
  console.log("🧪 Testing move-to-review logic fix...\n");

  const testCases = [
    {
      name: "DungHan/mustRep mail with status field",
      mailData: {
        id: "123",
        status: "mustRep",
        filePath: "C:\\classifyMail\\DungHan\\mustRep\\123.json",
        Subject: "Test mail",
      },
      expected: { folder: "pending", replied: false },
    },
    {
      name: "DungHan/rep mail with status field",
      mailData: {
        id: "124",
        status: "rep",
        filePath: "C:\\classifyMail\\DungHan\\rep\\124.json",
        Subject: "Test mail",
      },
      expected: { folder: "processed", replied: true },
    },
    {
      name: "QuaHan/chuaRep mail WITHOUT status field (old mail)",
      mailData: {
        id: "125",
        // status: undefined (old mail)
        filePath: "C:\\classifyMail\\QuaHan\\chuaRep\\125.json",
        Subject: "Test mail",
      },
      expected: { folder: "pending", replied: false },
    },
    {
      name: "QuaHan/daRep mail WITHOUT status field (old mail)",
      mailData: {
        id: "126",
        // status: undefined (old mail)
        filePath: "C:\\classifyMail\\QuaHan\\daRep\\126.json",
        Subject: "Test mail",
      },
      expected: { folder: "processed", replied: true },
    },
  ];

  testCases.forEach((testCase, index) => {
    console.log(`Test ${index + 1}: ${testCase.name}`);

    const mailData = testCase.mailData;

    // Apply the fixed logic
    let targetReviewFolder = "pending"; // default
    let shouldMarkAsReplied = false;

    // Get status from mailData.status or infer from filePath for old mails
    let effectiveStatus = mailData.status;
    if (!effectiveStatus && mailData.filePath) {
      // Fallback: infer status from folder path for old mails without status field
      if (
        mailData.filePath.includes("\\rep\\") ||
        mailData.filePath.includes("/rep/")
      ) {
        effectiveStatus = "rep";
      } else if (
        mailData.filePath.includes("\\daRep\\") ||
        mailData.filePath.includes("/daRep/")
      ) {
        effectiveStatus = "daRep";
      } else if (
        mailData.filePath.includes("\\mustRep\\") ||
        mailData.filePath.includes("/mustRep/")
      ) {
        effectiveStatus = "mustRep";
      } else if (
        mailData.filePath.includes("\\chuaRep\\") ||
        mailData.filePath.includes("/chuaRep/")
      ) {
        effectiveStatus = "chuaRep";
      }
    }

    if (effectiveStatus === "rep" || effectiveStatus === "daRep") {
      // Already replied mails go to processed
      targetReviewFolder = "processed";
      shouldMarkAsReplied = true;
    } else if (effectiveStatus === "mustRep" || effectiveStatus === "chuaRep") {
      // Unreplied mails go to pending for review
      targetReviewFolder = "pending";
      shouldMarkAsReplied = false;
    }

    // Check results
    const actual = { folder: targetReviewFolder, replied: shouldMarkAsReplied };
    const passed =
      actual.folder === testCase.expected.folder &&
      actual.replied === testCase.expected.replied;

    console.log(`  Original status: ${mailData.status || "undefined"}`);
    console.log(
      `  Effective status: ${effectiveStatus} (${
        mailData.status ? "from field" : "inferred from path"
      })`
    );
    console.log(
      `  Expected: ${testCase.expected.folder}, replied: ${testCase.expected.replied}`
    );
    console.log(`  Actual: ${actual.folder}, replied: ${actual.replied}`);
    console.log(`  Result: ${passed ? "✅ PASS" : "❌ FAIL"}\n`);
  });
}

// Run the test
testMoveLogic();
