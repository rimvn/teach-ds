/**
 * TeachDS Post Class AI Review & Confirmation Board
 * Senior Architecture Layer: Post Class Review Controller
 * Task ID: TASK-SP3-03 (Sprint 3 - 3 SP)
 */

import { BaseView } from './BaseView.js';
import { router } from '../core/Router.js';
import { store } from '../core/Store.js';
import { audioAiProcessor } from '../core/audio/AudioAiProcessor.js';
import { audioSynthesizer } from '../core/AudioSynthesizer.js';
import { audioReplayDrawer } from '../components/AudioReplayDrawer.js';
import { ipcDispatcher } from '../core/IPCDispatcher.js';

export class PostClassView extends BaseView {
  constructor() {
    super('post-class');
    this.unsubscribeDrafts = null;
  }

  onMount() {
    console.log('🤖 [PostClassView] Mounted AI Confirm Board (TASK-SP3-03)');
    this.renderDraftCards();
    this.bindEvents();

    // Subscribe to real-time AI Draft Card detections
    this.unsubscribeDrafts = audioAiProcessor.onDraftDetected(() => {
      this.renderDraftCards();
    });
  }

  onUnmount() {
    if (this.unsubscribeDrafts) {
      this.unsubscribeDrafts();
      this.unsubscribeDrafts = null;
    }
  }

  /**
   * Render AI Draft Cards list dynamically
   */
  renderDraftCards() {
    const container = document.querySelector('.ai-cards-list');
    if (!container) return;

    const drafts = audioAiProcessor.getDrafts();
    const { students } = store.getState();

    if (drafts.length === 0) {
      container.innerHTML = `
        <div class="glass-card" style="padding: 32px; text-align: center; color: var(--text-muted);">
          <h3>🎉 Chưa có thêm đề xuất khen thưởng nào mới</h3>
          <p>AI đang ngầm lắng nghe tiết học trên bục giảng...</p>
        </div>
      `;
      return;
    }

    container.innerHTML = drafts.map((draft, idx) => `
      <div class="ai-draft-card glass-card" data-id="${draft.id}">
        <div class="card-meta" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span class="timestamp" style="font-size: 13px; color: var(--accent-gold); font-weight: 700;">⏱️ ${draft.timestamp}</span>
          <span class="badge-ai" style="background: rgba(139, 92, 246, 0.2); border: 1px solid var(--accent-purple); color: #c084fc; padding: 2px 8px; border-radius: 12px; font-size: 12px;">🤖 On-Device STT AI</span>
        </div>

        <div class="stt-text-box" style="background: rgba(15, 23, 42, 0.6); border-left: 3px solid var(--accent-blue); padding: 8px 12px; margin-bottom: 14px; border-radius: 4px; font-style: italic; color: #93c5fd; font-size: 13px;">
          💬 <strong>Văn bản STT Nhận Diện:</strong> ${draft.transcriptSnippet || '"Lời khen trên bục giảng"'}
        </div>

        <div class="card-content-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; align-items: center;">
          <div class="student-select">
            <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Học sinh được khen:</label>
            <select class="select-student glass-input" data-draft-id="${draft.id}" style="width: 100%; padding: 6px 12px; background: rgba(0,0,0,0.4); border: 1px solid var(--border-color); color: white; border-radius: 6px;">
              ${students.map(s => `
                <option value="${s.id}" ${s.name === draft.studentName || s.id === draft.studentId ? 'selected' : ''}>
                  ${s.name} (Lớp 10A2)
                </option>
              `).join('')}
            </select>
          </div>

          <div class="audio-replay">
            <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Nghe lại âm thanh 10s bối cảnh gốc:</label>
            <button class="btn-play-audio btn-secondary btn-sm" data-url="${draft.audioUrl}" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px;">
              <span class="icon">🔊</span> [🔊 Play 10s Audio Bối Cảnh]
            </button>
          </div>

          <div class="score-adjust">
            <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Điểm sao thưởng:</label>
            <div class="star-rating" style="display: flex; gap: 6px;">
              <span style="font-size: 18px; font-weight: 800; color: var(--accent-gold);">⭐ +${draft.stars} Star</span>
            </div>
          </div>

          <div class="tags-note">
            <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Tiêu chí khen thưởng:</label>
            <span class="tag-badge green" style="background: rgba(16, 185, 129, 0.2); color: #34d399; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 700;">
              ${draft.reason}
            </span>
          </div>
        </div>
      </div>
    `).join('');

    // Bind Audio Replay Buttons (TASK-SP3-04)
    container.querySelectorAll('.btn-play-audio').forEach(btn => {
      btn.addEventListener('click', () => {
        const url = btn.getAttribute('data-url');
        audioReplayDrawer.playAudioContext(url, 1.0);
      });
    });
  }

  bindEvents() {
    // Confirm & Trigger Celebration Fireworks Action
    document.getElementById('confirm-vinh-danh-btn')?.addEventListener('click', () => {
      console.log('✔ [PostClassView] Confirming AI Draft Cards & Triggering Celebration Fireworks...');
      
      const drafts = audioAiProcessor.getDrafts();
      drafts.forEach(d => {
        store.rewardStudent(d.studentId, d.stars, d.reason);
        ipcDispatcher.broadcastReward({
          studentId: d.studentId,
          name: d.studentName,
          stars: d.stars,
          reason: d.reason
        });
      });

      audioSynthesizer.playFanfare();
      audioAiProcessor.clearDrafts();
      router.navigateTo('celebration');
    });

    // Cancel All Drafts
    document.getElementById('cancel-post-btn')?.addEventListener('click', () => {
      audioAiProcessor.clearDrafts();
      router.navigateTo('launchpad');
    });
  }
}
