// lib/storage/types.ts — file storage abstraction.
// Decouples the app from any concrete storage backend; the current backend is the
// internal S3 API (lib/storage/s3-api.ts), but callers depend only on `Storage`.

export interface UploadOptions {
  /** Target bucket; backend may have its own default. */
  bucket?: string;
  /** Suggested filename for the stored object. */
  filename?: string;
  /** MIME type, when not inferable from the data. */
  contentType?: string;
}

export interface Storage {
  /** Uploads a binary blob and returns its URL/identifier. */
  upload(data: Blob, opts?: UploadOptions): Promise<string>;
  /** Uploads a `data:` URL (decodes base64 first) and returns its URL/identifier. */
  uploadDataUrl(dataUrl: string, opts?: UploadOptions): Promise<string>;
}

export class StorageError extends Error {}
