import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const client = createOpenAI({
  // Uses Vercel’s built‑in AI_KEY automatically — no need to add one
  apiKey: process.env.AI_API_KEY,
});

export default async function handler(req, res) {
  try {
    const { album, artist } = req.body;

    const { text } = await generateText({
      model: client("gpt-4o-mini"), // Free model on Vercel
      prompt: `
        Provide a specific, factual 2–3 sentence description of the album "${album}" by ${artist}.
        Mention sound, themes, production, or cultural context.
        Do NOT use generic clichés like “influence and innovation” or “lasting impact”.
      `
    });

    res.status(200).json({ text });

  } catch (error) {
    console.error("AI error:", error);
    res.status(500).json({ error: "Server error generating description." });
  }
}
