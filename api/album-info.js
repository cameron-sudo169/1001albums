import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

// Use Vercel's built-in AI key (no setup needed)
const openai = createOpenAI({
  apiKey: process.env.AI_API_KEY,
});

export default async function handler(req, res) {
  try {
    // Vercel parses JSON body automatically
    const { album, artist } = req.body;

    if (!album || !artist) {
      return res.status(400).json({ error: "Missing album or artist" });
    }

    const result = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: `
        Give a specific, factual 2–3 sentence description of the album "${album}" by ${artist}.
        Mention production, sound, themes, genre, or its context.
        Avoid generic phrases like "lasting impact", "influence", or "innovation".
      `
    });

    res.status(200).json({ text: result.text });

  } catch (err) {
    console.error("AI ROUTE ERROR:", err);
    res.status(500).json({ error: "AI generation failed." });
  }
}
