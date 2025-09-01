import express from "express";
import { handleLineWebhook } from "../controllers/line.controller.js";
import { verifyLineWebhook } from "../middlewares/lineWebhook.js";

const router = express.Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "LINE Exercise Bot"
  });
});

// LINE webhook endpoint with verification
router.post("/webhook", verifyLineWebhook, handleLineWebhook);

export default router;
