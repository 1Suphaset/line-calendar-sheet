import cron from "node-cron";
import { sendPushMessage, sendPushFlexMessage } from "./line.service.js";
import { createExerciseNotification, createWeeklySummary } from "./exercise.service.js";
import { getTodayExercise, formatExerciseMessage } from "../data/exerciseSchedule.js";

// เก็บรายการผู้ใช้ที่ต้องการรับการแจ้งเตือน
const subscribedUsers = new Set();

// เพิ่มผู้ใช้ในการแจ้งเตือน
export const subscribeUser = (userId) => {
  subscribedUsers.add(userId);
  console.log(`User ${userId} subscribed to exercise notifications`);
};

// ลบผู้ใช้ออกจากการแจ้งเตือน
export const unsubscribeUser = (userId) => {
  subscribedUsers.delete(userId);
  console.log(`User ${userId} unsubscribed from exercise notifications`);
};

// ตรวจสอบว่าผู้ใช้สมัครรับการแจ้งเตือนหรือไม่
export const isUserSubscribed = (userId) => {
  return subscribedUsers.has(userId);
};

// สร้างการแจ้งเตือนการออกกำลังกาย
const sendExerciseReminder = async () => {
  try {
    const exerciseData = getTodayExercise();
    const message = formatExerciseMessage(exerciseData);
    
    // สร้าง Flex Message สำหรับการแจ้งเตือน
    const flexMessage = {
      type: "flex",
      altText: "⏰ แจ้งเตือนการออกกำลังกาย",
      contents: {
        type: "bubble",
        header: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "⏰ แจ้งเตือนการออกกำลังกาย",
              weight: "bold",
              size: "lg",
              color: "#FF6B6B"
            }
          ]
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: message,
              wrap: true,
              size: "sm"
            }
          ]
        },
        footer: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "button",
              action: {
                type: "postback",
                label: "🏋️‍♀️ เริ่มออกกำลังกาย",
                data: "get_exercise",
                displayText: "เริ่มออกกำลังกาย"
              },
              style: "primary",
              color: "#1DB446"
            }
          ]
        }
      }
    };

    // ส่งการแจ้งเตือนให้ผู้ใช้ทุกคนที่สมัครรับ
    const promises = Array.from(subscribedUsers).map(async (userId) => {
      try {
        await sendPushFlexMessage(userId, flexMessage);
        console.log(`Exercise reminder sent to user: ${userId}`);
      } catch (error) {
        console.error(`Failed to send reminder to user ${userId}:`, error);
        // ถ้าส่งไม่ได้ อาจเป็นเพราะผู้ใช้บล็อกบอท ให้ลบออกจากการแจ้งเตือน
        subscribedUsers.delete(userId);
      }
    });

    await Promise.all(promises);
    console.log(`Exercise reminders sent to ${subscribedUsers.size} users`);
  } catch (error) {
    console.error("Error sending exercise reminders:", error);
  }
};

// ตั้งเวลาการแจ้งเตือน
export const setupNotifications = () => {
  // แจ้งเตือนตอน 7:00 น. ทุกวัน
  cron.schedule("0 7 * * *", () => {
    console.log("Sending morning exercise reminders...");
    sendExerciseReminder();
  }, {
  timezone: "Asia/Bangkok"
});

  // แจ้งเตือนตอน 18:00 น. ทุกวัน (สำหรับคนที่ยังไม่ได้ออกกำลังกาย)
  cron.schedule("0 18 * * *", () => {
    console.log("Sending evening exercise reminders...");
    sendEveningReminder();
  }, {
  timezone: "Asia/Bangkok"
});

  // แจ้งเตือนสรุปสัปดาห์ทุกวันอาทิตย์ตอน 20:00 น.
  cron.schedule("0 20 * * 0", () => {
    console.log("Sending weekly summary...");
    sendWeeklySummary();
 }, {
  timezone: "Asia/Bangkok"
});

  console.log("Exercise notification schedules set up successfully");
};

// การแจ้งเตือนตอนเย็น
const sendEveningReminder = async () => {
  try {
    const message = 
      "🌅 สวัสดีตอนเย็น!\n\n" +
      "💪 วันนี้คุณออกกำลังกายแล้วหรือยัง?\n\n" +
      "หากยังไม่ได้ออกกำลังกาย ลองทำท่าง่ายๆ สัก 10-15 นาที\n" +
      "หรือพิมพ์ 'ออกกำลังกาย' เพื่อดูตารางการออกกำลังกายวันนี้\n\n" +
      "🏃‍♀️ การออกกำลังกายเล็กๆ น้อยๆ ก็ดีกว่าการไม่ออกกำลังกายเลย!";

    const promises = Array.from(subscribedUsers).map(async (userId) => {
      try {
        await sendPushMessage(userId, message);
      } catch (error) {
        console.error(`Failed to send evening reminder to user ${userId}:`, error);
        subscribedUsers.delete(userId);
      }
    });

    await Promise.all(promises);
  } catch (error) {
    console.error("Error sending evening reminders:", error);
  }
};

// การแจ้งเตือนสรุปสัปดาห์
const sendWeeklySummary = async () => {
  try {
    const promises = Array.from(subscribedUsers).map(async (userId) => {
      try {
        const result = await createWeeklySummary(userId);
        if (result.success && result.flex) {
          await sendPushFlexMessage(userId, { type: 'flex', altText: 'สรุปสัปดาห์', contents: result.flex.contents });
        } else {
          await sendPushMessage(userId, result.message || "📊 ยังไม่มีข้อมูลสรุปในสัปดาห์นี้");
        }
      } catch (error) {
        console.error(`Failed to send weekly summary to user ${userId}:`, error);
        subscribedUsers.delete(userId);
      }
    });

    await Promise.all(promises);
  } catch (error) {
    console.error("Error sending weekly summary:", error);
  }
};

// ฟังก์ชันสำหรับทดสอบการแจ้งเตือน (สำหรับ development)
export const testNotification = async (userId) => {
  try {
    const exerciseData = getTodayExercise();
    const message = formatExerciseMessage(exerciseData);
    
    await sendPushMessage(userId, `🧪 การทดสอบการแจ้งเตือน\n\n${message}`);
    return { success: true, message: "การทดสอบส่งสำเร็จ" };
  } catch (error) {
    console.error("Error in test notification:", error);
    return { success: false, message: "การทดสอบล้มเหลว" };
  }
};
