"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFileToS3 = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const env_1 = require("../config/env");
const crypto_1 = __importDefault(require("crypto"));
const path_1 = __importDefault(require("path"));
const s3Client = new client_s3_1.S3Client({
    region: env_1.config.awsRegion,
    credentials: {
        accessKeyId: env_1.config.awsAccessKeyId,
        secretAccessKey: env_1.config.awsSecretAccessKey,
    },
});
/**
 * Upload a file buffer directly to AWS S3 bucket
 * @returns Public S3 URL string
 */
const uploadFileToS3 = async (fileBuffer, originalName, mimeType, folder = 'broadcasts') => {
    if (!env_1.config.awsAccessKeyId || !env_1.config.awsSecretAccessKey) {
        throw new Error('AWS credentials missing in server .env configuration');
    }
    const ext = path_1.default.extname(originalName) || '.png';
    const fileHash = crypto_1.default.randomBytes(16).toString('hex');
    const key = `${folder}/${Date.now()}_${fileHash}${ext}`;
    const command = new client_s3_1.PutObjectCommand({
        Bucket: env_1.config.awsS3BucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: mimeType,
    });
    await s3Client.send(command);
    return `https://${env_1.config.awsS3BucketName}.s3.${env_1.config.awsRegion}.amazonaws.com/${key}`;
};
exports.uploadFileToS3 = uploadFileToS3;
