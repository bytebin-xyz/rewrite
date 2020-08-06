import { BadRequestException, PayloadTooLargeException, UnsupportedMediaTypeException } from "@nestjs/common";

export class FileTooLarge extends PayloadTooLargeException {
  constructor(filename: string) {
    super(`File "${filename}" is too large!`);
  }
}

export class NoFilesUploaded extends BadRequestException {
  constructor() {
    super("No files uploaded!");
  }
}

export class TooManyFields extends BadRequestException {
  constructor() {
    super("Too many fields!");
  }
}

export class TooManyFiles extends BadRequestException {
  constructor() {
    super("Too many files!");
  }
}

export class TooManyParts extends BadRequestException {
  constructor() {
    super("Too many parts!");
  }
}

export class UnsupportedContentType extends UnsupportedMediaTypeException {
  constructor() {
    super("Missing or unsupported content type!")
  }
}