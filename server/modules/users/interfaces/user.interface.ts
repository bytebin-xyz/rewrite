import { Document } from "mongoose";

export interface PartialUser extends Document {
  readonly display_name: string;
  readonly created_at: Date;
  readonly uid: string;
  readonly username: string;
}

export interface User extends PartialUser {
  readonly activated: boolean;
  readonly email: string;

  activate(): Promise<void>;
  changeEmail(newEmail: string): Promise<void>;
  changePassword(hashedPassword: string): Promise<void>;
  comparePassword(password: string): Promise<boolean>;
}
