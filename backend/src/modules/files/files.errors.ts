import { ConflictException, ForbiddenException, NotFoundException } from "@nestjs/common";

export class EntryAlreadyExists extends ConflictException {
  constructor(name: string) {
    super(`Entry "${name}" already exists!`);
  }
}

export class EntryNotDeletable extends ForbiddenException {
  constructor() {
    super("This entry cannot be deleted!");
  }
}

export class EntryNotFound extends NotFoundException {
  constructor() {
    super("Entry does not exist!");
  }
}

export class ParentIsChildrenOfItself extends ForbiddenException {
  constructor() {
    super("The parent of an entry cannot be a children of itself!");
  }
}

export class ParentIsItself extends ForbiddenException {
  constructor() {
    super("The parent of an entry cannot be itself!");
  }
}

export class ParentDirectoryNotFound extends NotFoundException {
  constructor() {
    super("Parent directory does not exist!");
  }
}