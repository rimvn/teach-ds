import { BaseView } from './BaseView.js';
import { router } from '../core/Router.js';

export class PostClassView extends BaseView {
  constructor() {
    super('post-class');
  }

  onMount() {
    console.log('🤖 TeachDS Post Class AI Confirm View Mounted');
    this.bindEvents();
  }

  bindEvents() {
    document.getElementById('confirm-vinh-danh-btn')?.addEventListener('click', () => {
      router.navigateTo('celebration');
    });
  }
}
