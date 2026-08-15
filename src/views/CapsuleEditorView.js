/**
 * TeachDS Capsule & 5512 Lesson Plan Editor Controller
 * Senior Architecture Layer: View Layer
 * Task ID: TASK-SP4-01 & TASK-SP4-02 (Sprint 4 - 1 Lesson Plan for Multi-Classes Architecture)
 */

import { BaseView } from './BaseView.js';
import { localFirstAdapter, STORAGE_STORES } from '../core/adapters/LocalFirstAdapter.js';
import { audioSynthesizer } from '../core/AudioSynthesizer.js';
import { router } from '../core/Router.js';

export class CapsuleEditorView extends BaseView {
  constructor() {
    super('capsule-editor');
    this.currentCapsuleId = 'capsule_10a2_van10';
    this.activeActivityTab = 1;
    this.assignedClasses = ['10A2', '10A5']; // 1 Lesson Plan can be taught in multiple classes!
    this.activities5512 = {
      1: `Hoạt động 1: Khởi động (5 phút)\n- Mục tiêu: Tạo tâm thế hứng thú, kết nối kiến thức cũ - mới.\n- Thao tác: Bật Vòng quay may mắn gọi ngẫu nhiên 1 học sinh trả lời câu hỏi về hoàn cảnh sống tại Sa Pa.\n- Sản phẩm: Học sinh trả lời đúng được thưởng +1 ⭐ trên Tivi.`,
      2: `Hoạt động 2: Hình thành kiến thức (20 phút)\n- Mục tiêu: Học sinh phân tích được vẻ đẹp lao động thầm lặng của nhân vật Anh Thanh Niên.\n- Thao tác: Chia lớp thành 4 nhóm thảo luận đồng hồ đếm ngược 5 phút.\n- Sản phẩm: Bảng nhóm tổng hợp 4 phẩm chất cao đẹp.`,
      3: `Hoạt động 3: Luyện tập (15 phút)\n- Mục tiêu: Củng cố kỹ năng viết đoạn văn cảm nhận 200 chữ.\n- Thao tác: Học sinh làm bài cá nhân và giơ tay phát biểu.\n- Sản phẩm: Đoạn văn hoàn chỉnh, tặng +2 ⭐ cho phát biểu xuất sắc.`,
      4: `Hoạt động 4: Vận dụng & Dặn dò (5 phút)\n- Mục tiêu: Liên hệ thực tế tinh thần cống hiến của tuổi trẻ ngày nay.\n- Thao tác: Giao bài tập về nhà sáng tạo thiệp Zalo tri ân.\n- Sản phẩm: Thiệp gửi qua ứng dụng 9Teach.`
    };
    this.uploadedAssets = [
      {
        id: 'asset_demo_1',
        name: 'Slide_Lang_Le_Sa_Pa_10A2.pptx',
        size: '24.5 MB',
        type: 'pptx',
        status: '✔ Đã cache Offline'
      }
    ];
    this.savedCapsules = [];
  }

  async onMount() {
    console.log('📂 [CapsuleEditorView] Mounted 1 Lesson Plan Multi-Class Manager');
    await this.loadCapsulesFromStorage();
    this.renderAssetsGrid();
    this.render5512ActivityContent();
    this.bindEvents();
  }

  async loadCapsulesFromStorage() {
    try {
      const items = await localFirstAdapter.getAll(STORAGE_STORES.LESSONS);
      if (items && items.length > 0) {
        this.savedCapsules = items.filter(item => item.id && item.title);
      }
    } catch (e) {
      console.warn('⚠️ [CapsuleEditorView] Storage load fallback', e);
    }

    if (this.savedCapsules.length === 0) {
      const defaultCapsule = {
        id: 'capsule_10a2_van10',
        title: 'Bài 12: Phân Tích Nhân Vật Văn Học (Lặng Lẽ Sa Pa)',
        className: '10A2',
        assignedClasses: ['10A2', '10A5'],
        slot: 'Thứ 3 — Tiết 2 (07:50 - 08:35)',
        assets: this.uploadedAssets,
        plan5512: this.activities5512,
        updatedAt: new Date().toISOString()
      };
      this.savedCapsules = [defaultCapsule];
      await localFirstAdapter.put(STORAGE_STORES.LESSONS, defaultCapsule);
    }

    this.populateCapsulePicker();
  }

