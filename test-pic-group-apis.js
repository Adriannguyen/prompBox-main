// Test API for PIC-Group assignment
const API_BASE_URL = "http://127.0.0.1:3002";

async function testPicGroupAPIs() {
  console.log("🧪 Testing PIC-Group Assignment APIs...\n");

  try {
    // 1. Test GET all PICs to see current data
    console.log("1️⃣ Getting all PICs...");
    const picsResponse = await fetch(`${API_BASE_URL}/api/pics`);
    const picsData = await picsResponse.json();
    console.log(
      "PICs:",
      Array.isArray(picsData) ? picsData.slice(0, 2) : "No PICs found"
    );

    // 2. Test GET all Groups to see current data
    console.log("\n2️⃣ Getting all Groups...");
    const groupsResponse = await fetch(`${API_BASE_URL}/api/groups`);
    const groupsData = await groupsResponse.json();
    console.log(
      "Groups:",
      Array.isArray(groupsData) ? groupsData.slice(0, 2) : "No Groups found"
    );

    if (
      !Array.isArray(picsData) ||
      !Array.isArray(groupsData) ||
      !picsData.length ||
      !groupsData.length
    ) {
      console.log("❌ No PICs or Groups found for testing");
      return;
    }

    const testPic = picsData[0];
    const testGroup = groupsData[0];

    console.log(`\n🎯 Testing with PIC: ${testPic.name} (${testPic.id})`);
    console.log(`🎯 Testing with Group: ${testGroup.name} (${testGroup.id})`);

    // 3. Test Add PIC to Group
    console.log("\n3️⃣ Testing Add PIC to Group...");
    const addResponse = await fetch(
      `${API_BASE_URL}/api/pics/${testPic.id}/groups`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groupId: testGroup.id }),
      }
    );

    console.log("Add response status:", addResponse.status);
    const addText = await addResponse.text();
    console.log("Add response text:", addText);

    let addResult;
    try {
      addResult = JSON.parse(addText);
      console.log("Add result:", addResult);
    } catch (e) {
      console.log("Failed to parse JSON:", e.message);
      return;
    }

    // 4. Test Get PICs for Group
    console.log("\n4️⃣ Testing Get PICs for Group...");
    const groupPicsResponse = await fetch(
      `${API_BASE_URL}/api/groups/${testGroup.id}/pics`
    );
    const groupPicsData = await groupPicsResponse.json();
    console.log("Group PICs:", groupPicsData);

    // 5. Test Remove PIC from Group
    console.log("\n5️⃣ Testing Remove PIC from Group...");
    const removeResponse = await fetch(
      `${API_BASE_URL}/api/pics/${testPic.id}/groups/${testGroup.id}`,
      {
        method: "DELETE",
      }
    );

    const removeResult = await removeResponse.json();
    console.log("Remove result:", removeResult);

    // 6. Verify removal
    console.log("\n6️⃣ Verifying removal...");
    const verifyResponse = await fetch(
      `${API_BASE_URL}/api/groups/${testGroup.id}/pics`
    );
    const verifyData = await verifyResponse.json();
    console.log("Group PICs after removal:", verifyData);

    console.log("\n✅ All API tests completed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testPicGroupAPIs();
