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
  }

  async onMount() {
    console.log('📋 [ClassRosterView] Mounted Desk Furniture Types & Seating Matrix (TASK-SP5-03)');
    await this.loadStudents();
    await this.loadCurrentSemesterSeating();
    this.renderRosterTable();
    this.renderSeatingChartMatrix();
    this.bindEvents();
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
      if (this.seatingGrid) {
        const slotIdx = this.seatingGrid.findIndex(st => st && st.id === s.id);
        if (slotIdx >= 0) {
          const deskIdx = Math.floor(slotIdx / capacityPerDesk);
          s.seatRow = Math.floor(deskIdx / this.matrixCols) + 1;
          s.seatCol = (deskIdx % this.matrixCols) + 1;
        } else {
          s.seatRow = null;
          s.seatCol = null;
        }
      }
    });

    tbody.innerHTML = displayRoster.map(s => {
      let seatBadge = `<span style="color: var(--text-muted); font-size: 10px;">(Chưa xếp bàn)</span>`;
      if (s.seatRow && s.seatCol) {
        seatBadge = `<span style="background: rgba(139, 92, 246, 0.15); color: #c084fc; border: 1px solid rgba(139, 92, 246, 0.4); padding: 1px 6px; border-radius: 6px; font-weight: 700; font-size: 10px; white-space: nowrap;">📍 Dãy ${s.seatCol} - Bàn ${s.seatRow}</span>`;
      }

      return `
        <tr class="roster-row" data-id="${s.id}" style="border-bottom: 1px solid rgba(255,255,255,0.06);">
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
    document.getElementById('drawer-seat-pos').textContent = `Dãy ${s.seatCol} — Bàn ${s.seatRow}`;
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

        if (student) {
          seatItems.push(`
            <div class="draggable-student glass-card" draggable="true" data-slot="${slotIndex}" data-id="${student.id}" style="padding: 6px 4px; border-radius: 6px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); cursor: grab; user-select: none;">
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
            <div class="empty-seat-slot glass-card" data-slot="${slotIndex}" style="padding: 14px 0; color: var(--text-muted); font-size: 9px; border: 1px dashed rgba(255,255,255,0.25); border-radius: 6px; user-select: none; cursor: pointer; text-align: center;">
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
        if (srcSlotIdx !== null && srcSlotIdx !== targetSlotIdx) {
          // Swap student A and B between slots
          const temp = this.seatingGrid[srcSlotIdx];
          this.seatingGrid[srcSlotIdx] = this.seatingGrid[targetSlotIdx];
          this.seatingGrid[targetSlotIdx] = temp;

          this.students = this.seatingGrid.filter(s => s !== null);
          audioSynthesizer.playChime();
          this.renderSeatingChartMatrix();
          this.renderRosterTable();

          if (this.seatingGrid[srcSlotIdx]) await localFirstAdapter.put(STORAGE_STORES.STUDENTS, this.seatingGrid[srcSlotIdx]);
          if (this.seatingGrid[targetSlotIdx]) await localFirstAdapter.put(STORAGE_STORES.STUDENTS, this.seatingGrid[targetSlotIdx]);
          await this.saveCurrentSemesterSeating();
        }
      });
    });

    // Drop handler for Empty Seat Slots
    grid.querySelectorAll('.empty-seat-slot').forEach(elem => {
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
        if (srcSlotIdx !== null && srcSlotIdx !== targetSlotIdx) {
          // Move student from srcSlotIdx to targetSlotIdx empty slot
          const movedStudent = this.seatingGrid[srcSlotIdx];
          this.seatingGrid[targetSlotIdx] = movedStudent;
          this.seatingGrid[srcSlotIdx] = null;

          this.students = this.seatingGrid.filter(s => s !== null);
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

  getSeatingStorageKey(semester = this.currentSemester, classId = this.currentClass) {
    return `SEATING_CONFIG_${semester}_CLASS_${classId}`;
  }

  async saveCurrentSemesterSeating() {
    const key = this.getSeatingStorageKey();
    const configData = {
      matrixCols: this.matrixCols,
      matrixRows: this.matrixRows,
      deskType: this.deskType,
      seatingGrid: this.seatingGrid
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

  async loadCurrentSemesterSeating() {
    const key = this.getSeatingStorageKey();
    const banner = document.getElementById('copy-semester-banner');

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

    if (cfg) {
      if (banner) banner.style.display = 'none';
      this.matrixCols = cfg.matrixCols || 4;
      this.matrixRows = cfg.matrixRows || 6;
      this.deskType = cfg.deskType || 'DOUBLE';
      this.seatingGrid = cfg.seatingGrid || null;
    } else {
      // Reset grid for empty semester
      this.seatingGrid = null;
      if (this.currentSemester === '2026_HK2') {
        let prevCfg = null;
        const prevKey = this.getSeatingStorageKey('2026_HK1');
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

        if (prevCfg && banner) {
          document.getElementById('banner-semester-name').textContent = 'Học Kỳ II';
          document.getElementById('banner-class-name').textContent = this.currentClass;
          banner.style.display = 'flex';
        } else if (banner) {
          banner.style.display = 'none';
        }
      } else if (banner) {
        banner.style.display = 'none';
      }
    }
  }

  async copySeatingFromPreviousSemester() {
    const prevKey = this.getSeatingStorageKey('2026_HK1');
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

    if (prevCfg) {
      this.matrixCols = prevCfg.matrixCols;
      this.matrixRows = prevCfg.matrixRows;
      this.deskType = prevCfg.deskType;
      this.seatingGrid = prevCfg.seatingGrid ? JSON.parse(JSON.stringify(prevCfg.seatingGrid)) : null;

      await this.saveCurrentSemesterSeating();
      document.getElementById('copy-semester-banner').style.display = 'none';
      this.renderSeatingChartMatrix();
      audioSynthesizer.playChime();
      alert(`✔ [ĐÃ SAO CHÉP SƠ ĐỒ CHỖ NGỒI]\nĐã sao chép toàn bộ vị trí chỗ ngồi Lớp ${this.currentClass} từ Học Kỳ I sang Học Kỳ II thành công!`);
    }
  }

  bindEvents() {
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
    document.getElementById('btn-copy-from-hk1')?.addEventListener('click', async () => {
      await this.copySeatingFromPreviousSemester();
    });

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
      alert(`💾 [ĐÃ LƯU SƠ ĐỒ BÀN HỌC - ${this.currentSemester === '2026_HK1' ? 'HỌC KỲ I' : 'HỌC KỲ II'}]\nĐã lưu ma trận sơ đồ chỗ ngồi độc lập cho Lớp ${this.currentClass} (${this.currentSemester === '2026_HK1' ? 'Học Kỳ I' : 'Học Kỳ II'}) vào CSDL Offline!`);
    });

    document.querySelectorAll('.class-tab').forEach(tab => {
      tab.addEventListener('click', async () => {
        await this.saveCurrentSemesterSeating();
        document.querySelectorAll('.class-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentClass = tab.getAttribute('data-class') || '10A2';
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
