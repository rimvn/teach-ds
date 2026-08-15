import { BaseView } from './BaseView.js';

export class ResourceBankView extends BaseView {
  constructor() {
    super('resource-bank');
  }

  onMount() {
    console.log('📚 TeachDS Resource Bank View Mounted');
  }
}
