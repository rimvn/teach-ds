/**
 * TeachDS Central Reactive Store Engine (Pub/Sub Pattern)
 * Senior Architecture Layer: Core
 */

import { APP_CONFIG } from '../config/appConfig.js';

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
        schoolType: 'UPPER_SEC_ONLY'
      },
      students: [
        { id: '1', name: 'Nguyễn Văn An', code: 'HS1001', desk: 'Bàn 1A', totalStars: 15, avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=An' },
        { id: '2', name: 'Lê Hoàng Minh', code: 'HS1002', desk: 'Bàn 1B', totalStars: 12, avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Minh' },
        { id: '3', name: 'Phạm Quốc Dũng', code: 'HS1003', desk: 'Bàn 2B', totalStars: 4, avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Dung' },
        { id: '4', name: 'Đỗ Thanh Giang', code: 'HS1004', desk: 'Bàn 3B', totalStars: 8, avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Giang' }
      ]
    };
    this.listeners = new Set();
  }

  getState() {
    return Object.freeze({ ...this.state });
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(fn => fn(this.state));
  }

  toggleSound() {
    this.setState({ soundEnabled: !this.state.soundEnabled });
  }

  setSlideIndex(index) {
    if (index >= 1 && index <= this.state.totalSlides) {
      this.setState({ currentSlideIndex: index });
    }
  }

  rewardStudent(studentId, stars = 1) {
    const updatedStudents = this.state.students.map(s => {
      if (s.id === studentId) {
        return { ...s, totalStars: s.totalStars + stars };
      }
      return s;
    });
    this.setState({ students: updatedStudents });
  }
}

export const store = new Store();
