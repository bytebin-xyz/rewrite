import { DynamicModule, Module, Provider } from "@nestjs/common";

import { STORAGE_MODULE_ID, STORAGE_MODULE_OPTIONS } from "./storage.constants";

import { StorageService } from "./storage.service";

import { AsyncStorageOptions } from "./interfaces/storage-module-async-options.interface";
import { StorageOptions } from "./interfaces/storage-module-options.interface";
import { StorageOptionsFactory } from "./interfaces/storage-module-options-factory.interface";

@Module({
  exports: [StorageService],
  providers: [StorageService]
})
export class StorageModule {
  private static id = 0;

  static register(options: StorageOptions): DynamicModule {
    return {
      module: StorageModule,
      providers: [
        {
          provide: STORAGE_MODULE_ID,
          useValue: this.id++
        },
        {
          provide: STORAGE_MODULE_OPTIONS,
          useValue: options
        }
      ]
    };
  }

  static registerAsync(options: AsyncStorageOptions): DynamicModule {
    return {
      module: StorageModule,
      imports: options.imports || [],
      providers: [
        {
          provide: STORAGE_MODULE_ID,
          useValue: this.id++
        },
        ...this.createAsyncProviders(options)
      ]
    };
  }

  private static createAsyncProviders(options: AsyncStorageOptions): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }

    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass as any,
        useClass: options.useClass as any
      }
    ];
  }

  private static createAsyncOptionsProvider(options: AsyncStorageOptions): Provider {
    if (options.useFactory) {
      return {
        provide: STORAGE_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || []
      };
    }

    return {
      provide: STORAGE_MODULE_OPTIONS,
      useFactory: async (optionsFactory: StorageOptionsFactory): Promise<StorageOptions> =>
        optionsFactory.createStorageOptions(),
      inject: [(options.useExisting || options.useClass) as any]
    };
  }
}
