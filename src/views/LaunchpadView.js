/**
 * TeachDS Launchpad View Controller (Trang Chủ Bục Giảng & Hero Card Gợi Ý AI Pedagogy Embedded)
 * Senior Architecture Layer: Views / Presentation
 * Task ID: TASK-SP2-01 (Sprint 2)
 */

import { BaseView } from './BaseView.js';
import { store } from '../core/Store.js';
import { router } from '../core/Router.js';
import { audioSynthesizer } from '../core/AudioSynthesizer.js';
import { ipcDispatcher } from '../core/IPCDispatcher.js';

export class LaunchpadView extends BaseView {
  constructor() {
    super('launchpad');
    this.countdownTimer = null;
    this.remainingSeconds = 180; // Default 3 minutes countdown
  }

  onMount() {
    console.log('🚀 TeachDS Launchpad View Mounted');
    this.renderHeroLessonCard();
    this.startLiveCountdown();
    this.bindEvents();
  }

  onUnmount() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
  }

  /**
   * Render Hero Lesson Card for Next Upcoming Class (Includes Embedded Pedagogy Smart Suggestions)
   */
  renderHeroLessonCard() {
    const heroCardContainer = document.getElementById('hero-lesson-card-container');
    if (!heroCardContainer) return;

    heroCardContainer.innerHTML = `
      <div class="hero-card glass-card accent-glow">
        <div class="hero-header">
          <span class="live-pill red">🔴 TIẾT HỌC SẮP DIỄN RA</span>
          <span class="room-tag">Phòng 302 — Ca Sáng (08:45 - 09:30)</span>
        </div>

        <div class="hero-body">
          <div class="lesson-meta">
            <h1 class="hero-title">Ngữ Văn 10 — Lớp 10A2</h1>
            <p class="hero-subtext">Bài 12: Chuyện Người Con Gái Nam Xương (Nguyễn Dữ) — Tiết 2</p>
          </div>
          
          <div class="countdown-box">
            <span class="cd-label">THỜI GIAN ĐẾN GIỜ VÀO LỚP</span>
            <span class="cd-time" id="launchpad-countdown-display">03:00</span>
          </div>
        </div>

        <!-- EMBEDDED RESOURCE READINESS BAR -->
        <div class="resources-readiness-bar">
          <span class="res-badge green"><span class="icon">📊</span> Slide Bài Giảng (20 trang) — <em>🟢 Đã sẵn sàng</em></span>
          <span class="res-badge blue"><span class="icon">🎥</span> Video minh họa (3:20m) — <em>🟢 Xem mượt (Không cần Wifi)</em></span>
          <span class="res-badge gold"><span class="icon">⚡</span> TRẠNG THÁI: 🟢 100% SẮN SÀNG LÊN BỤC GIẢNG</span>
        </div>

        <!-- EMBEDDED COMPACT PEDAGOGY AI SMART HUB (GẮN TRỰC TIẾP TRONG HERO CARD) -->
        <div class="hero-pedagogy-embedded">
          <div class="p-embedded-title">
            <span>🎯 GỢI Ý HỖ TRỢ GIẢNG DẠY CHO TIẾT HỌC NÀY:</span>
          </div>

          <div class="pedagogy-compact-list">
            <div class="p-compact-item">
              <span class="p-dot orange"></span>
              <span><strong>Khởi động tương tác:</strong> Em Đỗ Thanh Giang (Bàn 3B) thụ động 2 tuần qua ➔ Gợi ý gọi tên phát biểu.</span>
              <button class="btn-xs btn-secondary" onclick="alert('Đã ghim em Đỗ Thanh Giang vào vị trí gọi tên khởi động!')">🎯 Ghim Gọi Tên</button>
            </div>

            <div class="p-compact-item">
              <span class="p-dot blue"></span>
              <span><strong>Tiếp tục bài dạy:</strong> Tiết trước dừng ở <strong>Slide 12 (Thảo luận nhóm 5 phút)</strong>.</span>
              <button class="btn-xs btn-secondary" id="btn-jump-slide12">▶️ Nhảy Slide 12</button>
            </div>
          </div>
        </div>

        <div class="hero-actions">
          <button class="btn-primary-giant btn-launch" id="btn-launch-lesson-1click">
            <span class="icon">🚀</span> BẮT ĐẦU DẠY TIẾT HỌC 1-CLICK
          </button>
          <button class="btn-secondary" id="btn-preview-5512">
            📖 Xem Trước Kịch Bản 5512
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Live Countdown Timer updates display every 1 second
   */
  startLiveCountdown() {
    this.updateCountdownDisplay();
    this.countdownTimer = setInterval(() => {
      if (this.remainingSeconds > 0) {
        this.remainingSeconds--;
        this.updateCountdownDisplay();
      }
    }, 1000);
  }

  updateCountdownDisplay() {
    const display = document.getElementById('launchpad-countdown-display');
    if (!display) return;
    const mins = Math.floor(this.remainingSeconds / 60).toString().padStart(2, '0');
    const secs = (this.remainingSeconds % 60).toString().padStart(2, '0');
    display.textContent = `${mins}:${secs}`;
  }

  bindEvents() {
    // 1-Click Launch Button Action
    document.getElementById('btn-launch-lesson-1click')?.addEventListener('click', () => {
      this.launchLesson1Click();
    });

    document.getElementById('start-lesson-btn')?.addEventListener('click', () => {
      this.launchLesson1Click();
    });

    document.getElementById('btn-preview-5512')?.addEventListener('click', () => {
      router.navigateTo('capsule-editor');
    });

    document.getElementById('btn-jump-slide12')?.addEventListener('click', () => {
      store.setSlideIndex(12);
      this.launchLesson1Click();
    });

    // Preview 5512 Script for upcoming classes without starting live session
    document.querySelectorAll('.btn-preview-script').forEach(btn => {
      btn.addEventListener('click', () => {
        const className = btn.getAttribute('data-class');
        console.log(`📖 [Launchpad] Previewing 5512 script for class: ${className}`);
        router.navigateTo('capsule-editor');
      });
    });

    // Handle upcoming start buttons with safety confirm modal for early launches
    document.querySelectorAll('.start-specific-lesson').forEach(btn => {
      btn.addEventListener('click', () => {
        const className = btn.getAttribute('data-class');
        const isEarly = btn.getAttribute('data-early') === 'true';

        if (isEarly) {
          this.showEarlyLaunchModal(className);
        } else {
          this.launchLesson1Click();
        }
      });
    });

    // Modal Confirmation Actions
    document.getElementById('btn-cancel-early-launch')?.addEventListener('click', () => {
      document.getElementById('early-launch-modal')?.classList.add('hidden');
    });

    document.getElementById('btn-confirm-early-launch')?.addEventListener('click', () => {
      document.getElementById('early-launch-modal')?.classList.add('hidden');
      this.launchLesson1Click();
    });
  }

  showEarlyLaunchModal(className) {
    const modal = document.getElementById('early-launch-modal');
    const classEl = document.getElementById('early-class-name');
    const minsEl = document.getElementById('early-mins-left');

    if (classEl) classEl.textContent = `Lớp ${className}`;
    if (minsEl) minsEl.textContent = className === '11B1' ? '65 phút' : '180 phút';
    if (modal) modal.classList.remove('hidden');
  }

  /**
   * Core 1-Click Launch Workflow
   */
  launchLesson1Click() {
    const startTime = performance.now();
    console.log('🚀 [Launchpad 1-Click Launch] Launching Live Workspace...');

    // 1. Play Start Sound
    audioSynthesizer.playChime();

    // 2. Broadcast IPC to Open Tivi View
    ipcDispatcher.broadcastSlideChange(store.getState().currentSlideIndex);

    // 3. Navigate to Live Workspace
    router.navigateTo('live-workspace');

    const duration = performance.now() - startTime;
    console.log(`⚡ [Launchpad 1-Click Launch] Execution completed in ${duration.toFixed(2)}ms`);
    return duration;
  }
}
