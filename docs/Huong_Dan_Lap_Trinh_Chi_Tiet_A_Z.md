# 📘 HƯỚNG DẪN LẬP TRÌNH VÀ THỰC THI KỸ THUẬT CHI TIẾT TỪ A - Z ĐỂ HOÀN THÀNH DỰ ÁN (MASTER END-TO-END CODE & INTEGRATION BLUEPRINT)

> **Dự án:** **LênLớp / Avina Class** (*Teaching OS & Live Class Workspace*)  
> **Mục tiêu:** Cung cấp tài liệu hướng dẫn lập trình chi tiết nhất (Line-by-Line Specification), hướng dẫn nối ghép từng File mã nguồn, View Controller, Adapter và Component để hoàn thành 100% dự án từ sơ khai đến bản Production chạy thực tế!

---

## 🗺️ 1. SƠ ĐỒ CẤU TRÚC THƯ MỤC MÃ NGUỒN TOÀN DIỆN (FULL CODEBASE SITEMAP)

Toàn bộ dự án được tổ chức theo chuẩn **Clean Modular Architecture** độc lập:

```
d:\SDE Software\9Teach\
├── index.html                                  # Single Page Application (18 Views & 12 Modals)
├── package.json                                # Dependencies: Vite, SheetJS, Canvas, Tesseract
├── vite.config.js                              # Config dev server port 3000 & build options
│
├── [BỘ 10 TÀI LIỆU MA TRẬN MASTER]              # Nguồn đối chiếu 1-1 cho Dev, QA, BGH, Designer
│
└── src/
    ├── main.js                                 # Entrypoint: Bootstrapper & Router Register
    │
    ├── config/                                 # Cấu hình & Dữ liệu Mẫu (Seed Data)
    │   ├── appConfig.js                        # System Tokens, Constants & App Metadata
    │   └── mockData.js                         # Mock 42 Học sinh, 20 Slide PPTX, TKB Tuần, 5512
    │
    ├── core/                                   # Nền tảng Core Engine Lõi
    │   ├── Store.js                            # Central Reactive State Engine (Pub/Sub)
    │   ├── Router.js                           # SPA Router Engine (Lifecycle Management)
    │   ├── IPCDispatcher.js                    # Giao thức truyền tin Màn hình Kép (Tivi / Dock)
    │   ├── AudioSynthesizer.js                 # Bộ tổng hợp âm thanh Web Audio "Ting ting"
    │   │
    │   ├── adapters/                           # Tầng kết nối phần cứng & định dạng
    │   │   ├── SlideEngineAdapter.js           # Render Slide Canvas 4K & Phím USB Clicker
    │   │   ├── LocalFirstAdapter.js            # SQLite / IndexedDB WAL Offline Storage
    │   │   └── MinistryExportAdapter.js        # Động cơ xuất Excel template vnEdu / SMAS
    │   │
    │   ├── audio/                              # Bộ xử lý âm thanh AI
    │   │   └── AudioRingWorker.js              # AudioWorklet Ring Buffer 3s & KWS Trigger
    │   │
    │   └── canvas/                             # Bộ render hình ảnh Canvas
    │       └── ZaloCardCanvasEngine.js         # Render Thiệp Zalo Infographic (.PNG 1080x1350)
    │
    ├── styles/                                 # Hệ thống Stylesheet Modular
    │   ├── variables.css                       # CSS Design Tokens (HSL Colors, Typography)
    │   ├── base.css                            # Base Reset & Typography Rules
    │   ├── main.css                            # Master CSS Entrypoint Importing All Styles
    │   ├── components/                         # Component Styles (Header, Buttons, Cards)
    │   │   ├── sidebar.css                     # Compact Left Sidebar 88px CSS
    │   │   ├── buttons.css                     # Giant 1-Click Launch & Action Buttons
    │   │   └── cards.css                       # Glassmorphism Cards & Modals
    │   └── views/                              # Stylesheet Riêng Cho 18 Màn Hình
    │       ├── launchpad.css                   # Scr 2.1 Launchpad View
    │       ├── liveWorkspace.css               # Scr 1.1 Tivi Presenter & Scr 1.2 Teacher Dock
    │       ├── mobileRemote.css                # Scr 6.1 Mobile Slide Remote
    │       ├── postClass.css                   # Scr 2.2 Post-Class AI Confirm Board
    │       ├── celebration.css                 # Scr 2.3 Fireworks Celebration View
    │       ├── timetable.css                   # Scr 3.1 Weekly Timetable Matrix
    │       ├── capsuleEditor.css               # Scr 3.2 Lesson Capsule 5512 Editor
    │       ├── resourceBank.css                # Scr 3.3 Resource & Folder Bank
    │       ├── classRoster.css                 # Scr 4.1 Roster Table & Scr 4.2 4x8 Seating
    │       ├── weeklyReports.css               # Scr 5.1 Zalo Report Card & Export
    │       ├── settingsPro.css                 # Scr 6.2 Settings & VietQR Pro
    │       └── homeroom.css                    # Scr 7.3 Risk Radar, 7.4 Fund, 7.5 TT22
    │
    └── views/                                  # 18 OOP View Controllers (Components)
        ├── BaseView.js                         # Abstract Class chứa lifecycle onMount/onUnmount
        ├── LaunchpadView.js                    # Controller Màn hình Launchpad (Scr 2.1)
        ├── LiveWorkspaceView.js                # Controller Màn hình Trình chiếu (Scr 1.1 & 1.2)
        ├── MobileRemoteView.js                 # Controller Màn hình Remote ĐT (Scr 6.1)
        ├── PostClassView.js                    # Controller Bảng Chốt AI 60s (Scr 2.2)
        ├── CelebrationView.js                  # Controller Vinh Danh Pháo Hoa (Scr 2.3)
        ├── TimetableManagerView.js             # Controller Thời Khóa Biểu (Scr 3.1)
        ├── CapsuleEditorView.js                # Controller Soạn Bài 5512 (Scr 3.2)
        ├── ResourceBankView.js                 # Controller Kho Tài Nguyên (Scr 3.3)
        ├── ClassRosterView.js                  # Controller Danh Sách & Sơ Đồ Lớp (Scr 4.1 & 4.2)
        ├── StudentProfileView.js               # Controller Hồ Sơ Nề Nếp HS (Scr 4.3)
        ├── WeeklyReportsView.js                # Controller Thiệp Zalo PH (Scr 5.1)
        ├── SettingsProView.js                  # Controller VietQR Pro (Scr 6.2)
        ├── HomeroomCheckinView.js              # Controller Morning Check-in 5s (Scr 7.1)
        ├── HomeroomHubView.js                  # Controller Trạm Tụ Điểm Bộ Môn (Scr 7.2)
        ├── HomeroomAnalyticsView.js            # Controller Điểm Nóng AI (Scr 7.3)
        ├── HomeroomFundView.js                 # Controller Quỹ Lớp & Zalo (Scr 7.4)
        └── HomeroomTT22View.js                 # Controller Chốt Hạnh Kiểm TT22 (Scr 7.5)
```

