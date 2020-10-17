import { BullModule } from "@nestjs/bull";
import { DynamicModule, Module, Provider } from "@nestjs/common";

import { MAILER_MODULE_ID, MAILER_MODULE_OPTIONS } from "./mailer.constants";

import { MailerProcessor } from "./mailer.processor";
import { MailerService } from "./mailer.service";

import { MailerOptions } from "./interfaces/mailer-module-options.interface";
import { MailerOptionsFactory } from "./interfaces/mailer-module-options-factory";
import { MailerModuleAsyncOptions } from "./interfaces/mailer-module-async-options.interface";

import { config } from "@/config";

@Module({
  imports: [
    BullModule.registerQueue({
      name: "mailer",
      redis: {
        host: config.get("redis").hostname,
        port: config.get("redis").port
      }
    })
  ],
  exports: [BullModule, MailerService],
  providers: [MailerProcessor, MailerService]
})
export class MailerModule {
  private static id = 0;

  static forRoot(options: MailerOptions): DynamicModule {
    return {
      module: MailerModule,
      providers: [
        {
          provide: MAILER_MODULE_ID,
          useValue: this.id++
        },
        {
          provide: MAILER_MODULE_OPTIONS,
          useValue: options
        }
      ]
    };
  }

  static forRootAsync(options: MailerModuleAsyncOptions): DynamicModule {
    return {
      module: MailerModule,
      imports: options.imports || [],
      providers: [
        {
          provide: MAILER_MODULE_ID,
          useValue: this.id++
        },
        ...this.createAsyncProviders(options)
      ]
    };
  }

  private static createAsyncProviders(
    options: MailerModuleAsyncOptions
  ): Provider[] {
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

  private static createAsyncOptionsProvider(
    options: MailerModuleAsyncOptions
  ): Provider {
    if (options.useFactory) {
      return {
        provide: MAILER_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || []
      };
    }

    return {
      provide: MAILER_MODULE_OPTIONS,
      useFactory: async (
        optionsFactory: MailerOptionsFactory
      ): Promise<MailerOptions> => optionsFactory.createMailerOptions(),
      inject: [(options.useExisting || options.useClass) as any]
    };
  }
}
