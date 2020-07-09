/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { Logger } from "@nestjs/common";

import winston from "winston";

import "winston-daily-rotate-file";

export class WinstonLogger extends Logger {
  readonly winston = winston.createLogger({
    transports: new winston.transports.DailyRotateFile({
      dirname: "logs",
      filename: "bytebin-%DATE%.log"
    })
  });

  error(message: any, trace?: string, context?: string): any {
    this.winston.error(message, { context, trace });
    super.error(message, trace, context);
  }

  debug(message: any, context?: string): any {
    this.winston.debug(message, { context });
    super.debug(message, context);
  }

  log(message: any, context?: string): any {
    this.winston.info(message, { context });
    super.log(message, context);
  }

  verbose(message: any, context?: string): any {
    this.winston.verbose(message, { context });
    super.verbose(message, context);
  }

  warn(message: any, context?: string): any {
    this.winston.warn(message, { context });
    super.warn(message, context);
  }
}
