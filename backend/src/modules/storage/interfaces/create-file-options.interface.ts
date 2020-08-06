import { Request } from "express";
import { Stream } from "pump";

import { FileFilterCallback } from "./file-filter-callback.interface";
import { FileMetadata } from "./file-metadata.interface";

export interface CreateFileOptions {
  field: string;
  filter?: (req: Request, metadata: FileMetadata, callback: FileFilterCallback) => void;
  limits: busboy.BusboyConfig["limits"];
  transformers?: ((req: Request, metadata: FileMetadata) => Stream | void)[];
}
