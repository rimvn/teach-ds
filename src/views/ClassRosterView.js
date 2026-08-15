/**
 * TeachDS Class Roster Table & Interactive Drag & Drop Seating Chart Controller
 * Senior Architecture Layer: View Layer (Supports Desk Furniture Types: Single, Double, Pod 4, Pod 6)
 */

import { BaseView } from './BaseView.js';
import { ExcelRosterParser } from '../core/parsers/ExcelRosterParser.js';
import { localFirstAdapter, STORAGE_STORES } from '../core/adapters/LocalFirstAdapter.js';
import { audioSynthesizer } from '../core/AudioSynthesizer.js';
import { ipcDispatcher } from '../core/IPCDispatcher.js';
import { router } from '../core/Router.js';
import { APP_CONFIG, GRADES, getSubjectsForGrade as getAppSubjectsForGrade } from '../config/appConfig.js';

export class ClassRosterView extends BaseView {
  constructor() {
    super('class-roster');
    this.currentClass = '10A2';
    this.students = [];
    this.matrixCols = 4; // Số dãy bàn
    this.matrixRows = 6; // Số bàn / dãy
    this.deskType = 'DOUBLE'; // 'DOUBLE' (2 HS/bàn), 'SINGLE', 'POD4', 'POD6'
    this.draggedStudentId = null;
    this.isFullSeating = false;
    this.currentSemester = '2026_HK1';
    this.currentSubject = 'HOMEROOM'; // 'HOMEROOM', 'MATH', 'ENG', 'PHYS', 'CHEM'...
  }

  async onMount() {
    console.log('📋 [ClassRosterView] Mounted Desk Furniture Types & Seating Matrix (TASK-SP5-03)');
    await this.renderSubjectSelectForGrade();
    await this.loadStudents();
    await this.loadCurrentSemesterSeating();
    this.syncSeatingGridWithCurrentStudents();
    this.renderSeatingChartMatrix();
    this.renderRosterTable();
    this.bindEvents();
  }

  ensureSeatingGridInitialized() {
    const totalDesks = this.matrixCols * this.matrixRows;
    const capacityPerDesk = this.deskType === 'DOUBLE' ? 2 
      : (this.deskType === 'POD4' ? 4 
      : (this.deskType === 'POD6' ? 6 
      : (this.deskType.startsWith('CAPACITY_') ? parseInt(this.deskType.replace('CAPACITY_', ''), 10) : 1)));

    const totalSlots = totalDesks * capacityPerDesk;

    if (!this.seatingGrid || this.seatingGrid.length !== totalSlots) {
      this.seatingGrid = Array(totalSlots).fill(null);
      for (let sIdx = 0; sIdx < Math.min(this.students.length, totalSlots); sIdx++) {
        this.seatingGrid[sIdx] = this.students[sIdx];
      }
    }
  }

  getSubjectsForGrade(classId = this.currentClass) {
    const gradeNum = parseInt(classId.replace(/\D/g, ''), 10) || 10;
    const gradeCode = `K${gradeNum}`;

    // Get official pre-seeded subjects from central APP_CONFIG taxonomy engine
    const appSubjects = getAppSubjectsForGrade(gradeCode);

    return (appSubjects || []).map(s => ({
      key: s.code,
      name: `${s.icon} ${s.name}`
    }));
  }

  async renderSubjectSelectForGrade() {
    const subjectSelect = document.getElementById('select-seating-subject');
    if (!subjectSelect) return;

    const gradeSubjects = this.getSubjectsForGrade(this.currentClass);

    let customSubjects = [];
    try {
      const rec = await localFirstAdapter.get(STORAGE_STORES.SETTINGS, `CUSTOM_SUBJECTS_${this.currentClass}`);
      if (rec && rec.value) customSubjects = rec.value;
    } catch (e) {}
    if (!customSubjects || customSubjects.length === 0) {
      try {
        const raw = localStorage.getItem(`CUSTOM_SUBJECTS_${this.currentClass}`);
        if (raw) customSubjects = JSON.parse(raw);
      } catch (e) {}
    }

    const allSubjects = [...gradeSubjects, ...(customSubjects || [])];

    subjectSelect.innerHTML = `
      ${allSubjects.map(s => `<option value="${s.key}" ${s.key === this.currentSubject ? 'selected' : ''}>${s.name}</option>`).join('')}
      <option value="ADD_CUSTOM_SUBJECT">+ ➕ Thêm Bộ Môn Mới Cho Lớp ${this.currentClass}...</option>
    `;
  }

  async saveCustomSubject(key, name) {
    let customSubjects = [];
    const storageId = `CUSTOM_SUBJECTS_${this.currentClass}`;
    try {
      const rec = await localFirstAdapter.get(STORAGE_STORES.SETTINGS, storageId);
      if (rec && rec.value) customSubjects = rec.value;
    } catch (e) {}
    if (!customSubjects) customSubjects = [];

    customSubjects.push({ key, name });

    try {
      await localFirstAdapter.put(STORAGE_STORES.SETTINGS, { id: storageId, value: customSubjects });
    } catch (e) {}
    try {
      localStorage.setItem(storageId, JSON.stringify(customSubjects));
    } catch (e) {}
  }

  async loadStudents() {
    this.seatingGrid = null;
    const targetCountMap = { '10A2': 42, '10A5': 40, '11B1': 38 };
    const expectedCount = targetCountMap[this.currentClass] || 40;

    try {
      const saved = await localFirstAdapter.getAll(STORAGE_STORES.STUDENTS);
      if (saved && saved.length > 0) {
        const classFiltered = saved.filter(s => s.classId === this.currentClass || (!s.classId && this.currentClass === '10A2'));
        if (classFiltered.length > 0) {
          // Slice exactly to the expected class count (e.g. 42 for 10A2)
          this.students = classFiltered.slice(0, expectedCount);
        } else {
          this.students = [];
        }
      }
    } catch (e) {}

    if (!this.students || this.students.length < expectedCount) {
      this.students = ExcelRosterParser.generateMockRosterForClass(this.currentClass, expectedCount);
      for (const s of this.students) {
        await localFirstAdapter.put(STORAGE_STORES.STUDENTS, s);
      }
    }

    const mockFullList = ExcelRosterParser.generateMockRosterForClass(this.currentClass, expectedCount);

    this.students = this.students.map((s, idx) => {
      const stt = idx + 1;
      const studentCode = s.studentCode || `HS${this.currentClass.replace(/[^A-Z0-9]/gi, '')}${stt.toString().padStart(2, '0')}`;
      
      // Authentic Vietnamese Full Name Normalization
      let name = s.name;
      if (!name || name.toLowerCase().includes('test') || name.toLowerCase().includes('học sinh ') || name.toLowerCase().includes('hoc sinh')) {
        name = mockFullList[idx]?.name || `Nguyễn Văn ${stt}`;
      }

      let gender = 'Nam';
      const rawG = String(s.gender !== undefined && s.gender !== null ? s.gender : '').trim().toLowerCase();
      if (rawG === 'nữ' || rawG === 'nu' || rawG === '0' || rawG === 'female' || rawG === 'f') {
        gender = 'Nữ';
      } else if (rawG === 'nam' || rawG === '1' || rawG === 'male' || rawG === 'm') {
        gender = 'Nam';
      } else {
        gender = (idx % 2 === 0) ? 'Nam' : 'Nữ';
      }

      const stars = typeof s.stars === 'number' ? s.stars : ([15, 12, 18, 9, 21, 14, 8, 16, 25, 11][idx % 10]);
      const parentPhone = s.parentPhone || `0912.${Math.floor(100 + Math.random() * 899)}.${Math.floor(100 + Math.random() * 899)}`;

      const updatedStudent = {
        ...s,
        classId: this.currentClass,
        stt,
        name,
        studentCode,
        gender,
        stars,
        parentPhone,
        seatRow: s.seatRow || Math.floor(idx / 4) + 1,
        seatCol: s.seatCol || (idx % 4) + 1
      };

      // Persist cleaned record into IndexedDB
      localFirstAdapter.put(STORAGE_STORES.STUDENTS, updatedStudent);
      return updatedStudent;
    });
  }

