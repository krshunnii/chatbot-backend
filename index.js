const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all origins during testing
app.use(cors());

app.use(express.json());

app.post("/chatbot", async (req, res) => {
  try {
    const userMessage = req.body.message;
    if (!userMessage) {
      return res.status(400).json({ reply: "No message received" });
    }

    console.log("Making request to OpenAssistant API...");
    console.log("Message:", userMessage);
    
    const response = await fetch(
      "https://api.openassistant.io/v1/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [{
            role: "user",
            content: userMessage
          }]
        }),
      }
    );

    console.log("Response status:", response.status);
    const responseText = await response.text();
    console.log("Raw response:", responseText);

    if (!response.ok) {
      console.error("OpenAssistant API error:", responseText);
      return res.status(response.status).json({ 
        reply: "Sorry, there was an error processing your request",
        error: responseText
      });
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Error parsing response:", parseError);
      return res.status(500).json({ 
        reply: "Error parsing API response",
        error: parseError.message
      });
    }

    // Extract the assistant's reply from the response
    const reply = data.choices?.[0]?.message?.content || "Sorry, I didn't understand that.";
    console.log("Final reply:", reply);
    res.status(200).json({ reply });
    
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ 
      reply: "Internal Server Error",
      error: err.message 
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
}); 