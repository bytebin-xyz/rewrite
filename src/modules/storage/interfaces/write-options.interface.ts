import { IncomingMessage } from "http";
import { Stream } from "pump";

import { IncomingFile } from "./incoming-file.interface";

export interface WriteOptions {
  field: string;

  filter?: (
    req: IncomingMessage,
    file: IncomingFile,
    callback: {
      (error: Error, acceptFile: false): void;
      (error: null, acceptFile: boolean): void;
    }
  ) => void;

  limits: busboy.BusboyConfig["limits"];

  transformers?: ((
    req: IncomingMessage,
    file: IncomingFile
  ) => Stream | void)[];
}
