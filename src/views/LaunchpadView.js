import { BaseView } from './BaseView.js';
import { store } from '../core/Store.js';
import { router } from '../core/Router.js';

export class LaunchpadView extends BaseView {
  constructor() {
    super('launchpad');
  }

  onMount() {
    console.log('🚀 TeachDS Launchpad View Mounted');
    this.bindEvents();
  }

  bindEvents() {
    const startBtn = document.getElementById('start-lesson-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        router.navigateTo('live-workspace');
      });
    }
  }
}
