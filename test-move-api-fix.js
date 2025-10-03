// Test move API with current logic
const http = require("http");

// Test data: mail từ QuaHan/chuaRep (should go to pending)
const testMailChuaRep = {
  id: "20157",
  fileName: "20157.json",
  Subject: "Test chuaRep mail",
  From: "test@example.com",
  Type: "To",
  Date: ["2025-08-06", "17:24"],
};

// Test data: mail từ QuaHan/daRep (should go to processed)
const testMailDaRep = {
  id: "20113",
  fileName: "20113.json",
  Subject: "Test daRep mail",
  From: "test@example.com",
  Type: "To",
  Date: ["2025-08-06", "17:24"],
};

function testMoveApi(mailData, testName) {
  console.log(`\n🧪 Testing: ${testName}`);
  console.log(`📧 Mail ID: ${mailData.id}`);

  const postData = JSON.stringify({
    mailId: mailData.id,
    mailData: mailData,
  });

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
      console.log(`📊 Status: ${res.statusCode}`);
      try {
        const result = JSON.parse(data);
        console.log(`📋 Result:`, result);
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
}

console.log("🚀 Testing move-to-review API with fixed logic...");

// Test 1: chuaRep mail (should go to pending)
setTimeout(() => {
  testMoveApi(testMailChuaRep, "QuaHan/chuaRep → pending");
}, 1000);

// Test 2: daRep mail (should go to processed)
setTimeout(() => {
  testMoveApi(testMailDaRep, "QuaHan/daRep → processed");
}, 3000);
