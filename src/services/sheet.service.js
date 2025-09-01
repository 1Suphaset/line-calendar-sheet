import { google } from "googleapis";
import { oauth2Client } from "../utils/googleAuth.js";
import { googleConfig } from "../config/index.js";

const sheets = google.sheets({ version: "v4", auth: oauth2Client });
const SHEET_ID = googleConfig.sheetId;

export const appendRow = async (values) => {
  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: "Sheet1!A1",
    valueInputOption: "RAW",
    resource: { values: [values] },
  });
  return response.data;
};

export const readRows = async () => {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Sheet1!A1:Z1000",
  });
  return response.data.values;
};
