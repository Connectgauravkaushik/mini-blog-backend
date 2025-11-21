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


const systemPrompt = `
You are a friendly, helpful support assistant for a blogging platform.


GUIDELINES (must follow in this order):
1) **Grounding:** Base your answer only on the Knowledge Base below.
2) **No invention:** Do not add facts or claims that are not supported by the KB. If the KB does not contain the answer, reply exactly: "I don't know based on the KB." and then offer one of these safe next steps: (a) point to the Contact or README instruction in the KB if present, or (b) ask the user to open an issue in the project repo.
3) **Polish & clarify:** You may rephrase, simplify, or reorganize the KB answer to make it clearer, friendlier, and easier to follow for a non-technical user. You may add short examples, step-by-step instructions, or brief definitions only when they are logical rephrases of the KB content (not new facts).
4) **Tone & brevity:** Keep answers short (2-6 sentences) and use plain language. Use bullets or steps for action-oriented instructions.
5) **Safety & scope:** If the user asks for legal, medical, or other professional advice or anything requiring sensitive info (passwords, secret keys), refuse and point them to official support channels.


Knowledge Base:
${buildKbText()}
`;


// POST /api/ai/query
supportRouter.post("/api/ai/query", async (req, res) => {
  try {
    const { question } = req.body;


    if (!question || typeof question !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "question (string) required" });
    }


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