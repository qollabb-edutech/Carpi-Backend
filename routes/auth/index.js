import { Router } from "express";
import { login, getSession, logout } from "../../controller/auth/index.js";
import { authenticateAdmin } from "../../middlewares/authentication.js";

const router = Router();

router.post("/login", login);
router.get("/session", authenticateAdmin, getSession);
router.delete("/session", logout);

export default router;
