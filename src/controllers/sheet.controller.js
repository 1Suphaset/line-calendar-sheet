import { appendRow, readRows } from "../services/sheet.service.js";

export const addRow = async (req, res) => {
  try {
    const response = await appendRow(req.body.values);
    res.json({ success: true, response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add row" });
  }
};

export const getRows = async (req, res) => {
  try {
    const rows = await readRows();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get rows" });
  }
};
