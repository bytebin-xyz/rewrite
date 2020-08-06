import nodemailer from "nodemailer";

import { Inject, Injectable, Logger, LoggerService, OnApplicationBootstrap } from "@nestjs/common";
import { OnQueueError, OnQueueFailed, OnQueueStalled, Process, Processor } from "@nestjs/bull";

import { Job } from "bull";

import { NODEMAILER_MODULE_OPTIONS } from "./mailer.constants";

import { EmailConfirmationEmail } from "./emails/confirm-email.email";
import { EmailChangedEmail } from "./emails/email-changed.email";
import { PasswordChangedEmail } from "./emails/password-changed.email";
import { PasswordResetEmail } from "./emails/password-reset.email";
import { UserActivationEmail } from "./emails/user.activation.email";

import { Email } from "./interfaces/email.interface";
import { MailerOptions } from "./interfaces/mailer-module-options.interface";
import { SendEmailJob } from "./interfaces/send-email-job.interface";

import { SendEmailChangedJob } from "./jobs/send-email-changed.job";
import { SendEmailConfirmationJob } from "./jobs/send-email-confirmation.job";
import { SendPasswordChangedJob } from "./jobs/send-password-changed.job";
import { SendPasswordResetJob } from "./jobs/send-password-reset.job";
import { SendUserActivationJob } from "./jobs/send-user-activation.job";

@Injectable()
@Processor("emails")
export class MailerProcessor implements OnApplicationBootstrap {
  private readonly transporter = nodemailer.createTransport(this.options, {
    from: `Bytebin <${this.options.from}>`
  });

  constructor(
    @Inject(Logger)
    private readonly logger: LoggerService,

    @Inject(NODEMAILER_MODULE_OPTIONS)
    private readonly options: MailerOptions
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.transporter.verify();
  }

  @OnQueueError()
  handleError(error: Error): void {
    this.logger.error(error);
  }

  @OnQueueFailed()
  handleFailure(job: Job): void {
    this._debug(`[Job ${job.id}] Job has failed to ${job.name} because ${job.failedReason}`);
  }

  @OnQueueStalled()
  handleStall(job: Job): void {
    this._debug(`[Job ${job.id}] Job stalled on ${job.name}`);
  }

  @Process("send-email-changed")
  async sendEmailChanged(job: Job<SendEmailChangedJob>): Promise<void> {
    await this._send(new EmailChangedEmail(job.data.forgotPasswordLink, job.data.displayName), job);
  }

  @Process("send-email-confirmation")
  async sendEmailConfirmation(job: Job<SendEmailConfirmationJob>): Promise<void> {
    await this._send(
      new EmailConfirmationEmail(job.data.confirmEmailLink, job.data.displayName),
      job
    );
  }

  @Process("send-password-changed")
  async sendPasswordChanged(job: Job<SendPasswordChangedJob>): Promise<void> {
    await this._send(
      new PasswordChangedEmail(job.data.forgotPasswordLink, job.data.displayName),
      job
    );
  }

  @Process("send-password-reset")
  async sendPasswordReset(job: Job<SendPasswordResetJob>): Promise<void> {
    await this._send(new PasswordResetEmail(job.data.resetPasswordLink, job.data.displayName), job);
  }

  @Process("send-user-activation")
  async sendUserActivation(job: Job<SendUserActivationJob>): Promise<void> {
    await this._send(new UserActivationEmail(job.data.activationLink, job.data.displayName), job);
  }

  private _debug(message: string) {
    this.logger.debug && this.logger.debug(message, MailerProcessor.name);
  }

  private async _send(email: Email, job: Job<SendEmailJob>) {
    this._debug(`[Job ${job.id}] Starting job "${job.name}" for ${job.data.to}`);

    await this.transporter.sendMail({
      html: await email.html(),
      subject: email.subject(),
      text: email.text(),
      to: job.data.to
    });

    await job.progress(100);

    this._debug(`[Job ${job.id}] Successfully completed "${job.name}" for ${job.data.to}`);
  }
}
