import crypto from "crypto";

export const createToken = (prefix = "tok") =>
  `${prefix}_${crypto.randomBytes(32).toString("hex")}`;

export const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const parseBearerToken = (authorizationHeader = "") => {
  if (!authorizationHeader.startsWith("Bearer ")) {
    return null;
  }

  return authorizationHeader.slice(7).trim() || null;
};
