# Intern Project To-Do List

ระบบจัดการงานสำหรับ Admin และผู้ใช้ พัฒนาด้วย React, Vite และ Docker

## ความสามารถ

- Dashboard แยกตาม role
- Admin สร้างงาน กำหนดวันส่ง และมอบหมายผู้ใช้ได้หลายคน
- รองรับงานเดี่ยวและงานกลุ่ม
- Admin กรองงานตามผู้รับผิดชอบและสถานะ
- ผู้ใช้เห็นเฉพาะงานของตนเองและกรองตามสถานะ
- Admin เปลี่ยนสถานะงานได้ทั้ง `To Do` และ `Done`
- ผู้ใช้เปลี่ยนงานของตนเองจาก `To Do` เป็น `Done`
- แสดงงานเกินกำหนด

## รันด้วย Docker

ต้องติดตั้ง Docker Desktop ก่อน จากนั้นรันที่โฟลเดอร์โปรเจกต์:

```powershell
docker compose up --build -d
```

เปิด [http://localhost:8080](http://localhost:8080)

หยุดระบบ:

```powershell
docker compose down
```

## รันด้วย Node.js

```powershell
npm install
npm run dev
```

เปิด `http://localhost:5173`

## บัญชีทดสอบ

| Username | Password | Role |
|---|---|---|
| admin | admin123 | Admin |
| alice | alice123 | Employee |
| bob | bob123 | Employee |

ข้อมูล task เป็น mock data ใน memory ของ browser และจะ reset เมื่อ reload หน้าเว็บ

## Deploy ด้วย GitHub Pages

โปรเจกต์มี GitHub Actions สำหรับ build ตรวจสอบอัตโนมัติและ deploy ไป GitHub Pages:

1. สร้าง repository ใหม่บน GitHub แล้ว push โค้ดชุดนี้ไปที่ branch `main`
2. เปิด `Settings > Pages` และเลือก `Source: GitHub Actions`
3. รอ workflow `Deploy to GitHub Pages` ทำงานสำเร็จ แล้วเปิด URL ที่แสดงใน job

แอปใช้ hash routing เพื่อให้เปิดหน้า `#/login`, `#/admin` และ `#/employee` ได้แม้ refresh บน GitHub Pages

## Deploy ด้วย Docker

ใช้ Docker Compose ได้บนเครื่องหรือบริการที่รองรับ Docker:

```powershell
docker compose up --build -d
```

จากนั้นเปิดพอร์ต `8080` ตามที่กำหนดใน `docker-compose.yml`

## โครงสร้าง

```text
src/                  React application
  api.js              Mock API และ task operations
  AuthContext.jsx     Authentication state
  RouteGuard.jsx      Role-based route guard
  data.js             ผู้ใช้และข้อมูลเริ่มต้น
  main.jsx            Application entry point
  pages.jsx           Login และ dashboard pages
  styles.css          Application styles
schema.sql            PostgreSQL schema
Dockerfile            Multi-stage Docker build
docker-compose.yml    Docker service configuration
docker/nginx.conf     Nginx SPA fallback
```

## ตรวจสอบ

```powershell
npm run build
docker compose config
```