  renderRosterTable() {
    const titleElem = document.getElementById('roster-table-title');
    if (titleElem) {
      titleElem.textContent = `📋 Danh Sách Học Sinh Lớp ${this.currentClass} (${this.students.length} Học Sinh)`;
    }

    const tbody = document.getElementById('roster-table-body');
    if (!tbody) return;

    if (this.students.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">
            Chưa có danh sách học sinh. Bấm nút "Import Excel" để tải danh sách lớp.
          </td>
        </tr>
      `;
      return;
    }

    this.ensureSeatingGridInitialized();
    this.syncSeatingGridWithCurrentStudents();

    const capacityPerDesk = this.deskType === 'DOUBLE' ? 2 
      : (this.deskType === 'POD4' ? 4 
      : (this.deskType === 'POD6' ? 6 
      : (this.deskType.startsWith('CAPACITY_') ? parseInt(this.deskType.replace('CAPACITY_', ''), 10) : 1)));

    let displayRoster = [...this.students];

    // Official School Roster Alphabetical Sort (by Tên - Last word of full name in Vietnamese)
    displayRoster.sort((a, b) => {
      const nameA = a.name.trim().split(' ').pop();
      const nameB = b.name.trim().split(' ').pop();
      return nameA.localeCompare(nameB, 'vi');
    });

    // Re-assign official STT (1 -> N) & update seat location badges
    displayRoster.forEach((s, idx) => {
      s.stt = idx + 1;
      const slotIdx = this.findSeatSlotForStudent(s);
      if (slotIdx >= 0) {
        const deskIdx = Math.floor(slotIdx / capacityPerDesk);
        s.seatRow = Math.floor(deskIdx / this.matrixCols) + 1;
        s.seatCol = (deskIdx % this.matrixCols) + 1;
        const subSlot = slotIdx % capacityPerDesk;
        const seatLetter = String.fromCharCode(65 + subSlot);

        if (this.deskType === 'SINGLE' || capacityPerDesk === 1) {
          s.seatPosText = `Dãy ${s.seatCol} - Bàn ${s.seatRow}`;
        } else {
          s.seatPosText = `Dãy ${s.seatCol} - Bàn ${s.seatRow} - Ghế ${seatLetter}`;
        }
        s.seatLetter = seatLetter;
      } else {
        s.seatRow = null;
        s.seatCol = null;
        s.seatPosText = null;
        s.seatLetter = null;
      }
    });

    tbody.innerHTML = displayRoster.map(s => {
      let seatBadge = `<span style="color: var(--text-muted); font-size: 10px;">(Chưa xếp bàn)</span>`;
      if (s.seatPosText) {
        seatBadge = `<span style="background: rgba(139, 92, 246, 0.15); color: #c084fc; border: 1px solid rgba(139, 92, 246, 0.4); padding: 1px 6px; border-radius: 6px; font-weight: 700; font-size: 10px; white-space: nowrap;">📍 ${s.seatPosText}</span>`;
      }

      return `
        <tr class="roster-row" data-id="${s.id}" draggable="true" style="border-bottom: 1px solid rgba(255,255,255,0.06); cursor: grab;">
          <td style="font-weight: 700; color: var(--text-muted); text-align: center;">${s.stt}</td>
          <td>
            <div style="font-weight: 700; color: white; font-size: 13px;">${s.name}</div>
            <div style="display: flex; align-items: center; gap: 6px; margin-top: 3px; flex-wrap: wrap;">
              ${seatBadge}
              ${s.role ? `<span style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid #f59e0b; padding: 1px 6px; border-radius: 10px; font-size: 10px; font-weight: 700;">${s.role}</span>` : ''}
              ${s.note ? `<span style="background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid #10b981; padding: 1px 6px; border-radius: 10px; font-size: 10px; font-weight: 700;">${s.note}</span>` : ''}
            </div>
          </td>
          <td style="font-family: monospace; font-size: 12px; color: var(--text-muted);">${s.studentCode}</td>
          <td style="font-size: 12px; font-weight: 700; color: ${s.gender === 'Nam' ? '#60a5fa' : '#f472b6'};">${s.gender}</td>
          <td>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span class="star-badge-gold" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid #f59e0b; padding: 3px 10px; border-radius: 12px; font-weight: 800; font-size: 13px;">
                ⭐ ${s.stars}
              </span>
            </div>
          </td>
          <td style="text-align: center;">
            <button class="btn-view-profile btn-secondary btn-sm" data-id="${s.id}" style="padding: 4px 10px; font-size: 11px; font-weight: 700; color: #c084fc; border-color: var(--accent-purple);">👁️ Hồ sơ 360</button>
          </td>
        </tr>
      `;
    }).join('');

    this.bindRowActions();
  }

  openAssignStudentModal(slotIndex) {
    let modal = document.getElementById('assign-student-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'assign-student-modal';
      modal.className = 'modal-overlay';
      modal.style.cssText = 'display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); z-index: 10000; justify-content: center; align-items: center;';
      modal.innerHTML = `
        <div class="glass-card accent-purple modal-box" style="max-width: 480px; width: 92%; padding: 24px; border: 1.5px solid var(--accent-purple); border-radius: 16px; box-shadow: 0 20px 50px rgba(0,0,0,0.9); background: #0f172a;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.1);">
            <h3 style="margin: 0; color: #c084fc; font-size: 16px; font-weight: 800; display: flex; align-items: center; gap: 8px;">
              🪑 PHÂN CÔNG HỌC SINH VÀO GHẾ BÀN
            </h3>
            <button class="btn-secondary btn-sm" id="btn-close-assign-modal">✖</button>
          </div>
          <div id="assign-slot-info" style="font-size: 13px; color: #60a5fa; font-weight: 700; margin-bottom: 12px;"></div>
          <div style="max-height: 320px; overflow-y: auto; padding-right: 4px;" id="assign-student-list"></div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.querySelector('#btn-close-assign-modal').addEventListener('click', () => {
        modal.style.display = 'none';
      });
    }

    const capacityPerDesk = (this.deskType === 'DOUBLE' ? 2 : 1);
    const deskIdx = Math.floor(slotIndex / capacityPerDesk);
    const row = Math.floor(deskIdx / this.matrixCols) + 1;
    const col = (deskIdx % this.matrixCols) + 1;

    const subSlot = slotIndex % capacityPerDesk;
    const seatLetter = String.fromCharCode(65 + subSlot);

    modal.querySelector('#assign-slot-info').textContent = capacityPerDesk > 1 
      ? `📍 Đang phân công cho: Dãy ${col} — Bàn ${row} — Ghế ${seatLetter}`
      : `📍 Đang phân công cho: Dãy ${col} — Bàn ${row}`;

    const assignedIds = new Set((this.seatingGrid || []).filter(Boolean).map(s => s.id));
    const unassigned = this.students.filter(s => !assignedIds.has(s.id));
    const assigned = this.students.filter(s => assignedIds.has(s.id));

    const listContainer = modal.querySelector('#assign-student-list');
    let html = '';

    if (unassigned.length > 0) {
      html += `<div style="font-size: 11px; font-weight: 800; color: #34d399; margin-bottom: 8px;">🟢 HỌC SINH CHƯA CÓ CHỖ NGỒI (${unassigned.length}):</div>`;
      html += unassigned.map(s => `
        <div class="assign-student-item glass-card" data-id="${s.id}" style="padding: 10px 14px; margin-bottom: 8px; border-radius: 8px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
          <div>
            <strong style="color: white; font-size: 13px;">${s.stt}. ${s.name}</strong>
            <span style="font-size: 11px; color: var(--text-muted); margin-left: 8px;">${s.studentCode}</span>
          </div>
          <button class="btn-primary-glow btn-sm" style="padding: 3px 10px; font-size: 11px; font-weight: 800;">➕ Xếp Vào Ghế</button>
        </div>
      `).join('');
    }

    if (assigned.length > 0) {
      html += `<div style="font-size: 11px; font-weight: 800; color: #fbbf24; margin: 14px 0 8px 0;">🟡 HỌC SINH ĐÃ XẾP BÀN KHÁC (${assigned.length}):</div>`;
      html += assigned.map(s => `
        <div class="assign-student-item glass-card" data-id="${s.id}" style="padding: 8px 12px; margin-bottom: 6px; border-radius: 8px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
          <div>
            <span style="color: white; font-size: 12px; font-weight: 700;">${s.stt}. ${s.name}</span>
            <span style="font-size: 10px; color: #c084fc; margin-left: 6px;">📍 ${s.seatPosText || 'Đã xếp'}</span>
          </div>
          <button class="btn-secondary btn-sm" style="padding: 2px 8px; font-size: 10px; font-weight: 700;">🔄 Chuyển Sang Đây</button>
        </div>
      `).join('');
    }

    listContainer.innerHTML = html;

    listContainer.querySelectorAll('.assign-student-item').forEach(item => {
      item.addEventListener('click', async () => {
        const studentId = item.getAttribute('data-id');
        const targetStudent = this.students.find(s => s.id === studentId);
        if (targetStudent) {
          if (!this.seatingGrid) {
            const totalSlots = this.matrixCols * this.matrixRows * (this.deskType === 'DOUBLE' ? 2 : 1);
            this.seatingGrid = Array(totalSlots).fill(null);
          }
          const oldIdx = this.seatingGrid.findIndex(st => st && st.id === studentId);
          if (oldIdx >= 0) this.seatingGrid[oldIdx] = null;
          this.seatingGrid[slotIndex] = targetStudent;

          modal.style.display = 'none';
          audioSynthesizer.playChime();
          this.renderSeatingChartMatrix();
          this.renderRosterTable();
          await this.saveCurrentSemesterSeating();
          this.showToast(`Đã xếp em ${targetStudent.name} vào Dãy ${col} — Bàn ${row} thành công!`, 'success');
        }
      });
    });

    modal.style.display = 'flex';
  }

