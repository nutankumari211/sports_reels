import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { exec } from 'child_process';

export async function stitchReel({
  playerSlug,
  audioPath,
  imagePaths,
  outputName,
}: {
  playerSlug: string;
  audioPath: string;
  imagePaths: string[];
  outputName?: string;
}): Promise<string> {
  const tempDir = path.join(process.cwd(), 'temp', playerSlug);
  const outputDir = path.join(process.cwd(), 'output');
fs.mkdirSync(outputDir, { recursive: true });
const outputPath = path.join(outputDir, `${outputName || playerSlug}-reel.mp4`);


  fs.mkdirSync(tempDir, { recursive: true });
  fs.mkdirSync(outputDir, { recursive: true });

  // Step 1: Download/copy images and rename to img001.jpg, img002.jpg, ...
  const localImages = await Promise.all(
    imagePaths.map(async (img, index) => {
      const paddedIndex = String(index + 1).padStart(3, '0');
      const targetPath = path.join(tempDir, `img${paddedIndex}.jpg`);
      if (img.startsWith('http')) {
        const res = await axios.get(img, { responseType: 'arraybuffer' });
        fs.writeFileSync(targetPath, res.data);
      } else {
        fs.copyFileSync(path.join('public', img), targetPath);
      }
      return targetPath;
    })
  );

  if (localImages.length === 0) {
    throw new Error('❌ No valid images found.');
  }

  // Step 2: Construct FFmpeg command (spread images across 60s)
  const durationPerImage = 60 / localImages.length;
  const fullAudioPath = path.join(process.cwd(), 'public', audioPath);
  if (!fs.existsSync(fullAudioPath)) {
    throw new Error(`❌ Audio file not found at: ${fullAudioPath}`);
  }

  const normalizedTempDir = tempDir.replace(/\\/g, '/');
  const normalizedAudioPath = fullAudioPath.replace(/\\/g, '/');
  const normalizedOutputPath = outputPath.replace(/\\/g, '/');
  
  //const ffmpegCommand = `ffmpeg -y -r 1/${durationPerImage} -i "${normalizedTempDir}/img%03d.jpg" -i "${normalizedAudioPath}" -c:v libx264 -tune stillimage -c:a aac -b:a 192k -shortest -pix_fmt yuv420p "${normalizedOutputPath}"`;
  //const ffmpegCommand = `ffmpeg -y -r 1/${durationPerImage} -i "${normalizedTempDir}/img%03d.jpg" -i "${normalizedAudioPath}" -map 0:v:0 -map 1:a:0 -c:v libx264 -tune stillimage -c:a aac -b:a 192k -shortest -pix_fmt yuv420p "${normalizedOutputPath}"`;
  
  const ffmpegCommand = `ffmpeg -y -framerate 1/${durationPerImage} -i "${normalizedTempDir}/img%03d.jpg" -i "${normalizedAudioPath}" -vf "fps=25,format=yuv420p" -shortest -c:v libx264 -tune stillimage -c:a aac -b:a 192k "${normalizedOutputPath}"`;

  console.log('📽️ Running FFmpeg:', ffmpegCommand);

  console.log('📂 tempDir:', normalizedTempDir);
console.log('🎵 fullAudioPath:', normalizedAudioPath);
console.log('🎬 outputPath:', normalizedOutputPath);
console.log('🧐 Does audio file exist?', fs.existsSync(fullAudioPath));



  await new Promise<void>((resolve, reject) => {
    exec(ffmpegCommand, (err, stdout, stderr) => {

      console.log('🔍 FFmpeg STDOUT:\n', stdout);
    console.error('🚨 FFmpeg STDERR:\n', stderr);
    if (err) {
      console.error('❌ FFmpeg execution error:', err);
      return reject(new Error(`FFmpeg failed: ${stderr}`));
    }
  
      console.log(`✅ Video created at: ${outputPath}`);
      const exists = fs.existsSync(outputPath);
      console.log('🧐 Output file exists?', exists);
  
      if (!exists) {
        return reject(new Error('FFmpeg said success but file not found!'));
      }
  
      resolve();
    });
  });
  

  // Optional cleanup
  fs.rmSync(tempDir, { recursive: true, force: true });

  return outputPath;
}
