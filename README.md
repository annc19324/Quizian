# Quizian - Ứng Dụng Học Tập Trắc Nghiệm Thông Minh

Dự án Fullstack bao gồm:
- **Client**: Next.js 14, React, TailwindCSS
- **Server**: Node.js, Express, PostgreSQL, Prisma ORM

## Yêu cầu
- Node.js 18+
- PostgreSQL (và pgAdmin4 để quản lý)
- Git

## Cài đặt

Clone dự án:
```bash
git clone https://github.com/annc19324/Quizian.git
cd Quizian
```

### 1. Setup Backend (Server)

```bash
cd server
npm install
```

Cấu hình Database:
1. Tạo database tên `quizian` trong pgAdmin4 (hoặc chạy SQL: `CREATE DATABASE quizian;`)
2. Copy file `.env.example` thành `.env`:
   ```bash
   cp .env.example .env
   ```
3. Sửa `DATABASE_URL` trong file `.env` nếu password của bạn khác mặc định (`postgres`).

Đồng bộ cơ sở dữ liệu:
```bash
npx prisma db push
```

Chạy Server:
```bash
npm run dev
# Server sẽ chạy tại http://localhost:5000
```

### 2. Setup Frontend (Client)

Mở terminal mới:
```bash
cd client
npm install
```

Chạy Client:
```bash
npm run dev
# Mở trình duyệt tại http://localhost:3000
```

## Cấu trúc thư mục

```
Quizian/
├── client/          # Frontend Next.js
│   ├── app/         # Pages & Routes
│   ├── components/  # React Components
│   └── lib/         # Utilities (API config)
├── server/          # Backend Node.js
│   ├── src/
│   │   ├── routes/  # API Routes
│   │   └── index.ts # Entry point
│   ├── prisma/      # Database Schema
│   └── .env         # Config (DB URL, JWT Secret)
└── README.md
```
