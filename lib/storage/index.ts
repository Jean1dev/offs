// lib/storage/index.ts — storage factory.
// Returns null when no backend is configured (STORAGE_API_URL unset), so callers
// can degrade gracefully (e.g. skip persisting prints) without failing the run.

import { S3ApiStorage } from "@/lib/storage/s3-api";
import { type Storage } from "@/lib/storage/types";

export type { Storage, UploadOptions } from "@/lib/storage/types";
export { StorageError } from "@/lib/storage/types";

export function getStorage(): Storage | null {
  const baseUrl = process.env.STORAGE_API_URL;
  if (!baseUrl) return null;
  return new S3ApiStorage(
    baseUrl.replace(/\/$/, ""),
    process.env.STORAGE_BUCKET ?? "",
  );
}
