import helmet from "helmet";
import morgan from "morgan";
import path from "path";

import { ConfigService } from "@nestjs/config";
import { NestExpressApplication } from "@nestjs/platform-express";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";

import { AppModule } from "./app.module";

import { WinstonLogger } from "./logger";

declare const module: any;

const logger = new WinstonLogger();

(async () => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { logger });
  const config = app.get<ConfigService>(ConfigService);

  const isDev = config.get<string>("NODE_ENV") === "development";
  const port = config.get("PORT") as number;

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

  app.enableCors({
    credentials: true,
    origin: `${isDev ? "http" : "https"}://${config.get("FRONTEND_DOMAIN")}`
  });

  app
    .use(
      morgan("combined", {
        stream: {
          write: message => logger.winston.info(message, { context: "Morgan" })
        }
      })
    )
    .use(helmet())
    .useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true
      })
    )
    .useStaticAssets(path.join(__dirname, "../public"));

  app.listen(port);
})();
