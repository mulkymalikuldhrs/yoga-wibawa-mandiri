/**
 * ============================================================
 * Maintenance Schedule — Manajemen Work Order & Jadwal Maintenance
 * PT Yoga Wibawa Mandiri - Technical Dashboard
 * ============================================================
 *
 * Modul ini menangani:
 * - Pembuatan dan manajemen Work Order (WO)
 * - Kalender jadwal maintenance
 * - Tracking status WO (Open/In Progress/Completed/Cancelled)
 * - Detail WO dengan timeline, spare parts, dan cost tracking
 * - Smart input: voice/text parsing untuk pembuatan WO cepat
 * - Filter dan pencarian WO
 *
 * KV Store:
 * - ywm:maintenance:wo:WO-YYYY-XXXX → data WO lengkap
 * - ywm:maintenance:index:all        → array nomor WO
 *
 * @version 1.0.0
 * @author YWM Development Team
 */

window.YWM = window.YWM || {};
window.YWM.Modules = window.YWM.Modules || {};

YWM.Modules.maintenance = {
    title: 'Maintenance',

    // ============================================================
    // STATE INTERNAL
    // ============================================================

    _state: {
        workOrders: [],          // Cache WO yang sudah dimuat
        currentView: 'list',     // 'list' | 'calendar' | 'detail'
        selectedWO: null,        // WO yang sedang dilihat detailnya
        calendarDate: new Date(),// Bulan aktif kalender
        filters: {
            status: '',
            prioritas: '',
            mesin: ''
        }
    },

    // Daftar mesin di pabrik pengantongan semen
    MESIN_OPTIONS: [
        'Packer 1', 'Packer 2', 'Packer 3',
        'Conveyor Utama', 'Conveyor Loading',
        'Compressor', 'Dust Collector',
        'Silo 1', 'Silo 2', 'Silo 3',
        'Generator', 'Panel Listrik',
        'Forklift 1', 'Forklift 2',
        'Lainnya'
    ],

    TIPE_OPTIONS: ['Preventive', 'Corrective', 'Predictive'],
    PRIORITAS_OPTIONS: ['Low', 'Medium', 'High', 'Critical'],
    STATUS_OPTIONS: ['Open', 'In Progress', 'Completed', 'Cancelled'],

    // ============================================================
    // RENDER — Menghasilkan HTML modul
    // ============================================================

    async render() {
        try {
            // Muat data WO dari KV store
            await this._loadWorkOrders();

            const stats = this._calculateStats();

            return `
                <div class="maintenance-module animate-fade-in" id="maintenance-module">
                    <!-- Header -->
                    <div class="module-header" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:20px;">
                        <div>
                            <h2 style="font-size:1.4rem;font-weight:700;margin:0;">🔧 Maintenance Management</h2>
                            <p class="text-muted" style="font-size:0.8rem;margin:4px 0 0;">Kelola work order & jadwal maintenance</p>
                        </div>
                        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
                            <button class="btn btn-sm" id="mtn-btn-voice" title="Input Suara">
                                🎤 Smart Input
                            </button>
                            <button class="btn btn-sm" id="mtn-btn-calendar" title="Tampilan Kalender">
                                📅 Kalender
                            </button>
                            <button class="btn btn-accent btn-sm" id="mtn-btn-create-wo">
                                ➕ Buat WO
                            </button>
                        </div>
                    </div>

                    <!-- Filter Bar -->
                    <div class="glass-light" style="padding:12px 16px;border-radius:var(--radius-md);margin-bottom:16px;display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
                        <span class="text-muted" style="font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Filter:</span>
                        <select class="select-glass" id="mtn-filter-status" style="width:auto;min-width:130px;padding:6px 30px 6px 10px;font-size:0.8rem;">
                            <option value="">Semua Status</option>
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                        <select class="select-glass" id="mtn-filter-prioritas" style="width:auto;min-width:130px;padding:6px 30px 6px 10px;font-size:0.8rem;">
                            <option value="">Semua Prioritas</option>
                            <option value="Critical">Critical</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                        <select class="select-glass" id="mtn-filter-mesin" style="width:auto;min-width:140px;padding:6px 30px 6px 10px;font-size:0.8rem;">
                            <option value="">Semua Mesin</option>
                            ${this.MESIN_OPTIONS.map(m => `<option value="${m}">${m}</option>`).join('')}
                        </select>
                        <button class="btn btn-sm" id="mtn-filter-reset" title="Reset Filter">↺</button>
                    </div>

                    <!-- Statistik Ringkas -->
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:20px;">
                        <div class="glass" style="padding:16px;text-align:center;">
                            <div style="font-size:1.6rem;font-weight:700;" class="text-accent" id="mtn-stat-open">${stats.open}</div>
                            <div class="text-muted" style="font-size:0.75rem;margin-top:4px;">WO Open</div>
                        </div>
                        <div class="glass" style="padding:16px;text-align:center;">
                            <div style="font-size:1.6rem;font-weight:700;" class="text-warning" id="mtn-stat-progress">${stats.inProgress}</div>
                            <div class="text-muted" style="font-size:0.75rem;margin-top:4px;">WO In Progress</div>
                        </div>
                        <div class="glass" style="padding:16px;text-align:center;">
                            <div style="font-size:1.6rem;font-weight:700;" class="text-error" id="mtn-stat-overdue">${stats.overdue}</div>
                            <div class="text-muted" style="font-size:0.75rem;margin-top:4px;">WO Overdue</div>
                        </div>
                        <div class="glass" style="padding:16px;text-align:center;">
                            <div style="font-size:1.6rem;font-weight:700;" class="text-success" id="mtn-stat-completed">${stats.completedThisMonth}</div>
                            <div class="text-muted" style="font-size:0.75rem;margin-top:4px;">Selesai Bulan Ini</div>
                        </div>
                    </div>

                    <!-- Konten Utama: List / Calendar / Detail -->
                    <div id="mtn-main-content">
                        ${this._renderWOList()}
                    </div>

                    <!-- Smart Input Area -->
                    <div id="mtn-smart-input-area" class="glass-light" style="display:none;padding:14px 16px;border-radius:var(--radius-md);margin-top:16px;">
                        <div style="display:flex;gap:10px;align-items:center;">
                            <span style="font-size:1.1rem;">🎤</span>
                            <input type="text" class="input-glass" id="mtn-smart-input"
                                placeholder='Ketik: "Buat WO untuk packer 2, corrective, prioritas tinggi, bearing aus"'
                                style="flex:1;">
                            <button class="btn btn-accent btn-sm" id="mtn-smart-submit">Proses</button>
                            <button class="btn btn-sm" id="mtn-smart-close">✕</button>
                        </div>
                        <div id="mtn-smart-result" class="text-muted" style="font-size:0.8rem;margin-top:8px;display:none;"></div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('[Maintenance] Gagal render:', error);
            return `<div class="glass" style="padding:24px;text-align:center;">
                <p class="text-error">Gagal memuat modul maintenance</p>
                <p class="text-muted" style="font-size:0.8rem;">${error.message}</p>
            </div>`;
        }
    },

    // ============================================================
    // INIT — Pasang event listener setelah render
    // ============================================================

    async init() {
        try {
            // Tombol Buat WO
            const btnCreate = document.getElementById('mtn-btn-create-wo');
            if (btnCreate) {
                btnCreate.addEventListener('click', () => this._showCreateWOModal());
            }

            // Tombol Kalender
            const btnCalendar = document.getElementById('mtn-btn-calendar');
            if (btnCalendar) {
                btnCalendar.addEventListener('click', () => {
                    this._state.currentView = this._state.currentView === 'calendar' ? 'list' : 'calendar';
                    this._refreshMainContent();
                    if (btnCalendar) {
                        btnCalendar.textContent = this._state.currentView === 'calendar' ? '📋 List' : '📅 Kalender';
                    }
                });
            }

            // Tombol Smart Input
            const btnVoice = document.getElementById('mtn-btn-voice');
            if (btnVoice) {
                btnVoice.addEventListener('click', () => {
                    const area = document.getElementById('mtn-smart-input-area');
                    if (area) {
                        area.style.display = area.style.display === 'none' ? 'block' : 'none';
                    }
                });
            }

            // Smart Input Submit
            const smartSubmit = document.getElementById('mtn-smart-submit');
            if (smartSubmit) {
                smartSubmit.addEventListener('click', () => this._processSmartInput());
            }

            // Smart Input Close
            const smartClose = document.getElementById('mtn-smart-close');
            if (smartClose) {
                smartClose.addEventListener('click', () => {
                    const area = document.getElementById('mtn-smart-input-area');
                    if (area) area.style.display = 'none';
                });
            }

            // Smart Input Enter
            const smartInput = document.getElementById('mtn-smart-input');
            if (smartInput) {
                smartInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') this._processSmartInput();
                });
            }

            // Filter event listeners
            const filterStatus = document.getElementById('mtn-filter-status');
            const filterPrioritas = document.getElementById('mtn-filter-prioritas');
            const filterMesin = document.getElementById('mtn-filter-mesin');
            const filterReset = document.getElementById('mtn-filter-reset');

            if (filterStatus) filterStatus.addEventListener('change', () => this._applyFilters());
            if (filterPrioritas) filterPrioritas.addEventListener('change', () => this._applyFilters());
            if (filterMesin) filterMesin.addEventListener('change', () => this._applyFilters());
            if (filterReset) filterReset.addEventListener('click', () => this._resetFilters());

            console.log('[Maintenance] Modul diinisialisasi ✓');
        } catch (error) {
            console.error('[Maintenance] Gagal init:', error);
        }
    },

    // ============================================================
    // DATA LAYER — Operasi KV Store
    // ============================================================

    /**
     * Helper: akses KV store dengan fallback ke YWM.Data atau puter.kv langsung
     */
    _kvGet: async function(key) {
        try {
            if (window.YWM && window.YWM.Data && typeof window.YWM.Data.get === 'function') {
                return await window.YWM.Data.get(key);
            }
            if (typeof puter !== 'undefined' && puter.kv) {
                const val = await puter.kv.get(key);
                return val ? JSON.parse(val) : null;
            }
            return null;
        } catch (e) {
            console.warn('[Maintenance] KV get gagal:', key, e.message);
            return null;
        }
    },

    _kvSet: async function(key, value) {
        try {
            if (window.YWM && window.YWM.Data && typeof window.YWM.Data.setWithTimestamp === 'function') {
                return await window.YWM.Data.setWithTimestamp(key, value);
            }
            if (typeof puter !== 'undefined' && puter.kv) {
                await puter.kv.set(key, JSON.stringify(value));
                return true;
            }
            return false;
        } catch (e) {
            console.warn('[Maintenance] KV set gagal:', key, e.message);
            return false;
        }
    },

    _addAudit: async function(action, details) {
        try {
            if (window.YWM && window.YWM.Data && typeof window.YWM.Data.addAuditLog === 'function') {
                await window.YWM.Data.addAuditLog('maintenance', action, details);
            }
        } catch (e) {
            console.warn('[Maintenance] Audit log gagal:', e.message);
        }
    },

    /**
     * Muat semua Work Order dari KV store
     */
    _loadWorkOrders: async function() {
        try {
            const index = await this._kvGet('ywm:maintenance:index:all');
            if (index && Array.isArray(index)) {
                const woPromises = index.map(woNum => this._kvGet(`ywm:maintenance:wo:${woNum}`));
                const results = await Promise.all(woPromises);
                this._state.workOrders = results.filter(wo => wo !== null);
            } else {
                this._state.workOrders = [];
            }
        } catch (e) {
            console.error('[Maintenance] Gagal memuat WO:', e);
            this._state.workOrders = [];
        }
    },

    /**
     * Simpan WO ke KV store dan update index
     */
    _saveWO: async function(woData) {
        try {
            // Simpan data WO
            await this._kvSet(`ywm:maintenance:wo:${woData.wo_number}`, woData);

            // Update index
            let index = await this._kvGet('ywm:maintenance:index:all');
            if (!index) index = [];
            if (!Array.isArray(index)) index = [];
            if (!index.includes(woData.wo_number)) {
                index.push(woData.wo_number);
                await this._kvSet('ywm:maintenance:index:all', index);
            }

            // Audit log
            await this._addAudit('save_wo', { wo_number: woData.wo_number, judul: woData.judul });

            return true;
        } catch (e) {
            console.error('[Maintenance] Gagal menyimpan WO:', e);
            return false;
        }
    },

    /**
     * Generate nomor WO otomatis: WO-YYYY-XXXX
     */
    _generateWONumber: async function() {
        try {
            const year = new Date().getFullYear();
            const index = await this._kvGet('ywm:maintenance:index:all');
            const existingNumbers = (index && Array.isArray(index)) ? index : [];

            // Cari nomor urut terbesar untuk tahun ini
            let maxSeq = 0;
            const prefix = `WO-${year}-`;
            for (const num of existingNumbers) {
                if (num.startsWith(prefix)) {
                    const seq = parseInt(num.replace(prefix, ''), 10);
                    if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
                }
            }

            const nextSeq = maxSeq + 1;
            return `${prefix}${String(nextSeq).padStart(4, '0')}`;
        } catch (e) {
            // Fallback: gunakan timestamp
            const year = new Date().getFullYear();
            return `WO-${year}-${String(Date.now()).slice(-4)}`;
        }
    },

    // ============================================================
    // STATISTIK
    // ============================================================

    _calculateStats: function() {
        const wo = this._state.workOrders;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        return {
            open: wo.filter(w => w.status === 'Open').length,
            inProgress: wo.filter(w => w.status === 'In Progress').length,
            overdue: wo.filter(w => {
                if (w.status === 'Completed' || w.status === 'Cancelled') return false;
                if (!w.due_date) return false;
                return new Date(w.due_date) < now;
            }).length,
            completedThisMonth: wo.filter(w => {
                if (w.status !== 'Completed') return false;
                const completedDate = w.updated_at ? new Date(w.updated_at) : null;
                return completedDate && completedDate >= startOfMonth;
            }).length,
            total: wo.length
        };
    },

    // ============================================================
    // RENDER HELPERS
    // ============================================================

    /**
     * Render daftar Work Order (tampilan list)
     */
    _renderWOList: function() {
        const filteredWO = this._getFilteredWO();

        if (filteredWO.length === 0) {
            return `
                <div class="glass" style="padding:40px;text-align:center;">
                    <div style="font-size:2.5rem;margin-bottom:12px;">📋</div>
                    <p style="font-size:1rem;font-weight:500;">Belum ada Work Order</p>
                    <p class="text-muted" style="font-size:0.85rem;">Klik "Buat WO" untuk menambahkan work order baru</p>
                </div>
            `;
        }

        // Urutkan: Critical > High > Medium > Low, lalu overdue dulu
        const priorityOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
        const sorted = [...filteredWO].sort((a, b) => {
            const pA = priorityOrder[a.prioritas] ?? 4;
            const pB = priorityOrder[b.prioritas] ?? 4;
            if (pA !== pB) return pA - pB;
            // Overdue di atas
            const now = Date.now();
            const overA = a.due_date && new Date(a.due_date).getTime() < now && a.status !== 'Completed' && a.status !== 'Cancelled';
            const overB = b.due_date && new Date(b.due_date).getTime() < now && b.status !== 'Completed' && b.status !== 'Cancelled';
            if (overA && !overB) return -1;
            if (!overA && overB) return 1;
            // Terbaru di atas
            return new Date(b.created_at) - new Date(a.created_at);
        });

        const rows = sorted.map(wo => this._renderWORow(wo)).join('');

        return `
            <div class="glass" style="overflow-x:auto;">
                <table style="width:100%;border-collapse:collapse;font-size:0.85rem;">
                    <thead>
                        <tr style="border-bottom:1px solid rgba(255,255,255,0.15);">
                            <th style="padding:12px 14px;text-align:left;font-size:0.7rem;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);">No. WO</th>
                            <th style="padding:12px 10px;text-align:left;font-size:0.7rem;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);">Judul</th>
                            <th style="padding:12px 10px;text-align:left;font-size:0.7rem;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);">Mesin</th>
                            <th style="padding:12px 10px;text-align:center;font-size:0.7rem;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);">Tipe</th>
                            <th style="padding:12px 10px;text-align:center;font-size:0.7rem;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);">Prioritas</th>
                            <th style="padding:12px 10px;text-align:center;font-size:0.7rem;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);">Status</th>
                            <th style="padding:12px 10px;text-align:left;font-size:0.7rem;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);">Assigned</th>
                            <th style="padding:12px 10px;text-align:left;font-size:0.7rem;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);">Due Date</th>
                            <th style="padding:12px 10px;text-align:center;font-size:0.7rem;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    },

    /**
     * Render satu baris WO di tabel
     */
    _renderWORow: function(wo) {
        const statusBadge = this._statusBadge(wo.status);
        const prioritasBadge = this._prioritasBadge(wo.prioritas);
        const isOverdue = wo.due_date && new Date(wo.due_date) < new Date() &&
                          wo.status !== 'Completed' && wo.status !== 'Cancelled';
        const dueDateClass = isOverdue ? 'text-error' : 'text-secondary';
        const dueDateStr = wo.due_date ? formatTanggal(wo.due_date, 'short') : '-';

        return `
            <tr style="border-bottom:1px solid rgba(255,255,255,0.06);cursor:pointer;" class="mtn-wo-row" data-wo="${wo.wo_number}"
                onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'">
                <td style="padding:10px 14px;font-weight:600;" class="text-accent">${wo.wo_number}</td>
                <td style="padding:10px 10px;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${wo.judul || '-'}</td>
                <td style="padding:10px 10px;">${wo.mesin || '-'}</td>
                <td style="padding:10px 10px;text-align:center;"><span class="badge badge-info">${wo.tipe || '-'}</span></td>
                <td style="padding:10px 10px;text-align:center;">${prioritasBadge}</td>
                <td style="padding:10px 10px;text-align:center;">${statusBadge}</td>
                <td style="padding:10px 10px;">${wo.assigned_to || '-'}</td>
                <td style="padding:10px 10px;" class="${dueDateClass}">${isOverdue ? '⚠ ' : ''}${dueDateStr}</td>
                <td style="padding:10px 10px;text-align:center;">
                    <button class="btn btn-sm mtn-btn-detail" data-wo="${wo.wo_number}" title="Detail">👁</button>
                </td>
            </tr>
        `;
    },

    /**
     * Render tampilan kalender bulanan
     */
    _renderCalendar: function() {
        const date = this._state.calendarDate;
        const year = date.getFullYear();
        const month = date.getMonth();
        const bulanNama = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

        // Hitung hari pertama dan jumlah hari
        const firstDay = new Date(year, month, 1).getDay(); // 0=Min
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();

        // Kumpulkan WO per tanggal
        const woByDate = {};
        const activeWO = this._state.workOrders.filter(w =>
            w.status !== 'Cancelled' && w.due_date
        );
        for (const wo of activeWO) {
            const dKey = wo.due_date.split('T')[0]; // YYYY-MM-DD
            if (!woByDate[dKey]) woByDate[dKey] = [];
            woByDate[dKey].push(wo);
        }

        // Header navigasi
        let html = `
            <div class="glass" style="padding:20px;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
                    <button class="btn btn-sm" id="mtn-cal-prev">◀</button>
                    <h3 style="font-size:1.1rem;font-weight:600;">${bulanNama[month]} ${year}</h3>
                    <button class="btn btn-sm" id="mtn-cal-next">▶</button>
                </div>
                <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;">
        `;

        // Header hari
        const hariNama = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
        for (const h of hariNama) {
            html += `<div style="text-align:center;padding:8px 4px;font-size:0.7rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;">${h}</div>`;
        }

        // Sel kosong sebelum hari pertama
        for (let i = 0; i < firstDay; i++) {
            html += `<div style="min-height:80px;padding:4px;background:rgba(255,255,255,0.02);border-radius:4px;"></div>`;
        }

        // Sel hari
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
            const woList = woByDate[dateStr] || [];

            html += `
                <div style="min-height:80px;padding:6px;background:${isToday ? 'rgba(0,212,255,0.08)' : 'rgba(255,255,255,0.03)'};border-radius:4px;border:${isToday ? '1px solid rgba(0,212,255,0.3)' : '1px solid transparent'};">
                    <div style="font-size:0.75rem;font-weight:${isToday ? '700' : '400'};color:${isToday ? 'var(--accent)' : 'var(--text-secondary)'};margin-bottom:4px;">${day}</div>
                    ${woList.slice(0, 3).map(wo => `
                        <div class="mtn-cal-wo" data-wo="${wo.wo_number}" style="font-size:0.6rem;padding:2px 4px;margin-bottom:2px;border-radius:3px;cursor:pointer;background:${this._prioritasColor(wo.prioritas)};color:#000;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${wo.wo_number}: ${wo.judul}">
                            ${wo.wo_number.split('-').pop()}
                        </div>
                    `).join('')}
                    ${woList.length > 3 ? `<div style="font-size:0.6rem;color:var(--text-muted);">+${woList.length - 3} lagi</div>` : ''}
                </div>
            `;
        }

        html += `</div></div>`;
        return html;
    },

    /**
     * Render detail WO
     */
    _renderWODetail: function(wo) {
        if (!wo) return '<p class="text-error">WO tidak ditemukan</p>';

        const isOverdue = wo.due_date && new Date(wo.due_date) < new Date() &&
                          wo.status !== 'Completed' && wo.status !== 'Cancelled';

        return `
            <div class="animate-fade-in">
                <!-- Kembali -->
                <button class="btn btn-sm" id="mtn-detail-back" style="margin-bottom:16px;">← Kembali ke Daftar</button>

                <!-- Header Detail -->
                <div class="glass" style="padding:20px;margin-bottom:16px;">
                    <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px;">
                        <div>
                            <h3 style="font-size:1.2rem;font-weight:700;" class="text-accent">${wo.wo_number}</h3>
                            <p style="font-size:1rem;font-weight:500;margin-top:4px;">${wo.judul}</p>
                            <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;">
                                ${this._statusBadge(wo.status)}
                                ${this._prioritasBadge(wo.prioritas)}
                                <span class="badge badge-info">${wo.tipe}</span>
                                ${isOverdue ? '<span class="badge badge-error">OVERDUE</span>' : ''}
                            </div>
                        </div>
                        <div style="display:flex;gap:8px;flex-wrap:wrap;">
                            ${wo.status === 'Open' ? '<button class="btn btn-sm btn-accent" id="mtn-detail-start">▶ Mulai Kerja</button>' : ''}
                            ${wo.status === 'In Progress' ? '<button class="btn btn-sm btn-accent" id="mtn-detail-complete">✓ Selesai</button>' : ''}
                            ${wo.status !== 'Cancelled' && wo.status !== 'Completed' ? '<button class="btn btn-sm btn-danger" id="mtn-detail-cancel">✕ Batalkan</button>' : ''}
                        </div>
                    </div>
                </div>

                <!-- Info Grid -->
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px;margin-bottom:16px;">
                    <div class="glass" style="padding:16px;">
                        <h4 style="font-size:0.8rem;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);margin-bottom:12px;">Informasi WO</h4>
                        <div style="display:grid;grid-template-columns:auto 1fr;gap:6px 16px;font-size:0.85rem;">
                            <span class="text-muted">Mesin:</span><span>${wo.mesin || '-'}</span>
                            <span class="text-muted">Assigned:</span><span>${wo.assigned_to || '-'}</span>
                            <span class="text-muted">Due Date:</span><span class="${isOverdue ? 'text-error' : ''}">${wo.due_date ? formatTanggal(wo.due_date, 'short') : '-'}</span>
                            <span class="text-muted">Dibuat:</span><span>${wo.created_at ? formatTanggal(wo.created_at, 'datetime') : '-'}</span>
                            <span class="text-muted">Oleh:</span><span>${wo.created_by || '-'}</span>
                        </div>
                    </div>
                    <div class="glass" style="padding:16px;">
                        <h4 style="font-size:0.8rem;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);margin-bottom:12px;">Biaya</h4>
                        <div style="display:grid;grid-template-columns:auto 1fr;gap:6px 16px;font-size:0.85rem;">
                            <span class="text-muted">Estimasi:</span><span>${wo.estimated_cost ? formatRupiah(wo.estimated_cost) : '-'}</span>
                            <span class="text-muted">Aktual:</span><span>${wo.actual_cost ? formatRupiah(wo.actual_cost) : '-'}</span>
                            <span class="text-muted">Selisih:</span><span>${this._costVariance(wo)}</span>
                        </div>
                    </div>
                </div>

                <!-- Deskripsi -->
                ${wo.deskripsi ? `
                <div class="glass" style="padding:16px;margin-bottom:16px;">
                    <h4 style="font-size:0.8rem;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);margin-bottom:8px;">Deskripsi Masalah</h4>
                    <p style="font-size:0.85rem;line-height:1.6;white-space:pre-wrap;">${wo.deskripsi}</p>
                </div>` : ''}

                <!-- Spare Parts Used -->
                <div class="glass" style="padding:16px;margin-bottom:16px;">
                    <h4 style="font-size:0.8rem;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);margin-bottom:12px;">Spare Parts Digunakan</h4>
                    ${wo.spare_parts_used && wo.spare_parts_used.length > 0 ? `
                        <table style="width:100%;border-collapse:collapse;font-size:0.8rem;">
                            <thead><tr>
                                <th style="text-align:left;padding:6px;color:var(--text-muted);">Nama Part</th>
                                <th style="text-align:center;padding:6px;color:var(--text-muted);">Qty</th>
                                <th style="text-align:right;padding:6px;color:var(--text-muted);">Biaya</th>
                            </tr></thead>
                            <tbody>
                                ${wo.spare_parts_used.map(p => `
                                    <tr style="border-top:1px solid rgba(255,255,255,0.06);">
                                        <td style="padding:6px;">${p.nama || '-'}</td>
                                        <td style="padding:6px;text-align:center;">${p.qty || 0}</td>
                                        <td style="padding:6px;text-align:right;">${p.biaya ? formatRupiah(p.biaya) : '-'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : '<p class="text-muted" style="font-size:0.8rem;">Belum ada spare part yang dicatat</p>'}
                    <button class="btn btn-sm" id="mtn-detail-add-part" style="margin-top:8px;">+ Tambah Spare Part</button>
                </div>

                <!-- Completion Notes -->
                ${wo.status === 'Completed' && wo.completion_notes ? `
                <div class="glass" style="padding:16px;margin-bottom:16px;">
                    <h4 style="font-size:0.8rem;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);margin-bottom:8px;">Catatan Penyelesaian</h4>
                    <p style="font-size:0.85rem;line-height:1.6;white-space:pre-wrap;">${wo.completion_notes}</p>
                </div>` : ''}

                <!-- Timeline -->
                <div class="glass" style="padding:16px;">
                    <h4 style="font-size:0.8rem;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);margin-bottom:12px;">Timeline</h4>
                    ${this._renderTimeline(wo)}
                </div>
            </div>
        `;
    },

    /**
     * Render timeline sederhana dari WO
     */
    _renderTimeline: function(wo) {
        const events = [];
        if (wo.created_at) events.push({ time: wo.created_at, label: 'WO Dibuat', icon: '📋' });
        if (wo.started_at) events.push({ time: wo.started_at, label: 'Kerja Dimulai', icon: '🔧' });
        if (wo.completed_at) events.push({ time: wo.completed_at, label: 'WO Selesai', icon: '✅' });
        if (wo.cancelled_at) events.push({ time: wo.cancelled_at, label: 'WO Dibatalkan', icon: '❌' });
        if (wo.updated_at && events.length <= 1) events.push({ time: wo.updated_at, label: 'Terakhir Diupdate', icon: '📝' });

        if (events.length === 0) return '<p class="text-muted" style="font-size:0.8rem;">Belum ada aktivitas</p>';

        return `<div style="display:flex;flex-direction:column;gap:12px;">
            ${events.map(ev => `
                <div style="display:flex;gap:12px;align-items:flex-start;">
                    <div style="font-size:1rem;min-width:24px;">${ev.icon}</div>
                    <div>
                        <div style="font-size:0.85rem;font-weight:500;">${ev.label}</div>
                        <div class="text-muted" style="font-size:0.75rem;">${formatTanggal(ev.time, 'datetime')}</div>
                    </div>
                </div>
            `).join('')}
        </div>`;
    },

    // ============================================================
    // BADGE HELPERS
    // ============================================================

    _statusBadge: function(status) {
        const map = {
            'Open': 'badge-info',
            'In Progress': 'badge-warning',
            'Completed': 'badge-success',
            'Cancelled': 'badge-error'
        };
        return `<span class="badge ${map[status] || 'badge-info'}">${status}</span>`;
    },

    _prioritasBadge: function(prioritas) {
        const map = {
            'Critical': 'badge-error',
            'High': 'badge-warning',
            'Medium': 'badge-info',
            'Low': 'badge-success'
        };
        return `<span class="badge ${map[prioritas] || 'badge-info'}">${prioritas}</span>`;
    },

    _prioritasColor: function(prioritas) {
        const map = {
            'Critical': 'rgba(255,82,82,0.6)',
            'High': 'rgba(255,171,0,0.5)',
            'Medium': 'rgba(0,212,255,0.4)',
            'Low': 'rgba(0,230,118,0.4)'
        };
        return map[prioritas] || 'rgba(255,255,255,0.2)';
    },

    _costVariance: function(wo) {
        if (!wo.estimated_cost || !wo.actual_cost) return '<span class="text-muted">-</span>';
        const diff = wo.actual_cost - wo.estimated_cost;
        if (diff > 0) return `<span class="text-error">+${formatRupiah(diff)}</span>`;
        if (diff < 0) return `<span class="text-success">${formatRupiah(diff)}</span>`;
        return '<span class="text-success">Tepat</span>';
    },

    // ============================================================
    // FILTER
    // ============================================================

    _applyFilters: function() {
        const statusEl = document.getElementById('mtn-filter-status');
        const prioritasEl = document.getElementById('mtn-filter-prioritas');
        const mesinEl = document.getElementById('mtn-filter-mesin');

        this._state.filters.status = statusEl ? statusEl.value : '';
        this._state.filters.prioritas = prioritasEl ? prioritasEl.value : '';
        this._state.filters.mesin = mesinEl ? mesinEl.value : '';

        this._refreshMainContent();
    },

    _resetFilters: function() {
        this._state.filters = { status: '', prioritas: '', mesin: '' };
        const statusEl = document.getElementById('mtn-filter-status');
        const prioritasEl = document.getElementById('mtn-filter-prioritas');
        const mesinEl = document.getElementById('mtn-filter-mesin');
        if (statusEl) statusEl.value = '';
        if (prioritasEl) prioritasEl.value = '';
        if (mesinEl) mesinEl.value = '';
        this._refreshMainContent();
    },

    _getFilteredWO: function() {
        const f = this._state.filters;
        return this._state.workOrders.filter(wo => {
            if (f.status && wo.status !== f.status) return false;
            if (f.prioritas && wo.prioritas !== f.prioritas) return false;
            if (f.mesin && wo.mesin !== f.mesin) return false;
            return true;
        });
    },

    // ============================================================
    // CONTENT REFRESH
    // ============================================================

    _refreshMainContent: function() {
        const container = document.getElementById('mtn-main-content');
        if (!container) return;

        if (this._state.currentView === 'detail' && this._state.selectedWO) {
            const wo = this._state.workOrders.find(w => w.wo_number === this._state.selectedWO);
            container.innerHTML = this._renderWODetail(wo);
            this._attachDetailListeners();
        } else if (this._state.currentView === 'calendar') {
            container.innerHTML = this._renderCalendar();
            this._attachCalendarListeners();
        } else {
            container.innerHTML = this._renderWOList();
            this._attachListListeners();
        }

        // Update statistik
        this._updateStats();
    },

    _updateStats: function() {
        const stats = this._calculateStats();
        const elOpen = document.getElementById('mtn-stat-open');
        const elProgress = document.getElementById('mtn-stat-progress');
        const elOverdue = document.getElementById('mtn-stat-overdue');
        const elCompleted = document.getElementById('mtn-stat-completed');
        if (elOpen) elOpen.textContent = stats.open;
        if (elProgress) elProgress.textContent = stats.inProgress;
        if (elOverdue) elOverdue.textContent = stats.overdue;
        if (elCompleted) elCompleted.textContent = stats.completedThisMonth;
    },

    _attachListListeners: function() {
        // Klik baris WO untuk lihat detail
        document.querySelectorAll('.mtn-btn-detail').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const woNum = btn.getAttribute('data-wo');
                this._showWODetail(woNum);
            });
        });

        document.querySelectorAll('.mtn-wo-row').forEach(row => {
            row.addEventListener('click', () => {
                const woNum = row.getAttribute('data-wo');
                this._showWODetail(woNum);
            });
        });
    },

    _attachCalendarListeners: function() {
        const prevBtn = document.getElementById('mtn-cal-prev');
        const nextBtn = document.getElementById('mtn-cal-next');
        if (prevBtn) prevBtn.addEventListener('click', () => {
            this._state.calendarDate.setMonth(this._state.calendarDate.getMonth() - 1);
            this._refreshMainContent();
        });
        if (nextBtn) nextBtn.addEventListener('click', () => {
            this._state.calendarDate.setMonth(this._state.calendarDate.getMonth() + 1);
            this._refreshMainContent();
        });

        // Klik WO di kalender
        document.querySelectorAll('.mtn-cal-wo').forEach(el => {
            el.addEventListener('click', () => {
                const woNum = el.getAttribute('data-wo');
                this._showWODetail(woNum);
            });
        });
    },

    _attachDetailListeners: function() {
        const backBtn = document.getElementById('mtn-detail-back');
        if (backBtn) backBtn.addEventListener('click', () => {
            this._state.currentView = 'list';
            this._state.selectedWO = null;
            this._refreshMainContent();
            // Reset tombol kalender
            const calBtn = document.getElementById('mtn-btn-calendar');
            if (calBtn) calBtn.textContent = '📅 Kalender';
        });

        const startBtn = document.getElementById('mtn-detail-start');
        if (startBtn) startBtn.addEventListener('click', () => this._updateWOStatus('In Progress'));

        const completeBtn = document.getElementById('mtn-detail-complete');
        if (completeBtn) completeBtn.addEventListener('click', () => this._showCompleteWOModal());

        const cancelBtn = document.getElementById('mtn-detail-cancel');
        if (cancelBtn) cancelBtn.addEventListener('click', () => this._updateWOStatus('Cancelled'));

        const addPartBtn = document.getElementById('mtn-detail-add-part');
        if (addPartBtn) addPartBtn.addEventListener('click', () => this._showAddPartModal());
    },

    // ============================================================
    // WORK ORDER ACTIONS
    // ============================================================

    _showWODetail: function(woNumber) {
        this._state.currentView = 'detail';
        this._state.selectedWO = woNumber;
        this._refreshMainContent();
    },

    _updateWOStatus: async function(newStatus) {
        try {
            const woNum = this._state.selectedWO;
            if (!woNum) return;

            const wo = this._state.workOrders.find(w => w.wo_number === woNum);
            if (!wo) return;

            wo.status = newStatus;
            wo.updated_at = new Date().toISOString();

            if (newStatus === 'In Progress') wo.started_at = new Date().toISOString();
            if (newStatus === 'Completed') { wo.completed_at = new Date().toISOString(); }
            if (newStatus === 'Cancelled') wo.cancelled_at = new Date().toISOString();

            await this._saveWO(wo);
            this._refreshMainContent();
            this._showToast(`WO ${woNum} diubah ke "${newStatus}"`, 'success');
        } catch (e) {
            console.error('[Maintenance] Gagal update status:', e);
            this._showToast('Gagal mengubah status WO', 'error');
        }
    },

    // ============================================================
    // CREATE WO MODAL
    // ============================================================

    _showCreateWOModal: function() {
        const modal = document.getElementById('modal-overlay');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');
        const footer = document.getElementById('modal-footer');
        if (!modal || !body) return;

        if (title) title.textContent = '🔧 Buat Work Order Baru';

        body.innerHTML = `
            <form id="mtn-form-create" style="display:flex;flex-direction:column;gap:14px;">
                <div>
                    <label class="label-glass">Judul WO *</label>
                    <input type="text" name="judul" class="input-glass" placeholder="Deskripsi singkat pekerjaan" required>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div>
                        <label class="label-glass">Mesin *</label>
                        <select name="mesin" class="select-glass" required>
                            <option value="">Pilih Mesin</option>
                            ${this.MESIN_OPTIONS.map(m => `<option value="${m}">${m}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="label-glass">Tipe *</label>
                        <select name="tipe" class="select-glass" required>
                            <option value="">Pilih Tipe</option>
                            ${this.TIPE_OPTIONS.map(t => `<option value="${t}">${t}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div>
                        <label class="label-glass">Prioritas *</label>
                        <select name="prioritas" class="select-glass" required>
                            <option value="">Pilih Prioritas</option>
                            ${this.PRIORITAS_OPTIONS.map(p => `<option value="${p}">${p}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="label-glass">Due Date *</label>
                        <input type="date" name="due_date" class="input-glass" required>
                    </div>
                </div>
                <div>
                    <label class="label-glass">Deskripsi Masalah</label>
                    <textarea name="deskripsi" class="textarea-glass" placeholder="Jelaskan masalah atau pekerjaan yang perlu dilakukan" rows="3"></textarea>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div>
                        <label class="label-glass">Assigned To</label>
                        <input type="text" name="assigned_to" class="input-glass" placeholder="Nama teknisi / tim">
                    </div>
                    <div>
                        <label class="label-glass">Estimasi Biaya (Rp)</label>
                        <input type="number" name="estimated_cost" class="input-glass" placeholder="0" min="0">
                    </div>
                </div>
            </form>
        `;

        footer.innerHTML = `
            <button class="btn btn-sm" id="mtn-modal-cancel">Batal</button>
            <button class="btn btn-accent btn-sm" id="mtn-modal-submit">Simpan WO</button>
        `;

        modal.classList.remove('hidden');

        // Event listeners
        const cancelBtn = document.getElementById('mtn-modal-cancel');
        const submitBtn = document.getElementById('mtn-modal-submit');
        if (cancelBtn) cancelBtn.addEventListener('click', () => this._closeModal());
        if (submitBtn) submitBtn.addEventListener('click', () => this._handleCreateWO());
    },

    _handleCreateWO: async function() {
        try {
            const form = document.getElementById('mtn-form-create');
            if (!form) return;

            const data = {
                judul: form.judul.value.trim(),
                mesin: form.mesin.value,
                tipe: form.tipe.value,
                prioritas: form.prioritas.value,
                due_date: form.due_date.value,
                deskripsi: form.deskripsi.value.trim(),
                assigned_to: form.assigned_to.value.trim(),
                estimated_cost: form.estimated_cost.value ? Number(form.estimated_cost.value) : 0
            };

            // Validasi field wajib
            const errors = {};
            if (!data.judul) errors.judul = 'Judul wajib diisi';
            if (!data.mesin) errors.mesin = 'Mesin wajib dipilih';
            if (!data.tipe) errors.tipe = 'Tipe wajib dipilih';
            if (!data.prioritas) errors.prioritas = 'Prioritas wajib dipilih';
            if (!data.due_date) errors.due_date = 'Due date wajib diisi';

            if (Object.keys(errors).length > 0) {
                // Tampilkan error
                for (const [field, msg] of Object.entries(errors)) {
                    const input = form.querySelector(`[name="${field}"]`);
                    if (input) {
                        input.classList.add('input-error');
                        // Hapus pesan error lama
                        const oldErr = input.parentNode.querySelector('.form-error');
                        if (oldErr) oldErr.remove();
                        const errEl = document.createElement('div');
                        errEl.className = 'form-error';
                        errEl.style.cssText = 'color:var(--status-error);font-size:0.7rem;margin-top:4px;';
                        errEl.textContent = msg;
                        input.parentNode.appendChild(errEl);
                    }
                }
                return;
            }

            // Generate nomor WO
            const woNumber = await this._generateWONumber();

            const now = new Date().toISOString();
            const woData = {
                wo_number: woNumber,
                judul: data.judul,
                mesin: data.mesin,
                tipe: data.tipe,
                prioritas: data.prioritas,
                deskripsi: data.deskripsi,
                assigned_to: data.assigned_to,
                due_date: data.due_date,
                estimated_cost: data.estimated_cost,
                actual_cost: 0,
                status: 'Open',
                spare_parts_used: [],
                completion_notes: '',
                created_at: now,
                updated_at: now,
                created_by: (window.YWM && window.YWM.PuterInit && window.YWM.PuterInit.user) ?
                            window.YWM.PuterInit.user.username : 'System'
            };

            await this._saveWO(woData);
            this._state.workOrders.push(woData);
            this._closeModal();
            this._refreshMainContent();
            this._showToast(`Work Order ${woNumber} berhasil dibuat!`, 'success');
        } catch (e) {
            console.error('[Maintenance] Gagal membuat WO:', e);
            this._showToast('Gagal membuat Work Order', 'error');
        }
    },

    // ============================================================
    // COMPLETE WO MODAL
    // ============================================================

    _showCompleteWOModal: function() {
        const modal = document.getElementById('modal-overlay');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');
        const footer = document.getElementById('modal-footer');
        if (!modal || !body) return;

        const wo = this._state.workOrders.find(w => w.wo_number === this._state.selectedWO);

        if (title) title.textContent = '✅ Selesaikan Work Order';

        body.innerHTML = `
            <form id="mtn-form-complete" style="display:flex;flex-direction:column;gap:14px;">
                <div class="glass-light" style="padding:12px;border-radius:var(--radius-sm);">
                    <span class="text-accent" style="font-weight:600;">${wo ? wo.wo_number : ''}</span> — ${wo ? wo.judul : ''}
                </div>
                <div>
                    <label class="label-glass">Catatan Penyelesaian *</label>
                    <textarea name="completion_notes" class="textarea-glass"
                        placeholder="Jelaskan hasil pekerjaan, temuan, dll" rows="4" required></textarea>
                </div>
                <div>
                    <label class="label-glass">Biaya Aktual (Rp)</label>
                    <input type="number" name="actual_cost" class="input-glass"
                        placeholder="Total biaya aktual" min="0" value="${wo && wo.estimated_cost ? wo.estimated_cost : '0'}">
                </div>
            </form>
        `;

        footer.innerHTML = `
            <button class="btn btn-sm" id="mtn-complete-cancel">Batal</button>
            <button class="btn btn-accent btn-sm" id="mtn-complete-submit">Selesaikan WO</button>
        `;

        modal.classList.remove('hidden');

        const cancelBtn = document.getElementById('mtn-complete-cancel');
        const submitBtn = document.getElementById('mtn-complete-submit');
        if (cancelBtn) cancelBtn.addEventListener('click', () => this._closeModal());
        if (submitBtn) submitBtn.addEventListener('click', async () => {
            try {
                const form = document.getElementById('mtn-form-complete');
                if (!form) return;

                const notes = form.completion_notes.value.trim();
                if (!notes) {
                    form.completion_notes.classList.add('input-error');
                    this._showToast('Catatan penyelesaian wajib diisi', 'error');
                    return;
                }

                if (wo) {
                    wo.status = 'Completed';
                    wo.completion_notes = notes;
                    wo.actual_cost = Number(form.actual_cost.value) || 0;
                    wo.completed_at = new Date().toISOString();
                    wo.updated_at = new Date().toISOString();
                    await this._saveWO(wo);
                    this._closeModal();
                    this._refreshMainContent();
                    this._showToast(`WO ${wo.wo_number} selesai!`, 'success');
                }
            } catch (e) {
                console.error('[Maintenance] Gagal menyelesaikan WO:', e);
                this._showToast('Gagal menyelesaikan WO', 'error');
            }
        });
    },

    // ============================================================
    // ADD SPARE PART MODAL
    // ============================================================

    _showAddPartModal: function() {
        const modal = document.getElementById('modal-overlay');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');
        const footer = document.getElementById('modal-footer');
        if (!modal || !body) return;

        if (title) title.textContent = '🔩 Tambah Spare Part';

        body.innerHTML = `
            <form id="mtn-form-part" style="display:flex;flex-direction:column;gap:14px;">
                <div>
                    <label class="label-glass">Nama Part *</label>
                    <input type="text" name="nama" class="input-glass" placeholder="Contoh: Bearing 6205" required>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div>
                        <label class="label-glass">Quantity *</label>
                        <input type="number" name="qty" class="input-glass" placeholder="1" min="1" required>
                    </div>
                    <div>
                        <label class="label-glass">Biaya (Rp)</label>
                        <input type="number" name="biaya" class="input-glass" placeholder="0" min="0">
                    </div>
                </div>
            </form>
        `;

        footer.innerHTML = `
            <button class="btn btn-sm" id="mtn-part-cancel">Batal</button>
            <button class="btn btn-accent btn-sm" id="mtn-part-submit">Tambah</button>
        `;

        modal.classList.remove('hidden');

        const cancelBtn = document.getElementById('mtn-part-cancel');
        const submitBtn = document.getElementById('mtn-part-submit');
        if (cancelBtn) cancelBtn.addEventListener('click', () => this._closeModal());
        if (submitBtn) submitBtn.addEventListener('click', async () => {
            try {
                const form = document.getElementById('mtn-form-part');
                if (!form) return;

                const nama = form.nama.value.trim();
                const qty = Number(form.qty.value);
                const biaya = Number(form.biaya.value) || 0;

                if (!nama || !qty || qty < 1) {
                    this._showToast('Nama part dan quantity wajib diisi', 'error');
                    return;
                }

                const wo = this._state.workOrders.find(w => w.wo_number === this._state.selectedWO);
                if (wo) {
                    if (!wo.spare_parts_used) wo.spare_parts_used = [];
                    wo.spare_parts_used.push({ nama, qty, biaya });
                    // Update actual cost
                    wo.actual_cost = wo.spare_parts_used.reduce((sum, p) => sum + (p.biaya || 0), 0);
                    wo.updated_at = new Date().toISOString();
                    await this._saveWO(wo);
                    this._closeModal();
                    this._refreshMainContent();
                    this._showToast('Spare part ditambahkan', 'success');
                }
            } catch (e) {
                console.error('[Maintenance] Gagal menambah spare part:', e);
                this._showToast('Gagal menambah spare part', 'error');
            }
        });
    },

    // ============================================================
    // SMART INPUT — Voice/Text parsing untuk pembuatan WO cepat
    // ============================================================

    _processSmartInput: async function() {
        const input = document.getElementById('mtn-smart-input');
        const resultDiv = document.getElementById('mtn-smart-result');
        if (!input || !input.value.trim()) return;

        const text = input.value.trim();
        if (resultDiv) {
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = '<span class="text-muted">Memproses input...</span>';
        }

        try {
            // Coba gunakan Smart Input jika tersedia
            if (window.YWMSmartInput) {
                const result = await window.YWMSmartInput.processInput(text, 'maintenance');
                if (result && result.data) {
                    // Buat WO dari data terstruktur
                    const data = result.data;
                    const woNumber = await this._generateWONumber();
                    const now = new Date().toISOString();

                    // Mapping dari smart input ke WO
                    const woData = {
                        wo_number: woNumber,
                        judul: data.deskripsi_masalah || data.judul || data.item || text.substring(0, 80),
                        mesin: this._matchMesin(data.mesin || data.item || ''),
                        tipe: this._matchTipe(data.tipe_maintenance || data.tipe || ''),
                        prioritas: this._matchPrioritas(data.prioritas || ''),
                        deskripsi: text,
                        assigned_to: data.assigned_to || data.pic || '',
                        due_date: data.due_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        estimated_cost: data.estimated_cost || data.biaya_material || 0,
                        actual_cost: 0,
                        status: 'Open',
                        spare_parts_used: [],
                        completion_notes: '',
                        created_at: now,
                        updated_at: now,
                        created_by: (window.YWM && window.YWM.PuterInit && window.YWM.PuterInit.user) ?
                                    window.YWM.PuterInit.user.username : 'Smart Input'
                    };

                    await this._saveWO(woData);
                    this._state.workOrders.push(woData);
                    this._refreshMainContent();

                    if (resultDiv) {
                        resultDiv.innerHTML = `<span class="text-success">✅ WO ${woNumber} berhasil dibuat!</span>`;
                    }

                    input.value = '';
                    this._showToast(`WO ${woNumber} dibuat via Smart Input`, 'success');
                    return;
                }
            }

            // Fallback: parsing sederhana berbasis keyword
            const woData = this._parseSimpleInput(text);
            if (woData) {
                const woNumber = await this._generateWONumber();
                const now = new Date().toISOString();
                woData.wo_number = woNumber;
                woData.created_at = now;
                woData.updated_at = now;
                woData.created_by = 'Smart Input';

                await this._saveWO(woData);
                this._state.workOrders.push(woData);
                this._refreshMainContent();

                if (resultDiv) {
                    resultDiv.innerHTML = `<span class="text-success">✅ WO ${woNumber} berhasil dibuat!</span>`;
                }

                input.value = '';
                this._showToast(`WO ${woNumber} dibuat`, 'success');
            }
        } catch (e) {
            console.error('[Maintenance] Smart input gagal:', e);
            if (resultDiv) {
                resultDiv.innerHTML = `<span class="text-error">❌ Gagal memproses: ${e.message}</span>`;
            }
        }
    },

    /**
     * Parsing sederhana berbasis keyword untuk input teks
     */
    _parseSimpleInput: function(text) {
        const lower = text.toLowerCase();

        // Deteksi mesin
        let mesin = 'Lainnya';
        for (const m of this.MESIN_OPTIONS) {
            if (lower.includes(m.toLowerCase())) {
                mesin = m;
                break;
            }
        }
        // Fallback keyword untuk mesin
        if (lower.includes('packer')) mesin = 'Packer 1';
        if (lower.includes('conveyor') || lower.includes('belt')) mesin = 'Conveyor Utama';
        if (lower.includes('compressor') || lower.includes('kompresor')) mesin = 'Compressor';

        // Deteksi tipe
        let tipe = 'Corrective';
        if (lower.includes('preventive') || lower.includes('pm ') || lower.includes('terjadwal')) tipe = 'Preventive';
        if (lower.includes('predictive') || lower.includes('prediktif')) tipe = 'Predictive';

        // Deteksi prioritas
        let prioritas = 'Medium';
        if (lower.includes('critical') || lower.includes('darurat') || lower.includes('mogok') || lower.includes('emergency')) prioritas = 'Critical';
        else if (lower.includes('tinggi') || lower.includes('high') || lower.includes('urgent')) prioritas = 'High';
        else if (lower.includes('rendah') || lower.includes('low') || lower.includes('tidak mendesak')) prioritas = 'Low';

        return {
            judul: text.substring(0, 100),
            mesin: mesin,
            tipe: tipe,
            prioritas: prioritas,
            deskripsi: text,
            assigned_to: '',
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            estimated_cost: 0,
            actual_cost: 0,
            status: 'Open',
            spare_parts_used: [],
            completion_notes: ''
        };
    },

    /**
     * Cocokkan string ke daftar mesin
     */
    _matchMesin: function(str) {
        if (!str) return 'Lainnya';
        const lower = str.toLowerCase();
        for (const m of this.MESIN_OPTIONS) {
            if (lower.includes(m.toLowerCase())) return m;
        }
        // Alias umum
        if (lower.includes('packer')) return 'Packer 1';
        if (lower.includes('conveyor') || lower.includes('belt')) return 'Conveyor Utama';
        if (lower.includes('compressor')) return 'Compressor';
        if (lower.includes('silo')) return 'Silo 1';
        if (lower.includes('generator') || lower.includes('genset')) return 'Generator';
        return 'Lainnya';
    },

    /**
     * Cocokkan string ke tipe maintenance
     */
    _matchTipe: function(str) {
        if (!str) return 'Corrective';
        const lower = str.toLowerCase();
        if (lower.includes('preventive') || lower.includes('pm')) return 'Preventive';
        if (lower.includes('predictive') || lower.includes('prediktif')) return 'Predictive';
        if (lower.includes('emergency') || lower.includes('darurat')) return 'Corrective';
        return 'Corrective';
    },

    /**
     * Cocokkan string ke prioritas
     */
    _matchPrioritas: function(str) {
        if (!str) return 'Medium';
        const lower = str.toLowerCase();
        if (lower.includes('critical') || lower.includes('darurat')) return 'Critical';
        if (lower.includes('high') || lower.includes('tinggi')) return 'High';
        if (lower.includes('low') || lower.includes('rendah')) return 'Low';
        return 'Medium';
    },

    // ============================================================
    // UTILITY
    // ============================================================

    _closeModal: function() {
        const modal = document.getElementById('modal-overlay');
        if (modal) modal.classList.add('hidden');
    },

    _showToast: function(message, type = 'info') {
        // Gunakan toast container yang sudah ada di dashboard
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `<span>${message}</span>`;
        container.appendChild(toast);

        // Auto-remove setelah 4 detik
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
};

console.log('[Maintenance] Modul maintenance dimuat ✓');
