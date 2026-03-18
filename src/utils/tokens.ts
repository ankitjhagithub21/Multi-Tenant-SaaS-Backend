import crypto from "crypto";

export const generateRawToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

export const generateHashToken = (token:string) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

