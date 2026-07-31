import jwt from "jsonwebtoken";
import { promisify } from "util";

const jwtSign = promisify(jwt.sign);

export async function generateToken(payload) {
  return jwtSign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "2d",
  });
}

export function decodeToken(token) {
  if (!token) throw new Error("Token missing");
  return jwt.verify(token, process.env.JWT_SECRET);
}
