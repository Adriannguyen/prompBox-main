// Create sample data for testing PIC-Group APIs
const API_BASE_URL = "http://127.0.0.1:3002";

async function createSampleData() {
  console.log("🔧 Creating sample data for testing...\n");

  try {
    // Create a sample group
    console.log("1️⃣ Creating sample group...");
    const groupResponse = await fetch(`${API_BASE_URL}/api/groups`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Test Group",
        description: "A test group for API testing",
        members: ["test@example.com"],
      }),
    });

    const groupResult = await groupResponse.json();
    console.log("Group created:", groupResult);

    // Create a sample PIC
    console.log("\n2️⃣ Creating sample PIC...");
    const picResponse = await fetch(`${API_BASE_URL}/api/pics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Test PIC",
        email: "testpic@example.com",
        groups: [],
        isLeader: false,
      }),
    });

    const picResult = await picResponse.json();
    console.log("PIC created:", picResult);

    console.log("\n✅ Sample data created successfully!");
    console.log("🧪 Now you can run the API tests...");
  } catch (error) {
    console.error("❌ Failed to create sample data:", error);
  }
}

// Run the setup
createSampleData();
