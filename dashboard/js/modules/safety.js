/**
 * ============================================================
 * SAFETY & HSE MODULE
 * PT Yoga Wibawa Mandiri — Dashboard Pengantongan Semen Padang
 * ============================================================
 *
 * Modul ini menangani:
 * - Pencatatan dan pelaporan insiden (Insiden / Near Miss / Unsafe Act)
 * - Safety checklist inspeksi berbasis template
 * - Dashboard K3 (TRIR, LTIR, dsb.)
 * - Tracking corrective action dengan deadline
 *
 * KV Pattern:
 *   ywm:hse:incident:INC-2026-001  → data insiden individual
 *   ywm:hse:index:all               → index semua insiden ID
 *   ywm:hse:checklist:{id}          → data checklist inspeksi
 *
 * @version 1.0.0
 */

window.YWM = window.YWM || {};
window.YWM.Modules = window.YWM.Modules || {};

YWM.Modules.safety = {
    title: 'Safety & HSE',

    // ── Template checklist inspeksi ──
    CHECKLIST_TEMPLATES: {
        PPE: {
            label: 'Alat Pelindung Diri (APD)',
            items: [
                'Helmet keselamatan tersedia dan layak',
                'Safety shoes dikenakan semua pekerja',
                'Sarung tangan sesuai jenis pekerjaan',
                'Kacamata pelindung tersedia',
                'Ear plug/muff tersedia di area bising',
                'Respirator/masker tersedia di area berdebu',
                'Safety harness tersedia untuk work at height'
            ]
        },
        Housekeeping: {
            label: 'Housekeeping / Kerapihan',
            items: [
                'Lantai bersih, tidak licin, tidak ada tumpahan',
                'Lorong dan jalur evakuasi bebas hambatan',
                'Tempat sampah tersedia dan digunakan',
                'Alat kerja tersimpan rapi setelah digunakan',
                'Pencahayaan cukup di semua area kerja',
                'Ventilasi berfungsi baik'
            ]
        },
        FireSafety: {
            label: 'Keselamatan Kebakaran',
            items: [
                'APAR tersedia dan masa berlaku masih valid',
                'APAR tidak terhalang dan mudah dijangkau',
                'Hydrant berfungsi dan tekanan cukup',
                'Alarm kebakaran berfungsi',
                'Jalur evakuasi bertanda jelas',
                'Assembly point bertanda dan diketahui semua pekerja',
                'Drill kebakaran pernah dilakukan 6 bulan terakhir'
            ]
        },
        Electrical: {
            label: 'Kelistrikan',
            items: [
                'Panel listrik tertutup dan berlabel',
                'Kabel tidak ada yang terkelupas/rusak',
                'Grounding berfungsi baik',
                'Tidak ada kabel melintang di lantai',
                'MCB/RCD berfungsi baik',
                'Sambungan kabel tidak ada yang ilegal'
            ]
        },
        Mechanical: {
            label: 'Mekanikal',
            items: [
                'Guard/pelindung mesin terpasang',
                'Tombol emergency stop berfungsi',
                'Conveyor belt guard terpasang',
                'V-belt dan pulley terlindungi',
                'Tangga dan platform kerja dalam kondisi baik',
                'Label peringatan terpasang di area berbahaya',
                'Lockout/Tagout procedure tersedia'
            ]
        }
    },

    // ============================================================
    // DATA LAYER — Abstraksi akses data dengan fallback
    // ============================================================

    async _getData(key) {
        try {
            if (window.YWM && YWM.Data && typeof YWM.Data.get === 'function') {
                return await YWM.Data.get(key);
            }
            if (typeof puter !== 'undefined' && puter.kv) {
                const raw = await puter.kv.get(key);
                if (!raw) return null;
                try { return JSON.parse(raw); } catch { return raw; }
            }
            return null;
        } catch (err) {
            console.error('[HSE] Gagal mengambil data:', key, err);
            return null;
        }
    },

    async _setData(key, value) {
        try {
            if (window.YWM && YWM.Data && typeof YWM.Data.set === 'function') {
                await YWM.Data.set(key, value);
                return true;
            }
            if (typeof puter !== 'undefined' && puter.kv) {
                await puter.kv.set(key, typeof value === 'string' ? value : JSON.stringify(value));
                return true;
            }
            return false;
        } catch (err) {
            console.error('[HSE] Gagal menyimpan data:', key, err);
            return false;
        }
    },

    async _setDataWithTimestamp(key, value) {
        try {
            if (window.YWM && YWM.Data && typeof YWM.Data.setWithTimestamp === 'function') {
                await YWM.Data.setWithTimestamp(key, value);
                return true;
            }
            const data = typeof value === 'object' ? value : { _value: value };
            data.updatedAt = new Date().toISOString();
            return await this._setData(key, data);
        } catch (err) {
            console.error('[HSE] Gagal menyimpan data + timestamp:', key, err);
            return false;
        }
    },

    async _addAudit(action, recordId, details = {}) {
        try {
            if (window.YWM && YWM.Data && typeof YWM.Data.addAuditLog === 'function') {
                await YWM.Data.addAuditLog('safety', recordId, action, details);
            }
        } catch (err) {
            console.warn('[HSE] Gagal menulis audit log:', err);
        }
    },

    // ============================================================
    // HELPER — Generate ID Insiden otomatis
    // ============================================================

    /**
     * Generate Incident ID: INC-YYYY-NNN
     * @returns {Promise<string>}
     */
    async _generateIncidentId() {
        try {
            const year = new Date().getFullYear();
            const prefix = `INC-${year}-`;
            const index = await this._getData('ywm:hse:index:all') || [];
            const thisYear = index.filter(id => id.startsWith(prefix));
            const nextNum = thisYear.length + 1;
            return `${prefix}${String(nextNum).padStart(3, '0')}`;
        } catch (err) {
            return `INC-${Date.now()}`;
        }
    },

    /**
     * Ambil semua insiden dari KV
     * @returns {Promise<Array>}
     */
    async _getAllIncidents() {
        try {
            const index = await this._getData('ywm:hse:index:all') || [];
            const incidents = [];
            for (const incId of index) {
                const data = await this._getData(`ywm:hse:incident:${incId}`);
                if (data) incidents.push(data);
            }
            incidents.sort((a, b) => new Date(b.tanggal || b.createdAt) - new Date(a.tanggal || a.createdAt));
            return incidents;
        } catch (err) {
            console.error('[HSE] Gagal mengambil semua insiden:', err);
            return [];
        }
    },

    /**
     * Simpan insiden baru
     * @param {object} incData
     * @returns {Promise<boolean>}
     */
    async _saveIncident(incData) {
        try {
            const incId = incData.incident_id;
            await this._setDataWithTimestamp(`ywm:hse:incident:${incId}`, incData);
            const index = await this._getData('ywm:hse:index:all') || [];
            if (!index.includes(incId)) {
                index.push(incId);
                await this._setData('ywm:hse:index:all', index);
            }
            await this._addAudit('CREATE', incId, { tipe: incData.tipe, severity: incData.severity });
            return true;
        } catch (err) {
            console.error('[HSE] Gagal menyimpan insiden:', err);
            return false;
        }
    },

    /**
     * Simpan checklist inspeksi
     * @param {object} checklistData
     * @returns {Promise<boolean>}
     */
    async _saveChecklist(checklistData) {
        try {
            const id = checklistData.id;
            await this._setDataWithTimestamp(`ywm:hse:checklist:${id}`, checklistData);
            await this._addAudit('CREATE', id, { kategori: checklistData.kategori });
            return true;
        } catch (err) {
            console.error('[HSE] Gagal menyimpan checklist:', err);
            return false;
        }
    },

    // ============================================================
    // VALIDASI
    // ============================================================

    _validateIncidentForm(data) {
        const errors = {};
        if (!data.tanggal) errors.tanggal = 'Tanggal wajib diisi';
        if (!data.waktu) errors.waktu = 'Waktu wajib diisi';
        if (!data.lokasi || data.lokasi.trim() === '') errors.lokasi = 'Lokasi wajib diisi';
        if (!data.tipe) errors.tipe = 'Tipe insiden wajib dipilih';
        if (!data.severity) errors.severity = 'Severity wajib dipilih';
        if (!data.deskripsi || data.deskripsi.trim() === '') errors.deskripsi = 'Deskripsi wajib diisi';
        return { valid: Object.keys(errors).length === 0, errors };
    },

    // ============================================================
    // KPI & K3 CALCULATIONS
    // ============================================================

    _calculateKPI(incidents) {
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        // Hari tanpa insiden (hitung dari insiden terakhir)
        let daysWithoutIncident = 0;
        const realIncidents = incidents.filter(i => i.tipe === 'Insiden');
        if (realIncidents.length > 0) {
            const lastIncident = new Date(realIncidents[0].tanggal);
            daysWithoutIncident = Math.max(0, Math.floor((now - lastIncident) / (1000 * 60 * 60 * 24)));
        } else {
            daysWithoutIncident = 365; // Default jika belum ada insiden
        }

        // Insiden bulan ini
        const incidentsThisMonth = incidents.filter(i => {
            const d = new Date(i.tanggal);
            return d.getMonth() === thisMonth && d.getFullYear() === thisYear && i.tipe === 'Insiden';
        }).length;

        // Near miss bulan ini
        const nearMissThisMonth = incidents.filter(i => {
            const d = new Date(i.tanggal);
            return d.getMonth() === thisMonth && d.getFullYear() === thisYear && i.tipe === 'Near Miss';
        }).length;

        return {
            daysWithoutIncident,
            incidentsThisMonth,
            nearMissThisMonth,
            hseWorkers: 4 // Placeholder — bisa diambil dari HR module
        };
    },

    _calculateK3Metrics(incidents) {
        // Asumsi: 60 pekerja, 200 jam kerja/bulan/orang
        const totalWorkers = 60;
        const hoursPerMonth = 200;
        const totalHours = totalWorkers * hoursPerMonth;

        const now = new Date();
        const thisYear = now.getFullYear();

        const yearIncidents = incidents.filter(i => {
            const d = new Date(i.tanggal);
            return d.getFullYear() === thisYear && i.tipe === 'Insiden';
        });

        const fatalIncidents = yearIncidents.filter(i => i.severity === 'Fatal').length;
        const lostTimeIncidents = yearIncidents.filter(i => i.severity === 'Major' || i.severity === 'Fatal').length;
        const recordableIncidents = yearIncidents.filter(i => i.severity !== 'Minor').length;

        // TRIR = (Total Recordable Incidents × 200,000) / Total Hours Worked
        const annualHours = totalHours * 12;
        const trir = annualHours > 0 ? ((recordableIncidents * 200000) / annualHours).toFixed(2) : 0;

        // LTIR = (Lost Time Incidents × 200,000) / Total Hours Worked
        const ltir = annualHours > 0 ? ((lostTimeIncidents * 200000) / annualHours).toFixed(2) : 0;

        return {
            trir,
            ltir,
            totalIncidents: yearIncidents.length,
            fatalIncidents,
            lostTimeIncidents,
            recordableIncidents,
            totalWorkers,
            annualHours
        };
    },

    // ============================================================
    // RENDER
    // ============================================================

    async render() {
        const incidents = await this._getAllIncidents();
        const kpi = this._calculateKPI(incidents);
        const k3 = this._calculateK3Metrics(incidents);
        const correctiveActions = this._getCorrectiveActions(incidents);

        return `
        <div class="module-detail animate-fade-in" id="safety-module">
            <!-- ── HEADER ── -->
            <div class="detail-header">
                <div style="display:flex;align-items:center;gap:10px;">
                    <div class="card-icon safety" style="width:36px;height:36px;font-size:1rem;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <div>
                        <h2 class="detail-title">Safety & HSE</h2>
                        <span class="text-muted" style="font-size:0.75rem;">Kesehatan & Keselamatan Kerja — PT Yoga Wibawa Mandiri</span>
                    </div>
                </div>
                <button class="btn btn-accent" id="hse-btn-add">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Lapor Insiden
                </button>
            </div>

            <!-- ── KPI ROW ── -->
            <div class="card-stats" style="grid-template-columns:repeat(4,1fr);margin-bottom:20px;">
                <div class="stat-item">
                    <div class="stat-value text-success" id="hse-kpi-days">${kpi.daysWithoutIncident}</div>
                    <div class="stat-label">Hari Tanpa Insiden</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value ${kpi.incidentsThisMonth > 0 ? 'text-error' : 'text-success'}" id="hse-kpi-incidents">${kpi.incidentsThisMonth}</div>
                    <div class="stat-label">Insiden Bulan Ini</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value text-warning" id="hse-kpi-nearmiss">${kpi.nearMissThisMonth}</div>
                    <div class="stat-label">Near Miss</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value" id="hse-kpi-workers">${kpi.hseWorkers}</div>
                    <div class="stat-label">Pekerja HSE</div>
                </div>
            </div>

            <!-- ── TWO-COLUMN LAYOUT ── -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
                <!-- K3 Dashboard -->
                <div class="glass" style="padding:20px;border-radius:var(--radius-lg);">
                    <h3 style="font-size:0.9rem;font-weight:600;margin-bottom:16px;">Dashboard K3</h3>
                    ${this._renderK3Dashboard(k3)}
                </div>

                <!-- Safety Checklist -->
                <div class="glass" style="padding:20px;border-radius:var(--radius-lg);">
                    <h3 style="font-size:0.9rem;font-weight:600;margin-bottom:16px;">Safety Checklist</h3>
                    ${this._renderSafetyChecklist()}
                </div>
            </div>

            <!-- ── CORRECTIVE ACTION TRACKING ── -->
            <div class="glass" style="padding:20px;margin-bottom:20px;border-radius:var(--radius-lg);">
                <h3 style="font-size:0.9rem;font-weight:600;margin-bottom:16px;">Corrective Action Tracking</h3>
                <div id="hse-corrective-list">
                    ${this._renderCorrectiveActions(correctiveActions)}
                </div>
            </div>

            <!-- ── INCIDENT LIST ── -->
            <div class="glass" style="padding:20px;border-radius:var(--radius-lg);">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
                    <h3 style="font-size:0.9rem;font-weight:600;">Daftar Insiden</h3>
                    <div style="display:flex;gap:8px;">
                        <select id="hse-filter-status" class="select-glass" style="width:auto;padding:6px 30px 6px 10px;font-size:0.72rem;">
                            <option value="">Semua Status</option>
                            <option value="Open">Open</option>
                            <option value="Investigating">Investigating</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Closed">Closed</option>
                        </select>
                        <select id="hse-filter-severity" class="select-glass" style="width:auto;padding:6px 30px 6px 10px;font-size:0.72rem;">
                            <option value="">Semua Severity</option>
                            <option value="Fatal">Fatal</option>
                            <option value="Major">Major</option>
                            <option value="Moderate">Moderate</option>
                            <option value="Minor">Minor</option>
                        </select>
                    </div>
                </div>
                <div id="hse-incident-list">
                    ${this._renderIncidentList(incidents)}
                </div>
            </div>
        </div>

        <!-- ── MODAL: INCIDENT REPORT FORM ── -->
        <div id="hse-modal" class="modal-overlay hidden">
            <div class="modal-content" style="max-width:680px;">
                <div class="modal-header">
                    <h3>Lapor Insiden</h3>
                    <button class="btn-icon btn-sm" id="hse-modal-close">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="hse-form" class="form-grid" novalidate>
                        <div class="form-group full-width">
                            <label class="label-glass">ID Insiden (otomatis)</label>
                            <input type="text" id="hse-f-incident_id" class="input-glass" readonly>
                        </div>
                        <div class="form-group">
                            <label class="label-glass">Tanggal *</label>
                            <input type="date" name="tanggal" id="hse-f-tanggal" class="input-glass" required>
                        </div>
                        <div class="form-group">
                            <label class="label-glass">Waktu *</label>
                            <input type="time" name="waktu" id="hse-f-waktu" class="input-glass" required>
                        </div>
                        <div class="form-group full-width">
                            <label class="label-glass">Lokasi *</label>
                            <input type="text" name="lokasi" id="hse-f-lokasi" class="input-glass" placeholder="Area gudang / Conveyor / Workshop..." required>
                        </div>
                        <div class="form-group">
                            <label class="label-glass">Tipe *</label>
                            <select name="tipe" id="hse-f-tipe" class="select-glass" required>
                                <option value="">— Pilih Tipe —</option>
                                <option value="Insiden">🔴 Insiden</option>
                                <option value="Near Miss">🟡 Near Miss</option>
                                <option value="Unsafe Act">🟠 Unsafe Act</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="label-glass">Severity *</label>
                            <select name="severity" id="hse-f-severity" class="select-glass" required>
                                <option value="">— Pilih Severity —</option>
                                <option value="Minor">Minor</option>
                                <option value="Moderate">Moderate</option>
                                <option value="Major">Major</option>
                                <option value="Fatal">Fatal</option>
                            </select>
                        </div>
                        <div class="form-group full-width">
                            <label class="label-glass">Deskripsi *</label>
                            <textarea name="deskripsi" id="hse-f-deskripsi" class="textarea-glass" rows="3" placeholder="Deskripsikan kejadian secara detail..." required></textarea>
                        </div>
                        <div class="form-group">
                            <label class="label-glass">Korban / Terdampak</label>
                            <input type="text" name="korban" id="hse-f-korban" class="input-glass" placeholder="Nama / Jumlah orang">
                        </div>
                        <div class="form-group">
                            <label class="label-glass">Corrective Action</label>
                            <input type="text" name="corrective_action" id="hse-f-corrective" class="input-glass" placeholder="Tindakan perbaikan...">
                        </div>
                        <div class="form-group">
                            <label class="label-glass">Due Date</label>
                            <input type="date" name="due_date" id="hse-f-due_date" class="input-glass">
                        </div>
                        <div class="form-group">
                            <label class="label-glass">Status</label>
                            <select name="status" id="hse-f-status" class="select-glass">
                                <option value="Open">Open</option>
                                <option value="Investigating">Investigating</option>
                                <option value="Resolved">Resolved</option>
                                <option value="Closed">Closed</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn" id="hse-btn-cancel">Batal</button>
                    <button class="btn btn-accent" id="hse-btn-submit">Simpan Laporan</button>
                </div>
            </div>
        </div>
        `;
    },

    // ============================================================
    // RENDER HELPERS
    // ============================================================

    _renderK3Dashboard(k3) {
        return `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div class="stat-item" style="text-align:center;">
                <div class="stat-value ${Number(k3.trir) <= 1 ? 'text-success' : Number(k3.trir) <= 3 ? 'text-warning' : 'text-error'}">${k3.trir}</div>
                <div class="stat-label">TRIR</div>
                <div style="font-size:0.6rem;color:var(--text-muted);margin-top:2px;">Total Recordable Incident Rate</div>
            </div>
            <div class="stat-item" style="text-align:center;">
                <div class="stat-value ${Number(k3.ltir) <= 0.5 ? 'text-success' : Number(k3.ltir) <= 2 ? 'text-warning' : 'text-error'}">${k3.ltir}</div>
                <div class="stat-label">LTIR</div>
                <div style="font-size:0.6rem;color:var(--text-muted);margin-top:2px;">Lost Time Incident Rate</div>
            </div>
            <div class="stat-item" style="text-align:center;">
                <div class="stat-value">${k3.totalIncidents}</div>
                <div class="stat-label">Total Insiden (Thn)</div>
            </div>
            <div class="stat-item" style="text-align:center;">
                <div class="stat-value ${k3.fatalIncidents > 0 ? 'text-error' : 'text-success'}">${k3.fatalIncidents}</div>
                <div class="stat-label">Insiden Fatal</div>
            </div>
            <div class="stat-item" style="text-align:center;">
                <div class="stat-value">${k3.lostTimeIncidents}</div>
                <div class="stat-label">Lost Time Incidents</div>
            </div>
            <div class="stat-item" style="text-align:center;">
                <div class="stat-value">${k3.totalWorkers}</div>
                <div class="stat-label">Total Pekerja</div>
            </div>
        </div>
        <div style="margin-top:12px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.06);">
            <div style="font-size:0.65rem;color:var(--text-muted);">
                Rumus: TRIR = (Jml Recordable × 200.000) / Jam Kerja Total<br>
                LTIR = (Jml Lost Time × 200.000) / Jam Kerja Total
            </div>
        </div>`;
    },

    _renderSafetyChecklist() {
        const templates = this.CHECKLIST_TEMPLATES;
        return `
        <div style="display:flex;flex-direction:column;gap:12px;">
            ${Object.entries(templates).map(([key, tmpl]) => {
                const checked = Math.floor(Math.random() * tmpl.items.length); // Placeholder
                return `
                <div style="padding:10px 12px;background:rgba(255,255,255,0.03);border-radius:var(--radius-sm);border:1px solid rgba(255,255,255,0.06);">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                        <span style="font-size:0.8rem;font-weight:600;">${tmpl.label}</span>
                        <span class="badge badge-info">${tmpl.items.length} item</span>
                    </div>
                    <div style="display:flex;gap:4px;">
                        ${tmpl.items.map((item, i) => `
                            <div style="flex:1;height:6px;background:${i < checked ? 'rgba(0,230,118,0.5)' : 'rgba(255,255,255,0.08)'};border-radius:3px;" title="${item}"></div>
                        `).join('')}
                    </div>
                    <button class="btn btn-sm" style="margin-top:8px;width:100%;" data-checklist-category="${key}">
                        Mulai Inspeksi
                    </button>
                </div>`;
            }).join('')}
        </div>`;
    },

    _getCorrectiveActions(incidents) {
        return incidents
            .filter(i => i.corrective_action && i.status !== 'Closed')
            .map(i => ({
                id: i.incident_id,
                action: i.corrective_action,
                due_date: i.due_date,
                status: i.status,
                severity: i.severity,
                tipe: i.tipe,
                tanggal: i.tanggal
            }));
    },

    _renderCorrectiveActions(actions) {
        if (!actions || actions.length === 0) {
            return '<div class="empty-state"><div class="empty-state-icon">✅</div><div class="empty-state-text">Tidak ada corrective action tertunda</div></div>';
        }

        const statusBadge = (s) => {
            const map = {
                Open: 'badge-error',
                Investigating: 'badge-warning',
                Resolved: 'badge-success',
                Closed: 'badge-info'
            };
            return map[s] || 'badge-info';
        };

        const isOverdue = (dueDate, status) => {
            if (!dueDate || status === 'Closed' || status === 'Resolved') return false;
            return new Date(dueDate) < new Date();
        };

        return `
        <div style="display:flex;flex-direction:column;gap:8px;">
            ${actions.map(a => {
                const overdue = isOverdue(a.due_date, a.status);
                return `
                <div style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:rgba(255,255,255,0.03);border-radius:var(--radius-sm);border:1px solid ${overdue ? 'rgba(255,82,82,0.3)' : 'rgba(255,255,255,0.06)'};">
                    <div style="flex:1;">
                        <div style="font-size:0.82rem;color:var(--text-primary);margin-bottom:2px;">${a.action}</div>
                        <div style="font-size:0.7rem;color:var(--text-muted);">
                            ${a.id} · ${a.tipe} · ${typeof formatTanggal === 'function' ? formatTanggal(a.tanggal, 'short') : a.tanggal}
                            ${a.due_date ? ' · Due: ' + (typeof formatTanggal === 'function' ? formatTanggal(a.due_date, 'short') : a.due_date) : ''}
                        </div>
                    </div>
                    <span class="badge ${statusBadge(a.status)}">${a.status}</span>
                    ${overdue ? '<span class="badge badge-error">OVERDUE</span>' : ''}
                </div>`;
            }).join('')}
        </div>`;
    },

    _renderIncidentList(incidents, filterStatus = '', filterSeverity = '') {
        let filtered = incidents || [];

        if (filterStatus) {
            filtered = filtered.filter(i => i.status === filterStatus);
        }
        if (filterSeverity) {
            filtered = filtered.filter(i => i.severity === filterSeverity);
        }

        if (filtered.length === 0) {
            return '<div class="empty-state"><div class="empty-state-icon">🛡️</div><div class="empty-state-text">Belum ada laporan insiden</div><p class="text-muted" style="font-size:0.8rem;">Klik "Lapor Insiden" untuk membuat laporan baru</p></div>';
        }

        const severityBadge = (s) => {
            const map = { Fatal: 'badge-error', Major: 'badge-error', Moderate: 'badge-warning', Minor: 'badge-info' };
            return map[s] || 'badge-info';
        };

        const tipeIcon = (t) => {
            const map = { 'Insiden': '🔴', 'Near Miss': '🟡', 'Unsafe Act': '🟠' };
            return map[t] || '⚪';
        };

        const statusBadge = (s) => {
            const map = { Open: 'badge-error', Investigating: 'badge-warning', Resolved: 'badge-success', Closed: 'badge-info' };
            return map[s] || 'badge-info';
        };

        return `
        <div class="data-table-wrapper">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tanggal</th>
                        <th>Tipe</th>
                        <th>Severity</th>
                        <th>Lokasi</th>
                        <th>Deskripsi</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${filtered.slice(0, 25).map(i => `
                    <tr>
                        <td style="font-weight:600;font-size:0.8rem;">${i.incident_id || '-'}</td>
                        <td>${i.tanggal ? (typeof formatTanggal === 'function' ? formatTanggal(i.tanggal, 'short') : i.tanggal) : '-'}</td>
                        <td>${tipeIcon(i.tipe)} ${i.tipe || '-'}</td>
                        <td><span class="badge ${severityBadge(i.severity)}">${i.severity || '-'}</span></td>
                        <td style="max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${i.lokasi || '-'}</td>
                        <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${i.deskripsi || '-'}</td>
                        <td><span class="badge ${statusBadge(i.status)}">${i.status || 'Open'}</span></td>
                    </tr>`).join('')}
                </tbody>
            </table>
        </div>
        ${filtered.length > 25 ? '<p class="text-muted" style="font-size:0.72rem;margin-top:8px;">Menampilkan 25 terbaru dari total ' + filtered.length + '</p>' : ''}`;
    },

    // ============================================================
    // INIT — Event listeners
    // ============================================================

    async init() {
        const mod = document.getElementById('safety-module');
        if (!mod) return;

        const modal = document.getElementById('hse-modal');
        const btnAdd = document.getElementById('hse-btn-add');
        const btnClose = document.getElementById('hse-modal-close');
        const btnCancel = document.getElementById('hse-btn-cancel');
        const btnSubmit = document.getElementById('hse-btn-submit');

        // Buka modal
        if (btnAdd) {
            btnAdd.addEventListener('click', async () => {
                const incId = await this._generateIncidentId();
                document.getElementById('hse-f-incident_id').value = incId;
                document.getElementById('hse-f-tanggal').value = new Date().toISOString().split('T')[0];
                document.getElementById('hse-f-waktu').value = new Date().toTimeString().slice(0, 5);
                modal.classList.remove('hidden');
            });
        }

        // Tutup modal
        const closeModal = () => {
            modal.classList.add('hidden');
            document.getElementById('hse-form').reset();
            document.querySelectorAll('#hse-form .form-error').forEach(el => el.remove());
            document.querySelectorAll('#hse-form .input-error').forEach(el => el.classList.remove('input-error'));
        };

        if (btnClose) btnClose.addEventListener('click', closeModal);
        if (btnCancel) btnCancel.addEventListener('click', closeModal);
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
        }

        // Submit form
        if (btnSubmit) {
            btnSubmit.addEventListener('click', async () => {
                await this._handleFormSubmit();
            });
        }

        // Filter incident list
        const filterStatus = document.getElementById('hse-filter-status');
        const filterSeverity = document.getElementById('hse-filter-severity');

        const applyFilters = async () => {
            const incidents = await this._getAllIncidents();
            const listEl = document.getElementById('hse-incident-list');
            if (listEl) {
                listEl.innerHTML = this._renderIncidentList(
                    incidents,
                    filterStatus ? filterStatus.value : '',
                    filterSeverity ? filterSeverity.value : ''
                );
            }
        };

        if (filterStatus) filterStatus.addEventListener('change', applyFilters);
        if (filterSeverity) filterSeverity.addEventListener('change', applyFilters);

        // Checklist inspection buttons
        document.querySelectorAll('[data-checklist-category]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.getAttribute('data-checklist-category');
                this._openChecklistModal(category);
            });
        });
    },

    /**
     * Handle submit form insiden
     */
    async _handleFormSubmit() {
        try {
            const form = document.getElementById('hse-form');
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            data.incident_id = document.getElementById('hse-f-incident_id').value;

            // Validasi
            const validation = this._validateIncidentForm(data);
            if (!validation.valid) {
                document.querySelectorAll('#hse-form .form-error').forEach(el => el.remove());
                document.querySelectorAll('#hse-form .input-error').forEach(el => el.classList.remove('input-error'));
                for (const [field, message] of Object.entries(validation.errors)) {
                    const input = document.querySelector(`#hse-form [name="${field}"]`) || document.getElementById(`hse-f-${field}`);
                    if (input) {
                        input.classList.add('input-error');
                        const err = document.createElement('div');
                        err.className = 'form-error';
                        err.style.cssText = 'color:var(--status-error);font-size:0.7rem;margin-top:4px;';
                        err.textContent = message;
                        input.parentNode.appendChild(err);
                    }
                }
                return;
            }

            // Metadata
            data.createdAt = new Date().toISOString();
            data.updatedAt = new Date().toISOString();
            if (!data.status) data.status = 'Open';

            // Simpan
            const success = await this._saveIncident(data);
            if (success) {
                document.getElementById('hse-modal').classList.add('hidden');
                form.reset();
                await this._refreshModule();
                this._showToast('Laporan insiden berhasil disimpan', 'success');
            } else {
                this._showToast('Gagal menyimpan laporan insiden', 'error');
            }
        } catch (err) {
            console.error('[HSE] Error submit form:', err);
            this._showToast('Terjadi kesalahan saat menyimpan data', 'error');
        }
    },

    /**
     * Buka modal checklist inspeksi
     * @param {string} category - Kategori checklist
     */
    _openChecklistModal(category) {
        const template = this.CHECKLIST_TEMPLATES[category];
        if (!template) return;

        const checklistId = `CHK-${category}-${Date.now()}`;

        // Gunakan modal yang sudah ada di DOM (YWM.UI.openModal) atau buat inline
        const modalOverlay = document.getElementById('modal-overlay');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        const modalFooter = document.getElementById('modal-footer');

        if (modalOverlay && modalBody) {
            modalTitle.textContent = `Inspeksi: ${template.label}`;
            modalBody.innerHTML = `
                <form id="hse-checklist-form" class="form-grid" style="grid-template-columns:1fr;">
                    <div class="form-group">
                        <label class="label-glass">Tanggal Inspeksi</label>
                        <input type="date" name="tanggal" class="input-glass" value="${new Date().toISOString().split('T')[0]}" required>
                    </div>
                    <div class="form-group">
                        <label class="label-glass">Inspektur</label>
                        <input type="text" name="inspektur" class="input-glass" placeholder="Nama inspektur">
                    </div>
                    <div class="form-group">
                        <label class="label-glass">Item Inspeksi</label>
                        <div style="display:flex;flex-direction:column;gap:8px;margin-top:4px;">
                            ${template.items.map((item, i) => `
                                <label style="display:flex;align-items:center;gap:8px;font-size:0.82rem;cursor:pointer;">
                                    <input type="checkbox" name="item_${i}" value="ok" style="accent-color:var(--accent);">
                                    <span class="text-secondary">${item}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="label-glass">Catatan</label>
                        <textarea name="catatan" class="textarea-glass" rows="2" placeholder="Catatan inspeksi..."></textarea>
                    </div>
                </form>
            `;
            modalFooter.innerHTML = `
                <button class="btn" onclick="YWM.UI.closeModal()">Batal</button>
                <button class="btn btn-accent" id="hse-checklist-submit">Simpan Checklist</button>
            `;

            modalOverlay.classList.remove('hidden');

            // Event listener submit checklist
            const submitBtn = document.getElementById('hse-checklist-submit');
            if (submitBtn) {
                submitBtn.addEventListener('click', async () => {
                    try {
                        const formEl = document.getElementById('hse-checklist-form');
                        const formData = new FormData(formEl);
                        const items = template.items.map((item, i) => ({
                            description: item,
                            checked: formData.has(`item_${i}`)
                        }));

                        const checklistData = {
                            id: checklistId,
                            kategori: category,
                            tanggal: formData.get('tanggal'),
                            inspektur: formData.get('inspektur'),
                            items,
                            catatan: formData.get('catatan'),
                            totalItems: items.length,
                            checkedItems: items.filter(i => i.checked).length,
                            compliance: items.length > 0 ? ((items.filter(i => i.checked).length / items.length) * 100).toFixed(0) : 0,
                            createdAt: new Date().toISOString()
                        };

                        await this._saveChecklist(checklistData);

                        if (modalOverlay) modalOverlay.classList.add('hidden');
                        this._showToast('Checklist inspeksi berhasil disimpan', 'success');
                    } catch (err) {
                        console.error('[HSE] Error simpan checklist:', err);
                        this._showToast('Gagal menyimpan checklist', 'error');
                    }
                });
            }
        }
    },

    /**
     * Re-render modul
     */
    async _refreshModule() {
        try {
            const incidents = await this._getAllIncidents();
            const kpi = this._calculateKPI(incidents);
            const k3 = this._calculateK3Metrics(incidents);
            const correctiveActions = this._getCorrectiveActions(incidents);

            // Update KPI
            const elDays = document.getElementById('hse-kpi-days');
            const elInc = document.getElementById('hse-kpi-incidents');
            const elNM = document.getElementById('hse-kpi-nearmiss');
            if (elDays) { elDays.textContent = kpi.daysWithoutIncident; elDays.className = 'stat-value text-success'; }
            if (elInc) { elInc.textContent = kpi.incidentsThisMonth; elInc.className = 'stat-value ' + (kpi.incidentsThisMonth > 0 ? 'text-error' : 'text-success'); }
            if (elNM) elNM.textContent = kpi.nearMissThisMonth;

            // Update incident list
            const listEl = document.getElementById('hse-incident-list');
            if (listEl) listEl.innerHTML = this._renderIncidentList(incidents);

            // Update corrective actions
            const caEl = document.getElementById('hse-corrective-list');
            if (caEl) caEl.innerHTML = this._renderCorrectiveActions(correctiveActions);
        } catch (err) {
            console.error('[HSE] Error refresh module:', err);
        }
    },

    _showToast(message, type = 'info') {
        try {
            if (window.YWM && YWM.UI && typeof YWM.UI.showToast === 'function') {
                YWM.UI.showToast(message, type);
                return;
            }
            const container = document.getElementById('toast-container');
            if (!container) return;
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.innerHTML = `<span>${message}</span>`;
            container.appendChild(toast);
            setTimeout(() => toast.remove(), 4000);
        } catch (err) {
            console.warn('[HSE] Gagal menampilkan toast:', err);
        }
    }
};
