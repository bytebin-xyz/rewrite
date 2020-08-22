import { ConflictException, ForbiddenException, NotFoundException } from "@nestjs/common";

export class ChunkAlreadyUploaded extends ConflictException {
  constructor(chunkIndex: number) {
    super(`Chunk index ${chunkIndex} has already been uploaded to the server!`);
  }
}

export class FileNotDeletable extends ForbiddenException {
  constructor() {
    super("This file is crucial and cannot be deleted!");
  }
}

export class FileNotFound extends NotFoundException {
  constructor() {
    super("File does not exists!");
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
