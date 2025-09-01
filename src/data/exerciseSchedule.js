// ตารางการออกกำลังกาย 7 วัน
export const exerciseSchedule = {
  monday: {
    day: "จันทร์",
    exercises: [
      { name: "Push-ups", sets: 3, reps: 15, description: "วิดพื้น" },
      { name: "Squats", sets: 3, reps: 20, description: "นั่งยอง" },
      { name: "Plank", sets: 3, duration: "30 วินาที", description: "ท่าแพลงก์" },
      { name: "Jumping Jacks", sets: 3, reps: 30, description: "กระโดดตบ" }
    ],
    totalTime: "20-25 นาที"
  },
  tuesday: {
    day: "อังคาร",
    exercises: [
      { name: "Burpees", sets: 3, reps: 10, description: "เบอร์พี" },
      { name: "Lunges", sets: 3, reps: 15, description: "ท่าลันจ์" },
      { name: "Mountain Climbers", sets: 3, duration: "30 วินาที", description: "ปีนเขา" },
      { name: "High Knees", sets: 3, duration: "30 วินาที", description: "เข่าสูง" }
    ],
    totalTime: "20-25 นาที"
  },
  wednesday: {
    day: "พุธ",
    exercises: [
      { name: "Pull-ups", sets: 3, reps: 8, description: "ดึงข้อ" },
      { name: "Dips", sets: 3, reps: 12, description: "ท่าดิป" },
      { name: "Russian Twists", sets: 3, reps: 20, description: "บิดตัวรัสเซีย" },
      { name: "Leg Raises", sets: 3, reps: 15, description: "ยกขา" }
    ],
    totalTime: "20-25 นาที"
  },
  thursday: {
    day: "พฤหัสบดี",
    exercises: [
      { name: "Deadlifts", sets: 3, reps: 12, description: "ท่าดีดลิฟต์" },
      { name: "Calf Raises", sets: 3, reps: 20, description: "ยกน่อง" },
      { name: "Side Plank", sets: 2, duration: "30 วินาที", description: "แพลงก์ข้าง" },
      { name: "Bicycle Crunches", sets: 3, reps: 20, description: "ปั่นจักรยาน" }
    ],
    totalTime: "20-25 นาที"
  },
  friday: {
    day: "ศุกร์",
    exercises: [
      { name: "Box Jumps", sets: 3, reps: 10, description: "กระโดดขึ้นกล่อง" },
      { name: "Pike Push-ups", sets: 3, reps: 8, description: "วิดพื้นแบบพิก" },
      { name: "Wall Sit", sets: 3, duration: "30 วินาที", description: "นั่งติดผนัง" },
      { name: "Tricep Dips", sets: 3, reps: 12, description: "ดิปไตรเซป" }
    ],
    totalTime: "20-25 นาที"
  },
  saturday: {
    day: "เสาร์",
    exercises: [
      { name: "Bear Crawl", sets: 3, duration: "30 วินาที", description: "คลานแบบหมี" },
      { name: "Single-leg Deadlifts", sets: 3, reps: 10, description: "ดีดลิฟต์ขาเดียว" },
      { name: "Hollow Body Hold", sets: 3, duration: "30 วินาที", description: "ท่าฮอลโลว์" },
      { name: "Scissor Kicks", sets: 3, duration: "30 วินาที", description: "เตะกรรไกร" }
    ],
    totalTime: "20-25 นาที"
  },
  sunday: {
    day: "อาทิตย์",
    exercises: [
      { name: "Yoga Flow", sets: 1, duration: "15 นาที", description: "โยคะเบาๆ" },
      { name: "Stretching", sets: 1, duration: "10 นาที", description: "ยืดเหยียด" },
      { name: "Meditation", sets: 1, duration: "5 นาที", description: "นั่งสมาธิ" }
    ],
    totalTime: "30 นาที",
    note: "วันพักผ่อน - เน้นการฟื้นฟูร่างกาย"
  }
};

// ฟังก์ชันสำหรับดึงการออกกำลังกายของวัน
export const getTodayExercise = () => {
  const today = new Date();
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
  message += `⏱️ เวลารวม: ${exerciseData.totalTime}\n\n`;
  
  if (exerciseData.note) {
    message += `📝 ${exerciseData.note}\n\n`;
  }
  
  message += "📋 รายการท่าออกกำลังกาย:\n";
  
  exerciseData.exercises.forEach((exercise, index) => {
    message += `${index + 1}. ${exercise.name} (${exercise.description})\n`;
    if (exercise.sets && exercise.reps) {
      message += `   ${exercise.sets} เซ็ต x ${exercise.reps} ครั้ง\n`;
    } else if (exercise.sets && exercise.duration) {
      message += `   ${exercise.sets} เซ็ต x ${exercise.duration}\n`;
    }
    message += "\n";
  });
  
  message += "💪 พร้อมออกกำลังกายแล้วหรือยัง?";
  
  return message;
};
