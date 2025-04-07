import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config(); // if using .env

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToS3(localFilePath: string, s3Key: string): Promise<string> {
  const fileStream = fs.createReadStream(localFilePath);
  const uploadParams = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: s3Key,
    Body: fileStream,
    ContentType: 'video/mp4',
  };

  const command = new PutObjectCommand(uploadParams);
  await s3.send(command);

  return `https://${uploadParams.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
}
