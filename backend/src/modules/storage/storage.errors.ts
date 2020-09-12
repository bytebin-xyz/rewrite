import {
  BadRequestException,
  HttpStatus,
  PayloadTooLargeException,
  UnsupportedMediaTypeException
} from "@nestjs/common";

export class FileTooLarge extends PayloadTooLargeException {
  static message = `${FileTooLarge.name}: The file you tried to upload is too large!`;
  static status = HttpStatus.PAYLOAD_TOO_LARGE;

  constructor(filename: string) {
    super(`${FileTooLarge.name}: File '${filename}' is too large!`);
  }
}

export class NoFilesUploaded extends BadRequestException {
  static message = `${NoFilesUploaded.name}: No files were uploaded!`;
  static status = HttpStatus.BAD_REQUEST;

  constructor() {
    super(NoFilesUploaded.message);
  }
}

export class TooManyFields extends BadRequestException {
  static message = `${TooManyFields.name}: There were too many fields associated with your form!`;
  static status = HttpStatus.BAD_REQUEST;

  constructor() {
    super(TooManyFields.message);
  }
}

export class TooManyFiles extends BadRequestException {
  static message = `${TooManyFiles.name}: The amount of files you attempted to upload exceeded the limit!`;
  static status = HttpStatus.BAD_REQUEST;

  constructor() {
    super(TooManyFiles.message);
  }
}

export class TooManyParts extends BadRequestException {
  static message = `${TooManyParts.name}: Too many parts!`;
  static status = HttpStatus.BAD_REQUEST;

  constructor() {
    super(TooManyParts.name);
  }
}

export class UnsupportedContentType extends UnsupportedMediaTypeException {
  static message = `${UnsupportedContentType.name}: Missing or unsupported content type!`;
  static status = HttpStatus.UNSUPPORTED_MEDIA_TYPE;

  constructor() {
    super(UnsupportedContentType.message);
  }
}
