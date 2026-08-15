# 🏃 HỒ SƠ PHÂN RÃ TASK THEO SPRINT AGILE/SCRUM CHO TOÀN BỘ TÍNH NĂNG DỰ ÁN (AGILE SPRINT BACKLOG & COMPLETE FEATURE DECOMPOSITION)

> **Dự án:** **LênLớp / Avina Class** (*Teaching OS & Live Class Workspace*)  
> **Căn cứ tài liệu:** [Mo_Ta_San_Pham.md](file:///d:/SDE%20Software/9Teach/Mo_Ta_San_Pham.md) & [Lo_Trinh_Trien_Khai_Master.md](file:///d:/SDE%20Software/9Teach/Lo_Trinh_Trien_Khai_Master.md)  
> **Quy chuẩn Agile:** 8 Sprints (mỗi Sprint 2 tuần = 16 tuần hoàn thành 100% toàn bộ 7 Module sản phẩm). Mỗi Task được phân rã nhỏ gọn (1 - 5 Story Points), mô tả chi tiết component, mô tả kỹ thuật và tiêu chí nghiệm thu (DoD).

---

## 🗺️ TỔNG QUAN LỘ TRÌNH 8 SPRINTS (SPRINT ROADMAP OVERVIEW)

```mermaid
gantt
    title LỘ TRÌNH 8 SPRINTS AGILE PHÁT TRIỂN TOÀN BỘ SẢN PHẨM LÊN LỚP (16 TUẦN)
    dateFormat  YYYY-MM-DD
    section Milestone 1: Core Wow Flow
    Sprint 1: Hạ Tầng Core & IPC Dual-Screen     :sp1, 2026-09-01, 14d
    Sprint 2: Launchpad & Slide Presenter Tivi   :sp2, after sp1, 14d
    section Milestone 2: AI & 5512
    Sprint 3: AI Silent Companion & Bảng 60s     :sp3, after sp2, 14d
    Sprint 4: Soạn Gói 5512 & OCR Thời Khóa Biểu :sp4, after sp3, 14d
    section Milestone 3: Class & Export
    Sprint 5: Sơ Đồ Lớp 4x8 & Import Excel       :sp5, after sp4, 14d
    Sprint 6: Thiệp Zalo Infographic & vnEdu Ex  :sp6, after sp5, 14d
    section Milestone 4: Module 7 & Commercial
    Sprint 7: Module 7 - Điểm Nóng & Quỹ Lớp     :sp7, after sp6, 14d
    Sprint 8: Slide Thứ 7, Hạnh Kiểm TT22 & Pro  :sp8, after sp7, 14d
```

---

## 🟢 SPRINT 1: HẠ TẦNG CORE SYSTEM & IPC MÀN HÌNH KÉP (TUẦN 1 - TUẦN 2)
> **Mục tiêu Sprint 1:** Xây dựng xong 100% phần móng Core (Store, Router, Storage Adapter & IPC Communication) để phục vụ tất cả các Sprint sau.

| Task ID | Tên Task Phân Rã Chi Tiết | Story Points | File / Component | Mô Tả Kỹ Thuật & DoD Nghiệm Thu |
| :---: | :--- | :---: | :--- | :--- |
| **TASK-SP1-01** | Lập trình Reactive CoreStore Engine | 3 SP | `src/core/Store.js` | Viết class Store với Pub/Sub pattern. Hỗ trợ Immutable State Proxy. **DoD:** `store.dispatch()` mutates state trong `< 2ms`. |
| **TASK-SP1-02** | Lập trình IPC Window Communication | 5 SP | `src/core/IPCDispatcher.js` | Kênh giao tiếp IPC MessageChannel giữa 2 cửa sổ Tivi View & Dock PC. **DoD:** Đẩy tin nhắn đồng bộ trong `< 10ms`. |
| **TASK-SP1-03** | Lập trình LocalFirst Storage Adapter | 5 SP | `src/core/adapters/LocalFirstAdapter.js` | Tạo DB SQLite/IndexedDB WAL mode. Tạo bảng `students`, `lessons`, `sync_queue`. **DoD:** Ngắt Wifi vẫn đọc/ghi 100%. |
| **TASK-SP1-04** | Lập trình Hybrid Audio Engine | 2 SP | `src/core/AudioSynthesizer.js` | Động cơ âm thanh lai: Ưu tiên phát file MP3/WAV vui nhộn (`star-chime.mp3`, `applause.mp3`, `fireworks.mp3`) + Web Audio Synthesizer dự phòng 0ms. **DoD:** Âm thanh phát sinh động trong `< 10ms`. |
| **TASK-SP1-05** | Predefined Subject & Grade Taxonomy Seed | 2 SP | `src/config/appConfig.js` | Nạp mặc định Danh mục Môn GDPT 2018 (Cấp 1, 2, 3) & Khối K1-K12 Trường Liên Cấp. **DoD:** App vừa khởi chạy là có sẵn 100% môn học & khối lớp. |

---

## 🟢 SPRINT 2: LAUNCHPAD & SLIDE PRESENTER TIVI (TUẦN 3 - TUẦN 4)
> **Mục tiêu Sprint 2:** Hoàn thiện trọn vẹn Luồng 1 (Bục giảng WOW): Giáo viên bấm 1-Click Launch ➔ Mở Slide Tivi ➔ Tích sao 1-Touch ➔ Bùng nổ Pháo hoa.

| Task ID | Tên Task Phân Rã Chi Tiết | Story Points | File / Component | Mô Tả Kỹ Thuật & DoD Nghiệm Thu |
| :---: | :--- | :---: | :--- | :--- |
| **TASK-SP2-01** | Lập trình Launchpad Hero Card | 3 SP | `src/views/LaunchpadView.js` | Render thẻ bài giảng sắp diễn ra, đếm ngược thời gian thực & nút 1-Click Launch. **DoD:** Bấm nút chuyển sang Live Workspace. |
| **TASK-SP2-02** | Slide Engine Adapter Pre-render RAM | 5 SP | `src/core/adapters/SlideEngineAdapter.js` | Render Slide Canvas 4K. Pre-render slide $N+1$ vào đệm RAM. Bắt phím USB Clicker. **DoD:** Chuyển slide trong `< 50ms`. |
| **TASK-SP2-03** | Màn hình Tivi View & Floating Toast | 4 SP | `src/views/LiveWorkspaceView.js` | Render Màn hình Tivi cho học sinh + Thẻ Toast hạt sáng nổi khi nhận thưởng. **DoD:** Nổi Toast 60fps khi có sự kiện thưởng. |
| **TASK-SP2-04** | Thanh Trợ Lý PC Dock Control Panel | 4 SP | `src/views/LiveWorkspaceView.js` | Dock riêng tư giáo viên: Grid học sinh tích sao 1-Touch, Vòng quay & Đồng hồ. **DoD:** Bấm Avatar ➔ Tivi nổi sao + Tiếng Ting ting. |
| **TASK-SP2-05** | Celebration Fireworks Canvas Engine | 3 SP | `src/views/CelebrationView.js` | Canvas hiệu ứng pháo hoa 120 hạt particle physics vinh danh học sinh TOP 1. **DoD:** Render pháo hoa mượt mà 60fps khi chốt tiết. |

---

## 🔵 SPRINT 3: TRỢ LÝ AI LẮNG NGHE & BẢNG CHỐT 60S (TUẦN 5 - TUẦN 6)
> **Mục tiêu Sprint 3:** Hoàn thiện tính năng AI lắng nghe thầm lặng trên bục giảng và Bảng chốt tiết AI 60s.

| Task ID | Tên Task Phân Rã Chi Tiết | Story Points | File / Component | Mô Tả Kỹ Thuật & DoD Nghiệm Thu |
| :---: | :--- | :---: | :--- | :--- |
| **TASK-SP3-01** | AudioWorklet Ring Buffer 3s Worker | 5 SP | `src/core/audio/AudioRingWorker.js` | AudioWorklet thu Micro ngầm. Lưu bộ đệm xoay vòng 3s. Sample rate 16000Hz. **DoD:** CPU ngốn `< 15%`, RAM `< 350MB`. |
| **TASK-SP3-02** | Keyword Spotting (KWS) Pedagogy Engine | 5 SP | `src/core/audio/AudioAiProcessor.js` | Nhận diện từ khóa sư phạm ("Khen em...", "Mời em..."). Trích xuất file WAV 3s. **DoD:** Nhận diện đúng từ khóa và tạo file WAV. |
| **TASK-SP3-03** | Bảng Chốt Tiết AI Confirm Board | 3 SP | `src/views/PostClassView.js` | Render danh sách thẻ nháp AI đề xuất điểm sao và tiêu chí khen thưởng. **DoD:** Bấm xác nhận ➔ Tích điểm và kích hoạt pháo hoa. |
| **TASK-SP3-04** | 3s Audio Context Replay Player | 2 SP | `src/components/AudioReplayDrawer.js` | Player phát lại file WAV 3s âm thanh bối cảnh gốc qua loa. **DoD:** Bấm nút `[🔊 Play 3s]` ➔ Loa phát tiếng trong `< 50ms`. |

---

## 🔵 SPRINT 4: SOẠN BÀI 5512 & OCR THỜI KHÓA BIỂU (TUẦN 7 - TUẦN 8)
> **Mục tiêu Sprint 4:** Hoàn thiện công tác chuẩn bị bài dạy 5512 và đọc Thời khóa biểu tự động.

| Task ID | Tên Task Phân Rã Chi Tiết | Story Points | File / Component | Mô Tả Kỹ Thuật & DoD Nghiệm Thu |
| :---: | :--- | :---: | :--- | :--- |
| **TASK-SP4-01** | Drag & Drop Capsule File Uploader | 3 SP | `src/views/CapsuleEditorView.js` | Dragzone nạp file PPTX/MP4/PDF. Tự động gắn nhãn `✔ Đã cache Offline`. **DoD:** Kéo file thả vào ➔ Lưu vào Local Storage. |
| **TASK-SP4-02** | Trình chỉnh sửa 4 Hoạt động 5512 | 3 SP | `src/views/CapsuleEditorView.js` | Tab chỉnh sửa Kế hoạch bài dạy 5512 (*Khởi động, Khám phá, Luyện tập, Vận dụng*). **DoD:** Nhập văn bản ➔ Lưu thành công Gói bài dạy. |
| **TASK-SP4-03** | Ma trận Thời khóa biểu Tuần Grid | 4 SP | `src/views/TimetableManagerView.js` | Lịch dạy tuần 6 ngày x 10 tiết. Bấm ô tiết học ➔ Gán gói bài dạy hoặc vào tiết. **DoD:** Hiển thị mượt mà 60 ô tiết học. |
| **TASK-SP4-04** | Excel TKB & AI OCR Photo Reader | 5 SP | `src/core/parsers/TimetableOCRReader.js` | Bộ đọc Excel TKB & Tesseract AI OCR đọc ảnh chụp thời khóa biểu. **DoD:** Upload ảnh TKB ➔ Điền chính xác 100% tiết dạy vào lịch. |
| **TASK-SP4-05** | Kho Tài Nguyên & Quản lý Thư mục | 2 SP | `src/views/ResourceBankView.js` | Quản lý thư mục bài giảng, slide và kế hoạch 5512 theo năm học. **DoD:** Tạo thư mục và tìm kiếm file thần tốc. |

---

## 🟣 SPRINT 5: SƠ ĐỒ LỚP 4X8 & IMPORT EXCEL DANH SÁCH (TUẦN 9 - TUẦN 10)
> **Mục tiêu Sprint 5:** Quản lý 42 học sinh, nạp Excel nhà trường và xếp Sơ đồ chỗ ngồi 4x8.

| Task ID | Tên Task Phân Rã Chi Tiết | Story Points | File / Component | Mô Tả Kỹ Thuật & DoD Nghiệm Thu |
| :---: | :--- | :---: | :--- | :--- |
| **TASK-SP5-01** | Excel Roster Reader & Column Mapper | 4 SP | `src/core/parsers/ExcelRosterParser.js` | Đọc file Excel danh sách lớp. Tự động khớp tiêu đề cột `Họ tên`, `Mã HS`, `SĐT`. **DoD:** Nạp 42 HS trong `< 500ms`. |
| **TASK-SP5-02** | Bảng Danh Sách Học Sinh Roster Table| 3 SP | `src/views/ClassRosterView.js` | Render bảng dữ liệu 42 học sinh với các chỉ số điểm sao tích lũy. **DoD:** Hiển thị mượt mà 42 dòng dữ liệu. |
| **TASK-SP5-03** | Sơ Đồ Chỗ Ngồi 4x8 Drag & Drop | 5 SP | `src/views/ClassRosterView.js` | Ma trận 4 dãy x 8 bàn. Kéo-Thả đổi chỗ ngồi giữa các bàn học. **DoD:** Kéo học sinh sang bàn khác ➔ Lưu vị trí mới vào DB. |
| **TASK-SP5-04** | Hồ Sơ Nề Nếp Học Sinh Drawer | 2 SP | `src/views/StudentProfileView.js` | Drawer hiển thị chi tiết lịch sử sao thưởng và nhận xét AI của em HS. **DoD:** Bấm tên học sinh ➔ Hiện Drawer thông tin chi tiết. |

---

## 🟣 SPRINT 6: THIỆP ZALO INFOGRAPHIC & EXPORT VNEDU (TUẦN 11 - TUẦN 12)
> **Mục tiêu Sprint 6:** Render Thiệp Báo Cáo Zalo Infographic và Động cơ xuất Excel chuẩn vnEdu / SMAS.

| Task ID | Tên Task Phân Rã Chi Tiết | Story Points | File / Component | Mô Tả Kỹ Thuật & DoD Nghiệm Thu |
| :---: | :--- | :---: | :--- | :--- |
| **TASK-SP6-01** | Zalo Card Canvas Generator (1080x1350) | 5 SP | `src/core/canvas/ZaloCardCanvasEngine.js` | HTML5 Canvas API vẽ Thiệp báo cáo tuần dạng ảnh PNG sắc nét (1080x1350px). **DoD:** Xuất file ảnh PNG đẹp mắt trong `< 800ms`. |
| **TASK-SP6-02** | Xem Trước & Gửi Zalo Phụ Huynh | 3 SP | `src/views/WeeklyReportsView.js` | Khung xem trước thiệp báo cáo + Select chọn học sinh + Nút gửi Zalo. **DoD:** Bấm nút `[Send Zalo]` ➔ Gọi deep link Zalo thành công. |
| **TASK-SP6-03** | Động cơ Xuất Excel Template vnEdu | 4 SP | `src/core/adapters/MinistryExportAdapter.js` | Viết file Excel `.xlsx` chuẩn 100% mẫu quy định của VNPT vnEdu. **DoD:** File xuất ra nộp Portal vnEdu không bị lỗi font. |
| **TASK-SP6-04** | Động cơ Xuất Excel Template SMAS | 3 SP | `src/core/adapters/MinistryExportAdapter.js` | Viết file Excel `.xlsx` chuẩn mẫu Viettel SMAS & eNetViet. **DoD:** Mở trong Excel hiển thị đúng cấu trúc cột quy định. |

---

## 🟠 SPRINT 7: MODULE 7 - ĐIỂM NÓNG AI & QUỸ LỚP ZALO (TUẦN 13 - TUẦN 14)
> **Mục tiêu Sprint 7:** Triển khai 3 màn hình đầu của Module 7 Quản lý Chủ nhiệm (Check-in, Hub Bộ môn & Điểm Nóng AI).

| Task ID | Tên Task Phân Rã Chi Tiết | Story Points | File / Component | Mô Tả Kỹ Thuật & DoD Nghiệm Thu |
| :---: | :--- | :---: | :--- | :--- |
| **TASK-SP7-01** | Morning Check-in 30s Widget | 3 SP | `src/views/HomeroomCheckinView.js` | Widget điểm danh vắng đầu ngày & nhắc nhở thu sổ đoàn/quỹ. **DoD:** Bấm tích vắng ➔ Ghi nhận sĩ số lớp chủ nhiệm. |
| **TASK-SP7-02** | Cross-Subject Data Hub Aggregator | 4 SP | `src/views/HomeroomHubView.js` | Tập hợp toàn bộ sao thưởng & vi phạm từ các GVBM khác dạy lớp 10A2. **DoD:** Điểm GVBM khác chấm nhảy tự động về Hub GVCN. |
| **TASK-SP7-03** | Thẻ Cảnh Báo "Điểm Nóng AI" (Scr 7.3) | 4 SP | `src/views/HomeroomAnalyticsView.js` | AI bóc tách học sinh vắng/sa sút + Biểu đồ Radar 5 Tiêu chí Rèn luyện. **DoD:** Vắng > 3 tiết ➔ Hiện thẻ đỏ + Nút `[Gửi Zalo PH]`. |
| **TASK-SP7-04** | Nhật Ký Thu Chi Quỹ Lớp (Scr 7.4) | 3 SP | `src/views/HomeroomFundView.js` | Bảng thu chi minh bạch + Khung mã VietQR thu quỹ lớp 300,000đ. **DoD:** Phụ huynh chuyển khoản ➔ Tự động gạch nợ thành công. |
| **TASK-SP7-05** | Nút Nhắc Nợ Quỹ Zalo Dịu Dàng | 2 SP | `src/views/HomeroomFundView.js` | Nút gửi tin nhắn Zalo nhắc nộp quỹ lớp đến các phụ huynh chưa nộp. **DoD:** Bấm nút ➔ Gửi tin nhắn Zalo nhắc nợ lịch sự. |

---

## 🟠 SPRINT 8: SLIDE THỨ 7, HẠNH KIỂM TT22 & VIETQR PRO (TUẦN 15 - TUẦN 16)
> **Mục tiêu Sprint 8:** Hoàn thiện 2 màn hình cuối Module 7 (Scr 7.5 Hạnh kiểm TT22), Slide Thứ 7 & Thương mại hóa VietQR Pro.

| Task ID | Tên Task Phân Rã Chi Tiết | Story Points | File / Component | Mô Tả Kỹ Thuật & DoD Nghiệm Thu |
| :---: | :--- | :---: | :--- | :--- |
| **TASK-SP8-01** | Slide Trình Chiếu Thứ 7 Auto-Deck | 5 SP | `src/views/LiveWorkspaceView.js` | AI tự động sinh Slide Thi đua Tổ 1 vs 2 vs 3 + Vinh Danh Ngôi Sao Tuần. **DoD:** Bấm 1-Click Thứ 7 ➔ Chiếu ngay Slide Thi đua Tổ. |
| **TASK-SP8-02** | Ma Trận Đề Xuất Hạnh Kiểm TT22 | 4 SP | `src/views/HomeroomTT22View.js` | Bảng xếp loại Rèn luyện (*Tốt/Khá/Đạt*) chuẩn Thông tư 22 kèm minh chứng. **DoD:** AI đề xuất chính xác mức xếp loại 42 học sinh. |
| **TASK-SP8-03** | 1-Click Đồng Bộ TT22 Lên vnEdu | 4 SP | `src/views/HomeroomTT22View.js` | Nút 1-Click đẩy kết quả xếp loại rèn luyện 42 HS lên hệ thống vnEdu. **DoD:** Bấm nút ➔ Đẩy dữ liệu thành công trong 3 giây. |
| **TASK-SP8-04** | Settings Pro & Micro AI Soundbar | 2 SP | `src/views/SettingsProView.js` | Cấu hình phím tắt Bút trình chiếu, Micro AI test soundbar & License. **DoD:** Test độ nhạy micro hiển thị cột sóng xanh lá. |
| **TASK-SP8-05** | VietQR PayOS Webhook Auto-Sync | 4 SP | `src/views/SettingsProView.js` | Mã VietQR động 50,000đ + Webhook listener tự nâng cấp bản Pro trong 3s. **DoD:** Quét QR chuyển 50k ➔ App nhảy thông báo Pro thành công. |
| **TASK-SP8-06** | Subject & Grade Taxonomy Manager UI | 2 SP | `src/views/SettingsProView.js` | Giao diện xem & tùy chỉnh danh mục Môn học GDPT 2018 và Mô hình Trường Liên Cấp. **DoD:** Hiển thị mượt mà bảng danh mục môn Cấp 1, 2, 3. |

---

## 🏆 KẾT LUẬN & CHUẨN MỰC THỰC THI SPRINT

Bản Phân Rã Task Theo Sprint Agile này đảm bảo:
1. **Toàn bộ 100% tính năng của sản phẩm** (18 Màn hình chính + 12 Modals + 4 Giai đoạn khép kín) được chia nhỏ thành **38 Agile Tasks** vừa vặn từ 2 đến 5 Story Points.
2. **Mỗi Sprint 2 tuần đều có sản phẩm chạy được và nghiệm thu dứt điểm (Deliverable Working Software)**.
3. **Không có bất kỳ tính năng nào bị làm tạm bợ hay lỡ dở**, đảm bảo bức tranh chung của hệ điều hành **LênLớp / Avina Class** được thi công hoàn hảo từ dòng code đầu tiên đến bản Release chính thức!
