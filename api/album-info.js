import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const openai = createOpenAI({
  apiKey: process.env.AI_API_KEY, // Vercel’s automatic built‑in key
});

export default async function handler(req, res) {
  try {
    const { album, artist } = req.body;

    if (!album || !artist) {
      return res.status(400).json({ error: "Missing album or artist" });
    }

    const result = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: `
        Provide a 2–3 sentence factual description of the album "${album}" by ${artist}.
        Mention genre, sound, themes, and production details.
        Avoid generic phrasing such as "lasting influence" or "innovation".
      `
    });

    res.status(200).json({ text: result.text });

  } catch (err) {
    console.error("AI ROUTE ERROR:", err);
    res.status(500).json({ error: "AI generation failed." });
  }
}
