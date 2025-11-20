const express = require("express");
const { GoogleGenAI } = require("@google/genai");
const kb = require("../kb/kb.json");

const supportRouter = express.Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function buildKbText() {
  return kb
    .map((item) => `ID: ${item.id}\nQ: ${item.question}\nA: ${item.answer}`)
    .join("\n\n");
}

// POST /api/ai/query
supportRouter.post("/api/ai/query", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "question (string) required" });
    }

    // system message grounded in KB
    const systemPrompt = `
You are a support assistant for a blogging platform.

VERY IMPORTANT RULES:
1. Answer ONLY using the knowledge base below.
2. If the KB does not contain the answer, reply exactly: "I don't know based on the KB."
3. Never invent facts.
4. Keep answers short and clear.

Knowledge Base:
${buildKbText()}
`;

    // Call Gemini using official SDK
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "system", text: systemPrompt },
        { role: "user", text: question },
      ],
    });

    const answerText = response.candidates[0]?.content?.parts[0].text;

    return res.json({
      success: true,
      answer: answerText,
    });
  } catch (err) {
    console.error("AI error:", err);
    return res.status(500).json({
      success: false,
      message: "AI service error",
      error: err.message,
    });
  }
});

module.exports = supportRouter;
