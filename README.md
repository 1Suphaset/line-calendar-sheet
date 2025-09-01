# 🏋️‍♀️ LINE Exercise Bot

ระบบแจ้งเตือนการออกกำลังกายผ่าน LINE Bot ที่เชื่อมต่อกับ Google Calendar และ Google Sheets

## ✨ ฟีเจอร์หลัก

- 📅 **ตารางการออกกำลังกาย 7 วัน** - มีท่าออกกำลังกายที่หลากหลายสำหรับแต่ละวัน
- 🔔 **ระบบแจ้งเตือนอัตโนมัติ** - แจ้งเตือนตอน 7:00 น. และ 18:00 น. ทุกวัน
- ✅ **ระบบยืนยันการออกกำลังกาย** - ผู้ใช้สามารถยืนยันหรือข้ามการออกกำลังกายได้
- 📊 **สรุปการออกกำลังกาย** - ดูสถิติการออกกำลังกายประจำสัปดาห์
- 📱 **Flex Message** - ข้อความสวยงามพร้อมปุ่มกด
- 📈 **บันทึกข้อมูล** - เก็บข้อมูลลง Google Sheets และ Google Calendar

## 🚀 การติดตั้ง

### 1. Clone โปรเจค
```bash
git clone <repository-url>
cd line-calendar-sheet
```

### 2. ติดตั้ง Dependencies
```bash
npm install
```

### 3. ตั้งค่า Environment Variables
คัดลอกไฟล์ `env.example` เป็น `.env` และกรอกข้อมูล:

```bash
cp env.example .env
```

แก้ไขไฟล์ `.env`:
```env
# LINE Bot Configuration
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token_here
LINE_CHANNEL_SECRET=your_line_channel_secret_here

# Google API Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=your_google_redirect_uri_here
GOOGLE_REFRESH_TOKEN=your_google_refresh_token_here

# Google Sheets Configuration
SHEET_ID=your_google_sheet_id_here

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 4. ตั้งค่า LINE Bot
1. ไปที่ [LINE Developers Console](https://developers.line.biz/)
2. สร้าง Provider และ Channel ใหม่
3. ตั้งค่า Webhook URL: `https://your-domain.com/line/webhook`
4. คัดลอก Channel Access Token และ Channel Secret

### 5. ตั้งค่า Google API
1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. สร้างโปรเจคใหม่และเปิดใช้งาน Google Calendar API และ Google Sheets API
3. สร้าง OAuth 2.0 credentials
4. ตั้งค่า Google Sheet และแชร์ให้ service account

### 6. รันโปรเจค
```bash
# Development
npm run dev

# Production
npm start
```

## 🚀 การ Deploy ขึ้น Host

### วิธีที่ 1: Deploy ด้วย Docker

#### 1. สร้างไฟล์ .env
```bash
cp env.example .env
# แก้ไขไฟล์ .env ตามที่ต้องการ
```

#### 2. Build และรันด้วย Docker
```bash
# Build Docker image
docker build -t line-exercise-bot .

# รัน container
docker run -d \
  --name line-exercise-bot \
  --env-file .env \
  -p 3000:3000 \
  --restart unless-stopped \
  line-exercise-bot
```

#### 3. รันด้วย Docker Compose
```bash
docker-compose up -d
```

### วิธีที่ 2: Deploy บน VPS/Cloud Server

#### 1. เตรียม Server
```bash
# อัปเดตระบบ
sudo apt update && sudo apt upgrade -y

# ติดตั้ง Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# ติดตั้ง PM2 สำหรับ process management
sudo npm install -g pm2
```

#### 2. Clone และตั้งค่าโปรเจค
```bash
# Clone โปรเจค
git clone <repository-url>
cd line-calendar-sheet

# ติดตั้ง dependencies
npm install

# สร้างไฟล์ .env
cp env.example .env
nano .env  # แก้ไขค่าต่างๆ
```

