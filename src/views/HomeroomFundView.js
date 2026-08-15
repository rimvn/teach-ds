import { BaseView } from './BaseView.js';

export class HomeroomFundView extends BaseView {
  constructor() {
    super('homeroom-fund');
  }

  onMount() {
    console.log('💰 TeachDS Homeroom Fund View Mounted');
  }
}
