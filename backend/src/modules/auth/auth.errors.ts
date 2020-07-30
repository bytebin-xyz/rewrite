import { BadRequestException, ForbiddenException, UnauthorizedException } from "@nestjs/common";

export class InvalidCredentials extends UnauthorizedException {
  constructor() {
    super("Invalid login credentials!");
  }
}

export class InvalidPasswordResetLink extends BadRequestException {
  constructor() {
    super("Invalid password reset link, please ensure that the link is correct!");
  }
}

export class UserNotActivated extends ForbiddenException {
  constructor() {
    super("Please activate your account first!");
  }
}

export class UserNotLoggedIn extends UnauthorizedException {
  constructor() {
    super("You are not logged in!");
  }
}
