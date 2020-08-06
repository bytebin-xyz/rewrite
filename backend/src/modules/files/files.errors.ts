import { ConflictException, ForbiddenException, NotFoundException } from "@nestjs/common";

export class ChunkAlreadyUploaded extends ConflictException {
  constructor(chunkIndex: number) {
    super(`Chunk index ${chunkIndex} has already been uploaded to the server!`);
  }
}

export class FileNotFound extends NotFoundException {
  constructor(identifier: string) {
    super(`File "${identifier}" was not found on the server!`);
  }
}

export class MaxActiveUploadSessionsError extends ForbiddenException {
  constructor() {
    super(
      "You have exceeded the maximum amount of active upload sessions. Please commit or destroy your existing upload sessions first before creating a new one!"
    );
  }
}

export class UploadSessionNotFound extends NotFoundException {
  constructor(id: string) {
    super(`Upload session "${id}" does not exists!`);
  }
}
