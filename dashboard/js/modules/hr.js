/**
 * ============================================================
 * HR & PAYROLL — Modul Dashboard PT Yoga Wibawa Mandiri
 * ============================================================
 *
 * Modul ini menangani:
 * - Manajemen data karyawan (CRUD)
 * - Absensi digital (check-in/out harian)
 * - Pengajuan cuti & lembur dengan workflow persetujuan
 * - Ringkasan payroll: gaji_pokok + tunjangan - potongan = gaji_bersih
 * - Smart Input suara: "Tambah karyawan Ahmad, jabatan operator, divisi produksi"
 *
 * KV Pattern:
 *   ywm:hr:employee:EMP-001   — Data karyawan per ID
 *   ywm:hr:index:all          — Index seluruh ID karyawan
 *   ywm:hr:attendance:{date}  — Data absensi per tanggal (YYYY-MM-DD)
 *   ywm:hr:leave:{id}         — Data pengajuan cuti/lembur per ID
 *
 * @version 1.0.0
 * @author YWM Development Team
 */

window.YWM = window.YWM || {};
window.YWM.Modules = window.YWM.Modules || {};

YWM.Modules.hr = {
    title: 'HR & Payroll',

    // ============================================================
    // DATA LAYER — Wrapper YWM.Data dengan fallback ke puter.kv
    // ============================================================

    /** Akses data dengan fallback jika YWM.Data belum tersedia */
    async _get(key) {
        try {
            if (window.YWM && window.YWM.Data && typeof YWM.Data.get === 'function') {
                return await YWM.Data.get(key);
            }
            if (typeof puter !== 'undefined' && puter.kv) {
                const raw = await puter.kv.get(key);
                return raw ? JSON.parse(raw) : null;
            }
        } catch (err) {
            console.warn('[HR] Gagal membaca KV:', key, err.message);
        }
        return null;
    },

    /** Simpan data dengan fallback */
    async _set(key, value) {
        try {
            if (window.YWM && window.YWM.Data && typeof YWM.Data.set === 'function') {
                await YWM.Data.set(key, value);
                return;
            }
            if (typeof puter !== 'undefined' && puter.kv) {
                await puter.kv.set(key, JSON.stringify(value));
                return;
            }
        } catch (err) {
            console.warn('[HR] Gagal menyimpan KV:', key, err.message);
        }
    },

    /** Simpan data dengan timestamp otomatis */
    async _setWithTimestamp(key, value) {
        const record = { ...value, updatedAt: new Date().toISOString() };
        if (!record.createdAt) record.createdAt = record.updatedAt;
        await this._set(key, record);
        try {
            if (window.YWM && window.YWM.Data && typeof YWM.Data.addAuditLog === 'function') {
                await YWM.Data.addAuditLog('hr', 'set', key);
            }
        } catch (_) { /* abaikan */ }
    },

    // ============================================================
    // HELPERS
    // ============================================================

    /** Generate ID karyawan berikutnya */
    async _nextEmployeeId() {
        const index = (await this._get('ywm:hr:index:all')) || [];
        let max = 0;
        index.forEach(id => {
            const num = parseInt(id.replace('EMP-', ''), 10);
            if (num > max) max = num;
        });
        return 'EMP-' + String(max + 1).padStart(3, '0');
    },

    /** Generate ID cuti/lembur */
    _nextLeaveId() {
        return 'LV-' + Date.now().toString(36).toUpperCase();
    },

    /** Format angka ke Rupiah */
    _rp(val) {
        if (val === null || val === undefined || isNaN(val)) return 'Rp 0';
        return 'Rp ' + Number(val).toLocaleString('id-ID');
    },

    /** Tanggal hari ini YYYY-MM-DD */
    _today() {
        return new Date().toISOString().split('T')[0];
    },

    /** Daftar divisi valid */
    _divisions: ['Produksi', 'Maintenance', 'QC', 'HSE', 'Keuangan', 'HR', 'Management'],

    /** Daftar status karyawan valid */
    _statuses: ['Aktif', 'Cuti', 'Nonaktif'],

    // ============================================================
    // RENDER — Tampilan utama modul
    // ============================================================

    async render() {
        const employees = await this._loadEmployees();
        const kpi = this._calcKPI(employees);
        const todayAttendance = await this._get('ywm:hr:attendance:' + this._today()) || {};
        const pendingLeaves = await this._loadPendingLeaves();

        return `
        <div class="module-hr animate-fade-in">
            <!-- Header -->
            <div class="module-header" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
                <h2 style="font-size:1.4rem;font-weight:700;">${this.title}</h2>
                <div style="display:flex;gap:8px;">
                    <button class="btn btn-accent btn-sm" id="hr-btn-add">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Tambah Karyawan
                    </button>
                    <button class="btn btn-sm glass" id="hr-btn-voice" title="Input Suara">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/></svg>
                        Suara
                    </button>
                </div>
            </div>

            <!-- KPI Row -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-bottom:24px;">
                <div class="glass" style="padding:16px;border-radius:var(--radius-md);">
                    <div class="text-muted" style="font-size:0.72rem;text-transform:uppercase;letter-spacing:0.5px;">Total Karyawan</div>
                    <div style="font-size:1.6rem;font-weight:700;margin-top:4px;" class="text-accent">${kpi.total}</div>
                </div>
                <div class="glass" style="padding:16px;border-radius:var(--radius-md);">
                    <div class="text-muted" style="font-size:0.72rem;text-transform:uppercase;letter-spacing:0.5px;">Hadir Hari Ini</div>
                    <div style="font-size:1.6rem;font-weight:700;margin-top:4px;" class="text-success">${kpi.hadir}</div>
                </div>
                <div class="glass" style="padding:16px;border-radius:var(--radius-md);">
                    <div class="text-muted" style="font-size:0.72rem;text-transform:uppercase;letter-spacing:0.5px;">Cuti Pending</div>
                    <div style="font-size:1.6rem;font-weight:700;margin-top:4px;" class="text-warning">${kpi.cutiPending}</div>
                </div>
                <div class="glass" style="padding:16px;border-radius:var(--radius-md);">
                    <div class="text-muted" style="font-size:0.72rem;text-transform:uppercase;letter-spacing:0.5px;">Gaji Bulan Ini</div>
                    <div style="font-size:1.6rem;font-weight:700;margin-top:4px;" class="text-accent">${this._rp(kpi.gajiBulanIni)}</div>
                </div>
            </div>

            <!-- Tab Navigation -->
            <div style="display:flex;gap:6px;margin-bottom:18px;flex-wrap:wrap;">
                <button class="btn btn-sm btn-accent hr-tab-btn" data-tab="employees">Daftar Karyawan</button>
                <button class="btn btn-sm glass hr-tab-btn" data-tab="attendance">Absensi Digital</button>
                <button class="btn btn-sm glass hr-tab-btn" data-tab="leave">Pengajuan Cuti/Lembur</button>
                <button class="btn btn-sm glass hr-tab-btn" data-tab="payroll">Payroll Summary</button>
            </div>

            <!-- Tab: Daftar Karyawan -->
            <div id="hr-tab-employees" class="hr-tab-content">
                ${this._renderEmployeeTable(employees)}
            </div>

            <!-- Tab: Absensi Digital -->
            <div id="hr-tab-attendance" class="hr-tab-content" style="display:none;">
                ${this._renderAttendance(employees, todayAttendance)}
            </div>

            <!-- Tab: Pengajuan Cuti/Lembur -->
            <div id="hr-tab-leave" class="hr-tab-content" style="display:none;">
                ${this._renderLeaveSection(pendingLeaves)}
            </div>

            <!-- Tab: Payroll Summary -->
            <div id="hr-tab-payroll" class="hr-tab-content" style="display:none;">
                ${this._renderPayroll(employees)}
            </div>
        </div>`;
    },

    // ============================================================
    // SUB-RENDER — Komponen tampilan
    // ============================================================

    /** Render tabel daftar karyawan */
    _renderEmployeeTable(employees) {
        if (!employees || employees.length === 0) {
            return `<div class="glass" style="padding:40px;text-align:center;">
                <p class="text-muted">Belum ada data karyawan. Klik "Tambah Karyawan" untuk memulai.</p>
            </div>`;
        }
        let rows = employees.map(emp => {
            const statusClass = emp.status === 'Aktif' ? 'badge-success' : emp.status === 'Cuti' ? 'badge-warning' : 'badge-error';
            return `<tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
                <td style="padding:10px 8px;font-size:0.8rem;" class="text-accent">${emp.id}</td>
                <td style="padding:10px 8px;font-size:0.85rem;font-weight:500;">${emp.nama}</td>
                <td style="padding:10px 8px;font-size:0.8rem;">${emp.jabatan}</td>
                <td style="padding:10px 8px;font-size:0.8rem;">${emp.divisi}</td>
                <td style="padding:10px 8px;"><span class="badge ${statusClass}">${emp.status}</span></td>
                <td style="padding:10px 8px;">
                    <button class="btn btn-sm glass hr-btn-edit" data-id="${emp.id}" title="Edit">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="btn btn-sm btn-danger hr-btn-del" data-id="${emp.id}" title="Hapus" style="margin-left:4px;">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                    </button>
                </td>
            </tr>`;
        }).join('');

        return `
        <div class="glass" style="overflow-x:auto;border-radius:var(--radius-md);">
            <table style="width:100%;border-collapse:collapse;">
                <thead>
                    <tr style="border-bottom:1px solid rgba(255,255,255,0.12);">
                        <th style="padding:12px 8px;text-align:left;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.5px;" class="text-muted">ID</th>
                        <th style="padding:12px 8px;text-align:left;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.5px;" class="text-muted">Nama</th>
                        <th style="padding:12px 8px;text-align:left;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.5px;" class="text-muted">Jabatan</th>
                        <th style="padding:12px 8px;text-align:left;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.5px;" class="text-muted">Divisi</th>
                        <th style="padding:12px 8px;text-align:left;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.5px;" class="text-muted">Status</th>
                        <th style="padding:12px 8px;text-align:left;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.5px;" class="text-muted">Aksi</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>`;
    },

    /** Render absensi digital */
    _renderAttendance(employees, todayAttendance) {
        const today = this._today();
        const activeEmps = employees.filter(e => e.status === 'Aktif');
        if (activeEmps.length === 0) {
            return `<div class="glass" style="padding:40px;text-align:center;">
                <p class="text-muted">Tidak ada karyawan aktif untuk dicatat absensinya.</p>
            </div>`;
        }
        let rows = activeEmps.map(emp => {
            const att = todayAttendance[emp.id] || {};
            return `<tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
                <td style="padding:10px 8px;font-size:0.85rem;font-weight:500;">${emp.nama}</td>
                <td style="padding:10px 8px;font-size:0.8rem;" class="text-muted">${emp.divisi}</td>
                <td style="padding:10px 8px;">
                    <input type="time" class="input-glass hr-att-checkin" data-id="${emp.id}"
                        value="${att.checkIn || ''}" style="padding:6px 10px;font-size:0.8rem;width:120px;">
                </td>
                <td style="padding:10px 8px;">
                    <input type="time" class="input-glass hr-att-checkout" data-id="${emp.id}"
                        value="${att.checkOut || ''}" style="padding:6px 10px;font-size:0.8rem;width:120px;">
                </td>
                <td style="padding:10px 8px;">
                    <span class="badge ${att.checkIn ? 'badge-success' : 'badge-info'}">${att.checkIn ? 'Hadir' : 'Belum'}</span>
                </td>
            </tr>`;
        }).join('');

        return `
        <div style="margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;">
            <h3 style="font-size:1rem;">Absensi Tanggal: <span class="text-accent">${today}</span></h3>
            <button class="btn btn-accent btn-sm" id="hr-btn-save-attendance">Simpan Absensi</button>
        </div>
        <div class="glass" style="overflow-x:auto;border-radius:var(--radius-md);">
            <table style="width:100%;border-collapse:collapse;">
                <thead>
                    <tr style="border-bottom:1px solid rgba(255,255,255,0.12);">
                        <th style="padding:12px 8px;text-align:left;font-size:0.72rem;text-transform:uppercase;" class="text-muted">Nama</th>
                        <th style="padding:12px 8px;text-align:left;font-size:0.72rem;text-transform:uppercase;" class="text-muted">Divisi</th>
                        <th style="padding:12px 8px;text-align:left;font-size:0.72rem;text-transform:uppercase;" class="text-muted">Check-In</th>
                        <th style="padding:12px 8px;text-align:left;font-size:0.72rem;text-transform:uppercase;" class="text-muted">Check-Out</th>
                        <th style="padding:12px 8px;text-align:left;font-size:0.72rem;text-transform:uppercase;" class="text-muted">Status</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>`;
    },

    /** Render bagian cuti/lembur */
    _renderLeaveSection(pendingLeaves) {
        let leaveRows = '';
        if (pendingLeaves.length > 0) {
            leaveRows = pendingLeaves.map(lv => {
                const statusBadge = lv.status === 'Pending' ? 'badge-warning' : lv.status === 'Disetujui' ? 'badge-success' : 'badge-error';
                return `<tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
                    <td style="padding:10px 8px;font-size:0.8rem;" class="text-accent">${lv.id}</td>
                    <td style="padding:10px 8px;font-size:0.85rem;">${lv.namaKaryawan}</td>
                    <td style="padding:10px 8px;"><span class="badge badge-info">${lv.tipe}</span></td>
                    <td style="padding:10px 8px;font-size:0.8rem;">${lv.tanggalMulai} s/d ${lv.tanggalSelesai}</td>
                    <td style="padding:10px 8px;"><span class="badge ${statusBadge}">${lv.status}</span></td>
                    <td style="padding:10px 8px;">
                        ${lv.status === 'Pending' ? `
                        <button class="btn btn-sm btn-accent hr-btn-approve" data-id="${lv.id}">Setujui</button>
                        <button class="btn btn-sm btn-danger hr-btn-reject" data-id="${lv.id}" style="margin-left:4px;">Tolak</button>
                        ` : '<span class="text-muted" style="font-size:0.75rem;">—</span>'}
                    </td>
                </tr>`;
            }).join('');
        } else {
            leaveRows = `<tr><td colspan="6" style="padding:24px;text-align:center;" class="text-muted">Tidak ada pengajuan cuti/lembur</td></tr>`;
        }

        return `
        <div style="margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;">
            <h3 style="font-size:1rem;">Pengajuan Cuti & Lembur</h3>
            <button class="btn btn-accent btn-sm" id="hr-btn-add-leave">Ajukan Cuti/Lembur</button>
        </div>
        <div class="glass" style="overflow-x:auto;border-radius:var(--radius-md);">
            <table style="width:100%;border-collapse:collapse;">
                <thead>
                    <tr style="border-bottom:1px solid rgba(255,255,255,0.12);">
                        <th style="padding:12px 8px;text-align:left;font-size:0.72rem;text-transform:uppercase;" class="text-muted">ID</th>
                        <th style="padding:12px 8px;text-align:left;font-size:0.72rem;text-transform:uppercase;" class="text-muted">Karyawan</th>
                        <th style="padding:12px 8px;text-align:left;font-size:0.72rem;text-transform:uppercase;" class="text-muted">Tipe</th>
                        <th style="padding:12px 8px;text-align:left;font-size:0.72rem;text-transform:uppercase;" class="text-muted">Periode</th>
                        <th style="padding:12px 8px;text-align:left;font-size:0.72rem;text-transform:uppercase;" class="text-muted">Status</th>
                        <th style="padding:12px 8px;text-align:left;font-size:0.72rem;text-transform:uppercase;" class="text-muted">Aksi</th>
                    </tr>
                </thead>
                <tbody>${leaveRows}</tbody>
            </table>
        </div>`;
    },

    /** Render payroll summary */
    _renderPayroll(employees) {
        const activeEmps = employees.filter(e => e.status === 'Aktif');
        if (activeEmps.length === 0) {
            return `<div class="glass" style="padding:40px;text-align:center;">
                <p class="text-muted">Tidak ada karyawan aktif untuk payroll.</p>
            </div>`;
        }
        let totalGajiBersih = 0;
        let rows = activeEmps.map(emp => {
            const pokok = Number(emp.gaji_pokok) || 0;
            const tunjangan = Number(emp.tunjangan) || 0;
            const potongan = Number(emp.potongan) || 0;
            const bersih = pokok + tunjangan - potongan;
            totalGajiBersih += bersih;
            return `<tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
                <td style="padding:10px 8px;font-size:0.85rem;font-weight:500;">${emp.nama}</td>
                <td style="padding:10px 8px;font-size:0.8rem;">${emp.jabatan}</td>
                <td style="padding:10px 8px;font-size:0.8rem;text-align:right;">${this._rp(pokok)}</td>
                <td style="padding:10px 8px;font-size:0.8rem;text-align:right;" class="text-success">+ ${this._rp(tunjangan)}</td>
                <td style="padding:10px 8px;font-size:0.8rem;text-align:right;" class="text-error">- ${this._rp(potongan)}</td>
                <td style="padding:10px 8px;font-size:0.85rem;text-align:right;font-weight:600;" class="text-accent">${this._rp(bersih)}</td>
            </tr>`;
        }).join('');

        return `
        <div style="margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;">
            <h3 style="font-size:1rem;">Payroll Bulan Ini</h3>
            <div class="text-accent" style="font-size:1.1rem;font-weight:700;">Total: ${this._rp(totalGajiBersih)}</div>
        </div>
        <div class="glass" style="overflow-x:auto;border-radius:var(--radius-md);">
            <table style="width:100%;border-collapse:collapse;">
                <thead>
                    <tr style="border-bottom:1px solid rgba(255,255,255,0.12);">
                        <th style="padding:12px 8px;text-align:left;font-size:0.72rem;text-transform:uppercase;" class="text-muted">Nama</th>
                        <th style="padding:12px 8px;text-align:left;font-size:0.72rem;text-transform:uppercase;" class="text-muted">Jabatan</th>
                        <th style="padding:12px 8px;text-align:right;font-size:0.72rem;text-transform:uppercase;" class="text-muted">Gaji Pokok</th>
                        <th style="padding:12px 8px;text-align:right;font-size:0.72rem;text-transform:uppercase;" class="text-muted">Tunjangan</th>
                        <th style="padding:12px 8px;text-align:right;font-size:0.72rem;text-transform:uppercase;" class="text-muted">Potongan</th>
                        <th style="padding:12px 8px;text-align:right;font-size:0.72rem;text-transform:uppercase;" class="text-muted">Gaji Bersih</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
                <tfoot>
                    <tr style="border-top:2px solid rgba(255,255,255,0.15);">
                        <td colspan="5" style="padding:12px 8px;font-weight:700;text-align:right;">TOTAL GAJI BERSIH</td>
                        <td style="padding:12px 8px;font-weight:700;text-align:right;font-size:1rem;" class="text-accent">${this._rp(totalGajiBersih)}</td>
                    </tr>
                </tfoot>
            </table>
        </div>`;
    },

    // ============================================================
    // KPI CALCULATION
    // ============================================================

    _calcKPI(employees) {
        const total = employees.length;
        const aktif = employees.filter(e => e.status === 'Aktif').length;
        const hadir = aktif; // Akan diupdate berdasarkan absensi
        const cutiPending = 0; // Akan dihitung dari data leave
        const gajiBulanIni = employees
            .filter(e => e.status === 'Aktif')
            .reduce((sum, e) => {
                const pokok = Number(e.gaji_pokok) || 0;
                const tunjangan = Number(e.tunjangan) || 0;
                const potongan = Number(e.potongan) || 0;
                return sum + pokok + tunjangan - potongan;
            }, 0);
        return { total, hadir, cutiPending, gajiBulanIni };
    },

    // ============================================================
    // DATA LOADING
    // ============================================================

    /** Muat semua data karyawan */
    async _loadEmployees() {
        try {
            const index = (await this._get('ywm:hr:index:all')) || [];
            const employees = [];
            for (const id of index) {
                const emp = await this._get('ywm:hr:employee:' + id);
                if (emp) employees.push(emp);
            }
            return employees;
        } catch (err) {
            console.warn('[HR] Gagal memuat karyawan:', err.message);
            return [];
        }
    },

    /** Muat semua pengajuan cuti/lembur yang pending */
    async _loadPendingLeaves() {
        try {
            const index = (await this._get('ywm:hr:leave:index')) || [];
            const leaves = [];
            for (const id of index) {
                const lv = await this._get('ywm:hr:leave:' + id);
                if (lv) leaves.push(lv);
            }
            // Urutkan: pending di atas
            leaves.sort((a, b) => (a.status === 'Pending' ? -1 : 1));
            return leaves;
        } catch (err) {
            console.warn('[HR] Gagal memuat cuti/lembur:', err.message);
            return [];
        }
    },

    // ============================================================
    // CRUD KARYAWAN
    // ============================================================

    /** Simpan karyawan baru atau update */
    async _saveEmployee(empData, isEdit = false) {
        try {
            // Validasi field wajib
            if (!empData.nama || empData.nama.trim() === '') throw new Error('Nama wajib diisi');
            if (!empData.jabatan || empData.jabatan.trim() === '') throw new Error('Jabatan wajib diisi');
            if (!empData.divisi || !this._divisions.includes(empData.divisi)) throw new Error('Divisi tidak valid');
            if (!empData.status || !this._statuses.includes(empData.status)) throw new Error('Status tidak valid');

            let id = empData.id;
            let index = (await this._get('ywm:hr:index:all')) || [];

            if (!isEdit) {
                // Buat ID baru
                id = await this._nextEmployeeId();
                index.push(id);
                await this._set('ywm:hr:index:all', index);
            }

            const record = {
                id,
                nama: empData.nama.trim(),
                jabatan: empData.jabatan.trim(),
                divisi: empData.divisi,
                gaji_pokok: Number(empData.gaji_pokok) || 0,
                tunjangan: Number(empData.tunjangan) || 0,
                potongan: Number(empData.potongan) || 0,
                telepon: empData.telepon || '',
                email: empData.email || '',
                alamat: empData.alamat || '',
                tanggal_masuk: empData.tanggal_masuk || this._today(),
                status: empData.status,
            };

            await this._setWithTimestamp('ywm:hr:employee:' + id, record);
            console.log('[HR] Karyawan disimpan:', id);
            return record;
        } catch (err) {
            console.error('[HR] Gagal menyimpan karyawan:', err.message);
            throw err;
        }
    },

    /** Hapus karyawan */
    async _deleteEmployee(id) {
        try {
            // Hapus data karyawan
            await this._set('ywm:hr:employee:' + id, null);
            // Update index
            let index = (await this._get('ywm:hr:index:all')) || [];
            index = index.filter(i => i !== id);
            await this._set('ywm:hr:index:all', index);
            console.log('[HR] Karyawan dihapus:', id);
        } catch (err) {
            console.error('[HR] Gagal menghapus karyawan:', err.message);
            throw err;
        }
    },

    // ============================================================
    // ABSENSI
    // ============================================================

    /** Simpan absensi harian */
    async _saveAttendance(attendanceData) {
        try {
            const key = 'ywm:hr:attendance:' + this._today();
            await this._setWithTimestamp(key, attendanceData);
            console.log('[HR] Absensi disimpan untuk', this._today());
        } catch (err) {
            console.error('[HR] Gagal menyimpan absensi:', err.message);
            throw err;
        }
    },

    // ============================================================
    // CUTI / LEMBUR
    // ============================================================

    /** Simpan pengajuan cuti/lembur */
    async _saveLeave(leaveData) {
        try {
            if (!leaveData.namaKaryawan) throw new Error('Nama karyawan wajib diisi');
            if (!leaveData.tipe) throw new Error('Tipe (Cuti/Lembur) wajib dipilih');
            if (!leaveData.tanggalMulai) throw new Error('Tanggal mulai wajib diisi');
            if (!leaveData.tanggalSelesai) throw new Error('Tanggal selesai wajib diisi');

            const id = this._nextLeaveId();
            let leaveIndex = (await this._get('ywm:hr:leave:index')) || [];
            leaveIndex.push(id);
            await this._set('ywm:hr:leave:index', leaveIndex);

            const record = {
                id,
                empId: leaveData.empId || '',
                namaKaryawan: leaveData.namaKaryawan,
                tipe: leaveData.tipe, // 'Cuti' atau 'Lembur'
                tanggalMulai: leaveData.tanggalMulai,
                tanggalSelesai: leaveData.tanggalSelesai,
                keterangan: leaveData.keterangan || '',
                status: 'Pending',
            };

            await this._setWithTimestamp('ywm:hr:leave:' + id, record);
            console.log('[HR] Pengajuan cuti/lembur disimpan:', id);
            return record;
        } catch (err) {
            console.error('[HR] Gagal menyimpan pengajuan cuti/lembur:', err.message);
            throw err;
        }
    },

    /** Update status pengajuan cuti/lembur */
    async _updateLeaveStatus(id, newStatus) {
        try {
            const leave = await this._get('ywm:hr:leave:' + id);
            if (!leave) throw new Error('Pengajuan tidak ditemukan');
            leave.status = newStatus; // 'Disetujui' atau 'Ditolak'
            await this._setWithTimestamp('ywm:hr:leave:' + id, leave);
            console.log('[HR] Status cuti/lembur diupdate:', id, newStatus);
        } catch (err) {
            console.error('[HR] Gagal update status cuti/lembur:', err.message);
            throw err;
        }
    },

    // ============================================================
    // MODAL — Form Tambah/Edit Karyawan
    // ============================================================

    _renderEmployeeForm(emp = null) {
        const isEdit = !!emp;
        const divOptions = this._divisions.map(d =>
            `<option value="${d}" ${emp && emp.divisi === d ? 'selected' : ''}>${d}</option>`
        ).join('');
        const statusOptions = this._statuses.map(s =>
            `<option value="${s}" ${emp && emp.status === s ? 'selected' : ''}>${s}</option>`
        ).join('');

        return `
        <form id="hr-employee-form">
            <input type="hidden" name="id" value="${emp ? emp.id : ''}">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
                <div style="grid-column:span 2;">
                    <label class="label-glass">Nama Lengkap *</label>
                    <input type="text" name="nama" class="input-glass" value="${emp ? emp.nama : ''}" placeholder="Nama lengkap karyawan" required>
                </div>
                <div>
                    <label class="label-glass">Jabatan *</label>
                    <input type="text" name="jabatan" class="input-glass" value="${emp ? emp.jabatan : ''}" placeholder="Contoh: Operator" required>
                </div>
                <div>
                    <label class="label-glass">Divisi *</label>
                    <select name="divisi" class="select-glass" required>
                        <option value="">Pilih Divisi</option>
                        ${divOptions}
                    </select>
                </div>
                <div>
                    <label class="label-glass">Gaji Pokok (Rp)</label>
                    <input type="number" name="gaji_pokok" class="input-glass" value="${emp ? emp.gaji_pokok : ''}" placeholder="0" min="0">
                </div>
                <div>
                    <label class="label-glass">Tunjangan (Rp)</label>
                    <input type="number" name="tunjangan" class="input-glass" value="${emp ? emp.tunjangan : ''}" placeholder="0" min="0">
                </div>
                <div>
                    <label class="label-glass">Potongan (Rp)</label>
                    <input type="number" name="potongan" class="input-glass" value="${emp ? emp.potongan : ''}" placeholder="0" min="0">
                </div>
                <div>
                    <label class="label-glass">Status *</label>
                    <select name="status" class="select-glass" required>
                        <option value="">Pilih Status</option>
                        ${statusOptions}
                    </select>
                </div>
                <div>
                    <label class="label-glass">Telepon</label>
                    <input type="tel" name="telepon" class="input-glass" value="${emp ? emp.telepon : ''}" placeholder="08xx">
                </div>
                <div>
                    <label class="label-glass">Email</label>
                    <input type="email" name="email" class="input-glass" value="${emp ? emp.email : ''}" placeholder="email@ywm.co.id">
                </div>
                <div>
                    <label class="label-glass">Tanggal Masuk</label>
                    <input type="date" name="tanggal_masuk" class="input-glass" value="${emp ? emp.tanggal_masuk : this._today()}">
                </div>
                <div style="grid-column:span 2;">
                    <label class="label-glass">Alamat</label>
                    <textarea name="alamat" class="textarea-glass" rows="2" placeholder="Alamat lengkap">${emp ? emp.alamat : ''}</textarea>
                </div>
            </div>
            <div style="margin-top:20px;display:flex;justify-content:flex-end;gap:10px;">
                <button type="button" class="btn glass" onclick="YWM.UI.closeModal()">Batal</button>
                <button type="submit" class="btn btn-accent">${isEdit ? 'Simpan Perubahan' : 'Tambah Karyawan'}</button>
            </div>
        </form>`;
    },

    /** Render form pengajuan cuti/lembur */
    _renderLeaveForm(employees) {
        const empOptions = employees
            .filter(e => e.status === 'Aktif')
            .map(e => `<option value="${e.id}">${e.nama} (${e.jabatan})</option>`)
            .join('');

        return `
        <form id="hr-leave-form">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
                <div style="grid-column:span 2;">
                    <label class="label-glass">Karyawan *</label>
                    <select name="empId" class="select-glass" id="hr-leave-empid" required>
                        <option value="">Pilih Karyawan</option>
                        ${empOptions}
                    </select>
                </div>
                <div>
                    <label class="label-glass">Tipe Pengajuan *</label>
                    <select name="tipe" class="select-glass" required>
                        <option value="">Pilih Tipe</option>
                        <option value="Cuti">Cuti</option>
                        <option value="Lembur">Lembur</option>
                    </select>
                </div>
                <div></div>
                <div>
                    <label class="label-glass">Tanggal Mulai *</label>
                    <input type="date" name="tanggalMulai" class="input-glass" required>
                </div>
                <div>
                    <label class="label-glass">Tanggal Selesai *</label>
                    <input type="date" name="tanggalSelesai" class="input-glass" required>
                </div>
                <div style="grid-column:span 2;">
                    <label class="label-glass">Keterangan</label>
                    <textarea name="keterangan" class="textarea-glass" rows="3" placeholder="Alasan cuti/lembur"></textarea>
                </div>
            </div>
            <div style="margin-top:20px;display:flex;justify-content:flex-end;gap:10px;">
                <button type="button" class="btn glass" onclick="YWM.UI.closeModal()">Batal</button>
                <button type="submit" class="btn btn-accent">Ajukan</button>
            </div>
        </form>`;
    },

    // ============================================================
    // SMART INPUT — Voice & Natural Language
    // ============================================================

    /** Proses input natural language untuk modul HR */
    async processSmartInput(text) {
        try {
            if (!text || text.trim().length === 0) return null;
            const lower = text.toLowerCase();

            // Deteksi: tambah karyawan
            if (lower.includes('tambah karyawan') || lower.includes('karyawan baru') || lower.includes('daftarkan')) {
                const parsed = await this._parseEmployeeFromText(text);
                if (parsed) {
                    const saved = await this._saveEmployee(parsed);
                    this._showToast('Karyawan berhasil ditambahkan: ' + saved.nama, 'success');
                    if (YWM.App && typeof YWM.App.refreshCurrentModule === 'function') {
                        await YWM.App.refreshCurrentModule();
                    }
                    return saved;
                }
            }

            // Deteksi: pengajuan cuti
            if (lower.includes('cuti') || lower.includes('lembur') || lower.includes('izin')) {
                this._showToast('Silakan gunakan form pengajuan cuti/lembur', 'info');
                return null;
            }

            // Fallback: gunakan AI parsing
            if (typeof puter !== 'undefined' && puter.ai) {
                const prompt = `Parse perintah HR berikut menjadi data karyawan JSON.
Perintah: "${text}"

Output JSON saja:
{
  "nama": "nama karyawan",
  "jabatan": "jabatan",
  "divisi": "Produksi|Maintenance|QC|HSE|Keuangan|HR|Management",
  "gaji_pokok": 0,
  "status": "Aktif"
}`;
                const resp = await puter.ai.chat(prompt, { model: 'gpt-4o-mini' });
                const jsonStr = typeof resp === 'string' ? resp : resp?.message?.content || '';
                const match = jsonStr.match(/\{[\s\S]*\}/);
                if (match) {
                    const parsed = JSON.parse(match[0]);
                    const saved = await this._saveEmployee(parsed);
                    this._showToast('Karyawan ditambahkan via AI: ' + saved.nama, 'success');
                    if (YWM.App && typeof YWM.App.refreshCurrentModule === 'function') {
                        await YWM.App.refreshCurrentModule();
                    }
                    return saved;
                }
            }

            this._showToast('Tidak dapat memproses perintah. Coba: "Tambah karyawan Ahmad, jabatan operator, divisi produksi"', 'warning');
            return null;
        } catch (err) {
            console.error('[HR] Smart input error:', err);
            this._showToast('Gagal memproses input: ' + err.message, 'error');
            return null;
        }
    },

    /** Parse teks sederhana untuk data karyawan tanpa AI */
    _parseEmployeeFromText(text) {
        const lower = text.toLowerCase();
        let nama = '', jabatan = '', divisi = '';

        // Ekstrak nama — setelah kata "karyawan"
        const namaMatch = text.match(/karyawan\s+([A-Za-z\s]+?)(?:,|\.|jabatan|divisi|$)/i);
        if (namaMatch) nama = namaMatch[1].trim();

        // Ekstrak jabatan
        const jabatanMatch = text.match(/jabatan\s+([A-Za-z\s]+?)(?:,|\.|divisi|$)/i);
        if (jabatanMatch) jabatan = jabatanMatch[1].trim();

        // Ekstrak divisi
        for (const d of this._divisions) {
            if (lower.includes(d.toLowerCase())) {
                divisi = d;
                break;
            }
        }

        if (!nama) return null;

        return {
            nama,
            jabatan: jabatan || 'Staff',
            divisi: divisi || 'Produksi',
            gaji_pokok: 0,
            status: 'Aktif'
        };
    },

    // ============================================================
    // TOAST NOTIFICATION HELPER
    // ============================================================

    _showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) { console.log('[HR Toast]', message); return; }
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => { toast.remove(); }, 4000);
    },

    // ============================================================
    // INIT — Event listeners
    // ============================================================

    async init() {
        const self = this;

        // --- Tab Navigation ---
        document.querySelectorAll('.hr-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                // Deaktifkan semua tab
                document.querySelectorAll('.hr-tab-btn').forEach(b => {
                    b.classList.remove('btn-accent');
                    b.classList.add('glass');
                });
                document.querySelectorAll('.hr-tab-content').forEach(c => c.style.display = 'none');
                // Aktifkan tab terpilih
                btn.classList.remove('glass');
                btn.classList.add('btn-accent');
                const tabId = 'hr-tab-' + btn.dataset.tab;
                const tabEl = document.getElementById(tabId);
                if (tabEl) tabEl.style.display = 'block';
            });
        });

        // --- Tambah Karyawan ---
        const addBtn = document.getElementById('hr-btn-add');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                self._openEmployeeModal();
            });
        }

        // --- Voice Input ---
        const voiceBtn = document.getElementById('hr-btn-voice');
        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => {
                self._startVoiceInput();
            });
        }

        // --- Edit Karyawan ---
        document.querySelectorAll('.hr-btn-edit').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                const emp = await self._get('ywm:hr:employee:' + id);
                if (emp) self._openEmployeeModal(emp);
            });
        });

        // --- Hapus Karyawan ---
        document.querySelectorAll('.hr-btn-del').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                if (await YWM.UI.confirm('Yakin ingin menghapus karyawan ' + id + '?')) {
                    try {
                        await self._deleteEmployee(id);
                        self._showToast('Karyawan ' + id + ' berhasil dihapus', 'success');
                        if (YWM.App && typeof YWM.App.refreshCurrentModule === 'function') {
                            await YWM.App.refreshCurrentModule();
                        }
                    } catch (err) {
                        self._showToast('Gagal menghapus: ' + err.message, 'error');
                    }
                }
            });
        });

        // --- Simpan Absensi ---
        const saveAttBtn = document.getElementById('hr-btn-save-attendance');
        if (saveAttBtn) {
            saveAttBtn.addEventListener('click', async () => {
                try {
                    const attendanceData = {};
                    document.querySelectorAll('.hr-att-checkin').forEach(input => {
                        const id = input.dataset.id;
                        if (!attendanceData[id]) attendanceData[id] = {};
                        attendanceData[id].checkIn = input.value;
                    });
                    document.querySelectorAll('.hr-att-checkout').forEach(input => {
                        const id = input.dataset.id;
                        if (!attendanceData[id]) attendanceData[id] = {};
                        attendanceData[id].checkOut = input.value;
                    });
                    await self._saveAttendance(attendanceData);
                    self._showToast('Absensi berhasil disimpan', 'success');
                } catch (err) {
                    self._showToast('Gagal menyimpan absensi: ' + err.message, 'error');
                }
            });
        }

        // --- Tambah Cuti/Lembur ---
        const addLeaveBtn = document.getElementById('hr-btn-add-leave');
        if (addLeaveBtn) {
            addLeaveBtn.addEventListener('click', async () => {
                const employees = await self._loadEmployees();
                self._openLeaveModal(employees);
            });
        }

        // --- Approve/Reject Cuti ---
        document.querySelectorAll('.hr-btn-approve').forEach(btn => {
            btn.addEventListener('click', async () => {
                try {
                    await self._updateLeaveStatus(btn.dataset.id, 'Disetujui');
                    self._showToast('Pengajuan disetujui', 'success');
                    if (YWM.App && typeof YWM.App.refreshCurrentModule === 'function') {
                        await YWM.App.refreshCurrentModule();
                    }
                } catch (err) {
                    self._showToast('Gagal: ' + err.message, 'error');
                }
            });
        });
        document.querySelectorAll('.hr-btn-reject').forEach(btn => {
            btn.addEventListener('click', async () => {
                try {
                    await self._updateLeaveStatus(btn.dataset.id, 'Ditolak');
                    self._showToast('Pengajuan ditolak', 'warning');
                    if (YWM.App && typeof YWM.App.refreshCurrentModule === 'function') {
                        await YWM.App.refreshCurrentModule();
                    }
                } catch (err) {
                    self._showToast('Gagal: ' + err.message, 'error');
                }
            });
        });
    },

    // ============================================================
    // MODAL HELPERS
    // ============================================================

    _openEmployeeModal(emp = null) {
        const isEdit = !!emp;
        const title = isEdit ? 'Edit Karyawan' : 'Tambah Karyawan';
        const formHtml = this._renderEmployeeForm(emp);

        if (window.YWM && window.YWM.UI && typeof YWM.UI.openModal === 'function') {
            YWM.UI.openModal(title, formHtml);
        } else {
            // Fallback: gunakan modal overlay langsung
            const overlay = document.getElementById('modal-overlay');
            const titleEl = document.getElementById('modal-title');
            const bodyEl = document.getElementById('modal-body');
            const footerEl = document.getElementById('modal-footer');
            if (overlay && titleEl && bodyEl) {
                titleEl.textContent = title;
                bodyEl.innerHTML = formHtml;
                if (footerEl) footerEl.style.display = 'none';
                overlay.classList.remove('hidden');
            }
        }

        // Attach form submit handler
        const self = this;
        setTimeout(() => {
            const form = document.getElementById('hr-employee-form');
            if (form) {
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const fd = new FormData(form);
                    const data = Object.fromEntries(fd.entries());
                    data.gaji_pokok = Number(data.gaji_pokok) || 0;
                    data.tunjangan = Number(data.tunjangan) || 0;
                    data.potongan = Number(data.potongan) || 0;

                    try {
                        await self._saveEmployee(data, isEdit);
                        self._showToast(isEdit ? 'Karyawan berhasil diupdate' : 'Karyawan berhasil ditambahkan', 'success');
                        if (window.YWM && window.YWM.UI && typeof YWM.UI.closeModal === 'function') {
                            YWM.UI.closeModal();
                        } else {
                            const overlay = document.getElementById('modal-overlay');
                            if (overlay) overlay.classList.add('hidden');
                        }
                        if (YWM.App && typeof YWM.App.refreshCurrentModule === 'function') {
                            await YWM.App.refreshCurrentModule();
                        }
                    } catch (err) {
                        self._showToast('Gagal menyimpan: ' + err.message, 'error');
                    }
                });
            }
        }, 100);
    },

    _openLeaveModal(employees) {
        const formHtml = this._renderLeaveForm(employees);
        if (window.YWM && window.YWM.UI && typeof YWM.UI.openModal === 'function') {
            YWM.UI.openModal('Ajukan Cuti/Lembur', formHtml);
        } else {
            const overlay = document.getElementById('modal-overlay');
            const titleEl = document.getElementById('modal-title');
            const bodyEl = document.getElementById('modal-body');
            const footerEl = document.getElementById('modal-footer');
            if (overlay && titleEl && bodyEl) {
                titleEl.textContent = 'Ajukan Cuti/Lembur';
                bodyEl.innerHTML = formHtml;
                if (footerEl) footerEl.style.display = 'none';
                overlay.classList.remove('hidden');
            }
        }

        const self = this;
        setTimeout(() => {
            const form = document.getElementById('hr-leave-form');
            if (form) {
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const fd = new FormData(form);
                    const data = Object.fromEntries(fd.entries());

                    // Cari nama karyawan dari empId
                    const emp = employees.find(e => e.id === data.empId);
                    if (emp) data.namaKaryawan = emp.nama;

                    try {
                        await self._saveLeave(data);
                        self._showToast('Pengajuan berhasil dikirim', 'success');
                        if (window.YWM && window.YWM.UI && typeof YWM.UI.closeModal === 'function') {
                            YWM.UI.closeModal();
                        } else {
                            const overlay = document.getElementById('modal-overlay');
                            if (overlay) overlay.classList.add('hidden');
                        }
                        if (YWM.App && typeof YWM.App.refreshCurrentModule === 'function') {
                            await YWM.App.refreshCurrentModule();
                        }
                    } catch (err) {
                        self._showToast('Gagal mengajukan: ' + err.message, 'error');
                    }
                });
            }
        }, 100);
    },

    // ============================================================
    // VOICE INPUT
    // ============================================================

    async _startVoiceInput() {
        if (window.YWMVoiceHandler) {
            this._showToast('Mendengarkan... Silakan bicara', 'info');
            try {
                const started = await YWMVoiceHandler.start();
                if (!started) {
                    this._showToast('Gagal memulai perekaman suara', 'error');
                }
            } catch (err) {
                this._showToast('Error voice input: ' + err.message, 'error');
            }
        } else {
            // Fallback: prompt manual
            const text = prompt('Masukkan perintah (contoh: "Tambah karyawan Ahmad, jabatan operator, divisi produksi"):');
            if (text) {
                await this.processSmartInput(text);
            }
        }
    }
};

console.log('[HR Module] Modul HR & Payroll dimuat ✓');
