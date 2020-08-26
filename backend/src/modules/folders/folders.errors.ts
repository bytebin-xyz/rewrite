import { ConflictException, ForbiddenException, NotFoundException } from "@nestjs/common";

export class FolderAlreadyExists extends ConflictException {
  constructor(name: string) {
    super(`Folder "${name}" already exists!`);
  }
}
export class FolderNotFound extends NotFoundException {
  constructor() {
    super("Folder does not exist!");
  }
}

export class ParentFolderIsChildrenOfItself extends ForbiddenException {
  constructor() {
    super("The parent of a folder cannot be a children of itself!");
  }
}

export class ParentFolderIsItself extends ForbiddenException {
  constructor() {
    super("The parent of a folder cannot be itself!");
  }
}

export class ParentFolderNotFound extends NotFoundException {
  constructor() {
    super("Parent folder does not exist!");
  }
}
