import { createOpenAI } from "@ai-sdk/openai";

const openai = createOpenAI({
  apiKey: process.env.AI_API_KEY || "dev-key",
});

// Manual JSON body parsing for Vercel + Vite
async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString());
}

export default async function handler(req, res) {
  try {
    const { album, artist } = await readBody(req);

    if (!album || !artist) {
      return res.status(400).json({ error: "Missing album or artist" });
    }

    // ⭐ Working model call (no generateText)
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `
            Give a specific, factual 2–3 sentence description of the album "${album}" by ${artist}.
            Mention sound, themes, genre, and production details.
            Avoid generic phrases like "lasting influence" or "innovation".
          `,
        },
      ],
    });

    const text =
      completion.choices?.[0]?.message?.content || "No insight available.";

    res.status(200).json({ text });

  } catch (err) {
    console.error("AI ROUTE ERROR:", err);
    res.status(500).json({ error: "AI generation failed." });
  }
}
