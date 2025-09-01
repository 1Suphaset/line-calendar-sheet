import { replyMessage, sendFlexMessage } from "../services/line.service.js";
import { appendRow } from "../services/sheet.service.js";
import { 
  createExerciseNotification, 
  handleExerciseConfirmation, 
  getUserConfirmationStatus,
  createWeeklySummary 
} from "../services/exercise.service.js";
import { 
  subscribeUser, 
  unsubscribeUser, 
  isUserSubscribed,
  testNotification 
} from "../services/notification.service.js";

export const handleLineWebhook = async (req, res) => {
  try {
    const events = req.body.events;

    for (let event of events) {
      if (event.type === "message" && event.message.type === "text") {
        const replyToken = event.replyToken;
        const userId = event.source.userId;
        const userMessage = event.message.text.toLowerCase().trim();

        // จัดการคำสั่งต่างๆ
        if (userMessage === "ออกกำลังกาย" || userMessage === "exercise") {
          await handleExerciseCommand(replyToken, userId);
        } 
        else if (userMessage === "ยืนยัน" || userMessage === "confirm") {
          await handleConfirmationCommand(replyToken, userId, true);
        }
        else if (userMessage === "ข้าม" || userMessage === "skip") {
          await handleConfirmationCommand(replyToken, userId, false);
        }
        else if (userMessage === "สรุป" || userMessage === "summary") {
          await handleSummaryCommand(replyToken, userId);
        }
        else if (userMessage === "สมัคร" || userMessage === "subscribe") {
          await handleSubscribeCommand(replyToken, userId);
        }
        else if (userMessage === "ยกเลิก" || userMessage === "unsubscribe") {
          await handleUnsubscribeCommand(replyToken, userId);
        }
        else if (userMessage === "ทดสอบ" || userMessage === "test") {
          await handleTestCommand(replyToken, userId);
        }
        else if (userMessage === "ช่วยเหลือ" || userMessage === "help") {
          await handleHelpCommand(replyToken);
        }
        else {
          // คำสั่งไม่รู้จัก
          await replyMessage(replyToken, 
            "🤖 สวัสดี! ฉันเป็นบอทช่วยออกกำลังกาย\n\n" +
            "คำสั่งที่ใช้ได้:\n" +
            "• 'ออกกำลังกาย' - ดูตารางออกกำลังกายวันนี้\n" +
            "• 'ยืนยัน' - ยืนยันว่าออกกำลังกายแล้ว\n" +
            "• 'ข้าม' - ข้ามการออกกำลังกายวันนี้\n" +
            "• 'สรุป' - ดูสรุปการออกกำลังกายสัปดาห์นี้\n" +
            "• 'สมัคร' - สมัครรับการแจ้งเตือน\n" +
            "• 'ยกเลิก' - ยกเลิกการแจ้งเตือน\n" +
            "• 'ทดสอบ' - ทดสอบการแจ้งเตือน\n" +
            "• 'ช่วยเหลือ' - ดูคำสั่งทั้งหมด\n\n" +
            "💪 พร้อมเริ่มออกกำลังกายแล้วหรือยัง?"
          );
        }
      }
      else if (event.type === "postback") {
        // จัดการ Postback events (สำหรับ buttons)
        const replyToken = event.replyToken;
        const userId = event.source.userId;
        const data = event.postback.data;

        if (data === "confirm_exercise") {
          await handleConfirmationCommand(replyToken, userId, true);
        } else if (data === "skip_exercise") {
          await handleConfirmationCommand(replyToken, userId, false);
        } else if (data === "get_exercise") {
          await handleExerciseCommand(replyToken, userId);
        }
      }
    }

    res.status(200).end();
  } catch (err) {
    console.error("Error in handleLineWebhook:", err);
    res.status(500).send("Error");
  }
};

// จัดการคำสั่งออกกำลังกาย
const handleExerciseCommand = async (replyToken, userId) => {
  try {
    const result = await createExerciseNotification(userId);
    
    if (result.success) {
      // สร้าง Flex Message พร้อมปุ่มยืนยัน
      const flexMessage = {
        type: "flex",
        altText: "ตารางการออกกำลังกายวันนี้",
        contents: {
          type: "bubble",
          header: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: "🏋️‍♀️ การออกกำลังกายวันนี้",
                weight: "bold",
                size: "lg",
                color: "#1DB446"
              }
            ]
          },
          body: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: result.message,
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
                  label: "✅ ยืนยันออกกำลังกาย",
                  data: "confirm_exercise",
                  displayText: "ยืนยันออกกำลังกายแล้ว"
                },
                style: "primary",
                color: "#1DB446"
              },
              {
                type: "button",
                action: {
                  type: "postback",
                  label: "⏭️ ข้ามวันนี้",
                  data: "skip_exercise",
                  displayText: "ข้ามการออกกำลังกายวันนี้"
                },
                style: "secondary"
              }
            ]
          }
        }
      };

      await sendFlexMessage(replyToken, flexMessage);
    } else {
      await replyMessage(replyToken, result.message);
    }
  } catch (error) {
    console.error("Error in handleExerciseCommand:", error);
    await replyMessage(replyToken, "เกิดข้อผิดพลาดในการดึงข้อมูลการออกกำลังกาย");
  }
};

// จัดการคำสั่งยืนยัน
const handleConfirmationCommand = async (replyToken, userId, confirmed) => {
  try {
    const result = await handleExerciseConfirmation(userId, confirmed);
    
    if (result.success) {
      await replyMessage(replyToken, result.message);
    } else {
      await replyMessage(replyToken, result.message);
    }
  } catch (error) {
    console.error("Error in handleConfirmationCommand:", error);
    await replyMessage(replyToken, "เกิดข้อผิดพลาดในการยืนยัน");
  }
};

