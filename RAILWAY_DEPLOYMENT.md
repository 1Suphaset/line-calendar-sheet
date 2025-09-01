# 🚂 Railway Deployment Guide

คู่มือการ deploy LINE Exercise Bot บน Railway

## 🚀 ขั้นตอนการ Deploy

### 1. เตรียมโปรเจค

#### ตรวจสอบไฟล์ที่จำเป็น:
- ✅ `railway.json` - Railway configuration
- ✅ `package.json` - Node.js dependencies
- ✅ `src/server.js` - Entry point
- ✅ `env.example` - Environment variables template

#### ตรวจสอบ railway.json:
```json
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
```

### 2. สร้าง Railway Account

1. ไปที่ [Railway.app](https://railway.app)
2. คลิก "Login" และเลือก GitHub
3. Authorize Railway ให้เข้าถึง GitHub repositories

### 3. Deploy โปรเจค

#### วิธีที่ 1: Deploy จาก GitHub Repository

1. **Push โปรเจคขึ้น GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for Railway deployment"
   git push origin main
   ```

2. **สร้างโปรเจคใหม่ใน Railway:**
   - คลิก "New Project"
   - เลือก "Deploy from GitHub repo"
   - เลือก repository ของคุณ
   - คลิก "Deploy Now"

3. **Railway จะ:**
   - Detect Node.js project อัตโนมัติ
   - Install dependencies
   - Start application
   - ให้ URL สำหรับเข้าถึง

#### วิธีที่ 2: Deploy ด้วย Railway CLI

1. **ติดตั้ง Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login:**
   ```bash
   railway login
   ```

3. **Deploy:**
   ```bash
   railway init
   railway up
   ```

### 4. ตั้งค่า Environment Variables

#### ใน Railway Dashboard:
1. ไปที่โปรเจคของคุณ
2. คลิก "Variables" tab
3. เพิ่ม environment variables:

```env
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
LINE_CHANNEL_SECRET=your_line_channel_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=your_google_redirect_uri
GOOGLE_REFRESH_TOKEN=your_google_refresh_token
SHEET_ID=your_google_sheet_id
NODE_ENV=production
PORT=3000
```

#### ด้วย Railway CLI:
```bash
railway variables set LINE_CHANNEL_ACCESS_TOKEN=your_token
railway variables set LINE_CHANNEL_SECRET=your_secret
railway variables set GOOGLE_CLIENT_ID=your_client_id
railway variables set GOOGLE_CLIENT_SECRET=your_client_secret
railway variables set GOOGLE_REFRESH_TOKEN=your_refresh_token
railway variables set SHEET_ID=your_sheet_id
railway variables set NODE_ENV=production
```

### 5. ตั้งค่า Custom Domain (Optional)

1. ไปที่ "Settings" tab
2. คลิก "Domains"
3. เพิ่ม custom domain ของคุณ
4. ตั้งค่า DNS records ตามที่ Railway แนะนำ

### 6. ตั้งค่า LINE Bot Webhook

1. ไปที่ [LINE Developers Console](https://developers.line.biz/)
2. เลือก Channel ของคุณ
3. ไปที่ "Messaging API" tab
4. ตั้งค่า Webhook URL: `https://your-railway-app.railway.app/line/webhook`
5. เปิดใช้งาน "Use webhook"

### 7. ทดสอบการทำงาน

#### ทดสอบ Health Check:
```bash
curl https://your-railway-app.railway.app/line/health
```

#### ทดสอบ Root Endpoint:
```bash
curl https://your-railway-app.railway.app/
```

#### ทดสอบ LINE Bot:
- ส่งข้อความ "ช่วยเหลือ" ไปที่ LINE Bot
- ควรได้รับคำสั่งที่ใช้ได้

## 🔧 การจัดการ Railway

### ดู Logs:
```bash
railway logs
```

### Restart Application:
```bash
railway redeploy
```

### ดู Status:
```bash
railway status
```

### ดู Variables:
```bash
railway variables
```

## 📊 Monitoring

### Railway Dashboard:
- ดู CPU, Memory usage
- ดู Request logs
- ดู Error logs
- ดู Deployment history

### Health Check:
- Railway จะตรวจสอบ `/line/health` endpoint
- หากไม่ตอบสนอง จะ restart application อัตโนมัติ

## 🚨 Troubleshooting

### ปัญหาที่พบบ่อย:

#### 1. Application ไม่ start:
```bash
# ตรวจสอบ logs
railway logs

# ตรวจสอบ environment variables
railway variables
```

#### 2. LINE Bot ไม่ตอบกลับ:
- ตรวจสอบ webhook URL
- ตรวจสอบ LINE_CHANNEL_ACCESS_TOKEN
- ตรวจสอบ LINE_CHANNEL_SECRET

#### 3. Google API ไม่ทำงาน:
- ตรวจสอบ Google credentials
- ตรวจสอบ API quotas
- ตรวจสอบ refresh token

#### 4. Memory issues:
- Railway free tier มี memory limit
- ตรวจสอบ memory usage ใน dashboard
- ปรับ max_memory_restart ใน railway.json

### Debug Commands:
```bash
# ดู detailed logs
railway logs --follow

# ดู environment
railway run env

# ดู process info
railway run ps aux
```

## 💰 Pricing

### Free Tier:
- $5 credit ต่อเดือน
- 512MB RAM
- 1GB storage
- Custom domains
- SSL certificates

### Pro Plan:
- $5 ต่อเดือน
- 8GB RAM
- 100GB storage
- Priority support

## 🔄 Auto Deploy

Railway จะ auto deploy เมื่อ:
- Push code ใหม่ไป GitHub
- เปลี่ยน environment variables
- Manual redeploy

## 📝 Best Practices

1. **ใช้ environment variables** สำหรับ sensitive data
2. **Monitor logs** เป็นประจำ
3. **ตั้งค่า health check** ให้ถูกต้อง
4. **ใช้ custom domain** สำหรับ production
5. **Backup data** เป็นประจำ

## 🆘 Support

- Railway Documentation: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub Issues: สร้าง issue ใน repository
