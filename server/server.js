// server.js
require("dotenv").config();           // Load .env at the very top
const express = require("express");
const cors = require("cors");

// If Node < 18, install node-fetch: npm install node-fetch
// Node >= 18 has fetch built-in
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();

app.use(cors());       // Allow cross-origin requests
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({ reply: "API key is missing in server environment!" });
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openrouter/auto",  // Free auto model
          messages: [
            { role: "system", content: "Give short, clear answers." },
            { role: "user", content: userMessage }
          ]
        })
      }
    );

    const data = await response.json();

    console.log("✅ AI RESPONSE:", data);

    const reply =
      data?.choices?.[0]?.message?.content ||
      data?.error?.message ||
      "No response from AI";

    res.json({ reply });

  } catch (err) {
    console.log("❌ SERVER ERROR:", err);
    res.json({ reply: "Server error connecting to AI" });
  }
});

app.listen(5000, () =>
  console.log("Server running on http://localhost:5000")
);;