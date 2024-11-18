import winston from "winston";

const { combine, timestamp, printf, colorize } = winston.format;

// Define custom log format
const customFormat = printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level}: ${message}`;
});

// Create logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug", // Set log level
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    colorize(), // Apply colors to logs
    customFormat
  ),
  transports: [
    new winston.transports.Console(), // Log to console
  ],
});

export default logger;
