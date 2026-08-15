/**
 * TeachDS Live Workspace View Controller (Tivi View 4K & Floating Light Toast 60fps)
 * Senior Architecture Layer: Views / Presentation
 * Task ID: TASK-SP2-03 (Sprint 2)
 */

import { BaseView } from './BaseView.js';
import { store } from '../core/Store.js';
import { router } from '../core/Router.js';
import { audioSynthesizer } from '../core/AudioSynthesizer.js';
import { ipcDispatcher, IPC_EVENTS } from '../core/IPCDispatcher.js';
import { slideEngineAdapter } from '../core/adapters/SlideEngineAdapter.js';

export class LiveWorkspaceView extends BaseView {
  constructor() {
    super('live-workspace');
    this.unsubscribeStore = null;
    this.unsubscribeIPC = [];
    this.toastTimer = null;
  }

  onMount() {
    console.log('🖥️ TeachDS Live Workspace View Mounted (Tivi View 4K Ready)');
    window.liveWorkspaceView = this;
    this.renderStudentsGrid();
    slideEngineAdapter.renderCurrentSlide();
    this.bindEvents();
    this.bindIPCListeners();

    // Subscribe to Store Reactive Updates (DoD Task-SP1-01)
    this.unsubscribeStore = store.subscribe(state => {
      this.updateSlideDisplay(state.currentSlideIndex);
      this.renderStudentsGrid();
    });
  }

  onUnmount() {
    if (this.unsubscribeStore) this.unsubscribeStore();
    this.unsubscribeIPC.forEach(unbind => unbind());
    this.unsubscribeIPC = [];
  }

  bindIPCListeners() {
    // Listen to IPC Reward Events across Windows/Tabs (DoD Task-SP1-02 & TASK-SP2-03)
    const unbindReward = ipcDispatcher.on(IPC_EVENTS.REWARD_STUDENT, (payload) => {
      console.log('⚡ [IPC Receiver] Reward Event:', payload);
      const studentName = payload.name || payload.studentName || 'Nguyễn Văn An';
      const stars = payload.stars || 1;
      const reason = payload.reason || 'Phát biểu xuất sắc';
      const avatar = payload.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=An';
      const studentId = payload.studentId || payload.id || '1';

      // 1. Trigger 60fps Floating Light Particle Toast Overlay & Audio Chime
      this.showRewardToast(studentName, stars, reason, avatar);
      audioSynthesizer.playChime();

      // 2. Sync to Store if not already mutated
      if (payload.syncStore !== false) {
        store.rewardStudent(studentId, stars, reason);
      }
    });

    // Listen to IPC Slide Change Events
    const unbindSlide = ipcDispatcher.on(IPC_EVENTS.CHANGE_SLIDE, (payload) => {
      if (payload && payload.slideIndex) {
        slideEngineAdapter.currentSlideIndex = payload.slideIndex;
        slideEngineAdapter.currentAnimationStep = 0;
        slideEngineAdapter.renderCurrentSlide();
      }
    });

    this.unsubscribeIPC.push(unbindReward, unbindSlide);
  }

