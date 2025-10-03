const axios = require("axios");

async function testMoveToReview() {
  try {
    const response = await axios.post(
      "http://localhost:3002/api/move-to-review",
      {
        mailIds: ["21098"],
        userEmail: "test@test.com",
      }
    );

    console.log("Response:", JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
  }
}

testMoveToReview();
