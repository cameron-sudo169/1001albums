// Works in Vercel serverless, no keys required, no SDKs.
// Uses a public Ollama inference server that always returns text.

const OLLAMA_URL = "https://api.ollama.com/v1/chat/completions";

// Manually parse body because Vercel + Vite do not parse req.body
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

    const completion = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3.2",   // Free, works well for album metadata
        messages: [
          {
            role: "user",
            content: `
              Write a specific 2–3 sentence description of the album "${album}" by ${artist}.
              Include genre, themes, and production details.
              Avoid generic phrases like "influence" or "innovation".
            `
          }
        ]
      })
    });

    const data = await completion.json();

    const text =
      data?.choices?.[0]?.message?.content ||
      "AI could not generate an insight.";

    res.status(200).json({ text });

  } catch (error) {
    console.error("AI ROUTE ERROR:", error);
