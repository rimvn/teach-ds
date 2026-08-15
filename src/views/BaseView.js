/**
 * Abstract Base View Controller
 * Senior Architecture Layer: View Component Base
 */

export class BaseView {
  constructor(viewName) {
    this.viewName = viewName;
  }

  onMount() {
    // Abstract method to be overridden by child views
  }

  onUnmount() {
    // Abstract method to be overridden by child views
  }
}
