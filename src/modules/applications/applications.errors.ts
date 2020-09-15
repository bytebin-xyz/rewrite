import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException
} from "@nestjs/common";

export class ApplicationAlreadyExists extends ConflictException {
  constructor(name: string) {
    super(`Application '${name}' already exists on your account!`);
  }
}
export class ApplicationNotFound extends NotFoundException {
  constructor() {
    super("Application does not exist!");
  }
}

export class InsufficientScopes extends ForbiddenException {
  constructor() {
    super("Application does not have sufficient scopes to perform this action!");
  }
}

export class InvalidApplicationKey extends UnauthorizedException {
  constructor() {
    super("Invalid application key!");
  }
}

export class TooManyApplications extends ForbiddenException {
  constructor() {
    super("You have exceeded the maximum amount of applications allowed!");
  }
}