  bindRowActions() {
    const tbody = document.getElementById('roster-table-body');
    if (!tbody) return;

    tbody.querySelectorAll('.btn-view-profile').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const s = this.students.find(item => item.id === id);
        if (s) {
          this.openStudentProfileDrawer(s);
        }
      });
    });
  }

  openStudentProfileDrawer(s) {
    const drawer = document.getElementById('student-profile-drawer');
    if (!drawer) return;

    document.getElementById('drawer-student-name').textContent = s.name;
    document.getElementById('drawer-student-code').textContent = `Mã HS: ${s.studentCode} • Lớp ${this.currentClass}`;
    document.getElementById('drawer-total-stars').textContent = `⭐ ${s.stars} Sao`;
    document.getElementById('drawer-seat-pos').textContent = s.seatRow && s.seatCol ? `Dãy ${s.seatCol} — Bàn ${s.seatRow}` : '(Chưa xếp bàn)';
    document.getElementById('drawer-parent-phone').textContent = s.parentPhone || '0912.345.678';
    document.getElementById('drawer-gender').textContent = s.gender || 'Nam';
    
    // Bind Role Selector Dropdown in 360 Profile Drawer
    const roleSelect = document.getElementById('drawer-select-role');
    if (roleSelect) {
      roleSelect.value = s.role || '';
      roleSelect.onchange = async (e) => {
        let val = e.target.value;
        if (val === 'ADD_CUSTOM_ROLE') {
          const customTitle = prompt('Nhập Tên Chức Vụ Mới cho học sinh (ví dụ: Đội Trưởng Văn Nghệ, Thủ Quỹ...):');
          if (customTitle && customTitle.trim()) {
            val = `🎖️ ${customTitle.trim()}`;
            const opt = document.createElement('option');
            opt.value = val;
            opt.textContent = val;
            opt.selected = true;
            roleSelect.insertBefore(opt, roleSelect.lastElementChild);
          } else {
            roleSelect.value = s.role || '';
            return;
          }
        }
        s.role = val;
        this.renderRosterTable();
        this.renderSeatingChartMatrix();
        await localFirstAdapter.put(STORAGE_STORES.STUDENTS, s);
        await this.saveCurrentSemesterSeating();
        audioSynthesizer.playChime();
      };
    }

    const avatarBox = document.getElementById('drawer-avatar-box');
    if (avatarBox) {
      avatarBox.textContent = s.name.split(' ').pop()?.charAt(0) || 'H';
      avatarBox.style.color = s.gender === 'Nam' ? '#60a5fa' : '#f472b6';
      avatarBox.style.background = s.gender === 'Nam' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(236, 72, 153, 0.25)';
    }

    const aiFeedback = [
      `Em ${s.name} phát biểu tự tin, diễn đạt trôi chảy trong tiết học. Hăng hái đóng góp ý kiến xây dựng bài.`,
      `Em ${s.name} hoàn thiện tốt các hoạt động thảo luận nhóm. Cần chú ý giơ tay phát biểu nhiều hơn.`,
      `Em ${s.name} có tinh thần đồng đội cao, luôn sẵn sàng giúp đỡ các bạn xung quanh hoàn thành bài tập.`
    ];
    document.getElementById('drawer-ai-feedback').textContent = `"${aiFeedback[s.stt % 3]}"`;

    drawer.style.display = 'flex';
    audioSynthesizer.playChime();

    drawer.onclick = (e) => {
      if (e.target === drawer) drawer.style.display = 'none';
    };

    const closeBtn = document.getElementById('btn-close-profile-drawer');
    if (closeBtn) closeBtn.onclick = () => { drawer.style.display = 'none'; };

    const awardBtn = document.getElementById('drawer-award-star-btn');
    if (awardBtn) {
      awardBtn.onclick = async () => {
        s.stars += 1;
        document.getElementById('drawer-total-stars').textContent = `⭐ ${s.stars} Sao`;
        this.renderRosterTable();
        this.renderSeatingChartMatrix();
        await localFirstAdapter.put(STORAGE_STORES.STUDENTS, s);
        audioSynthesizer.playChime();
        ipcDispatcher.send('AWARD_STAR', { studentId: s.id, studentName: s.name, stars: 1, reason: 'Khen thưởng Hồ sơ 360' });
      };
    }

    const fullPageBtn = document.getElementById('btn-open-full-profile-page');
    if (fullPageBtn) {
      fullPageBtn.onclick = () => {
        drawer.style.display = 'none';
        localStorage.setItem('active_student_profile_id', s.id);
        window.location.hash = `#/student-profile?id=${s.id}`;
        router.navigateTo('student-profile');
      };
    }
  }

  /**
   * TASK-SP5-03: Render Interactive Drag & Drop Seating Matrix supporting Desk Types (Single, Double, Pod 4, Pod 6)
   */
  renderSeatingChartMatrix() {
    const grid = document.getElementById('seating-matrix-grid');
    if (!grid) return;

    // Update Total Student Count Badge
    const countBadge = document.getElementById('total-student-count-badge');
    if (countBadge) {
      countBadge.textContent = `📊 Sĩ số: ${this.students.length} / ${this.students.length} Học Sinh (Lớp ${this.currentClass})`;
    }

    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = `repeat(${this.matrixCols}, 1fr)`;
    grid.style.gap = '12px';

    const totalDesks = this.matrixCols * this.matrixRows;
    const capacityPerDesk = this.deskType === 'DOUBLE' ? 2 
      : (this.deskType === 'POD4' ? 4 
      : (this.deskType === 'POD6' ? 6 
      : (this.deskType.startsWith('CAPACITY_') ? parseInt(this.deskType.replace('CAPACITY_', ''), 10) : 1)));

    const totalSlots = totalDesks * capacityPerDesk;

    // Initialize Fixed Slot Seating Grid Array
    if (!this.seatingGrid || this.seatingGrid.length !== totalSlots) {
      this.seatingGrid = Array(totalSlots).fill(null);
      for (let sIdx = 0; sIdx < Math.min(this.students.length, totalSlots); sIdx++) {
        this.seatingGrid[sIdx] = this.students[sIdx];
      }
    }

    const deskCells = [];

    // Render Column Outer Header Bar (Dãy 1, Dãy 2, Dãy 3, Dãy 4...)
    for (let c = 1; c <= this.matrixCols; c++) {
      deskCells.push(`
        <div style="grid-column: ${c}; text-align: center; font-weight: 800; color: #c084fc; font-size: 12px; background: rgba(139, 92, 246, 0.15); border: 1px solid var(--accent-purple); padding: 4px; border-radius: 6px; margin-bottom: 4px;">
          📌 DÃY ${c}
        </div>
      `);
    }

    for (let i = 0; i < totalDesks; i++) {
      const row = Math.floor(i / this.matrixCols) + 1;
      const col = (i % this.matrixCols) + 1;

      const seatItems = [];
      for (let sub = 0; sub < capacityPerDesk; sub++) {
        const slotIndex = i * capacityPerDesk + sub;
        const student = this.seatingGrid[slotIndex];

        const seatLetter = String.fromCharCode(65 + sub);

        if (student) {
          seatItems.push(`
            <div class="draggable-student glass-card" draggable="true" data-slot="${slotIndex}" data-id="${student.id}" style="position: relative; padding: 6px 4px; border-radius: 6px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); cursor: grab; user-select: none;">
              ${capacityPerDesk > 1 ? `<span style="position: absolute; top: 2px; right: 3px; font-size: 8px; font-weight: 800; color: #60a5fa; background: rgba(59, 130, 246, 0.2); border: 1px solid rgba(59, 130, 246, 0.4); padding: 0 3px; border-radius: 3px;">${seatLetter}</span>` : ''}
              <div class="avatar-circle" style="width: 28px; height: 28px; border-radius: 50%; margin: 0 auto 3px auto; background: ${student.gender === 'Nam' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(236, 72, 153, 0.25)'}; color: ${student.gender === 'Nam' ? '#60a5fa' : '#f472b6'}; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 11px; border: 1.5px solid currentColor;">
                ${student.name.split(' ').pop()?.charAt(0) || 'H'}
              </div>
              ${student.role ? `
                <span style="background: rgba(245, 158, 11, 0.25); color: #fbbf24; border: 1px solid #f59e0b; padding: 1px 4px; border-radius: 6px; font-size: 9px; font-weight: 800; display: block; margin: 2px auto; max-width: 95%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  ${student.role}
                </span>
              ` : ''}
              ${this.isFullSeating ? `
                <span style="font-size: 11px; font-weight: 700; color: white; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; max-width: 100%; line-height: 1.25; min-height: 28px; text-align: center;">
                  ${student.name}
                </span>
              ` : `
                <span style="font-size: 11px; font-weight: 700; color: white; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;">
                  ${student.name.split(' ').pop()}
                </span>
              `}
              <span style="font-size: 10px; color: #fbbf24; font-weight: 800; display: block;">
                ⭐ ${student.stars}
              </span>
            </div>
          `);
        } else {
          seatItems.push(`
            <div class="empty-seat-slot glass-card" data-slot="${slotIndex}" style="position: relative; padding: 14px 0; color: var(--text-muted); font-size: 9px; border: 1px dashed rgba(255,255,255,0.25); border-radius: 6px; user-select: none; cursor: pointer; text-align: center;">
              ${capacityPerDesk > 1 ? `<span style="position: absolute; top: 2px; right: 3px; font-size: 8px; font-weight: 800; color: #60a5fa; background: rgba(59, 130, 246, 0.2); border: 1px solid rgba(59, 130, 246, 0.4); padding: 0 3px; border-radius: 3px;">${seatLetter}</span>` : ''}
              (Trống)
            </div>
          `);
        }
      }

      deskCells.push(`
        <div class="desk-card glass-card" data-row="${row}" data-col="${col}" style="padding: 8px; border-radius: 8px; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(139, 92, 246, 0.3); text-align: center; position: relative;">
          <div style="font-size: 9px; color: var(--text-muted); font-weight: 700; margin-bottom: 4px; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 2px;">
            Bàn ${row}
          </div>

          <div style="display: grid; grid-template-columns: ${capacityPerDesk > 1 ? 'repeat(' + Math.min(capacityPerDesk, 2) + ', 1fr)' : '1fr'}; gap: 6px;">
            ${seatItems.join('')}
          </div>
        </div>
      `);
    }

    grid.innerHTML = deskCells.join('');
    this.enableDragAndDropSeating();
  }

  enableDragAndDropSeating() {
    const grid = document.getElementById('seating-matrix-grid');
    if (!grid) return;

    let srcSlotIdx = null;

    // Enable dragging from Roster Table Rows
    document.querySelectorAll('.roster-row[draggable="true"]').forEach(row => {
      row.addEventListener('dragstart', (e) => {
        const studentId = row.getAttribute('data-id');
        this.draggedStudentId = studentId;
        e.dataTransfer.setData('text/student-id', studentId);
        row.style.opacity = '0.5';
      });

      row.addEventListener('dragend', () => {
        row.style.opacity = '1';
      });
    });

    grid.querySelectorAll('.draggable-student').forEach(elem => {
      elem.addEventListener('dragstart', (e) => {
        srcSlotIdx = parseInt(elem.getAttribute('data-slot') || '0', 10);
        this.draggedStudentId = elem.getAttribute('data-id');
        elem.style.opacity = '0.4';
        e.dataTransfer.setData('text/plain', String(srcSlotIdx));
      });

      elem.addEventListener('dragend', () => {
        elem.style.opacity = '1';
      });

      elem.addEventListener('dragover', (e) => {
        e.preventDefault();
        elem.style.borderColor = 'var(--accent-purple)';
      });

      elem.addEventListener('dragleave', () => {
        elem.style.borderColor = '';
      });

      elem.addEventListener('drop', async (e) => {
        e.preventDefault();
        elem.style.borderColor = '';

        const targetSlotIdx = parseInt(elem.getAttribute('data-slot') || '0', 10);
        const rosterStudentId = e.dataTransfer.getData('text/student-id') || this.draggedStudentId;

        if (rosterStudentId && srcSlotIdx === null) {
          const studentToAssign = this.students.find(s => s.id === rosterStudentId);
          if (studentToAssign) {
            if (!this.seatingGrid) {
              const totalSlots = this.matrixCols * this.matrixRows * (this.deskType === 'DOUBLE' ? 2 : 1);
              this.seatingGrid = Array(totalSlots).fill(null);
            }
            const oldIdx = this.seatingGrid.findIndex(s => s && s.id === studentToAssign.id);
            if (oldIdx >= 0) this.seatingGrid[oldIdx] = null;

            this.seatingGrid[targetSlotIdx] = studentToAssign;
            audioSynthesizer.playChime();
            this.renderSeatingChartMatrix();
            this.renderRosterTable();
            await this.saveCurrentSemesterSeating();
            this.showToast(`Đã xếp em ${studentToAssign.name} vào bàn thành công!`, 'success');
            return;
          }
        }

        if (srcSlotIdx !== null && srcSlotIdx !== targetSlotIdx) {
          // Swap student A and B between slots
          const temp = this.seatingGrid[srcSlotIdx];
          this.seatingGrid[srcSlotIdx] = this.seatingGrid[targetSlotIdx];
          this.seatingGrid[targetSlotIdx] = temp;

          audioSynthesizer.playChime();
          this.renderSeatingChartMatrix();
          this.renderRosterTable();

          if (this.seatingGrid[srcSlotIdx]) await localFirstAdapter.put(STORAGE_STORES.STUDENTS, this.seatingGrid[srcSlotIdx]);
          if (this.seatingGrid[targetSlotIdx]) await localFirstAdapter.put(STORAGE_STORES.STUDENTS, this.seatingGrid[targetSlotIdx]);
          await this.saveCurrentSemesterSeating();
        }
      });
    });

    // Drop handler & Click-to-Assign for Empty Seat Slots
    grid.querySelectorAll('.empty-seat-slot').forEach(elem => {
      elem.addEventListener('click', () => {
        const slotIdx = parseInt(elem.getAttribute('data-slot') || '0', 10);
        this.openAssignStudentModal(slotIdx);
      });

      elem.addEventListener('dragover', (e) => {
        e.preventDefault();
        elem.style.borderColor = '#10b981';
        elem.style.background = 'rgba(16, 185, 129, 0.25)';
      });

      elem.addEventListener('dragleave', () => {
        elem.style.borderColor = 'rgba(255,255,255,0.2)';
        elem.style.background = '';
      });

      elem.addEventListener('drop', async (e) => {
        e.preventDefault();
        elem.style.borderColor = 'rgba(255,255,255,0.2)';
        elem.style.background = '';

        const targetSlotIdx = parseInt(elem.getAttribute('data-slot') || '0', 10);
        const rosterStudentId = e.dataTransfer.getData('text/student-id') || this.draggedStudentId;

        if (rosterStudentId && srcSlotIdx === null) {
          const studentToAssign = this.students.find(s => s.id === rosterStudentId);
          if (studentToAssign) {
            if (!this.seatingGrid) {
              const totalSlots = this.matrixCols * this.matrixRows * (this.deskType === 'DOUBLE' ? 2 : 1);
              this.seatingGrid = Array(totalSlots).fill(null);
            }
            const oldIdx = this.seatingGrid.findIndex(s => s && s.id === studentToAssign.id);
            if (oldIdx >= 0) this.seatingGrid[oldIdx] = null;

            this.seatingGrid[targetSlotIdx] = studentToAssign;
            audioSynthesizer.playChime();
            this.renderSeatingChartMatrix();
            this.renderRosterTable();
            await this.saveCurrentSemesterSeating();
            this.showToast(`Đã xếp em ${studentToAssign.name} vào bàn thành công!`, 'success');
            return;
          }
        }

        if (srcSlotIdx !== null && srcSlotIdx !== targetSlotIdx) {
          // Move student from srcSlotIdx to targetSlotIdx empty slot
          const movedStudent = this.seatingGrid[srcSlotIdx];
          this.seatingGrid[targetSlotIdx] = movedStudent;
          this.seatingGrid[srcSlotIdx] = null;

          audioSynthesizer.playChime();
          this.renderSeatingChartMatrix();
          this.renderRosterTable();

          if (movedStudent) await localFirstAdapter.put(STORAGE_STORES.STUDENTS, movedStudent);
          await this.saveCurrentSemesterSeating();
        }
      });
    });
  }

  async applyPresetTemplate(presetKey) {
    this.seatingGrid = null;
    if (!this.customPresets) this.customPresets = {};

    const defaultPresets = {
      'PRESET_4X8': { cols: 4, rows: 6, type: 'DOUBLE' },
      'PRESET_2X6': { cols: 2, rows: 6, type: 'DOUBLE' },
      'PRESET_3X7': { cols: 3, rows: 7, type: 'DOUBLE' },
      'PRESET_PODS': { cols: 3, rows: 2, type: 'POD6' }
    };

    const config = this.customPresets[presetKey] || defaultPresets[presetKey] || defaultPresets['PRESET_4X8'];
    this.matrixCols = config.cols;
    this.matrixRows = config.rows;
    this.deskType = config.type;

    this.renderSeatingChartMatrix();
    audioSynthesizer.playChime();
    await this.saveCurrentSemesterSeating();
  }

  getSeatingStorageKey(semester = this.currentSemester, classId = this.currentClass, subject = this.currentSubject) {
    return `SEATING_CONFIG_${semester}_CLASS_${classId}_SUBJ_${subject}`;
  }

  async saveCurrentSemesterSeating() {
    const key = this.getSeatingStorageKey();
    const configData = {
      matrixCols: this.matrixCols,
      matrixRows: this.matrixRows,
      deskType: this.deskType,
      seatingGrid: this.seatingGrid,
      isSaved: true
    };
    try {
      if (STORAGE_STORES.SETTINGS) {
        await localFirstAdapter.put(STORAGE_STORES.SETTINGS, { id: key, value: configData });
      }
    } catch (e) {}
    try {
      localStorage.setItem(key, JSON.stringify(configData));
    } catch (e) {}
  }

  async getSavedSubjectsForCurrentClass() {
    const subjectsMap = {
      'CHUNG': '📚 Môn Học Chính (Mặc định)',
      'TIENG_ANH': '🇬🇧 Môn Tiếng Anh (Phòng Lab)',
      'TIN_HOC': '💻 Môn Tin Học (Phòng Máy)',
      'VAT_LY': '⚡ Môn Vật Lý (Phòng Thí Nghiệm)',
      'HOA_HOC': '🧪 Môn Hóa Học (Phòng Thí Nghiệm)',
      'SINH_HOC': '🧬 Môn Sinh Học (Phòng Thực Hành)',
      'TOAN': '📐 Môn Toán Học',
      'VAN': '📖 Môn Ngữ Văn',
      'SU_DIA': '🌍 Môn Lịch Sử & Địa Lý',
      'AM_NHAC': '🎨 Môn Âm Nhạc / Mỹ Thuật'
    };

    const saved = [];

    for (const [key, name] of Object.entries(subjectsMap)) {
      if (key === this.currentSubject) continue;
      const sKey = this.getSeatingStorageKey(this.currentSemester, this.currentClass, key);
      let cfg = null;
      try {
        const rec = await localFirstAdapter.get(STORAGE_STORES.SETTINGS, sKey);
        if (rec && rec.value) cfg = rec.value;
      } catch (e) {}
      if (!cfg) {
        try {
          const raw = localStorage.getItem(sKey);
          if (raw) cfg = JSON.parse(raw);
        } catch (e) {}
      }

      if (cfg && cfg.isSaved) {
        saved.push({ key, name });
      }
    }

    if (!saved.some(s => s.key === 'CHUNG') && this.currentSubject !== 'CHUNG') {
      saved.unshift({ key: 'CHUNG', name: '📚 Môn Học Chính (Mặc định)' });
    }

    return saved;
  }

  async loadCurrentSemesterSeating() {
    const key = this.getSeatingStorageKey();
    const banner = document.getElementById('copy-semester-banner');
    const overlay = document.getElementById('seating-preview-overlay');

    let cfg = null;
    try {
      const record = await localFirstAdapter.get(STORAGE_STORES.SETTINGS, key);
      if (record && record.value) cfg = record.value;
    } catch (e) {}

    if (!cfg) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) cfg = JSON.parse(raw);
      } catch (e) {}
    }

    const reCopyBtn = document.getElementById('btn-re-copy-subject');
    if (reCopyBtn) {
      reCopyBtn.style.display = this.currentSubject !== 'HOMEROOM' ? 'inline-flex' : 'none';
    }

    if (cfg && cfg.isSaved) {
      if (banner) banner.style.display = 'none';
      if (overlay) overlay.style.display = 'none';
      this.matrixCols = cfg.matrixCols || 4;
      this.matrixRows = cfg.matrixRows || 6;
      this.deskType = cfg.deskType || 'DOUBLE';
      this.seatingGrid = cfg.seatingGrid || null;
    } else {
      // Unsaved subject/semester -> Load preview grid from selected source & display overlay
      let promptMsg = '';
      let btnLabel = '';

      if (this.currentSubject !== 'HOMEROOM') {
        promptMsg = `Chưa có sơ đồ chỗ ngồi riêng cho bộ môn này của Lớp ${this.currentClass}.`;
        btnLabel = '📋 Sao Chép Làm Sơ Đồ Chính';

        const savedSubjects = await this.getSavedSubjectsForCurrentClass();
        const sourceSelect = document.getElementById('overlay-source-subject-select');
        if (sourceSelect) {
          sourceSelect.innerHTML = savedSubjects.map(s => `
            <option value="${s.key}">${s.name}</option>
          `).join('');

          sourceSelect.onchange = async (e) => {
            const srcKey = e.target.value;
            const sourceStorageKey = this.getSeatingStorageKey(this.currentSemester, this.currentClass, srcKey);
            let srcCfg = null;
            try {
              const rec = await localFirstAdapter.get(STORAGE_STORES.SETTINGS, sourceStorageKey);
              if (rec && rec.value) srcCfg = rec.value;
            } catch (err) {}
            if (!srcCfg) {
              try {
                const raw = localStorage.getItem(sourceStorageKey);
                if (raw) srcCfg = JSON.parse(raw);
              } catch (err) {}
            }
            if (srcCfg) {
              this.matrixCols = srcCfg.matrixCols || 4;
              this.matrixRows = srcCfg.matrixRows || 6;
              this.deskType = srcCfg.deskType || 'DOUBLE';
              this.seatingGrid = srcCfg.seatingGrid ? JSON.parse(JSON.stringify(srcCfg.seatingGrid)) : null;
            }
            this.syncSeatingGridWithCurrentStudents();
            this.renderSeatingChartMatrix();
            this.renderRosterTable();
          };
        }

        const selectedSourceKey = sourceSelect && sourceSelect.value ? sourceSelect.value : 'HOMEROOM';
        const chungKey = this.getSeatingStorageKey(this.currentSemester, this.currentClass, selectedSourceKey);
        let chungCfg = null;
        try {
          const rec = await localFirstAdapter.get(STORAGE_STORES.SETTINGS, chungKey);
          if (rec && rec.value) chungCfg = rec.value;
        } catch (e) {}
        if (!chungCfg) {
          try {
            const raw = localStorage.getItem(chungKey);
            if (raw) chungCfg = JSON.parse(raw);
          } catch (e) {}
        }
        if (chungCfg) {
          this.matrixCols = chungCfg.matrixCols || 4;
          this.matrixRows = chungCfg.matrixRows || 6;
          this.deskType = chungCfg.deskType || 'DOUBLE';
          this.seatingGrid = chungCfg.seatingGrid ? JSON.parse(JSON.stringify(chungCfg.seatingGrid)) : null;
        } else {
          this.seatingGrid = null;
        }

        if (overlay) {
          const clsName = document.getElementById('overlay-class-name');
          if (clsName) clsName.textContent = this.currentClass;
          overlay.style.display = 'flex';
        }
      } else if (this.currentSemester === '2026_HK2') {
        promptMsg = `Chưa phát sinh sơ đồ chỗ ngồi cho Học Kỳ II - Lớp ${this.currentClass}.`;
        btnLabel = '📋 Sao Chép Sơ Đồ Từ Học Kỳ I';
        this.seatingGrid = null;
        if (overlay) overlay.style.display = 'none';
      } else {
        if (banner) banner.style.display = 'none';
        if (overlay) overlay.style.display = 'none';
        return;
      }

      if (banner) {
        document.getElementById('banner-semester-name').textContent = promptMsg;
        const copyBtn = document.getElementById('btn-copy-from-hk1');
        if (copyBtn) copyBtn.textContent = btnLabel;
        banner.style.display = 'flex';
      }
    }
    this.syncSeatingGridWithCurrentStudents();
  }

  findSeatSlotForStudent(s) {
    if (!this.seatingGrid || !s) return -1;

    // 1. Strict ID match
    if (s.id) {
      const idx = this.seatingGrid.findIndex(st => st && st.id && String(st.id) === String(s.id));
      if (idx >= 0) return idx;
    }

    // 2. Strict Student Code match
    if (s.studentCode) {
      const idx = this.seatingGrid.findIndex(st => st && st.studentCode && String(st.studentCode) === String(s.studentCode));
      if (idx >= 0) return idx;
    }

    // 3. Normalized Full Name match
    if (s.name) {
      const idx = this.seatingGrid.findIndex(st => st && st.name && st.name.trim().toLowerCase() === s.name.trim().toLowerCase());
      if (idx >= 0) return idx;
    }

    return -1;
  }

  syncSeatingGridWithCurrentStudents() {
    if (!this.seatingGrid || !Array.isArray(this.seatingGrid) || !this.students || this.students.length === 0) return;

    this.seatingGrid = this.seatingGrid.map(st => {
      if (!st) return null;

      // 1. Strict ID Match
      if (st.id) {
        const byId = this.students.find(s => s.id && String(s.id) === String(st.id));
        if (byId) return byId;
      }

      // 2. Strict Student Code Match
      if (st.studentCode) {
        const byCode = this.students.find(s => s.studentCode && String(s.studentCode) === String(st.studentCode));
        if (byCode) return byCode;
      }

      // 3. Normalized Full Name Match
      if (st.name) {
        const byName = this.students.find(s => s.name && s.name.trim().toLowerCase() === st.name.trim().toLowerCase());
        if (byName) return byName;
      }

      return null;
    });
  }

  showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = 'position: fixed; bottom: 24px; right: 24px; z-index: 99999; display: flex; flex-direction: column; gap: 10px; pointer-events: none;';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'glass-card';
    toast.style.cssText = `
      pointer-events: auto;
      padding: 12px 20px;
      border-radius: 12px;
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid ${type === 'success' ? '#10b981' : type === 'info' ? '#f59e0b' : '#3b82f6'};
      box-shadow: 0 10px 30px rgba(0,0,0,0.85);
      color: white;
      font-size: 13px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 280px;
      max-width: 440px;
      transform: translateY(20px);
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    `;

    const icon = type === 'success' ? '✔' : type === 'info' ? '🧹' : '💾';
    toast.innerHTML = `<span style="font-size: 18px; color: ${type === 'success' ? '#34d399' : type === 'info' ? '#fbbf24' : '#60a5fa'};">${icon}</span> <span>${message}</span>`;

    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';
    });

    setTimeout(() => {
      toast.style.transform = 'translateY(-10px)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  async copySeatingFromPreviousSemester(sourceSubjectKey = null) {
    let prevKey = this.getSeatingStorageKey('2026_HK1');
    if (sourceSubjectKey) {
      prevKey = this.getSeatingStorageKey(this.currentSemester, this.currentClass, sourceSubjectKey);
    } else if (this.currentSubject !== 'HOMEROOM') {
      prevKey = this.getSeatingStorageKey(this.currentSemester, this.currentClass, 'HOMEROOM');
    }

    let prevCfg = null;
    try {
      const prevRecord = await localFirstAdapter.get(STORAGE_STORES.SETTINGS, prevKey);
      if (prevRecord && prevRecord.value) prevCfg = prevRecord.value;
    } catch (e) {}
    if (!prevCfg) {
      try {
        const raw = localStorage.getItem(prevKey);
        if (raw) prevCfg = JSON.parse(raw);
      } catch (e) {}
    }

    if (!prevCfg) {
      prevCfg = {
        matrixCols: 4,
        matrixRows: 6,
        deskType: 'DOUBLE',
        seatingGrid: this.students.slice(0, 48)
      };
    }

    if (prevCfg) {
      this.matrixCols = prevCfg.matrixCols || 4;
      this.matrixRows = prevCfg.matrixRows || 6;
      this.deskType = prevCfg.deskType || 'DOUBLE';
      this.seatingGrid = prevCfg.seatingGrid ? JSON.parse(JSON.stringify(prevCfg.seatingGrid)) : null;

      await this.saveCurrentSemesterSeating();

      const banner = document.getElementById('copy-semester-banner');
      if (banner) banner.style.display = 'none';

      const overlay = document.getElementById('seating-preview-overlay');
      if (overlay) overlay.style.display = 'none';

      this.renderSeatingChartMatrix();
      this.renderRosterTable();
      audioSynthesizer.playChime();
      this.showToast(`Đã sao chép toàn bộ vị trí chỗ ngồi Lớp ${this.currentClass} làm sơ đồ chính cho bộ môn thành công!`, 'success');
    }
  }

  async resetToFreshEmptySeating() {
    const totalSlots = this.matrixCols * this.matrixRows * (this.deskType === 'DOUBLE' ? 2 : 1);
    this.seatingGrid = Array(totalSlots).fill(null);
    await this.saveCurrentSemesterSeating();

    const banner = document.getElementById('copy-semester-banner');
    if (banner) banner.style.display = 'none';

    const overlay = document.getElementById('seating-preview-overlay');
    if (overlay) overlay.style.display = 'none';

    this.renderSeatingChartMatrix();
    this.renderRosterTable();
    audioSynthesizer.playChime();
    this.showToast(`Đã tạo sơ đồ bàn trống cho bộ môn thành công! Thầy cô có thể kéo thả học sinh tùy thích.`, 'info');
  }

  openConfirmModal(title, message, onConfirm) {
    let modal = document.getElementById('glass-confirm-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'glass-confirm-modal';
      modal.className = 'modal-overlay';
      modal.style.cssText = 'display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); z-index: 10000; justify-content: center; align-items: center;';
      modal.innerHTML = `
        <div class="glass-card accent-purple modal-box" style="max-width: 440px; width: 90%; padding: 24px; border: 1.5px solid var(--accent-purple); border-radius: 16px; box-shadow: 0 20px 50px rgba(0,0,0,0.9); background: #0f172a; text-align: center;">
          <div style="font-size: 36px; margin-bottom: 8px;">📋</div>
          <h3 id="confirm-modal-title" style="margin: 0 0 8px 0; color: #60a5fa; font-size: 16px; font-weight: 800;"></h3>
          <p id="confirm-modal-msg" style="margin: 0 0 20px 0; color: var(--text-muted); font-size: 13px; line-height: 1.5;"></p>
          <div style="display: flex; gap: 12px; justify-content: center;">
            <button class="btn-secondary btn-sm" id="btn-cancel-glass-confirm" style="padding: 8px 18px; font-weight: 700;">✖ Hủy Bỏ</button>
            <button class="btn-primary-glow btn-sm" id="btn-ok-glass-confirm" style="padding: 8px 20px; font-weight: 800;">✔ Đồng Ý Sao Chép</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.querySelector('#btn-cancel-glass-confirm').addEventListener('click', () => {
        modal.style.display = 'none';
      });
    }

    modal.querySelector('#confirm-modal-title').textContent = title;
    modal.querySelector('#confirm-modal-msg').textContent = message;

    const okBtn = modal.querySelector('#btn-ok-glass-confirm');
    okBtn.onclick = async () => {
      modal.style.display = 'none';
      if (onConfirm) await onConfirm();
    };

    modal.style.display = 'flex';
  }

  bindEvents() {
    if (this.eventsBound) return;
    this.eventsBound = true;

    // Subject Selector Switcher (Multi-subject Isolated Seating Chart)
    const subjectSelect = document.getElementById('select-seating-subject');
    if (subjectSelect) {
      subjectSelect.addEventListener('change', async (e) => {
        let val = e.target.value;
        if (val === 'ADD_CUSTOM_SUBJECT') {
          const customName = prompt('Nhập Tên Bộ Môn / Phòng Học Mới (Ví dụ: Phòng Thí Nghiệm Hóa 2, Phòng Đa Năng...):');
          if (customName && customName.trim()) {
            val = `CUSTOM_${Date.now()}`;
            const displayName = `📖 Môn ${customName.trim()}`;
            const opt = document.createElement('option');
            opt.value = val;
            opt.textContent = displayName;
            opt.selected = true;
            subjectSelect.insertBefore(opt, subjectSelect.lastElementChild);
            await this.saveCustomSubject(val, displayName);
          } else {
            subjectSelect.value = this.currentSubject;
            return;
          }
        }
        this.currentSubject = val;
        audioSynthesizer.playChime();
        await this.loadCurrentSemesterSeating();
        this.renderRosterTable();
        this.renderSeatingChartMatrix();
      });
    }

    // Academic Semester Selector Switcher
    document.getElementById('select-academic-semester')?.addEventListener('change', async (e) => {
      await this.saveCurrentSemesterSeating();
      this.currentSemester = e.target.value;
      audioSynthesizer.playChime();
      await this.loadStudents();
      await this.loadCurrentSemesterSeating();
      this.renderRosterTable();
      this.renderSeatingChartMatrix();
    });

    // Copy Seating Chart from HK1 Action
    const copyHk1Btn = document.getElementById('btn-copy-from-hk1');
    if (copyHk1Btn) {
      copyHk1Btn.onclick = async () => {
        await this.copySeatingFromPreviousSemester();
      };
    }

    // Reset Fresh Seating Chart Action for New Subject
    const resetFreshBtn = document.getElementById('btn-reset-fresh-seating');
    if (resetFreshBtn) {
      resetFreshBtn.onclick = async () => {
        await this.resetToFreshEmptySeating();
      };
    }

    // Overlay Action Buttons
    const cancelSubjectSwitch = async () => {
      const subjSel = document.getElementById('select-seating-subject');
      if (subjSel) subjSel.value = 'HOMEROOM';
      this.currentSubject = 'HOMEROOM';
      audioSynthesizer.playChime();
      await this.loadCurrentSemesterSeating();
      this.renderRosterTable();
      this.renderSeatingChartMatrix();
    };

    const overlayCancelBtn = document.getElementById('overlay-btn-cancel');
    if (overlayCancelBtn) overlayCancelBtn.onclick = cancelSubjectSwitch;

    const overlayCancelTopBtn = document.getElementById('overlay-btn-cancel-top');
    if (overlayCancelTopBtn) overlayCancelTopBtn.onclick = cancelSubjectSwitch;

    const overlayCopyBtn = document.getElementById('overlay-btn-copy');
    if (overlayCopyBtn) {
      overlayCopyBtn.onclick = async () => {
        await this.copySeatingFromPreviousSemester();
      };
    }

    const overlayFreshBtn = document.getElementById('overlay-btn-fresh');
    if (overlayFreshBtn) {
      overlayFreshBtn.onclick = async () => {
        await this.resetToFreshEmptySeating();
      };
    }

    // Re-copy Subject Seating Chart Action from Toolbar
    const reCopyBtn = document.getElementById('btn-re-copy-subject');
    if (reCopyBtn) {
      reCopyBtn.onclick = () => {
        this.openConfirmModal(
          'SAO CHÉP SƠ ĐỒ CHỖ NGỒI MÔN HỌC',
          'Bạn có muốn sao chép toàn bộ vị trí chỗ ngồi từ Môn Học Chung / Chủ Nhiệm đè lên sơ đồ bộ môn này không?',
          async () => {
            await this.copySeatingFromPreviousSemester();
          }
        );
      };
    }

    const presetSelect = document.getElementById('select-seating-preset');
    if (presetSelect) {
      presetSelect.addEventListener('change', async (e) => {
        await this.applyPresetTemplate(e.target.value);
      });
    }

    document.getElementById('select-desk-type')?.addEventListener('change', (e) => {
      if (e.target.value === 'ADD_CUSTOM_TYPE') {
        this.openCustomDeskTypeModal('select-desk-type');
      }
    });

    document.getElementById('preset-type-input')?.addEventListener('change', (e) => {
      if (e.target.value === 'ADD_CUSTOM_TYPE') {
        this.openCustomDeskTypeModal('preset-type-input');
      }
    });

    document.getElementById('save-seating-chart-btn')?.addEventListener('click', async () => {
      await this.saveCurrentSemesterSeating();
      audioSynthesizer.playChime();
      this.showToast(`Đã lưu ma trận sơ đồ chỗ ngồi Lớp ${this.currentClass} vào CSDL Offline thành công!`, 'success');
    });

    document.querySelectorAll('.class-tab').forEach(tab => {
      tab.addEventListener('click', async () => {
        await this.saveCurrentSemesterSeating();
        document.querySelectorAll('.class-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentClass = tab.getAttribute('data-class') || '10A2';
        this.currentSubject = 'CHUNG';
        await this.renderSubjectSelectForGrade();
        audioSynthesizer.playChime();
        await this.loadStudents();
        await this.loadCurrentSemesterSeating();
        this.renderRosterTable();
        this.renderSeatingChartMatrix();
      });
    });

    // Add Custom Seating Preset Action
    document.getElementById('btn-add-custom-preset')?.addEventListener('click', () => {
      this.openCustomPresetModal();
    });

    const importBtn = document.getElementById('import-student-excel-btn');
    if (importBtn) {
      importBtn.addEventListener('click', () => {
        this.triggerExcelImport();
      });
    }

    this.bindSplitViewEvents();
  }

  /**
   * Bind Interactive Collapsible Split Panel Workspace Controls
   */
  bindSplitViewEvents() {
    const wrapper = document.getElementById('roster-split-wrapper');
    const panelSeating = document.getElementById('panel-seating-box');
    const panelRoster = document.getElementById('panel-roster-box');
    const resetBtns = document.querySelectorAll('.btn-reset-split');

    if (!wrapper || !panelSeating || !panelRoster) return;

    const setResetBtnsDisplay = (disp) => {
      resetBtns.forEach(btn => { btn.style.display = disp; });
    };

    const showFullSeating = () => {
      this.isFullSeating = true;
      wrapper.style.gridTemplateColumns = '1fr';
      panelRoster.style.display = 'none';
      panelSeating.style.display = 'block';
      setResetBtnsDisplay('inline-block');
      this.renderSeatingChartMatrix();
      audioSynthesizer.playChime();
    };

    const showFullRoster = () => {
      this.isFullSeating = false;
      wrapper.style.gridTemplateColumns = '1fr';
      panelSeating.style.display = 'none';
      panelRoster.style.display = 'block';
      setResetBtnsDisplay('inline-block');
      audioSynthesizer.playChime();
    };

    const resetSplitView = () => {
      this.isFullSeating = false;
      wrapper.style.gridTemplateColumns = '1fr 1fr';
      panelSeating.style.display = 'block';
      panelRoster.style.display = 'block';
      setResetBtnsDisplay('none');
      this.renderSeatingChartMatrix();
      audioSynthesizer.playChime();
    };

    document.getElementById('btn-toggle-seating-full')?.addEventListener('click', showFullSeating);
    document.getElementById('btn-collapse-seating')?.addEventListener('click', showFullRoster);

    document.getElementById('btn-toggle-roster-full')?.addEventListener('click', showFullRoster);
    document.getElementById('btn-collapse-roster')?.addEventListener('click', showFullSeating);

    resetBtns.forEach(btn => {
      btn.addEventListener('click', resetSplitView);
    });
  }

  /**
   * Open Custom Seating Preset Modal
   */
  openCustomPresetModal() {
    const modal = document.getElementById('custom-preset-modal');
    if (!modal) return;

    modal.style.display = 'flex';
    audioSynthesizer.playChime();

    const closeModal = () => { modal.style.display = 'none'; };

    const cancelBtn = document.getElementById('btn-cancel-custom-preset');
    const closeBtn = document.getElementById('btn-close-custom-preset');
    const saveBtn = document.getElementById('btn-save-custom-preset');

    if (cancelBtn) cancelBtn.onclick = closeModal;
    if (closeBtn) closeBtn.onclick = closeModal;

    if (saveBtn) {
      saveBtn.onclick = async () => {
        const name = document.getElementById('preset-name-input')?.value || 'Mẫu Sơ Đồ Tùy Chỉnh';
        const cols = parseInt(document.getElementById('preset-cols-input')?.value || '3', 10);
        const rows = parseInt(document.getElementById('preset-rows-input')?.value || '5', 10);
        const type = document.getElementById('preset-type-input')?.value || 'DOUBLE';

        const customId = `PRESET_CUSTOM_${Date.now()}`;
        const presetSelect = document.getElementById('select-seating-preset');

        if (presetSelect) {
          const option = document.createElement('option');
          option.value = customId;
          option.textContent = `⚙️ Mẫu Riêng: ${name} (${cols} Dãy x ${rows} Bàn)`;
          option.selected = true;
          presetSelect.appendChild(option);
        }

        if (!this.customPresets) this.customPresets = {};
        this.customPresets[customId] = { cols, rows, type };

        this.seatingGrid = null;
        this.matrixCols = cols;
        this.matrixRows = rows;
        this.deskType = type;

        closeModal();
        this.renderSeatingChartMatrix();
        audioSynthesizer.playChime();
        alert(`✔ [ĐÃ THÊM MẪU SƠ ĐỒ MỚI]\nĐã lưu Mẫu "${name}" vào danh sách Mẫu Định Hình Sẵn của bạn!`);
      };
    }
  }

  /**
   * Open Glassmorphism Custom Desk Type Modal
   */
  openCustomDeskTypeModal(targetSelectId = 'select-desk-type') {
    const modal = document.getElementById('custom-desk-type-modal');
    if (!modal) return;

    modal.style.display = 'flex';
    audioSynthesizer.playChime();

    const closeModal = () => { modal.style.display = 'none'; };

    const cancelBtn = document.getElementById('btn-cancel-desk-type-modal');
    const closeBtn = document.getElementById('btn-close-desk-type-modal');
    const saveBtn = document.getElementById('btn-save-desk-type-modal');

    if (cancelBtn) cancelBtn.onclick = closeModal;
    if (closeBtn) closeBtn.onclick = closeModal;

    if (saveBtn) {
      saveBtn.onclick = async () => {
        const name = document.getElementById('desk-type-name-input')?.value || 'Bàn Tùy Chỉnh';
        const cap = Math.max(1, parseInt(document.getElementById('desk-type-capacity-input')?.value || '3', 10));
        const customVal = `CAPACITY_${cap}`;

        const selectElem = document.getElementById(targetSelectId);
        if (selectElem) {
          const opt = document.createElement('option');
          opt.value = customVal;
          opt.textContent = `🪑 ${name} (${cap} HS/Bàn)`;
          opt.selected = true;
          selectElem.insertBefore(opt, selectElem.lastElementChild);
        }

        if (targetSelectId !== 'select-desk-type') {
          const mainSelect = document.getElementById('select-desk-type');
          if (mainSelect) {
            const optMain = document.createElement('option');
            optMain.value = customVal;
            optMain.textContent = `🪑 ${name} (${cap} HS/Bàn)`;
            mainSelect.insertBefore(optMain, mainSelect.lastElementChild);
          }
        }

        this.deskType = customVal;
        closeModal();
        this.renderSeatingChartMatrix();
        audioSynthesizer.playChime();
        alert(`✔ [ĐÃ KÍCH HOẠT KIỂU BÀN MỚI]\nĐã tạo thành công Kiểu Bàn "${name}" (${cap} HS/Bàn)!`);
      };
    }
  }

  triggerExcelImport() {
    let fileInput = document.getElementById('student-excel-file-input');
    if (!fileInput) {
      fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.id = 'student-excel-file-input';
      fileInput.accept = '.xlsx,.xls,.csv,.txt';
      fileInput.style.display = 'none';
      document.body.appendChild(fileInput);
    }

    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        audioSynthesizer.playChime();
        const reader = new FileReader();
        reader.onload = async (evt) => {
          const content = evt.target.result;
          const parsedStudents = ExcelRosterParser.parse(content);

          this.students = parsedStudents;
          for (const s of parsedStudents) {
            await localFirstAdapter.put(STORAGE_STORES.STUDENTS, s);
          }

          this.renderRosterTable();
          this.renderSeatingChartMatrix();
          audioSynthesizer.playChime();
          alert(`✔ [IMPORT EXCEL THÀNH CÔNG] Đã nhập ${parsedStudents.length} Học Sinh Lớp ${this.currentClass}!`);
        };
        reader.readAsText(file);
      }
    };

    fileInput.click();
  }
}
