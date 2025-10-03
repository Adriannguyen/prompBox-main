// Test Leader functionality for PIC-Group assignment
const API_BASE_URL = "http://127.0.0.1:3002";

async function testLeadershipAPIs() {
  console.log("👑 Testing PIC Group Leadership APIs...\n");

  try {
    // 1. Get all PICs and Groups
    console.log("1️⃣ Getting PICs and Groups...");
    const [picsResponse, groupsResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/api/pics`),
      fetch(`${API_BASE_URL}/api/groups`),
    ]);

    const picsData = await picsResponse.json();
    const groupsData = await groupsResponse.json();

    if (!picsData.length || !groupsData.length) {
      console.log("❌ No PICs or Groups found for testing");
      return;
    }

    const testPic = picsData[0];
    const testGroup = groupsData[0];

    console.log(`🎯 Testing with PIC: ${testPic.name} (${testPic.id})`);
    console.log(`🎯 Testing with Group: ${testGroup.name} (${testGroup.id})`);

    // 2. First ensure PIC is assigned to group
    console.log("\n2️⃣ Ensuring PIC is assigned to group...");
    const assignResponse = await fetch(
      `${API_BASE_URL}/api/pics/${testPic.id}/groups`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId: testGroup.id }),
      }
    );
    const assignResult = await assignResponse.json();
    console.log("Assignment result:", assignResult);

    // 3. Test Set PIC as Leader
    console.log("\n3️⃣ Testing Set PIC as Leader...");
    const setLeaderResponse = await fetch(
      `${API_BASE_URL}/api/pics/${testPic.id}/groups/${testGroup.id}/leader`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );

    console.log("Set leader response status:", setLeaderResponse.status);
    const setLeaderText = await setLeaderResponse.text();
    console.log("Set leader response text:", setLeaderText.substring(0, 200));

    let setLeaderResult;
    try {
      setLeaderResult = JSON.parse(setLeaderText);
    } catch (err) {
      console.log("Failed to parse JSON:", err.message);
      return;
    }
    console.log("Set leader result:", setLeaderResult);

    // 4. Verify PIC data has leadership
    console.log("\n4️⃣ Verifying PIC leadership...");
    const picResponse = await fetch(`${API_BASE_URL}/api/pics`);
    const updatedPicsData = await picResponse.json();
    const updatedPic = updatedPicsData.find((p) => p.id === testPic.id);
    console.log("Updated PIC data:", {
      name: updatedPic?.name,
      groups: updatedPic?.groups,
      groupLeaderships: updatedPic?.groupLeaderships,
    });

    // 5. Test Remove PIC as Leader
    console.log("\n5️⃣ Testing Remove PIC as Leader...");
    const removeLeaderResponse = await fetch(
      `${API_BASE_URL}/api/pics/${testPic.id}/groups/${testGroup.id}/leader`,
      {
        method: "DELETE",
      }
    );

    const removeLeaderResult = await removeLeaderResponse.json();
    console.log("Remove leader result:", removeLeaderResult);

    // 6. Verify leadership removal
    console.log("\n6️⃣ Verifying leadership removal...");
    const finalPicResponse = await fetch(`${API_BASE_URL}/api/pics`);
    const finalPicsData = await finalPicResponse.json();
    const finalPic = finalPicsData.find((p) => p.id === testPic.id);
    console.log("Final PIC data:", {
      name: finalPic?.name,
      groups: finalPic?.groups,
      groupLeaderships: finalPic?.groupLeaderships,
    });

    console.log("\n✅ Leadership API tests completed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testLeadershipAPIs();