  populateCapsulePicker() {
    const picker = document.getElementById('select-capsule-picker');
    if (!picker) return;

    picker.innerHTML = `
      ${this.savedCapsules.map(c => `
        <option value="${c.id}" ${c.id === this.currentCapsuleId ? 'selected' : ''}>
          📌 ${c.title} — Áp dụng các lớp: ${(c.assignedClasses || [c.className]).join(', ')}
        </option>
      `).join('')}
      <option value="new_capsule">+ ➕ Tạo Gói Tiết Dạy Mới...</option>
    `;
  }

  loadCapsuleData(capsuleId) {
    const capsule = this.savedCapsules.find(c => c.id === capsuleId);
    if (!capsule) return;

    this.currentCapsuleId = capsule.id;
    
    const titleInput = document.getElementById('capsule-title-input');
    const classSelect = document.getElementById('capsule-class-select');
    const slotInput = document.getElementById('capsule-slot-input');

    if (titleInput) titleInput.value = capsule.title || '';
    if (classSelect) classSelect.value = capsule.className || '10A2';
    if (slotInput) slotInput.value = capsule.slot || 'Thứ 3 — Tiết 2 (07:50 - 08:35)';

    this.assignedClasses = capsule.assignedClasses || [capsule.className || '10A2'];
    this.uploadedAssets = capsule.assets || [];
    this.activities5512 = capsule.plan5512 || this.activities5512;

    this.renderAssetsGrid();
    this.render5512ActivityContent();
    this.populateCapsulePicker();
  }

  createNewCapsule() {
    const newId = `capsule_${Date.now()}`;
    this.currentCapsuleId = newId;

    const titleInput = document.getElementById('capsule-title-input');
    const slotInput = document.getElementById('capsule-slot-input');

    if (titleInput) titleInput.value = 'Bài Mới: Kế Hoạch Bài Dạy Chuẩn 5512';
    if (slotInput) slotInput.value = 'Thứ 2 — Tiết 1 (07:00 - 07:45)';

    this.assignedClasses = ['10A2'];
    this.uploadedAssets = [];
    this.activities5512 = {
      1: 'Hoạt động 1: Mở đầu / Khởi động (5 phút)\n- Mục tiêu: Kích hoạt kiến thức bài mới.',
      2: 'Hoạt động 2: Hình thành kiến thức mới (20 phút)\n- Mục tiêu: Phân tích kiến thức trọng tâm.',
      3: 'Hoạt động 3: Luyện tập (15 phút)\n- Mục tiêu: Rèn luyện bài tập cá nhân.',
      4: 'Hoạt động 4: Vận dụng & Dặn dò (5 phút)\n- Mục tiêu: Giao bài tập về nhà.'
    };

    this.renderAssetsGrid();
    this.render5512ActivityContent();
    audioSynthesizer.playChime();
  }

