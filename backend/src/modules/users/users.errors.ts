import { NotFoundException, ConflictException } from "@nestjs/common";

export class DisplayNameAlreadyExists extends ConflictException {
  constructor(displayName: string) {
    super(`Display name "${displayName}" already exists!`);
  }
}

export class EmailAlreadyExists extends ConflictException {
  constructor(email: string) {
    super(`Email "${email}" already exists!`);
  }
}

export class UsernameAlreadyExists extends ConflictException {
  constructor(username: string) {
    super(`Username "${username}" already exist!`);
  }
}

export class UserNotFound extends NotFoundException {
  constructor(username: string) {
    super(`User "${username}" does not exist!`);
  }
}
