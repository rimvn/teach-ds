/**
 * TeachDS SPA Router Engine with Lifecycle Hooks
 * Senior Architecture Layer: Core
 */

import { store } from './Store.js';

class Router {
  constructor() {
    this.routes = new Map();
    this.currentViewInstance = null;
  }

  registerRoute(viewName, viewInstance) {
    this.routes.set(viewName, viewInstance);
  }

  navigateTo(viewName) {
    if (!this.routes.has(viewName)) return;

    // Unmount current view
    if (this.currentViewInstance && typeof this.currentViewInstance.onUnmount === 'function') {
      this.currentViewInstance.onUnmount();
    }

    // Update state
    store.setState({ currentView: viewName });

    // Hide all view sections in DOM
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));

    // Show target section & highlight active tab
    const targetSection = document.getElementById(`view-${viewName}`);
    const targetTab = document.querySelector(`.nav-tab[data-view="${viewName}"]`);
    
    if (targetSection) targetSection.classList.add('active');
    if (targetTab) targetTab.classList.add('active');

    // Mount new view controller
    this.currentViewInstance = this.routes.get(viewName);
    if (typeof this.currentViewInstance.onMount === 'function') {
      this.currentViewInstance.onMount();
    }
  }
}

export const router = new Router();
