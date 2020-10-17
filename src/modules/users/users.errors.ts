import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnprocessableEntityException
} from "@nestjs/common";

export class DisplayNameTaken extends ConflictException {
  constructor() {
    super("Display name is already in use!");
  }
}

export class EmailTaken extends ConflictException {
  constructor() {
    super("Email is already in use!");
  }
}

export class InvalidAvatarFileType extends UnprocessableEntityException {
  constructor() {
    super("Invalid file type! Avatar must be a JPEG or PNG!");
  }
}

export class InvalidEmailConfirmationToken extends BadRequestException {
  constructor() {
    super(
      "Invalid email confirmation token, please ensure that the link is correct!"
    );
  }
}

export class UsernameTaken extends ConflictException {
  constructor() {
    super("Username is already in use!");
  }
}

export class UserNotFound extends NotFoundException {
  constructor(query: string) {
    super(`User '${query}' does not exist!`);
  }
}
