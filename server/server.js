require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

app.post("/api/chat", async (req, res) => {
  try {
    console.log("🔥 Request received:", req.body);

    const userMessage = req.body.message;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "AI Chatbot"
        },
        body: JSON.stringify({
          model: "openrouter/auto",   // ✅ AUTO FREE MODEL
          messages: [
            {
              role: "system",
              content: "Give short, clear answers."
            },
            {
              role: "user",
              content: userMessage
            }
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
);