import { DynamicModule, Global, Module, Provider } from "@nestjs/common";

import { NODEMAILER_TRANSPORTER_OPTIONS } from "./nodemailer.constants";

import { NodemailerService } from "./nodemailer.service";

import {
  NodemailerAsyncTransporterOptions,
  NodemailerTransporterOptions,
  NodemailerTransporterOptionsFactory
} from "./interfaces";

@Global()
@Module({
  providers: [NodemailerService],
  exports: [NodemailerService]
})
export class NodemailerModule {
  static forRoot(transporterOptions: NodemailerTransporterOptions): DynamicModule {
    return {
      module: NodemailerModule,
      providers: [
        {
          provide: NODEMAILER_TRANSPORTER_OPTIONS,
          useValue: transporterOptions
        }
      ]
    };
  }

  static forRootAsync(transporterOptions: NodemailerAsyncTransporterOptions): DynamicModule {
    return {
      module: NodemailerModule,
      imports: transporterOptions.imports || [],
      providers: this.createAsyncTransporterProviders(transporterOptions)
    };
  }

  private static createAsyncTransporterProviders(
    transporterOptions: NodemailerAsyncTransporterOptions
  ): Provider[] {
    if (transporterOptions.useExisting || transporterOptions.useFactory) {
      return [this.createAsyncTransporterOptionsProviders(transporterOptions)];
    }

    return [
      this.createAsyncTransporterOptionsProviders(transporterOptions),
      {
        provide: transporterOptions.useClass as any,
        useClass: transporterOptions.useClass as any
      }
    ];
  }

  private static createAsyncTransporterOptionsProviders(
    transporterOptions: NodemailerAsyncTransporterOptions
  ): Provider {
    if (transporterOptions.useFactory) {
      return {
        inject: transporterOptions.inject || [],
        provide: NODEMAILER_TRANSPORTER_OPTIONS,
        useFactory: transporterOptions.useFactory
      };
    }

    return {
      inject: [(transporterOptions.useExisting || transporterOptions.useClass) as any],
      provide: NODEMAILER_TRANSPORTER_OPTIONS,
      useFactory: async (
        transporterOptionsFactory: NodemailerTransporterOptionsFactory
      ): Promise<NodemailerTransporterOptions> =>
        await transporterOptionsFactory.createNodemailerTransporterOptions()
    };
  }
}
