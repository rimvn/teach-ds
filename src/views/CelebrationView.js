import { BaseView } from './BaseView.js';
import { router } from '../core/Router.js';

export class CelebrationView extends BaseView {
  constructor() {
    super('celebration');
  }

  onMount() {
    console.log('🎆 TeachDS Fireworks Celebration View Mounted');
    this.bindEvents();
  }

  bindEvents() {
    document.getElementById('back-to-launchpad-btn')?.addEventListener('click', () => {
      router.navigateTo('launchpad');
    });
  }
}
