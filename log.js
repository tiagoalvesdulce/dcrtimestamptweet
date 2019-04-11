import winston from "winston";
import dotenv from "dotenv";

dotenv.config();
var config = winston.config;

const DEFAULT_LOG_LEVEL = "info";

const createLogger = logLevel => {
  const logger = winston.createLogger({
    level: logLevel || DEFAULT_LOG_LEVEL,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.colorize({ all: true }),
      winston.format.simple()
    ),
    defaultMeta: { service: "user-service" },
    transports: [
      //
      // - Write to all logs with level `info` and below to `combined.log`
      // - Write all logs error (and below) to `error.log`.
      new winston.transports.File({ filename: "error.log", level: "error" }),
      new winston.transports.File({
        filename: "combined.log"
      })
    ]
  });

  logger.info(`Log level is ${logger.level}`);
  //
  // If we're not in production then log to the `console` with the format:
  // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
  //
  if (process.env.NODE_ENV !== "production") {
    logger.add(
      new winston.transports.Console({
        format: winston.format.simple()
      })
    );
  }

  return logger;
};

const logger = createLogger(process.env.LOG_LEVEL);

export default logger;
