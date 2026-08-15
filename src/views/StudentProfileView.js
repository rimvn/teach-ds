/**
 * TeachDS Student Profile 360 Full Page View (Màn hình Học Bạ & Analytics Chi Tiết 360)
 * Task ID: TASK-SP5-04 (Sprint 5)
 */

import { BaseView } from './BaseView.js';
import { localFirstAdapter, STORAGE_STORES } from '../core/adapters/LocalFirstAdapter.js';
import { audioSynthesizer } from '../core/AudioSynthesizer.js';
import { ipcDispatcher } from '../core/IPCDispatcher.js';

export class StudentProfileView extends BaseView {
  constructor() {
    super('student-profile');
    this.studentId = null;
    this.student = null;
  }

  async onMount() {
    console.log('🎓 [StudentProfileView] Mounted Full Page Student 360 Analytics Dashboard');
    
    // Parse student ID from URL hash query or storage
    const hash = window.location.hash;
    const match = hash.match(/id=([^&]+)/);
    this.studentId = match ? match[1] : (localStorage.getItem('active_student_profile_id') || 'student_10a2_1');

    await this.loadStudentData();
    this.renderStudentProfileView();
    this.bindEvents();
  }

  async loadStudentData() {
    try {
      const saved = await localFirstAdapter.getAll(STORAGE_STORES.STUDENTS);
      if (saved && saved.length > 0) {
        this.student = saved.find(s => s.id === this.studentId) || saved[0];
      }
    } catch (e) {}

    if (!this.student) {
      this.student = {
        id: this.studentId || 'student_10a2_1',
        classId: '10A2',
        stt: 1,
        name: 'Nguyễn Văn An',
        studentCode: 'HS10A201',
        gender: 'Nam',
        parentPhone: '0912.345.678',
        stars: 18,
        seatRow: 2,
        seatCol: 1,
        role: '👑 Lớp Trưởng',
        note: 'Học sinh giỏi toàn diện, năng nổ'
      };
    }
  }

