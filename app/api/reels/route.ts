import { NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;
const REELS_PREFIX = 'reels/';

export async function GET() {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: REELS_PREFIX,
    });

    const data = await s3.send(command);
    const items = data.Contents || [];

    const reels = items
      .filter((item) => item.Key?.endsWith('.mp4'))
      .map((item) => {
        const key = item.Key!;
        const fileName = key.split('/').pop()?.replace('.mp4', '') || '';
        const videoUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
        return {
          playerName: fileName.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          videoUrl,
          s3Key: key,
        };
      });

    return NextResponse.json(reels);
  } catch (error) {
    console.error('❌ Failed to fetch reels from S3:', error);
    return NextResponse.json({ error: 'Could not fetch reels' }, { status: 500 });
  }
}
