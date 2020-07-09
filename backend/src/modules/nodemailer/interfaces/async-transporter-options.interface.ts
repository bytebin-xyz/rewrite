import { ModuleMetadata, Type } from "@nestjs/common/interfaces";

import { TransporterOptions } from "./transporter-options.interface";
import { TransporterOptionsFactory } from "./transporter-options-factory.interface";

export interface AsyncTransporterOptions extends Pick<ModuleMetadata, "imports"> {
  inject?: any[];
  useExisting?: Type<TransporterOptionsFactory>;
  useClass?: Type<TransporterOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<TransporterOptions> | TransporterOptions;
}
