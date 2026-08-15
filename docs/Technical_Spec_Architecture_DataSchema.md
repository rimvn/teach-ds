# 🛠️ CHUYÊN NGHỊỆP KỸ THUẬT: CẤU TRÚC DỮ LIỆU & KIẾN TRÚC MÃ NGUỒN (TECHNICAL SPECIFICATION & DATA SCHEMAS)

> **Dành cho:** Senior Software Developers & Technical Leads  
> **Mục tiêu:** Định nghĩa chính xác 100% Cấu trúc Database (SQLite/IndexedDB), IPC Event Bus, State Mutations và Xử lý Lỗi/Edge Cases để Dev lập trình không phải đoán logic.

---

## 1. SCHEMA DỮ LIỆU CẮT LỚP (DATA MODELS & SCHEMAS)

### 1.1. Schema `Student` (Học Sinh)
```typescript
interface Student {
  id: string;             // UUID v4
  classId: string;        // UUID lớp học (VD: '10A2')
  code: string;           // Mã học sinh (VD: 'HS1001')
  fullName: string;       // Họ và tên
  avatarSeed: string;     // Seed cho Dicebear Avatar
  deskPosition: string;   // Vị trí bàn học (VD: 'Bàn 1A')
  groupNumber: number;    // Tổ thi đua (1, 2, 3, 4)
  totalStars: number;     // Tích lũy sao thưởng học kỳ
  parentZaloPhone: string;// Số điện thoại Zalo Phụ huynh
  created_at: number;     // Timestamp Epoch
}
```

### 1.2. Schema `LessonCapsule` (Gói Tiết Dạy 5512)
```typescript
interface LessonCapsule {
  id: string;
  classId: string;
  subjectName: string;    // VD: 'Ngữ Văn 10'
  lessonTitle: string;    // VD: 'Bài 12: Lặng Lẽ Sa Pa'
  timetableSlot: string;  // VD: 'T3_T2' (Thứ 3 Tiết 2)
  attachedFiles: Array<{
    id: string;
    fileName: string;
    filePathLocal: string; // Absolute path ổ cứng local
    fileType: 'pptx' | 'pdf' | 'mp4' | 'quiz_link';
    fileSizeMB: number;
    cachedOffline: boolean;
  }>;
  activities5512: {
    act1_warmup: string;
    act2_knowledge: string;
    act3_practice: string;
    act4_apply: string;
  };
}
```

### 1.3. Schema `AudioAiDraftLog` (Nhật Ký Nháp AI Lắng Nghe)
```typescript
interface AudioAiDraftLog {
  id: string;
  lessonId: string;
  timestamp: string;      // VD: '18:25'
  slideIndex: number;     // Slide số mấy lúc giáo viên nói
  detectedStudentId: string; // ID học sinh được gợi ý
  detectedCriteria: Array<'troi_chay' | 'tu_tin' | 'dung_y' | 'sang_tao'>;
  suggestedStars: number;
  audioSnippetPath: string; // File wav 3s audio bối cảnh
  status: 'pending' | 'confirmed' | 'rejected';
}
```

---

## 2. IPC EVENT BUS & DUAL-SCREEN COMMUNICATION (MÀN HÌNH KÉP)

Màn hình Tivi (Window A) và Màn hình Dock Giáo viên (Window B) giao tiếp thời gian thực qua **IPC Broadcast / WebRTC Local / MessageChannel**:

```typescript
// IPC EVENT TYPES
type ClassroomIPCEvent = 
  | { type: 'SLIDE_NAVIGATE'; slideIndex: number }
  | { type: 'STUDENT_REWARDED'; studentId: string; stars: number; criteria: string }
  | { type: 'TRIGGER_WHEEL'; studentList: Array<Student> }
  | { type: 'TRIGGER_TIMER'; seconds: number }
  | { type: 'START_FIREWORKS'; topStudents: Array<Student> };
```

---

## 3. XỬ LÝ LỖI & EDGE CASES KỸ THUẬT (EDGE CASE HANDLING)

1. **Mạng Wifi trường bị đứt giữa tiết:**  
   - *Xử lý:* Hệ thống bật cờ `isOfflineMode = true`. Toàn bộ dữ liệu điểm sao ghi ngầm vào SQLite local. Không hiển thị bất kỳ pop-up lỗi nào gây phiền giáo viên. Khi mạng có trở lại, Background Sync Service đẩy ngầm lên Server.
2. **File PowerPoint (.pptx) có font chữ lạ hoặc nhúng video nặng:**  
   - *Xử lý:* Bộ đọc PPTX Reader dùng fallback render Canvas Slide + Tự động trích xuất file MP4 nhúng vào bộ đệm cache temp.
3. **Giáo viên nạp file Excel danh sách lớp sai cột:**  
   - *Xử lý:* Trình đọc Excel tự nhận diện các từ khóa tiêu đề cột (`Họ và tên`, `Mã HS`, `SĐT`). Nếu không nhận diện được, mở Modal "Mapping Cột Excel" cho giáo viên kéo thả nối cột trong 5 giây.
