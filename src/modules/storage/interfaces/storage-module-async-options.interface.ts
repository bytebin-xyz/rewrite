import { ModuleMetadata, Type } from "@nestjs/common/interfaces";

import { StorageOptions } from "./storage-module-options.interface";
import { StorageOptionsFactory } from "./storage-module-options-factory.interface";

export interface AsyncStorageOptions extends Pick<ModuleMetadata, "imports"> {
  inject?: any[];
  useExisting?: Type<StorageOptionsFactory>;
  useClass?: Type<StorageOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<StorageOptions> | StorageOptions;
}
