// 1️⃣ Load environment variables first
require("dotenv").config();

// 2️⃣ Read the API key from .env
const API_KEY = process.env.OPENROUTER_API_KEY;

const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch"); // if using node <18

const app = express();
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

// Your chat API route
app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,  // use the variable here
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openrouter/auto",
          messages: [
            { role: "system", content: "Give short, clear answers." },
            { role: "user", content: userMessage }
          ]
        })
      }
    );

    const data = await response.json();

    const reply = data?.choices?.[0]?.message?.content || "No response from AI";
    res.json({ reply });

  } catch (err) {
    console.log("❌ SERVER ERROR:", err);
    res.json({ reply: "Server error connecting to AI" });
  }
});

app.listen(5000, () =>
  console.log("Server running on http://localhost:5000")
);

