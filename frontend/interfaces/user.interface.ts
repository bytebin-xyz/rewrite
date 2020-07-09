export interface PartialUser {
  displayName: string;

  readonly createdAt: Date;
  readonly deleted: boolean;
  readonly uid: string;
}

export interface User extends PartialUser {
  email: string;

  readonly activated: boolean;
  readonly username: string;
}
