import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import path from "path";

export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const DOCUMENT_MAX_BYTES = 10 * 1024 * 1024;
export const VIDEO_MAX_BYTES = 50 * 1024 * 1024;
export const DEFAULT_SIGNED_URL_EXPIRES_SECONDS = 60 * 60 * 24;

export const client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export function resolveMediaFolder(mimeType = "", fieldKey = "") {
  if (fieldKey === "demo_video" || mimeType.startsWith("video/")) {
    return "videos";
  }
  if (fieldKey === "photograph" || mimeType.startsWith("image/")) {
    return "images";
  }
  return "documents";
}

export function getMaxBytesForFolder(folder) {
  if (folder === "images") return IMAGE_MAX_BYTES;
  if (folder === "videos") return VIDEO_MAX_BYTES;
  return DOCUMENT_MAX_BYTES;
}

export function formatMaxSizeLabel(folder) {
  if (folder === "images") return "5MB";
  if (folder === "videos") return "50MB";
  return "10MB";
}

function sanitizeFilename(name = "file") {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export function buildObjectKey(folder, fieldKey, originalName) {
  const ext = path.extname(originalName || "").toLowerCase() || "";
  const base = sanitizeFilename(path.basename(originalName || "file", ext));
  return `${folder}/${fieldKey}_${uuidv4()}_${base}${ext}`;
}

export function buildPublicUrl(bucket, key) {
  const region = process.env.AWS_REGION;
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

export function extractKeyFromS3Url(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const key = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
    return key || null;
  } catch {
    return null;
  }
}

export function resolveObjectKey(file = {}) {
  if (file.stored_name) return file.stored_name;
  if (file.key) return file.key;
  return extractKeyFromS3Url(file.file_url);
}

export function getSignedUrlExpiresSeconds() {
  const configured = parseInt(process.env.AWS_S3_SIGNED_URL_EXPIRES_SECONDS, 10);
  return Number.isFinite(configured) && configured > 0
    ? configured
    : DEFAULT_SIGNED_URL_EXPIRES_SECONDS;
}

export async function generateSignedUrlFromKey(key, bucket = process.env.AWS_S3_BUCKET) {
  if (!bucket) {
    throw new Error("S3 bucket is not configured");
  }
  if (!key) {
    throw new Error("S3 object key is required");
  }

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  return getSignedUrl(client, command, {
    expiresIn: getSignedUrlExpiresSeconds(),
  });
}

export async function attachSignedUrlToFile(file) {
  const plainFile = file?.toJSON ? file.toJSON() : { ...file };
  const key = resolveObjectKey(plainFile);

  if (!key) {
    return { ...plainFile, signed_url: null };
  }

  try {
    const signed_url = await generateSignedUrlFromKey(key);
    return { ...plainFile, signed_url };
  } catch {
    return { ...plainFile, signed_url: null };
  }
}

export async function attachSignedUrlsToFiles(files = []) {
  return Promise.all(files.map((file) => attachSignedUrlToFile(file)));
}

export async function uploadCarpiFile(file, { fieldKey, section }) {
  const bucket = process.env.AWS_S3_BUCKET;
  if (!bucket) {
    return { error: true, message: "S3 bucket is not configured" };
  }
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_REGION) {
    return { error: true, message: "AWS credentials are not configured" };
  }

  const mimeType = file.mimetype || "application/octet-stream";
  const folder = resolveMediaFolder(mimeType, fieldKey);
  const maxBytes = getMaxBytesForFolder(folder);

  if (file.size > maxBytes) {
    return {
      error: true,
      message: `File too large. Maximum size for ${folder} is ${formatMaxSizeLabel(folder)}`,
    };
  }

  if (folder === "images" && !mimeType.startsWith("image/")) {
    return { error: true, message: "Only image files are allowed for this field" };
  }

  if (folder === "videos" && !mimeType.startsWith("video/")) {
    return { error: true, message: "Only video files are allowed for this field" };
  }

  const key = buildObjectKey(folder, fieldKey, file.originalname);
  const uploadParams = {
    Bucket: bucket,
    Key: key,
    Body: file.buffer,
    ContentType: mimeType,
  };

  if (process.env.AWS_S3_ACL) {
    uploadParams.ACL = process.env.AWS_S3_ACL;
  }

  await client.send(new PutObjectCommand(uploadParams));

  return {
    error: false,
    data: {
      url: buildPublicUrl(bucket, key),
      key,
      field_key: fieldKey,
      section: section || "supporting",
      original_name: file.originalname,
      mime_type: mimeType,
      size_bytes: file.size,
      folder,
    },
  };
}
