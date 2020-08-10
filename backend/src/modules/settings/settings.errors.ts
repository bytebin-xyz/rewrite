import { BadRequestException, UnprocessableEntityException } from "@nestjs/common";

export class InvalidAvatarFileType extends UnprocessableEntityException {
  constructor() {
    super("Invalid file type! Avatars must be a JPEG or PNG!");
  }
}

export class InvalidEmailConfirmationLink extends BadRequestException {
  constructor() {
    super("Invalid email confirmation link, please ensure that the link is correct!");
  }
}

export class InvalidUserActivationLink extends BadRequestException {
  constructor() {
    super("Invalid user activation link, please ensure that the link is correct!");
  }
}
