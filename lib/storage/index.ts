// lib/storage/index.ts — storage factory.
// Returns null when no backend is configured, so callers can degrade gracefully
// (e.g. skip persisting prints) without failing the run.

import { S3ApiStorage } from "@/lib/storage/s3-api";
import { type Storage } from "@/lib/storage/types";
import { VercelBlobStorage } from "@/lib/storage/vercel-blob";

export type { Storage, UploadOptions } from "@/lib/storage/types";
export { StorageError } from "@/lib/storage/types";

export function getStorage(): Storage | null {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return new VercelBlobStorage(process.env.STORAGE_BUCKET ?? "");
  }

  const baseUrl = process.env.STORAGE_API_URL;
  if (!baseUrl) return null;

  return new S3ApiStorage(
    baseUrl.replace(/\/$/, ""),
    process.env.STORAGE_BUCKET ?? "",
  );
}
