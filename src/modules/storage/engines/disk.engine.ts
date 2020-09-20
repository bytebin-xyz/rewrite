import * as fs from "fs";
import * as path from "path";

import { Readable, Writable } from "stream";

import { StorageEngine } from "../interfaces/storage-engine.interface";

import { chunk } from "@/utils/chunk";

export interface DiskStorageEngineOptions {
  directory: string;
}

export class DiskStorage implements StorageEngine {
  constructor(private readonly options: DiskStorageEngineOptions) {
    if (!path.isAbsolute(options.directory)) {
      throw new Error("Directory for disk storage must be absolute!");
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await fs.promises.unlink(this._getLocationOnDisk(id));
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
  }

  createReadable(id: string): Readable {
    return fs.createReadStream(this._getLocationOnDisk(id));
  }

  async createWritable(id: string): Promise<Writable> {
    await fs.promises.mkdir(this._getDestinationOnDisk(id), { recursive: true });
    return fs.createWriteStream(this._getLocationOnDisk(id));
  }

  private _getDestinationOnDisk(id: string) {
    return path.join(this.options.directory, chunk.string(id.slice(0, -1), 2).join(path.sep));
  }

  private _getLocationOnDisk(id: string) {
    return path.join(this._getDestinationOnDisk(id), id);
  }
}
