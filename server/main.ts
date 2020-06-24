import helmet from "helmet";

// @ts-ignore
import { Builder, Nuxt } from "nuxt";
import { ConfigService } from "@nestjs/config";
import { NestExpressApplication } from "@nestjs/platform-express";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";

import { AppModule } from "./app.module";

import { NotFoundExceptionFilter } from "./exceptions/not-found.exception";

import { config as nuxtConfig } from "~/nuxt.config";

(async () => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);
  const isDev = config.get("NODE_ENV") === "development";
  const nuxt = new Nuxt({
    ...nuxtConfig,
    dev: isDev
  });

  await nuxt.ready();

  if (isDev) await new Builder(nuxt).build();

  app
    .use(helmet())
    .useGlobalFilters(new NotFoundExceptionFilter(nuxt))
    .useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true
      })
    );

  await app.listen(config.get("PORT") as number);
})();
