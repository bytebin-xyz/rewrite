import { Document } from "mongoose";

export interface PartialUser extends Document {
  readonly deleted: boolean;
  readonly display_name: string;
  readonly created_at: Date;
  readonly uid: string;
}

export interface User extends PartialUser {
  readonly activated: boolean;
  readonly email: string;
  readonly username: string;

  activate(): Promise<void>;
  changeDisplayName(newDisplayName: string): Promise<void>;
  changeEmail(newEmail: string): Promise<void>;
  changePassword(newPassword: string): Promise<void>;
  comparePassword(password: string): Promise<boolean>;
  delete(): Promise<void>;
}
