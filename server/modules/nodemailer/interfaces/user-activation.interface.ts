import { Document } from "mongoose";

export interface UserActivation extends Document {
  readonly created_at: Date;
  readonly resendAttemptsExceeded: boolean;
  readonly times_resent: number;
  readonly token: string;
  readonly uid: string;

  resent(): Promise<void>;
}
