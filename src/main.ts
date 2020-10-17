import * as helmet from "helmet";
import * as mongoStore from "connect-mongo";
import * as morgan from "morgan";
import * as session from "express-session";

import { URL } from "url";

import ms = require("ms");

import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { NestExpressApplication } from "@nestjs/platform-express";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";

import { getConnectionToken } from "@nestjs/mongoose";

import { AppModule } from "./app.module";

import { InternalServerErrorExceptionFilter } from "./exceptions/internal-server-error.exception";

import { config } from "./config";
import { logger } from "./logger";

const isDev = process.env.NODE_ENV === "development";

const MongoStore = mongoStore(session);

(async () => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger
  });

  SwaggerModule.setup(
    "swagger",
    app,
    SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle(config.get("branding"))
        .setVersion("1.0")
        .addApiKey({ name: "Authorization", type: "apiKey" })
        .build()
    )
  );

  app.enableCors({
    credentials: true,
    origin: `${isDev ? "http" : "https"}://${config.get("domains").frontend}`
  });

  app
    .useGlobalFilters(new InternalServerErrorExceptionFilter(logger))
    .useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  app
    .use(helmet())
    .use(
      morgan("combined", {
        stream: {
          write: (message) => logger.debug && logger.debug(message, "Morgan")
        }
      })
    )
    .use(
      session({
        cookie: {
          domain: new URL(config.get("domains").backend).hostname,
          maxAge: ms("14d"),
          sameSite: "strict",
          secure: !isDev
        },
        name: "sid.the.science.kid",
        resave: false,
        saveUninitialized: false,
        secret: config.get("secrets").sessions,
        store: new MongoStore({
          mongooseConnection: app.get(getConnectionToken()),
          stringify: false
        })
      })
    );

  app.listen(config.get("port"));
})();
