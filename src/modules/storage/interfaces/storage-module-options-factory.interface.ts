import { StorageOptions } from "./storage-module-options.interface";

export interface StorageOptionsFactory {
  createStorageOptions(): Promise<StorageOptions> | StorageOptions;
}
