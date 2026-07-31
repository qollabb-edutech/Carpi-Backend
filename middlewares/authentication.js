import { decodeToken } from "../helper/generateToken.js";

function resolveCookieSecure() {
  if (process.env.COOKIE_SECURE === "true") return true;
  if (process.env.COOKIE_SECURE === "false") return false;
  return process.env.NODE_ENV === "production";
}

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: resolveCookieSecure(),
  signed: true,
};

export { COOKIE_OPTIONS };

export function authenticateAdmin(req, res, next) {
  try {
    const token = req.signedCookies?.token;
    if (!token) {
      throw new Error("Unauthorized");
    }

    const decoded = decodeToken(token);
    if (decoded.role !== "admin" || !decoded.id) {
      throw new Error("Unauthorized");
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res
      .status(401)
      .clearCookie("token", COOKIE_OPTIONS)
      .json({
        error: true,
        message: error.message || "Authentication failed",
      });
  }
}
