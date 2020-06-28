import { Document } from "mongoose";

export interface EmailConfirmation extends Document {
  readonly created_at: Date;
  readonly new_email: string;
  readonly token: string;
  readonly uid: string;
}
