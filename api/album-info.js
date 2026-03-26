// Free AI endpoint via OpenRouter Proxy — no key required
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// Manual body parsing for Vercel + Vite serverless
async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString());
}

// Fully working serverless handler
export default async function handler(req, res) {
  try {
    const { album, artist } = await readBody(req);

    if (!album || !artist) {
      return res.status(400).json({ error: "Missing album or artist" });
    }

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Free model, no API key required
      },
      body: JSON.stringify({
        model: "mistral-tiny",   // Free model, reliable, fast
        messages: [
          {
            role: "user",
            content: `
              Give a specific 2–3 sentence description of the album "${album}" by ${artist}.
              Include genre, themes, production, and sound.
              Avoid clichés like "lasting influence" or "innovation".
            `
          }
        ]
      })
    });

    const data = await response.json();

    const text =
      data?.choices?.[0]?.message?.content ||
      "No insight available.";

    return res.status(200).json({ text });

  } catch (error) {
    console.error("AI ROUTE ERROR:", error);
    return res.status(500).json({ error: "AI generation failed." });
  }
}
