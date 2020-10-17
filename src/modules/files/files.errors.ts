import * as path from "path";

import {
  ConflictException,
  ForbiddenException,
  HttpStatus,
  NotFoundException
} from "@nestjs/common";

import { File } from "./schemas/file.schema";

export class FileAlreadyExists extends ConflictException {
  static message = "A file already exists with this name at the current path!";
  static status = HttpStatus.CONFLICT;

  constructor(name: string, path?: string) {
    path
      ? super(`File '${name}' already exists at '${path}'!`)
      : super(`File '${name}' already exists!`);
  }

  static get description(): string {
    return `${FileAlreadyExists.name}: ${FileAlreadyExists.message}`;
  }
}

export class FileNotFound extends NotFoundException {
  static message = "The file you are looking for does not exist!";
  static status = HttpStatus.NOT_FOUND;

  constructor() {
    super(FileNotFound.message);
  }

  static get description(): string {
    return `${FileNotFound.name}: ${FileNotFound.message}`;
  }
}

export class InsufficientCapabilitiesOnFile extends ForbiddenException {
  static message = "The file cannot perform the requested action.";
  static status = HttpStatus.FORBIDDEN;

  constructor(action: keyof File["capabilities"]) {
    switch (action) {
      case "canAddChildren":
        super("This file cannot contain children!");
        break;

      case "canCopy":
        super("This file cannot be copied!");
        break;

      case "canDelete":
        super("This file cannot be deleted!");
        break;

      case "canDownload":
        super("This file cannot be downloaded!");
        break;

      case "canMove":
        super("This file cannot be moved!");
        break;

      case "canRemoveChildren":
        super("This file cannot remove childrens!");
        break;

      case "canRename":
        super("This file cannot be renamed!");
        break;

      case "canShare":
        super("This file cannot be shared!");
        break;
    }
  }

  static get description(): string {
    return `${InsufficientCapabilitiesOnFile.name}: ${InsufficientCapabilitiesOnFile.message}`;
  }
}

export class NoAccess extends ForbiddenException {
  static message = "You cannot access a file that is not shared with you!";
  static status = HttpStatus.FORBIDDEN;

  constructor() {
    super(NoAccess.message);
  }

  static get description(): string {
    return `${NoAccess.name}: ${NoAccess.message}`;
  }
}

export class ParentIsChildrenOfItself extends ForbiddenException {
  static message = "The parent of a file cannot be a subdirectory of itself!";
  static status = HttpStatus.FORBIDDEN;

  constructor(source: string, destination: string) {
    super(
      `The parent of '${source}' cannot be a subdirectory if itself, '${path.join(
        source,
        destination
      )}'`
    );
  }

  static get description(): string {
    return `${ParentIsChildrenOfItself.name}: ${ParentIsChildrenOfItself.message}`;
  }
}

export class ParentIsItself extends ForbiddenException {
  static message = "The parent of a file cannot be itself!";
  static status = HttpStatus.FORBIDDEN;

  constructor() {
    super(ParentIsItself.message);
  }

  static get description(): string {
    return `${ParentIsItself.name}: ${ParentIsItself.message}`;
  }
}

export class ParentNotFound extends NotFoundException {
  static message = "The parent you are looking for does not exist!";
  static status = HttpStatus.NOT_FOUND;

  constructor() {
    super(ParentNotFound.message);
  }

  static get description(): string {
    return `${ParentNotFound.name}: ${ParentNotFound.message}`;
  }
}
