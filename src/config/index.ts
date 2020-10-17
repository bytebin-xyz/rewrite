import * as convict from "convict";
import * as formats from "convict-format-with-validator";

import { createProfiguration } from "@golevelup/profiguration";

import { logger } from "@/logger";

convict.addFormats(formats);

export interface Config {
  branding: string;

  domains: {
    backend: string;
    frontend: string;
  };

  limits: {
    maxFileSize: number;
    maxFilesPerUpload: number;
  };

  mongodb: {
    dbName: string;
    hostname: string;
    password: string;
    poolSize: number;
    port: number;
    username: string;
  };

  port: number;

  redis: {
    hostname: string;
    port: number;
  };

  secrets: {
    applications: string;
    recaptcha: string;
    sessions: string;
  };

  smtp: {
    from: string;
    host: string;
    password: string;
    port: number;
    secure: boolean;
    tls: boolean;
    username: string;
  };

  throttler: {
    limit: number;
    ttl: number;
  };

  uploadsDirectory: string;
}

export const config = createProfiguration<Config>(
  {
    branding: {
      default: "Quicksend",
      format: String
    },

    domains: {
      backend: {
        doc: "domain name for the backend",
        default: null,
        format: String
      },
      frontend: {
        doc: "domain name for the frontend",
        default: null,
        format: String
      }
    },

    limits: {
      maxFileSize: {
        doc: "maximum size per file when uploading",
        default: 25 * 1024 * 1024,
        format: "nat"
      },
      maxFilesPerUpload: {
        doc: "maximum amount of files that can be uploaded in one request",
        default: 1,
        format: "nat"
      }
    },

    mongodb: {
      dbName: {
        doc: "name of the mongodb database",
        default: "quicksend",
        format: String
      },
      hostname: {
        doc: "hostname of the mongodb connection",
        default: "localhost",
        format: String
      },
      password: {
        doc: "password of the mongodb user",
        default: "",
        format: String,
        sensitive: true
      },
      poolSize: {
        doc: "amount of pooled mongodb connections",
        default: 5,
        format: "nat"
      },
      port: {
        doc: "port of the mongodb connection",
        default: 27017,
        format: "port"
      },
      username: {
        doc: "username of the mongodb user",
        default: "",
        format: String,
        sensitive: true
      }
    },

    port: {
      doc: "port to listen on",
      default: 3000,
      format: "port"
    },

    redis: {
      hostname: {
        doc: "hostname of the redis connection",
        default: "localhost",
        format: String
      },
      port: {
        doc: "port of the redis connection",
        default: 6379,
        format: "port"
      }
    },

    secrets: {
      applications: {
        doc: "secret used to generate application keys",
        default: null,
        format: String,
        sensitive: true
      },
      recaptcha: {
        doc: "secret used for recaptcha validation",
        default: null,
        format: String,
        sensitive: true
      },
      sessions: {
        doc: "secret used for session cookies",
        default: null,
        format: String,
        sensitive: true
      }
    },

    smtp: {
      from: {
        doc: "email used as the sender",
        default: null,
        format: "email"
      },
      host: {
        doc: "host of the SMTP server",
        default: null,
        format: String
      },
      password: {
        doc: "password of the SMTP account",
        default: null,
        format: String,
        sensitive: true
      },
      port: {
        doc: "port of the SMTP server",
        default: 465,
        format: "port"
      },
      secure: {
        doc: "whether the SMTP connection should be secure",
        default: true,
        format: Boolean
      },
      tls: {
        doc: "whether the SMTP connection should use TLS",
        default: true,
        format: Boolean
      },
      username: {
        doc: "username of the SMTP account",
        default: null,
        format: String,
        sensitive: true
      }
    },

    throttler: {
      limit: {
        doc:
          "number of requests that can hit an endpoint before being ratelimited",
        default: 250,
        format: "nat"
      },
      ttl: {
        doc: "ratelimiter cooldown in seconds",
        default: 60,
        format: "nat"
      }
    },

    uploadsDirectory: {
      doc: "path to uploaded files",
      default: "/uploads",
      format: String
    }
  },
  {
    configureEnv: (env) => ({
      files: `config.${env}.json`
    }),
    logger: (message) => {
      const context = "@golevelup/profiguration: ";

      if (message.startsWith(context)) {
        logger.log(message.slice(context.length), "Profiguration");
      } else {
        logger.log(message);
      }
    },
    strict: true,
    verbose: true
  }
);
