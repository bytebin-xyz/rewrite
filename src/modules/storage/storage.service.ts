import * as os from "os";
import * as pump from "pump";

import * as Busboy from "busboy";

import { IncomingMessage } from "http";
import { Readable } from "stream";

import { Inject, Injectable, OnApplicationBootstrap } from "@nestjs/common";

import { STORAGE_MODULE_OPTIONS } from "./storage.constants";

import {
  FileTooLarge,
  NoFilesUploaded,
  TooManyFields,
  TooManyFiles,
  TooManyParts,
  UnsupportedContentType
} from "./storage.errors";

import { DiskStorage } from "./engines/disk.engine";
import { GoogleCloudEngine } from "./engines/google-cloud.engine";

import { IncomingFile } from "./interfaces/incoming-file.interface";
import { StorageEngine } from "./interfaces/storage-engine.interface";
import { StorageOptions } from "./interfaces/storage-module-options.interface";
import { UploadedFile } from "./interfaces/uploaded-file.interface";
import { WriteOptions } from "./interfaces/write-options.interface";

import { Counter } from "@/utils/counter";
import { StreamMeter } from "@/utils/stream-meter";

import { generateId } from "@/utils/generateId";
import { settle } from "@/utils/settle";

@Injectable()
export class StorageService implements OnApplicationBootstrap {
  constructor(@Inject(STORAGE_MODULE_OPTIONS) private readonly options: StorageOptions) {}

  private engine: StorageEngine = new DiskStorage({ directory: os.tmpdir() });

  onApplicationBootstrap(): void {
    const { disk, gcloud } = this.options.engine;

    if (disk) this.engine = new DiskStorage(disk);
    else if (gcloud) this.engine = new GoogleCloudEngine(gcloud);
  }

  async delete(id: string): Promise<void> {
    return this.engine.delete(id);
  }

  async read(id: string): Promise<Readable> {
    return this.engine.createReadable(id);
  }

  async write(req: IncomingMessage, options: WriteOptions): Promise<UploadedFile[]> {
    const busboy = this._createBusboy(req, options.limits);

    const filesDetected: string[] = [];
    const filesWritten: UploadedFile[] = [];

    const filter = (
      file: IncomingFile,
      callback: (error: Error | null, acceptFile: boolean) => void
    ) => {
      if (options.filter) options.filter(req, file, callback);
      else callback(null, true);
    };

    let aborting = false;
    let finished = false;

    return new Promise((resolve, reject) => {
      const writeCounter = new Counter();

      const abort = (error?: Error) => {
        if (aborting) return;

        aborting = true;

        if (!error) {
          // If the client cancelled the upload
          settle(filesDetected.map((id) => this.delete(id)))
            .then(() => resolve([]))
            .catch(reject);
        } else {
          // There was an error with writing or is a busboy error
          writeCounter.whenItEqualsTo(0, () => {
            settle(filesWritten.map((file) => this.delete(file.id)))
              .then(() => reject(error))
              .catch(reject);
          });
        }
      };

      const done = () => {
        if (!aborting && finished && writeCounter.is(0)) {
          if (!filesWritten.length) reject(new NoFilesUploaded());
          else resolve(filesWritten);
        }
      };

      busboy.on("file", (fieldname, readable, filename, encoding, mimetype) => {
        if (fieldname !== options.field || !filename) return readable.resume();

        const metadata = { encoding, fieldname, filename, mimetype };

        filter(metadata, async (error, accept) => {
          if (error) return abort(error);
          if (!accept) return readable.resume();

          writeCounter.increment();

          const id = await generateId(8);
          const writable = await this.engine.createWritable(id);

          const meter = new StreamMeter();
          const pipeline: pump.Stream[] = [readable, meter];

          if (options.transformers) {
            for (const transformer of options.transformers) {
              const stream = transformer(req, metadata);
              if (stream) pipeline.push(stream);
            }
          }

          filesDetected.push(id);
          pipeline.push(writable);

          readable.on("limit", () => abort(new FileTooLarge(filename)));

          pump(pipeline, (err?: Error) => {
            if (err) abort(err);

            filesWritten.push({ ...metadata, id, size: meter.size });

            writeCounter.decrement();

            done();
          });
        });
      });

      busboy
        .on("error", abort)
        .on("fieldsLimit", () => abort(new TooManyFields()))
        .on("filesLimit", () => abort(new TooManyFiles()))
        .on("partsLimit", () => abort(new TooManyParts()))
        .on("finish", () => {
          finished = true;
          done();
        });

      req.on("aborted", () => {
        busboy.end(); // release the files so that they will be deleted from filesystem
        abort();
      });

      req.pipe(busboy);
    });
  }

  private _createBusboy(
    req: IncomingMessage,
    limits: busboy.BusboyConfig["limits"]
  ): busboy.Busboy {
    try {
      return new Busboy({ headers: req.headers, limits });
    } catch (error) {
      throw new UnsupportedContentType();
    }
  }
}
