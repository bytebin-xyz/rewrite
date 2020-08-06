import { SendEmailJob } from "../interfaces/send-email-job.interface";

export interface SendPasswordResetJob extends SendEmailJob {
  resetPasswordLink: string;
}
