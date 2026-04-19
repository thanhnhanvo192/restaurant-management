import crypto from "crypto";

const ITERATIONS = 120000;
const KEY_LENGTH = 32;
const DIGEST = "sha256";

export const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto
    .pbkdf2Sync(String(password), salt, ITERATIONS, KEY_LENGTH, DIGEST)
    .toString("hex");

  return `pbkdf2$${ITERATIONS}$${salt}$${derivedKey}`;
};

export const verifyPassword = (password, storedValue = "") => {
  if (!storedValue) {
    return false;
  }

  const rawStored = String(storedValue);

  if (!rawStored.startsWith("pbkdf2$")) {
    return rawStored === String(password);
  }

  const [, iterationsText, salt, expectedKey] = rawStored.split("$");
  const iterations = Number(iterationsText);

  if (!iterations || !salt || !expectedKey) {
    return false;
  }

  const derivedKey = crypto
    .pbkdf2Sync(String(password), salt, iterations, KEY_LENGTH, DIGEST)
    .toString("hex");

  return crypto.timingSafeEqual(
    Buffer.from(derivedKey, "hex"),
    Buffer.from(expectedKey, "hex"),
  );
};
