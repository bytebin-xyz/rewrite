import {
  ConflictException,
  ForbiddenException,
  HttpStatus,
  NotFoundException
} from "@nestjs/common";

export class EntryAlreadyExists extends ConflictException {
  static message = `${EntryAlreadyExists.name}: There is already an entry with this name at the current path!`;
  static status = HttpStatus.CONFLICT;

  constructor(name: string, path?: string) {
    path
      ? super(`${EntryAlreadyExists.name}: Entry '${name}' already exists at '${path}'!`)
      : super(`${EntryAlreadyExists.name}: Entry '${name}' already exists!`);
  }
}

export class EntryNotDeletable extends ForbiddenException {
  static message = `${EntryNotDeletable.name}: This entry cannot be deleted!`;
  static status = HttpStatus.FORBIDDEN;

  constructor() {
    super(EntryNotDeletable.message);
  }
}

export class EntryNotFound extends NotFoundException {
  static message = `${EntryNotFound.name}: The entry you are looking for does not exist!`;
  static status = HttpStatus.NOT_FOUND;

  constructor() {
    super(EntryNotFound.message);
  }
}

export class ParentFolderNotFound extends NotFoundException {
  static message = `${ParentFolderNotFound.name}: The parent folder does not exist!`;
  static status = HttpStatus.NOT_FOUND;

  constructor() {
    super(ParentFolderNotFound.message);
  }
}

export class ParentIsChildrenOfItself extends ForbiddenException {
  static message = `${ParentIsChildrenOfItself.name}: The parent of an entry cannot be a children of itself!`;
  static status = HttpStatus.FORBIDDEN;

  constructor() {
    super(ParentIsChildrenOfItself.message);
  }
}

export class ParentIsItself extends ForbiddenException {
  static message = `${ParentIsItself.name}: The parent of an entry cannot be itself!`;
  static status = HttpStatus.FORBIDDEN;

  constructor() {
    super(ParentIsItself.message);
  }
}
