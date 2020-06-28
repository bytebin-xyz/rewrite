import { TransporterOptions } from "./transporter-options.interface";

export interface TransporterOptionsFactory {
  createTransporterOptions(): Promise<TransporterOptions> | TransporterOptions;
}
