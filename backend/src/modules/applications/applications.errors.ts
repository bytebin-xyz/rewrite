import { NotFoundException, UnauthorizedException, ConflictException } from "@nestjs/common";

export class ApplicationAlreadyExists extends ConflictException {
  constructor(name: string) {
    super(`Application "${name}" already exists on your account!`);
  }
}

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
