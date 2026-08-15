# 🧪 BỘ KỊCH BẢN KIỂM THỬ QA/TEST & TIÊU CHÍ NGHIỆM THU (QA TEST SUITE & ACCEPTANCE MATRIX)

> **Dành cho:** QA / Tester / Automation Test Engineers  
> **Mục tiêu:** Cung cấp 100% kịch bản kiểm thử End-to-End (E2E), kiểm thử hiệu năng và kiểm thử chấp nhận người dùng (UAT) để đảm bảo chất lượng sản phẩm không lỗi khi ra mắt.

---

## 1. BỘ KỊCH BẢN KIỂM THỬ END-TO-END (E2E TEST SCENARIOS)

### 🧪 Kịch Bản E2E-01: Trình Chiếu Màn Hình Kép & Tích Điểm Nề Nếp Tức Thì
- **Tiền điều kiện:** Giáo viên đã chọn Lớp 10A2 và bấm `[🚀 BẮT ĐẦU DẠY TIẾT HỌC 1-CLICK]`.
- **Các bước thực hiện:**
  1. Kiểm tra Màn hình A (Tivi View) mở tràn màn hình slide 5.
  2. Dùng Bút trình chiếu USB bấm nút `PageDown`.
  3. Trên Màn hình B (PC Dock), chọn Avatar em "Nguyễn Văn An" và bấm `[+1 ⭐]`.
  4. Bấm nút `[🛑 KẾT THÚC TIẾT HỌC (60s CHỐT)]`.
- **Kết quả kỳ vọng (Pass Criteria):**
  - Màn hình Tivi chuyển sang Slide 6 trong thời gian `< 50ms`.
  - Trên Màn hình Tivi lập tức nổi hạt sáng + Tiếng "Ting ting" phát ra từ loa + Hiện Toast `"+1 ⭐ Em An - Tự tin diễn đạt"`.
  - Bảng Chốt Tiết AI hiển thị đúng em Nguyễn Văn An được +1 Sao.

### 🧪 Kịch Bản E2E-02: Import File Excel Danh Sách Lớp & Xếp Sơ Đồ Bàn Học 4x8
- **Tiền điều kiện:** Giáo viên vào màn hình `Scr 4.1: Quản Lý Lớp`.
- **Các bước thực hiện:**
  1. Bấm nút `[📥 Import Danh Sách Lớp Từ Excel]`.
  2. Chọn file `Danh_Sach_Lop_10A2_Format_Chuan.xlsx` (42 học sinh).
  3. Kiểm tra danh sách hiển thị trên Bảng dữ liệu và Sơ đồ chỗ ngồi 4x8.
- **Kết quả kỳ vọng (Pass Criteria):**
  - 42 học sinh được nạp 100% chính xác họ tên, mã HS và SĐT Zalo.
  - Sơ đồ chỗ ngồi 4x8 hiển thị đúng 4 dãy x 8 bàn với Avatar quái vật sắc nét.

---

## 2. KIỂM THỬ HIỆU NĂNG & BENCHMARK KỸ THUẬT (PERFORMANCE BENCHMARKS)

| Tiêu chí Kiểm thử | Ngưỡng Tối Đa Cho Phép (Pass Benchmark) | Phương pháp Đo đạc |
| :--- | :--- | :--- |
| **Độ trễ chuyển Slide qua Remote/Keyboard** | `< 50 ms` | Đo bằng Performance Profiler Chrome DevTools |
| **Thời gian nạp Gói bài giảng PPTX (25MB)** | `< 1.2 giây` | Đo từ thời điểm click Launch đến khi Tivi hiện Slide 1 |
| **Tải nguyên CPU/RAM khi chạy AI lắng nghe** | CPU `< 15%`, RAM `< 350 MB` | Test trên máy cấu hình thấp (Core i3 Gen 8, 4GB RAM) |
| **Độ trễ phát âm thanh "Ting ting" Web Audio** | `< 10 ms` | Web Audio Oscillator Instant Trigger Test |

---

## 3. CHECKLIST KIỂM THỬ AN TOÀN RIÊNG TƯ (HDMI MIRRORING PRIVACY TEST)

- [ ] **Test Case P-01:** Đảm bảo khi Zalo cá nhân của giáo viên có tin nhắn mới trên Laptop, thông báo pop-up của Zalo KHÔNG ĐƯỢC HIỂN THỊ lên Màn hình Tivi học sinh.
- [ ] **Test Case P-02:** Đảm bảo Bảng điểm riêng tư và Sổ ghi chép cá nhân của giáo viên chỉ xuất hiện trên Màn hình PC Dock, tuyệt đối không bị lộ lên Màn hình Tivi.