#### 3. รันด้วย PM2
```bash
# สร้าง PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'line-exercise-bot',
    script: 'src/server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF

# รันด้วย PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### วิธีที่ 3: Deploy บน Heroku

#### 1. เตรียมไฟล์สำหรับ Heroku
```bash
# สร้างไฟล์ Procfile
echo "web: node src/server.js" > Procfile

# สร้างไฟล์ app.json
cat > app.json << EOF
{
  "name": "line-exercise-bot",
  "description": "LINE Exercise Bot with Google Calendar integration",
  "repository": "https://github.com/your-username/line-calendar-sheet",
  "keywords": ["line", "bot", "exercise", "calendar", "google"],
  "env": {
    "NODE_ENV": {
      "description": "Environment",
      "value": "production"
    },
    "PORT": {
      "description": "Port number",
      "value": "3000"
    }
  }
}
EOF
```

#### 2. Deploy บน Heroku
```bash
# ติดตั้ง Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login และสร้าง app
heroku login
heroku create your-app-name

# ตั้งค่า environment variables
heroku config:set LINE_CHANNEL_ACCESS_TOKEN=your_token
heroku config:set LINE_CHANNEL_SECRET=your_secret
heroku config:set GOOGLE_CLIENT_ID=your_client_id
heroku config:set GOOGLE_CLIENT_SECRET=your_client_secret
heroku config:set GOOGLE_REFRESH_TOKEN=your_refresh_token
heroku config:set SHEET_ID=your_sheet_id

# Deploy
git push heroku main
```

### วิธีที่ 4: Deploy บน Railway

#### 1. เตรียมไฟล์สำหรับ Railway
```bash
# สร้างไฟล์ railway.json
cat > railway.json << EOF
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node src/server.js",
    "healthcheckPath": "/line/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
EOF
```

#### 2. Deploy บน Railway
1. ไปที่ [Railway.app](https://railway.app)
2. เชื่อมต่อ GitHub repository
3. ตั้งค่า environment variables
4. Deploy อัตโนมัติ

## 🔧 การตั้งค่า Webhook

### 1. ตั้งค่า LINE Bot Webhook
1. ไปที่ [LINE Developers Console](https://developers.line.biz/)
2. เลือก Channel ของคุณ
3. ไปที่แท็บ "Messaging API"
4. ตั้งค่า Webhook URL: `https://your-domain.com/line/webhook`
5. เปิดใช้งาน "Use webhook"

### 2. ทดสอบ Webhook
```bash
# ทดสอบ health check
curl https://your-domain.com/line/health

# ทดสอบ root endpoint
curl https://your-domain.com/line/
```

### 3. ตรวจสอบ Logs
```bash
# Docker
docker logs line-exercise-bot

# PM2
pm2 logs line-exercise-bot

# Heroku
heroku logs --tail

# Railway
# ดู logs ใน dashboard
```

## 📱 การใช้งาน

### คำสั่งที่ใช้ได้

| คำสั่ง | คำอธิบาย |
|--------|----------|
| `ออกกำลังกาย` | ดูตารางการออกกำลังกายวันนี้ |
| `ยืนยัน` | ยืนยันว่าออกกำลังกายแล้ว |
| `ข้าม` | ข้ามการออกกำลังกายวันนี้ |
| `สรุป` | ดูสรุปการออกกำลังกายสัปดาห์นี้ |
| `สมัคร` | สมัครรับการแจ้งเตือน |
| `ยกเลิก` | ยกเลิกการแจ้งเตือน |
| `ทดสอบ` | ทดสอบการแจ้งเตือน |
| `ช่วยเหลือ` | ดูคำสั่งทั้งหมด |

### ระบบแจ้งเตือน

- **7:00 น. ทุกวัน** - แจ้งเตือนการออกกำลังกายตอนเช้า
- **18:00 น. ทุกวัน** - แจ้งเตือนสำหรับคนที่ยังไม่ได้ออกกำลังกาย
- **20:00 น. วันอาทิตย์** - สรุปการออกกำลังกายประจำสัปดาห์

