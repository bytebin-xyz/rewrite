import * as path from "path";

import helmet from "helmet";
import morgan from "morgan";
import winston from "winston";

import "winston-daily-rotate-file";

// @ts-ignore
import { Builder, Nuxt } from "nuxt";
import { ConfigService } from "@nestjs/config";
import { Logger, ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { NestFactory } from "@nestjs/core";
import { WinstonModule } from "nest-winston";

import { AppModule } from "./app.module";

import { NotFoundExceptionFilter } from "./exceptions/not-found.exception";

import { config as nuxtConfig } from "~/nuxt.config";

const logger = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.prettyPrint({ colorize: true }),
      level: "warn"
    }),

    new winston.transports.DailyRotateFile({
      dirname: path.join(__dirname, "../logs"),
      filename: "bytebin-%DATE%.log"
    })
  ]
});

const stdout = new Logger("Bootstrap");

(async () => {
  stdout.log("Starting Bytebin...");

  const app = await NestFactory.create<NestExpressApplication>(AppModule, { logger });
  const config = app.get<ConfigService>(ConfigService);

  const isDev = config.get("NODE_ENV") === "development";
  const port = config.get("PORT") as number;

  const nuxt = new Nuxt({ ...nuxtConfig, dev: isDev });

  await nuxt.ready();

  if (isDev) await new Builder(nuxt).build();

  app
    .use(morgan("combined", { stream: { write: (message) => logger.log(message, "Morgan") } }))
    .use(helmet())
    .useGlobalFilters(new NotFoundExceptionFilter(logger, nuxt))
    .useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true
      })
    );

  app.listen(port, () => stdout.log(`Bytebin successfully started on port ${port}!`));
})();
