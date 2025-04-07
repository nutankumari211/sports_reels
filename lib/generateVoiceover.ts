import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';

const polly = new PollyClient({
  region: 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function generateVoiceover(script: string, filename: string): Promise<string> {
  const filePath = path.join(process.cwd(), 'public', 'audio', `${filename}.mp3`);

  // ✅ Ensure the 'public/audio' folder exists
  const audioDir = path.dirname(filePath);
  if (!existsSync(audioDir)) {
    mkdirSync(audioDir, { recursive: true });
  }

  const command = new SynthesizeSpeechCommand({
    OutputFormat: 'mp3',
    Text: script,
    VoiceId: 'Matthew', // Change voice as desired
    Engine: 'neural',
    LanguageCode: 'en-US',
  });

  const response = await polly.send(command);

  if (response.AudioStream) {
    const buffer = await response.AudioStream.transformToByteArray();
    writeFileSync(filePath, Buffer.from(buffer));
    console.log(`🎙️ Voiceover saved to ${filePath}`);
    return `/audio/${filename}.mp3`; // Relative path for browser
  } else {
    throw new Error('Failed to generate audio stream');
  }
}
