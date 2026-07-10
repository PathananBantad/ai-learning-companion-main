# ใช้ Node.js LTS version 20 เป็นฐาน
FROM node:20-alpine

# กำหนดโฟลเดอร์ทำงานหลักในคอนเทนเนอร์
WORKDIR /app

# คัดลอกไฟล์จัดการ package เข้าไปก่อนเพื่อติดตั้ง dependencies
COPY package*.json ./

# ติดตั้ง dependencies ทั้งหมดรวมถึง typescript
RUN npm install

# คัดลอกโค้ดทั้งหมดในโปรเจกต์เข้าไปในคอนเทนเนอร์
COPY . .

# เปิดพอร์ตสำหรับเรียกใช้งาน (สมมติว่าใช้พอร์ต 3000 สำหรับ Backend)
EXPOSE 3000

# รันระบบในโหมดพัฒนา (Development) อ้างอิงคำสั่งตามที่มีใน package.json ของคุณ
CMD ["npm", "run", "dev"]