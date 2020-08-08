import { NotFoundException, UnauthorizedException } from "@nestjs/common";

export class ApplicationNotFound extends NotFoundException {
  constructor(identifier: string) {
    super(`Application "${identifier}" does not exist!`);
  }
}

export class InvalidAPIKey extends UnauthorizedException {
  constructor() {
    super("Invalid API Key!");
  }
}