  renderStudentProfileView() {
    const s = this.student;
    const root = document.getElementById('view-student-profile');
    if (!root) return;

    root.innerHTML = `
      <div class="view-content-wrapper" style="padding: 24px; max-width: 1200px; margin: 0 auto; min-height: 100vh;">
        
        <!-- HEADER TOP NAVIGATION BAR -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <button class="btn-secondary btn-sm" id="btn-back-to-roster" style="padding: 8px 16px; font-weight: 700; display: flex; align-items: center; gap: 6px;">
              ◀ Quay Lại Danh Sách Lớp ${s.classId || '10A2'}
            </button>
            <h2 style="margin: 0; font-size: 20px; color: white; font-weight: 800; display: flex; align-items: center; gap: 8px;">
              🎓 HỒ SƠ & BÁO CÁO HỌC BẠ 360° CHUYÊN SÂU
            </h2>
          </div>

          <div style="display: flex; align-items: center; gap: 10px;">
            <button class="btn-secondary btn-sm" id="btn-call-zalo-ph" style="color: #60a5fa; border-color: #3b82f6; font-weight: 700; padding: 8px 14px;">
              📞 Gọi Zalo PH: ${s.parentPhone || '0912.345.678'}
            </button>
            <button class="btn-primary-glow btn-sm" id="btn-export-pdf-profile" style="font-weight: 800; padding: 8px 16px;">
              📄 Xuất File PDF Học Bạ
            </button>
          </div>
        </div>

        <!-- MAIN 360 PROFILE GRID -->
        <div style="display: grid; grid-template-columns: 320px 1fr; gap: 24px;">
          
          <!-- LEFT COLUMN: STUDENT HERO IDENTITY CARD -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            
            <!-- AVATAR CARD -->
            <div class="glass-card" style="padding: 24px; text-align: center; border-radius: 16px; background: rgba(15, 23, 42, 0.7); border: 1.5px solid var(--accent-purple);">
              <div style="width: 88px; height: 88px; border-radius: 50%; margin: 0 auto 14px auto; background: ${s.gender === 'Nam' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(236, 72, 153, 0.25)'}; color: ${s.gender === 'Nam' ? '#60a5fa' : '#f472b6'}; font-size: 38px; font-weight: 800; display: flex; align-items: center; justify-content: center; border: 3px solid currentColor; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
                ${s.name.split(' ').pop()?.charAt(0) || 'H'}
              </div>

              <h2 style="margin: 0 0 6px 0; color: white; font-size: 20px; font-weight: 800;">${s.name}</h2>
              <div style="font-family: monospace; font-size: 13px; color: var(--accent-gold); font-weight: 700; margin-bottom: 12px;">
                ${s.studentCode} • Lớp ${s.classId || '10A2'}
              </div>

              ${s.role ? `
                <span style="background: rgba(245, 158, 11, 0.25); color: #fbbf24; border: 1px solid #f59e0b; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 800; display: inline-block; margin-bottom: 16px;">
                  ${s.role}
                </span>
              ` : ''}

              <div style="padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1); display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div class="glass-card" style="padding: 10px; text-align: center; background: rgba(245, 158, 11, 0.15); border: 1px solid #f59e0b; border-radius: 10px;">
                  <span style="font-size: 10px; color: var(--text-muted); display: block;">TÍCH LŨY SAO</span>
                  <span style="font-size: 20px; font-weight: 800; color: #fbbf24;">⭐ ${s.stars}</span>
                </div>
                <div class="glass-card" style="padding: 10px; text-align: center; background: rgba(139, 92, 246, 0.15); border: 1px solid var(--accent-purple); border-radius: 10px;">
                  <span style="font-size: 10px; color: var(--text-muted); display: block;">CHỖ NGỒI</span>
                  <span style="font-size: 13px; font-weight: 800; color: #c084fc;">Dãy ${s.seatCol || 1} • Bàn ${s.seatRow || 1}</span>
                </div>
              </div>
            </div>

            <!-- ACTION REWARD PANEL -->
            <div class="glass-card" style="padding: 18px; border-radius: 16px; background: rgba(139, 92, 246, 0.1); border: 1px solid var(--accent-purple);">
              <h4 style="margin: 0 0 12px 0; color: #c084fc; font-size: 14px; font-weight: 800;">⚡ THAO TÁC KHEN THƯỞNG NHANH</h4>
              <button class="btn-primary-glow" id="btn-add-star-profile" style="width: 100%; padding: 12px; font-weight: 800; font-size: 14px; margin-bottom: 8px;">
                +1 ⭐ Thưởng Sao Tích Cực
              </button>
              <button class="btn-secondary" id="btn-deduct-star-profile" style="width: 100%; padding: 8px; font-size: 12px; color: var(--text-muted);">
                -1 Nhắc Nở Kỷ Luật
              </button>
            </div>

            <!-- PARENT & CONTACT CARD -->
            <div class="glass-card" style="padding: 18px; border-radius: 16px; background: rgba(0,0,0,0.4);">
              <h4 style="margin: 0 0 12px 0; color: white; font-size: 14px; font-weight: 800;">📋 LẠI LỊCH & LIÊN LẠC</h4>
              <div style="font-size: 13px; color: var(--text-muted); display: flex; flex-direction: column; gap: 10px;">
                <div>📱 <strong>SĐT Zalo Phụ Huynh:</strong> <span style="color: white; font-weight: 700;">${s.parentPhone || '0912.345.678'}</span></div>
                <div>🚻 <strong>Giới tính:</strong> <span style="color: white;">${s.gender}</span></div>
                <div>🏠 <strong>Địa chỉ liên hệ:</strong> <span style="color: white;">Phường Bến Nghé, Quận 1, TP.HCM</span></div>
                <div>📝 <strong>Ghi chú giáo viên:</strong> <span style="color: #fbbf24; font-weight: 700;">${s.note || 'Học sinh gương mẫu'}</span></div>
              </div>
            </div>

          </div>

          <!-- RIGHT COLUMN: ANALYTICS & PEDAGOGY DETAILS -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            
            <!-- COMPETENCY RADAR ANALYTICS BAR -->
            <div class="glass-card" style="padding: 20px; border-radius: 16px; background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.1);">
              <h3 style="margin: 0 0 16px 0; color: white; font-size: 16px; font-weight: 800; display: flex; align-items: center; gap: 8px;">
                📊 DỮ LIỆU ĐÁNH GIÁ NĂNG LỰC RÈN LUYỆN (5 TIÊU CHÍ GDPT 2018)
              </h3>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                ${this.renderCompetencyBar('🎤 Tự Tin Phát Biểu', 88, '#60a5fa')}
                ${this.renderCompetencyBar('📚 Chất Lượng Bài Làm', 92, '#34d399')}
                ${this.renderCompetencyBar('🤝 Tinh Thần Nhóm', 85, '#c084fc')}
                ${this.renderCompetencyBar('🛡️ Nề Nếp Kỷ Luật', 96, '#fbbf24')}
              </div>
            </div>

            <!-- WEEKLY STAR PROGRESSION TIMELINE -->
            <div class="glass-card" style="padding: 20px; border-radius: 16px; background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.1);">
              <h3 style="margin: 0 0 16px 0; color: white; font-size: 16px; font-weight: 800; display: flex; align-items: center; gap: 8px;">
                📈 TIẾN TRÌNH TÍCH LŨY SAO THƯỞNG 8 TUẦN GẦN NHẤT
              </h3>

              <div style="display: flex; gap: 12px; align-items: flex-end; height: 120px; padding-top: 20px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                ${[2, 4, 3, 5, 4, 6, 5, 8].map((val, idx) => `
                  <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                    <span style="font-size: 10px; color: #fbbf24; font-weight: 800;">+${val}⭐</span>
                    <div style="width: 100%; height: ${val * 12}px; background: linear-gradient(180deg, #f59e0b 0%, #b45309 100%); border-radius: 4px 4px 0 0;"></div>
                    <span style="font-size: 10px; color: var(--text-muted);">T${idx + 1}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- CROSS-SUBJECT PEDAGOGIC FEEDBACK LOG -->
            <div class="glass-card" style="padding: 20px; border-radius: 16px; background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981;">
              <h3 style="margin: 0 0 14px 0; color: #34d399; font-size: 16px; font-weight: 800; display: flex; align-items: center; gap: 8px;">
                💡 NHẬT KÝ NHẬN XÉT CỦA BỘ MÔN & AI SILENT COMPANION
              </h3>

              <div style="display: flex; flex-direction: column; gap: 12px;">
                <div class="glass-card" style="padding: 12px; border-radius: 10px; background: rgba(0,0,0,0.3);">
                  <div style="display: flex; justify-content: space-between; font-size: 12px; color: #c084fc; font-weight: 700; margin-bottom: 4px;">
                    <span>📖 Môn Ngữ Văn (GVBM: Cô Nguyễn Thị Thu)</span>
                    <span>Thứ 3 • Tiết 2</span>
                  </div>
                  <p style="margin: 0; font-size: 13px; color: white; line-height: 1.5;">
                    "Em ${s.name} phát biểu tự tin, diễn đạt câu từ sâu sắc khi phân tích tác phẩm. Giúp đỡ nhiệt tình các bạn cùng nhóm."
                  </p>
                </div>

                <div class="glass-card" style="padding: 12px; border-radius: 10px; background: rgba(0,0,0,0.3);">
                  <div style="display: flex; justify-content: space-between; font-size: 12px; color: #60a5fa; font-weight: 700; margin-bottom: 4px;">
                    <span>📐 Môn Toán Học (GVBM: Thầy Trần Hoàng Minh)</span>
                    <span>Thứ 5 • Tiết 4</span>
                  </div>
                  <p style="margin: 0; font-size: 13px; color: white; line-height: 1.5;">
                    "Tốc độ giải bài tập hình học không gian thần tốc. Xung phong lên bảng trình bày lời giải mẫu cho cả lớp."
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    `;
  }

  renderCompetencyBar(title, pct, color) {
    return `
      <div>
        <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; color: white; margin-bottom: 4px;">
          <span>${title}</span>
          <span style="color: ${color};">${pct}%</span>
        </div>
        <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden;">
          <div style="width: ${pct}%; height: 100%; background: ${color}; border-radius: 4px; transition: width 0.5s ease;"></div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Back to Class Roster Action
    document.getElementById('btn-back-to-roster')?.addEventListener('click', () => {
      audioSynthesizer.playChime();
      window.location.hash = '#/class-roster';
    });

    // Call Zalo Parent Action
    document.getElementById('btn-call-zalo-ph')?.addEventListener('click', () => {
      audioSynthesizer.playChime();
      alert(`📞 [ĐANG KẾT NỐI ZALO PHỤ HUYNH]\nĐang mở ứng dụng Zalo gọi đến số: ${this.student?.parentPhone || '0912.345.678'}`);
    });

    // Export PDF Action
    document.getElementById('btn-export-pdf-profile')?.addEventListener('click', () => {
      audioSynthesizer.playChime();
      alert(`📄 [ĐÃ XUẤT FILE PDF HỌC BẠ 360°]\nĐã tạo file PDF Học Bạ 360° cho em ${this.student?.name} thành công!`);
    });

    // Add Star Profile Action
    document.getElementById('btn-add-star-profile')?.addEventListener('click', async () => {
      if (this.student) {
        this.student.stars += 1;
        audioSynthesizer.playChime();
        this.renderStudentProfileView();
        await localFirstAdapter.put(STORAGE_STORES.STUDENTS, this.student);
        ipcDispatcher.send('AWARD_STAR', { studentId: this.student.id, studentName: this.student.name, stars: 1, reason: 'Khen thưởng Hồ sơ 360° Chi Tiết' });
      }
    });

    // Deduct Star Action
    document.getElementById('btn-deduct-star-profile')?.addEventListener('click', async () => {
      if (this.student && this.student.stars > 0) {
        this.student.stars -= 1;
        this.renderStudentProfileView();
        await localFirstAdapter.put(STORAGE_STORES.STUDENTS, this.student);
      }
    });
  }
}
