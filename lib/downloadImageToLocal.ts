import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { writeFile } from 'fs/promises';

export async function downloadImageToLocal(
  imageUrl: string,
  folderPath: string,
  index: number
): Promise<string> {
  const extension = path.extname(new URL(imageUrl).pathname).split('?')[0] || '.jpg';
  const filePath = path.join(folderPath, `${index}${extension}`);

  const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  await writeFile(filePath, response.data);
  return filePath;
}
