// Quick test for leadership API
const fetch = require("node-fetch");

async function quickTest() {
  try {
    // Test basic connectivity
    const response = await fetch("http://127.0.0.1:3002/api/pics");
    console.log("Basic API status:", response.status);

    if (response.ok) {
      const data = await response.json();
      if (data.length > 0) {
        const testPic = data[0];
        console.log("Test PIC:", testPic.name, testPic.id);

        // Test leadership endpoint
        const leaderResponse = await fetch(
          `http://127.0.0.1:3002/api/pics/${testPic.id}/groups/test123/leader`,
          {
            method: "POST",
          }
        );

        console.log("Leadership API status:", leaderResponse.status);
        const leaderText = await leaderResponse.text();
        console.log("Leadership response:", leaderText.substring(0, 100));
      }
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

quickTest();
