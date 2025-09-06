import { getTodayString,getTodayBangkok } from "../utils/dateTime.js";
// ตารางการออกกำลังกาย 7 วัน
export const exerciseSchedule = {
  monday: {
    day: "จันทร์",
    focus: "อก & ไตรเซปส์",
    exercises: [
      { name: "Push Up / Bench Press", sets: 4, reps: "8-12", description: "วิดพื้น หรือดันบาร์/ดัมเบล", image: "https://example.com/images/pushup.png" },
      { name: "Incline Push Up / Incline DB Press", sets: 3, reps: "10-12", description: "วิดพื้นแบบพิก หรือดัมเบลเอียง", image: "https://example.com/images/incline_pushup.png" },
      { name: "Chest Dips", sets: 3, reps: "8-10", description: "ดิปอก", image: "https://example.com/images/chest_dips.png" },
      { name: "Tricep Dip", sets: 3, reps: "10-12", description: "ดิปไตรเซป", image: "https://example.com/images/tricep_dip.png" },
      { name: "Overhead Tricep Extension", sets: 3, reps: "10-12", description: "ยกดัมเบลเหนือหัว", image: "https://example.com/images/overhead_tricep.png" }
    ],
    rest: "60–90 วินาที"
  },
  tuesday: {
    day: "อังคาร",
    focus: "หลัง & ไบเซปส์",
    exercises: [
      { name: "Pull Up / Inverted Row", sets: 4, reps: "6-10", description: "ดึงข้อ หรือ Row กลับด้าน", image: "https://example.com/images/pullup.png" },
      { name: "One-arm Dumbbell Row", sets: 3, reps: "10-12", description: "ดัมเบลโรลข้างเดียว", image: "https://example.com/images/one_arm_row.png" },
      { name: "Deadlift (ดัมเบล/บาร์เบล/Hip Hinge)", sets: 4, reps: "8-10", description: "เดดลิฟต์", image: "https://example.com/images/deadlift.png" },
      { name: "Bicep Curl", sets: 4, reps: "10-12", description: "งอแขนไบเซป", image: "https://example.com/images/bicep_curl.png" },
      { name: "Hammer Curl", sets: 3, reps: "10-12", description: "งอแขนแบบค้อน", image: "https://example.com/images/hammer_curl.png" }
    ],
    rest: "60–90 วินาที"
  },
  wednesday: {
    day: "พุธ",
    focus: "ขา & ก้น",
    exercises: [
      { name: "Squat", sets: 4, reps: "10-12", description: "สควอท", image: "https://example.com/images/squat.png" },
      { name: "Bulgarian Split Squat", sets: 3, reps: "10-12/ข้าง", description: "ลันจ์ขาเดียวพาดเก้าอี้", image: "https://example.com/images/bulgarian_split_squat.png" },
      { name: "Lunge", sets: 3, reps: "12/ข้าง", description: "ลันจ์เดิน", image: "https://example.com/images/lunge.png" },
      { name: "Glute Bridge / Hip Thrust", sets: 4, reps: "12-15", description: "สะพานก้น/ฮิปทรัสต์", image: "https://example.com/images/glute_bridge.png" },
      { name: "Calf Raise", sets: 4, reps: "15-20", description: "ยกส้นเท้า", image: "https://example.com/images/calf_raise.png" }
    ],
    rest: "60–90 วินาที"
  },
  thursday: {
    day: "พฤหัสบดี",
    focus: "ไหล่ & Core",
    exercises: [
      { name: "Pike Push Up / Shoulder Press", sets: 4, reps: "8-12", description: "วิดพื้นพิก หรือดันไหล่", image: "https://example.com/images/pike_pushup.png" },
      { name: "Lateral Raise", sets: 3, reps: "12-15", description: "ยกข้างไหล่", image: "https://example.com/images/lateral_raise.png" },
      { name: "Front Raise", sets: 3, reps: "12-15", description: "ยกหน้าไหล่", image: "https://example.com/images/front_raise.png" },
      { name: "Plank", sets: 3, duration: "45-60 วินาที", description: "แพลงก์", image: "https://example.com/images/plank.png" },
      { name: "Leg Raise", sets: 3, reps: "12-15", description: "ยกขา", image: "https://example.com/images/leg_raise.png" },
      { name: "Russian Twist", sets: 3, reps: "20 ครั้ง (ซ้าย+ขวา=1)", description: "บิดตัวรัสเซีย", image: "https://example.com/images/russian_twist.png" }
    ],
    rest: "45–60 วินาที"
  },
  friday: {
    day: "ศุกร์",
    focus: "Full Body Power",
    exercises: [
      { name: "Deadlift", sets: 4, reps: "6-8", description: "เดดลิฟต์", image: "https://example.com/images/deadlift.png" },
      { name: "Push Up / Bench Press", sets: 4, reps: "8-10", description: "วิดพื้น หรือดันบาร์/ดัมเบล", image: "https://example.com/images/pushup.png" },
      { name: "Pull Up", sets: 4, reps: "6-8", description: "ดึงข้อ", image: "https://example.com/images/pullup.png" },
      { name: "Squat Jump", sets: 3, reps: "10-12", description: "สควอทกระโดด", image: "https://example.com/images/squat_jump.png" },
      { name: "Plank to Push Up", sets: 3, reps: "8-12", description: "แพลงก์สลับวิดพื้น", image: "https://example.com/images/plank_to_pushup.png" }
    ],
    rest: "90 วินาที (ท่าหนัก)"
  },
  saturday: {
    day: "เสาร์",
    focus: "พักฟื้น",
    note: "เน้นการพักผ่อน นอนหลับเพียงพอ กินอาหารครบถ้วน"
  },
  sunday: {
    day: "อาทิตย์",
    focus: "พักฟื้น",
    note: "พักเช่นเดียวกับเสาร์ เตรียมพร้อมเข้าสัปดาห์ใหม่"
  }
};