  renderAssetsGrid() {
    const grid = document.querySelector('.file-cards-grid');
    if (!grid) return;

    if (this.uploadedAssets.length === 0) {
      grid.innerHTML = `
        <div style="color: var(--text-muted); font-size: 13px; padding: 12px;">
          Chưa có tài nguyên nào được đính kèm. Kéo thả file PowerPoint/Video vào ô bên trên.
        </div>
      `;
      return;
    }

    grid.innerHTML = this.uploadedAssets.map(asset => `
      <div class="file-item-card glass-card" data-id="${asset.id}" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-radius: 8px; margin-bottom: 8px; background: rgba(15, 23, 42, 0.4); border: 1px solid var(--border-color);">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span class="icon-file ${asset.type}" style="font-size: 24px;">${this.getFileIcon(asset.type)}</span>
          <div class="file-details">
            <span class="fname" style="font-weight: 700; color: white; display: block;">${asset.name}</span>
            <span class="fsize" style="font-size: 12px; color: var(--text-muted);">${asset.size}</span>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <span class="status-badge check" style="background: rgba(16, 185, 129, 0.2); color: #34d399; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 700;">${asset.status}</span>
          <button class="btn-delete-asset btn-secondary btn-sm" data-id="${asset.id}" style="padding: 4px 8px; font-size: 12px; color: var(--accent-red);">✖</button>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.btn-delete-asset').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        this.uploadedAssets = this.uploadedAssets.filter(a => a.id !== id);
        this.renderAssetsGrid();
      });
    });
  }

  getFileIcon(type) {
    if (type.includes('ppt') || type.includes('presentation')) return '📊';
    if (type.includes('pdf')) return '📕';
    if (type.includes('mp4') || type.includes('video')) return '🎬';
    if (type.includes('doc') || type.includes('word')) return '📄';
    return '📁';
  }

  render5512ActivityContent() {
    const textarea = document.querySelector('.textarea-5512');
    if (textarea) {
      textarea.value = this.activities5512[this.activeActivityTab] || '';
    }

    document.querySelectorAll('.tab-5512').forEach(tab => {
      const actId = parseInt(tab.getAttribute('data-act') || '1', 10);
      if (actId === this.activeActivityTab) {
        tab.classList.add('active');
        tab.style.background = 'var(--accent-purple)';
        tab.style.color = 'white';
      } else {
        tab.classList.remove('active');
        tab.style.background = 'rgba(0,0,0,0.3)';
        tab.style.color = 'var(--text-muted)';
      }
    });
  }

  bindEvents() {
    const dropzone = document.getElementById('dropzone-box');
    const browseBtn = document.getElementById('browse-file-btn');
    const saveBtn = document.getElementById('save-capsule-btn');
    const deleteBtn = document.getElementById('btn-delete-capsule');
    const startHeroBtn = document.getElementById('btn-start-lesson-hero');
    const newCapsuleBtn = document.getElementById('btn-new-capsule');
    const pickerSelect = document.getElementById('select-capsule-picker');
    const textarea = document.querySelector('.textarea-5512');

    let fileInput = document.getElementById('capsule-file-input');
    if (!fileInput) {
      fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.id = 'capsule-file-input';
      fileInput.multiple = true;
      fileInput.accept = '.pptx,.pdf,.mp4,.docx,.mp3,.png,.jpg';
      fileInput.style.display = 'none';
      document.body.appendChild(fileInput);
    }

    if (browseBtn) browseBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => this.handleFilesSelect(e.target.files));

    if (pickerSelect) {
      pickerSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === 'new_capsule') {
          this.createNewCapsule();
        } else {
          this.loadCapsuleData(val);
        }
      });
    }

    if (newCapsuleBtn) {
      newCapsuleBtn.addEventListener('click', () => this.createNewCapsule());
    }

    if (dropzone) {
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--accent-purple)';
        dropzone.style.background = 'rgba(139, 92, 246, 0.15)';
      });
      dropzone.addEventListener('dragleave', () => {
        dropzone.style.borderColor = '';
        dropzone.style.background = '';
      });
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = '';
        dropzone.style.background = '';
        if (e.dataTransfer && e.dataTransfer.files) {
          this.handleFilesSelect(e.dataTransfer.files);
        }
      });
    }

    // 5512 Tab Switching
    document.querySelectorAll('.tab-5512').forEach(tab => {
      tab.addEventListener('click', () => {
        if (textarea) this.activities5512[this.activeActivityTab] = textarea.value;
        const actId = parseInt(tab.getAttribute('data-act') || '1', 10);
        this.activeActivityTab = actId;
        this.render5512ActivityContent();
      });
    });

    if (textarea) {
      textarea.addEventListener('input', () => {
        this.activities5512[this.activeActivityTab] = textarea.value;
      });
    }

    // AI 5512 Dynamic Template Generator
    document.getElementById('btn-ai-template-5512')?.addEventListener('click', () => {
      audioSynthesizer.playChime();
      const titleInput = document.getElementById('capsule-title-input');
      const lessonTitle = titleInput ? titleInput.value : 'Bài 12: Phân Tích Nhân Vật Văn Học';
      const classSelect = document.getElementById('capsule-class-select');
      const selectedClass = classSelect ? classSelect.value : '10A2';

      const dynamicTemplates = {
        1: `Hoạt động 1: Mở đầu / Khởi động (5 phút)\na. Mục tiêu: Tạo tâm thế hứng thú học tập, kết nối kiến thức bài "${lessonTitle}".\nb. Nội dung: Học sinh tham gia mini game Vòng quay may mắn gọi tên cho lớp ${selectedClass}.\nc. Sản phẩm: Câu trả lời cá nhân của học sinh.\nd. Tổ chức thực hiện: Giáo viên nêu câu hỏi khởi động -> Gọi 1 học sinh trả lời -> Tuyên dương +1 ⭐ Tivi.`,
        2: `Hoạt động 2: Hình thành kiến thức mới (20 phút)\na. Mục tiêu: Học sinh làm chủ trọng tâm nội dung bài "${lessonTitle}".\nb. Nội dung: Đọc tài liệu, quan sát slide bài giảng và thảo luận nhóm 4 người.\nc. Sản phẩm: Bảng nhóm tổng hợp kiến thức trọng tâm bài học.\nd. Tổ chức thực hiện: Trình chiếu slide bài giảng -> Thảo luận nhóm 5 min -> Đại diện nhóm báo cáo.`,
        3: `Hoạt động 3: Luyện tập / Thảo luận (15 phút)\na. Mục tiêu: Rèn luyện kỹ năng vận dụng kiến thức bài "${lessonTitle}" giải quyết bài tập.\nb. Nội dung: Học sinh suy nghĩ cá nhân làm bài tập luyện tập vào vở.\nc. Sản phẩm: Bài làm hoàn chỉnh của học sinh.\nd. Tổ chức thực hiện: Gọi 2 học sinh phát biểu -> Cả lớp nhận xét -> Tặng +2 ⭐ cho câu trả lời xuất sắc.`,
        4: `Hoạt động 4: Vận dụng & Dặn dò (5 phút)\na. Mục tiêu: Vận dụng bài học "${lessonTitle}" liên hệ thực tế tinh thần học tập lớp ${selectedClass}.\nb. Nội dung: Viết 1 thông điệp 3 câu đúc kết bài học.\nc. Sản phẩm: Thiệp chúc mừng kỹ thuật số tạo trên ứng dụng 9Teach.\nd. Tổ chức thực hiện: Hướng dẫn về nhà -> Nhắc nhở chuẩn bị bài tiếp theo.`
      };

      this.activities5512[this.activeActivityTab] = dynamicTemplates[this.activeActivityTab] || '';
      this.render5512ActivityContent();
    });

    // Save Capsule to Real Storage & Link to Timetable
    if (saveBtn) {
      saveBtn.addEventListener('click', async () => {
        if (textarea) this.activities5512[this.activeActivityTab] = textarea.value;

        const titleInput = document.getElementById('capsule-title-input');
        const classSelect = document.getElementById('capsule-class-select');
        const slotInput = document.getElementById('capsule-slot-input');

        const title = titleInput ? titleInput.value : 'Kế Hoạch Bài Dạy 5512';
        const className = classSelect ? classSelect.value : '10A2';
        const slot = slotInput ? slotInput.value : 'Thứ 3 — Tiết 2';

        const updatedCapsule = {
          id: this.currentCapsuleId,
          title,
          className,
          assignedClasses: Array.from(new Set([...this.assignedClasses, className, '10A5'])), // Assignable to 10A2, 10A5, etc.
          slot,
          assets: this.uploadedAssets,
          plan5512: this.activities5512,
          updatedAt: new Date().toISOString()
        };

        audioSynthesizer.playChime();
        console.log(`💾 [CapsuleEditorView] Saving 1-Lesson-Plan for Multiple Classes '${title}' to IndexedDB...`);

        await localFirstAdapter.put(STORAGE_STORES.LESSONS, updatedCapsule);
        
        const idx = this.savedCapsules.findIndex(c => c.id === this.currentCapsuleId);
        if (idx >= 0) {
          this.savedCapsules[idx] = updatedCapsule;
        } else {
          this.savedCapsules.push(updatedCapsule);
        }

        this.populateCapsulePicker();
        alert(`✔ Đã lưu Giáo án "${title}" & Gán áp dụng cho các Lớp [${updatedCapsule.assignedClasses.join(', ')}] trên TKB Tuần!`);
      });
    }

    // Delete Capsule
    if (deleteBtn) {
      deleteBtn.addEventListener('click', async () => {
        if (confirm(`Bạn có chắc chắn muốn xóa Gói Tiết Dạy ID: ${this.currentCapsuleId}?`)) {
          await localFirstAdapter.delete(STORAGE_STORES.LESSONS, this.currentCapsuleId);
          this.savedCapsules = this.savedCapsules.filter(c => c.id !== this.currentCapsuleId);
          if (this.savedCapsules.length > 0) {
            this.loadCapsuleData(this.savedCapsules[0].id);
          } else {
            this.createNewCapsule();
          }
          alert('🗑️ Đã xóa Gói Tiết Dạy khỏi CSDL!');
        }
      });
    }

    // Start Lesson Hero Action
    if (startHeroBtn) {
      startHeroBtn.addEventListener('click', () => {
        audioSynthesizer.playChime();
        console.log(`🚀 Launching Live Lesson with Capsule ID: ${this.currentCapsuleId}`);
        router.navigateTo('live-workspace');
      });
    }
  }

  handleFilesSelect(files) {
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      const ext = file.name.split('.').pop() || 'file';
      const newAsset = {
        id: `asset_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        name: file.name,
        size: `${sizeMB} MB`,
        type: ext,
        status: '✔ Đã cache Offline'
      };
      this.uploadedAssets.push(newAsset);
    });

    this.renderAssetsGrid();
    audioSynthesizer.playChime();
  }
}
