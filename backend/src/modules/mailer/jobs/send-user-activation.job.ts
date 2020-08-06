import { SendEmailJob } from "../interfaces/send-email-job.interface";

export interface SendUserActivationJob extends SendEmailJob {
  activationLink: string;
}
