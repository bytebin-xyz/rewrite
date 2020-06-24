import { Document } from "mongoose";

export interface PasswordReset extends Document {
  readonly created_at: Date;
  readonly token: string;
  readonly uid: string;
}
