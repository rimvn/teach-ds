import { BaseView } from './BaseView.js';
import { router } from '../core/Router.js';

export class TimetableManagerView extends BaseView {
  constructor() {
    super('timetable');
  }

  onMount() {
    console.log('📅 TeachDS Timetable Manager View Mounted');
    document.getElementById('timetable-start-hero')?.addEventListener('click', () => {
      router.navigateTo('live-workspace');
    });
  }
}
