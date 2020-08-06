import { SendEmailJob } from "../interfaces/send-email-job.interface";

export interface SendPasswordChangedJob extends SendEmailJob {
  forgotPasswordLink: string;
}
