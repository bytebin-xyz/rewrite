import { NotFoundException, ConflictException } from "@nestjs/common";

export class EmailAlreadyExists extends ConflictException {
  constructor(email: string) {
    super(`Email ${email} already exists!`);
  }
}

export class UsernameAlreadyExists extends ConflictException {
  constructor(username: string) {
    super(`Username ${username} already exists!`);
  }
}

export class UserNotFound extends NotFoundException {
  constructor(username: string) {
    super(`User "${username}" does not exists!`);
  }
}
