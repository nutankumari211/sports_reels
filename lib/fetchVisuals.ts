import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { generateVisualPrompt } from './generateVisualPrompt';

export async function fetchVisuals({
  playerName,
  sport,
  team,
  country,
  traits,
}: {
  playerName: string;
  sport: string;
  team?: string;
  country?: string;
  traits?: string[];
}): Promise<{
  huggingFaceImages: string[];
  wikipediaImage: string | null;
  wikimediaImage: string | null;
}> {
  const huggingFaceImages = await fetchFromHuggingFace({
    playerName,
    sport,
    team,
    country,
    traits,
    count: 3,
  });

  const wikipediaImage = await fetchFromWikipediaImage(playerName);
  const wikimediaImage = await fetchFromWikimedia(playerName);

  return {
    huggingFaceImages,
    wikipediaImage,
    wikimediaImage,
  };
}

export async function fetchFromHuggingFace({
  playerName,
  sport,
  team,
  country,
  traits,
  count,
}: {
  playerName: string;
  sport: string;
  team?: string;
  country?: string;
  traits?: string[];
  count?: number;
}): Promise<string[]> {
  const prompt = generateVisualPrompt({
    playerName,
    sport,
    team,
    country,
    traits,
    vibe: 'cinematic',
  });

  const imageDir = path.join(process.cwd(), 'public', 'images', playerName.replace(/ /g, '-').toLowerCase());
  fs.mkdirSync(imageDir, { recursive: true });

  const results: string[] = [];

  for (let i = 0; i < (count || 10); i++) {
    try {
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2',
        { inputs: prompt },
        {
          headers: {
            Authorization: `Bearer ${process.env["script-image-gen"]}`,
          },
          timeout: 40000,
          responseType: 'arraybuffer',
        }
      );

      const fileName = `${playerName.replace(/ /g, '-').toLowerCase()}-${i + 1}.png`;
      const filePath = path.join(imageDir, fileName);

      fs.writeFileSync(filePath, response.data);
      results.push(`/images/${playerName.replace(/ /g, '-').toLowerCase()}/${fileName}`);
    } catch (err: any) {
      console.error(`❌ Hugging Face image ${i + 1} error:`, err.message);
    }
  }

  return results;
}

export async function fetchFromWikipediaImage(playerName: string): Promise<string | null> {
  try {
    const res = await axios.get(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(playerName)}`
    );
    return res.data.originalimage?.source || res.data.thumbnail?.source || null;
  } catch (err: any) {
    console.error('❌ Wikipedia image fetch failed:', err.message);
    return null;
  }
}

export async function fetchFromWikimedia(playerName: string): Promise<string | null> {
  try {
    const res = await axios.get(
      `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
        playerName
      )}&prop=pageimages&format=json&pithumbsize=600&origin=*`
    );

    const pages = res.data.query.pages;
    const page = Object.values(pages)[0] as any;
    return page?.thumbnail?.source || null;
  } catch (err: any) {
    console.error('❌ Wikimedia fallback failed:', err.message);
    return null;
  }
}
