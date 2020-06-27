import * as os from "os";
import * as path from "path";

import * as Joi from "@hapi/joi";
import * as session from "express-session";

import { ConfigModule, ConfigService } from "@nestjs/config";
import { Module } from "@nestjs/common";
import { MongooseModule, getConnectionToken } from "@nestjs/mongoose";
import { NestSessionOptions, SessionModule } from "nestjs-session";

import { Connection } from "mongoose";

import { AppController } from "./app.controller";

import { AuthModule } from "./modules/auth/auth.module";
import { NodemailerModule } from "./modules/nodemailer/nodemailer.module";
import { SettingsModule } from "./modules/settings/settings.module";
import { UsersModule } from "./modules/users/users.module";

import ms = require("ms");

const MongoStore = require("connect-mongo")(session);

const MIN_PORT = 1;
const MAX_PORT = 65535;

const kbToBytes = (kB: number) => kB / 1024;
const mbToBytes = (mb: number) => mb * 1024 * 1024;

@Module({
  imports: [
    AuthModule,

    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
      isGlobal: true,
      validationSchema: Joi.object({
        DOMAIN: Joi.string().required(),

        MAX_CHUNK_SIZE: Joi.number().min(1).default(mbToBytes(1)),
        MAX_FILES_PER_UPLOAD: Joi.number().min(1).default(5),
        MAX_FILE_SIZE: Joi.number().min(kbToBytes(8)).default(mbToBytes(25)),

        MONGO_DB_NAME: Joi.string().default("bytebin"),
        MONGO_HOST: Joi.string().default("localhost"),
        MONGO_PASSWORD: Joi.string().allow(""),
        MONGO_POOL_SIZE: Joi.number().min(1).default(5),
        MONGO_PORT: Joi.number().min(MIN_PORT).max(MAX_PORT).default(27017),
        MONGO_USERNAME: Joi.string().allow(""),

        NODE_ENV: Joi.string().valid("development", "production").default("development"),

        PORT: Joi.number().min(MIN_PORT).max(MAX_PORT).default(3000),

        RECAPTCHA_SECRET_KEY: Joi.string().required(),
        RECAPTCHA_SITE_KEY: Joi.string().required(),

        SESSION_SECRET: Joi.string().required(),

        SMTP_FROM: Joi.string().required(),
        SMTP_HOST: Joi.string().required(),
        SMTP_PASSWORD: Joi.string().required(),
        SMTP_PORT: Joi.number().min(MIN_PORT).max(MAX_PORT).default(465),
        SMTP_SECURE: Joi.boolean().default(true),
        SMTP_TLS: Joi.boolean().default(true),
        SMTP_USERNAME: Joi.string().required(),

        UPLOAD_DIRECTORY: Joi.string()
          .allow("")
          .default(os.tmpdir())
          .custom((value) => {
            if (path.isAbsolute(value)) return value;
            throw new Error("upload directory path is not absolute!");
          })
      })
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
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
      imports: [ConfigModule],
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

    SessionModule.forRootAsync({
      imports: [ConfigModule, MongooseModule],
      inject: [ConfigService, getConnectionToken()],
      useFactory: (config: ConfigService, mongooseConnection: Connection): NestSessionOptions => ({
        session: {
          cookie: {
            maxAge: ms("7d"),
            secure: process.env.NODE_ENV === "production"
          },
          resave: false,
          saveUninitialized: false,
          secret: config.get("SESSION_SECRET") as string,
          store: new MongoStore({
            mongooseConnection,
            stringify: false
          })
        }
      })
    }),

    SettingsModule,

    UsersModule
  ],
  controllers: [AppController],
  providers: []
})
export class AppModule {}
