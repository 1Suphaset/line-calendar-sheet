import { replyMessage, replyWithQuickReply, sendFlexMessage } from "../services/line.service.js";
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

import { getTodayString } from "../utils/dateTime.js";

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
        else if (userMessage === "เมนู" || userMessage === "menu") {
          await handleMenuCommand(replyToken);
        }
        else {
          // คำสั่งไม่รู้จัก
          await replyWithQuickReply(
            replyToken,
            "🤖 สวัสดี! ฉันเป็นบอทช่วยออกกำลังกาย\n\nเลือกเมนูด้านล่างหรือพิมพ์คำสั่ง:",
            [
              { label: "ออกกำลังกาย", text: "ออกกำลังกาย" },
              { label: "ยืนยัน", text: "ยืนยัน" },
              { label: "ข้าม", text: "ข้าม" },
              { label: "สรุป", text: "สรุป" },
              { label: "เมนู", text: "เมนู" },
            ]
          );
        }
      }
      else if (event.type === "postback") {
        // จัดการ Postback events (สำหรับ buttons)
        const replyToken = event.replyToken;
        const userId = event.source.userId;
        const data = event.postback.data;
        // รองรับ postback แบบ key=value&key2=value2
        const params = Object.fromEntries(new URLSearchParams(data));

        if (data === "confirm_exercise" || params.action === "confirm_exercise") {
          await handleConfirmationCommand(replyToken, userId, true);
        } else if (data === "skip_exercise" || params.action === "skip_exercise") {
          await handleConfirmationCommand(replyToken, userId, false);
        } else if (data === "get_exercise" || params.action === "get_exercise") {
          await handleExerciseCommand(replyToken, userId);
        } else if (data === "menu" || params.action === "menu") {
          await handleMenuCommand(replyToken);
        } else if (params.action === "toggle_exercise") {
          await handleToggleExerciseCommand(replyToken, userId, params.idx);
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
      // สร้าง Flex Message พร้อมปุ่มยืนยัน และเช็กลิสต์รายท่า
      const checklistContents = Array.isArray(result.exerciseData.exercises)
        ? result.exerciseData.exercises.map((ex, idx) => ({
            type: "box",
            layout: "horizontal",
            contents: [
              { type: "text", text: `${idx + 1}. ${ex.name}`, size: "sm", wrap: true, flex: 6 },
              { type: "button", style: "secondary", height: "sm", flex: 2, action: { type: "postback", label: "✅", data: `action=toggle_exercise&idx=${idx}`, displayText: `ทำแล้ว: ${ex.name}` } }
            ],
            margin: "sm"
          }))
        : [{ type: "text", text: result.message, wrap: true, size: "sm" }];

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
              { type: "text", text: result.exerciseData.focus ? `🎯 โฟกัส: ${result.exerciseData.focus}` : "", size: "sm", wrap: true, margin: "xs" },
              { type: "text", text: "เช็กลิสต์รายท่า:", weight: "bold", margin: "md", size: "sm" },
              ...checklistContents
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
    // ตรวจสอบสถานะวันนี้
    const status = getUserConfirmationStatus(userId);

    if (status.hasConfirmed) {
      await replyMessage(
        replyToken, 
        "✅ คุณได้บันทึกการออกกำลังกายสำหรับวันนี้แล้ว\n" +
        `เวลา: ${status.timestamp}`
      );
      return;
    }

    // ถ้ายังไม่เคยยืนยัน -> ไปทำงานต่อ
    const result = await handleExerciseConfirmation(userId, confirmed);

    if (result.success) {
      if (result.flex) {
        await sendFlexMessage(replyToken, { 
          type: 'flex', 
          altText: 'สรุปสัปดาห์', 
          contents: result.flex.contents 
        });
      } else {
        await replyMessage(replyToken, result.message);
      }
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
    const result = await createWeeklySummary(userId);
    
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

  await replyWithQuickReply(replyToken, helpMessage, [
    { label: "ออกกำลังกาย", text: "ออกกำลังกาย" },
    { label: "ยืนยัน", text: "ยืนยัน" },
    { label: "ข้าม", text: "ข้าม" },
    { label: "สรุป", text: "สรุป" },
    { label: "เมนู", text: "เมนู" },
  ]);
};

// จัดการการติ๊กเช็กลิสต์รายท่า (บันทึกรายการเดียวแบบ idempotent)
const handleToggleExerciseCommand = async (replyToken, userId, rawIdx) => {
  try {
    const idx = parseInt(rawIdx, 10);
    if (Number.isNaN(idx)) {
      await replyMessage(replyToken, "รูปแบบข้อมูลไม่ถูกต้อง");
      return;
    }

    // อ่านแผนของวันนี้เพื่อทราบชื่อท่า
    const today = getTodayString();
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayKey = dayKeys[today.getDay()];
    const planResult = await createExerciseNotification(userId, todayKey);
    const exercises = planResult?.exerciseData?.exercises || [];
    const target = exercises[idx];
    if (!target) {
      await replyMessage(replyToken, "ไม่พบรายการท่าที่เลือก");
      return;
    }

    // บันทึก 1 แถวแบบ idempotent
    const row = [
      userId,
      getTodayString(),
      planResult.exerciseData.day,
      'Exercise Confirmed',
      `${idx + 1}. ${target.name}`,
      target.sets ?? '',
      target.reps ?? target.duration ?? '',
      'single'
    ];
    // ใช้ appendRowsIfNotExists ผ่าน exercise.service (นำเข้าที่นั่น) หรือเรียกตรง sheet.service ก็ได้
    const { appendRowsIfNotExists } = await import('../services/sheet.service.js');
    await appendRowsIfNotExists([row]);

    await replyMessage(replyToken, `บันทึกแล้ว: ${target.name}`);
  } catch (error) {
    console.error('Error in handleToggleExerciseCommand:', error);
    await replyMessage(replyToken, "เกิดข้อผิดพลาดในการบันทึก");
  }
};

// จัดการคำสั่งเมนู (Flex + Postback)
const handleMenuCommand = async (replyToken) => {
  const menuFlex = {
    type: "flex",
    altText: "เมนูการใช้งาน",
    contents: {
      type: "carousel",
      contents: [
        {
          type: "bubble",
          hero: {
            type: "image",
            url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200",
            size: "full",
            aspectRatio: "20:13",
            aspectMode: "cover",
          },
          body: {
            type: "box",
            layout: "vertical",
            contents: [
              { type: "text", text: "เริ่มออกกำลังกาย", weight: "bold", size: "md" },
              { type: "text", text: "ดูตารางของวันนี้", size: "sm", color: "#888888" },
            ],
          },
          footer: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "button",
                style: "primary",
                color: "#1DB446",
                action: { type: "postback", label: "ดูตาราง", data: "get_exercise", displayText: "ออกกำลังกาย" },
              },
            ],
          },
        },
        {
          type: "bubble",
          body: {
            type: "box",
            layout: "vertical",
            contents: [
              { type: "text", text: "ยืนยัน/ข้าม", weight: "bold", size: "md" },
              { type: "text", text: "อัปเดตสถานะวันนี้", size: "sm", color: "#888888" },
            ],
          },
          footer: {
            type: "box",
            layout: "vertical",
            contents: [
              { type: "button", style: "primary", color: "#1DB446", action: { type: "postback", label: "ยืนยัน", data: "confirm_exercise", displayText: "ยืนยัน" } },
              { type: "button", style: "secondary", action: { type: "postback", label: "ข้าม", data: "skip_exercise", displayText: "ข้าม" } },
            ],
          },
        },
        {
          type: "bubble",
          body: {
            type: "box",
            layout: "vertical",
            contents: [
              { type: "text", text: "อื่น ๆ", weight: "bold", size: "md" },
              { type: "text", text: "สรุป/ช่วยเหลือ", size: "sm", color: "#888888" },
            ],
          },
          footer: {
            type: "box",
            layout: "vertical",
            contents: [
              { type: "button", style: "primary", action: { type: "message", label: "ดูสรุป", text: "สรุป" } },
              { type: "button", style: "secondary", action: { type: "message", label: "ช่วยเหลือ", text: "ช่วยเหลือ" } },
            ],
          },
        },
      ],
    },
  };

  await sendFlexMessage(replyToken, menuFlex);
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