## 🏗️ โครงสร้างโปรเจค

```
src/
├── controllers/          # Controllers สำหรับจัดการ request
│   ├── line.controller.js
│   └── calendar.controller.js
├── services/            # Business logic
│   ├── line.service.js
│   ├── calendar.service.js
│   ├── sheet.service.js
│   ├── exercise.service.js
│   └── notification.service.js
├── routes/              # API routes
│   ├── line.routes.js
│   └── calendar.routes.js
├── config/              # Configuration files
│   ├── line.js
│   └── google.js
├── data/                # Data files
│   └── exerciseSchedule.js
├── utils/               # Utility functions
│   └── googleAuth.js
├── app.js               # Express app configuration
└── server.js            # Server entry point
```

## 📊 ตารางการออกกำลังกาย

### จันทร์ - วันแขนและไหล่
- Push-ups (วิดพื้น)
- Squats (นั่งยอง)
- Plank (ท่าแพลงก์)
- Jumping Jacks (กระโดดตบ)

### อังคาร - วันคาร์ดิโอ
- Burpees (เบอร์พี)
- Lunges (ท่าลันจ์)
- Mountain Climbers (ปีนเขา)
- High Knees (เข่าสูง)

### พุธ - วันหลังและแกนกลาง
- Pull-ups (ดึงข้อ)
- Dips (ท่าดิป)
- Russian Twists (บิดตัวรัสเซีย)
- Leg Raises (ยกขา)

### พฤหัสบดี - วันขาและน่อง
- Deadlifts (ท่าดีดลิฟต์)
- Calf Raises (ยกน่อง)
- Side Plank (แพลงก์ข้าง)
- Bicycle Crunches (ปั่นจักรยาน)

### ศุกร์ - วันคาร์ดิโอและความแข็งแรง
- Box Jumps (กระโดดขึ้นกล่อง)
- Pike Push-ups (วิดพื้นแบบพิก)
- Wall Sit (นั่งติดผนัง)
- Tricep Dips (ดิปไตรเซป)

### เสาร์ - วันฟังก์ชันนอล
- Bear Crawl (คลานแบบหมี)
- Single-leg Deadlifts (ดีดลิฟต์ขาเดียว)
- Hollow Body Hold (ท่าฮอลโลว์)
- Scissor Kicks (เตะกรรไกร)

### อาทิตย์ - วันพักผ่อน
- Yoga Flow (โยคะเบาๆ)
- Stretching (ยืดเหยียด)
- Meditation (นั่งสมาธิ)

## 🔧 การพัฒนา

### การเพิ่มท่าออกกำลังกายใหม่
แก้ไขไฟล์ `src/data/exerciseSchedule.js` เพื่อเพิ่มหรือแก้ไขท่าออกกำลังกาย

### การปรับเวลาการแจ้งเตือน
แก้ไขไฟล์ `src/services/notification.service.js` ในฟังก์ชัน `setupNotifications()`

### การเพิ่มฟีเจอร์ใหม่
1. เพิ่มฟังก์ชันใน `src/services/`
2. เพิ่ม controller ใน `src/controllers/`
3. เพิ่ม route ใน `src/routes/`

## 🐛 การแก้ไขปัญหา

### LINE Bot ไม่ตอบกลับ
- ตรวจสอบ Channel Access Token และ Channel Secret
- ตรวจสอบ Webhook URL
- ดู logs ใน LINE Developers Console

### Google API ไม่ทำงาน
- ตรวจสอบ credentials และ permissions
- ตรวจสอบ API quotas
- ตรวจสอบ refresh token

### การแจ้งเตือนไม่ทำงาน
- ตรวจสอบ cron schedule
- ตรวจสอบว่าผู้ใช้สมัครรับการแจ้งเตือนแล้วหรือไม่
- ดู logs ใน console

## 📝 License

ISC

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 ติดต่อ

หากมีปัญหาหรือข้อสงสัย กรุณาสร้าง issue ใน GitHub repository
