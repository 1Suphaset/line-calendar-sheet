import { getTodayExercise, getExerciseByDay, formatExerciseMessage } from "../data/exerciseSchedule.js";
import { insertEvent } from "./calendar.service.js";
import { appendRow, appendRows, readRows, appendRowsIfNotExists, nowInBangkokString } from "./sheet.service.js";

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
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayKey = dayKeys[today.getDay()];
    
    // บันทึกการยืนยัน
    userConfirmations.set(userId, {
      date: today.toDateString(),
      confirmed: confirmed,
      timestamp: new Date()
    });

    // บันทึกลง Google Sheets
    const baseRow = [
      userId,
      nowInBangkokString(),
      todayName,
      confirmed ? "Exercise Confirmed" : "Exercise Skipped",
    ];

    if (confirmed) {
      // เก็บรายละเอียดท่าที่ทำในวันนี้แบบต่อแถว
      const todayPlan = getExerciseByDay(todayKey);
      const rows = Array.isArray(todayPlan?.exercises)
        ? todayPlan.exercises.map((ex, idx) => [
            ...baseRow,
            `${idx + 1}. ${ex.name}`,
            ex.sets ?? '',
            ex.reps ?? ex.duration ?? '',
          ])
        : [[...baseRow, 'Rest Day', '', '']];
      await appendRowsIfNotExists(rows);
    } else {
      await appendRowsIfNotExists([[...baseRow, 'Skipped', '', '']]);
    }

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
export const createWeeklySummary = async (userId) => {
  try {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // เริ่มจากวันอาทิตย์

    const allRows = await readRows();
    const records = Array.isArray(allRows) ? allRows.slice(1) : []; // skip header if present

    const start = new Date(weekStart);
    const end = new Date(today);

    const userRows = records.filter(r => r[0] === userId).filter(r => {
      const ts = new Date(r[1]);
      return ts >= start && ts <= end;
    });

    const dailyMap = new Map();
    userRows.forEach(r => {
      const dateKey = new Date(r[1]).toDateString();
      const action = r[3];
      const exercise = r[4];
      const sets = r[5];
      const reps = r[6];
      if (!dailyMap.has(dateKey)) dailyMap.set(dateKey, { confirmed: false, exercises: [] });
      const entry = dailyMap.get(dateKey);
      if (action === 'Exercise Confirmed') entry.confirmed = true;
      if (exercise && exercise !== 'Skipped' && exercise !== 'Rest Day') {
        entry.exercises.push({ exercise, sets, reps });
      }
    });

    const days = Array.from(dailyMap.values());
    const confirmedDays = days.filter(d => d.confirmed).length;
    const totalDays = 7; // normalize against full week
    const totalSets = days.reduce((sum, d) => sum + d.exercises.reduce((s, e) => s + (parseInt(e.sets, 10) || 0), 0), 0);

    let topExercises = new Map();
    days.forEach(d => d.exercises.forEach(e => {
      const key = e.exercise;
      topExercises.set(key, (topExercises.get(key) || 0) + 1);
    }));
    const topList = Array.from(topExercises.entries()).sort((a,b) => b[1]-a[1]).slice(0,3);

    // Flex Summary
    const flex = {
      type: 'flex',
      altText: 'สรุปการออกกำลังกายสัปดาห์นี้',
      contents: {
        type: 'bubble',
        header: {
          type: 'box',
          layout: 'vertical',
          contents: [
            { type: 'text', text: '📊 สรุปสัปดาห์', weight: 'bold', size: 'lg' },
            { type: 'text', text: `${weekStart.toLocaleDateString('th-TH')} - ${today.toLocaleDateString('th-TH')}`, size: 'xs', color: '#888888', margin: 'sm' },
          ],
        },
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            { type: 'box', layout: 'baseline', contents: [ { type: 'text', text: '✅ วันที่ยืนยัน', flex: 5, size: 'sm' }, { type: 'text', text: `${confirmedDays}/${totalDays}`, flex: 3, align: 'end', size: 'sm', weight: 'bold' } ], margin: 'sm' },
            { type: 'box', layout: 'baseline', contents: [ { type: 'text', text: '🧮 เซ็ตทั้งหมด', flex: 5, size: 'sm' }, { type: 'text', text: `${totalSets}`, flex: 3, align: 'end', size: 'sm', weight: 'bold' } ], margin: 'sm' },
            ...(topList.length ? [ { type: 'text', text: '🏅 ท่าที่ทำบ่อย', weight: 'bold', size: 'sm', margin: 'md' } ] : []),
            ...topList.map(([name, count]) => ({ type: 'box', layout: 'baseline', contents: [ { type: 'text', text: name, size: 'xs', flex: 6, wrap: true }, { type: 'text', text: `${count} วัน`, size: 'xs', flex: 2, align: 'end' } ], margin: 'xs' })),
          ],
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          contents: [
            { type: 'button', style: 'primary', color: '#1DB446', action: { type: 'postback', label: 'ดูตารางวันนี้', data: 'get_exercise', displayText: 'ออกกำลังกาย' } },
            { type: 'button', style: 'secondary', action: { type: 'message', label: 'เมนู', text: 'เมนู' } },
          ],
        },
      },
    };

    const message = `📊 สรุปการออกกำลังกายสัปดาห์นี้พร้อมแล้ว`;

    return { success: true, message, confirmedDays, totalDays, totalSets, topExercises: topList, flex };
  } catch (error) {
    console.error("Error creating weekly summary:", error);
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการสร้างสรุป"
    };
  }
};
