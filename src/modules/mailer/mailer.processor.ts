import nodemailer from "nodemailer";

import { Inject, Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { Process, Processor } from "@nestjs/bull";

import { Job } from "bull";

import { NODEMAILER_MODULE_OPTIONS } from "./mailer.constants";

import { MailerOptions } from "./interfaces/mailer-module-options.interface";
import { SendMailOptions } from "./interfaces/send-mail-options.interface";

@Injectable()
@Processor("emails")
export class MailerProcessor implements OnApplicationBootstrap {
  private readonly transporter = nodemailer.createTransport(this.options, {
    from: `Bytebin <${this.options.from}>`
  });

  constructor(@Inject(NODEMAILER_MODULE_OPTIONS) private readonly options: MailerOptions) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.transporter.verify();
  }

  @Process("send")
  async send(job: Job<SendMailOptions>): Promise<void> {
    await this.transporter.sendMail(job.data);
    await job.progress(100);
  }
}
