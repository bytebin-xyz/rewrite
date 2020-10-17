import { FileDto } from "./file.dto";

export interface UploadedFilesDto {
  failed: Array<{
    error: string;
    file: {
      mimetype: string;
      name: string;
      size: number;
    };
  }>;

  succeeded: FileDto[];
}
