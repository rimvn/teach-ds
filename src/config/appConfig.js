/**
 * TeachDS Application Configuration & GDPT 2018 Taxonomy Seed
 * Senior Architecture Layer: Config
 */

export const APP_CONFIG = {
  appName: 'TeachDS Pro',
  appTitle: 'Teach Digital Space — Hệ Điều Hành Giảng Dạy Số',
  version: '1.0.0-PROD',
  defaultView: 'launchpad',
  sidebarWidth: 88, // Compact Left Sidebar Width (px)
  
  // GDPT 2018 EDUCATION LEVELS
  educationLevels: {
    PRIMARY: { code: 'PRIMARY', name: 'Cấp 1: Tiểu Học (Khối 1 - 5)' },
    LOWER_SEC: { code: 'LOWER_SEC', name: 'Cấp 2: THCS (Khối 6 - 9)' },
    UPPER_SEC: { code: 'UPPER_SEC', name: 'Cấp 3: THPT (Khối 10 - 12)' }
  },

  // SCHOOL TYPES (INCL. K-12 MULTI-LEVEL SCHOOLS)
  schoolTypes: {
    PRIMARY_ONLY: 'Trường Tiểu học',
    LOWER_SEC_ONLY: 'Trường THCS',
    UPPER_SEC_ONLY: 'Trường THPT',
    PRIMARY_LOWER_SEC: 'Trường Liên cấp 1 & 2 (Tiểu học & THCS)',
    LOWER_UPPER_SEC: 'Trường Liên cấp 2 & 3 (THCS & THPT)',
    K12_FULL: 'Trường Liên cấp K-12 (Tiểu học - THCS - THPT)'
  },

  // PREDEFINED GDPT 2018 FULL SUBJECT CATALOG (PRIMARY + SECONDARY + HIGH SCHOOL)
  subjects: {
    // === PRIMARY SCHOOL SUBJECTS (CẤP 1) ===
    TIENG_VIET: { code: 'TIENG_VIET', name: 'Tiếng Việt', shortName: 'T.Việt', icon: '📖', level: ['PRIMARY'] },
    TOAN_TH:    { code: 'TOAN_TH',    name: 'Toán Tiểu Học', shortName: 'Toán', icon: '📐', level: ['PRIMARY'] },
    TN_XH:      { code: 'TN_XH',      name: 'Tự Nhiên & Xã Hội', shortName: 'TNXH', icon: '🌱', level: ['PRIMARY'] },
    KHOA_HOC:   { code: 'KHOA_HOC',   name: 'Khoa Học (L4-5)', shortName: 'K.Học', icon: '🧪', level: ['PRIMARY'] },
    LS_DL_TH:   { code: 'LS_DL_TH',   name: 'Lịch Sử & Địa Lý TH', shortName: 'Sử-Địa', icon: '🗺️', level: ['PRIMARY'] },
    DAO_DUC:    { code: 'DAO_DUC',    name: 'Đạo Đức', shortName: 'Đ.Đức', icon: '🕊️', level: ['PRIMARY'] },
    AM_NHAC:    { code: 'AM_NHAC',    name: 'Âm Nhạc', shortName: 'Nhạc', icon: '🎵', level: ['PRIMARY', 'LOWER_SEC'] },
    MY_THUAT:   { code: 'MY_THUAT',   name: 'Mỹ Thuật', shortName: 'Họa', icon: '🎨', level: ['PRIMARY', 'LOWER_SEC'] },
    TIN_CN_TH:  { code: 'TIN_CN_TH',  name: 'Tin Học & Công Nghệ TH', shortName: 'Tin-CN', icon: '💻', level: ['PRIMARY'] },

    // === SECONDARY & HIGH SCHOOL SUBJECTS (CẤP 2 & CẤP 3) ===
    LIT:   { code: 'LIT',   name: 'Ngữ Văn', shortName: 'Văn', icon: '📚', level: ['LOWER_SEC', 'UPPER_SEC'] },
    MATH:  { code: 'MATH',  name: 'Toán Học', shortName: 'Toán', icon: '📐', level: ['LOWER_SEC', 'UPPER_SEC'] },
    ENG:   { code: 'ENG',   name: 'Tiếng Anh', shortName: 'Anh', icon: '🇬🇧', level: ['PRIMARY', 'LOWER_SEC', 'UPPER_SEC'] },
    PHYS:  { code: 'PHYS',  name: 'Vật Lý', shortName: 'Lý', icon: '⚡', level: ['LOWER_SEC', 'UPPER_SEC'] },
    CHEM:  { code: 'CHEM',  name: 'Hóa Học', shortName: 'Hóa', icon: '🧪', level: ['LOWER_SEC', 'UPPER_SEC'] },
    BIO:   { code: 'BIO',   name: 'Sinh Học', shortName: 'Sinh', icon: '🧬', level: ['LOWER_SEC', 'UPPER_SEC'] },
    HIST:  { code: 'HIST',  name: 'Lịch Sử', shortName: 'Sử', icon: '🏛️', level: ['LOWER_SEC', 'UPPER_SEC'] },
    GEO:   { code: 'GEO',   name: 'Địa Lý', shortName: 'Địa', icon: '🌍', level: ['LOWER_SEC', 'UPPER_SEC'] },
    CIVIC: { code: 'CIVIC', name: 'GD Kinh Tế & Pháp Luật / GDCD', shortName: 'GDCD', icon: '⚖️', level: ['LOWER_SEC', 'UPPER_SEC'] },
    CS:    { code: 'CS',    name: 'Tin Học', shortName: 'Tin', icon: '💻', level: ['LOWER_SEC', 'UPPER_SEC'] },
    TECH:  { code: 'TECH',  name: 'Công Nghệ', shortName: 'CN', icon: '🔧', level: ['LOWER_SEC', 'UPPER_SEC'] },
    PE:    { code: 'PE',    name: 'Giáo Dục Thể Chất', shortName: 'Thể', icon: '⚽', level: ['PRIMARY', 'LOWER_SEC', 'UPPER_SEC'] },
    DEF:   { code: 'DEF',   name: 'GD Quốc Phòng & An Ninh', shortName: 'QPAN', icon: '🎖️', level: ['UPPER_SEC'] },
    EXP:   { code: 'EXP',   name: 'Hoạt Động Trải Nghiệm', shortName: 'HĐTN', icon: '🎡', level: ['PRIMARY', 'LOWER_SEC', 'UPPER_SEC'] }
  }
};
