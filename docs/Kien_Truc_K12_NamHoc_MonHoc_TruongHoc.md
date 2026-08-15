# 🏫 CHUYÊN NGHỊỆP KIẾN TRÚC K12: DANH MỤC MÔN HỌC, CHUYỂN GIAO NĂM HỌC & ĐỒNG BỘ TRƯỜNG HỌC (K-12 EDUCATION ARCHITECTURE & SCHOOL MESH SYNC SPECIFICATION)

> **Dành cho:** Senior System Architects & Lead Developers  
> **Giải quyết 3 bài toán đặc thù cốt lõi của Giáo dục Phổ thông:**  
> 1. **Chuẩn hóa Danh mục Khối lớp & Môn học (GDPT 2018).**  
> 2. **Bản thiết kế Chuyển giao Năm học mới (Academic Year Transition) & Bảo tồn Lịch sử 3 năm Học bạ.**  
> 3. **Kiến trúc Mạng Đồng bộ Trường học (School Mesh Sync Engine):** Liên kết dữ liệu thời gian thực giữa các Giáo viên Bộ môn (GVBM) và Giáo viên Chủ nhiệm (GVCN) trong cùng một trường.

---

## 📐 1. CHUẨN HÓA DANH MỤC KHỐI LỚP & MÔN HỌC (GDPT 2018 TAXONOMY)

### 1.1. Hệ Thống Mã Khối Lớp (Grade Level Taxonomy)
Ứng dụng hỗ trợ linh hoạt 3 Cấp học Phổ thông tại Việt Nam:

```typescript
export enum EducationLevel {
  PRIMARY = 'PRIMARY',     // Cấp 1: Tiểu Học (Khối 1, 2, 3, 4, 5)
  LOWER_SEC = 'LOWER_SEC', // Cấp 2: THCS (Khối 6, 7, 8, 9)
  UPPER_SEC = 'UPPER_SEC'  // Cấp 3: THPT (Khối 10, 11, 12)
}

export enum SchoolType {
  PRIMARY_ONLY = 'PRIMARY_ONLY',           // Trường Tiểu học
  LOWER_SEC_ONLY = 'LOWER_SEC_ONLY',       // Trường THCS
  UPPER_SEC_ONLY = 'UPPER_SEC_ONLY',       // Trường THPT
  PRIMARY_LOWER_SEC = 'PRIMARY_LOWER_SEC', // Trường Liên cấp 1 & 2 (Tiểu học & THCS)
  LOWER_UPPER_SEC = 'LOWER_UPPER_SEC',   // Trường Liên cấp 2 & 3 (THCS & THPT)
  K12_FULL = 'K12_FULL'                    // Trường Liên cấp K-12 (Tiểu học - THCS - THPT)
}

export interface SchoolProfile {
  schoolId: string;        // VD: 'TRUONG_LIEN_CAP_ARCHIMEDES'
  schoolName: string;      // VD: 'Trường Liên cấp THCS & THPT Nguyễn Tất Thành'
  schoolType: SchoolType;  // Mô hình trường liên cấp
  activeLevels: EducationLevel[]; // Các cấp học đang vận hành
}

export interface GradeLevel {
  code: string;           // VD: 'K1', 'K5', 'K6', 'K10', 'K12'
  name: string;           // VD: 'Khối 1', 'Khối 5', 'Khối 6', 'Khối 10'
  level: EducationLevel;
}
```

### 1.2. Danh Mục Môn Học Chuẩn Bộ GD&ĐT (GDPT 2018 Full Subject Catalog)
Hệ thống bổ sung đầy đủ **Danh mục Môn học Cấp Tiểu Học** và **Cấp Trung Học (THCS & THPT)** chuẩn Bộ GD&ĐT:

