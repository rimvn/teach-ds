# 📋 HỒ SƠ PHÂN CÔNG NHIỆM VỤ & BREAKDOWN TASK CHI TIẾT CHO ĐỘI NGŨ DEV (DEVELOPER TASK BREAKDOWN & TECHNICAL ACCEPTANCE SPECIFICATION)

> **Dự án:** **LênLớp / Avina Class** (*Teaching OS & Live Class Workspace*)  
> **Tài liệu căn cứ:** [Core_Architecture_Senior_Dev_Spec.md](file:///d:/SDE%20Software/9Teach/Core_Architecture_Senior_Dev_Spec.md)  
> **Tuyên ngôn chất lượng:**  
> 1. Mỗi Task là một mảnh ghép kiến trúc hoàn chỉnh, **hiểu rõ Bối Cảnh Tổng Thể** từ đầu.  
> 2. **Tuyệt đối KHÔNG code tạm bợ / code chữa cháy (No Hacks/Placeholders)** để tránh việc tính năng sau bị giới hạn phải đập đi xây lại.  
> 3. Thực thi theo nguyên tắc **Cắt Dọc Luồng (Vertical Slice)**: Xong task nào là luồng đó chạy được 100%.

---

## 🗺️ MA TRẬN PHÂN CÔNG VAI TRÒ (DEVELOPER ROLE MATRIX)

| Vai Trò | Trách Nhiệm Kỹ Thuật Chính | Các Tasks Đảm Nhận |
| :--- | :--- | :--- |
| **Senior Core Engineer (Core/IPC)** | Lập trình phần Lõi State tập trung, IPC Màn hình kép & Local Storage | Tasks 1.1, 1.2, 4.4 |
| **Senior Frontend Engineer (UI/UX Engine)** | Lập trình Slide Engine, Canvas Generator, Dynamic Routing & Design Tokens | Tasks 1.3, 1.4, 2.3, 3.3 |
| **AI & Audio Engineer** | Lập trình AudioWorklet Ring Buffer 3s, Keyword Spotting & Speech Replay | Tasks 2.1, 2.2 |
| **Senior Fullstack Engineer (Data & Sync)** | Lập trình Parsers (Excel/OCR), Export vnEdu Engine & Cross-Subject Data Hub | Tasks 2.4, 3.1, 3.2, 3.4, 4.1, 4.2, 4.3 |

---

## 🟢 THREAD 1: BỤC GIẢNG WOW (CORE 45-MIN CLASSROOM THREAD - MILESTONE 1)

---

### 📌 TASK 1.1: Core Reactive Store & IPC Communication Engine (`CoreStore` & `IPCDispatcher`)
- **Phân công:** Senior Core Engineer
- **Bối cảnh Kiến trúc Tổng thể:**  
  Đây là "Trái tim" điều phối trạng thái (State Engine) của toàn hệ thống. Mọi thao tác tích điểm, chuyển slide hay bóc tách AI ở các Module sau đều phụ thuộc vào `CoreStore`. Do đó, `CoreStore` phải được thiết kế theo mô hình **Unidirectional Data Flow (Luồng dữ liệu đơn hướng)** kết hợp **Pub/Sub Store**, sẵn sàng cho việc đồng bộ 2 màn hình (Tivi View & Teacher Dock PC) qua IPC MessageChannel mà không bao giờ bị dập xung đột State.
- **Mô tả Kỹ thuật Chi tiết:**
  - File tạo lập: `src/core/Store.js` & `src/core/IPCDispatcher.js`.
  - Định nghĩa TypeScript Interfaces: `ICoreState`, `CoreAction`.
  - Viết Reducer xử lý Actions: `NAVIGATE_SLIDE`, `REWARD_STUDENT`, `TOGGLE_SOUND`, `SET_ACTIVE_LESSON`.
  - Thiết lập kênh IPC Dispatcher truyền nhận tin nhắn giữa 2 cửa sổ Electron/Tauri với độ trễ `< 10ms`.
- **Tuyệt đối KHÔNG:**  
  Không dùng biến toàn cục `window.state` rải rác. Không gán cứng DOM query selector trực tiếp trong Store.
- **Tiêu chí Nghiệm thu (DoD Task 1.1):**
  - [x] Gọi `store.dispatch({ type: 'REWARD_STUDENT', studentId: '1' })` ➔ Tự động thông báo cho tất cả Subscriber trong `< 2ms`.
  - [x] Đổi slide trên Dock PC ➔ Màn hình Tivi cập nhật slide tương ứng trong `< 10ms`.

---

### 📌 TASK 1.2: Local-First Storage Adapter (`LocalFirstAdapter`)
- **Phân công:** Senior Core Engineer / Fullstack Dev
- **Bối cảnh Kiến trúc Tổng thể:**  
  Trường học Việt Nam thường xuyên đứt Wifi hoặc mạng chập chờn. Ứng dụng phải hoạt động theo triết lý **Offline-First (Cơ sở dữ liệu Local là mặc định)**. Dữ liệu nề nếp, sĩ số, bài giảng được ghi xuống SQLite / IndexedDB tại ổ cứng máy tính giáo viên trước, sau đó mới đẩy ngầm (Background Sync) lên Cloud.
- **Mô tả Kỹ thuật Chi tiết:**
  - File tạo lập: `src/core/storage/LocalFirstAdapter.js`.
  - Tạo các bảng/tables: `students`, `lessons`, `points_log`, `homeroom_funds`, `sync_queue`.
  - Bật chế độ Write-Ahead Logging (WAL) để đảm bảo tốc độ ghi xuống đĩa cực nhanh.
  - Xây dựng hàng chờ `sync_queue` tự động đẩy log lên Cloud khi cờ `navigator.onLine === true`.
- **Tuyệt đối KHÔNG:**  
  Không bắt giáo viên chờ API Cloud phản hồi mới lưu điểm. Không làm mất dữ liệu khi tắt app đột ngột.
- **Tiêu chí Nghiệm thu (DoD Task 1.2):**
  - [x] Ngắt hoàn toàn Wifi ➔ App vẫn đọc/ghi điểm nề nếp và slide bình thường 100%.
  - [x] Bật lại Wifi ➔ `sync_queue` tự động đẩy dữ liệu ngầm lên Server trong 3 giây.

---

### 📌 TASK 1.3: Universal Slide Engine Adapter (`SlideEngineAdapter`)
- **Phân công:** Senior Frontend Engineer
- **Bối cảnh Kiến trúc Tổng thể:**  
  Giáo viên dùng nhiều định dạng bài giảng khác nhau (.pptx, .pdf, video .mp4). Slide Engine phải đóng vai trò là một **Adapter độc lập**, đọc và render slide lên màn hình Tivi với tốc độ cao, hỗ trợ phím bấm Bút trình chiếu USB (`PageDown` / `PageUp`) phản hồi tức thì.
- **Mô tả Kỹ thuật Chi tiết:**
  - File tạo lập: `src/core/adapters/SlideEngineAdapter.js`.
  - Tích hợp bộ chuyển đổi Canvas Slide.
  - Thiết lập thuật toán **Pre-render đệm RAM**: Khi đang ở Slide $N$, tự động nạp trước Slide $N+1$ vào Canvas ẩn.
  - Bắt sự kiện bàn phím toàn cục `keydown`: `PageDown`, `PageUp`, `ArrowRight`, `ArrowLeft`, `Space`.
- **Tuyệt đối KHÔNG:**  
  Không phụ thuộc vào việc máy tính giáo viên phải cài sẵn Microsoft Office PowerPoint. Không bị trễ khung hình (Zero Frame Drop) khi bấm chuyển slide.
- **Tiêu chí Nghiệm thu (DoD Task 1.3):**
  - [x] Bấm phím `PageDown` trên Bút trình chiếu USB ➔ Slide trên Tivi chuyển trang trong `< 50ms`.
  - [x] Chạy ứng dụng trình chiếu 8 tiếng liên tục ➔ RAM giữ ổn định `< 350MB`, không bị rò rỉ bộ nhớ.

---

### 📌 TASK 1.4: Web Audio Synthesizer & Floating Star Toast (`AudioSynthesizer` & `ToastOverlay`)
- **Phân công:** Senior Frontend Engineer / UI UX Dev
- **Bối cảnh Kiến trúc Tổng thể:**  
  Đây là trải nghiệm vinh danh tức thì (Immediate Gratification) tạo cảm hứng học tập cho học sinh. Mỗi khi giáo viên chạm Avatar khen thưởng trên thanh Dock PC, Màn hình Tivi lập tức nổi hạt sáng sao vàng kèm âm thanh "Ting ting" vui tai.
- **Mô tả Kỹ thuật Chi tiết:**
  - File tạo lập: `src/core/AudioSynthesizer.js` & `src/components/ToastOverlay.js`.
  - Sử dụng Web Audio API `OscillatorNode` (Tần số 880Hz ➔ 1760Hz) tạo tiếng chime "Ting ting" chân thực mà không cần tải file `.mp3` bên ngoài.
  - Xây dựng hiệu ứng Toast nổi hạt sáng với CSS Keyframe `cubic-bezier(0.175, 0.885, 0.32, 1.275)`.
- **Tuyệt đối KHÔNG:**  
  Không dùng file âm thanh dung lượng nặng gây trễ tiếng. Âm thanh phải phát ra trong `< 10ms` ngay khi chạm màn hình.
- **Tiêu chí Nghiệm thu (DoD Task 1.4):**
  - [x] Bấm nút `[+1 ⭐]` em Nguyễn Văn An ➔ Loa phát tiếng "Ting ting" trong `< 10ms` + Tivi hiện Toast `"+1 ⭐ Em An - Tự tin diễn đạt"`.

---

## 🔵 THREAD 2: TRỢ LÝ AI LẮNG NGHE & SOẠN BÀI 5512 (MILESTONE 2)

---

### 📌 TASK 2.1: On-Device Audio Worklet Ring Buffer (`AudioWorkletRingBuffer`)
- **Phân công:** AI & Audio Processing Engineer
- **Bối cảnh Kiến trúc Tổng thể:**  
  Trợ lý AI lắng nghe thầm lặng trên bục giảng để bóc tách lời khen của giáo viên. Để ứng dụng không bị chậm máy hay tốn tài nguyên Cloud, âm thanh Micro được thu âm liên tục nhưng **chỉ lưu trong bộ đệm xoay vòng 3 giây (3-Second Ring Buffer)** trên Worker Thread riêng biệt.
- **Mô tả Kỹ thuật Chi tiết:**
  - File tạo lập: `src/core/audio/AudioRingWorker.js` & `src/core/audio/AudioAiProcessor.js`.
  - Sử dụng `AudioWorkletNode` với sample rate 16000Hz.
  - Tích hợp mô hình Keyword Spotting (KWS) nhận diện các cụm từ sư phạm ("Mời em...", "Khen em...", "Cho bạn...").
  - Khi phát hiện từ khóa ➔ Trích xuất 3 giây âm thanh vừa qua thành file `.wav` lưu vào thư mục đệm tạm.
- **Tuyệt đối KHÔNG:**  
  Không gửi toàn bộ 45 phút âm thanh lên Cloud Server (tốn chi phí và vi phạm riêng tư). Không chạy thu âm trên Main UI Thread.
- **Tiêu chí Nghiệm thu (DoD Task 2.1):**
  - [x] Nói vào Micro *"Khen em An diễn đạt trôi chảy"* ➔ Trích xuất chính xác file WAV 3 giây chứa đúng câu nói đó.
  - [x] CPU ngốn `< 15%` trong suốt quá trình AI lắng nghe ngầm.

---

### 📌 TASK 2.2: Post-Class AI 60s Review Board & Audio Replay (`PostClassView` & `AudioReplayDrawer`)
- **Phân công:** AI Engineer / Senior Frontend Dev
- **Bối cảnh Kiến trúc Tổng thể:**  
  Bảng Chốt Tiết AI 60 giây tuân thủ triết lý **Human-in-the-Loop (AI đề xuất - Giáo viên làm chủ)**. Giáo viên xem lại các lượt khen AI đã bóc tách trong tiết, bấm nghe lại 3s audio bối cảnh nếu quên, và bấm `[✔ XÁC NHẬN]` 1-Click để bùng nổ pháo hoa vinh danh.
- **Mô tả Kỹ thuật Chi tiết:**
  - File tạo lập: `src/views/PostClassView.js`.
  - Hiển thị danh sách thẻ nháp AI gồm: Thời gian, Slide số mấy, Tên học sinh đề xuất, Điểm sao & Tiêu chí.
  - Gắn sự kiện bấm `[🔊 Play 3s Audio]` ➔ Loa phát lại file WAV 3s bối cảnh gốc bằng Web Audio / Speech Synthesis.
  - Nút bấm `[✔ XÁC NHẬN & VINH DANH]` ➔ Cập nhật cộng sao vào Store và kích hoạt pháo hoa vinh danh trên Tivi.
- **Tiêu chí Nghiệm thu (DoD Task 2.2):**
  - [x] Bấm nút nghe lại audio ➔ Loa phát rõ ràng câu nói bối cảnh gốc của giáo viên.
  - [x] Bấm xác nhận ➔ Dữ liệu sao được ghi nhận chính xác và Tivi chuyển sang màn hình Vinh danh Pháo hoa.

---

### 📌 TASK 2.3: Lesson Plan 5512 Capsule Editor (`CapsuleEditorView`)
- **Phân công:** Senior Frontend Engineer
- **Bối cảnh Kiến trúc Tổng thể:**  
  Biên soạn bài dạy chuẩn Công văn 5512 của Bộ GD&ĐT. Giáo viên có thể đóng gói Slide PPTX, Video MP4, Link Quizizz và Kế hoạch 4 hoạt động thành một **Gói Tiết Dạy (Lesson Capsule)** hoàn chỉnh để sử dụng offline.
- **Mô tả Kỹ thuật Chi tiết:**
  - File tạo lập: `src/views/CapsuleEditorView.js`.
  - Lập trình khung Kéo-Thả File Uploader (Drag & Drop Dropzone).
  - Lập trình Trình chỉnh sửa 4 Hoạt động 5512 (*Khởi động, Khám phá, Luyện tập, Vận dụng*).
  - Tự động gắn nhãn `✔ Đã cache Offline` cho các file đính kèm.
- **Tiêu chí Nghiệm thu (DoD Task 2.3):**
  - [x] Kéo thả file PPTX và MP4 vào khung ➔ Lưu thành công Gói tiết dạy và sẵn sàng mở Offline.

---

### 📌 TASK 2.4: Timetable Matrix with Excel / AI OCR Reader (`TimetableManagerView`)
- **Phân công:** Senior Fullstack Engineer
- **Bối cảnh Kiến trúc Tổng thể:**  
  Ma trận Thời khóa biểu tuần 6 ngày x 10 tiết. Hệ thống tự động đối chiếu với Đồng hồ thời gian thực của máy tính để phát hiện tiết học sắp diễn ra (trong 3-5 phút) và hiển thị nút **`[Bắt đầu ngay 🚀]`** nổi bật trên Launchpad.
- **Mô tả Kỹ thuật Chi tiết:**
  - File tạo lập: `src/views/TimetableManagerView.js`.
  - Viết bộ đọc Excel TKB (`.xlsx`) tự phân tích ô tiết học.
  - Viết bộ quét ảnh TKB bằng AI OCR (Tesseract / Vision API) bóc tách tên môn và tên lớp từ ảnh chụp.
- **Tiêu chí Nghiệm thu (DoD Task 2.4):**
  - [x] Upload ảnh chụp TKB bằng điện thoại ➔ AI bóc tách chính xác 100% các tiết dạy vào ma trận tuần.

---

## 🟣 THREAD 3: SƠ ĐỒ LỚP & ĐỘNG CƠ ZALO / VNEDU (MILESTONE 3)

---

### 📌 TASK 3.1: Student Roster Excel Parser & State Hydrator (`ExcelRosterParser`)
- **Phân công:** Senior Fullstack Engineer
- **Bối cảnh Kiến trúc Tổng thể:**  
  Giúp giáo viên nạp danh sách 42+ học sinh của lớp mới chỉ trong 5 giây từ file Excel nhà trường mà không phải gõ tay từng em.
- **Mô tả Kỹ thuật Chi tiết:**
  - File tạo lập: `src/core/parsers/ExcelRosterParser.js`.
  - Thuật toán tự động nhận diện từ khóa tiêu đề cột: `Họ và tên`, `Mã HS`, `Ngày sinh`, `SĐT Zalo`.
  - Tự động sinh Seed Avatar quái vật độc bản cho từng học sinh.
- **Tiêu chí Nghiệm thu (DoD Task 3.1):**
  - [x] Chọn file Excel danh sách lớp ➔ Nạp thành công 42 học sinh vào hệ thống trong `< 500ms`.

---

### 📌 TASK 3.2: Interactive 4x8 Seating Chart Grid (`ClassRosterView`)
- **Phân công:** Senior Fullstack Engineer / UI UX Dev
- **Bối cảnh Kiến trúc Tổng thể:**  
  Mô phỏng chính xác sơ đồ chỗ ngồi 4 dãy x 8 bàn thực tế trong phòng học. Giúp giáo viên nhìn sơ đồ là biết ngay vị trí học sinh để tích điểm hoặc gọi phát biểu.
- **Mô tả Kỹ thuật Chi tiết:**
  - File tạo lập: `src/views/ClassRosterView.js`.
  - Lập trình Ma trận chỗ ngồi 4x8 với tính năng Kéo-Thả đổi chỗ ngồi (Drag & Drop Desk Position).
  - Hiển thị Avatar, tên học sinh và tổng số sao thưởng tích lũy trên từng bàn.
- **Tiêu chí Nghiệm thu (DoD Task 3.2):**
  - [x] Kéo thả đổi vị trí em An từ Bàn 1A sang Bàn 2B ➔ Vị trí mới được lưu cố định vào Database.

---

### 📌 TASK 3.3: Infographic Zalo Card Canvas Generator (`ZaloCardCanvasEngine`)
- **Phân công:** Senior Frontend Engineer (Canvas Specialist)
- **Bối cảnh Kiến trúc Tổng thể:**  
  Tự động vẽ Thiệp Báo Cáo Tuần dạng ảnh sắc nét (.PNG) để giáo viên gửi qua Zalo cho Phụ huynh. Đây là tính năng tạo lòng tin và sự yêu thích tuyệt đối từ Phụ huynh.
- **Mô tả Kỹ thuật Chi tiết:**
  - File tạo lập: `src/core/canvas/ZaloCardCanvasEngine.js`.
  - Sử dụng HTML5 Canvas API vẽ ảnh kích thước 1080x1350px (chuẩn tỉ lệ Zalo/Facebook).
  - Tự động điền: Avatar học sinh, số sao thưởng, huy hiệu đạt được, nhận xét AI và chữ ký giáo viên.
- **Tiêu chí Nghiệm thu (DoD Task 3.3):**
  - [x] Bấm nút `[🖼️ Tải Ảnh Thiệp]` ➔ Xuất file ảnh `.png` sắc nét trong `< 800ms`.

---

### 📌 TASK 3.4: Ministry Standard Export Engine (`MinistryExportAdapter`)
- **Phân công:** Senior Fullstack Engineer
- **Bối cảnh Kiến trúc Tổng thể:**  
  Thỏa mãn 100% yêu cầu nộp báo cáo hành chính cho Ban Giám Hiệu. Đẩy dữ liệu nề nếp và rèn luyện về các hệ thống bắt buộc như **vnEdu (VNPT)**, **SMAS (Viettel)**, **eNetViet**.
- **Mô tả Kỹ thuật Chi tiết:**
  - File tạo lập: `src/core/adapters/MinistryExportAdapter.js`.
  - Tạo bộ sinh file Excel `.xlsx` khớp 100% mẫu quy định của VNPT vnEdu và Viettel SMAS.
- **Tiêu chí Nghiệm thu (DoD Task 3.4):**
  - [x] Bấm `[Xuất Excel vnEdu]` ➔ Tải file `.xlsx` nộp BGH hoặc upload lên portal vnEdu thành công không bị lỗi font hay sai định dạng.

---

## 🟠 THREAD 4: CHỦ NIỆM DUAL-LOOP & VIETQR PRO (MILESTONE 4)

---

### 📌 TASK 4.1: 5-Minute Morning Check-in & Cross-Subject Data Hub (`HomeroomAnalyticsView`)
- **Phân công:** Senior Fullstack Engineer
- **Bối cảnh Kiến trúc Tổng thể:**  
  Module 7 Quản Lý Chủ Nhiệm. Giúp GVCN kiểm tra nề nếp lớp chủ nhiệm 10A2 mỗi sáng trong 30 giây và tự động thu thập điểm sao/vi phạm từ tất cả các GVBM khác dạy lớp 10A2.
- **Mô tả Kỹ thuật Chi tiết:**
  - File tạo lập: `src/views/HomeroomAnalyticsView.js`.
  - Lập trình Widget điểm danh 30s tự động báo cáo học sinh vắng.
  - Lập trình Biểu đồ Radar 5 Tiêu chí Rèn luyện & Thẻ Cảnh báo "Điểm Nóng AI" (học sinh sa sút, vắng học).
- **Tiêu chí Nghiệm thu (DoD Task 4.1):**
  - [x] Học sinh vắng quá 3 tiết ➔ Thẻ Cảnh Báo AI màu đỏ xuất hiện kèm nút `[📲 Gọi Zalo Phụ Huynh]`.

---

### 📌 TASK 4.2: Automated Saturday Homeroom Class Presenter (`HomeroomClassPresenter`)
- **Phân công:** Senior Frontend Engineer
- **Bối cảnh Kiến trúc Troung:**  
  Biến tiết Sinh hoạt Lớp Thứ 7 thành tiết học hào hứng. AI tự động tính toán điểm thi đua giữa các Tổ (Tổ 1 vs Tổ 2 vs Tổ 3) và sinh sẵn Slide trình chiếu Sinh hoạt Lớp mà GVCN không cần soạn tay.
- **Mô tả Kỹ thuật Chi tiết:**
  - Tích hợp chế độ Homeroom Presenter Mode trong `LiveWorkspaceView.js`.
  - Tự động sinh Slide Bảng Xếp Hạng Thi Đua Tổ + Vinh Danh Ngôi Sao Tuần + Pháo Hoa Tivi.
- **Tiêu chí Nghiệm thu (DoD Task 4.2):**
  - [x] Đến tiết Thứ 7, bấm `[Bắt đầu Tiết Sinh hoạt Lớp]` ➔ Tivi trình chiếu ngay Slide Thi đua Tổ 1 vs 2 vs 3.

---

### 📌 TASK 4.3: Term Conduct Grading TT22 Matrix (`HomeroomTT22View`)
- **Phân công:** Senior Fullstack Engineer
- **Bối cảnh Kiến trúc Tổng thể:**  
  Tự động hóa 100% quy trình đánh giá Rèn luyện / Hạnh kiểm cuối học kỳ chuẩn Thông tư 22/2021/TT-BGDĐT.
- **Mô tả Kỹ thuật Chi tiết:**
  - File tạo lập: `src/views/HomeroomTT22View.js`.
  - Thuật toán AI tính toán đề xuất mức xếp loại (*Tốt / Khá / Đạt / Chưa đạt*) kèm minh chứng.
  - Tích hợp nút `[🚀 1-CLICK ĐỒNG BỘ LÊN VNEDU / SMAS]`.
- **Tiêu chí Nghiệm thu (DoD Task 4.3):**
  - [x] Bấm nút đồng bộ ➔ Đẩy toàn bộ xếp loại Rèn luyện 42 học sinh lên hệ thống nhà trường trong 3 giây.

---

### 📌 TASK 4.4: VietQR PayOS Auto-Sync Webhook (`SettingsProView`)
- **Phân công:** Senior Core Engineer / Fullstack Dev
- **Bối cảnh Kiến trúc Tổng thể:**  
  Thương mại hóa gói LênLớp PRO (50,000đ/tháng). Quét VietQR thanh toán ➔ Tự động kích hoạt bản Pro trong 3 giây qua Webhook.
- **Mô tả Kỹ thuật Chi tiết:**
  - File tạo lập: `src/views/SettingsProView.js`.
  - Tích hợp API VietQR / PayOS sinh mã QR chuyển khoản động.
  - Xây dựng Webhook listener tự động mở khóa tính năng Pro ngay khi nhận tiền.
- **Tiêu chí Nghiệm thu (DoD Task 4.4):**
  - [x] Quét mã QR chuyển khoản 50,000đ từ App Ngân hàng ➔ Ứng dụng tự nhảy thông báo *"Đã nâng cấp LênLớp PRO thành công!"* trong 3 giây.

---

## 🏆 KẾT LUẬN & CAM KẾT CHẤT LƯỢNG MÃ NGUỒN

Tài liệu Phân Công Nhiệm Vụ & Breakdown Task Chi Tiết này đảm bảo:
1. **100% Developers hiểu rõ bối cảnh sản phẩm** trước khi gõ dòng code đầu tiên.
2. **Triển khai chuẩn mượt theo từng Vertical Thread**, không có tính năng làm tạm bợ hay code chữa cháy.
3. **Mỗi Task hoàn thành là một mảnh ghép hoàn hảo** đóng góp vào mục tiêu chung của hệ điều hành giảng dạy **LênLớp / Avina Class**!
