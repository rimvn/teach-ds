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
    console.log('🖥️ TeachDS Live Workspace View Mounted');
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
    // Listen to IPC Reward Events across Windows/Tabs (DoD Task-SP1-02)
    const unbindReward = ipcDispatcher.on(IPC_EVENTS.REWARD_STUDENT, (payload) => {
      console.log('⚡ [IPC Receiver] Reward Event:', payload);
      const studentName = payload.name || payload.studentName || 'Nguyễn Văn An';
      const stars = payload.stars || 1;
      const reason = payload.reason || 'Phát biểu xuất sắc';
      const studentId = payload.studentId || payload.id || '1';

      // 1. Nổi Toast hạt sáng trên Tivi & Phát tiếng "Ting-Ting"
      this.showRewardToast(studentName, stars, reason);
      audioSynthesizer.playChime();

      // 2. Tự động đồng bộ cộng sao vào Store nếu chưa cộng
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
    document.getElementById('next-slide-btn')?.addEventListener('click', () => {
      slideEngineAdapter.nextStep();
    });

    document.getElementById('prev-slide-btn')?.addEventListener('click', () => {
      slideEngineAdapter.prevStep();
    });

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

    grid.querySelectorAll('.student-touch-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        const student = students.find(s => s.id === id);
        
        // 1. Mutate Store
        store.rewardStudent(id, 1, 'Khen thưởng 1-Touch');
        
        // 2. Broadcast over IPC Channel to Tivi View
        if (student) {
          ipcDispatcher.broadcastReward({ name: student.name, stars: 1, reason: 'Tương tác hăng hái' });
        }
      });
    });
  }

  showRewardToast(studentName, stars = 1, reason = 'Phát biểu xuất sắc') {
    const toast = document.getElementById('reward-toast');
    const toastStudent = document.getElementById('toast-student');
    const toastTitle = document.getElementById('toast-title');
    const toastReason = document.getElementById('toast-reason');

    if (!toast) return;

    if (toastStudent) toastStudent.textContent = `Em ${studentName}`;
    if (toastTitle) toastTitle.textContent = `+${stars} ⭐ Khen Thưởng!`;
    if (toastReason) toastReason.textContent = reason || 'Diễn đạt trôi chảy & Tự tin!';

    toast.classList.remove('hidden');

    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.add('hidden');
    }, 2800);
  }

  updateSlideDisplay(index) {
    const tiviNum = document.getElementById('tivi-slide-num');
    const dockNum = document.getElementById('dock-slide-num');
    if (tiviNum) tiviNum.textContent = index;
    if (dockNum) dockNum.textContent = index;
  }
}
