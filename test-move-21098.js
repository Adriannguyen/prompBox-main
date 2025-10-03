// Test move API with actual mail file 21098.json
const http = require("http");

const mailData = {
  id: "21098",
  Subject: "FW(4):Your September Settlement report has been issued.",
  From: "Gf6PFlwzy4iXYp/WjXFjhylo/TU8aU6Rf61UQiRY1pE=",
  Type: "To",
  Date: ["2025-09-25", "15:25"],
  idRep: 21113,
};

const postData = JSON.stringify({
  mailId: "21098",
  mailData: mailData,
});

console.log("🧪 Testing move-to-review with actual mail file...");
console.log(`📧 Mail ID: ${mailData.id}`);
console.log(`📁 Current location: DungHan/rep`);
console.log(`📁 Expected target: processed (because it's from "rep" folder)`);
console.log(`🔍 findMailFile should find: 21098.json`);
console.log("\n📤 Sending request...\n");

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
      console.log(`📋 Response:`, JSON.stringify(result, null, 2));

      if (result.success) {
        console.log(
          "\n✅ API call successful! Check server logs for move details."
        );
        console.log(
          "📁 Expected location: C:\\classifyMail\\ReviewMail\\processed\\21098.json"
        );
      } else {
        console.log("\n❌ API call failed! Check error details above.");
      }
    } catch (error) {
      console.log(`📋 Raw response:`, data);
    }

    console.log("\n📝 Check server terminal logs for detailed move process...");
  });
});

req.on("error", (error) => {
  console.error(`❌ Request Error:`, error.message);
});

req.write(postData);
req.end();
