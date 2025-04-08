import OpenAI from "openai";
import { cleanScript } from "./cleanScript";
const scriptCache = new Map();

const openai = new OpenAI({
  apiKey: process.env.API_KEY_SPORTS || "",
  baseURL: "https://api.groq.com/openai/v1",
});

export async function generateScript(
  playerName: string,
  sport = "football"
): Promise<string> {
  const cacheKey = `${playerName.toLowerCase()}-${sport.toLowerCase()}`;

  if (scriptCache.has(cacheKey)) {
    return scriptCache.get(cacheKey)!;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "llama3-70b-8192",
      temperature: 0.7,
      max_tokens: 500,
      messages: [
        {
          role: "system",
          content: `You are a world-class sports documentary scriptwriter specializing in 60-second short-form reels.
Make it emotional, cinematic, and packed with real milestones. Use vivid language and build up to a strong conclusion.`,
        },
        {
          role: "user",
          content: `Create a 60-second reel script about the ${sport} career of ${playerName}.
Include:
- Early beginnings
- Major achievements
- Iconic moments
- Legacy impact

Use present tense. Add specific years or stats where known. Make it engaging for a sports fan.`,
        },
      ],
    });

    const script = completion.choices[0]?.message?.content?.trim() || "";
    const cleaned = cleanScript(script);
    scriptCache.set(cacheKey, cleaned);
    return cleaned;
  } catch (error: any) {
    console.error("Groq API Error", error);
    return getFallbackScript(playerName, sport);
  }
}

function getFallbackScript(playerName: string, sport: string): string {
  const known: Record<string, string> = {
    "Lionel Messi": `Lionel Messi's rise from Rosario to the Camp Nou is pure football magic...`,
    "Cristiano Ronaldo": `Cristiano Ronaldo turned dreams into reality with his blistering speed and goal-scoring legacy...`,
  };
  return (
    known[playerName] ||
    `${playerName} has had an incredible ${sport} career that inspired millions.`
  );
}

export function estimateDuration(script: string): number {
  const words = script.split(/\s+/).length;
  return Math.ceil(words / 2.5);
}
