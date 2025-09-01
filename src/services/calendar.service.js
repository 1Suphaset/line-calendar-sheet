import { google } from "googleapis";
import { oauth2Client } from "../utils/googleAuth.js";

const calendar = google.calendar({ version: "v3", auth: oauth2Client });

export const insertEvent = async (eventData) => {
  const event = {
    summary: eventData.summary,
    description: eventData.description,
    start: { dateTime: eventData.start },
    end: { dateTime: eventData.end },
  };

  const response = await calendar.events.insert({
    calendarId: "primary",
    resource: event,
  });
  return response.data;
};

export const listUpcomingEvents = async () => {
  const response = await calendar.events.list({
    calendarId: "primary",
    maxResults: 10,
    orderBy: "startTime",
    singleEvents: true,
  });
  return response.data.items;
};
