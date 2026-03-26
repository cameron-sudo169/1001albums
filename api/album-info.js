import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req) {
  const { album, artist } = await req.json();

  const result = await streamText({
    model: openai("gpt-4.1-mini"),
    prompt: `Give a short 2–3 sentence description of the album "${album}" by ${artist}. 
    Make it specific, factual, and focused on genre, themes, legacy, production, or impact. 
    Do NOT return generic phrases like "influence, innovation, and lasting impact."`
  });

  return result.toAIStreamResponse();
}
