import { NotFoundException } from "@nestjs/common";

export class ApplicationNotFound extends NotFoundException {
  constructor(identifier: string) {
    super(`Application "${identifier}" does not exist!`);
  }
}