  bindEvents() {
    // Slide Navigation
    document.getElementById('next-slide-btn')?.addEventListener('click', () => {
      slideEngineAdapter.nextStep();
    });

    document.getElementById('prev-slide-btn')?.addEventListener('click', () => {
      slideEngineAdapter.prevStep();
    });

    document.getElementById('end-lesson-btn')?.addEventListener('click', () => {
      router.navigateTo('post-class');
    });

    // Tivi Fullscreen Toggle Button
    document.getElementById('btn-tivi-fullscreen')?.addEventListener('click', () => {
      this.toggleTiviFullscreen();
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

    grid.querySelectorAll('.student-touch-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        const student = students.find(s => s.id === id);
        
        if (student) {
          // 1. Trigger Toast & Sound locally for instant 60fps response
          this.showRewardToast(student.name, 1, 'Tương tác phát biểu', student.avatar);
          audioSynthesizer.playChime();

          // 2. Mutate Store
          store.rewardStudent(student.id, 1, 'Tương tác phát biểu');

          // 3. Broadcast over IPC Channel for multi-window Tivi View
          ipcDispatcher.broadcastReward({
            studentId: student.id,
            name: student.name,
            stars: 1,
            reason: 'Tương tác phát biểu',
            avatar: student.avatar,
            syncStore: false
          });
        }
      });
    });
  }

  /**
   * Floating Toast Notification Overlay with 60fps Particle Light Animations
   */
  showRewardToast(studentName, stars = 1, reason = 'Phát biểu xuất sắc', avatar = '') {
    const startTime = performance.now();
    const toast = document.getElementById('reward-toast');
    const toastStudent = document.getElementById('toast-student');
    const toastTitle = document.getElementById('toast-title');
    const toastReason = document.getElementById('toast-reason');

    if (!toast) return;

    if (toastStudent) toastStudent.textContent = `Em ${studentName}`;
    if (toastTitle) toastTitle.textContent = `+${stars} ⭐ Khen Thưởng!`;
    if (toastReason) toastReason.textContent = reason || 'Diễn đạt trôi chảy & Tự tin!';

    // Add Floating Light Particle Sparkles
    let particlesContainer = toast.querySelector('.toast-sparkles');
    if (!particlesContainer) {
      particlesContainer = document.createElement('div');
      particlesContainer.className = 'toast-sparkles';
      toast.appendChild(particlesContainer);
    }

    particlesContainer.innerHTML = Array.from({ length: 6 }).map((_, i) => `
      <span class="particle p-${i}">✨</span>
    `).join('');

    toast.classList.remove('hidden');
    toast.style.display = 'flex';
    toast.classList.remove('toast-bounce-in');
    void toast.offsetWidth; // Trigger reflow for CSS 60fps animation
    toast.classList.add('toast-bounce-in');

    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.add('hidden');
      toast.style.display = 'none';
    }, 3200);

    const duration = performance.now() - startTime;
    console.log(`✨ [Tivi View 60fps Toast] Triggered Toast overlay for '${studentName}' in ${duration.toFixed(2)}ms`);
    return duration;
  }

  /**
   * Toggle Native Fullscreen mode on Tivi Container
   */
  toggleTiviFullscreen() {
    const tiviContainer = document.querySelector('.tivi-display-container');
    if (!tiviContainer) return;

    if (!document.fullscreenElement) {
      tiviContainer.requestFullscreen?.() || tiviContainer.webkitRequestFullscreen?.();
      console.log('📺 [Tivi View] Entered Native Fullscreen 4K Mode');
    } else {
      document.exitFullscreen?.() || document.webkitExitFullscreen?.();
      console.log('📺 [Tivi View] Exited Native Fullscreen Mode');
    }
  }

  updateSlideDisplay(index) {
    const tiviNum = document.getElementById('tivi-slide-num');
    const dockNum = document.getElementById('dock-slide-num');
    if (tiviNum) tiviNum.textContent = index;
    if (dockNum) dockNum.textContent = index;
  }

  /**
   * Self-test helper to trigger Floating Toast directly
   */
  testTiviToast(studentName = 'Nguyễn Văn An', stars = 1, reason = 'Phát biểu xuất sắc 60fps') {
    return this.showRewardToast(studentName, stars, reason);
  }

  /**
   * Self-benchmarking test verifying DoD compliance (< 10ms trigger time)
   */
  benchmarkTiviToast() {
    console.log(`🧪 [Tivi View Benchmark] Testing 60fps Toast Overlay trigger duration...`);
    const duration = this.testTiviToast('Trần Bảo Nam', 1, 'Benchmark test');
    console.log(`🏆 [Tivi View Benchmark Results]:`);
    console.log(`   - Toast Trigger Duration: ${duration.toFixed(3)}ms`);
    console.log(`   - DoD Standard (< 10ms): ${duration < 10.0 ? '✅ PASSED PERFECTLY' : '❌ FAILED'}`);
    return duration < 10.0;
  }
}
