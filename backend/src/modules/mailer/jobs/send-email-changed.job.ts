import { SendEmailJob } from "../interfaces/send-email-job.interface";

export interface SendEmailChangedJob extends SendEmailJob {
  forgotPasswordLink: string;
}
