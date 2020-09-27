import * as connectMongo from "connect-mongo";
import * as helmet from "helmet";
import * as morgan from "morgan";
import * as session from "express-session";
import * as winston from "winston";

import { URL } from "url";

import ms = require("ms");

import "winston-daily-rotate-file";

import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { NestExpressApplication } from "@nestjs/platform-express";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { WinstonModule, utilities as WinstonUtilities } from "nest-winston";

import { getConnectionToken } from "@nestjs/mongoose";

import { AppModule } from "./app.module";

import { InternalServerErrorExceptionFilter } from "./exceptions/internal-server-error.exception";

const logger = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        WinstonUtilities.format.nestLike("Bytebin")
      ),
      level: "info"
    }),

    new winston.transports.DailyRotateFile({
      datePattern: "YYYY-MM-DD-HH",
      dirname: "logs",
      filename: "quicksend-%DATE%.log",
      level: "silly",
      maxFiles: "30d"
    })
  ]
});

const MongoStore = connectMongo(session);

(async () => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { logger });
  const config = app.get<ConfigService>(ConfigService);

  const backendDomain = config.get("BACKEND_DOMAIN") as string;
  const frontendDomain = config.get("FRONTEND_DOMAIN") as string;
  const isDev = config.get("NODE_ENV") === "development";
  const port = config.get("PORT") as number;
  const sessionSecret = config.get("SESSION_SECRET") as string;

  const swagger = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle("Bytebin")
      .setVersion("1.0")
      .addApiKey({ name: "Authorization", type: "apiKey" })
      .build()
  );

  SwaggerModule.setup("swagger", app, swagger);

  app.enableCors({
    credentials: true,
    origin: `${isDev ? "http" : "https"}://${frontendDomain}`
  });

  // prettier-ignore
  app
    .useGlobalFilters(new InternalServerErrorExceptionFilter(logger))
    .useGlobalPipes(
      new ValidationPipe({
        forbidUnknownValues: true,
        transform: true,
        whitelist: true
      })
    );

  app
    .use(
      morgan("combined", {
        stream: {
          write: (message) => logger.debug && logger.debug(message, "Morgan")
        }
      })
    )
    .use(helmet())
    .use(
      session({
        cookie: {
          domain: new URL(backendDomain).hostname,
          maxAge: ms("14d"),
          sameSite: "strict",
          secure: !isDev
        },
        name: "sid.the.science.kid",
        resave: false,
        saveUninitialized: false,
        secret: sessionSecret,
        store: new MongoStore({
          mongooseConnection: app.get(getConnectionToken()),
          stringify: false
        })
      })
    );

  app.listen(port);
})();