// ฟังก์ชันสำหรับดึงการออกกำลังกายของวัน
export const getTodayExercise = () => {
  const today = getTodayBangkok();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayKey = dayNames[today.getDay()];
  return exerciseSchedule[dayKey];
};

// ฟังก์ชันสำหรับดึงการออกกำลังกายของวันใดวันหนึ่ง
export const getExerciseByDay = (dayKey) => {
  return exerciseSchedule[dayKey] || null;
};

// ฟังก์ชันสำหรับสร้างข้อความการออกกำลังกาย
export const formatExerciseMessage = (exerciseData) => {
  let message = `🏋️‍♀️ การออกกำลังกายวัน${exerciseData.day}\n`;

  if (exerciseData.focus) {
    message += `🎯 โฟกัส: ${exerciseData.focus}\n`;
  }

  // Rest day (no exercises)
  if (exerciseData.note && !exerciseData.exercises) {
    message += `\n📝 ${exerciseData.note}`;
    return message;
  }

  message += "\n📋 รายการท่าออกกำลังกาย:\n";

  if (Array.isArray(exerciseData.exercises)) {
    exerciseData.exercises.forEach((exercise, index) => {
      message += `${index + 1}. ${exercise.name}`;
      if (exercise.description) {
        message += ` (${exercise.description})`;
      }
      message += "\n";
      if (exercise.sets && exercise.reps) {
        message += `   ${exercise.sets} เซ็ต x ${exercise.reps} ครั้ง\n`;
      } else if (exercise.sets && exercise.duration) {
        message += `   ${exercise.sets} เซ็ต x ${exercise.duration}\n`;
      }
      message += "\n";
    });
  }

  if (exerciseData.rest) {
    message += `⏱️ พักระหว่างเซ็ต: ${exerciseData.rest}\n\n`;
  }

  message += "💪 พร้อมออกกำลังกายแล้วหรือยัง?";

  return message;
};
