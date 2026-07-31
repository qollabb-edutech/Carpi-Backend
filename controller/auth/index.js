import bcrypt from "bcrypt";
import AdminAccount from "../../models/schema/accounts/admin.js";
import { generateToken } from "../../helper/generateToken.js";
import { COOKIE_OPTIONS } from "../../middlewares/authentication.js";

function sanitizeAdmin(admin) {
  return {
    id: admin.id,
    email: admin.email,
    first_name: admin.first_name,
    last_name: admin.last_name,
    role: "admin",
  };
}

export async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: true, message: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const admin = await AdminAccount.findOne({ where: { email: normalizedEmail } });

    if (!admin || !admin.is_active) {
      return res.status(401).json({ error: true, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: true, message: "Invalid email or password" });
    }

    const token = await generateToken({
      id: admin.id,
      email: admin.email,
      role: "admin",
    });

    return res
      .status(200)
      .cookie("token", token, { ...COOKIE_OPTIONS, maxAge: 1000 * 60 * 60 * 48 })
      .json({ error: false, message: "Login successful", user: sanitizeAdmin(admin) });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message || "Login failed" });
  }
}

export async function getSession(req, res) {
  try {
    const admin = await AdminAccount.findByPk(req.admin.id, {
      attributes: ["id", "email", "first_name", "last_name", "is_active"],
    });

    if (!admin || !admin.is_active) {
      return res.status(401).json({ error: true, message: "Unauthorized" });
    }

    return res.status(200).json({
      error: false,
      message: "Session active",
      user: sanitizeAdmin(admin),
    });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message || "Session failed" });
  }
}

export async function logout(_req, res) {
  return res
    .status(200)
    .clearCookie("token", COOKIE_OPTIONS)
    .json({ error: false, message: "Logged out" });
}
