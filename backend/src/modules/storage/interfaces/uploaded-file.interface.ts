import { IncomingFile } from "./incoming-file.interface";

export interface UploadedFile extends IncomingFile {
  id: string;
  size: number;
}