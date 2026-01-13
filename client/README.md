# Quizian - Ứng Dụng Học Tập Trắc Nghiệm Thông Minh

Nền tảng tạo, chia sẻ và ôn tập các bài trắc nghiệm một cách dễ dàng và hiệu quả.

## Tính Năng Chính

### 🔐 Xác Thực
- Đăng ký tài khoản với username, họ tên, và mật khẩu
- Đăng nhập an toàn với JWT tokens
- Quản lý phiên làm việc

### ✏️ Tạo Bài Trắc Nghiệm
- **Tạo từng câu một**: Form tạo câu hỏi với đáp án A, B, C, D và chọn đáp án đúng
- **Dán hàng loạt**: Paste text theo định dạng đặc biệt để tạo nhiều câu hỏi cùng lúc
  ```
  1 + 1 bằng mấy?
  *2
  3
  5
  6
  ```
  (Dấu * đánh dấu đáp án đúng)

### 🎯 Ôn Tập
- Tùy chọn đảo câu hỏi ngẫu nhiên
- Tùy chọn đảo đáp án ngẫu nhiên
- Hiển thị từng câu một với:
  - Màu xanh lá cho đáp án đúng
  - Màu đỏ cho đáp án sai
  - Tự động chuyển câu sau 1 giây
- Grid hiển thị tất cả câu hỏi, click để nhảy đến câu bất kỳ
- Nút Next/Previous để điều hướng

### 📊 Kết Quả & Lịch Sử
- Hiển thị điểm số sau khi hoàn thành
- Chi tiết câu đúng/sai
- Click vào từng câu để xem lại
- Lưu lịch sử làm bài với điểm số và thống kê

### 🔗 Chia Sẻ
- Mỗi bài có link share duy nhất
- Người khác có thể làm bài qua link
- Tìm kiếm bài công khai theo tên hoặc từ khóa

## Công Nghệ Sử Dụng

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Animation**: Framer Motion
- **Backend**: Next.js API Routes
- **Database**: MongoDB với Mongoose
- **Authentication**: JWT, bcryptjs
- **UI Icons**: Lucide React
- **Notifications**: React Hot Toast

## Cài Đặt và Chạy

### 1. Cài đặt MongoDB
Đảm bảo MongoDB đang chạy trên máy của bạn:
```bash
mongod
```

Hoặc sử dụng MongoDB Atlas (cloud database)

### 2. Cấu hình môi trường
File `.env.local` đã được tạo sẵn với:
```
MONGODB_URI=mongodb://localhost:27017/quizian
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Lưu ý**: Thay đổi `JWT_SECRET` thành một chuỗi bảo mật ngẫu nhiên khi deploy production!

### 3. Cài đặt dependencies
```bash
npm install
```

### 4. Chạy development server
```bash
npm run dev
```

Mở trình duyệt và truy cập: `http://localhost:3000`

### 5. Build production
```bash
npm run build
npm start
```

## Hướng Dẫn Sử Dụng

### Đăng Ký và Đăng Nhập
1. Truy cập trang chủ
2. Click "Bắt Đầu Ngay" để đăng ký
3. Nhập username, họ tên, và mật khẩu
4. Sau khi đăng ký thành công, bạn sẽ được chuyển đến Dashboard

### Tạo Bài Trắc Nghiệm
1. Tại Dashboard, click "Tạo bài mới"
2. Nhập tiêu đề và mô tả (tùy chọn)
3. Chọn một trong hai cách:

   **Cách 1 - Tạo từng câu:**
   - Nhập nội dung câu hỏi
   - Nhập 4 đáp án A, B, C, D
   - Click vào nút A/B/C/D để chọn đáp án đúng (nút sẽ chuyển sang màu xanh)
   - Click "Thêm câu" để tạo câu tiếp theo
   - Click "Lưu bài" khi hoàn thành

   **Cách 2 - Dán hàng loạt:**
   - Chuyển sang tab "Dán hàng loạt"
   - Paste nội dung theo format:
     ```
     1 + 1 bằng mấy?
     *2
     3
     5
     6

     1 + 2 bằng mấy?
     2
     *3
     5
     6
     ```
   - Click "Lưu bài"

### Ôn Tập
1. Tìm bài trắc nghiệm tại tab "Bài của tôi" hoặc "Khám phá"
2. Click vào bài để vào màn hình chuẩn bị
3. Tùy chọn đảo câu hỏi/đáp án nếu muốn
4. Click "Bắt đầu"
5. Chọn đáp án:
   - Đúng → Màu xanh lá → Tự động chuyển câu sau 1 giây
   - Sai → Màu đỏ ở câu sai + Màu xanh ở đáp án đúng → Chuyển câu
6. Sử dụng grid phía trên để nhảy đến câu bất kỳ
7. Click "Hoàn thành" ở câu cuối để xem kết quả

### Chia Sẻ
1. Tại Dashboard, tìm bài muốn chia sẻ
2. Click nút "Chia sẻ"
3. Link sẽ được copy tự động
4. Gửi link cho bạn bè

### Xem Lịch Sử
1. Click nút "Lịch sử" tại Dashboard
2. Xem tất cả các lần làm bài
3. Xem thống kê: tổng số lần làm, điểm trung bình, số bài đã làm

## Cấu Trúc Thư Mục

```
Quizian/
├── app/
│   ├── api/           # API Routes
│   │   ├── auth/      # Authentication endpoints
│   │   ├── quizzes/   # Quiz CRUD
│   │   └── attempts/  # Attempt history
│   ├── dashboard/     # Dashboard page
│   ├── history/       # History page
│   ├── login/         # Login page
│   ├── register/      # Register page
│   ├── quiz/
│   │   ├── create/    # Create quiz page
│   │   └── [code]/    # Take quiz page
│   ├── globals.css    # Global styles
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Homepage
├── components/        # Reusable components
├── contexts/          # React contexts
├── lib/              # Utilities
├── models/           # MongoDB models
└── public/          # Static files
```

##Đóng Góp

Mọi đóng góp đều được chào đón! Hãy tạo issue hoặc pull request.

## License

MIT License
