import crypto from "crypto";
import { lineConfig } from "../config/index.js";

// LINE Webhook Verification Middleware
export const verifyLineWebhook = (req, res, next) => {
  try {
    const signature = req.get("X-Line-Signature");
    
    if (!signature) {
      console.error("Missing X-Line-Signature header");
      return res.status(400).send("Missing signature");
    }

    const body = JSON.stringify(req.body);
    const hash = crypto
      .createHmac("SHA256", lineConfig.channelSecret)
      .update(body)
      .digest("base64");

    if (hash !== signature) {
      console.error("Invalid signature");
      return res.status(400).send("Invalid signature");
    }

    next();
  } catch (error) {
    console.error("Error verifying webhook:", error);
    res.status(500).send("Internal server error");
  }
};

// Error handling middleware
export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);
  
  // Log error details
  console.error("Error details:", {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong"
  });
};

// Request logging middleware
export const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.url} - ${req.ip}`);
  next();
};
