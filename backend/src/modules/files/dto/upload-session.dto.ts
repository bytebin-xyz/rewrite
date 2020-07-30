import { FileDto } from "./file.dto";

export class UploadSessionDto extends FileDto {
  chunkSize!: number;

  chunksTotal!: number;

  chunksUploaded!: number[];

  commitedAt!: Date | null;

  expiresAt!: Date;

  finished!: boolean;

  lastChunkSize!: number;
}
