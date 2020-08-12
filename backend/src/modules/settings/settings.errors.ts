import { BadRequestException } from "@nestjs/common";

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