// จัดการคำสั่งสรุป
const handleSummaryCommand = async (replyToken, userId) => {
  try {
    const result = createWeeklySummary(userId);
    
    if (result.success) {
      await replyMessage(replyToken, result.message);
    } else {
      await replyMessage(replyToken, result.message);
    }
  } catch (error) {
    console.error("Error in handleSummaryCommand:", error);
    await replyMessage(replyToken, "เกิดข้อผิดพลาดในการสร้างสรุป");
  }
};

// จัดการคำสั่งช่วยเหลือ
const handleHelpCommand = async (replyToken) => {
  const helpMessage = 
    "🤖 คำสั่งที่ใช้ได้:\n\n" +
    "🏋️‍♀️ 'ออกกำลังกาย' - ดูตารางออกกำลังกายวันนี้\n" +
    "✅ 'ยืนยัน' - ยืนยันว่าออกกำลังกายแล้ว\n" +
    "⏭️ 'ข้าม' - ข้ามการออกกำลังกายวันนี้\n" +
    "📊 'สรุป' - ดูสรุปการออกกำลังกายสัปดาห์นี้\n" +
    "🔔 'สมัคร' - สมัครรับการแจ้งเตือน\n" +
    "🔕 'ยกเลิก' - ยกเลิกการแจ้งเตือน\n" +
    "🧪 'ทดสอบ' - ทดสอบการแจ้งเตือน\n" +
    "❓ 'ช่วยเหลือ' - ดูคำสั่งทั้งหมด\n\n" +
    "💡 เคล็ดลับ: พิมพ์ 'ออกกำลังกาย' เพื่อเริ่มต้นวันนี้!";
  
  await replyMessage(replyToken, helpMessage);
};

// จัดการคำสั่งสมัครรับการแจ้งเตือน
const handleSubscribeCommand = async (replyToken, userId) => {
  try {
    if (isUserSubscribed(userId)) {
      await replyMessage(replyToken, 
        "✅ คุณได้สมัครรับการแจ้งเตือนแล้ว!\n\n" +
        "🔔 คุณจะได้รับแจ้งเตือนการออกกำลังกาย:\n" +
        "• ตอน 7:00 น. ทุกวัน\n" +
        "• ตอน 18:00 น. ทุกวัน (ถ้ายังไม่ได้ออกกำลังกาย)\n" +
        "• สรุปสัปดาห์ทุกวันอาทิตย์\n\n" +
        "พิมพ์ 'ยกเลิก' หากต้องการหยุดรับการแจ้งเตือน"
      );
    } else {
      subscribeUser(userId);
      await replyMessage(replyToken, 
        "🎉 สมัครรับการแจ้งเตือนสำเร็จ!\n\n" +
        "🔔 คุณจะได้รับแจ้งเตือนการออกกำลังกาย:\n" +
        "• ตอน 7:00 น. ทุกวัน\n" +
        "• ตอน 18:00 น. ทุกวัน (ถ้ายังไม่ได้ออกกำลังกาย)\n" +
        "• สรุปสัปดาห์ทุกวันอาทิตย์\n\n" +
        "💪 พร้อมเริ่มต้นการออกกำลังกายแล้วหรือยัง?"
      );
    }
  } catch (error) {
    console.error("Error in handleSubscribeCommand:", error);
    await replyMessage(replyToken, "เกิดข้อผิดพลาดในการสมัครรับการแจ้งเตือน");
  }
};

// จัดการคำสั่งยกเลิกการแจ้งเตือน
const handleUnsubscribeCommand = async (replyToken, userId) => {
  try {
    if (isUserSubscribed(userId)) {
      unsubscribeUser(userId);
      await replyMessage(replyToken, 
        "🔕 ยกเลิกการแจ้งเตือนสำเร็จ!\n\n" +
        "คุณจะไม่ได้รับแจ้งเตือนการออกกำลังกายอีกต่อไป\n\n" +
        "💡 พิมพ์ 'สมัคร' หากต้องการรับการแจ้งเตือนอีกครั้ง"
      );
    } else {
      await replyMessage(replyToken, 
        "❌ คุณยังไม่ได้สมัครรับการแจ้งเตือน\n\n" +
        "พิมพ์ 'สมัคร' หากต้องการรับการแจ้งเตือนการออกกำลังกาย"
      );
    }
  } catch (error) {
    console.error("Error in handleUnsubscribeCommand:", error);
    await replyMessage(replyToken, "เกิดข้อผิดพลาดในการยกเลิกการแจ้งเตือน");
  }
};

// จัดการคำสั่งทดสอบ
const handleTestCommand = async (replyToken, userId) => {
  try {
    const result = await testNotification(userId);
    
    if (result.success) {
      await replyMessage(replyToken, 
        "🧪 ทดสอบการแจ้งเตือนสำเร็จ!\n\n" +
        "คุณควรได้รับข้อความแจ้งเตือนการออกกำลังกายแล้ว\n\n" +
        "💡 หากไม่ได้รับข้อความ ให้ตรวจสอบว่าได้สมัครรับการแจ้งเตือนแล้วหรือยัง"
      );
    } else {
      await replyMessage(replyToken, 
        "❌ การทดสอบล้มเหลว\n\n" +
        "กรุณาลองใหม่อีกครั้ง หรือติดต่อผู้ดูแลระบบ"
      );
    }
  } catch (error) {
    console.error("Error in handleTestCommand:", error);
    await replyMessage(replyToken, "เกิดข้อผิดพลาดในการทดสอบ");
  }
};
