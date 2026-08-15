/**
 * TeachDS Live Workspace View Controller (Tivi View 4K & Teacher PC Dock Control Panel Master)
 * Senior Architecture Layer: Views / Presentation
 * Task ID: TASK-SP2-04 (Sprint 2)
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
    this.wheelAngle = 0;
    this.isSpinning = false;
    this.classroomTimerInterval = null;
    this.timerSecondsLeft = 300; // Default 5 minutes
  }

  onMount() {
    console.log('🖥️ TeachDS Live Workspace View Mounted (Teacher PC Dock Active)');
    window.liveWorkspaceView = this;
    this.renderStudentsGrid();
    slideEngineAdapter.renderCurrentSlide();
    this.bindEvents();
    this.bindIPCListeners();
    this.initSpinWheelCanvas();

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
    if (this.classroomTimerInterval) clearInterval(this.classroomTimerInterval);
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

    // Listen to IPC Slide Change Events across Multi-Tab & Multi-Window
    const unbindSlide = ipcDispatcher.on(IPC_EVENTS.CHANGE_SLIDE, (payload) => {
      if (payload && payload.slideIndex) {
        slideEngineAdapter.currentSlideIndex = payload.slideIndex;
        slideEngineAdapter.currentAnimationStep = payload.animationStep !== undefined ? payload.animationStep : 0;
        slideEngineAdapter.isBlackScreen = !!payload.isBlackScreen;
        slideEngineAdapter.renderCurrentSlide();
        slideEngineAdapter.applyBlackScreenState();
      }
    });

    this.unsubscribeIPC.push(unbindReward, unbindSlide);
  }

  bindEvents() {
    // Slide Controls
    document.getElementById('next-slide-btn')?.addEventListener('click', () => {
      slideEngineAdapter.nextStep();
    });

    document.getElementById('prev-slide-btn')?.addEventListener('click', () => {
      slideEngineAdapter.prevStep();
    });

    document.getElementById('btn-black-screen')?.addEventListener('click', () => {
      slideEngineAdapter.toggleBlackScreen();
    });

    // End Lesson Action
    document.getElementById('end-lesson-btn')?.addEventListener('click', () => {
      console.log('🏁 [LiveWorkspace] Ending Lesson & Navigating to PostClass Report...');
      audioSynthesizer.playFanfare();
      router.navigateTo('post-class');
    });

    // Tivi Fullscreen Toggle Button
    document.getElementById('btn-tivi-fullscreen')?.addEventListener('click', () => {
      this.toggleTiviFullscreen();
    });

    // CLASSROOM LIVE TOOLS HUB (TASK-SP2-04)
    // 1. Spin Wheel Modal Triggers
    document.getElementById('btn-open-wheel')?.addEventListener('click', () => {
      this.openWheelModal();
    });

    document.getElementById('spin-wheel-btn')?.addEventListener('click', () => {
      this.spinWheel();
    });

    document.getElementById('close-wheel-btn')?.addEventListener('click', () => {
      document.getElementById('wheel-modal')?.classList.add('hidden');
    });

    // 2. Classroom Timer Modal Triggers
    document.getElementById('btn-open-timer')?.addEventListener('click', () => {
      this.openTimerModal();
    });

    document.getElementById('start-timer-btn')?.addEventListener('click', () => {
      this.startClassroomTimer();
    });

    document.getElementById('stop-timer-btn')?.addEventListener('click', () => {
      this.stopClassroomTimer();
    });

    document.getElementById('close-timer-btn')?.addEventListener('click', () => {
      document.getElementById('timer-modal')?.classList.add('hidden');
    });

    document.getElementById('btn-close-timer-expired')?.addEventListener('click', () => {
      document.getElementById('timer-expired-toast')?.classList.add('hidden');
    });

    // Custom Timer Manual Input (Phút & Giây)
    const updateCustomTimer = () => {
      const mins = Math.max(0, parseInt(document.getElementById('custom-timer-input')?.value || '0', 10));
      const secs = Math.max(0, Math.min(59, parseInt(document.getElementById('custom-timer-secs-input')?.value || '0', 10)));
      this.timerSecondsLeft = mins * 60 + secs;
      this.updateTimerDisplay();
    };

    document.getElementById('custom-timer-input')?.addEventListener('input', updateCustomTimer);
    document.getElementById('custom-timer-secs-input')?.addEventListener('input', updateCustomTimer);

    // Quick Timer Presets (1m, 3m, 5m)
    document.querySelectorAll('.btn-timer-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        const mins = parseInt(btn.getAttribute('data-mins') || '5', 10);
        const minsInput = document.getElementById('custom-timer-input');
        const secsInput = document.getElementById('custom-timer-secs-input');
        if (minsInput) minsInput.value = mins;
        if (secsInput) secsInput.value = 0;
        this.timerSecondsLeft = mins * 60;
        this.updateTimerDisplay();
      });
    });

    // 3. Focus Chime Button Trigger (Plays 5 consecutive attention beeps)
    document.getElementById('btn-focus-chime')?.addEventListener('click', () => {
      console.log('🔔 [Teacher Dock] Playing 5 Consecutive Focus Attention Chimes...');
      audioSynthesizer.playFocusChimeSequence(5);
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
   * Spin Wheel HTML5 Canvas Engine (60fps Random Student Wheel)
   */
  openWheelModal() {
    const modal = document.getElementById('wheel-modal');
    if (modal) {
      modal.classList.remove('hidden');
      this.drawWheel();
    }
  }

  initSpinWheelCanvas() {
    const canvas = document.getElementById('wheel-canvas');
    if (canvas) {
      this.drawWheel();
    }
  }

  drawWheel() {
    const canvas = document.getElementById('wheel-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { students } = store.getState();
    const numSlices = students.length || 6;
    const sliceAngle = (2 * Math.PI) / numSlices;
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(150, 150);
    ctx.rotate(this.wheelAngle);

    for (let i = 0; i < numSlices; i++) {
      const angle = i * sliceAngle;
      ctx.beginPath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 140, angle, angle + sliceAngle);
      ctx.lineTo(0, 0);
      ctx.fill();
      ctx.stroke();

      // Text label
      ctx.save();
      ctx.rotate(angle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Inter, sans-serif';
      const studentName = students[i] ? students[i].name : `HS ${i + 1}`;
      ctx.fillText(studentName, 130, 4);
      ctx.restore();
    }

    ctx.restore();
  }

  spinWheel() {
    if (this.isSpinning) return;
    this.isSpinning = true;
    const resultEl = document.getElementById('wheel-result');
    if (resultEl) resultEl.textContent = '🎲 Đang quay ngẫu nhiên...';

    const { students } = store.getState();
    const numSlices = students.length || 6;
    const sliceAngle = (2 * Math.PI) / numSlices;
    
    // Pick random winning index
    const winningIndex = Math.floor(Math.random() * numSlices);
    const winner = students[winningIndex] || { name: 'Trần Bảo Nam', id: '1' };

    // Calculate exact angle to center winning slice under top pointer (12 o'clock = 3π/2)
    // Plus random offset within middle 60% of the slice (never on boundary lines!)
    const sliceCenterAngle = winningIndex * sliceAngle + sliceAngle / 2;
    const pointerAngle = 1.5 * Math.PI; // Top 12 o'clock
    const randomWithinSector = (Math.random() - 0.5) * (sliceAngle * 0.6);
    
    const targetAngle = pointerAngle - sliceCenterAngle + randomWithinSector;
    const fullSpins = 5 * 2 * Math.PI; // 5 full rotations
    const finalWheelAngle = fullSpins + targetAngle;

    const startAngle = this.wheelAngle % (2 * Math.PI);
    const totalDelta = finalWheelAngle - startAngle;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / 3200, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3); // Cubic ease out
      this.wheelAngle = startAngle + totalDelta * easeOut;
      this.drawWheel();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.isSpinning = false;
        if (resultEl) resultEl.textContent = winner.name;
        audioSynthesizer.playChime();
        this.showSelectionToast(winner.name);
      }
    };

    requestAnimationFrame(animate);
  }

  /**
   * Selection Toast Notification Overlay (Chuyên biệt cho Chọn Học Sinh Vòng Quay)
   */
  showSelectionToast(studentName) {
    const toast = document.getElementById('selection-toast');
    const toastStudent = document.getElementById('select-toast-student');
    if (!toast) return;

    if (toastStudent) toastStudent.textContent = `Em ${studentName}`;

    toast.classList.remove('hidden');
    toast.style.display = 'flex';
    toast.classList.remove('toast-bounce-in');
    void toast.offsetWidth;
    toast.classList.add('toast-bounce-in');

    if (this.selectionToastTimer) clearTimeout(this.selectionToastTimer);
    this.selectionToastTimer = setTimeout(() => {
      toast.classList.add('hidden');
      toast.style.display = 'none';
    }, 3200);
  }

  /**
   * Classroom Timer Engine
   */
  openTimerModal() {
    const modal = document.getElementById('timer-modal');
    if (modal) {
      modal.classList.remove('hidden');
      this.updateTimerDisplay();
    }
  }

  startClassroomTimer() {
    if (this.classroomTimerInterval) clearInterval(this.classroomTimerInterval);
    audioSynthesizer.playChime();

    this.classroomTimerInterval = setInterval(() => {
      if (this.timerSecondsLeft > 0) {
        this.timerSecondsLeft--;
        this.updateTimerDisplay();
      } else {
        clearInterval(this.classroomTimerInterval);
        this.classroomTimerInterval = null;
        document.getElementById('timer-modal')?.classList.add('hidden');
        audioSynthesizer.playFanfare();
        const expiredToast = document.getElementById('timer-expired-toast');
        if (expiredToast) expiredToast.classList.remove('hidden');
      }
    }, 1000);
  }

  stopClassroomTimer() {
    if (this.classroomTimerInterval) {
      clearInterval(this.classroomTimerInterval);
      this.classroomTimerInterval = null;
    }
  }

  updateTimerDisplay() {
    const timerDisplay = document.getElementById('timer-display');
    if (!timerDisplay) return;
    const mins = Math.floor(this.timerSecondsLeft / 60).toString().padStart(2, '0');
    const secs = (this.timerSecondsLeft % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${mins}:${secs}`;
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
   * Self-benchmarking test verifying DoD compliance (< 10ms trigger time)
   */
  benchmarkDockControls() {
    console.log(`🧪 [Teacher Dock Benchmark] Testing Dock Control triggers & Timer modal...`);
    const start = performance.now();
    this.openWheelModal();
    this.openTimerModal();
    const duration = performance.now() - start;

    console.log(`🏆 [Teacher Dock Benchmark Results]:`);
    console.log(`   - Control Modal Trigger Duration: ${duration.toFixed(3)}ms`);
    console.log(`   - DoD Standard (< 10ms): ${duration < 10.0 ? '✅ PASSED PERFECTLY' : '❌ FAILED'}`);
    return duration < 10.0;
  }
}
