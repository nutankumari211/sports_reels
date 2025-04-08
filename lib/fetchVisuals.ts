import axios from 'axios';
import path from 'path';
import fs from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import { downloadImageToLocal } from './downloadImageToLocal';

export async function fetchVisuals({
  playerName,
}: {
  playerName: string;
}): Promise<{
  allImages: string[];
}> {
  const wikipediaImage = await fetchFromWikipediaImage(playerName);
  const wikimediaImage = await fetchFromWikimedia(playerName);
  const extraWikimediaImages = await fetchExtraWikimediaImages(playerName);

  const allImageUrls = [
    wikipediaImage,
    wikimediaImage,
    ...extraWikimediaImages,
  ].filter(Boolean) as string[];

  const fileSafeName = playerName.toLowerCase().replace(/\s+/g, '-');
  const folderPath = path.join(process.cwd(), 'public', 'images', fileSafeName);

  if (!fs.existsSync(folderPath)) await mkdir(folderPath, { recursive: true });

  const downloadedImagePaths = await Promise.all(
    allImageUrls.map((url, index) =>
      downloadImageToLocal(url, folderPath, index)
    )
  );

  // Return relative paths (for use in FFmpeg and frontend)
  const relativePaths = downloadedImagePaths.map((absPath) =>
    path.relative(path.join(process.cwd(), 'public'), absPath)
  );

  return { allImages: relativePaths };
}

async function fetchFromWikipediaImage(playerName: string): Promise<string | null> {
  try {
    const res = await axios.get(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(playerName)}`
    );
    return res.data.originalimage?.source || res.data.thumbnail?.source || null;
  } catch {
    return null;
  }
}

async function fetchFromWikimedia(playerName: string): Promise<string | null> {
  try {
    const res = await axios.get(
      `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
        playerName
      )}&prop=pageimages&format=json&pithumbsize=600&origin=*`
    );

    const pages = res.data.query.pages;
    const page = Object.values(pages)[0] as any;
    return page?.thumbnail?.source || null;
  } catch {
    return null;
  }
}

async function fetchExtraWikimediaImages(playerName: string): Promise<string[]> {
  try {
    const searchRes = await axios.get(
      `https://commons.wikimedia.org/w/api.php`, {
        params: {
          action: 'query',
          list: 'search',
          srsearch: playerName,
          srnamespace: 6,
          format: 'json',
          origin: '*',
          srlimit: 20,
        }
      }
    );

    const fileTitles = searchRes.data?.query?.search?.map((item: any) => item.title) || [];

    const imageUrls: string[] = [];

    // Fetch image URLs one by one (or in chunks)
    for (const title of fileTitles) {
      const infoRes = await axios.get(
        `https://commons.wikimedia.org/w/api.php`, {
          params: {
            action: 'query',
            titles: title,
            prop: 'imageinfo',
            iiprop: 'url',
            format: 'json',
            origin: '*',
          }
        }
      );

      const pages = infoRes.data.query.pages;
      const img = (Object.values(pages)[0] as { imageinfo?: { url: string }[] })?.imageinfo?.[0]?.url;
      if (img && /\.(jpe?g|png)$/i.test(img)) {
        imageUrls.push(img);
      }
    }

    return imageUrls;
  } catch (err) {
    console.error(' Wikimedia fetch failed:', err);
    return [];
  }
}

