import { BaseView } from './BaseView.js';

export class ClassRosterView extends BaseView {
  constructor() {
    super('class-roster');
  }

  onMount() {
    console.log('📋 TeachDS Class Roster & Seating Chart View Mounted');
  }
}
