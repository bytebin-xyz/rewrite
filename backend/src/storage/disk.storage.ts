import crypto from "crypto";
import fs from "fs";
import path from "path";

import { Request } from "express";
import { StorageEngine } from "multer";

type HandleFileCallback = (error: Error | null, info?: Partial<DiskFile>) => void;
type RemoveFileCallback = (error: Error) => void;

export interface DiskFile extends Express.Multer.File {
  md5: string;
  uploadedAt: Date;
}

export interface DiskStorageOptions {
  directory: ((req: Request, file: Express.Multer.File) => Promise<string> | string) | string;
  filename: (req: Request, file: Express.Multer.File) => Promise<string> | string;
}

export class DiskStorage implements StorageEngine {
  constructor(private readonly options: DiskStorageOptions) {}

  async _handleFile(
    req: Request,
    file: Express.Multer.File,
    callback: HandleFileCallback
  ): Promise<void> {
    try {
      const [destination, filename] = await Promise.all([
        typeof this.options.directory === "string"
          ? this.options.directory
          : Promise.resolve(this.options.directory(req, file)),

        Promise.resolve(this.options.filename(req, file))
      ]);

      const finalDestination = path.join(destination, filename);

      await fs.promises.mkdir(destination, { recursive: true });

      const md5 = crypto.createHash("md5");
      const out = fs.createWriteStream(finalDestination);

      file.stream.pipe(out);
      file.stream.on("data", (chunk: Buffer) => md5.update(chunk));

      out.on("error", callback);
      out.on("finish", () => {
        callback(null, {
          destination,
          filename,
          md5: md5.digest("hex"),
          path: finalDestination,
          size: out.bytesWritten,
          uploadedAt: new Date()
        });
      });
    } catch (error) {
      callback(error);
    }
  }

  _removeFile(_: Request, file: Express.Multer.File, callback: RemoveFileCallback): void {
    const destination = file.path;

    delete file.destination;
    delete file.filename;
    delete file.path;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    fs.unlink(destination, callback);
  }
}
