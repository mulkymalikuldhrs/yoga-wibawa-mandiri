/**
 * ============================================================
 * QUALITY CONTROL MODULE
 * PT Yoga Wibawa Mandiri — Dashboard Pengantongan Semen Padang
 * ============================================================
 *
 * Modul ini menangani:
 * - Pencatatan hasil Quality Control per batch
 * - Monitoring kepatuhan SNI (SNI 2049:2015 / SNI 7064:2014)
 * - Visualisasi tren kekuatan tekan (1d/3d/7d/28d)
 * - Distribusi berat zak dan alert kelainan parameter
 *
 * KV Pattern:
 *   ywm:qc:batch:B-2026-0525-001  → data batch QC individual
 *   ywm:qc:index:all               → index semua batch ID
 *
 * @version 1.0.0
 */

window.YWM = window.YWM || {};
window.YWM.Modules = window.YWM.Modules || {};

YWM.Modules.quality = {
    title: 'Quality Control',

    // ── Batas spesifikasi SNI untuk semen ──
    SNI_LIMITS: {
        berat_zak_avg: { min: 49.5, max: 50.5, label: 'Berat Zak Rata-rata (kg)', unit: 'kg' },
        berat_zak_min: { min: 49.0, max: null, label: 'Berat Zak Minimum (kg)', unit: 'kg' },
        berat_zak_max: { min: null, max: 51.0, label: 'Berat Zak Maksimum (kg)', unit: 'kg' },
        kekuatan_tekan_1d: { min: null, max: null, label: 'Kekuatan Tekan 1 Hari (MPa)', unit: 'MPa' },
        kekuatan_tekan_3d: { min: 10.0, max: null, label: 'Kekuatan Tekan 3 Hari (MPa)', unit: 'MPa' },
        kekuatan_tekan_7d: { min: 16.0, max: null, label: 'Kekuatan Tekan 7 Hari (MPa)', unit: 'MPa' },
        kekuatan_tekan_28d: { min: 32.5, max: null, label: 'Kekuatan Tekan 28 Hari (MPa)', unit: 'MPa' },
        setting_time_initial: { min: 45, max: null, label: 'Initial Setting Time (menit)', unit: 'menit' },
        setting_time_final: { min: null, max: 600, label: 'Final Setting Time (menit)', unit: 'menit' },
        fineness: { min: null, max: 430, label: 'Fineness / Blaine (m²/kg)', unit: 'm²/kg' }
    },

    // ============================================================
    // DATA LAYER — Abstraksi akses data dengan fallback
    // ============================================================

    /**
     * Mengambil data dari KV store
     * @param {string} key - KV key
     * @returns {Promise<any>} Data tersimpan atau null
     */
    async _getData(key) {
        try {
            if (window.YWM && YWM.Data && typeof YWM.Data.get === 'function') {
                return await YWM.Data.get(key);
            }
            // Fallback langsung ke puter.kv
            if (typeof puter !== 'undefined' && puter.kv) {
                const raw = await puter.kv.get(key);
                if (!raw) return null;
                try { return JSON.parse(raw); } catch { return raw; }
            }
            return null;
        } catch (err) {
            console.error('[QC] Gagal mengambil data:', key, err);
            return null;
        }
    },

    /**
     * Menyimpan data ke KV store
     * @param {string} key - KV key
     * @param {any} value - Data yang disimpan
     * @returns {Promise<boolean>}
     */
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
            console.error('[QC] Gagal menyimpan data:', key, err);
            return false;
        }
    },

    /**
     * Simpan data dengan timestamp otomatis
     * @param {string} key - KV key
     * @param {any} value - Data
     * @returns {Promise<boolean>}
     */
    async _setDataWithTimestamp(key, value) {
        try {
            if (window.YWM && YWM.Data && typeof YWM.Data.setWithTimestamp === 'function') {
                await YWM.Data.setWithTimestamp(key, value);
                return true;
            }
            // Fallback: tambah timestamp manual
            const data = typeof value === 'object' ? value : { _value: value };
            data.updatedAt = new Date().toISOString();
            return await this._setData(key, data);
        } catch (err) {
            console.error('[QC] Gagal menyimpan data + timestamp:', key, err);
            return false;
        }
    },

    /**
     * Tambah audit log
     * @param {string} action - Jenis aksi (CREATE/UPDATE/DELETE)
     * @param {string} recordId - ID record
     * @param {object} details - Detail perubahan
     */
    async _addAudit(action, recordId, details = {}) {
        try {
            if (window.YWM && YWM.Data && typeof YWM.Data.addAuditLog === 'function') {
                await YWM.Data.addAuditLog('quality', recordId, action, details);
            }
        } catch (err) {
            console.warn('[QC] Gagal menulis audit log:', err);
        }
    },

    // ============================================================
    // HELPER — Generate ID Batch otomatis
    // ============================================================

    /**
     * Generate Batch ID otomatis: B-YYYY-MMDD-NNN
     * @returns {Promise<string>}
     */
    async _generateBatchId() {
        try {
            const now = new Date();
            const y = now.getFullYear();
            const m = String(now.getMonth() + 1).padStart(2, '0');
            const d = String(now.getDate()).padStart(2, '0');
            const prefix = `B-${y}-${m}${d}-`;

            // Cari nomor urut terakhir dari index
            const index = await this._getData('ywm:qc:index:all') || [];
            const todayBatches = index.filter(id => id.startsWith(prefix));
            const nextNum = todayBatches.length + 1;
            return `${prefix}${String(nextNum).padStart(3, '0')}`;
        } catch (err) {
            // Fallback: gunakan timestamp
            return `B-${Date.now()}`;
        }
    },

    /**
     * Ambil semua batch dari KV
     * @returns {Promise<Array>}
     */
    async _getAllBatches() {
        try {
            const index = await this._getData('ywm:qc:index:all') || [];
            const batches = [];
            for (const batchId of index) {
                const data = await this._getData(`ywm:qc:batch:${batchId}`);
                if (data) batches.push(data);
            }
            // Urutkan terbaru di atas
            batches.sort((a, b) => new Date(b.tanggal || b.createdAt) - new Date(a.tanggal || a.createdAt));
            return batches;
        } catch (err) {
            console.error('[QC] Gagal mengambil semua batch:', err);
            return [];
        }
    },

    /**
     * Simpan batch baru ke KV
     * @param {object} batchData - Data batch
     * @returns {Promise<boolean>}
     */
    async _saveBatch(batchData) {
        try {
            const batchId = batchData.batch_id;
            // Simpan data batch
            await this._setDataWithTimestamp(`ywm:qc:batch:${batchId}`, batchData);
            // Update index
            const index = await this._getData('ywm:qc:index:all') || [];
            if (!index.includes(batchId)) {
                index.push(batchId);
                await this._setData('ywm:qc:index:all', index);
            }
            // Audit log
            await this._addAudit('CREATE', batchId, { hasil: batchData.hasil });
            return true;
        } catch (err) {
            console.error('[QC] Gagal menyimpan batch:', err);
            return false;
        }
    },

    // ============================================================
    // VALIDASI FORM
    // ============================================================

    /**
     * Validasi input form QC
     * @param {object} data - Data form
     * @returns {{ valid: boolean, errors: object }}
     */
    _validateForm(data) {
        const errors = {};

        if (!data.tanggal) errors.tanggal = 'Tanggal wajib diisi';
        if (!data.shift) errors.shift = 'Shift wajib dipilih';

        // Validasi berat zak
        if (!data.berat_zak_avg || isNaN(Number(data.berat_zak_avg))) {
            errors.berat_zak_avg = 'Berat zak rata-rata wajib diisi (angka)';
        }
        if (!data.berat_zak_min || isNaN(Number(data.berat_zak_min))) {
            errors.berat_zak_min = 'Berat zak minimum wajib diisi (angka)';
        }
        if (!data.berat_zak_max || isNaN(Number(data.berat_zak_max))) {
            errors.berat_zak_max = 'Berat zak maksimum wajib diisi (angka)';
        }

        // Validasi kekuatan tekan
        if (data.kekuatan_tekan_28d === '' || data.kekuatan_tekan_28d === null || data.kekuatan_tekan_28d === undefined) {
            errors.kekuatan_tekan_28d = 'Kekuatan tekan 28 hari wajib diisi';
        } else if (isNaN(Number(data.kekuatan_tekan_28d))) {
            errors.kekuatan_tekan_28d = 'Harus berupa angka';
        }

        if (!data.hasil) errors.hasil = 'Hasil QC wajib dipilih';

        return { valid: Object.keys(errors).length === 0, errors };
    },

    /**
     * Cek apakah parameter di luar spesifikasi SNI
     * @param {object} data - Data batch
     * @returns {Array<object>} Daftar alert SNI
     */
    _checkSNIAlerts(data) {
        const alerts = [];
        for (const [field, limit] of Object.entries(this.SNI_LIMITS)) {
            const val = Number(data[field]);
            if (isNaN(val) || val === 0) continue; // skip field kosong

            if (limit.min !== null && val < limit.min) {
                alerts.push({
                    field,
                    label: limit.label,
                    value: val,
                    limit: `min ${limit.min} ${limit.unit}`,
                    type: 'below_min'
                });
            }
            if (limit.max !== null && val > limit.max) {
                alerts.push({
                    field,
                    label: limit.label,
                    value: val,
                    limit: `max ${limit.max} ${limit.unit}`,
                    type: 'above_max'
                });
            }
        }
        return alerts;
    },

    // ============================================================
    // RENDER — Tampilan utama modul
    // ============================================================

    async render() {
        const batches = await this._getAllBatches();
        const kpi = this._calculateKPI(batches);
        const sniAlerts = this._getActiveSNIAlerts(batches);

        return `
        <div class="module-detail animate-fade-in" id="qc-module">
            <!-- ── HEADER ── -->
            <div class="detail-header">
                <div style="display:flex;align-items:center;gap:10px;">
                    <div class="card-icon safety" style="width:36px;height:36px;font-size:1rem;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    </div>
                    <div>
                        <h2 class="detail-title">Quality Control</h2>
                        <span class="text-muted" style="font-size:0.75rem;">Pengantongan Semen Padang — SNI Compliance</span>
                    </div>
                </div>
                <button class="btn btn-accent" id="qc-btn-add">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Input Hasil QC
                </button>
            </div>

            <!-- ── SNI ALERT ── -->
            <div id="qc-sni-alert-area">
                ${this._renderSNIAlerts(sniAlerts)}
            </div>

            <!-- ── KPI ROW ── -->
            <div class="card-stats" style="grid-template-columns:repeat(4,1fr);margin-bottom:20px;">
                <div class="stat-item">
                    <div class="stat-value text-accent" id="qc-kpi-pass-rate">${kpi.passRate}%</div>
                    <div class="stat-label">Pass Rate</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value" id="qc-kpi-batch-tested">${kpi.batchTested}</div>
                    <div class="stat-label">Batch Tested</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value ${kpi.sniCompliance >= 90 ? 'text-success' : 'text-warning'}" id="qc-kpi-sni">${kpi.sniCompliance}%</div>
                    <div class="stat-label">SNI Compliance</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value" id="qc-kpi-avg-strength">${kpi.avgStrength} MPa</div>
                    <div class="stat-label">Avg Strength 28d</div>
                </div>
            </div>

            <!-- ── STRENGTH TREND CHART ── -->
            <div class="glass" style="padding:20px;margin-bottom:20px;border-radius:var(--radius-lg);">
                <h3 style="font-size:0.9rem;font-weight:600;margin-bottom:16px;">Tren Kekuatan Tekan (MPa)</h3>
                <div id="qc-strength-chart">
                    ${this._renderStrengthChart(batches)}
                </div>
            </div>

            <!-- ── WEIGHT DISTRIBUTION ── -->
            <div class="glass" style="padding:20px;margin-bottom:20px;border-radius:var(--radius-lg);">
                <h3 style="font-size:0.9rem;font-weight:600;margin-bottom:16px;">Distribusi Berat Zak</h3>
                <div id="qc-weight-dist">
                    ${this._renderWeightDistribution(batches)}
                </div>
            </div>

            <!-- ── BATCH LIST ── -->
            <div class="glass" style="padding:20px;border-radius:var(--radius-lg);">
                <h3 style="font-size:0.9rem;font-weight:600;margin-bottom:16px;">Daftar Batch QC</h3>
                <div id="qc-batch-list">
                    ${this._renderBatchList(batches)}
                </div>
            </div>
        </div>

        <!-- ── MODAL: QC ENTRY FORM ── -->
        <div id="qc-modal" class="modal-overlay hidden">
            <div class="modal-content" style="max-width:680px;">
                <div class="modal-header">
                    <h3>Input Hasil QC</h3>
                    <button class="btn-icon btn-sm" id="qc-modal-close">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="qc-form" class="form-grid" novalidate>
                        <div class="form-group full-width">
                            <label class="label-glass">Batch ID (otomatis)</label>
                            <input type="text" id="qc-f-batch_id" class="input-glass" readonly>
                        </div>
                        <div class="form-group">
                            <label class="label-glass">Tanggal *</label>
                            <input type="date" name="tanggal" id="qc-f-tanggal" class="input-glass" required>
                        </div>
                        <div class="form-group">
                            <label class="label-glass">Shift *</label>
                            <select name="shift" id="qc-f-shift" class="select-glass" required>
                                <option value="">— Pilih Shift —</option>
                                <option value="Pagi">Pagi</option>
                                <option value="Siang">Siang</option>
                                <option value="Malam">Malam</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="label-glass">Berat Zak Avg (kg) *</label>
                            <input type="number" step="0.01" name="berat_zak_avg" id="qc-f-berat_zak_avg" class="input-glass" placeholder="49.80" required>
                        </div>
                        <div class="form-group">
                            <label class="label-glass">Berat Zak Min (kg) *</label>
                            <input type="number" step="0.01" name="berat_zak_min" id="qc-f-berat_zak_min" class="input-glass" placeholder="49.20" required>
                        </div>
                        <div class="form-group">
                            <label class="label-glass">Berat Zak Max (kg) *</label>
                            <input type="number" step="0.01" name="berat_zak_max" id="qc-f-berat_zak_max" class="input-glass" placeholder="50.30" required>
                        </div>
                        <div class="form-group">
                            <label class="label-glass">Kekuatan Tekan 1d (MPa)</label>
                            <input type="number" step="0.1" name="kekuatan_tekan_1d" id="qc-f-tek1d" class="input-glass" placeholder="—">
                        </div>
                        <div class="form-group">
                            <label class="label-glass">Kekuatan Tekan 3d (MPa)</label>
                            <input type="number" step="0.1" name="kekuatan_tekan_3d" id="qc-f-tek3d" class="input-glass" placeholder="≥ 10.0">
                        </div>
                        <div class="form-group">
                            <label class="label-glass">Kekuatan Tekan 7d (MPa)</label>
                            <input type="number" step="0.1" name="kekuatan_tekan_7d" id="qc-f-tek7d" class="input-glass" placeholder="≥ 16.0">
                        </div>
                        <div class="form-group">
                            <label class="label-glass">Kekuatan Tekan 28d (MPa) *</label>
                            <input type="number" step="0.1" name="kekuatan_tekan_28d" id="qc-f-tek28d" class="input-glass" placeholder="≥ 32.5" required>
                        </div>
                        <div class="form-group">
                            <label class="label-glass">Initial Setting (menit)</label>
                            <input type="number" step="1" name="setting_time_initial" id="qc-f-set_i" class="input-glass" placeholder="≥ 45">
                        </div>
                        <div class="form-group">
                            <label class="label-glass">Final Setting (menit)</label>
                            <input type="number" step="1" name="setting_time_final" id="qc-f-set_f" class="input-glass" placeholder="≤ 600">
                        </div>
                        <div class="form-group">
                            <label class="label-glass">Fineness / Blaine (m²/kg)</label>
                            <input type="number" step="1" name="fineness" id="qc-f-fineness" class="input-glass" placeholder="≤ 430">
                        </div>
                        <div class="form-group">
                            <label class="label-glass">Hasil QC *</label>
                            <select name="hasil" id="qc-f-hasil" class="select-glass" required>
                                <option value="">— Pilih —</option>
                                <option value="Pass">✅ Pass</option>
                                <option value="Fail">❌ Fail</option>
                            </select>
                        </div>
                        <div class="form-group full-width">
                            <label class="label-glass">Catatan</label>
                            <textarea name="catatan" id="qc-f-catatan" class="textarea-glass" rows="2" placeholder="Catatan tambahan..."></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn" id="qc-btn-cancel">Batal</button>
                    <button class="btn btn-accent" id="qc-btn-submit">Simpan Hasil QC</button>
                </div>
            </div>
        </div>
        `;
    },

    // ============================================================
    // RENDER HELPERS
    // ============================================================

    /**
     * Hitung KPI dari data batch
     * @param {Array} batches
     * @returns {object}
     */
    _calculateKPI(batches) {
        if (!batches || batches.length === 0) {
            return { passRate: 0, batchTested: 0, sniCompliance: 0, avgStrength: 0 };
        }
        const total = batches.length;
        const passed = batches.filter(b => b.hasil === 'Pass').length;
        const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;

        // SNI compliance: persentase batch tanpa alert SNI
        let sniPass = 0;
        batches.forEach(b => {
            if (this._checkSNIAlerts(b).length === 0) sniPass++;
        });
        const sniCompliance = total > 0 ? ((sniPass / total) * 100).toFixed(1) : 0;

        // Rata-rata kekuatan tekan 28d
        const strengths28 = batches
            .map(b => Number(b.kekuatan_tekan_28d))
            .filter(v => !isNaN(v) && v > 0);
        const avgStrength = strengths28.length > 0
            ? (strengths28.reduce((a, b) => a + b, 0) / strengths28.length).toFixed(1)
            : 0;

        return { passRate, batchTested: total, sniCompliance, avgStrength };
    },

    /**
     * Ambil semua SNI alert aktif dari batch terbaru
     * @param {Array} batches
     * @returns {Array}
     */
    _getActiveSNIAlerts(batches) {
        const alerts = [];
        // Cek 5 batch terbaru
        const recent = (batches || []).slice(0, 5);
        recent.forEach(b => {
            const batchAlerts = this._checkSNIAlerts(b);
            batchAlerts.forEach(a => {
                alerts.push({ ...a, batch_id: b.batch_id, tanggal: b.tanggal });
            });
        });
        return alerts;
    },

    /**
     * Render SNI alert banner
     * @param {Array} alerts
     * @returns {string}
     */
    _renderSNIAlerts(alerts) {
        if (!alerts || alerts.length === 0) return '';

        return `
        <div class="glass" style="padding:16px;margin-bottom:20px;border-radius:var(--radius-lg);border-color:rgba(255,82,82,0.4);background:rgba(255,82,82,0.08);">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--status-error)" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <span style="font-weight:600;color:var(--status-error);font-size:0.85rem;">Peringatan SNI — ${alerts.length} Parameter Di Luar Spesifikasi</span>
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;">
                ${alerts.map(a => `
                    <div style="font-size:0.78rem;display:flex;align-items:center;gap:8px;">
                        <span class="badge badge-error">⚠</span>
                        <span class="text-secondary">Batch <strong>${a.batch_id}</strong>: ${a.label} = <strong>${a.value} ${this.SNI_LIMITS[a.field]?.unit || ''}</strong> (SNI: ${a.limit})</span>
                    </div>
                `).join('')}
            </div>
        </div>`;
    },

    /**
     * Render CSS bar chart tren kekuatan tekan
     * @param {Array} batches
     * @returns {string}
     */
    _renderStrengthChart(batches) {
        const recent = (batches || []).slice(0, 8).reverse(); // 8 batch terbaru, kronologis
        if (recent.length === 0) {
            return '<div class="empty-state"><div class="empty-state-icon">📊</div><div class="empty-state-text">Belum ada data kekuatan tekan</div></div>';
        }

        // Cari nilai maksimum untuk scaling
        let maxVal = 0;
        recent.forEach(b => {
            ['kekuatan_tekan_1d','kekuatan_tekan_3d','kekuatan_tekan_7d','kekuatan_tekan_28d'].forEach(k => {
                const v = Number(b[k]);
                if (!isNaN(v) && v > maxVal) maxVal = v;
            });
        });
        maxVal = maxVal || 50; // fallback scale
        const scaleMax = Math.ceil(maxVal / 5) * 5 + 5;

        const colors = {
            kekuatan_tekan_1d: 'rgba(0, 212, 255, 0.7)',   // cyan
            kekuatan_tekan_3d: 'rgba(0, 230, 118, 0.7)',   // green
            kekuatan_tekan_7d: 'rgba(255, 171, 0, 0.7)',   // amber
            kekuatan_tekan_28d: 'rgba(124, 58, 237, 0.8)'  // purple
        };
        const labels = { kekuatan_tekan_1d: '1d', kekuatan_tekan_3d: '3d', kekuatan_tekan_7d: '7d', kekuatan_tekan_28d: '28d' };
        const sniMin = { kekuatan_tekan_1d: 0, kekuatan_tekan_3d: 10, kekuatan_tekan_7d: 16, kekuatan_tekan_28d: 32.5 };

        return `
        <div style="overflow-x:auto;">
            <!-- Legend -->
            <div style="display:flex;gap:16px;margin-bottom:12px;flex-wrap:wrap;">
                ${Object.entries(labels).map(([k, l]) => `
                    <span style="display:flex;align-items:center;gap:4px;font-size:0.72rem;">
                        <span style="width:10px;height:10px;border-radius:2px;background:${colors[k]};display:inline-block;"></span>
                        <span class="text-muted">${l}</span>
                    </span>
                `).join('')}
            </div>
            <!-- Chart -->
            <div style="display:flex;gap:8px;align-items:flex-end;min-width:500px;height:180px;padding-bottom:24px;position:relative;">
                ${recent.map(b => {
                    const batchLabel = b.batch_id ? b.batch_id.split('-').slice(-2).join('-') : '';
                    return `
                    <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;min-width:50px;">
                        <div style="display:flex;gap:1px;align-items:flex-end;height:150px;width:100%;">
                            ${['kekuatan_tekan_1d','kekuatan_tekan_3d','kekuatan_tekan_7d','kekuatan_tekan_28d'].map(k => {
                                const v = Number(b[k]);
                                const h = !isNaN(v) && v > 0 ? Math.max(2, (v / scaleMax) * 140) : 0;
                                return `<div style="flex:1;height:${h}px;background:${colors[k]};border-radius:2px 2px 0 0;min-height:${h > 0 ? '2px' : '0'};" title="${labels[k]}: ${v || '-'} MPa"></div>`;
                            }).join('')}
                        </div>
                        <span style="font-size:0.6rem;color:var(--text-muted);white-space:nowrap;">${batchLabel}</span>
                    </div>`;
                }).join('')}
                <!-- SNI 28d minimum line -->
                <div style="position:absolute;left:0;right:0;bottom:${24 + (32.5 / scaleMax) * 140}px;border-top:1px dashed rgba(255,82,82,0.5);pointer-events:none;">
                    <span style="font-size:0.6rem;color:var(--status-error);position:absolute;right:0;top:-12px;">SNI 28d min</span>
                </div>
            </div>
        </div>`;
    },

    /**
     * Render visualisasi distribusi berat zak
     * @param {Array} batches
     * @returns {string}
     */
    _renderWeightDistribution(batches) {
        if (!batches || batches.length === 0) {
            return '<div class="empty-state"><div class="empty-state-icon">⚖️</div><div class="empty-state-text">Belum ada data berat zak</div></div>';
        }

        // Hitung rata-rata dan distribusi
        const weights = batches.map(b => Number(b.berat_zak_avg)).filter(v => !isNaN(v) && v > 0);
        if (weights.length === 0) return '<div class="text-muted" style="font-size:0.8rem;">Data berat zak belum tersedia</div>';

        const avg = (weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(2);
        const min = Math.min(...weights).toFixed(2);
        const max = Math.max(...weights).toFixed(2);
        const range = Math.max(...weights) - Math.min(...weights);

        // Buat histogram bucket
        const buckets = {};
        const bucketSize = range > 2 ? 0.5 : 0.25;
        const startVal = Math.floor(Math.min(...weights) / bucketSize) * bucketSize;
        weights.forEach(w => {
            const key = (Math.floor((w - startVal) / bucketSize) * bucketSize + startVal).toFixed(2);
            buckets[key] = (buckets[key] || 0) + 1;
        });

        const maxCount = Math.max(...Object.values(buckets), 1);
        const sortedKeys = Object.keys(buckets).sort((a, b) => Number(a) - Number(b));

        return `
        <div style="margin-bottom:12px;">
            <div style="display:flex;gap:20px;margin-bottom:16px;">
                <div style="text-align:center;">
                    <div class="text-accent" style="font-size:1.3rem;font-weight:700;">${avg} kg</div>
                    <div class="text-muted" style="font-size:0.65rem;">Rata-rata</div>
                </div>
                <div style="text-align:center;">
                    <div style="font-size:1.1rem;font-weight:600;">${min} kg</div>
                    <div class="text-muted" style="font-size:0.65rem;">Minimum</div>
                </div>
                <div style="text-align:center;">
                    <div style="font-size:1.1rem;font-weight:600;">${max} kg</div>
                    <div class="text-muted" style="font-size:0.65rem;">Maksimum</div>
                </div>
            </div>
            <!-- Histogram -->
            <div style="display:flex;align-items:flex-end;gap:3px;height:80px;">
                ${sortedKeys.map(k => {
                    const count = buckets[k];
                    const h = Math.max(4, (count / maxCount) * 70);
                    const isInRange = Number(k) >= 49.5 && Number(k) <= 50.5;
                    return `
                    <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;">
                        <span style="font-size:0.55rem;color:var(--text-muted);">${count}</span>
                        <div style="width:100%;height:${h}px;background:${isInRange ? 'rgba(0,230,118,0.5)' : 'rgba(255,171,0,0.5)'};border-radius:2px 2px 0 0;"></div>
                        <span style="font-size:0.5rem;color:var(--text-muted);">${Number(k).toFixed(1)}</span>
                    </div>`;
                }).join('')}
            </div>
            <div style="display:flex;justify-content:center;margin-top:8px;">
                <span style="font-size:0.65rem;color:var(--text-muted);">Rentang SNI 49.5–50.5 kg: <span class="text-success">hijau</span> | di luar: <span class="text-warning">kuning</span></span>
            </div>
        </div>`;
    },

    /**
     * Render tabel daftar batch QC
     * @param {Array} batches
     * @returns {string}
     */
    _renderBatchList(batches) {
        if (!batches || batches.length === 0) {
            return '<div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-text">Belum ada data QC</div><p class="text-muted" style="font-size:0.8rem;">Klik "Input Hasil QC" untuk menambahkan data</p></div>';
        }

        return `
        <div class="data-table-wrapper">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Batch ID</th>
                        <th>Tanggal</th>
                        <th>Shift</th>
                        <th>Berat Avg</th>
                        <th>Tekan 28d</th>
                        <th>Fineness</th>
                        <th>Hasil</th>
                        <th>SNI</th>
                    </tr>
                </thead>
                <tbody>
                    ${batches.slice(0, 20).map(b => {
                        const sniAlerts = this._checkSNIAlerts(b);
                        const sniOk = sniAlerts.length === 0;
                        return `
                        <tr>
                            <td style="font-weight:600;font-size:0.8rem;">${b.batch_id || '-'}</td>
                            <td>${b.tanggal ? formatTanggal(b.tanggal, 'short') : '-'}</td>
                            <td>${b.shift || '-'}</td>
                            <td>${b.berat_zak_avg ? Number(b.berat_zak_avg).toFixed(2) + ' kg' : '-'}</td>
                            <td>${b.kekuatan_tekan_28d ? Number(b.kekuatan_tekan_28d).toFixed(1) + ' MPa' : '-'}</td>
                            <td>${b.fineness ? Number(b.fineness) + ' m²/kg' : '-'}</td>
                            <td><span class="badge ${b.hasil === 'Pass' ? 'badge-success' : 'badge-error'}">${b.hasil || '-'}</span></td>
                            <td><span class="badge ${sniOk ? 'badge-success' : 'badge-warning'}">${sniOk ? '✓ SNI' : '⚠ ' + sniAlerts.length}</span></td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>
        ${batches.length > 20 ? '<p class="text-muted" style="font-size:0.72rem;margin-top:8px;">Menampilkan 20 batch terbaru dari total ' + batches.length + '</p>' : ''}`;
    },

    // ============================================================
    // INIT — Event listeners
    // ============================================================

    async init() {
        const mod = document.getElementById('qc-module');
        if (!mod) return;

        // Tombol buka modal
        const btnAdd = document.getElementById('qc-btn-add');
        const modal = document.getElementById('qc-modal');
        const btnClose = document.getElementById('qc-modal-close');
        const btnCancel = document.getElementById('qc-btn-cancel');
        const btnSubmit = document.getElementById('qc-btn-submit');

        if (btnAdd) {
            btnAdd.addEventListener('click', async () => {
                // Generate batch ID otomatis
                const batchId = await this._generateBatchId();
                document.getElementById('qc-f-batch_id').value = batchId;
                document.getElementById('qc-f-tanggal').value = new Date().toISOString().split('T')[0];
                modal.classList.remove('hidden');
            });
        }

        // Tutup modal
        const closeModal = () => {
            modal.classList.add('hidden');
            document.getElementById('qc-form').reset();
            // Bersihkan error
            document.querySelectorAll('#qc-form .form-error').forEach(el => el.remove());
            document.querySelectorAll('#qc-form .input-error').forEach(el => el.classList.remove('input-error'));
        };

        if (btnClose) btnClose.addEventListener('click', closeModal);
        if (btnCancel) btnCancel.addEventListener('click', closeModal);

        // Klik di luar modal untuk menutup
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
    },

    /**
     * Handle submit form QC
     */
    async _handleFormSubmit() {
        try {
            const form = document.getElementById('qc-form');
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // Tambah batch ID dari field readonly
            data.batch_id = document.getElementById('qc-f-batch_id').value;

            // Konversi angka
            ['berat_zak_avg','berat_zak_min','berat_zak_max','kekuatan_tekan_1d','kekuatan_tekan_3d','kekuatan_tekan_7d','kekuatan_tekan_28d','setting_time_initial','setting_time_final','fineness'].forEach(k => {
                if (data[k] !== undefined && data[k] !== '') {
                    data[k] = parseFloat(data[k]);
                } else {
                    data[k] = null;
                }
            });

            // Validasi
            const validation = this._validateForm(data);
            if (!validation.valid) {
                // Tampilkan error
                document.querySelectorAll('#qc-form .form-error').forEach(el => el.remove());
                document.querySelectorAll('#qc-form .input-error').forEach(el => el.classList.remove('input-error'));
                for (const [field, message] of Object.entries(validation.errors)) {
                    const input = document.querySelector(`#qc-form [name="${field}"]`) || document.getElementById(`qc-f-${field}`);
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

            // Simpan
            const success = await this._saveBatch(data);
            if (success) {
                // Tutup modal
                document.getElementById('qc-modal').classList.add('hidden');
                form.reset();

                // Re-render modul
                await this._refreshModule();

                // Toast sukses
                this._showToast('Hasil QC berhasil disimpan', 'success');
            } else {
                this._showToast('Gagal menyimpan hasil QC', 'error');
            }
        } catch (err) {
            console.error('[QC] Error submit form:', err);
            this._showToast('Terjadi kesalahan saat menyimpan data', 'error');
        }
    },

    /**
     * Re-render modul tanpa reload halaman
     */
    async _refreshModule() {
        try {
            const container = document.getElementById('qc-module');
            if (!container) return;

            const batches = await this._getAllBatches();
            const kpi = this._calculateKPI(batches);
            const sniAlerts = this._getActiveSNIAlerts(batches);

            // Update KPI
            const elPass = document.getElementById('qc-kpi-pass-rate');
            const elBatch = document.getElementById('qc-kpi-batch-tested');
            const elSni = document.getElementById('qc-kpi-sni');
            const elStr = document.getElementById('qc-kpi-avg-strength');
            if (elPass) elPass.textContent = kpi.passRate + '%';
            if (elBatch) elBatch.textContent = kpi.batchTested;
            if (elSni) { elSni.textContent = kpi.sniCompliance + '%'; elSni.className = 'stat-value ' + (kpi.sniCompliance >= 90 ? 'text-success' : 'text-warning'); }
            if (elStr) elStr.textContent = kpi.avgStrength + ' MPa';

            // Update SNI alerts
            const alertArea = document.getElementById('qc-sni-alert-area');
            if (alertArea) alertArea.innerHTML = this._renderSNIAlerts(sniAlerts);

            // Update charts
            const chartEl = document.getElementById('qc-strength-chart');
            if (chartEl) chartEl.innerHTML = this._renderStrengthChart(batches);

            const distEl = document.getElementById('qc-weight-dist');
            if (distEl) distEl.innerHTML = this._renderWeightDistribution(batches);

            // Update batch list
            const listEl = document.getElementById('qc-batch-list');
            if (listEl) listEl.innerHTML = this._renderBatchList(batches);
        } catch (err) {
            console.error('[QC] Error refresh module:', err);
        }
    },

    /**
     * Tampilkan toast notifikasi
     * @param {string} message - Pesan
     * @param {string} type - Tipe: success/error/info/warning
     */
    _showToast(message, type = 'info') {
        try {
            if (window.YWM && YWM.UI && typeof YWM.UI.showToast === 'function') {
                YWM.UI.showToast(message, type);
                return;
            }
            // Fallback: buat toast manual
            const container = document.getElementById('toast-container');
            if (!container) return;
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.innerHTML = `<span>${message}</span>`;
            container.appendChild(toast);
            setTimeout(() => toast.remove(), 4000);
        } catch (err) {
            console.warn('[QC] Gagal menampilkan toast:', err);
        }
    }
};
