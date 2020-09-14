/**
 ** Credentials are pulled from environment variables
 ** https://cloud.google.com/docs/authentication/production#passing_variable
 */

import { Readable, Writable } from "stream";

import { Storage, StorageOptions } from "@google-cloud/storage";

import { StorageEngine } from "../interfaces/storage-engine.interface";

const client = new Storage();

export interface GoogleCloudEngineOptions extends StorageOptions {
  bucketName: string;
}

export class GoogleCloudEngine implements StorageEngine {
  constructor(private readonly options: GoogleCloudEngineOptions) {}

  private readonly bucket = client.bucket(this.options.bucketName);

  async delete(id: string): Promise<void> {
    await this.bucket.file(id).delete();
  }

  createReadable(id: string): Readable {
    return this.bucket.file(id).createReadStream();
  }

  createWritable(id: string): Writable {
    return this.bucket.file(id).createWriteStream();
  }
}
