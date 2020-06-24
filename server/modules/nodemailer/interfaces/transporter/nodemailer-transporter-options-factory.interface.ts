import { NodemailerTransporterOptions } from "./nodemailer-transporter-options.interface";

export interface NodemailerTransporterOptionsFactory {
  createNodemailerTransporterOptions():
    | Promise<NodemailerTransporterOptions>
    | NodemailerTransporterOptions;
}
