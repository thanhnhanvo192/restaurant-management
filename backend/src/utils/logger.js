import { env } from "../configs/env.js";

const shouldDebug = env.nodeEnv !== "production";

const safeJson = (value) => {
  try {
    return JSON.stringify(value);
  } catch {
    return "[unserializable]";
  }
};

const write = (level, message, context = {}) => {
  if (level === "debug" && !shouldDebug) {
    return;
  }

  const line = `[${new Date().toISOString()}] ${level.toUpperCase()} ${message} ${safeJson(context)}`;

  if (level === "error") {
    console.error(line);
    return;
  }

  console.log(line);
};

export const logger = {
  info: (message, context) => write("info", message, context),
  warn: (message, context) => write("warn", message, context),
  error: (message, context) => write("error", message, context),
  debug: (message, context) => write("debug", message, context),
};

export default logger;
