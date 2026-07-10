<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# 🤖 AI Learning Companion

ยินดีต้อนรับสมาชิกทีม Clown สู่โปรเจกต์ AI Learning Companion! ระบบที่ช่วยสร้าง Feedback Loop ระหว่างนักศึกษาและอาจารย์ ผ่าน AI (RAG-based)

โปรเจกต์นี้เป็นแบบ Monorepo ที่รวมทั้งส่วน Frontend (React/Vite) และ Backend (Express/Node.js) ไว้ในที่เดียว และใช้ Supabase เป็นฐานข้อมูลหลัก

---

## 🛠️ เครื่องมือที่ต้องติดตั้งในเครื่องก่อน (Prerequisites)

ก่อนเริ่มรันโปรเจกต์ ตรวจสอบให้แน่ใจว่าในเครื่องมีเครื่องมือเหล่านี้ติดตั้งอยู่:
* **Node.js**: เวอร์ชัน 20 หรือ 22 (แนะนำให้ใช้ LTS)
* **Git**: สำหรับดึงโค้ด
* **Docker Desktop**: (จำเป็นต้องเปิดรันไว้เบื้องหลัง หากต้องการใช้คำสั่ง Supabase CLI ดึงฐานข้อมูล)
* **Supabase CLI**: แนะนำให้ติดตั้งไว้ในเครื่อง เพื่อใช้จัดการฐานข้อมูล (ติดตั้งผ่าน npm: `npm install -g supabase`)

---

## 🚀 วิธีติดตั้งและรันโปรเจกต์ (Local Setup)

ทำตามขั้นตอนด้านล่างนี้เพื่อรันโปรเจกต์ในเครื่องของคุณ

### 1. โคลนโปรเจกต์ (Clone the Repository)
`
git clone https://github.com/PathananBantad/ai-learning-companion-main.git
cd ai-learning-companion-main
`
### 2. ติดตั้ง `npm install `

### 3. ตั้งค่าตัวแปรสภาพแวดล้อม (Environment Variables)
* ก๊อปปี้ไฟล์ .env.example แล้วเปลี่ยนชื่อเป็น .env

### 4. ซิงค์ฐานข้อมูล (Database Sync)
เนื่องจากเราใช้ Supabase เป็นฐานข้อมูลหลักบน Cloud คุณต้องดึงโครงสร้าง Type ล่าสุดมาไว้ในเครื่องเพื่อให้ TypeScript ทำงานได้ถูกต้อง

1. เปิดโปรแกรม Docker Desktop ทิ้งไว้เบื้องหลัง
2. รันคำสั่งดึง Type ล่าสุด
` supabase gen types typescript --project-id xwizcvnrdboiofxngczz > src/supabase.ts `

### 5. รัน `npm run dev`
