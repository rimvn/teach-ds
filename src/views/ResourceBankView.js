/**
 * TeachDS Lesson Plan Management Station & Resource Bank Controller
 * Senior Architecture Layer: View Layer (Curriculum Scope & Chapter Binder WOW UX)
 */

import { BaseView } from './BaseView.js';
import { router } from '../core/Router.js';
import { audioSynthesizer } from '../core/AudioSynthesizer.js';
import { localFirstAdapter, STORAGE_STORES } from '../core/adapters/LocalFirstAdapter.js';

export class ResourceBankView extends BaseView {
  constructor() {
    super('resource-bank');
    // Comprehensive Curriculum Structured Chapters Dataset across all Subjects, Grades & Semesters
    this.chaptersData = {
      'VAN_10_HK1': [
        {
          chapterName: 'CHƯƠNG I: THƠ VĂN DÂN GIAN & THẦN THOẠI VIỆT NAM (NGỮ VĂN 10 - HK1)',
          plans: [
            {
              id: 'plan_van10_b1',
              lessonNo: 'Bài 1',
              title: 'Khái Quát Văn Học Dân Gian Việt Nam',
              status: 'ACTIVE',
              assignedClasses: ['Lớp 10A2', 'Lớp 10A5'],
              slideCount: 18,
              fileInfo: 'Slide_Bai1_VHDG_10A2.pptx (18.2 MB)',
              plan5512Status: '✔ 4 Hoạt động chuẩn'
            },
            {
              id: 'plan_van10_b2',
              lessonNo: 'Bài 2',
              title: 'Thần Thoại Kéo Mặt Trời & Thần Thoại Việt Nam',
              status: 'ACTIVE',
              assignedClasses: ['Lớp 10A2', 'Lớp 10A5'],
              slideCount: 22,
              fileInfo: 'Slide_Bai2_ThanThoai.pptx (21.0 MB)',
              plan5512Status: '✔ 4 Hoạt động chuẩn'
            }
          ]
        },
        {
          chapterName: 'CHƯƠNG II: TRUYỆN NGẮN HIỆN ĐẠI & THƠ NÔM TRUNG ĐẠI (NGỮ VĂN 10 - HK1)',
          plans: [
            {
              id: 'plan_van10_hk1',
              lessonNo: 'Bài 12',
              title: 'Phân Tích Nhân Vật Văn Học (Lặng Lẽ Sa Pa)',
              status: 'ACTIVE',
              isUpcoming: true,
              assignedClasses: ['Lớp 10A2 (Đến giờ)', 'Lớp 10A5', 'Lớp 10A8'],
              slideCount: 24,
              fileInfo: 'Slide_Lang_Le_Sa_Pa_10A2.pptx (24.5 MB)',
              plan5512Status: '✔ 4 Hoạt động chuẩn'
            },
            {
              id: 'plan_van10_b13',
              lessonNo: 'Bài 13',
              title: 'Đoàn Thuyền Đánh Cá (Huy Cận) — Phân Tích Cảm Hứng Lao Động',
              status: 'ACTIVE',
              assignedClasses: ['Lớp 10A2', 'Lớp 10A5'],
              slideCount: 20,
              fileInfo: 'Slide_DoanThuyenDanhCa.pptx (19.8 MB)',
              plan5512Status: '✔ 4 Hoạt động chuẩn'
            }
          ]
        }
      ],
      'VAN_10_HK2': [
        {
          chapterName: 'CHƯƠNG III: THƠ NÔM NGUYỄN TRÃI & NGUYỄN BỈNH KHIÊM (NGỮ VĂN 10 - HK2)',
          plans: [
            {
              id: 'plan_van10_hk2_b1',
              lessonNo: 'Bài 18',
              title: 'Bình Ngô Đại Cáo — Tác Phẩm & Tinh Thần Độc Lập Dân Tộc',
              status: 'ACTIVE',
              assignedClasses: ['Lớp 10A2', 'Lớp 10A5'],
              slideCount: 26,
              fileInfo: 'Slide_BinhNgoDaiCao.pptx (25.0 MB)',
              plan5512Status: '✔ 4 Hoạt động chuẩn'
            }
          ]
        }
      ],
      'TOAN_10_HK1': [
        {
          chapterName: 'CHƯƠNG I: MỆNH ĐỀ, TẬP HỢP & BẤT PHƯƠNG TRÌNH (TOÁN 10 - HK1)',
          plans: [
            {
              id: 'plan_toan10_b1',
              lessonNo: 'Bài 1',
              title: 'Mệnh Đề Toán Học & Các Phép Toán Tập Hợp',
              status: 'ACTIVE',
              assignedClasses: ['Lớp 10A2', 'Lớp 10A3'],
              slideCount: 16,
              fileInfo: 'Slide_MenhDe_TapHop.pptx (14.2 MB)',
              plan5512Status: '✔ 4 Hoạt động chuẩn'
            }
          ]
        },
        {
          chapterName: 'CHƯƠNG II: HÀM SỐ BẬC HAI & ĐỒ THỊ PARABOL (TOÁN 10 - HK1)',
          plans: [
            {
              id: 'plan_toan10_hk1',
              lessonNo: 'Bài 5',
              title: 'Hàm Số Bậc Hai Khảo Sát Sự Biến Thiên & Đồ Thị Parabol',
              status: 'ACTIVE',
              assignedClasses: ['Lớp 10A2', 'Lớp 10A3'],
              slideCount: 18,
              fileInfo: 'Slide_Ham_So_Bac_Hai_10A2.pptx (18.2 MB)',
              plan5512Status: '✔ 4 Hoạt động chuẩn'
            }
          ]
        }
      ],
      'TOAN_10_HK2': [
        {
          chapterName: 'CHƯƠNG III: VECTƠ VÀ TÍCH VÔ HƯỚNG TRONG MẶT PHẲNG (TOÁN 10 - HK2)',
          plans: [
            {
              id: 'plan_toan10_hk2_b1',
              lessonNo: 'Bài 12',
              title: 'Tích Vô Hướng Của Hai Vectơ & Ứng Dụng Hình Học',
              status: 'ACTIVE',
              assignedClasses: ['Lớp 10A2', 'Lớp 10A3'],
              slideCount: 22,
              fileInfo: 'Slide_TichVoHuong_Vecter.pptx (20.5 MB)',
              plan5512Status: '✔ 4 Hoạt động chuẩn'
            }
          ]
        }
      ],
      'ANH_11_HK1': [
        {
          chapterName: 'UNIT 3: CITIES OF THE FUTURE (ENGLISH 11 - SEMESTER I)',
          plans: [
            {
              id: 'plan_anh11_hk1',
              lessonNo: 'Unit 3',
              title: 'Cities of the Future (Listening & Speaking Practice)',
              status: 'ACTIVE',
              assignedClasses: ['Lớp 11B1', 'Lớp 11B4'],
              slideCount: 32,
              fileInfo: 'Unit3_Cities_Future.pptx (32.0 MB)',
              plan5512Status: '✔ 4 Hoạt động chuẩn'
            }
          ]
        }
      ],
      'ANH_11_HK2': [
        {
          chapterName: 'UNIT 7: GLOBAL WARMING & ENVIRONMENTAL PROTECTION (ENGLISH 11 - SEMESTER II)',
          plans: [
            {
              id: 'plan_anh11_hk2_b1',
              lessonNo: 'Unit 7',
              title: 'Global Warming Causes and Solutions',
              status: 'ACTIVE',
              assignedClasses: ['Lớp 11B1', 'Lớp 11B4'],
              slideCount: 28,
              fileInfo: 'Unit7_GlobalWarming.pptx (29.5 MB)',
              plan5512Status: '✔ 4 Hoạt động chuẩn'
            }
          ]
        }
      ],
      'SU_11_HK1': [
        {
          chapterName: 'CHƯƠNG III: PHONG TRÀO VĂN HÓA PHỤC HƯNG & THỜI ĐẠI KHÁM PHÁ (LỊCH SỬ 11 - HK1)',
          plans: [
            {
              id: 'plan_su11_hk1',
              lessonNo: 'Bài 15',
              title: 'Phong Trào Văn Hóa Phục Hưng & Cải Cách Tôn Giáo Tây Âu',
              status: 'ACTIVE',
              assignedClasses: ['Lớp 11B1', 'Lớp 11B5'],
              slideCount: 28,
              fileInfo: 'LichSu11_VanHoaPhucHung.pptx (28.4 MB)',
              plan5512Status: '✔ 4 Hoạt động chuẩn'
            }
          ]
        }
      ],
      'SU_11_HK2': [
        {
          chapterName: 'CHƯƠNG V: CHIẾN TRANH THẾ GIỚI THỨ TƯ LIÊN CẤP (LỊCH SỬ 11 - HK2)',
          plans: [
            {
              id: 'plan_su11_hk2_b1',
              lessonNo: 'Bài 22',
              title: 'Chiến Tranh Thế Giới Thứ Nhất (1914 - 1918) & Hệ Lụy',
              status: 'ACTIVE',
              assignedClasses: ['Lớp 11B1'],
              slideCount: 24,
              fileInfo: 'LichSu11_ChienTranhTheGioi1.pptx (23.0 MB)',
              plan5512Status: '✔ 4 Hoạt động chuẩn'
            }
          ]
        }
      ],
      'LY_12_HK1': [
        {
          chapterName: 'CHƯƠNG I: DAO ĐỘNG ĐIỀU HÒA & CON LẮC LÒ XO (VẬT LÝ 12 - HK1)',
          plans: [
            {
              id: 'plan_ly12_hk1',
              lessonNo: 'Bài 8',
              title: 'Dao Động Điều Hòa & Khảo Sát Chu Kỳ Con Lắc Lò Xo',
              status: 'ACTIVE',
              assignedClasses: ['Lớp 12A1'],
              slideCount: 22,
              fileInfo: 'VatLy12_DaoDongDieuHoa.pptx (15.8 MB)',
              plan5512Status: '✔ 4 Hoạt động chuẩn'
            }
          ]
        }
      ],
      'LY_12_HK2': [
        {
          chapterName: 'CHƯƠNG IV: SÓNG ÁNH SÁNG & GIAO THOA ÁNH SÁNG (VẬT LÝ 12 - HK2)',
          plans: [
            {
              id: 'plan_ly12_hk2_b1',
              lessonNo: 'Bài 16',
              title: 'Tán Sắc Ánh Sáng & Thí Nghiệm Giao Thoa Y-âng',
              status: 'ACTIVE',
              assignedClasses: ['Lớp 12A1'],
              slideCount: 30,
              fileInfo: 'VatLy12_GiaoThoaAnhSang.pptx (31.2 MB)',
              plan5512Status: '✔ 4 Hoạt động chuẩn'
            }
          ]
        }
      ]
    };
  }

