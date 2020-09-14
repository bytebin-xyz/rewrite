import { ModuleMetadata, Type } from "@nestjs/common/interfaces";

import { MailerOptions } from "./mailer-module-options.interface";
import { MailerOptionsFactory } from "./mailer-module-options-factory";

export interface MailerModuleAsyncOptions extends Pick<ModuleMetadata, "imports"> {
  inject?: any[];
  useExisting?: Type<MailerOptionsFactory>;
  useClass?: Type<MailerOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<MailerOptions> | MailerOptions;
}
