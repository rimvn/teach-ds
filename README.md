# 🚀 TeachDS — Teach Digital Space (Hệ Điều Hành Giảng Dạy Số)

> **"Không gian Dạy học số & Workspace Bục giảng 1-Click dành cho Giáo viên K-12 Việt Nam"**

---

## 🌟 GIỚI THIỆU SẢN PHẨM

**TeachDS (Teach Digital Space)** là hệ điều hành bục giảng & không gian làm việc số khép kín (*All-in-One Digital Teaching OS*) giúp tối ưu hóa 100% quy trình giảng dạy, đánh giá nề nếp và quản lý chủ nhiệm cho Giáo viên Cấp 1, Cấp 2, Cấp 3 và các **Trường Liên Cấp (K-12 Multi-Level Schools)** tại Việt Nam.

---

## ✨ 3 ĐIỂM ĐỘT PHÁ CỦA TEACHDS

1. **🚀 1-Click Launch & Dual-Screen IPC Presenter:**
   Mở song song 2 màn hình: **Màn hình Tivi/Máy chiếu khổng lồ cho Học sinh** (xem slide 4K, hiệu ứng vinh danh pháo hoa) và **Thanh Trợ Lý PC Dock riêng tư cho Giáo viên** (tích sao 1-Touch, vòng quay may mắn, đồng hồ đếm ngược).

2. **🎙️ Silent AI Assistant & 60s Chốt Tiết Học:**
   AI lắng nghe thầm lặng trên bục giảng, tự động ghi nhận câu phát biểu, đề xuất thưởng sao và cho phép giáo viên duyệt chốt tiết học chỉ trong 60 giây.

3. **📊 Hệ Thống Quản Lý Chủ Nhiệm & Tự Động Hóa Bộ GD&ĐT (Module 7):**
   - **Bảng điểm nóng AI & Risk Radar:** Cảnh báo sớm học sinh vắng học / sa sút.
   - **Trung tâm Quỹ lớp VietQR & Zalo:** Tự động gạch nợ chuyển khoản & nhắn tin nhắc nộp quỹ.
   - **Xếp loại Rèn luyện Thông tư 22/2021/TT-BGDĐT:** AI đề xuất mức rèn luyện (*Tốt/Khá/Đạt*) & nút 1-Click đồng bộ lên **vnEdu** / **SMAS**.

---

## 🛠️ CÔNG NGHỆ (TECHNOLOGY STACK)

- **Frontend Core:** Vanilla HTML5, Modern ES6+ JavaScript, CSS3 (Custom Properties & Glassmorphism Tokens).
- **Build Tool:** Vite 5.x.
- **State & Architecture:** Reactive State Engine (Pub/Sub pattern), SPA Router with Lifecycle Hooks (`onMount`/`onUnmount`).
- **Audio Engine:** Web Audio API Sound Synthesizer (Instant 880Hz -> 1760Hz "Ting-Ting" chime).
- **Storage Layer:** Local-First Offline Storage (SQLite WAL / IndexedDB Adapter).
- **Taxonomy Engine:** GDPT 2018 Full Subject Catalog (Cấp 1, 2, 3) & K-12 Multi-Level School Profile (`SchoolType.K12_FULL`).

---

## 📂 HỆ THỐNG TÀI LIỆU KIẾN TRÚC & QUẢN LÝ DỰ ÁN (`/docs`)

Dự án được xây dựng dựa trên bộ 14 tài liệu đặc tả kỹ thuật và chiến lược chi tiết trong thư mục [`docs/`](./docs):

1. 📄 [Mo_Ta_San_Pham.md](./docs/Mo_Ta_San_Pham.md) — *Mô tả Tầm nhìn & 4 Giai đoạn khép kín.*
2. 📄 [Chien_Luoc_Kinh_Doanh.md](./docs/Chien_Luoc_Kinh_Doanh.md) — *Chiến lược Doanh thu $1M-$3M ARR & GTM B2C2B.*
3. 📄 [Chien_Luoc_Canh_Tranh.md](./docs/Chien_Luoc_Canh_Tranh.md) — *Điểm chen chân Bục giảng & 4 Lợi thế so sánh với vnEdu / SMAS.*
4. 📄 [Lo_Trinh_Trien_Khai_Master.md](./docs/Lo_Trinh_Trien_Khai_Master.md) — *Lộ trình 4 Cột mốc Quản lý Dự án M1-M4.*
5. 📄 [Danh_Sach_Man_Hinh_UIUX.md](./docs/Danh_Sach_Man_Hinh_UIUX.md) — *Hồ sơ UI/UX 18 Màn hình & Left Sidebar 88px.*
6. 📄 [Technical_Spec_Architecture_DataSchema.md](./docs/Technical_Spec_Architecture_DataSchema.md) — *TypeScript Database Schemas & IPC Bus Spec.*
7. 📄 [Core_Architecture_Senior_Dev_Spec.md](./docs/Core_Architecture_Senior_Dev_Spec.md) — *4 Cụm Core Engine & Quy trình cắt dọc luồng.*
8. 📄 [Phan_Cong_Nhiem_Vu_Dev_Task_Breakdown.md](./docs/Phan_Cong_Nhiem_Vu_Dev_Task_Breakdown.md) — *Phân công Task Dev chi tiết & DoD nghiệm thu.*
9. 📄 [QA_Test_Cases_Acceptance_Criteria.md](./docs/QA_Test_Cases_Acceptance_Criteria.md) — *E2E Test Cases & Benchmarks hiệu năng.*
10. 📄 [UIUX_Design_System_MicroInteractions.md](./docs/UIUX_Design_System_MicroInteractions.md) — *Design Tokens, 12 Sub-modals & Hạt pháo hoa.*
11. 📄 [Huong_Dan_Lap_Trinh_Chi_Tiet_A_Z.md](./docs/Huong_Dan_Lap_Trinh_Chi_Tiet_A_Z.md) — *Hướng dẫn nối ghép mã nguồn line-by-line & Build production.*
12. 📄 [Agile_Sprint_Backlog_Task_Decomposition.md](./docs/Agile_Sprint_Backlog_Task_Decomposition.md) — *39 Agile Tasks phân rã theo 8 Sprints.*
13. 📄 [Kien_Truc_K12_NamHoc_MonHoc_TruongHoc.md](./docs/Kien_Truc_K12_NamHoc_MonHoc_TruongHoc.md) — *Môn GDPT 2018 Cấp 1-2-3, Chuyển giao Năm học & Trường Liên Cấp.*

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT & CHẠY ỨNG DỤNG

### 1. Yêu cầu hệ thống
- **Node.js**: v18.0.0 trở lên
- **npm**: v9.0.0 trở lên

### 2. Cài đặt Dependencies
```bash
npm install
```

### 3. Chạy môi trường Development (Port 3001)
```bash
npm run dev
```
Truy cập địa chỉ local: **`http://localhost:3001/`**

### 4. Đóng gói Production Bundle
```bash
npm run build
```

---

## 📜 LICENSE & BẢN QUYỀN
© 2026 **TeachDS Team**. All Rights Reserved.