```typescript
export interface SubjectTaxonomy {
  code: string;           // Mã môn chuẩn
  name: string;           // Tên môn hiển thị
  shortName: string;      // Tên viết tắt trên Thời khóa biểu
  icon: string;           // Emoji / Icon hiển thị
  level: EducationLevel[]; // Áp dụng cho cấp học nào
}

export const OFFICIAL_SUBJECTS: Record<string, SubjectTaxonomy> = {
  // === 🍏 MÔN HỌC CẤP TIỂU HỌC (LỚP 1 - LỚP 5) ===
  TIENG_VIET: { code: 'TIENG_VIET', name: 'Tiếng Việt',             shortName: 'T.Việt', icon: '📖', level: [EducationLevel.PRIMARY] },
  TOAN_TH:    { code: 'TOAN_TH',    name: 'Toán Tiểu Học',          shortName: 'Toán',   icon: '📐', level: [EducationLevel.PRIMARY] },
  TN_XH:      { code: 'TN_XH',      name: 'Tự Nhiên & Xã Hội (L1-3)',shortName: 'TNXH',   icon: '🌱', level: [EducationLevel.PRIMARY] },
  KHOA_HOC:   { code: 'KHOA_HOC',   name: 'Khoa Học (L4-5)',        shortName: 'K.Học',  icon: '🧪', level: [EducationLevel.PRIMARY] },
  LS_DL_TH:   { code: 'LS_DL_TH',   name: 'Lịch Sử & Địa Lý TH',    shortName: 'Sử-Địa', icon: '🗺️', level: [EducationLevel.PRIMARY] },
  DAO_DUC:    { code: 'DAO_DUC',    name: 'Đạo Đức',                shortName: 'Đ.Đức',  icon: '🕊️', level: [EducationLevel.PRIMARY] },
  AM_NHAC:    { code: 'AM_NHAC',    name: 'Âm Nhạc',                shortName: 'Nhạc',   icon: '🎵', level: [EducationLevel.PRIMARY, EducationLevel.LOWER_SEC] },
  MY_THUAT:   { code: 'MY_THUAT',   name: 'Mỹ Thuật',               shortName: 'Họa',    icon: '🎨', level: [EducationLevel.PRIMARY, EducationLevel.LOWER_SEC] },
  TIN_CN_TH:  { code: 'TIN_CN_TH',  name: 'Tin Học & Công Nghệ TH', shortName: 'Tin-CN', icon: '💻', level: [EducationLevel.PRIMARY] },

  // === 🍎 MÔN HỌC CẤP TRUNG HỌC (THCS & THPT) ===
  LIT:   { code: 'LIT',   name: 'Ngữ Văn',                  shortName: 'Văn',  icon: '📚', level: [EducationLevel.LOWER_SEC, EducationLevel.UPPER_SEC] },
  MATH:  { code: 'MATH',  name: 'Toán Học',                 shortName: 'Toán', icon: '📐', level: [EducationLevel.LOWER_SEC, EducationLevel.UPPER_SEC] },
  ENG:   { code: 'ENG',   name: 'Tiếng Anh',                shortName: 'Anh',  icon: '🇬🇧', level: [EducationLevel.PRIMARY, EducationLevel.LOWER_SEC, EducationLevel.UPPER_SEC] },
  PHYS:  { code: 'PHYS',  name: 'Vật Lý',                   shortName: 'Lý',   icon: '⚡', level: [EducationLevel.LOWER_SEC, EducationLevel.UPPER_SEC] },
  CHEM:  { code: 'CHEM',  name: 'Hóa Học',                  shortName: 'Hóa',  icon: '🧪', level: [EducationLevel.LOWER_SEC, EducationLevel.UPPER_SEC] },
  BIO:   { code: 'BIO',   name: 'Sinh Học',                 shortName: 'Sinh', icon: '🧬', level: [EducationLevel.LOWER_SEC, EducationLevel.UPPER_SEC] },
  HIST:  { code: 'HIST',  name: 'Lịch Sử',                  shortName: 'Sử',   icon: '🏛️', level: [EducationLevel.LOWER_SEC, EducationLevel.UPPER_SEC] },
  GEO:   { code: 'GEO',   name: 'Địa Lý',                   shortName: 'Địa',  icon: '🌍', level: [EducationLevel.LOWER_SEC, EducationLevel.UPPER_SEC] },
  CIVIC: { code: 'CIVIC', name: 'GD Kinh Tế & Pháp Luật / GDCD', shortName: 'GDCD', icon: '⚖️', level: [EducationLevel.LOWER_SEC, EducationLevel.UPPER_SEC] },
  CS:    { code: 'CS',    name: 'Tin Học',                  shortName: 'Tin',  icon: '💻', level: [EducationLevel.LOWER_SEC, EducationLevel.UPPER_SEC] },
  TECH:  { code: 'TECH',  name: 'Công Nghệ',                shortName: 'CN',   icon: '🔧', level: [EducationLevel.LOWER_SEC, EducationLevel.UPPER_SEC] },
  PE:    { code: 'PE',    name: 'Giáo Dục Thể Chất',        shortName: 'Thể',  icon: '⚽', level: [EducationLevel.PRIMARY, EducationLevel.LOWER_SEC, EducationLevel.UPPER_SEC] },
  DEF:   { code: 'DEF',   name: 'GD Quốc Phòng & An Ninh',  shortName: 'QPAN', icon: '🎖️', level: [EducationLevel.UPPER_SEC] },
  EXP:   { code: 'EXP',   name: 'Hoạt Động Trải Nghiệm',    shortName: 'HĐTN', icon: '🎡', level: [EducationLevel.PRIMARY, EducationLevel.LOWER_SEC, EducationLevel.UPPER_SEC] }
};
```

