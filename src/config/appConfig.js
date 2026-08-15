/**
 * TeachDS Application Configuration & Predefined GDPT 2018 Taxonomy Seed
 * Senior Architecture Layer: Config & Taxonomy Engine
 * Task ID: TASK-SP1-05 (Sprint 1)
 */

export const SCHOOL_TYPES = {
  PRIMARY_ONLY: 'PRIMARY_ONLY',
  LOWER_SEC_ONLY: 'LOWER_SEC_ONLY',
  UPPER_SEC_ONLY: 'UPPER_SEC_ONLY',
  PRIMARY_LOWER_SEC: 'PRIMARY_LOWER_SEC',
  LOWER_UPPER_SEC: 'LOWER_UPPER_SEC',
  K12_FULL: 'K12_FULL'
};

export const GRADES = {
  K1:  { code: 'K1',  number: 1,  name: 'Lớp 1',  level: 'PRIMARY' },
  K2:  { code: 'K2',  number: 2,  name: 'Lớp 2',  level: 'PRIMARY' },
  K3:  { code: 'K3',  number: 3,  name: 'Lớp 3',  level: 'PRIMARY' },
  K4:  { code: 'K4',  number: 4,  name: 'Lớp 4',  level: 'PRIMARY' },
  K5:  { code: 'K5',  number: 5,  name: 'Lớp 5',  level: 'PRIMARY' },
  K6:  { code: 'K6',  number: 6,  name: 'Lớp 6',  level: 'LOWER_SEC' },
  K7:  { code: 'K7',  number: 7,  name: 'Lớp 7',  level: 'LOWER_SEC' },
  K8:  { code: 'K8',  number: 8,  name: 'Lớp 8',  level: 'LOWER_SEC' },
  K9:  { code: 'K9',  number: 9,  name: 'Lớp 9',  level: 'LOWER_SEC' },
  K10: { code: 'K10', number: 10, name: 'Lớp 10', level: 'UPPER_SEC' },
  K11: { code: 'K11', number: 11, name: 'Lớp 11', level: 'UPPER_SEC' },
  K12: { code: 'K12', number: 12, name: 'Lớp 12', level: 'UPPER_SEC' }
};

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

  // SCHOOL TYPES LABELS
  schoolTypesLabels: {
    [SCHOOL_TYPES.PRIMARY_ONLY]: 'Trường Tiểu học',
    [SCHOOL_TYPES.LOWER_SEC_ONLY]: 'Trường THCS',
    [SCHOOL_TYPES.UPPER_SEC_ONLY]: 'Trường THPT',
    [SCHOOL_TYPES.PRIMARY_LOWER_SEC]: 'Trường Liên cấp 1 & 2 (Tiểu học & THCS)',
    [SCHOOL_TYPES.LOWER_UPPER_SEC]: 'Trường Liên cấp 2 & 3 (THCS & THPT)',
    [SCHOOL_TYPES.K12_FULL]: 'Trường Liên cấp K-12 (Tiểu học - THCS - THPT)'
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

/**
 * Helper: Get pre-seeded subjects for a specific grade level (e.g. 'K1' -> 'K12')
 */
export function getSubjectsForGrade(gradeCode) {
  const grade = GRADES[gradeCode] || GRADES.K10;
  return Object.values(APP_CONFIG.subjects).filter(s => s.level.includes(grade.level));
}

/**
 * Helper: Get human readable school type label
 */
export function getSchoolTypeLabel(type) {
  return APP_CONFIG.schoolTypesLabels[type] || APP_CONFIG.schoolTypesLabels[SCHOOL_TYPES.K12_FULL];
}

/**
 * Helper: Get grades for a specific school type
 */
export function getGradesForSchoolType(type) {
  const allGrades = Object.values(GRADES);
  switch (type) {
    case SCHOOL_TYPES.PRIMARY_ONLY:
      return allGrades.filter(g => g.level === 'PRIMARY');
    case SCHOOL_TYPES.LOWER_SEC_ONLY:
      return allGrades.filter(g => g.level === 'LOWER_SEC');
    case SCHOOL_TYPES.UPPER_SEC_ONLY:
      return allGrades.filter(g => g.level === 'UPPER_SEC');
    case SCHOOL_TYPES.PRIMARY_LOWER_SEC:
      return allGrades.filter(g => g.level === 'PRIMARY' || g.level === 'LOWER_SEC');
    case SCHOOL_TYPES.LOWER_UPPER_SEC:
      return allGrades.filter(g => g.level === 'LOWER_SEC' || g.level === 'UPPER_SEC');
    case SCHOOL_TYPES.K12_FULL:
    default:
      return allGrades;
  }
}

/**
 * Self-benchmarking test verifying DoD compliance (< 1ms lookup time)
 */
export function benchmarkTaxonomy() {
  console.log('🧪 [Taxonomy Benchmark] Testing GDPT 2018 Taxonomy seed lookup...');
  const start = performance.now();

  const primarySubjects = getSubjectsForGrade('K1');
  const upperSecSubjects = getSubjectsForGrade('K10');
  const k12Grades = getGradesForSchoolType(SCHOOL_TYPES.K12_FULL);

  const duration = performance.now() - start;
  console.log(`🏆 [Taxonomy Benchmark Results]:`);
  console.log(`   - Pre-seeded Primary Subjects: ${primarySubjects.length}`);
  console.log(`   - Pre-seeded THPT Subjects: ${upperSecSubjects.length}`);
  console.log(`   - Pre-seeded K-12 Grades: ${k12Grades.length}`);
  console.log(`   - Lookup Duration: ${duration.toFixed(3)}ms`);
  console.log(`   - DoD Standard (< 1ms): ${duration < 1.0 ? '✅ PASSED PERFECTLY' : '❌ FAILED'}`);
  return duration < 1.0;
}
