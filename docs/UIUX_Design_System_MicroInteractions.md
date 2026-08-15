# 🎨 CHUYÊN NGHỆP UI/UX: QUY CHUẨN DESIGN SYSTEM & MICRO-INTERACTIONS

> **Dành cho:** UI/UX Designers & Frontend Developers  
> **Mục tiêu:** Quy định toàn bộ CSS Design Tokens, Danh mục Sub-modals/Drawers và Hiệu ứng chuyển động (Micro-animations) để sản phẩm đạt tính thẩm mỹ cao nhất.

---

## 1. BỘ DESIGN TOKENS CHUẨN (CSS DESIGN SYSTEM)

```css
:root {
  /* COLOR PALETTE */
  --bg-primary: #090d16;        /* Nền tối sâu cho toàn hệ thống */
  --bg-secondary: #111827;      /* Nền card phụ */
  --bg-card: rgba(30, 41, 59, 0.7); /* Glassmorphism mờ nhòe kính */
  
  --accent-blue: #3b82f6;       /* Xanh hy vọng (Primary Action) */
  --accent-green: #10b981;      /* Xanh lá bùng nổ (1-Click Launch & Reward) */
  --accent-purple: #8b5cf6;     /* Tím trí tuệ (AI Engine & 5512) */
  --accent-gold: #f59e0b;       /* Vàng vinh danh (Top Star & VietQR Pro) */
  --accent-red: #ef4444;        /* Đỏ cảnh báo (End Lesson & Risk Alert) */

  /* TYPOGRAPHY FOR CLASSROOM VIEWING (5-7M DISTANCE) */
  --font-heading: 'Outfit', sans-serif;
  --font-serif: 'Playfair Display', serif;
  --font-body: 'Inter', sans-serif;

  /* RADIUS & SHADOWS */
  --radius-md: 14px;
  --radius-xl: 28px;
  --shadow-glow: 0 0 30px rgba(59, 130, 246, 0.25);
  --shadow-green: 0 0 30px rgba(16, 185, 129, 0.25);
  --shadow-gold: 0 0 40px rgba(245, 158, 11, 0.3);
}
```

---

## 2. DANH MỤC BAN HÀNH CÁC SUB-MODALS & DRAWERS (SUB-SCREENS INVENTORY)

Ngoài 18 Màn hình chính, hệ thống quy định thiết kế chi tiết cho **12 Sub-Modals / Drawers phụ**:

1. **`Modal 1.1A: Random Wheel (Vòng quay may mắn)`** — Bánh xe Canvas xoay gọi tên ngẫu nhiên.
2. **`Modal 1.1B: Countdown Timer (Đồng hồ 3 phút)`** — Số điện tử đếm ngược 72px xanh lá.
3. **`Drawer 1.2A: AI Live Speech Log`** — Nhị kịch nhận diện giọng nói nhảy thời gian thực.
4. **`Modal 2.2A: Audio Replay 3s Pop-up`** — Nút bấm nghe âm thanh bối cảnh gốc.
5. **`Modal 3.1A: Import Excel TKB Modal`** — Khung nạp file và xem trước lịch dạy.
6. **`Modal 3.1B: AI OCR Photo Scan Modal`** — Quét ảnh chụp thời khóa biểu.
7. **`Modal 3.2A: Drag and Drop Dropzone`** — Vùng kéo thả file PPTX / MP4.
8. **`Drawer 4.1A: Student Profile Drawer`** — Xem lịch sử rèn luyện của 1 học sinh.
9. **`Modal 4.2A: Drag Seating Position`** — Xếp chỗ ngồi học sinh trên sơ đồ 4x8.
10. **`Modal 5.1A: Export vnEdu / SMAS Options`** — Chọn mẫu Excel xuất báo cáo.
11. **`Modal 6.2A: Micro AI Test Soundbar`** — Thử độ nhạy Micro thu âm.
12. **`Modal 7.4A: Add Class Fund Log Entry`** — Nhập khoản thu/chi quỹ lớp mới.

---

## 3. THÔNG SỐ CHUYỂN ĐỘNG MICRO-INTERACTIONS (ANIMATION SPECS)

- **Hiệu ứng Hạt Sáng Nổi Khen Thưởng (Reward Toast Overlay):**  
  `animation: slideInDown 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);`
- **Hiệu ứng Pháo Hoa Vinh Danh (Fireworks Canvas):**  
  Sử dụng thuật toán hạt Particle Physics với 120 điểm sáng, phân rã alpha `decay: 0.015 - 0.035` ngẫu nhiên.
- **Hiệu ứng Nút Bắt Đầu 1-Click (`.btn-launch-giant`):**  
  Scale `1.03` khi hover, bóng đổ phát sáng xanh lá `box-shadow: var(--shadow-green)`.
