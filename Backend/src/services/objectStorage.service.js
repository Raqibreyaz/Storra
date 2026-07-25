import ApiError from "../helpers/apiError.js";
import {
  PutObjectCommand,
  S3Client,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  HeadObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl as getS3SignedUrl } from "@aws-sdk/s3-request-presigner";

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const r2StorageEndpoint = `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`;

const ACCESS_KEY_ID = process.env.CLOUDFLARE_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.CLOUDFLARE_SECRET_ACCESS_KEY;

const BUCKET_NAME = process.env.CLOUDFLARE_BUCKET_NAME;
const PRESIGNED_URL_EXPIRY = parseInt(
  process.env.CLOUDFLARE_PRESIGNED_URL_EXPIRY || 5 * 60,
);

const r2Client = new S3Client({
  region: "auto",
  endpoint: r2StorageEndpoint,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

// presigned url to create object
export const createObjectPresignedUrl = async (
  objectName,
  objectSize,
  objectType,
) => {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: objectName,
    ContentLength: objectSize,
    ContentType: objectType,
  });

  const signedUrl = await getS3SignedUrl(r2Client, command, {
    expiresIn: PRESIGNED_URL_EXPIRY,
    signableHeaders: new Set(["content-length", "content-type"]),
  });

  return signedUrl;
};

// get the size of the given object
export const getObjectSize = async (objectKey) => {
  const command = new HeadObjectCommand({
    Bucket: BUCKET_NAME,
    Key: objectKey,
  });

  const res = await r2Client.send(command);
  return res.ContentLength;
};

// delete the given object and invalidate it's cache
export const deleteObject = async (objectKey) => {
  const deleteObjectCommand = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: objectKey,
  });

  await r2Client.send(deleteObjectCommand);

  return true;
};

// delete the given objects and invalidate cache
export const deleteObjects = async (objectKeys) => {
  const command = new DeleteObjectsCommand({
    Bucket: BUCKET_NAME,
    Delete: { Objects: objectKeys, Quiet: true },
  });

  const result = await r2Client.send(command);

  if (result.Errors?.length) {
    throw new ApiError(
      500,
      `Failed to delete ${result.Errors.length} object(s)`,
    );
  }

  return true;
};

export const getObjectPresignedUrl = async (
  objectKey,
  fileName,
  download = false,
  renderAsText = false,
) => {
  const settings = {};
  if (download)
    settings.ResponseContentDisposition = `attachment; filename="${encodeURIComponent(fileName)}"`;
  if (renderAsText) settings.ResponseContentType = "text/plain; charset=utf-8";

  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: objectKey,
    ...settings,
  });

  return await getS3SignedUrl(r2Client, command, {
    expiresIn: PRESIGNED_URL_EXPIRY,
  });
};
