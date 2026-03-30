const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { auth } = require('../middleware/auth'); // Optional: Add if you want only logged-in users to use AI

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/ask', auth, async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    // Using gemini-1.5-flash for high speed and lower latency
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: "You are Anti-Demo AI, a brilliant and encouraging university tutor. Help students with their doubts in engineering, coding, math, and general subjects. Keep answers concise, accurate, and format them nicely using spacing and bullet points."
    });

    const result = await model.generateContent(question);
    const response = await result.response;
    const text = response.text();

    res.json({ answer: text });

  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ 
      error: "Failed to generate AI response", 
      details: error.message 
    });
  }
});

module.exports = router;