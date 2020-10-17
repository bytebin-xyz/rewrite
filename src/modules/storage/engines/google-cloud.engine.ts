/**
 ** Credentials are pulled from environment variables
 ** https://cloud.google.com/docs/authentication/production#passing_variable
 */

import { Readable, Writable } from "stream";

import { Storage, StorageOptions } from "@google-cloud/storage";

import { StorageEngine } from "../interfaces/storage-engine.interface";

import { generateId } from "@/utils/generateId";

const client = new Storage();

export interface GoogleCloudEngineOptions extends StorageOptions {
  bucketName: string;
}

export class GoogleCloudEngine implements StorageEngine {
  constructor(private readonly options: GoogleCloudEngineOptions) {}

  private readonly bucket = client.bucket(this.options.bucketName);

  createIdentifier(): Promise<string> {
    return generateId(8);
  }

  createReadable(id: string): Readable {
    return this.bucket.file(id).createReadStream();
  }

  createWritable(id: string): Writable {
    return this.bucket.file(id).createWriteStream();
  }

  async delete(id: string): Promise<void> {
    await this.bucket.file(id).delete();
  }
}
