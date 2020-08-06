import { FileMetadata } from "./file-metadata.interface";

export interface UploadedFile extends FileMetadata {
  id: string;
  size: number;
}