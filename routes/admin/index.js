import { Router } from "express";
import {
  getDashboardStats,
  listApplications,
  getApplicationDetail,
  getApplicationFileUrl,
  deleteApplication,
} from "../../controller/admin/applications.js";

const router = Router();

router.get("/dashboard/stats", getDashboardStats);
router.get("/applications", listApplications);
router.get("/applications/:id", getApplicationDetail);
router.get("/applications/:id/files/:fileId/url", getApplicationFileUrl);
router.delete("/applications/:id", deleteApplication);

export default router;