---

## 🔄 2. CHUYỂN GIAO NĂM HỌC MỚI & BẢO TỒN DỮ LIỆU 3 NĂM THPT

### 2.1. Kiến Trúc Phân Vùng Dữ Liệu Theo Năm Học (`academicYearId`)
Để dữ liệu giữa các năm học **KHÔNG BỊ CHỒNG CHÉO HAY ĐÈ LÊN NHAU**, tất cả các bảng dữ liệu trong Database (Học sinh, Lớp học, Điểm nề nếp, Quỹ lớp, Báo cáo) đều bắt buộc chứa trường `academicYearId` (VD: `'2025-2026'`, `'2026-2027'`).

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                      ACADEMIC YEAR LIFECYCLE ARCHITECTURE                              │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│   ┌────────────────────────┐         1-Click Rollover          ┌───────────────────┐   │
│   │ NĂM HỌC 2025 - 2026    │ ────────────────────────────────► │ NĂM HỌC 2026 - 2027│   │
│   │  • Lớp 10A2 (Khối 10)  │                                   │  • Lớp 11A2 (Khối 11) │   │
│   │  • Sĩ số: 42 Học sinh  │   [SNAPSHOT ARCHIVE (Read Only)]  │  • Sĩ số: 42 HS   │   │
│   │  • 1,250 ⭐ Tích lũy   │ ────────────────────────────────► │  • Reset 0 ⭐ Mới │   │
│   └────────────────────────┘                                   └───────────────────┘   │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2. Quy Trình Chuyển Giao 1-Click Đầu Năm Học Mới (Academic Year Rollover Engine)
Khi kết thúc năm học cũ (VD: Ngày 31/05), giáo viên bấm nút **`[🚀 NÂNG CẤP LÊN NĂM HỌC MỚI]`**:

1. **Đóng băng Dữ liệu Cũ (Snapshot Archiving):**  
   Toàn bộ hồ sơ nề nếp, điểm sao và sổ quỹ của Năm học 2025-2026 được chuyển sang trạng thái **Chỉ Đọc (Read-Only Snapshot)**. Bảo tồn 100% lịch sử phục vụ tra cứu học bạ 3 năm THPT.
2. **Thuật toán Nâng Khối Lớp Tự Động (Auto-Promotion Engine):**
   - Học sinh Khối 10 (Lớp 10A2) ➔ Tự động chuyển thành Khối 11 (Lớp 11A2).
   - Học sinh Khối 11 (Lớp 11A2) ➔ Tự động chuyển thành Khối 12 (Lớp 12A2).
   - Học sinh Khối 12 ➔ Chuyển trạng thái sang `ALUMNI` (Cựu Học Sinh).
3. **Reset Điểm Sao & Làm Sạch Sổ Điểm Cho Năm Học Mới:**
   - Số sao tích lũy học kỳ được reset về 0 để mở đầu thi đua năm học mới.
   - Giữ nguyên thông tin Phụ huynh và Mã định danh học sinh (`studentId`) để duy trì tính liên tục.

---

## 🌐 3. KIẾN TRÚC MẠNG ĐỒNG BỘ TRƯỜNG HỌC & VÒNG LẶP LIÊN KẾT (SCHOOL MESH SYNC)

