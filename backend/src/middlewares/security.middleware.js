import { fail } from "../utils/response.js";
import logger from "../utils/logger.js";

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 120;

const rateLimitStore = new Map();

const sanitizeRecursive = (value) => {
  if (Array.isArray(value)) {
    return value.map(sanitizeRecursive);
  }

  if (!value || typeof value !== "object") {
    if (typeof value === "string") {
      return value.trim();
    }
    return value;
  }

  const sanitized = {};

  for (const [key, nestedValue] of Object.entries(value)) {
    if (key.startsWith("$") || key.includes(".")) {
      continue;
    }

    sanitized[key] = sanitizeRecursive(nestedValue);
  }

  return sanitized;
};

const buildRateLimitKey = (req) => {
  const ip = req.headers["x-forwarded-for"] || req.ip || "unknown";
  return `${req.method}:${req.path}:${ip}`;
};

export const sanitizeInput = (req, _res, next) => {
  req.body = sanitizeRecursive(req.body || {});

  if (req.query && typeof req.query === "object") {
    const sanitizedQuery = sanitizeRecursive(req.query);
    Object.keys(req.query).forEach((key) => {
      delete req.query[key];
    });
    Object.assign(req.query, sanitizedQuery);
  }

  if (req.params && typeof req.params === "object") {
    const sanitizedParams = sanitizeRecursive(req.params);
    Object.keys(req.params).forEach((key) => {
      delete req.params[key];
    });
    Object.assign(req.params, sanitizedParams);
  }

  next();
};

export const rateLimitBaseline = (req, res, next) => {
  const key = buildRateLimitKey(req);
  const now = Date.now();
  const current = rateLimitStore.get(key);

  if (!current || now > current.resetAt) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });
    return next();
  }

  if (current.count >= MAX_REQUESTS_PER_WINDOW) {
    return fail(
      res,
      429,
      "Quá nhiều yêu cầu, vui lòng thử lại sau",
      "RATE_LIMIT_EXCEEDED",
      {
        retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000),
      },
    );
  }

  current.count += 1;
  rateLimitStore.set(key, current);
  return next();
};

export const requestMetricsLogger = (req, res, next) => {
  const startedAt = process.hrtime.bigint();

  res.on("finish", () => {
    const endedAt = process.hrtime.bigint();
    const durationMs = Number(endedAt - startedAt) / 1_000_000;

    logger.info("HTTP request completed", {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
    });
  });

  next();
};
