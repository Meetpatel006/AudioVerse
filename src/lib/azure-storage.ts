import { BlobServiceClient, StorageSharedKeyCredential } from "@azure/storage-blob";
import { env } from "~/env";

const account = env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = env.AZURE_STORAGE_KEY;
const blobEndpoint = env.AZURE_BLOB_ENDPOINT;

if (!account || !accountKey || !blobEndpoint) {
  throw new Error("Missing Azure Storage environment variables");
}

const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
const blobServiceClient = new BlobServiceClient(
  blobEndpoint,
  sharedKeyCredential
);

/**
 * Ensures the 'works' container exists. Creates it if it does not.
 */
export async function ensureWorksContainer() {
  const containerName = "works";
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const exists = await containerClient.exists();
  if (!exists) {
    await containerClient.create();
    return true;
  }
  return false;
}

export { blobServiceClient }; 