import express from "express";
import bodyParser from "body-parser";
import lineRoutes from "./routes/line.routes.js";
import calendarRoutes from "./routes/calendar.routes.js";
import { errorHandler, requestLogger } from "./middlewares/lineWebhook.js";

const app = express();

// Middleware
app.use(requestLogger);
app.use(bodyParser.json({ verify: (req, res, buf) => { req.rawBody = buf; } }));
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/line", lineRoutes);
app.use("/calendar", calendarRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "🏋️‍♀️ LINE Exercise Bot API",
    version: "1.0.0",
    endpoints: {
      health: "/line/health",
      webhook: "/line/webhook",
      calendar: "/calendar"
    }
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
