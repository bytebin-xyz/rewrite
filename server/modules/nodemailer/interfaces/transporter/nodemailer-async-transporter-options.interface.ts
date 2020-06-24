import { ModuleMetadata, Type } from "@nestjs/common/interfaces";

import { NodemailerTransporterOptions } from "./nodemailer-transporter-options.interface";
import { NodemailerTransporterOptionsFactory } from "./nodemailer-transporter-options-factory.interface";

export interface NodemailerAsyncTransporterOptions extends Pick<ModuleMetadata, "imports"> {
  inject?: any[];
  useExisting?: Type<NodemailerTransporterOptionsFactory>;
  useClass?: Type<NodemailerTransporterOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<NodemailerTransporterOptions> | NodemailerTransporterOptions;
}
