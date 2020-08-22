import { ConflictException, NotFoundException } from "@nestjs/common";

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

export class ParentFolderNotFound extends NotFoundException {
  constructor() {
    super("Parent folder does not exist!");
  }
}