---

## 🛠️ 2. QUY TRÌNH NỐI GHÉP & LẬP TRÌNH CHI TIẾT TỪNG PHẦN (CODE INTEGRATION GUIDE)

---

### 🟢 BƯỚC 1: XÂY DỰNG NỀN TẢNG CORE ENGINE (CORE FRAMEWORK)

#### 1.1. Khởi tạo State Store tập trung (`src/core/Store.js`)
```javascript
/**
 * Core Central Store - Unidirectional Reactive State Manager
 */
class Store {
  constructor() {
    this.state = {
      currentView: 'launchpad',
      soundEnabled: true,
      activeLessonId: 'L10A2_VAN12',
      currentSlideIndex: 5,
      totalSlides: 20,
      students: [],
      aiDraftLogs: []
    };
    this.listeners = new Set();
  }

  getState() {
    return this.state;
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(fn => fn(this.state));
  }

  toggleSound() {
    this.setState({ soundEnabled: !this.state.soundEnabled });
  }

  setSlideIndex(index) {
    if (index >= 1 && index <= this.state.totalSlides) {
      this.setState({ currentSlideIndex: index });
    }
  }

  rewardStudent(studentId, stars = 1, reason = 'Phát biểu trôi chảy') {
    const updatedStudents = this.state.students.map(s => {
      if (s.id === studentId) {
        return { ...s, totalStars: s.totalStars + stars };
      }
      return s;
    });
    this.setState({ students: updatedStudents });
  }
}

export const store = new Store();
```

#### 1.2. Khởi tạo Bộ Điều Hướng View (`src/core/Router.js`)
```javascript
/**
 * SPA Router Engine with Lifecycle Hooks
 */
class Router {
  constructor() {
    this.routes = new Map();
    this.currentViewInstance = null;
  }

  registerRoute(viewName, viewInstance) {
    this.routes.set(viewName, viewInstance);
  }

  navigateTo(viewName) {
    if (!this.routes.has(viewName)) return;

    // Unmount current view
    if (this.currentViewInstance && typeof this.currentViewInstance.onUnmount === 'function') {
      this.currentViewInstance.onUnmount();
    }

    // Hide all view sections in DOM
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));

    // Show target section & highlight active tab
    const targetSection = document.getElementById(`view-${viewName}`);
    const targetTab = document.querySelector(`.nav-tab[data-view="${viewName}"]`);
    
    if (targetSection) targetSection.classList.add('active');
    if (targetTab) targetTab.classList.add('active');

    // Mount new view controller
    this.currentViewInstance = this.routes.get(viewName);
    if (typeof this.currentViewInstance.onMount === 'function') {
      this.currentViewInstance.onMount();
    }
  }
}

export const router = new Router();
```

