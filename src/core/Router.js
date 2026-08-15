/**
 * TeachDS SPA Hash Router Engine with URL Sync & Lifecycle Hooks
 * Senior Architecture Layer: Core
 */

import { store } from './Store.js';

class Router {
  constructor() {
    this.routes = new Map();
    this.currentViewInstance = null;
    this.isNavigatingInternal = false;
    this.initHashListener();
  }

  registerRoute(viewName, viewInstance) {
    this.routes.set(viewName, viewInstance);
  }

  initHashListener() {
    window.addEventListener('hashchange', () => {
      if (this.isNavigatingInternal) {
        this.isNavigatingInternal = false;
        return;
      }
      const routeFromHash = this.getRouteFromHash();
      if (routeFromHash && this.routes.has(routeFromHash)) {
        this.navigateTo(routeFromHash, false);
      }
    });
  }

  getRouteFromHash() {
    const raw = window.location.hash.replace(/^#\/?/, '');
    const cleanRoute = raw.split('?')[0];
    return cleanRoute || null;
  }

  navigateTo(viewName, updateHash = true) {
    if (!this.routes.has(viewName)) return;

    // Unmount current view
    if (this.currentViewInstance && typeof this.currentViewInstance.onUnmount === 'function') {
      this.currentViewInstance.onUnmount();
    }

    // Update URL hash without re-triggering hashchange listener loop
    if (updateHash) {
      this.isNavigatingInternal = true;
      window.location.hash = `#/${viewName}`;
    }

    // Update global state
    store.setState({ currentView: viewName });

    // Hide all view sections in DOM
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));

    // Show target section & highlight active sidebar tab
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

  bootstrapInitialRoute(defaultView = 'launchpad') {
    const initialRoute = this.getRouteFromHash() || defaultView;
    if (this.routes.has(initialRoute)) {
      this.navigateTo(initialRoute, true);
    } else {
      this.navigateTo(defaultView, true);
    }
  }
}

export const router = new Router();
