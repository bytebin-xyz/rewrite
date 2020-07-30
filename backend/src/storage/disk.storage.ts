import fs from "fs";
import path from "path";
import pump from "pump";

import { Request } from "express";
import { StorageEngine } from "multer";

import { calculateMD5 } from "@/utils/calculateMD5";

type HandleFileCallback = (error: Error | null, info?: Partial<DiskFile>) => void;
type RemoveFileCallback = (error: any) => void;

export type IncomingFile = Pick<
  Express.Multer.File,
  "encoding" | "fieldname" | "mimetype" | "originalname" | "stream"
>;

export interface DiskFile extends Express.Multer.File {
  md5: string;
  modifiedMD5: string | null;
  uploadedAt: Date;
}

export interface DiskStorageOptions {
  directory:
    | ((req: Request, file: IncomingFile, filename: string) => Promise<string> | string)
    | string;
  filename: (req: Request, file: IncomingFile) => Promise<string> | string;
  transformers?: ((req: Request, file: IncomingFile, filename: string) => pump.Stream)[];
}

export class DiskStorage implements StorageEngine {
  private readonly transformers = this.options.transformers || [];

  constructor(private readonly options: DiskStorageOptions) {}

  async _handleFile(req: Request, file: IncomingFile, callback: HandleFileCallback): Promise<void> {
    try {
      const filename = await Promise.resolve(this.options.filename(req, file));
      const destination =
        typeof this.options.directory === "string"
          ? this.options.directory
          : await this.options.directory(req, file, filename);

      await fs.promises.mkdir(destination, { recursive: true });

      const finalDestination = path.join(destination, filename);

      const modifiedMD5 = this.transformers.length ? calculateMD5.createPassthrough() : null;
      const originalMD5 = calculateMD5.createPassthrough();

      const output = fs.createWriteStream(finalDestination);

      // Construct a pipeline where the order should be [input, md5, ...transformers, modified md5, output]
      const pipeline: pump.Stream[] = [file.stream, originalMD5.passthrough];

      if (modifiedMD5) {
        pipeline.push(...this.transformers.map(transform => transform(req, file, filename)));
        pipeline.push(modifiedMD5.passthrough);
      }

      pipeline.push(output);

      pump(pipeline, (error?: Error) => {
        callback(error || null, {
          destination,
          filename,
          md5: originalMD5.hash.digest("hex"),
          modifiedMD5: modifiedMD5 ? modifiedMD5.hash.digest("hex") : null,
          path: finalDestination,
          size: output.bytesWritten,
          uploadedAt: new Date()
        });
      });
    } catch (error) {
      callback(error);
    }
  }

  _removeFile(_req: Request, file: Express.Multer.File, callback: RemoveFileCallback): void {
    const destination = file.path;

    delete file.destination;
    delete file.filename;
    delete file.path;

    fs.unlink(destination, callback);
  }
}

export const diskStorage = (options: DiskStorageOptions): DiskStorage => new DiskStorage(options);