---

### 🔵 BƯỚC 2: LẬP TRÌNH CÁC VIEW CONTROLLER VÀ ĐỐI CHIẾU DOM (18 VIEWS)

Mỗi View Controller kế thừa từ `BaseView.js` và chịu trách nhiệm lắng nghe sự kiện DOM, tương tác với `store` và `router`.

#### Ví dụ tiêu biểu: View Controller `LiveWorkspaceView.js` (Màn hình 1.1 & 1.2)
```javascript
import { BaseView } from './BaseView.js';
import { store } from '../core/Store.js';
import { router } from '../core/Router.js';
import { audioSynthesizer } from '../core/AudioSynthesizer.js';

export class LiveWorkspaceView extends BaseView {
  constructor() {
    super('live-workspace');
    this.unsubscribe = null;
  }

  onMount() {
    this.renderSlideContent();
    this.renderStudentsGrid();
    this.bindEvents();

    // Subscribe to state changes
    this.unsubscribe = store.subscribe(state => {
      this.updateSlideDisplay(state.currentSlideIndex);
    });
  }

  onUnmount() {
    if (this.unsubscribe) this.unsubscribe();
  }

  bindEvents() {
    // Next / Prev Slide buttons
    document.getElementById('next-slide-btn')?.addEventListener('click', () => {
      const { currentSlideIndex } = store.getState();
      store.setSlideIndex(currentSlideIndex + 1);
    });

    document.getElementById('prev-slide-btn')?.addEventListener('click', () => {
      const { currentSlideIndex } = store.getState();
      store.setSlideIndex(currentSlideIndex - 1);
    });

    // End lesson button -> Go to Post Class AI Confirmation Board (Scr 2.2)
    document.getElementById('end-lesson-btn')?.addEventListener('click', () => {
      router.navigateTo('post-class');
    });
  }

  renderStudentsGrid() {
    const grid = document.getElementById('students-reward-grid');
    if (!grid) return;
    const { students } = store.getState();

    grid.innerHTML = students.map(s => `
      <div class="student-touch-card glass-card" data-id="${s.id}">
        <img src="${s.avatar}" class="avatar-sm" />
        <span class="sname">${s.name}</span>
        <span class="stars-badge">⭐ ${s.totalStars}</span>
      </div>
    `).join('');

    // Bind tap reward event
    grid.querySelectorAll('.student-touch-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        store.rewardStudent(id, 1);
        audioSynthesizer.playChime(); // Sound Ting Ting
        this.showToastReward(id);
      });
    });
  }

  showToastReward(studentId) {
    const toast = document.getElementById('reward-toast');
    if (toast) {
      toast.classList.remove('hidden');
      setTimeout(() => toast.classList.add('hidden'), 2500);
    }
  }

  updateSlideDisplay(index) {
    const tiviNum = document.getElementById('tivi-slide-num');
    const dockNum = document.getElementById('dock-slide-num');
    if (tiviNum) tiviNum.textContent = index;
    if (dockNum) dockNum.textContent = index;
  }
}
```

---

### 🟣 BƯỚC 3: KẾT NỐI VÀ CHẠY KIỂM THỬ HOÀN THÀNH DỰ ÁN (BUILD & RELEASE)

#### Checklist Kiểm Tra Nghiệm Thu Đóng Gói (Production Verification):

- [x] **Bước 1: Chạy Vite Dev Server & Kiểm tra Không Lỗi Console:**
  ```bash
  npx vite --port 3000 --host
  ```
  - Kiểm tra mở `http://localhost:3000/` không xuất hiện bất kỳ lỗi `404 Not Found` hay `ReferenceError` nào trên Chrome DevTools Console.

- [x] **Bước 2: Kiểm Tra Đầy Đủ 18 Màn Hình & 12 Modals:**
  - Chuyển qua lại giữa tất cả 18 tabs trên **Compact Left Sidebar 88px**. Đảm bảo giao diện hiển thị đúng 100% thiết kế.

- [x] **Bước 3: Đóng Gói Bản Build Sản Phẩm Production (.HTML / .EXE):**
  ```bash
  npx vite build
  ```
  - Kiểm tra thư mục `dist/` chứa đầy đủ file `index.html`, bundle CSS & JS đã được tối ưu hóa dung lượng (Minified & Treeshaken).

---

## 🏆 KẾT LUẬN VÀ CAM KẾT HOÀN THÀNH

Tài liệu **Hướng Dẫn Lập Trình Chi Tiết Từ A - Z** này chính là cuốn cẩm nang thi công kỹ thuật cuối cùng. Nó nối liền khoảng cách giữa ý tưởng thiết kế và mã nguồn thực tế, giúp đội ngũ lập trình tự tin triển khai và đóng gói thành công 100% dự án **LênLớp / Avina Class**!
