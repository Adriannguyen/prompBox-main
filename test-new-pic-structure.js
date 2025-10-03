// Test creating new PIC without isLeader field
const API_BASE_URL = "http://127.0.0.1:3002";

async function testCreateNewPic() {
  console.log("🧪 Testing new PIC creation without isLeader...\n");

  try {
    // Test create new PIC
    console.log("1️⃣ Creating new PIC...");
    const createResponse = await fetch(`${API_BASE_URL}/api/pics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Test PIC New",
        email: "test-new@example.com",
      }),
    });

    const createResult = await createResponse.json();
    console.log("Create result:", createResult);

    if (createResult.success) {
      console.log("\n✅ New PIC structure:");
      console.log("- ID:", createResult.pic.id);
      console.log("- Name:", createResult.pic.name);
      console.log("- Email:", createResult.pic.email);
      console.log("- Groups:", createResult.pic.groups);
      console.log("- GroupLeaderships:", createResult.pic.groupLeaderships);
      console.log(
        "- Has isLeader field?",
        "isLeader" in createResult.pic ? "YES (❌)" : "NO (✅)"
      );

      // Test update PIC
      console.log("\n2️⃣ Testing update PIC...");
      const updateResponse = await fetch(
        `${API_BASE_URL}/api/pics/${createResult.pic.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "Test PIC Updated",
            email: "test-updated@example.com",
          }),
        }
      );

      const updateResult = await updateResponse.json();
      console.log("Update result:", updateResult);

      if (updateResult.success) {
        console.log("\n✅ Updated PIC structure:");
        console.log("- Name:", updateResult.pic.name);
        console.log("- Email:", updateResult.pic.email);
        console.log("- Groups preserved:", updateResult.pic.groups);
        console.log(
          "- GroupLeaderships preserved:",
          updateResult.pic.groupLeaderships
        );
        console.log(
          "- Has isLeader field?",
          "isLeader" in updateResult.pic ? "YES (❌)" : "NO (✅)"
        );
      }

      // Clean up - delete test PIC
      console.log("\n3️⃣ Cleaning up test PIC...");
      const deleteResponse = await fetch(
        `${API_BASE_URL}/api/pics/${createResult.pic.id}`,
        {
          method: "DELETE",
        }
      );
      const deleteResult = await deleteResponse.json();
      console.log(
        "Delete result:",
        deleteResult.success ? "✅ Cleaned up" : "❌ Failed to clean up"
      );
    }

    console.log("\n✅ All tests completed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testCreateNewPic();
