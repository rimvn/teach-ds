import { BaseView } from './BaseView.js';

export class WeeklyReportsView extends BaseView {
  constructor() {
    super('weekly-reports');
  }

  onMount() {
    console.log('📊 TeachDS Weekly Zalo Reports View Mounted');
  }
}
