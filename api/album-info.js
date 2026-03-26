export default async function handler(req, res) {
  try {
    const { album, artist } = req.body;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: `Write a specific, factual 3-sentence description of the album "${album}" by ${artist}. 
            Focus on genre, sound, themes, influence, and history. 
            Avoid generic statements like "lasting impact" or "influence and innovation".`
          }
        ]
      })
    });

    const data = await response.json();

    res.status(200).json({
      text: data.choices?.[0]?.message?.content || "No insight available."
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error generating album info." });
  }
}
