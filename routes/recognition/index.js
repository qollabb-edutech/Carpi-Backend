import { Router } from "express";
import multer from "multer";
import {
  submitApplication,
  uploadRecognitionFile,
} from "../../controller/recognition/index.js";
import { VIDEO_MAX_BYTES } from "../../aws/s3.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: VIDEO_MAX_BYTES },
});

function handleUpload(req, res, next) {
  upload.single("file")(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          error: true,
          message: "File too large. Maximum size for videos is 50MB",
        });
      }
      return res.status(400).json({ error: true, message: err.message || "Upload failed" });
    }
    next();
  });
}

router.post("/upload", handleUpload, async (req, res) => {
  const result = await uploadRecognitionFile(req);
  return res.status(result.error ? 400 : 201).json(result);
});

router.post("/applications", async (req, res) => {
  const result = await submitApplication(req);
  return res.status(result.error ? 400 : 201).json(result);
});

export default router;
