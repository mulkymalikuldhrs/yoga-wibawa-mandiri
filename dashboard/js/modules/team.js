/**
 * ============================================================
 * Team Activity Tracker — Manajemen Tim & Aktivitas Harian
 * PT Yoga Wibawa Mandiri - Technical Dashboard
 * ============================================================
 *
 * Modul ini menangani:
 * - Overview tim: kehadiran, cuti/sakit, lembur
 * - Timeline aktivitas harian dengan timestamps
 * - Check-in / Check-out karyawan
 * - Pencatatan aktivitas dengan kategori
 * - Daftar anggota tim dengan status hari ini
 * - Grafik performa mingguan (bar chart CSS)
 * - Filter tanggal untuk riwayat
 *
 * KV Store:
 * - ywm:team:activity:YYYY-MM-DD → {date, activities: [...]}
 * - ywm:team:employee:EMP-XXX   → {id, nama, jabatan, divisi, ...}
 * - ywm:team:index:all           → array employee IDs
 * - ywm:team:checkin:YYYY-MM-DD  → {emp_id: {check_in, check_out}}
 *
 * @version 1.0.0
 * @author YWM Development Team
 */

window.YWM = window.YWM || {};
window.YWM.Modules = window.YWM.Modules || {};

YWM.Modules.team = {
    title: 'Tim & Aktivitas',

    // ============================================================
    // STATE INTERNAL
    // ============================================================

    _state: {
        employees: [],           // Cache data karyawan
        activities: [],          // Aktivitas hari ini / tanggal terpilih
        checkins: {},            // Data check-in/out hari ini
        selectedDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        weeklyData: []           // Data aktivitas 7 hari terakhir
    },

    KATEGORI_OPTIONS: ['Produksi', 'Maintenance', 'Inspeksi', 'Meeting', 'Lainnya'],
    DIVISI_OPTIONS: ['Produksi', 'Maintenance', 'Quality', 'HSE', 'Warehouse', 'Administrasi', 'Management'],
    STATUS_OPTIONS: ['aktif', 'cuti', 'sakit', 'dinas luar', 'nonaktif'],

    // Karyawan default (seed data)
    _DEFAULT_EMPLOYEES: [
        { id: 'EMP-001', nama: 'Budi Santoso', jabatan: 'Supervisor Produksi', divisi: 'Produksi', telepon: '081234567001', email: 'budi@ywm.co.id', status: 'aktif' },
        { id: 'EMP-002', nama: 'Ahmad Rizki', jabatan: 'Teknisi Maintenance', divisi: 'Maintenance', telepon: '081234567002', email: 'ahmad@ywm.co.id', status: 'aktif' },
        { id: 'EMP-003', nama: 'Dewi Sartika', jabatan: 'Operator Packer', divisi: 'Produksi', telepon: '081234567003', email: 'dewi@ywm.co.id', status: 'aktif' },
        { id: 'EMP-004', nama: 'Eko Prasetyo', jabatan: 'Teknisi Listrik', divisi: 'Maintenance', telepon: '081234567004', email: 'eko@ywm.co.id', status: 'aktif' },
        { id: 'EMP-005', nama: 'Fatimah Zahra', jabatan: 'QC Inspector', divisi: 'Quality', telepon: '081234567005', email: 'fatimah@ywm.co.id', status: 'aktif' },
        { id: 'EMP-006', nama: 'Gunawan Wibowo', jabatan: 'Operator Forklift', divisi: 'Warehouse', telepon: '081234567006', email: 'gunawan@ywm.co.id', status: 'aktif' },
        { id: 'EMP-007', nama: 'Hendra Kusuma', jabatan: 'Supervisor Maintenance', divisi: 'Maintenance', telepon: '081234567007', email: 'hendra@ywm.co.id', status: 'aktif' },
        { id: 'EMP-008', nama: 'Indah Permata', jabatan: 'Admin HR', divisi: 'Administrasi', telepon: '081234567008', email: 'indah@ywm.co.id', status: 'aktif' },
        { id: 'EMP-009', nama: 'Joko Widodo', jabatan: 'Safety Officer', divisi: 'HSE', telepon: '081234567009', email: 'joko@ywm.co.id', status: 'aktif' },
        { id: 'EMP-010', nama: 'Kartini Rahayu', jabatan: 'Operator Packer', divisi: 'Produksi', telepon: '081234567010', email: 'kartini@ywm.co.id', status: 'aktif' }
    ],

    // ============================================================
    // RENDER — Menghasilkan HTML modul
    // ============================================================

    async render() {
        try {
            // Muat data dari KV store
            await this._loadData();

            const todayStats = this._calculateTodayStats();
            const dateStr = this._state.selectedDate;

            return `
                <div class="team-module animate-fade-in" id="team-module">
                    <!-- Header -->
                    <div class="module-header" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:20px;">
                        <div>
                            <h2 style="font-size:1.4rem;font-weight:700;margin:0;">👥 Tim & Aktivitas</h2>
                            <p class="text-muted" style="font-size:0.8rem;margin:4px 0 0;">Manajemen tim dan pencatatan aktivitas harian</p>
                        </div>
                        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
                            <input type="date" class="input-glass" id="team-date-filter"
                                value="${dateStr}" style="width:auto;padding:6px 10px;font-size:0.8rem;">
                            <button class="btn btn-accent btn-sm" id="team-btn-add-activity">
                                ➕ Tambah Aktivitas
                            </button>
                        </div>
                    </div>

                    <!-- Team Overview Cards -->
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:20px;">
                        <div class="glass" style="padding:16px;text-align:center;">
                            <div style="font-size:1.6rem;font-weight:700;" class="text-accent" id="team-stat-total">${todayStats.total}</div>
                            <div class="text-muted" style="font-size:0.75rem;margin-top:4px;">Total Karyawan</div>
                        </div>
                        <div class="glass" style="padding:16px;text-align:center;">
                            <div style="font-size:1.6rem;font-weight:700;" class="text-success" id="team-stat-hadir">${todayStats.hadir}</div>
                            <div class="text-muted" style="font-size:0.75rem;margin-top:4px;">Hadir Hari Ini</div>
                        </div>
                        <div class="glass" style="padding:16px;text-align:center;">
                            <div style="font-size:1.6rem;font-weight:700;" class="text-warning" id="team-stat-cuti">${todayStats.cutiSakit}</div>
                            <div class="text-muted" style="font-size:0.75rem;margin-top:4px;">Cuti / Sakit</div>
                        </div>
                        <div class="glass" style="padding:16px;text-align:center;">
                            <div style="font-size:1.6rem;font-weight:700;" class="text-error" id="team-stat-lembur">${todayStats.lembur}</div>
                            <div class="text-muted" style="font-size:0.75rem;margin-top:4px;">Lembur</div>
                        </div>
                    </div>

                    <!-- Main Content: 2-column layout -->
                    <div style="display:grid;grid-template-columns:1fr 340px;gap:16px;">
                        <!-- Kolom Kiri: Timeline + Chart -->
                        <div>
                            <!-- Activity Timeline -->
                            <div class="glass" style="padding:16px;margin-bottom:16px;">
                                <h3 style="font-size:0.95rem;font-weight:600;margin-bottom:14px;">
                                    📋 Timeline Aktivitas
                                    <span class="text-muted" style="font-size:0.75rem;font-weight:400;margin-left:8px;">${formatTanggal(dateStr, 'short')}</span>
                                </h3>
                                <div id="team-timeline">
                                    ${this._renderTimeline()}
                                </div>
                            </div>

                            <!-- Weekly Performance Chart -->
                            <div class="glass" style="padding:16px;">
                                <h3 style="font-size:0.95rem;font-weight:600;margin-bottom:14px;">📊 Performa Mingguan</h3>
                                ${this._renderWeeklyChart()}
                            </div>
                        </div>

                        <!-- Kolom Kanan: Check-in/out + Team List -->
                        <div>
                            <!-- Quick Check-in/out -->
                            <div class="glass" style="padding:16px;margin-bottom:16px;">
                                <h3 style="font-size:0.95rem;font-weight:600;margin-bottom:14px;">⏰ Check-in / Check-out</h3>
                                <div id="team-checkin-area">
                                    ${this._renderCheckinArea()}
                                </div>
                            </div>

                            <!-- Team Member List -->
                            <div class="glass" style="padding:16px;">
                                <h3 style="font-size:0.95rem;font-weight:600;margin-bottom:14px;">👷 Daftar Tim</h3>
                                <div id="team-member-list" style="display:flex;flex-direction:column;gap:8px;max-height:420px;overflow-y:auto;">
                                    ${this._renderTeamMemberList()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('[Team] Gagal render:', error);
            return `<div class="glass" style="padding:24px;text-align:center;">
                <p class="text-error">Gagal memuat modul tim & aktivitas</p>
                <p class="text-muted" style="font-size:0.8rem;">${error.message}</p>
            </div>`;
        }
    },

    // ============================================================
    // INIT — Pasang event listener setelah render
    // ============================================================

    async init() {
        try {
            // Tambah Aktivitas
            const btnAdd = document.getElementById('team-btn-add-activity');
            if (btnAdd) {
                btnAdd.addEventListener('click', () => this._showAddActivityModal());
            }

            // Date Filter
            const dateFilter = document.getElementById('team-date-filter');
            if (dateFilter) {
                dateFilter.addEventListener('change', async (e) => {
                    this._state.selectedDate = e.target.value;
                    await this._loadActivitiesForDate(e.target.value);
                    await this._loadCheckinsForDate(e.target.value);
                    this._refreshContent();
                });
            }

            // Delegasi event untuk check-in/out buttons
            const checkinArea = document.getElementById('team-checkin-area');
            if (checkinArea) {
                checkinArea.addEventListener('click', (e) => {
                    const btn = e.target.closest('[data-action]');
                    if (!btn) return;
                    const action = btn.getAttribute('data-action');
                    const empId = btn.getAttribute('data-emp');
                    if (action === 'checkin') this._handleCheckin(empId);
                    else if (action === 'checkout') this._handleCheckout(empId);
                });
            }

            console.log('[Team] Modul diinisialisasi ✓');
        } catch (error) {
            console.error('[Team] Gagal init:', error);
        }
    },

    // ============================================================
    // DATA LAYER — Operasi KV Store
    // ============================================================

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
            console.warn('[Team] KV get gagal:', key, e.message);
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
            console.warn('[Team] KV set gagal:', key, e.message);
            return false;
        }
    },

    _addAudit: async function(action, details) {
        try {
            if (window.YWM && window.YWM.Data && typeof window.YWM.Data.addAuditLog === 'function') {
                await window.YWM.Data.addAuditLog('team', action, details);
            }
        } catch (e) {
            console.warn('[Team] Audit log gagal:', e.message);
        }
    },

    /**
     * Muat semua data yang diperlukan
     */
    _loadData: async function() {
        try {
            // Muat data karyawan
            await this._loadEmployees();

            // Muat aktivitas untuk tanggal terpilih
            await this._loadActivitiesForDate(this._state.selectedDate);

            // Muat check-in/out untuk hari ini
            await this._loadCheckinsForDate(this._state.selectedDate);

            // Muat data mingguan untuk chart
            await this._loadWeeklyData();
        } catch (e) {
            console.error('[Team] Gagal memuat data:', e);
        }
    },

    /**
     * Muat data karyawan dari KV atau seed default
     */
    _loadEmployees: async function() {
        try {
            const index = await this._kvGet('ywm:team:index:all');
            if (index && Array.isArray(index) && index.length > 0) {
                const empPromises = index.map(id => this._kvGet(`ywm:team:employee:${id}`));
                const results = await Promise.all(empPromises);
                this._state.employees = results.filter(emp => emp !== null);
            }

            // Jika belum ada data karyawan, seed default
            if (this._state.employees.length === 0) {
                this._state.employees = [...this._DEFAULT_EMPLOYEES];
                // Simpan ke KV
                for (const emp of this._state.employees) {
                    await this._kvSet(`ywm:team:employee:${emp.id}`, emp);
                }
                await this._kvSet('ywm:team:index:all', this._state.employees.map(e => e.id));
            }
        } catch (e) {
            console.error('[Team] Gagal memuat karyawan:', e);
            this._state.employees = [...this._DEFAULT_EMPLOYEES];
        }
    },

    /**
     * Muat aktivitas untuk tanggal tertentu
     */
    _loadActivitiesForDate: async function(dateStr) {
        try {
            const data = await this._kvGet(`ywm:team:activity:${dateStr}`);
            if (data && data.activities) {
                this._state.activities = data.activities;
            } else {
                this._state.activities = [];
            }
        } catch (e) {
            console.error('[Team] Gagal memuat aktivitas:', e);
            this._state.activities = [];
        }
    },

    /**
     * Muat data check-in/out untuk tanggal tertentu
     */
    _loadCheckinsForDate: async function(dateStr) {
        try {
            const data = await this._kvGet(`ywm:team:checkin:${dateStr}`);
            if (data) {
                this._state.checkins = data;
            } else {
                this._state.checkins = {};
            }
        } catch (e) {
            console.error('[Team] Gagal memuat check-in:', e);
            this._state.checkins = {};
        }
    },

    /**
     * Muat data aktivitas 7 hari terakhir untuk chart mingguan
     */
    _loadWeeklyData: async function() {
        try {
            this._state.weeklyData = [];
            const today = new Date();
            const hariNama = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];

            for (let i = 6; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];

                try {
                    const data = await this._kvGet(`ywm:team:activity:${dateStr}`);
                    const count = (data && data.activities) ? data.activities.length : 0;
                    this._state.weeklyData.push({
                        date: dateStr,
                        day: hariNama[d.getDay()],
                        count: count
                    });
                } catch (e) {
                    this._state.weeklyData.push({
                        date: dateStr,
                        day: hariNama[d.getDay()],
                        count: 0
                    });
                }
            }
        } catch (e) {
            console.error('[Team] Gagal memuat data mingguan:', e);
            this._state.weeklyData = [];
        }
    },

    /**
     * Simpan aktivitas ke KV store
     */
    _saveActivities: async function() {
        try {
            const dateStr = this._state.selectedDate;
            const data = {
                date: dateStr,
                activities: this._state.activities
            };
            await this._kvSet(`ywm:team:activity:${dateStr}`, data);
            await this._addAudit('save_activities', { date: dateStr, count: this._state.activities.length });
        } catch (e) {
            console.error('[Team] Gagal menyimpan aktivitas:', e);
        }
    },

    /**
     * Simpan data check-in/out ke KV store
     */
    _saveCheckins: async function() {
        try {
            const dateStr = this._state.selectedDate;
            await this._kvSet(`ywm:team:checkin:${dateStr}`, this._state.checkins);
        } catch (e) {
            console.error('[Team] Gagal menyimpan check-in:', e);
        }
    },

    // ============================================================
    // STATISTIK
    // ============================================================

    _calculateTodayStats: function() {
        const emps = this._state.employees;
        const checkins = this._state.checkins;
        const activities = this._state.activities;

        const hadirIds = new Set(Object.keys(checkins));
        // Karyawan yang check-in dianggap hadir
        const hadir = emps.filter(e => hadirIds.has(e.id) && e.status === 'aktif').length;
        // Jika belum ada check-in, hitung semua karyawan aktif sebagai potensial hadir
        const hadirCount = Object.keys(checkins).length > 0 ? hadir : 0;

        const cutiSakit = emps.filter(e => e.status === 'cuti' || e.status === 'sakit').length;

        // Hitung lembur dari aktivitas yang ditandai lembur
        const lemburSet = new Set();
        for (const act of activities) {
            if (act.lembur) lemburSet.add(act.karyawan);
        }
        const lembur = lemburSet.size;

        return {
            total: emps.length,
            hadir: hadirCount,
            cutiSakit: cutiSakit,
            lembur: lembur
        };
    },

    // ============================================================
    // RENDER HELPERS
    // ============================================================

    /**
     * Render timeline aktivitas
     */
    _renderTimeline: function() {
        const acts = this._state.activities;

        if (acts.length === 0) {
            return `
                <div style="text-align:center;padding:24px;">
                    <div style="font-size:2rem;margin-bottom:8px;">📋</div>
                    <p style="font-size:0.9rem;">Belum ada aktivitas tercatat</p>
                    <p class="text-muted" style="font-size:0.8rem;">Klik "Tambah Aktivitas" untuk mulai</p>
                </div>
            `;
        }

        // Urutkan berdasarkan timestamp (terbaru di atas)
        const sorted = [...acts].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        const kategoriIcons = {
            'Produksi': '🏭',
            'Maintenance': '🔧',
            'Inspeksi': '🔍',
            'Meeting': '🤝',
            'Lainnya': '📌'
        };

        const kategoriColors = {
            'Produksi': 'badge-info',
            'Maintenance': 'badge-warning',
            'Inspeksi': 'badge-success',
            'Meeting': 'badge-error',
            'Lainnya': 'badge-info'
        };

        return `
            <div style="display:flex;flex-direction:column;gap:10px;">
                ${sorted.map(act => {
                    const icon = kategoriIcons[act.kategori] || '📌';
                    const badge = kategoriColors[act.kategori] || 'badge-info';
                    const time = act.timestamp ? formatTanggal(act.timestamp, 'time') : '--:--';
                    return `
                        <div class="glass-light" style="padding:10px 14px;border-radius:var(--radius-sm);display:flex;gap:12px;align-items:flex-start;">
                            <div style="font-size:1.1rem;min-width:24px;">${icon}</div>
                            <div style="flex:1;min-width:0;">
                                <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
                                    <span style="font-size:0.85rem;font-weight:500;">${act.karyawan || '-'}</span>
                                    <span class="text-muted" style="font-size:0.7rem;">${time}</span>
                                </div>
                                <div style="font-size:0.8rem;margin-top:2px;">${act.kegiatan || '-'}</div>
                                <div style="display:flex;gap:6px;margin-top:6px;align-items:center;flex-wrap:wrap;">
                                    <span class="badge ${badge}" style="font-size:0.6rem;">${act.kategori || '-'}</span>
                                    ${act.lembur ? '<span class="badge badge-warning" style="font-size:0.6rem;">Lembur</span>' : ''}
                                    ${act.catatan ? `<span class="text-muted" style="font-size:0.7rem;">📝 ${act.catatan}</span>` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    /**
     * Render check-in/out area
     */
    _renderCheckinArea: function() {
        const emps = this._state.employees.filter(e => e.status === 'aktif');
        const checkins = this._state.checkins;

        if (emps.length === 0) {
            return '<p class="text-muted" style="font-size:0.8rem;">Tidak ada karyawan aktif</p>';
        }

        // Tampilkan 5 karyawan pertama + tombol expand
        const displayEmps = emps.slice(0, 6);

        return `
            <div style="display:flex;flex-direction:column;gap:8px;">
                ${displayEmps.map(emp => {
                    const ci = checkins[emp.id];
                    const hasCheckin = ci && ci.check_in;
                    const hasCheckout = ci && ci.check_out;

                    return `
                        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
                            <div style="min-width:0;">
                                <div style="font-size:0.8rem;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${emp.nama}</div>
                                <div class="text-muted" style="font-size:0.65rem;">
                                    ${hasCheckin ? `In: ${ci.check_in}` : 'Belum check-in'}
                                    ${hasCheckout ? ` | Out: ${ci.check_out}` : ''}
                                </div>
                            </div>
                            <div style="display:flex;gap:4px;">
                                ${!hasCheckin ? `
                                    <button class="btn btn-sm btn-accent" data-action="checkin" data-emp="${emp.id}"
                                        style="font-size:0.65rem;padding:4px 8px;">Check In</button>
                                ` : !hasCheckout ? `
                                    <button class="btn btn-sm btn-danger" data-action="checkout" data-emp="${emp.id}"
                                        style="font-size:0.65rem;padding:4px 8px;">Check Out</button>
                                ` : `
                                    <span class="badge badge-success" style="font-size:0.6rem;">✓ Selesai</span>
                                `}
                            </div>
                        </div>
                    `;
                }).join('')}
                ${emps.length > 6 ? `<p class="text-muted" style="font-size:0.7rem;text-align:center;">+${emps.length - 6} karyawan lainnya</p>` : ''}
            </div>
        `;
    },

    /**
     * Render daftar anggota tim
     */
    _renderTeamMemberList: function() {
        const emps = this._state.employees;
        const checkins = this._state.checkins;

        if (emps.length === 0) {
            return '<p class="text-muted" style="font-size:0.8rem;">Belum ada data karyawan</p>';
        }

        const statusBadgeMap = {
            'aktif': 'badge-success',
            'cuti': 'badge-warning',
            'sakit': 'badge-error',
            'dinas luar': 'badge-info',
            'nonaktif': 'badge-error'
        };

        return emps.map(emp => {
            const ci = checkins[emp.id];
            const todayStatus = ci ? (ci.check_out ? 'Selesai' : ci.check_in ? 'Hadir' : '-') : (emp.status === 'cuti' || emp.status === 'sakit' ? emp.status.charAt(0).toUpperCase() + emp.status.slice(1) : '-');
            const badgeClass = statusBadgeMap[emp.status] || 'badge-info';

            return `
                <div class="glass-light" style="padding:10px 12px;border-radius:var(--radius-sm);display:flex;gap:10px;align-items:center;">
                    <div style="width:32px;height:32px;border-radius:50%;background:var(--accent-dim);display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:600;color:var(--accent);flex-shrink:0;">
                        ${emp.nama.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div style="flex:1;min-width:0;">
                        <div style="font-size:0.8rem;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${emp.nama}</div>
                        <div class="text-muted" style="font-size:0.65rem;">${emp.jabatan} • ${emp.divisi}</div>
                    </div>
                    <div style="text-align:right;flex-shrink:0;">
                        <span class="badge ${badgeClass}" style="font-size:0.6rem;">${todayStatus}</span>
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * Render bar chart performa mingguan (CSS only)
     */
    _renderWeeklyChart: function() {
        const data = this._state.weeklyData;
        if (data.length === 0) {
            return '<p class="text-muted" style="font-size:0.8rem;">Data mingguan belum tersedia</p>';
        }

        const maxCount = Math.max(...data.map(d => d.count), 1);

        return `
            <div style="display:flex;align-items:flex-end;gap:8px;height:140px;padding-top:20px;">
                ${data.map(d => {
                    const heightPct = maxCount > 0 ? (d.count / maxCount) * 100 : 0;
                    const isToday = d.date === new Date().toISOString().split('T')[0];
                    const barColor = isToday ? 'var(--accent)' : 'rgba(0,212,255,0.4)';
                    return `
                        <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">
                            <span style="font-size:0.65rem;font-weight:600;color:${isToday ? 'var(--accent)' : 'var(--text-secondary)'};">${d.count}</span>
                            <div style="width:100%;height:${Math.max(heightPct, 4)}%;background:${barColor};border-radius:4px 4px 0 0;transition:height 0.3s ease;min-height:4px;"></div>
                            <span style="font-size:0.65rem;color:${isToday ? 'var(--accent)' : 'var(--text-muted)'};font-weight:${isToday ? '700' : '400'};">${d.day}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    // ============================================================
    // CHECK-IN / CHECK-OUT
    // ============================================================

    _handleCheckin: async function(empId) {
        try {
            if (!empId) return;

            const now = new Date();
            const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

            if (!this._state.checkins[empId]) {
                this._state.checkins[empId] = {};
            }
            this._state.checkins[empId].check_in = timeStr;

            await this._saveCheckins();

            // Tambahkan aktivitas check-in
            const emp = this._state.employees.find(e => e.id === empId);
            await this._addActivityEntry({
                karyawan: emp ? emp.nama : empId,
                kegiatan: 'Check-in',
                kategori: 'Lainnya',
                catatan: '',
                lembur: false
            });

            this._refreshContent();
            this._showToast(`Check-in berhasil: ${emp ? emp.nama : empId} (${timeStr})`, 'success');
        } catch (e) {
            console.error('[Team] Gagal check-in:', e);
            this._showToast('Gagal melakukan check-in', 'error');
        }
    },

    _handleCheckout: async function(empId) {
        try {
            if (!empId) return;

            const now = new Date();
            const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

            if (!this._state.checkins[empId]) {
                this._state.checkins[empId] = {};
            }
            this._state.checkins[empId].check_out = timeStr;

            await this._saveCheckins();

            // Tambahkan aktivitas check-out
            const emp = this._state.employees.find(e => e.id === empId);
            const checkinTime = this._state.checkins[empId].check_in;
            const isOvertime = this._isOvertime(checkinTime, timeStr);

            await this._addActivityEntry({
                karyawan: emp ? emp.nama : empId,
                kegiatan: `Check-out${isOvertime ? ' (Lembur)' : ''}`,
                kategori: 'Lainnya',
                catatan: isOvertime ? 'Melewati jam kerja normal' : '',
                lembur: isOvertime
            });

            this._refreshContent();
            this._showToast(`Check-out berhasil: ${emp ? emp.nama : empId} (${timeStr})`, 'success');
        } catch (e) {
            console.error('[Team] Gagal check-out:', e);
            this._showToast('Gagal melakukan check-out', 'error');
        }
    },

    /**
     * Cek apakah waktu checkout menunjukkan lembur (> 8 jam kerja atau > 17:00)
     */
    _isOvertime: function(checkinTime, checkoutTime) {
        try {
            if (!checkinTime || !checkoutTime) return false;
            const [ciH, ciM] = checkinTime.split(':').map(Number);
            const [coH, coM] = checkoutTime.split(':').map(Number);
            const diffMinutes = (coH * 60 + coM) - (ciH * 60 + ciM);
            // Lembur jika kerja > 9 jam (8 jam kerja + 1 jam istirahat)
            return diffMinutes > 540;
        } catch (e) {
            return false;
        }
    },

    // ============================================================
    // ADD ACTIVITY
    // ============================================================

    _addActivityEntry: async function(activityData) {
        try {
            const activity = {
                id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
                karyawan: activityData.karyawan || '',
                kegiatan: activityData.kegiatan || '',
                kategori: activityData.kategori || 'Lainnya',
                catatan: activityData.catatan || '',
                lembur: activityData.lembur || false,
                timestamp: new Date().toISOString()
            };

            this._state.activities.push(activity);
            await this._saveActivities();
            return activity;
        } catch (e) {
            console.error('[Team] Gagal menambah aktivitas:', e);
            return null;
        }
    },

    /**
     * Tampilkan modal tambah aktivitas
     */
    _showAddActivityModal: function() {
        const modal = document.getElementById('modal-overlay');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');
        const footer = document.getElementById('modal-footer');
        if (!modal || !body) return;

        if (title) title.textContent = '➕ Tambah Aktivitas';

        body.innerHTML = `
            <form id="team-form-activity" style="display:flex;flex-direction:column;gap:14px;">
                <div>
                    <label class="label-glass">Karyawan *</label>
                    <select name="karyawan" class="select-glass" required>
                        <option value="">Pilih Karyawan</option>
                        ${this._state.employees.map(e => `<option value="${e.nama}">${e.nama} (${e.jabatan})</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="label-glass">Kegiatan *</label>
                    <input type="text" name="kegiatan" class="input-glass"
                        placeholder="Deskripsi kegiatan yang dilakukan" required>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div>
                        <label class="label-glass">Kategori *</label>
                        <select name="kategori" class="select-glass" required>
                            <option value="">Pilih Kategori</option>
                            ${this.KATEGORI_OPTIONS.map(k => `<option value="${k}">${k}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="label-glass">Lembur</label>
                        <select name="lembur" class="select-glass">
                            <option value="false">Tidak</option>
                            <option value="true">Ya</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label class="label-glass">Catatan</label>
                    <textarea name="catatan" class="textarea-glass"
                        placeholder="Catatan tambahan (opsional)" rows="3"></textarea>
                </div>
            </form>
        `;

        footer.innerHTML = `
            <button class="btn btn-sm" id="team-modal-cancel">Batal</button>
            <button class="btn btn-accent btn-sm" id="team-modal-submit">Simpan</button>
        `;

        modal.classList.remove('hidden');

        const cancelBtn = document.getElementById('team-modal-cancel');
        const submitBtn = document.getElementById('team-modal-submit');
        if (cancelBtn) cancelBtn.addEventListener('click', () => this._closeModal());
        if (submitBtn) submitBtn.addEventListener('click', () => this._handleAddActivity());
    },

    _handleAddActivity: async function() {
        try {
            const form = document.getElementById('team-form-activity');
            if (!form) return;

            const karyawan = form.karyawan.value.trim();
            const kegiatan = form.kegiatan.value.trim();
            const kategori = form.kategori.value;
            const lembur = form.lembur.value === 'true';
            const catatan = form.catatan.value.trim();

            // Validasi field wajib
            const errors = {};
            if (!karyawan) errors.karyawan = 'Karyawan wajib dipilih';
            if (!kegiatan) errors.kegiatan = 'Kegiatan wajib diisi';
            if (!kategori) errors.kategori = 'Kategori wajib dipilih';

            if (Object.keys(errors).length > 0) {
                for (const [field, msg] of Object.entries(errors)) {
                    const input = form.querySelector(`[name="${field}"]`);
                    if (input) {
                        input.classList.add('input-error');
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

            const activity = await this._addActivityEntry({
                karyawan, kegiatan, kategori, catatan, lembur
            });

            if (activity) {
                this._closeModal();
                // Reload data mingguan jika hari ini
                await this._loadWeeklyData();
                this._refreshContent();
                this._showToast('Aktivitas berhasil dicatat', 'success');
            }
        } catch (e) {
            console.error('[Team] Gagal menambah aktivitas:', e);
            this._showToast('Gagal menambah aktivitas', 'error');
        }
    },

    // ============================================================
    // CONTENT REFRESH
    // ============================================================

    _refreshContent: function() {
        // Update stats
        const stats = this._calculateTodayStats();
        const statTotal = document.getElementById('team-stat-total');
        const statHadir = document.getElementById('team-stat-hadir');
        const statCuti = document.getElementById('team-stat-cuti');
        const statLembur = document.getElementById('team-stat-lembur');
        if (statTotal) statTotal.textContent = stats.total;
        if (statHadir) statHadir.textContent = stats.hadir;
        if (statCuti) statCuti.textContent = stats.cutiSakit;
        if (statLembur) statLembur.textContent = stats.lembur;

        // Update timeline
        const timeline = document.getElementById('team-timeline');
        if (timeline) timeline.innerHTML = this._renderTimeline();

        // Update check-in area
        const checkinArea = document.getElementById('team-checkin-area');
        if (checkinArea) checkinArea.innerHTML = this._renderCheckinArea();

        // Update team member list
        const memberList = document.getElementById('team-member-list');
        if (memberList) memberList.innerHTML = this._renderTeamMemberList();

        // Re-attach delegated event listeners (checkin area)
        if (checkinArea) {
            checkinArea.addEventListener('click', (e) => {
                const btn = e.target.closest('[data-action]');
                if (!btn) return;
                const action = btn.getAttribute('data-action');
                const empId = btn.getAttribute('data-emp');
                if (action === 'checkin') this._handleCheckin(empId);
                else if (action === 'checkout') this._handleCheckout(empId);
            });
        }
    },

    // ============================================================
    // UTILITY
    // ============================================================

    _closeModal: function() {
        const modal = document.getElementById('modal-overlay');
        if (modal) modal.classList.add('hidden');
    },

    _showToast: function(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `<span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
};

console.log('[Team] Modul team dimuat ✓');
