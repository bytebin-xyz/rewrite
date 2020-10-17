import * as ejs from "ejs";
import * as fs from "fs";

import mjml2html = require("mjml");

import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";

import { Queue } from "bull";

import { SendMailOptions } from "./interfaces/send-mail-options.interface";

import { config } from "@/config";

@Injectable()
export class MailerService {
  constructor(
    @InjectQueue("mailer")
    private readonly mailerQueue: Queue
  ) {}

  createAbsoluteLink(relativeLink: string): string {
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const root = `${protocol}://${config.get("domains").frontend}/`;

    return root + relativeLink.substring(relativeLink.startsWith("/") ? 1 : 0);
  }

  async render(
    template: fs.PathLike,
    data: Record<string, unknown>
  ): Promise<string> {
    const mjml = await fs.promises
      .readFile(template)
      .then((buffer) => buffer.toString());

    return ejs.render(this.transpileMJML(mjml), data, { async: true });
  }

  async send(options: SendMailOptions): Promise<void> {
    options.html = options.mjml
      ? await this.render(options.mjml.template, options.mjml.data || {})
      : options.html;

    await this.mailerQueue.add("send", options);
  }

  transpileMJML(mjml: string): string {
    const { errors, html } = mjml2html(mjml, {
      keepComments: false,
      validationLevel: "strict"
    });

    if (errors && errors.length) throw new Error(errors.join("\n"));

    return html;
  }
}
