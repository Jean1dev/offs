// lib/storage/s3-api.ts — Storage backed by the internal S3 API.
//
//   POST {baseUrl}/v1/s3?bucket={bucket}   (multipart/form-data, field "file")
//   → 200 OK with the file URL/identifier as plain text.

import { dataUrlToBlob } from "@/lib/storage/data-url";
import { type Storage, type UploadOptions, StorageError } from "@/lib/storage/types";

export class S3ApiStorage implements Storage {
  constructor(
    private readonly baseUrl: string,
    private readonly defaultBucket: string,
  ) {}

  async upload(data: Blob, opts: UploadOptions = {}): Promise<string> {
    const form = new FormData();
    form.append("file", data, opts.filename ?? "upload");

    const bucket = opts.bucket ?? this.defaultBucket;
    const query = bucket ? `?bucket=${encodeURIComponent(bucket)}` : "";

    const res = await fetch(`${this.baseUrl}/v1/s3${query}`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) {
      throw new StorageError(`Upload falhou (HTTP ${res.status}).`);
    }
    return (await res.text()).trim();
  }

  async uploadDataUrl(dataUrl: string, opts: UploadOptions = {}): Promise<string> {
    const blob = dataUrlToBlob(dataUrl);
    return this.upload(blob, { contentType: blob.type, ...opts });
  }
}
