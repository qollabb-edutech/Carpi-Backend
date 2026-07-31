import { Router } from "express";
import Recognition from "./recognition/index.js";
import Auth from "./auth/index.js";
import Admin from "./admin/index.js";
import { authenticateAdmin } from "../middlewares/authentication.js";

const router = Router();

router.use("/auth", Auth);
router.use("/admin", authenticateAdmin, Admin);
router.use("/recognition", Recognition);

router.get("/health", (_req, res) => {
  res.json({ ok: true, service: "carpi-backend" });
});

export default router;
