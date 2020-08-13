import { BullModule } from "@nestjs/bull";
import { ConfigService } from "@nestjs/config";
import { DynamicModule, Module, Provider } from "@nestjs/common";

import { NODEMAILER_MODULE_ID, NODEMAILER_MODULE_OPTIONS } from "./mailer.constants";

import { MailerProcessor } from "./mailer.processor";
import { MailerService } from "./mailer.service";

import { MailerOptions } from "./interfaces/mailer-module-options.interface";
import { MailerOptionsFactory } from "./interfaces/mailer-module-options-factory";
import { MailerModuleAsyncOptions } from "./interfaces/mailer-module-async-options.interface";

@Module({
  imports: [
    BullModule.registerQueueAsync({
      inject: [ConfigService],
      name: "emails",
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get("REDIS_HOST"),
          port: config.get("REDIS_PORT")
        }
      })
    })
  ],
  exports: [BullModule, MailerService],
  providers: [MailerProcessor, MailerService]
})
export class MailerModule {
  private static id = 0;

  static register(options: MailerOptions): DynamicModule {
    return {
      module: MailerModule,
      providers: [
        {
          provide: NODEMAILER_MODULE_ID,
          useValue: this.id++
        },
        {
          provide: NODEMAILER_MODULE_OPTIONS,
          useValue: options
        }
      ]
    };
  }

  static registerAsync(options: MailerModuleAsyncOptions): DynamicModule {
    return {
      module: MailerModule,
      imports: options.imports || [],
      providers: [
        {
          provide: NODEMAILER_MODULE_ID,
          useValue: this.id++
        },
        ...this.createAsyncProviders(options)
      ]
    };
  }

  private static createAsyncProviders(options: MailerModuleAsyncOptions): Provider[] {
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

  private static createAsyncOptionsProvider(options: MailerModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: NODEMAILER_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || []
      };
    }

    return {
      provide: NODEMAILER_MODULE_OPTIONS,
      useFactory: async (optionsFactory: MailerOptionsFactory): Promise<MailerOptions> =>
        optionsFactory.createMailerOptions(),
      inject: [(options.useExisting || options.useClass) as any]
    };
  }
}
