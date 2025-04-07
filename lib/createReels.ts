import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import { uploadToS3 } from './uploadToS3'; // 👈 Import the uploader

export async function createReel({
  playerName,
  audioPath,
  imagePaths,
}: {
  playerName: string;
  audioPath: string;
  imagePaths: string[];
}): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileSafeName = playerName.toLowerCase().replace(/ /g, '-');
    const outputDir = path.join(process.cwd(), 'public', 'videos');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const outputPath = path.join(outputDir, `${fileSafeName}.mp4`);
    const inputListPath = path.join(outputDir, `${fileSafeName}-input.txt`);
    const imageDuration = 5;

    const inputList =
      imagePaths
        .map((img) => `file '${path.join(process.cwd(), 'public', img)}'\nduration ${imageDuration}`)
        .join('\n') +
      `\nfile '${path.join(process.cwd(), 'public', imagePaths[imagePaths.length - 1])}'`;

    fs.writeFileSync(inputListPath, inputList);

    ffmpeg()
      .input(inputListPath)
      .inputFormat('concat')
      .inputOptions(['-safe 0'])
      .input(path.join(process.cwd(), 'public', audioPath))
      .audioCodec('aac')
      .videoCodec('libx264')
      .outputOptions([
        '-pix_fmt yuv420p',
        '-shortest',
        '-vf',
        'scale=720:1280,format=yuv420p',
      ])
      .save(outputPath)
      .on('end', async () => {
        console.log(`🎬 Reel saved to ${outputPath}`);

        try {
          const s3Key = `reels/${fileSafeName}.mp4`;
          const s3Url = await uploadToS3(outputPath, s3Key); // 👈 Upload to S3
          console.log(`✅ Uploaded to S3: ${s3Url}`);
          resolve(s3Url); // 👈 Resolve with S3 URL instead of local path
        } catch (uploadErr) {
          console.error('❌ S3 Upload Error:', uploadErr);
          reject(uploadErr);
        }
      })
      .on('error', (err) => {
        console.error('❌ FFmpeg error:', err);
        reject(err);
      });
  });
}
