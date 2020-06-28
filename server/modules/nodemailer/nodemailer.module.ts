import { DynamicModule, Global, Module, Provider } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { NODEMAILER_TRANSPORTER_OPTIONS } from "./nodemailer.constants";

import { NodemailerService } from "./nodemailer.service";

import {
  AsyncTransporterOptions,
  TransporterOptions,
  TransporterOptionsFactory
} from "./interfaces/transporter-options.interface";

import { EmailConfirmationSchema } from "./schemas/email-confirmation.schema";
import { PasswordResetSchema } from "./schemas/password-reset.schema";
import { UserActivationSchema } from "./schemas/user-activation.schema";

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "EmailConfirmation", schema: EmailConfirmationSchema },
      { name: "PasswordReset", schema: PasswordResetSchema },
      { name: "UserActivation", schema: UserActivationSchema }
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
