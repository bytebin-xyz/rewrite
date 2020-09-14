import {
  ConflictException,
  ForbiddenException,
  HttpStatus,
  NotFoundException
} from "@nestjs/common";

export class EntryAlreadyExists extends ConflictException {
  static message = "There is already an entry with this name at the current path!";
  static status = HttpStatus.CONFLICT;

  constructor(name: string, path?: string) {
    path
      ? super(`Entry '${name}' already exists at '${path}'!`)
      : super(`Entry '${name}' already exists!`);
  }

  static get description(): string {
    return `${EntryAlreadyExists.name}: ${EntryAlreadyExists.message}`;
  }
}

export class EntryNotDeletable extends ForbiddenException {
  static message = "This entry cannot be deleted!";
  static status = HttpStatus.FORBIDDEN;

  constructor() {
    super(EntryNotDeletable.message);
  }

  static get description(): string {
    return `${EntryNotDeletable.name}: ${EntryNotDeletable.message}`;
  }
}

export class EntryNotFound extends NotFoundException {
  static message = "The entry you are looking for does not exist!";
  static status = HttpStatus.NOT_FOUND;

  constructor() {
    super(EntryNotFound.message);
  }

  static get description(): string {
    return `${EntryNotFound.name}: ${EntryNotFound.message}`;
  }
}

export class ParentFolderNotFound extends NotFoundException {
  static message = "The parent folder does not exist!";
  static status = HttpStatus.NOT_FOUND;

  constructor() {
    super(ParentFolderNotFound.message);
  }

  static get description(): string {
    return `${ParentFolderNotFound.name}: ${ParentFolderNotFound.message}`;
  }
}

export class ParentIsChildrenOfItself extends ForbiddenException {
  static message = "The parent of an entry cannot be a children of itself!";
  static status = HttpStatus.FORBIDDEN;

  constructor() {
    super(ParentIsChildrenOfItself.message);
  }

  static get description(): string {
    return `${ParentIsChildrenOfItself.name}: ${ParentIsChildrenOfItself.message}`;
  }
}

export class ParentIsItself extends ForbiddenException {
  static message = "The parent of an entry cannot be itself!";
  static status = HttpStatus.FORBIDDEN;

  constructor() {
    super(ParentIsItself.message);
  }

  static get description(): string {
    return `${ParentIsItself.name}: ${ParentIsItself.message}`;
  }
}
