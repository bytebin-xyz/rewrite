import connectMongo from "connect-mongo";
import helmet from "helmet";
import morgan from "morgan";
import ms from "ms";
import session from "express-session";
import winston from "winston";

import "winston-daily-rotate-file";

import { ConfigService } from "@nestjs/config";
import { NestExpressApplication } from "@nestjs/platform-express";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { WinstonModule, utilities as WinstonUtilities } from "nest-winston";

import { Connection } from "mongoose";
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
      filename: "bytebin-%DATE%.log",
      level: "silly",
      maxFiles: "30d"
    })
  ]
});

const MongoStore = connectMongo(session);

(async () => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { logger });
  const config = app.get<ConfigService>(ConfigService);

  const isDev = config.get<string>("NODE_ENV") === "development";
  const port = config.get("PORT") as number;

  app.enableCors({
    credentials: true,
    origin: `${isDev ? "http" : "https"}://${config.get("FRONTEND_DOMAIN")}`
  });

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
          write: message => logger.debug && logger.debug(message, "Morgan")
        }
      })
    )
    .use(helmet())
    .use(
      session({
        cookie: {
          maxAge: ms("14d"),
          secure: process.env.NODE_ENV === "production"
        },
        resave: false,
        saveUninitialized: false,
        secret: config.get("SESSION_SECRET") as string,
        store: new MongoStore({
          mongooseConnection: app.get<Connection>(getConnectionToken()),
          stringify: false
        })
      })
    );

  app.listen(port);
})();
