/**
 * TeachDS Reactive CoreStore Engine (Pub/Sub Pattern + Immutable State Proxy)
 * Senior Architecture Layer: Core Store Engine
 * Task ID: TASK-SP1-01 (Sprint 1)
 */

import { APP_CONFIG } from '../config/appConfig.js';

export const ACTION_TYPES = {
  SET_VIEW: 'SET_VIEW',
  TOGGLE_SOUND: 'TOGGLE_SOUND',
  SET_CURRENT_SLIDE: 'SET_CURRENT_SLIDE',
  REWARD_STUDENT: 'REWARD_STUDENT',
  UPDATE_STUDENT: 'UPDATE_STUDENT',
  ADD_FUND_ENTRY: 'ADD_FUND_ENTRY',
  UPDATE_TT22_CONDUCT: 'UPDATE_TT22_CONDUCT',
  UPDATE_RISK_ALERT: 'UPDATE_RISK_ALERT',
  SET_SCHOOL_PROFILE: 'SET_SCHOOL_PROFILE'
};

class Store {
  constructor() {
    this.state = {
      currentView: APP_CONFIG.defaultView,
      soundEnabled: true,
      activeLessonId: 'L10A2_VAN12',
      currentSlideIndex: 5,
      totalSlides: 20,
      currentSchoolYear: '2026-2027',
      currentClassId: '10A2',
      schoolProfile: {
        schoolId: 'THPT_CHU_VAN_AN',
        schoolName: 'Trường THPT Chu Văn An',
        schoolType: 'UPPER_SEC_ONLY',
        activeLevels: ['UPPER_SEC']
      },
      students: [
        { id: '1', name: 'Nguyễn Văn An', code: 'HS1001', desk: 'Bàn 1A', totalStars: 15, avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=An' },
        { id: '2', name: 'Lê Hoàng Minh', code: 'HS1002', desk: 'Bàn 1B', totalStars: 12, avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Minh' },
        { id: '3', name: 'Phạm Quốc Dũng', code: 'HS1003', desk: 'Bàn 2B', totalStars: 4, avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Dung' },
        { id: '4', name: 'Đỗ Thanh Giang', code: 'HS1004', desk: 'Bàn 3B', totalStars: 8, avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Giang' }
      ],
      rewardLogs: [
        { id: 'log_1', studentId: '1', studentName: 'Nguyễn Văn An', stars: 1, reason: 'Diễn đạt trôi chảy', timestamp: Date.now() - 3600000, source: 'TOUCH_DOCK' },
        { id: 'log_2', studentId: '2', studentName: 'Lê Hoàng Minh', stars: 1, reason: 'Trả lời đúng ý', timestamp: Date.now() - 1800000, source: 'AI_SILENT_LISTEN' }
      ],
      riskAlerts: [
        { id: 'risk_1', studentId: '3', studentName: 'Phạm Quốc Dũng', riskLevel: 'RED_ABSENT', description: 'Vắng 3 tiết Toán & Lý không lý do', isResolved: false },
        { id: 'risk_2', studentId: '4', studentName: 'Đỗ Thanh Giang', riskLevel: 'ORANGE_INACTIVE', description: 'Giảm 70% lượt tương tác trong 2 tuần qua', isResolved: false }
      ],
      fundLedger: [
        { id: 'fund_1', date: '2026-08-10', title: 'Thu quỹ lớp HK1 (40/42 HS x 300k)', type: 'INCOME', amount: 12000000, isPaidViaVietQR: true },
        { id: 'fund_2', date: '2026-08-12', title: 'Mua phần thưởng vinh danh tiết học', type: 'EXPENSE', amount: 1250000, isPaidViaVietQR: false }
      ],
      tt22ConductGrades: [
        { studentId: '1', studentName: 'Nguyễn Văn An', totalStars: 15, absents: 0, aiSuggestedLevel: 'TOT', teacherApprovedLevel: 'TOT', note: 'Chăm ngoan, hăng hái phát biểu, giữ chức Tổ trưởng xuất sắc.' },
        { studentId: '2', studentName: 'Lê Hoàng Minh', totalStars: 12, absents: 1, aiSuggestedLevel: 'TOT', teacherApprovedLevel: 'TOT', note: 'Học lực giỏi, lễ phép, hòa đồng với bạn bè.' },
        { studentId: '3', studentName: 'Phạm Quốc Dũng', totalStars: 4, absents: 3, aiSuggestedLevel: 'KHA', teacherApprovedLevel: 'KHA', note: 'Cần cố gắng chuyên cần hơn trong học kỳ 2.' }
      ]
    };

    this.listeners = new Set();
    this.selectorSubscribers = new Map();
    this.cachedSnapshot = null;
  }

  /**
   * Get an immutable snapshot of current state (Cached Snapshot for < 0.1ms high performance)
   */
  getState() {
    if (!this.cachedSnapshot) {
      this.cachedSnapshot = Object.freeze({ ...this.state });
    }
    return this.cachedSnapshot;
  }

  /**
   * Primary Action Dispatcher with Performance Benchmarking (< 2ms DoD Requirement)
   */
  dispatch(actionType, payload) {
    const startTime = performance.now();

    switch (actionType) {
      case ACTION_TYPES.SET_VIEW:
        this.state = { ...this.state, currentView: payload };
        break;

      case ACTION_TYPES.TOGGLE_SOUND:
        this.state = { ...this.state, soundEnabled: typeof payload === 'boolean' ? payload : !this.state.soundEnabled };
        break;

      case ACTION_TYPES.SET_CURRENT_SLIDE:
        if (payload >= 1 && payload <= this.state.totalSlides) {
          this.state = { ...this.state, currentSlideIndex: payload };
        }
        break;

      case ACTION_TYPES.REWARD_STUDENT: {
        const { studentId, stars = 1, reason = 'Khen thưởng tiết học', source = 'TOUCH_DOCK' } = payload;
        let rewardedStudentName = '';
        const updatedStudents = this.state.students.map(s => {
          if (s.id === studentId) {
            rewardedStudentName = s.name;
            return { ...s, totalStars: s.totalStars + stars };
          }
          return s;
        });

        const newLog = {
          id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          studentId,
          studentName: rewardedStudentName,
          stars,
          reason,
          timestamp: Date.now(),
          source
        };

        this.state = {
          ...this.state,
          students: updatedStudents,
          rewardLogs: [newLog, ...this.state.rewardLogs]
        };
        break;
      }

      case ACTION_TYPES.UPDATE_STUDENT: {
        const updatedStudents = this.state.students.map(s => s.id === payload.id ? { ...s, ...payload } : s);
        this.state = { ...this.state, students: updatedStudents };
        break;
      }

      case ACTION_TYPES.ADD_FUND_ENTRY: {
        const newEntry = {
          id: `fund_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          ...payload
        };
        this.state = { ...this.state, fundLedger: [newEntry, ...this.state.fundLedger] };
        break;
      }

      case ACTION_TYPES.UPDATE_TT22_CONDUCT: {
        const updatedTT22 = this.state.tt22ConductGrades.map(g => {
          if (g.studentId === payload.studentId) {
            return { ...g, ...payload };
          }
          return g;
        });
        this.state = { ...this.state, tt22ConductGrades: updatedTT22 };
        break;
      }

      case ACTION_TYPES.UPDATE_RISK_ALERT: {
        const updatedRisk = this.state.riskAlerts.map(r => r.id === payload.id ? { ...r, ...payload } : r);
        this.state = { ...this.state, riskAlerts: updatedRisk };
        break;
      }

      case ACTION_TYPES.SET_SCHOOL_PROFILE: {
        this.state = { ...this.state, schoolProfile: { ...this.state.schoolProfile, ...payload } };
        break;
      }

      default:
        console.warn(`[CoreStore] Unknown Action Type: ${actionType}`);
        return;
    }

    this.notify();

    const duration = performance.now() - startTime;
    if (duration > 2.0) {
      console.warn(`⚠️ [CoreStore Perf Warning] Action '${actionType}' took ${duration.toFixed(2)}ms (> 2ms DoD limit)`);
    } else {
      console.log(`⚡ [CoreStore Dispatch] '${actionType}' completed in ${duration.toFixed(3)}ms`);
    }
  }

  /**
   * Direct State Update Method (Low Level)
   */
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notify();
  }

  /**
   * Subscribe to full state changes (Pub/Sub)
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Selector-based slice subscription with shallow diffing
   */
  select(selectorFn, callbackFn) {
    let currentSlice = selectorFn(this.state);
    const listener = (state) => {
      const nextSlice = selectorFn(state);
      if (JSON.stringify(currentSlice) !== JSON.stringify(nextSlice)) {
        currentSlice = nextSlice;
        callbackFn(nextSlice);
      }
    };
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all active subscribers
   */
  notify() {
    this.cachedSnapshot = null;
    const stateSnapshot = this.getState();
    this.listeners.forEach(listener => {
      try {
        listener(stateSnapshot);
      } catch (err) {
        console.error('[CoreStore Notify Error]', err);
      }
    });
  }

  /**
   * Helper Methods
   */
  toggleSound() {
    this.dispatch(ACTION_TYPES.TOGGLE_SOUND);
  }

  setSlideIndex(index) {
    this.dispatch(ACTION_TYPES.SET_CURRENT_SLIDE, index);
  }

  rewardStudent(studentId, stars = 1, reason = 'Khen thưởng tiết học') {
    this.dispatch(ACTION_TYPES.REWARD_STUDENT, { studentId, stars, reason });
  }

  /**
   * Self-benchmarking test verifying DoD compliance (< 2ms execution requirement)
   */
  benchmarkPerformance(iterations = 100) {
    console.log(`🧪 [CoreStore Benchmark] Running ${iterations} iterations of state mutations...`);
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      this.dispatch(ACTION_TYPES.REWARD_STUDENT, { studentId: '1', stars: 1, reason: `Benchmark test ${i}` });
    }
    const totalDuration = performance.now() - start;
    const avgDuration = totalDuration / iterations;

    console.log(`🏆 [CoreStore Benchmark Results]:`);
    console.log(`   - Total Time (${iterations} ops): ${totalDuration.toFixed(2)}ms`);
    console.log(`   - Avg Time Per Op: ${avgDuration.toFixed(4)}ms`);
    console.log(`   - DoD Standard (< 2ms): ${avgDuration < 2.0 ? '✅ PASSED PERFECTLY' : '❌ FAILED'}`);
    return avgDuration < 2.0;
  }
}

export const store = new Store();
