import { getTodayExercise, getExerciseByDay, formatExerciseMessage } from "../data/exerciseSchedule.js";
import { insertEvent } from "./calendar.service.js";
import { appendRow } from "./sheet.service.js";

// เก็บสถานะการยืนยันของผู้ใช้
const userConfirmations = new Map();

// สร้างการแจ้งเตือนการออกกำลังกาย
export const createExerciseNotification = async (userId, dayKey = null) => {
  try {
    const exerciseData = dayKey ? getExerciseByDay(dayKey) : getTodayExercise();
    
    if (!exerciseData) {
      return {
        success: false,
        message: "ไม่พบข้อมูลการออกกำลังกายสำหรับวันนี้"
      };
    }

    const message = formatExerciseMessage(exerciseData);
    
    // บันทึกลง Google Sheets
    await appendRow([
      userId,
      new Date().toLocaleString(),
      exerciseData.day,
      "Exercise Notification Sent",
      JSON.stringify(exerciseData.exercises)
    ]);

    return {
      success: true,
      message: message,
      exerciseData: exerciseData,
      userId: userId
    };
  } catch (error) {
    console.error("Error creating exercise notification:", error);
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการสร้างการแจ้งเตือน"
    };
  }
};

// สร้าง Event ใน Google Calendar สำหรับการออกกำลังกาย
export const createExerciseCalendarEvent = async (userId, exerciseData) => {
  try {
    const start = new Date();
    const end = new Date(start.getTime() + 30 * 60 * 1000); // 30 นาที

    const eventData = {
      summary: `🏋️‍♀️ ออกกำลังกายวัน${exerciseData.day}`,
      description: `การออกกำลังกายวัน${exerciseData.day}\n\nรายการท่า:\n${exerciseData.exercises.map(ex => `- ${ex.name} (${ex.description})`).join('\n')}\n\nเวลารวม: ${exerciseData.totalTime}`,
      start: start.toISOString(),
      end: end.toISOString()
    };

    const event = await insertEvent(eventData);
    
    // บันทึกลง Google Sheets
    await appendRow([
      userId,
      new Date().toLocaleString(),
      exerciseData.day,
      "Calendar Event Created",
      event.id
    ]);

    return {
      success: true,
      event: event
    };
  } catch (error) {
    console.error("Error creating calendar event:", error);
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการสร้าง Event ใน Calendar"
    };
  }
};

// จัดการการยืนยันการออกกำลังกาย
export const handleExerciseConfirmation = async (userId, confirmed) => {
  try {
    const today = new Date();
    const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    const todayName = dayNames[today.getDay()];
    
    // บันทึกการยืนยัน
    userConfirmations.set(userId, {
      date: today.toDateString(),
      confirmed: confirmed,
      timestamp: new Date()
    });

    // บันทึกลง Google Sheets
    await appendRow([
      userId,
      new Date().toLocaleString(),
      todayName,
      confirmed ? "Exercise Confirmed" : "Exercise Skipped",
      confirmed ? "✅ ยืนยันแล้ว" : "❌ ข้าม"
    ]);

    let message = "";
    if (confirmed) {
      message = `🎉 ยอดเยี่ยม! คุณได้ยืนยันการออกกำลังกายวัน${todayName} แล้ว\n\n`;
      message += `💪 เก่งมาก! การออกกำลังกายสม่ำเสมอจะทำให้คุณแข็งแรงขึ้น\n`;
      message += `📊 ข้อมูลการยืนยันของคุณได้ถูกบันทึกไว้แล้ว\n\n`;
      message += `🔄 พร้อมสำหรับการออกกำลังกายวันพรุ่งนี้หรือยัง?`;
    } else {
      message = `😔 ไม่เป็นไร! บางวันอาจจะไม่สะดวก\n\n`;
      message += `💡 ลองเริ่มใหม่พรุ่งนี้ หรือเลือกท่าง่ายๆ ที่ทำได้\n`;
      message += `🤝 จำไว้เสมอว่า การเริ่มต้นใหม่ไม่เคยสาย\n\n`;
      message += `💪 พร้อมลองใหม่หรือยัง?`;
    }

    return {
      success: true,
      message: message,
      confirmed: confirmed
    };
  } catch (error) {
    console.error("Error handling exercise confirmation:", error);
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการยืนยัน"
    };
  }
};

// ตรวจสอบสถานะการยืนยันของผู้ใช้
export const getUserConfirmationStatus = (userId) => {
  const today = new Date().toDateString();
  const userStatus = userConfirmations.get(userId);
  
  if (userStatus && userStatus.date === today) {
    return {
      hasConfirmed: true,
      confirmed: userStatus.confirmed,
      timestamp: userStatus.timestamp
    };
  }
  
  return {
    hasConfirmed: false,
    confirmed: null,
    timestamp: null
  };
};

// สร้างข้อความสรุปการออกกำลังกายประจำสัปดาห์
export const createWeeklySummary = (userId) => {
  try {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // เริ่มจากวันอาทิตย์
    
    let confirmedDays = 0;
    let totalDays = 0;
    
    // นับการยืนยันในสัปดาห์นี้
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(weekStart);
      checkDate.setDate(weekStart.getDate() + i);
      
      if (checkDate <= today) {
        totalDays++;
        // ตรวจสอบการยืนยัน (ในระบบจริงควรเก็บในฐานข้อมูล)
        // สำหรับตอนนี้จะใช้ข้อมูลจาก memory
      }
    }
    
    const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    const todayName = dayNames[today.getDay()];
    
    let message = `📊 สรุปการออกกำลังกายสัปดาห์นี้\n\n`;
    message += `📅 วันที่: ${weekStart.toLocaleDateString('th-TH')} - ${today.toLocaleDateString('th-TH')}\n`;
    message += `✅ วันที่มีการยืนยัน: ${confirmedDays}/${totalDays} วัน\n\n`;
    
    if (confirmedDays === totalDays) {
      message += `🏆 ยอดเยี่ยม! คุณออกกำลังกายครบทุกวันในสัปดาห์นี้\n`;
      message += `💪 เก่งมาก! ความสม่ำเสมอคือกุญแจสู่ความสำเร็จ`;
    } else if (confirmedDays >= totalDays * 0.7) {
      message += `👍 ดีมาก! คุณออกกำลังกายสม่ำเสมอ\n`;
      message += `💡 ลองเพิ่มความถี่ให้ครบทุกวันดูสิ`;
    } else {
      message += `💪 ยังมีโอกาสปรับปรุงได้\n`;
      message += `🎯 ลองตั้งเป้าหมายเล็กๆ และทำทีละขั้น`;
    }
    
    message += `\n\n🔄 พร้อมสำหรับการออกกำลังกายวัน${todayName} หรือยัง?`;
    
    return {
      success: true,
      message: message,
      confirmedDays: confirmedDays,
      totalDays: totalDays
    };
  } catch (error) {
    console.error("Error creating weekly summary:", error);
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการสร้างสรุป"
    };
  }
};
