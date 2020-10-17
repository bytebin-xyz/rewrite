import { APP_GUARD } from "@nestjs/core";

import {
  Global,
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod
} from "@nestjs/common";

import { InjectQueue } from "@nestjs/bull";
import { MongooseModule } from "@nestjs/mongoose";
import { ThrottlerGuard, ThrottlerModule } from "nestjs-throttler";
import { ThrottlerStorageRedisService } from "nestjs-throttler-storage-redis";

import { ClientOpts } from "redis";

import Arena = require("bull-arena");
import Bull = require("bull");

import { AdminModule } from "./modules/admin/admin.module";
import { ApplicationsModule } from "./modules/applications/applications.module";
import { AuthModule } from "./modules/auth/auth.module";
import { FilesModule } from "./modules/files/files.module";
import { HealthModule } from "./modules/health/health.module";
import { MailerModule } from "./modules/mailer/mailer.module";
import { SessionsModule } from "./modules/sessions/sessions.module";
import { UsersModule } from "./modules/users/users.module";

import { AdminMiddleware } from "@/middlewares/admin.middleware";

import { config } from "@/config";

@Global()
@Module({
  imports: [
    AdminModule,

    ApplicationsModule,

    AuthModule,

    FilesModule,

    HealthModule,

    MailerModule.forRoot({
      auth: {
        pass: config.get("smtp").password,
        user: config.get("smtp").username
      },
      from: config.get("smtp").from,
      host: config.get("smtp").host,
      port: config.get("smtp").port,
      secure: config.get("smtp").secure
    }),

    MongooseModule.forRoot(
      `mongodb://${config.get("mongodb").hostname}:${
        config.get("mongodb").port
      }`,
      {
        authSource:
          config.get("mongodb").password &&
          config.get("mongodb").username &&
          config.get("mongodb").dbName,

        dbName: config.get("mongodb").dbName,
        pass: config.get("mongodb").password,
        poolSize: config.get("mongodb").poolSize,
        useCreateIndex: true,
        useFindAndModify: false,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        user: config.get("mongodb").username
      }
    ),

    SessionsModule,

    ThrottlerModule.forRoot({
      limit: config.get("throttler").limit,
      ttl: config.get("throttler").ttl,
      storage: new ThrottlerStorageRedisService({
        host: config.get("redis").hostname,
        port: config.get("redis").port
      })
    }),

    UsersModule
  ],
  exports: [ApplicationsModule, Logger, MailerModule, UsersModule],
  providers: [
    Logger,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ]
})
export class AppModule implements NestModule {
  constructor(
    @InjectQueue("files")
    private readonly filesQueue: Bull.Queue,

    @InjectQueue("mailer")
    private readonly mailerQueue: Bull.Queue
  ) {}

  configure(consumer: MiddlewareConsumer): void {
    const redis: ClientOpts = {
      host: config.get("redis").hostname,
      port: config.get("redis").port
    };

    consumer
      .apply(
        AdminMiddleware,
        Arena(
          {
            Bull,

            queues: [
              { hostId: "File Queue", name: this.filesQueue.name, redis },
              { hostId: "Mailer Queue", name: this.mailerQueue.name, redis }
            ]
          },
          {
            disableListen: true,
            host: config.get("domains").backend,
            port: config.get("port"),
            useCdn: false
          }
        )
      )
      .forRoutes({ method: RequestMethod.ALL, path: "/queues" });
  }
}
