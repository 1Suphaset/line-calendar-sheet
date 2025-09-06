export const getTodayString = () => {
  return new Date().toLocaleDateString("th-TH", { timeZone: "Asia/Bangkok" });
};

export const getTodayBangkok = () => {
  const now = new Date();
  const tzOffset = 7 * 60; // UTC+7
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + tzOffset * 60000);
};