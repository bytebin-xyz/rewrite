import { DiskStorageEngineOptions } from "../engines/disk.engine";
import { GoogleCloudEngineOptions } from "../engines/google-cloud.engine";

export interface StorageOptions {
  engine: {
    disk?: DiskStorageEngineOptions;
    gcloud?: GoogleCloudEngineOptions;
  };
}
