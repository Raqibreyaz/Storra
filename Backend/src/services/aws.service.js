import {
  PutObjectCommand,
  HeadObjectCommand,
  S3Client,
  DeleteObjectCommand,
  CopyObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.AWS_REGION || "ap-south-1(mumbai)";
const bucketName = process.env.AWS_BUCKET_NAME;
const presignedUrlExpiry = parseInt(
  process.env.AWS_PRESIGNED_URL_EXPIRY || 5 * 60,
);

const s3Client = new S3Client({
  credentials: { accessKeyId, secretAccessKey },
});

export const createObjectPresignedUrl = async (
  objectName,
  objectSize,
  objectType,
) => {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: objectName,
    ContentLength: objectSize,
    ContentType: objectType,
  });

  const signedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: presignedUrlExpiry,
    signableHeaders: new Set(["content-length", "content-type"]),
  });

  return signedUrl;
};

export const getObjectSize = async (objectKey) => {
  const command = new HeadObjectCommand({ Bucket: bucketName, Key: objectKey });

  const res = await s3Client.send(command);
  return res.ContentLength;
};

export const deleteObject = async (objectKey) => {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
  });

  const {
    $metadata: { httpStatusCode },
  } = await s3Client.send(command);
  return httpStatusCode < 300 && httpStatusCode >= 200;
};

export const renameObject = async (objectKey, newName) => {
  // copy the object to the destination first
  await s3Client.send(
    new CopyObjectCommand({
      Bucket: bucketName,
      Key: newName,
      CopySource: `${bucketName}/${objectKey}`,
    }),
  );

  // delete the source object
  await deleteObject(objectKey);
};
