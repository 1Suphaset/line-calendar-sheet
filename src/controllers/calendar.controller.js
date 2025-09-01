import { insertEvent, listUpcomingEvents } from "../services/calendar.service.js";

export const addEvent = async (req, res) => {
  try {
    const event = await insertEvent(req.body);
    res.json({ success: true, event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add event" });
  }
};

export const listEvents = async (req, res) => {
  try {
    const events = await listUpcomingEvents();
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to list events" });
  }
};
