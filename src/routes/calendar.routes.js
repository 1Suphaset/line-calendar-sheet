import express from "express";
import { addEvent, listEvents } from "../controllers/calendar.controller.js";

const router = express.Router();
router.post("/add", addEvent);
router.get("/list", listEvents);

export default router;
