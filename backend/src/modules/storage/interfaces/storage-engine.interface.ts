import { Readable, Writable } from "stream";

export interface StorageEngine {
  createReadable(id: string): Promise<Readable> | Readable;
  createWritable(id: string): Promise<Writable> | Writable;
  delete(id: string): Promise<void> | void;
}
