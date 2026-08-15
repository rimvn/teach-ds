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
    console.log('🖥️ TeachDS Live Workspace View Mounted');
    this.renderStudentsGrid();
    this.bindEvents();

    this.unsubscribe = store.subscribe(state => {
      this.updateSlideDisplay(state.currentSlideIndex);
    });
  }

  onUnmount() {
    if (this.unsubscribe) this.unsubscribe();
  }

  bindEvents() {
    document.getElementById('next-slide-btn')?.addEventListener('click', () => {
      const { currentSlideIndex } = store.getState();
      store.setSlideIndex(currentSlideIndex + 1);
    });

    document.getElementById('prev-slide-btn')?.addEventListener('click', () => {
      const { currentSlideIndex } = store.getState();
      store.setSlideIndex(currentSlideIndex - 1);
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
        store.rewardStudent(id, 1);
        audioSynthesizer.playChime();
        this.renderStudentsGrid();
      });
    });
  }

  updateSlideDisplay(index) {
    const tiviNum = document.getElementById('tivi-slide-num');
    const dockNum = document.getElementById('dock-slide-num');
    if (tiviNum) tiviNum.textContent = index;
    if (dockNum) dockNum.textContent = index;
  }
}
