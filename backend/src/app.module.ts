import os from "os";
import path from "path";

import Joi from "@hapi/joi";

import { APP_GUARD } from "@nestjs/core";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Logger, Module, Global } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ThrottlerGuard, ThrottlerModule } from "nestjs-throttler";
import { ThrottlerStorageRedisService } from "nestjs-throttler-storage-redis";

import { AppController } from "./app.controller";

import { AdminModule } from "./modules/admin/admin.module";
import { AuthModule } from "./modules/auth/auth.module";
import { BullBoardModule } from "./modules/bull-board/bull-board.module";
import { ExplorerModule } from "./modules/explorer/explorer.module";
import { FilesModule } from "./modules/files/files.module";
import { HealthModule } from "./modules/health/health.module";
import { NodemailerModule } from "./modules/nodemailer/nodemailer.module";
import { SettingsModule } from "./modules/settings/settings.module";
import { UsersModule } from "./modules/users/users.module";

const MIN_PORT = 1;
const MAX_PORT = 65535;

const kbToBytes = (kB: number) => kB / 1024;
const mbToBytes = (mb: number) => mb * 1024 * 1024;

@Global()
@Module({
  imports: [
    AdminModule,
    AuthModule,
    BullBoardModule,
    ExplorerModule,
    FilesModule,
    HealthModule,
    SettingsModule,
    UsersModule,

    ConfigModule.forRoot({
      envFilePath: `.env.development`,
      isGlobal: true,
      validationSchema: Joi.object({
        BACKEND_DOMAIN: Joi.string().required(),
        FRONTEND_DOMAIN: Joi.string().required(),

        MAX_CHUNK_SIZE: Joi.number()
          .min(1)
          .default(mbToBytes(1)),
        MAX_FILES_PER_UPLOAD: Joi.number()
          .min(1)
          .default(5),
        MAX_FILE_SIZE: Joi.number()
          .min(kbToBytes(8))
          .default(mbToBytes(25)),

        MONGO_DB_NAME: Joi.string().default("bytebin"),
        MONGO_HOST: Joi.string().default("localhost"),
        MONGO_PASSWORD: Joi.string().allow(""),
        MONGO_POOL_SIZE: Joi.number()
          .min(1)
          .default(5),
        MONGO_PORT: Joi.number()
          .min(MIN_PORT)
          .max(MAX_PORT)
          .default(27017),
        MONGO_USERNAME: Joi.string().allow(""),

        NODE_ENV: Joi.string()
          .valid("development", "production")
          .default("development"),

        PORT: Joi.number()
          .min(MIN_PORT)
          .max(MAX_PORT)
          .default(3000),

        RECAPTCHA_SECRET: Joi.string().required(),

        REDIS_HOST: Joi.string().default("localhost"),
        REDIS_PORT: Joi.number()
          .min(MIN_PORT)
          .max(MAX_PORT)
          .default(6379),

        SESSION_SECRET: Joi.string().required(),

        SMTP_FROM: Joi.string().required(),
        SMTP_HOST: Joi.string().required(),
        SMTP_PASSWORD: Joi.string().required(),
        SMTP_PORT: Joi.number()
          .min(MIN_PORT)
          .max(MAX_PORT)
          .default(465),
        SMTP_SECURE: Joi.boolean().default(true),
        SMTP_TLS: Joi.boolean().default(true),
        SMTP_USERNAME: Joi.string().required(),

        THROTTLE_LIMIT: Joi.number()
          .min(0)
          .default(250),
        THROTTLE_TTL: Joi.number()
          .min(0)
          .default(60),

        UPLOAD_DIRECTORY: Joi.string()
          .allow("")
          .default(os.tmpdir())
          .custom(value => {
            if (path.isAbsolute(value)) return value;
            throw new Error("upload directory path is not absolute!");
          }),

        UPLOAD_THROTTLE_LIMIT: Joi.number()
          .min(0)
          .default(100),
        UPLOAD_THROTTLE_TTL: Joi.number()
          .min(0)
          .default(60)
      })
    }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbName = config.get("MONGO_DB_NAME");
        const pass = config.get("MONGO_PASSWORD");
        const user = config.get("MONGO_USERNAME");

        return {
          authSource: pass && user ? dbName : undefined,
          dbName,
          pass,
          poolSize: config.get("MONGO_POOL_SIZE"),
          uri: `mongodb://${config.get("MONGO_HOST")}:${config.get("MONGO_PORT")}`,
          useCreateIndex: true,
          useFindAndModify: false,
          useNewUrlParser: true,
          useUnifiedTopology: true,
          user
        };
      }
    }),

    NodemailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        auth: {
          pass: config.get("SMTP_PASSWORD"),
          user: config.get("SMTP_USERNAME")
        },
        from: config.get("SMTP_FROM"),
        host: config.get("SMTP_HOST"),
        port: config.get("SMTP_PORT"),
        secure: config.get("SMTP_SECURE"),
        tls: config.get("SMTP_TLS")
      })
    }),

    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        limit: config.get("THROTTLE_LIMIT"),
        ttl: config.get("THROTTLE_TTL"),
        storage: new ThrottlerStorageRedisService({
          host: config.get("REDIS_HOST"),
          port: config.get("REDIS_PORT")
        })
      })
    })
  ],
  exports: [Logger],
  controllers: [AppController],
  providers: [
    Logger,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ]
})
export class AppModule {}
