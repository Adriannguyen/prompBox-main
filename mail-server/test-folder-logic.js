// Quick test of folder detection logic
function testFolderDetection() {
  const testPaths = [
    "C:\\classifyMail\\DungHan\\rep\\test.json",
    "C:\\classifyMail\\DungHan\\mustRep\\test.json",
    "C:\\classifyMail\\QuaHan\\daRep\\test.json",
    "C:\\classifyMail\\QuaHan\\chuaRep\\test.json",
  ];

  testPaths.forEach((actualFilePath) => {
    console.log(`\n🔍 Testing: ${actualFilePath}`);
    console.log(`🔍 Lower case: ${actualFilePath.toLowerCase()}`);

    let targetReviewFolder = "pending"; // default
    let shouldMarkAsReplied = false;

    const lowerPath = actualFilePath.toLowerCase();

    // Check for SPECIFIC REPLIED folders first (more specific patterns)
    if (
      lowerPath.includes("\\rep\\") ||
      lowerPath.includes("/rep/") ||
      lowerPath.includes("\\darep\\") ||
      lowerPath.includes("/darep/") ||
      lowerPath.endsWith("\\rep") ||
      lowerPath.endsWith("/rep")
    ) {
      targetReviewFolder = "processed";
      shouldMarkAsReplied = true;
      console.log(`🎯 From replied folder → processed`);
    } else if (
      lowerPath.includes("\\mustrep\\") ||
      lowerPath.includes("/mustrep/") ||
      lowerPath.includes("\\chuarep\\") ||
      lowerPath.includes("/chuarep/") ||
      lowerPath.endsWith("\\mustrep") ||
      lowerPath.endsWith("/mustrep") ||
      lowerPath.endsWith("\\chuarep") ||
      lowerPath.endsWith("/chuarep")
    ) {
      targetReviewFolder = "pending";
      shouldMarkAsReplied = false;
      console.log(`🎯 From unreplied folder → pending`);
    } else {
      console.log(`⚠️  Unknown location, using default: pending`);
    }

    console.log(`✅ Result: ${targetReviewFolder}`);
  });
}

testFolderDetection();
