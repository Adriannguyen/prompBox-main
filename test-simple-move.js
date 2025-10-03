// Simple test for move API
const http = require("http");

const testMailData = {
  id: "test-mustRep-NEW",
  fileName: "test-mustRep-NEW.json",
  Subject: "NEW Test mustRep mail should go to pending",
  From: "test@example.com",
  Type: "To",
  Date: ["2025-10-01", "12:00"],
};

const postData = JSON.stringify({
  mailId: "test-mustRep-NEW",
  mailData: testMailData,
});

console.log("🧪 Testing move-to-review with simplified logic...");
console.log(`📧 Mail: ${testMailData.Subject}`);
console.log(`📁 Expected: mustRep folder → pending\n`);

const options = {
  hostname: "localhost",
  port: 3002,
  path: "/api/move-to-review",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(postData),
  },
};

const req = http.request(options, (res) => {
  let data = "";
  res.on("data", (chunk) => {
    data += chunk;
  });
  res.on("end", () => {
    console.log(`📊 HTTP Status: ${res.statusCode}`);
    try {
      const result = JSON.parse(data);
      console.log(`📋 Response:`, result);
      if (result.success) {
        console.log("\n✅ Test completed! Check server logs for details.");
        console.log(
          "📁 Check if file moved to: C:\\classifyMail\\ReviewMail\\pending\\test-mustRep-NEW.json"
        );
      }
    } catch (error) {
      console.log(`📋 Raw response:`, data);
    }
  });
});

req.on("error", (error) => {
  console.error(`❌ Error:`, error.message);
});

req.write(postData);
req.end();
