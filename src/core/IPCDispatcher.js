/**
 * TeachDS Inter-Process Communication (IPC) Dispatcher Engine
 * Senior Architecture Layer: Core IPC Channel
 * Task ID: TASK-SP1-02 (Sprint 1)
 */

export const IPC_EVENTS = {
  REWARD_STUDENT: 'IPC_REWARD_STUDENT',
  CHANGE_SLIDE: 'IPC_CHANGE_SLIDE',
  SPIN_WHEEL: 'IPC_SPIN_WHEEL',
  TOGGLE_TIMER: 'IPC_TOGGLE_TIMER',
  AUDIO_CHIME: 'IPC_AUDIO_CHIME',
  PING_LATENCY: 'IPC_PING_LATENCY',
  PONG_LATENCY: 'IPC_PONG_LATENCY'
};

class IPCDispatcher {
  constructor() {
    this.channelName = 'teachds_ipc_bus_channel';
    this.listeners = new Map();
    this.broadcastChannel = null;
    this.isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined;

    this.initTransport();
  }

  /**
   * Initialize Multi-Transport IPC Layer (BroadcastChannel -> Electron IPC -> postMessage)
   */
  /**
   * Initialize Multi-Transport IPC Layer (BroadcastChannel -> localStorage StorageBus -> Electron IPC -> postMessage)
   */
  initTransport() {
    // 1. Primary Transport: BroadcastChannel API (Modern Web Browsers & Vite Dev Mode)
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel(this.channelName);
        this.broadcastChannel.onmessage = (event) => {
          this.handleIncomingMessage(event.data);
        };
        console.log('⚡ [IPCDispatcher] Initialized BroadcastChannel Transport');
      } catch (e) {
        console.warn('⚠️ [IPCDispatcher] BroadcastChannel initialization failed:', e);
      }
    }

    // 2. Cross-Window Storage Event Bus Fallback (Guarantees Sync Across Separate Browser Windows & Monitors)
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key === 'teachds_ipc_bus_event' && event.newValue) {
          try {
            const parsed = JSON.parse(event.newValue);
            if (parsed && parsed.senderId !== this.getSenderId()) {
              this.handleIncomingMessage(parsed);
            }
          } catch (e) {
            console.warn('[IPCDispatcher] Storage Bus Parse Error:', e);
          }
        }
      });
      console.log('🌐 [IPCDispatcher] Initialized Cross-Window Storage Event Bus');
    }

    // 3. Secondary Transport: Electron IPC Bridge (Production Desktop App)
    if (this.isElectron && window.electronAPI && typeof window.electronAPI.onMessage === 'function') {
      window.electronAPI.onMessage((eventData) => {
        this.handleIncomingMessage(eventData);
      });
      console.log('🖥️ [IPCDispatcher] Initialized Electron IPC Bridge');
    }

    // 4. Fallback Transport: Window postMessage / Opener Listener
    if (typeof window !== 'undefined') {
      window.addEventListener('message', (event) => {
        if (event.data && event.data.__teachds_ipc) {
          this.handleIncomingMessage(event.data.message);
        }
      });
    }
  }

  /**
   * Send IPC Message to all connected windows (Tivi View <-> Teacher Dock)
   */
  send(eventType, payload = {}) {
    const startTime = performance.now();
    const messageData = {
      __teachds_ipc: true,
      eventType,
      payload,
      timestamp: Date.now(),
      senderId: this.getSenderId()
    };

    // 1. Send via BroadcastChannel
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(messageData);
      } catch (e) {
        console.warn('[IPCDispatcher] BroadcastChannel send error:', e);
      }
    }

    // 2. Send via Cross-Window Storage Event Bus (Guarantees Sync Across Separate Windows)
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('teachds_ipc_bus_event', JSON.stringify({
          ...messageData,
          _nonce: Math.random() // Guarantees storage event fires every single call
        }));
      } catch (e) {
        console.warn('[IPCDispatcher] Storage Bus send error:', e);
      }
    }

    // 3. Send via Electron IPC Bridge if available
    if (this.isElectron && window.electronAPI && typeof window.electronAPI.sendMessage === 'function') {
      window.electronAPI.sendMessage(messageData);
    }

    // 4. Fallback window.postMessage
    if (typeof window !== 'undefined' && window.opener) {
      window.opener.postMessage({ __teachds_ipc: true, message: messageData }, '*');
    }

    const duration = performance.now() - startTime;
    if (duration > 5.0) {
      console.warn(`⚠️ [IPCDispatcher Perf Warning] Sending '${eventType}' took ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  /**
   * Handle incoming IPC Message and dispatch to registered listeners
   */
  handleIncomingMessage(messageData) {
    if (!messageData || typeof messageData !== 'object') return;
    const { eventType, payload, timestamp } = messageData;

    if (!eventType || !this.listeners.has(eventType)) return;

    const callbacks = this.listeners.get(eventType);
    callbacks.forEach(callback => {
      try {
        callback(payload, { timestamp, latencyMs: Date.now() - timestamp });
      } catch (err) {
        console.error(`[IPCDispatcher Error in listener '${eventType}']`, err);
      }
    });
  }

  /**
   * Register event listener
   */
  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(callback);

    // Return unbind function
    return () => this.off(eventType, callback);
  }

  /**
   * Unregister event listener
   */
  off(eventType, callback) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).delete(callback);
    }
  }

  /**
   * Domain Specialized Helpers
   */
  broadcastReward(studentData) {
    return this.send(IPC_EVENTS.REWARD_STUDENT, studentData);
  }

  broadcastSlideChange(slideIndex, animationStep = 0, isBlackScreen = false) {
    return this.send(IPC_EVENTS.CHANGE_SLIDE, { slideIndex, animationStep, isBlackScreen });
  }

  broadcastWheelSpin(winnerData) {
    return this.send(IPC_EVENTS.SPIN_WHEEL, winnerData);
  }

  broadcastTimerToggle(timerState) {
    return this.send(IPC_EVENTS.TOGGLE_TIMER, timerState);
  }

  broadcastAudioChime(chimeType = 'FOCUS_5_CHIMES') {
    return this.send(IPC_EVENTS.AUDIO_CHIME, { chimeType });
  }

  getSenderId() {
    if (!this._senderId) {
      this._senderId = `win_${Math.random().toString(36).substring(2, 7)}`;
    }
    return this._senderId;
  }

  /**
   * Self-benchmarking test verifying DoD compliance (< 10ms latency requirement)
   */
  benchmarkLatency(iterations = 10, callback) {
    console.log(`🧪 [IPCDispatcher Benchmark] Testing IPC Message Latency over ${iterations} iterations...`);
    const latencies = [];
    let count = 0;

    const unbindPong = this.on(IPC_EVENTS.PONG_LATENCY, (payload) => {
      const latency = Date.now() - payload.sentTime;
      latencies.push(latency);
      count++;

      if (count >= iterations) {
        unbindPong();
        const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
        console.log(`🏆 [IPCDispatcher Benchmark Results]:`);
        console.log(`   - Tested Iterations: ${iterations}`);
        console.log(`   - Avg Round-Trip Latency: ${avgLatency.toFixed(2)}ms`);
        console.log(`   - DoD Standard (< 10ms): ${avgLatency < 10.0 ? '✅ PASSED PERFECTLY' : '❌ FAILED'}`);
        if (typeof callback === 'function') callback(avgLatency < 10.0, avgLatency);
      }
    });

    const unbindPing = this.on(IPC_EVENTS.PING_LATENCY, (payload) => {
      this.send(IPC_EVENTS.PONG_LATENCY, { sentTime: payload.sentTime });
    });

    for (let i = 0; i < iterations; i++) {
      setTimeout(() => {
        this.send(IPC_EVENTS.PING_LATENCY, { sentTime: Date.now() });
      }, i * 20);
    }

    setTimeout(() => unbindPing(), (iterations + 2) * 20);
  }
}

export const ipcDispatcher = new IPCDispatcher();