  async onMount() {
    console.log('📚 [ResourceBankView] Mounted Curriculum Scope & Chapter Binder WOW UX');
    await this.loadPlansFromStorage();
    this.renderChapterBinder();
    this.bindEvents();
  }

  async loadPlansFromStorage() {
    try {
      const items = await localFirstAdapter.getAll(STORAGE_STORES.LESSONS);
      if (items && items.length > 0) {
        items.forEach(item => {
          if (item.title && item.id) {
            const list = this.chaptersData['VAN_10_HK1'][1].plans;
            if (!list.some(p => p.id === item.id)) {
              list.push({
                id: item.id,
                lessonNo: 'Bài mới',
                title: item.title,
                status: 'ACTIVE',
                assignedClasses: item.assignedClasses || ['Lớp 10A2'],
                slideCount: (item.assets || []).length * 10 || 24,
                fileInfo: (item.assets && item.assets[0]) ? `${item.assets[0].name} (${item.assets[0].size})` : 'Slide_Lang_Le_Sa_Pa_10A2.pptx (24.5 MB)',
                plan5512Status: '✔ 4 Hoạt động chuẩn'
              });
            }
          }
        });
      }
    } catch (e) {}
  }

  /**
   * Render Chapter & Lesson Binder View
   */
  renderChapterBinder() {
    const wrapper = document.getElementById('chapter-binder-wrapper');
    if (!wrapper) return;

    const scopeKey = document.getElementById('scope-subject-grade')?.value || 'VAN_10';
    const semester = document.getElementById('scope-semester')?.value || 'HK1';
    const statusFilter = document.getElementById('filter-status')?.value || 'ACTIVE';

    const fullKey = `${scopeKey}_${semester}`;
    const chapters = this.chaptersData[fullKey];

    if (!chapters || chapters.length === 0) {
      wrapper.innerHTML = `
        <div class="glass-card" style="padding: 40px; text-align: center; color: var(--text-muted);">
          <h3>📦 Chưa có kế hoạch bài dạy nào trong học kỳ này</h3>
          <p>Bấm nút "+ Soạn Kế Hoạch 5512 Mới" bên trên để tạo bài giảng cho môn học này.</p>
        </div>
      `;
      return;
    }

    let renderedCount = 0;
    wrapper.innerHTML = chapters.map(chapter => {
      const validPlans = chapter.plans.filter(p => {
        if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
        return true;
      });

      if (validPlans.length === 0) return '';
      renderedCount += validPlans.length;

      return `
        <div class="chapter-group glass-card" style="margin-bottom: 24px; padding: 20px; border-radius: 12px; background: rgba(15, 23, 42, 0.5); border: 1px solid var(--border-color);">
          <h3 style="margin: 0 0 16px 0; color: #c084fc; font-size: 15px; font-weight: 800; display: flex; align-items: center; gap: 8px;">
            📁 ${chapter.chapterName}
          </h3>

          <div class="lessons-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px;">
            ${validPlans.map(plan => `
              <div class="lesson-binder-card glass-card ${plan.isUpcoming ? 'upcoming-border' : ''}" data-id="${plan.id}" style="padding: 16px; border-radius: 10px; display: flex; flex-direction: column; justify-content: space-between; background: rgba(0,0,0,0.3); border: ${plan.isUpcoming ? '1.5px solid var(--accent-purple);' : '1px solid var(--border-color);'}">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="background: rgba(139, 92, 246, 0.2); color: #c084fc; border: 1px solid var(--accent-purple); padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 800;">
                      ${plan.lessonNo}
                    </span>
                    <span style="display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; color: #34d399;">
                      <span style="width: 7px; height: 7px; background: #34d399; border-radius: 50%; display: inline-block; box-shadow: 0 0 6px #34d399;"></span> Đang Hoạt Động
                    </span>
                  </div>

                  <h4 style="margin: 0 0 8px 0; color: white; font-size: 15px; font-weight: 700; line-height: 1.4;">
                    ${plan.title}
                  </h4>

                  <div style="font-size: 11px; color: var(--accent-gold); margin-bottom: 14px;">
                    📊 ${plan.fileInfo} • Kế hoạch 5512
                  </div>
                </div>

                <div style="display: flex; gap: 10px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.08);">
                  <button class="btn-edit-plan btn-secondary btn-sm" data-id="${plan.id}" style="flex: 1;">✏️ Sửa Giáo Án 5512</button>
                  <button class="btn-archive-plan btn-secondary btn-sm" data-id="${plan.id}" style="padding: 6px 12px;">📦 Lưu Trữ</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');

    if (renderedCount === 0) {
      wrapper.innerHTML = `
        <div class="glass-card" style="padding: 40px; text-align: center; color: var(--text-muted);">
          <h3>📦 Chưa có kế hoạch bài dạy nào trong bộ lọc này</h3>
          <p>Thử đổi trạng thái sang "Tất Cả Trạng Thái" hoặc bấm nút "+ Soạn Kế Hoạch 5512 Mới".</p>
        </div>
      `;
    }

    // Bind action buttons
    wrapper.querySelectorAll('.btn-edit-plan').forEach(btn => {
      btn.addEventListener('click', () => {
        router.navigateTo('capsule-editor');
      });
    });

    wrapper.querySelectorAll('.btn-archive-plan').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.openArchiveConfirmModal(id);
      });
    });
  }

  openArchiveConfirmModal(planId) {
    const modal = document.getElementById('archive-confirm-modal');
    const cancelBtn = document.getElementById('btn-cancel-archive-modal');
    const confirmBtn = document.getElementById('btn-confirm-archive-modal');

    if (!modal) return;
    modal.style.display = 'flex';
    audioSynthesizer.playChime();

    const closeModal = () => { modal.style.display = 'none'; };
    if (cancelBtn) cancelBtn.onclick = closeModal;

    if (confirmBtn) {
      confirmBtn.onclick = () => {
        closeModal();
        audioSynthesizer.playChime();
        alert('📦 Đã chuyển bài dạy vào Kho Lưu Trữ cũ!');
      };
    }
  }

  bindEvents() {
    document.getElementById('btn-create-new-plan-hero')?.addEventListener('click', () => {
      router.navigateTo('capsule-editor');
    });

    document.getElementById('btn-hero-review-plan')?.addEventListener('click', () => {
      audioSynthesizer.playChime();
      alert('👁️ [REVIEW NHANH TRƯỚC KHI VÀO TIẾT]\n- Bài 12: Lặng Lẽ Sa Pa (Ngữ Văn 10 — Lớp 10A2)\n- Slide: 24 Trang PPTX (Đã cache Offline)\n- Kế hoạch 5512: 4 Hoạt động (Warm-up 5m -> Kiến thức 20m -> Luyện tập 15m -> Vận dụng 5m)');
    });

    document.getElementById('btn-hero-edit-plan')?.addEventListener('click', () => {
      router.navigateTo('capsule-editor');
    });

    ['scope-subject-grade', 'scope-semester', 'filter-status'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', () => {
        audioSynthesizer.playChime();
        this.renderChapterBinder();
      });
    });
  }
}
