import * as winston from "winston";

import "winston-daily-rotate-file";

import { WinstonModule, utilities } from "nest-winston";

export const logger = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        utilities.format.nestLike("Nest")
      ),
      level: "info"
    }),

    new winston.transports.DailyRotateFile({
      datePattern: "YYYY-MM-DD-HH",
      dirname: "logs",
      filename: "%DATE%.log",
      level: "silly",
      maxFiles: "30d"
    })
  ]
});
