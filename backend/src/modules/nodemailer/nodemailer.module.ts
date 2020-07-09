import { DynamicModule, Global, Module, Provider } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { NODEMAILER_TRANSPORTER_OPTIONS } from "./nodemailer.constants";

import { NodemailerService } from "./nodemailer.service";

import { AsyncTransporterOptions } from "./interfaces/async-transporter-options.interface";
import { TransporterOptions } from "./interfaces/transporter-options.interface";
import { TransporterOptionsFactory } from "./interfaces/transporter-options-factory.interface";

import { EmailConfirmation, EmailConfirmationSchema } from "./schemas/email-confirmation.schema";
import { PasswordReset, PasswordResetSchema } from "./schemas/password-reset.schema";
import { UserActivation, UserActivationSchema } from "./schemas/user-activation.schema";

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EmailConfirmation.name, schema: EmailConfirmationSchema },
      { name: PasswordReset.name, schema: PasswordResetSchema },
      { name: UserActivation.name, schema: UserActivationSchema }
    ])
  ],
  exports: [NodemailerService],
  providers: [NodemailerService]
})
export class NodemailerModule {
  static forRoot(transporterOptions: TransporterOptions): DynamicModule {
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

  static forRootAsync(transporterOptions: AsyncTransporterOptions): DynamicModule {
    return {
      module: NodemailerModule,
      imports: transporterOptions.imports || [],
      providers: this.createAsyncTransporterProviders(transporterOptions)
    };
  }

  private static createAsyncTransporterProviders(
    transporterOptions: AsyncTransporterOptions
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
    transporterOptions: AsyncTransporterOptions
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
        transporterOptionsFactory: TransporterOptionsFactory
      ): Promise<TransporterOptions> => await transporterOptionsFactory.createTransporterOptions()
    };
  }
}
