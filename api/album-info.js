import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const openai = createOpenAI({
  apiKey: process.env.AI_API_KEY || "dev-placeholder", 
});

// ---- FIX: manually parse body for Vercel serverless + Vite ----
async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString());
}

export default async function handler(req, res) {
  try {
    const body = await readBody(req);  
    const { album, artist } = body;

    if (!album || !artist) {
      return res.status(400).json({ error: "Missing album or artist" });
    }

    const result = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: `
        Give a specific, factual 2–3 sentence description of the album "${album}" by ${artist}.
        Mention genre, sound, themes, production details, or context.
        Avoid generic phrases like "lasting influence" or "innovation".
      `
    });

    return res.status(200).json({ text: result.text });

  } catch (err) {
    console.error("AI ROUTE ERROR:", err);
    res.status(500).json({ error: "AI generation failed." });
  }
}
