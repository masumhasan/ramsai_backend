import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { config } from '../config/env';
import crypto from 'crypto';
import path from 'path';

const s3Client = new S3Client({
  region: config.awsRegion,
  credentials: {
    accessKeyId: config.awsAccessKeyId,
    secretAccessKey: config.awsSecretAccessKey,
  },
});

/**
 * Upload a file buffer directly to AWS S3 bucket
 * @returns Public S3 URL string
 */
export const uploadFileToS3 = async (
  fileBuffer: Buffer,
  originalName: string,
  mimeType: string,
  folder = 'broadcasts'
): Promise<string> => {
  if (!config.awsAccessKeyId || !config.awsSecretAccessKey) {
    throw new Error('AWS credentials missing in server .env configuration');
  }

  const ext = path.extname(originalName) || '.png';
  const fileHash = crypto.randomBytes(16).toString('hex');
  const key = `${folder}/${Date.now()}_${fileHash}${ext}`;

  const command = new PutObjectCommand({
    Bucket: config.awsS3BucketName,
    Key: key,
    Body: fileBuffer,
    ContentType: mimeType,
  });

  await s3Client.send(command);

  return `https://${config.awsS3BucketName}.s3.${config.awsRegion}.amazonaws.com/${key}`;
};
