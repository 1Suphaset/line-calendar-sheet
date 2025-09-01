import dotenv from "dotenv";
import app from "./app.js";
import { setupNotifications } from "./services/notification.service.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

// เริ่มต้นระบบแจ้งเตือน
setupNotifications();

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`🏋️‍♀️ Exercise notification system started`);
  console.log(`📅 Scheduled notifications: 7:00 AM, 6:00 PM daily, Weekly summary on Sunday 8:00 PM`);
});
