import { google } from "googleapis";
import { oauth2Client } from "../utils/googleAuth.js";
import { googleConfig } from "../config/index.js";

const sheets = google.sheets({ version: "v4", auth: oauth2Client });
const SHEET_ID = googleConfig.sheetId;

// Header schema
const SHEET_RANGE = "Sheet1";
const HEADER = [
  "userId",
  "timestamp",
  "dayName",
  "action",
  "exercise",
  "sets",
  "repsOrDuration",
  "notes",
];

export const ensureHeader = async () => {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_RANGE}!A1:H1`,
  });
  const values = response.data.values;
  if (!values || values.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_RANGE}!A1`,
      valueInputOption: "RAW",
      resource: { values: [HEADER] },
    });
    return true;
  }
  return false;
};

// Timezone helpers (Asia/Bangkok)
export const nowInBangkokString = () => {
  return new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" });
};

export const appendRow = async (values) => {
  await ensureHeader();
  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_RANGE}!A1`,
    valueInputOption: "RAW",
    resource: { values: [values] },
  });
  return response.data;
};

export const appendRows = async (rows) => {
  if (!Array.isArray(rows) || rows.length === 0) return { updatedRows: 0 };
  await ensureHeader();
  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_RANGE}!A1`,
    valueInputOption: "RAW",
    resource: { values: rows },
  });
  return response.data;
};

export const readRows = async () => {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_RANGE}!A1:Z10000`,
  });
  return response.data.values;
};

// Idempotent append using unique key (userId + dateKey + exercise)
export const appendRowsIfNotExists = async (rows) => {
  if (!rows?.length) return { inserted: 0, skipped: 0 };
  const all = await readRows();
  const existing = new Set(
    (all || []).slice(1).map((r) => `${r[0]}|${new Date(r[1]).toDateString()}|${r[4] || ''}`)
  );
  const toInsert = rows.filter((r) => {
    const key = `${r[0]}|${new Date(r[1]).toDateString()}|${r[4] || ''}`;
    return !existing.has(key);
  });
  if (toInsert.length) await appendRows(toInsert);
  return { inserted: toInsert.length, skipped: rows.length - toInsert.length };
};
