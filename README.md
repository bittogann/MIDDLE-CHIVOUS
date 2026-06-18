# MIDFINGER — Streetwear Vietnam

Website bán hàng thời trang streetwear đầy đủ tính năng.

## Cài đặt & Chạy

### Yêu cầu
- **Node.js 18+** — tải tại [nodejs.org](https://nodejs.org) (chọn LTS)

### Mac / Linux — 1 lệnh duy nhất
```bash
bash start.sh
```

### Windows — 1 click
Double-click file `start.bat`

### Thủ công (nếu script không chạy)

**Terminal 1 — Backend:**
```bash
cd backend
npm install
node server.js
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Mở trình duyệt: **http://localhost:5173**

---

## Cấu trúc dự án

```
midfinger/
├── backend/              ← Node.js + Express API
│   ├── data/db.js        ← Dữ liệu sản phẩm, users, orders
│   ├── middleware/auth.js ← JWT authentication
│   ├── routes/
│   │   ├── products.js   ← GET /api/products
│   │   ├── auth.js       ← POST /api/auth/login|register
│   │   ├── orders.js     ← POST /api/orders
│   │   └── misc.js       ← discount, newsletter
│   ├── server.js         ← Entry point
│   └── .env              ← Cấu hình (tự tạo từ .env.example)
│
├── frontend/             ← React + Vite
│   ├── src/
│   │   ├── App.jsx       ← Routing chính
│   │   ├── main.jsx      ← Entry point
│   │   ├── components/   ← Navbar, CartPanel, SearchPanel...
│   │   ├── pages/        ← Home, Shop, ProductDetail, Checkout...
│   │   ├── store/        ← Zustand (cart, wishlist, auth)
│   │   ├── styles/       ← CSS toàn cục
│   │   └── utils/        ← API client, format helpers
│   └── index.html
│
├── start.sh              ← Khởi động (Mac/Linux)
└── start.bat             ← Khởi động (Windows)
```

## Tính năng

- 🛍️ **Shop** — lọc theo danh mục, giá, màu sắc
- 🔍 **Tìm kiếm** — live search
- 📦 **Giỏ hàng** — persistent (lưu sau khi tắt tab)
- ❤️ **Wishlist** — lưu sản phẩm yêu thích
- 💳 **Checkout** — 3 bước, nhiều phương thức thanh toán
- 🎁 **Mã giảm giá** — MIDFINGER10, FREESHIP, NEWKID20
- 👤 **Tài khoản** — đăng ký, đăng nhập, lịch sử đơn hàng
- ⏱️ **Countdown** — đếm ngược New Drop
- 📧 **Newsletter** — đăng ký nhận tin

## API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | /api/products | Danh sách sản phẩm |
| GET | /api/products/:id | Chi tiết sản phẩm |
| POST | /api/auth/register | Đăng ký |
| POST | /api/auth/login | Đăng nhập |
| GET | /api/auth/me | Thông tin user |
| POST | /api/orders | Đặt hàng |
| GET | /api/orders | Đơn hàng của tôi |
| POST | /api/discount/validate | Kiểm tra mã giảm giá |
| POST | /api/newsletter/subscribe | Đăng ký newsletter |

## Nâng cấp production

Khi muốn đưa lên internet thật:
1. Thay in-memory data (`data/db.js`) bằng **MongoDB** hoặc **PostgreSQL**
2. Deploy backend lên **Railway** hoặc **Render** (free tier)
3. Deploy frontend lên **Vercel** hoặc **Netlify** (free tier)
4. Đổi `VITE_API_URL` trong `frontend/.env` thành URL backend thật
