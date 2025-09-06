export const getTodayString = () => {
  return new Date().toLocaleDateString("th-TH", { timeZone: "Asia/Bangkok" });
};