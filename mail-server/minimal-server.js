const express = require("express");
const cors = require("cors");

const app = express();
const port = 3004; // Different port

// Basic middleware
app.use(cors());
app.use(express.json());

// Simple refresh endpoint
app.post("/api/refresh-pics", (req, res) => {
  console.log("Refresh called at", new Date());

  try {
    const response = {
      success: true,
      message:
        "PICs refreshed successfully! Auto-assigned 0 mail(s) from 0 checked.",
      assignedCount: 0,
      totalChecked: 0,
      results: [],
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
    console.log("Response sent successfully");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Health check
app.get("/health", (req, res) => {
  console.log("Health check called");
  res.json({
    status: "OK",
    timestamp: new Date(),
    port: port,
  });
});

app.listen(port, () => {
  console.log(`🚀 Test server running on http://localhost:${port}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down test server...");
  process.exit(0);
});
