import { SendEmailJob } from "../interfaces/send-email-job.interface";

export interface SendEmailConfirmationJob extends SendEmailJob {
  confirmEmailLink: string;
}
