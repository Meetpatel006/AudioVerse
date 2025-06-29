import { BlobServiceClient, StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions, SASProtocol } from "@azure/storage-blob";
import { env } from "~/env";

const account = env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = env.AZURE_STORAGE_KEY;
const blobEndpoint = env.AZURE_BLOB_ENDPOINT;
const containerName = "works";

if (!account || !accountKey || !blobEndpoint) {
  throw new Error("Missing Azure Storage environment variables");
}

const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
const blobServiceClient = new BlobServiceClient(blobEndpoint, sharedKeyCredential);
const containerClient = blobServiceClient.getContainerClient(containerName);

/**
 * Get a presigned URL for a blob
 */
export async function getPresignedUrl({
  key,
  expiresIn = 3600,
}: {
  key: string;
  expiresIn?: number;
}): Promise<string> {
  const now = new Date();
  const expiresOn = new Date(now.getTime() + expiresIn * 1000);
  
  const sas = generateBlobSASQueryParameters({
    containerName,
    blobName: key,
    permissions: BlobSASPermissions.parse("r"),
    startsOn: now,
    expiresOn,
    protocol: SASProtocol.Https,
  }, sharedKeyCredential).toString();
  
  return `${containerClient.getBlockBlobClient(key).url}?${sas}`;
}

/**
 * Get an upload URL for a new blob
 */
export async function getUploadUrl(fileType: string): Promise<{
  uploadUrl: string;
  blobKey: string;
}> {
  // Only allow MP3 and WAV file types
  const allowedTypes = ["audio/mp3", "audio/wav"];
  if (!allowedTypes.includes(fileType)) {
    throw new Error("Only MP3 and WAV files are supported");
  }
  
  // Get file extension for better organization
  const extension = fileType === "audio/mpeg" || fileType === "audio/mp3" ? "mp3" : "wav";
  const blobKey = `seed-vc-audio-uploads/${crypto.randomUUID()}.${extension}`;
  const now = new Date();
  const expiresOn = new Date(now.getTime() + 3600 * 1000);
  
  const sas = generateBlobSASQueryParameters({
    containerName,
    blobName: blobKey,
    permissions: BlobSASPermissions.parse("cw"), // create and write
    startsOn: now,
    expiresOn,
    protocol: SASProtocol.Https,
    contentType: fileType,
  }, sharedKeyCredential).toString();
  
  const uploadUrl = `${containerClient.getBlockBlobClient(blobKey).url}?${sas}`;
  
  return {
    uploadUrl,
    blobKey,
  };
}

/**
 * Ensures the container exists. Creates it if it does not.
 */
export async function ensureContainer() {
  const exists = await containerClient.exists();
  if (!exists) {
    await containerClient.create();
    return true;
  }
  return false;
}

export { blobServiceClient, containerClient };