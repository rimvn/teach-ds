import { BaseView } from './BaseView.js';
import { store } from '../core/Store.js';

export class MobileRemoteView extends BaseView {
  constructor() {
    super('mobile-remote');
  }

  onMount() {
    console.log('📱 TeachDS Mobile Remote View Mounted');
    this.bindEvents();
  }

  bindEvents() {
    document.getElementById('remote-next-btn')?.addEventListener('click', () => {
      const { currentSlideIndex } = store.getState();
      store.setSlideIndex(currentSlideIndex + 1);
    });

    document.getElementById('remote-prev-btn')?.addEventListener('click', () => {
      const { currentSlideIndex } = store.getState();
      store.setSlideIndex(currentSlideIndex - 1);
    });
  }
}
