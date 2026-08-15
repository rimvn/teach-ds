import { BaseView } from './BaseView.js';

export class SettingsProView extends BaseView {
  constructor() {
    super('settings-pro');
  }

  onMount() {
    console.log('⚙️ TeachDS Settings Pro View Mounted');
  }
}