### 3.1. Bài Toán Liên Kết Dữ Liệu Trong Cùng Một Trường
Một lớp học (VD: Lớp 10A2) có **1 Giáo viên Chủ nhiệm (GVCN)** và **12 Giáo viên Bộ môn (GVBM)** khác nhau cùng dạy. Làm sao để khi GVBM Toán hoặc GVBM Anh thưởng sao trên bục giảng ➔ Dữ liệu tự động nhảy về Bảng điều khiển của GVCN 10A2 mà không cần nhập tay?

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        SCHOOL MESH SYNC ARCHITECTURE                                   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│   [GVBM TOÁN - LAPTOP 1] ───┐                                                          │
│                             │  P2P Sync / School Mesh Server                           │
│   [GVBM VĂN - LAPTOP 2] ────┼───────────────────────────────► [GVCN 10A2 - LAPTOP 4]   │
│                             │  (Local Network / Cloud Hub)    • Nhận sao ngay lập tức│
│   [GVBM ANH - LAPTOP 3] ────┘                                 • Tự sinh Slide Thứ 7    │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2. Cơ Chế Đồng Bộ 2 Lớp (Dual-Layer Sync Protocol)

1. **Lớp 1: Đồng bộ Mạng LAN Nội Bộ Trường (Local P2P LAN Mesh Sync):**
   - Khi các giáo viên cùng kết nối vào mạng Wi-Fi trường học, ứng dụng sử dụng giao thức **mDNS / WebSockets P2P Mesh** phát hiện các máy tính đang chạy LênLớp trong cùng trường (`schoolId`).
   - Điểm sao vừa thưởng trên laptop GVBM lập tức được gửi P2P trực tiếp sang laptop GVCN trong `< 500ms` mà KHÔNG CẦN INTERNET.
2. **Lớp 2: Đồng bộ Cloud Tập Trung (Cloud Central Sync Engine):**
   - Khi có kết nối Internet, background worker tự động đẩy các gói giao dịch điểm nề nếp (`PointTransaction`) lên Cloud Hub theo không gian tên `schoolId` / `classId`.
   - GVCN có thể mở app ở nhà trên điện thoại hay laptop vẫn nhận trọn vẹn điểm sao GVBM vừa chấm ở trường.

### 3.3. Thuật Toán Chống Trùng Lặp & Chống Xung Đột Dữ Liệu (Conflict Resolution Engine)
- Mỗi giao dịch thưởng sao được gắn **UUID v4 duy nhất** + **Vector Timestamp (Thời gian thực tính bằng millisecond)**:
```typescript
interface PointTransaction {
  transactionId: string;   // UUID v4 độc bản
  schoolId: string;        // Mã trường (VD: 'THPT_CHU_VAN_AN')
  academicYearId: string;  // VD: '2026-2027'
  classId: string;         // VD: '10A2'
  studentId: string;       // Mã học sinh được thưởng
  teacherId: string;       // Mã giáo viên thực hiện
  subjectCode: string;     // Mã môn học (VD: 'MATH', 'LIT')
  stars: number;           // Số sao (+1, +2)
  reason: string;          // Tiêu chí khen thưởng
  timestamp: number;       // Epoch Milliseconds
  synced: boolean;
}
```
- **Quy tắc Bất Biến (Idempotency Rule):** Nếu 2 giáo viên cùng tích sao cho 1 học sinh tại cùng một thời điểm, hệ thống xử lý cộng dồn minh bạch dựa trên `transactionId`, cam kết 0% bị mất mát hay ghi đè dữ liệu.

---

## 🏆 KẾT LUẬN KIẾN TRÚC

Bản thiết kế **K-12 Education Architecture & School Mesh Sync Specification** này đã hoàn chỉnh 100% bức tranh kỹ thuật:
- **Giải quyết bài toán Chuẩn Môn học GDPT 2018.**
- **Giải quyết bài toán Chuyển giao Năm học mới & Bảo tồn Học bạ 3 năm THPT.**
- **Giải quyết bài toán Liên kết Mạng lưới Giáo viên trong Trường học mà không bị đứt gãy hay chồng chéo dữ liệu.**
