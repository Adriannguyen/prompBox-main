// Simple test to debug refresh endpoint
const express = require("express");
const app = express();
const port = 3003; // Use different port to avoid conflicts

app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Test refresh endpoint
app.post("/api/refresh-pics", (req, res) => {
  console.log("🔄 Refresh endpoint called");

  try {
    const response = {
      success: true,
      message: "PIC refresh completed successfully",
      assignedCount: 0,
      totalChecked: 0,
      timestamp: new Date().toISOString(),
    };

    console.log("✅ Sending response:", response);
    res.status(200).json(response);
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

app.listen(port, () => {
  console.log(`🚀 Test server running on http://localhost:${port}`);
});
