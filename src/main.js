/**
 * TeachDS Application Entrypoint & Route Registrations
 * Senior Architecture Layer: Entrypoint
 */

import { store } from './core/Store.js';
import { router } from './core/Router.js';
import { ipcDispatcher } from './core/IPCDispatcher.js';
import { localFirstAdapter } from './core/adapters/LocalFirstAdapter.js';
import { audioSynthesizer } from './core/AudioSynthesizer.js';

// VIEW CONTROLLERS
import { LaunchpadView } from './views/LaunchpadView.js';
import { LiveWorkspaceView } from './views/LiveWorkspaceView.js';
import { MobileRemoteView } from './views/MobileRemoteView.js';
import { PostClassView } from './views/PostClassView.js';
import { CelebrationView } from './views/CelebrationView.js';
import { TimetableManagerView } from './views/TimetableManagerView.js';
import { CapsuleEditorView } from './views/CapsuleEditorView.js';
import { ResourceBankView } from './views/ResourceBankView.js';
import { ClassRosterView } from './views/ClassRosterView.js';
import { WeeklyReportsView } from './views/WeeklyReportsView.js';
import { SettingsProView } from './views/SettingsProView.js';
import { HomeroomAnalyticsView } from './views/HomeroomAnalyticsView.js';
import { HomeroomFundView } from './views/HomeroomFundView.js';
import { HomeroomTT22View } from './views/HomeroomTT22View.js';

class TeachDSApp {
  constructor() {
    this.initViews();
    this.bindNavigation();
    this.bootstrap();
  }

  initViews() {
    router.registerRoute('launchpad', new LaunchpadView());
    router.registerRoute('live-workspace', new LiveWorkspaceView());
    router.registerRoute('mobile-remote', new MobileRemoteView());
    router.registerRoute('post-class', new PostClassView());
    router.registerRoute('celebration', new CelebrationView());
    router.registerRoute('timetable', new TimetableManagerView());
    router.registerRoute('capsule-editor', new CapsuleEditorView());
    router.registerRoute('resource-bank', new ResourceBankView());
    router.registerRoute('class-roster', new ClassRosterView());
    router.registerRoute('weekly-reports', new WeeklyReportsView());
    router.registerRoute('settings-pro', new SettingsProView());
    router.registerRoute('homeroom-analytics', new HomeroomAnalyticsView());
    router.registerRoute('homeroom-fund', new HomeroomFundView());
    router.registerRoute('homeroom-tt22', new HomeroomTT22View());
  }

  bindNavigation() {
    document.querySelectorAll('.nav-tab, .btn-subnav').forEach(tab => {
      tab.addEventListener('click', () => {
        const view = tab.getAttribute('data-view');
        if (view) router.navigateTo(view);
      });
    });
  }

  bootstrap() {
    console.log('🚀 TeachDS Production Workspace initialized with Hash Routing, IPC Channel, LocalFirst DB & Hybrid Audio!');
    window.store = store;
    window.ipcDispatcher = ipcDispatcher;
    window.localFirstAdapter = localFirstAdapter;
    window.audioSynthesizer = audioSynthesizer;

    store.benchmarkPerformance(10);
    ipcDispatcher.benchmarkLatency(10);
    localFirstAdapter.benchmarkStorage(10);
    audioSynthesizer.benchmarkAudio();

    router.bootstrapInitialRoute(store.getState().currentView);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new TeachDSApp();
});
