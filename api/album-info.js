export default async function handler(req, res) {
  try {
    // ----- Parse JSON body manually -----
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = JSON.parse(Buffer.concat(chunks).toString());

    const { album, artist } = body;

    if (!album || !artist) {
      return res.status(400).json({ error: "Missing album or artist" });
    }

    // ----- Call a free public AI model -----
    const hfResponse = await fetch(
      "https://api-inference.huggingface.co/models/tiiuae/falcon-7b-instruct",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: `Provide a detailed, factual 2–3 sentence description of the album "${album}" by ${artist}. Mention genre, sound, themes, and production.`,
        })
      }
    );

    const data = await hfResponse.json();

    // Falcon returns text in multiple shapes — handle them all
    const text =
      data[0]?.generated_text ||
      data.generated_text ||
      data.text ||
      "No insight available.";

    res.status(200).json({ text });

  } catch (error) {
    console.error("ALBUM INFO API ERROR:", error);
    res.status(500).json({ error: "AI generation failed." });
  }
}
