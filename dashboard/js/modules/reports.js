/**
 * ============================================================
 * LAPORAN OTOMATIS — Modul Laporan YWM Dashboard
 * PT Yoga Wibawa Mandiri — Cement Bagging Company
 * ============================================================
 *
 * Fitur:
 * 1. Header — Judul "Laporan" + tombol Generate Laporan
 * 2. Report Templates — Kartu untuk setiap tipe laporan
 * 3. Generate Report Modal — Pilih tipe, periode, format
 * 4. Report Viewer — Tampilkan laporan dalam HTML print-friendly
 * 5. Recent Reports — Daftar laporan sebelumnya dari Puter FS/KV
 * 6. AI Report Generation — puter.ai.chat() untuk narasi ringkasan
 * 7. Export — Download sebagai teks/CSV
 *
 * KV: ywm:report:generated:{id}, ywm:report:index:all
 * FS: /ywm-dashboard/exports/
 *
 * @version 1.0.0
 */

window.YWM = window.YWM || {};
window.YWM.Modules = window.YWM.Modules || {};

YWM.Modules.reports = {
    title: 'Laporan',

    /** Konfigurasi tipe laporan yang tersedia */
    _reportTypes: [
        {
            id: 'produksi',
            label: 'Laporan Produksi',
            description: 'Harian / Mingguan / Bulanan — Output, target, yield, downtime',
            icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>`,
            color: 'var(--accent)',
            module: 'production'
        },
        {
            id: 'maintenance',
            label: 'Laporan Maintenance',
            description: 'Ringkasan WO, analisis biaya, MTBF/MTTR',
            icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`,
            color: 'var(--status-warning)',
            module: 'maintenance'
        },
        {
            id: 'quality',
            label: 'Laporan Quality Control',
            description: 'Hasil batch, kepatuhan SNI, rejection rate',
            icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
            color: 'var(--status-success)',
            module: 'quality'
        },
        {
            id: 'keuangan',
            label: 'Laporan Keuangan',
            description: 'P&L, cash flow, margin, biaya operasional',
            icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>`,
            color: 'var(--status-warning)',
            module: 'finance'
        },
        {
            id: 'hse',
            label: 'Laporan HSE',
            description: 'Ringkasan insiden, metrik K3, kepatuhan',
            icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
            color: 'var(--status-error)',
            module: 'safety'
        },
        {
            id: 'spareparts',
            label: 'Laporan Spare Parts',
            description: 'Status inventaris, pemakaian, reorder alert',
            icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>`,
            color: 'var(--status-info)',
            module: 'spareparts'
        }
    ],

    /** State internal modul */
    _state: {
        recentReports: [],
        currentReport: null,
        isGenerating: false
    },

    /**
     * Render tampilan utama modul Laporan
     * @returns {Promise<string>} HTML string
     */
    async render() {
        // Ambil daftar laporan terbaru dari KV
        try {
            const indexData = await YWM.Data.get('ywm:report:index:all');
            this._state.recentReports = indexData ? JSON.parse(indexData) : [];
        } catch (e) {
            this._state.recentReports = [];
        }

        const typeCards = this._reportTypes.map(t => `
            <div class="report-type-card glass glass-hover animate-fade-in" data-report-type="${t.id}" style="cursor:pointer;">
                <div class="report-type-icon" style="color:${t.color}">${t.icon}</div>
                <div class="report-type-info">
                    <h4>${t.label}</h4>
                    <p class="text-muted">${t.description}</p>
                </div>
                <div class="report-type-action">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
            </div>
        `).join('');

        const recentList = this._renderRecentReports();

        return `
            <div class="reports-module animate-fade-in">
                <!-- Header -->
                <div class="module-header" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">
                    <div>
                        <h2 style="font-size:1.5rem;font-weight:700;margin-bottom:4px;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" style="vertical-align:middle;margin-right:8px;">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                            Laporan
                        </h2>
                        <p class="text-muted">Laporan otomatis dan AI-powered untuk operasional PT Yoga Wibawa Mandiri</p>
                    </div>
                    <button class="btn btn-accent" id="btn-generate-report">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Generate Laporan
                    </button>
                </div>

                <!-- Report Templates -->
                <div class="section-title" style="margin-bottom:16px;">
                    <h3 style="font-size:1rem;font-weight:600;color:var(--text-secondary);">Template Laporan</h3>
                </div>
                <div class="report-types-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px;margin-bottom:32px;">
                    ${typeCards}
                </div>

                <!-- Report Viewer (tersembunyi, ditampilkan saat laporan di-generate) -->
                <div id="report-viewer" class="glass" style="display:none;margin-bottom:32px;padding:24px;border-radius:var(--radius-lg);">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
                        <h3 id="report-viewer-title" style="font-size:1.1rem;font-weight:600;">Laporan</h3>
                        <div style="display:flex;gap:8px;">
                            <button class="btn btn-sm" id="btn-print-report" title="Cetak">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                                Cetak
                            </button>
                            <button class="btn btn-sm" id="btn-export-report" title="Export">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                Export
                            </button>
                            <button class="btn btn-sm btn-danger" id="btn-close-viewer" title="Tutup">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>
                    </div>
                    <div id="report-viewer-content" style="line-height:1.7;font-size:0.9rem;"></div>
                </div>

                <!-- Recent Reports -->
                <div class="section-title" style="margin-bottom:16px;">
                    <h3 style="font-size:1rem;font-weight:600;color:var(--text-secondary);">Laporan Terbaru</h3>
                </div>
                <div id="recent-reports-container">
                    ${recentList}
                </div>

                <!-- Generate Report Modal (ditempatkan di dalam modul, ditampilkan via YWM.UI) -->
                <div id="generate-report-modal-template" style="display:none;">
                    <form id="form-generate-report" novalidate>
                        <div style="margin-bottom:16px;">
                            <label class="label-glass" for="sel-report-type">Tipe Laporan *</label>
                            <select id="sel-report-type" class="select-glass" required>
                                <option value="">— Pilih Tipe Laporan —</option>
                                ${this._reportTypes.map(t => `<option value="${t.id}">${t.label}</option>`).join('')}
                            </select>
                        </div>
                        <div style="margin-bottom:16px;">
                            <label class="label-glass" for="sel-report-period">Periode *</label>
                            <select id="sel-report-period" class="select-glass" required>
                                <option value="harian">Harian</option>
                                <option value="mingguan">Mingguan</option>
                                <option value="bulanan">Bulanan</option>
                                <option value="custom">Custom (Rentang Tanggal)</option>
                            </select>
                        </div>
                        <div id="custom-date-range" style="display:none;margin-bottom:16px;">
                            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                                <div>
                                    <label class="label-glass" for="inp-date-from">Dari *</label>
                                    <input type="date" id="inp-date-from" class="input-glass">
                                </div>
                                <div>
                                    <label class="label-glass" for="inp-date-to">Sampai *</label>
                                    <input type="date" id="inp-date-to" class="input-glass">
                                </div>
                            </div>
                        </div>
                        <div style="margin-bottom:16px;">
                            <label class="label-glass" for="sel-report-format">Format Output *</label>
                            <select id="sel-report-format" class="select-glass" required>
                                <option value="html">HTML (Tampilan Dashboard)</option>
                                <option value="pdf">PDF (Simpan ke File)</option>
                                <option value="csv">CSV (Data Tabular)</option>
                            </select>
                        </div>
                        <div style="margin-bottom:16px;">
                            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
                                <input type="checkbox" id="chk-ai-narrative" checked style="accent-color:var(--accent);">
                                <span style="font-size:0.85rem;">Generate narasi AI (ringkasan otomatis)</span>
                            </label>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    /**
     * Render daftar laporan terbaru
     * @returns {string} HTML string
     */
    _renderRecentReports() {
        const reports = this._state.recentReports;
        if (!reports || reports.length === 0) {
            return `
                <div class="glass" style="padding:32px;text-align:center;">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" style="margin-bottom:12px;">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <p class="text-muted">Belum ada laporan yang di-generate</p>
                    <p class="text-muted" style="font-size:0.8rem;">Klik "Generate Laporan" untuk memulai</p>
                </div>
            `;
        }

        // Kelompokkan berdasarkan tanggal
        const grouped = {};
        reports.forEach(r => {
            const dateKey = r.generatedAt ? new Date(r.generatedAt).toISOString().split('T')[0] : 'unknown';
            if (!grouped[dateKey]) grouped[dateKey] = [];
            grouped[dateKey].push(r);
        });

        let html = '';
        const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

        for (const dateKey of sortedDates) {
            const label = typeof formatTanggal === 'function' ? formatTanggal(dateKey, 'short') : dateKey;
            html += `<div style="margin-bottom:16px;">`;
            html += `<p class="text-muted" style="font-size:0.75rem;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">${label}</p>`;
            html += `<div class="glass" style="overflow:hidden;">`;

            grouped[dateKey].forEach((r, idx) => {
                const borderColor = idx > 0 ? 'border-top:1px solid rgba(255,255,255,0.08);' : '';
                const typeConfig = this._reportTypes.find(t => t.id === r.type);
                const typeLabel = typeConfig ? typeConfig.label : r.type;
                const periodLabel = r.period ? r.period.charAt(0).toUpperCase() + r.period.slice(1) : '-';

                html += `
                    <div class="recent-report-item" data-report-id="${r.id}" style="padding:14px 18px;cursor:pointer;${borderColor}transition:background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'">
                        <div style="display:flex;align-items:center;justify-content:space-between;">
                            <div>
                                <span style="font-weight:600;font-size:0.9rem;">${typeLabel}</span>
                                <span class="badge badge-info" style="margin-left:8px;">${periodLabel}</span>
                            </div>
                            <div style="display:flex;align-items:center;gap:12px;">
                                <span class="text-muted" style="font-size:0.75rem;">${typeof formatTanggal === 'function' ? formatTanggal(r.generatedAt, 'time') : ''}</span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                            </div>
                        </div>
                    </div>
                `;
            });

            html += `</div></div>`;
        }

        return html;
    },

    /**
     * Inisialisasi event listener modul
     */
    async init() {
        const self = this;

        // Tombol Generate Laporan — buka modal
        const btnGenerate = document.getElementById('btn-generate-report');
        if (btnGenerate) {
            btnGenerate.addEventListener('click', () => {
                self._openGenerateModal();
            });
        }

        // Klik kartu tipe laporan — langsung buka modal dengan tipe terpilih
        document.querySelectorAll('.report-type-card').forEach(card => {
            card.addEventListener('click', () => {
                const typeId = card.dataset.reportType;
                self._openGenerateModal(typeId);
            });
        });

        // Tutup viewer
        const btnCloseViewer = document.getElementById('btn-close-viewer');
        if (btnCloseViewer) {
            btnCloseViewer.addEventListener('click', () => {
                const viewer = document.getElementById('report-viewer');
                if (viewer) viewer.style.display = 'none';
                self._state.currentReport = null;
            });
        }

        // Cetak laporan
        const btnPrint = document.getElementById('btn-print-report');
        if (btnPrint) {
            btnPrint.addEventListener('click', () => {
                self._printReport();
            });
        }

        // Export laporan
        const btnExport = document.getElementById('btn-export-report');
        if (btnExport) {
            btnExport.addEventListener('click', () => {
                self._exportReport();
            });
        }

        // Klik laporan terbaru — buka di viewer
        document.querySelectorAll('.recent-report-item').forEach(item => {
            item.addEventListener('click', async () => {
                const reportId = item.dataset.reportId;
                if (reportId) {
                    await self._viewReport(reportId);
                }
            });
        });
    },

    /**
     * Buka modal generate laporan
     * @param {string} [preselectedType] - Tipe laporan yang sudah dipilih
     */
    _openGenerateModal(preselectedType) {
        const self = this;
        const modalTemplate = document.getElementById('generate-report-modal-template');
        if (!modalTemplate) return;

        // Tampilkan modal via YWM.UI
        if (YWM.UI && YWM.UI.openModal) {
            YWM.UI.openModal('Generate Laporan', modalTemplate.innerHTML, [
                {
                    label: 'Batal',
                    class: 'btn',
                    action: () => YWM.UI.closeModal()
                },
                {
                    label: 'Generate',
                    class: 'btn btn-accent',
                    id: 'btn-confirm-generate',
                    action: () => self._handleGenerateReport()
                }
            ]);
        }

        // Pre-select tipe jika diberikan
        setTimeout(() => {
            const selType = document.getElementById('sel-report-type');
            if (selType && preselectedType) {
                selType.value = preselectedType;
            }

            // Toggle custom date range
            const selPeriod = document.getElementById('sel-report-period');
            const customRange = document.getElementById('custom-date-range');
            if (selPeriod && customRange) {
                selPeriod.addEventListener('change', () => {
                    customRange.style.display = selPeriod.value === 'custom' ? 'block' : 'none';
                });
            }

            // Set default tanggal
            const inpFrom = document.getElementById('inp-date-from');
            const inpTo = document.getElementById('inp-date-to');
            if (inpFrom) inpFrom.value = new Date().toISOString().split('T')[0];
            if (inpTo) inpTo.value = new Date().toISOString().split('T')[0];
        }, 100);
    },

    /**
     * Handle generate laporan dari form modal
     */
    async _handleGenerateReport() {
        const self = this;

        // Ambil nilai form
        const typeId = document.getElementById('sel-report-type')?.value;
        const period = document.getElementById('sel-report-period')?.value;
        const format = document.getElementById('sel-report-format')?.value;
        const aiNarrative = document.getElementById('chk-ai-narrative')?.checked;
        const dateFrom = document.getElementById('inp-date-from')?.value;
        const dateTo = document.getElementById('inp-date-to')?.value;

        // Validasi
        const validation = this._validateGenerateForm({ typeId, period, format, dateFrom, dateTo });
        if (!validation.valid) {
            if (YWM.UI && YWM.UI.showToast) {
                YWM.UI.showToast(validation.error, 'error');
            }
            return;
        }

        // Tutup modal
        if (YWM.UI && YWM.UI.closeModal) YWM.UI.closeModal();

        // Tampilkan loading
        if (YWM.UI && YWM.UI.showToast) {
            YWM.UI.showToast('Memulai generate laporan...', 'info');
        }

        this._state.isGenerating = true;

        try {
            // Hitung rentang tanggal
            const dateRange = this._calculateDateRange(period, { dateFrom, dateTo });
            const typeConfig = this._reportTypes.find(t => t.id === typeId);

            // Kumpulkan data operasional dari KV
            const operationalData = await this._collectOperationalData(typeId, dateRange);

            // Hitung statistik dasar
            const statistics = this._calculateStatistics(typeId, operationalData);

            // Generate narasi AI jika diminta
            let aiSummary = '';
            if (aiNarrative) {
                try {
                    aiSummary = await this._generateAISummary(typeId, period, statistics, dateRange, operationalData);
                } catch (aiErr) {
                    console.warn('[Reports] Gagal generate AI summary:', aiErr.message);
                    aiSummary = '*Narasi AI tidak tersedia saat ini.*';
                }
            }

            // Susun laporan final
            const reportId = this._generateId();
            const report = {
                id: reportId,
                type: typeId,
                label: typeConfig ? typeConfig.label : typeId,
                period: period,
                dateRange: dateRange,
                format: format,
                generatedAt: new Date().toISOString(),
                generatedBy: YWM.PuterInit?.user?.username || 'Guest',
                statistics: statistics,
                aiSummary: aiSummary,
                data: operationalData
            };

            // Simpan ke KV
            await YWM.Data.set(`ywm:report:generated:${reportId}`, JSON.stringify(report));

            // Update index laporan
            try {
                let index = [];
                const existingIndex = await YWM.Data.get('ywm:report:index:all');
                if (existingIndex) {
                    try { index = JSON.parse(existingIndex); } catch (e) { index = []; }
                }
                index.push({
                    id: reportId,
                    type: typeId,
                    period: period,
                    generatedAt: report.generatedAt
                });
                // Batasi 50 laporan
                if (index.length > 50) index = index.slice(-50);
                await YWM.Data.set('ywm:report:index:all', JSON.stringify(index));
                this._state.recentReports = index;
            } catch (e) {
                console.warn('[Reports] Gagal update index:', e.message);
            }

            // Simpan ke FS jika format PDF
            if (format === 'pdf') {
                try {
                    await this._saveToFS(report);
                } catch (fsErr) {
                    console.warn('[Reports] Gagal simpan ke FS:', fsErr.message);
                }
            }

            // Catat audit log
            if (YWM.Data && YWM.Data.addAuditLog) {
                try {
                    await YWM.Data.addAuditLog('reports', reportId, 'GENERATE', null, { type: typeId, period });
                } catch (e) { /* abaikan */ }
            }

            // Tampilkan laporan di viewer
            this._state.currentReport = report;
            this._displayReport(report);

            // Refresh daftar terbaru
            this._refreshRecentReports();

            if (YWM.UI && YWM.UI.showToast) {
                YWM.UI.showToast(`Laporan ${typeConfig ? typeConfig.label : typeId} berhasil di-generate!`, 'success');
            }

        } catch (error) {
            console.error('[Reports] Gagal generate laporan:', error);
            if (YWM.UI && YWM.UI.showToast) {
                YWM.UI.showToast('Gagal generate laporan: ' + error.message, 'error');
            }
        } finally {
            this._state.isGenerating = false;
        }
    },

    /**
     * Validasi form generate laporan
     * @param {Object} data - Data form
     * @returns {{valid: boolean, error: string|null}}
     */
    _validateGenerateForm(data) {
        if (!data.typeId) {
            return { valid: false, error: 'Tipe laporan wajib dipilih' };
        }
        if (!data.period) {
            return { valid: false, error: 'Periode wajib dipilih' };
        }
        if (!data.format) {
            return { valid: false, error: 'Format output wajib dipilih' };
        }
        if (data.period === 'custom') {
            if (!data.dateFrom) {
                return { valid: false, error: 'Tanggal mulai wajib diisi untuk periode custom' };
            }
            if (!data.dateTo) {
                return { valid: false, error: 'Tanggal akhir wajib diisi untuk periode custom' };
            }
            if (new Date(data.dateFrom) > new Date(data.dateTo)) {
                return { valid: false, error: 'Tanggal mulai tidak boleh lebih besar dari tanggal akhir' };
            }
        }
        return { valid: true, error: null };
    },

    /**
     * Hitung rentang tanggal berdasarkan periode
     * @param {string} period - harian/mingguan/bulanan/custom
     * @param {Object} options - { dateFrom, dateTo }
     * @returns {Object} { dateFrom, dateTo, label }
     */
    _calculateDateRange(period, options = {}) {
        const now = new Date();

        if (period === 'custom' && options.dateFrom && options.dateTo) {
            return {
                dateFrom: options.dateFrom,
                dateTo: options.dateTo,
                label: `${options.dateFrom} s/d ${options.dateTo}`
            };
        }

        const fmt = d => d.toISOString().split('T')[0];

        switch (period) {
            case 'harian':
                return { dateFrom: fmt(now), dateTo: fmt(now), label: `Hari ini (${fmt(now)})` };

            case 'mingguan': {
                const weekStart = new Date(now);
                weekStart.setDate(now.getDate() - now.getDay());
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                return { dateFrom: fmt(weekStart), dateTo: fmt(weekEnd), label: `Minggu ini` };
            }

            case 'bulanan': {
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                return { dateFrom: fmt(monthStart), dateTo: fmt(monthEnd), label: `Bulan ini` };
            }

            default:
                return { dateFrom: fmt(now), dateTo: fmt(now), label: fmt(now) };
        }
    },

    /**
     * Kumpulkan data operasional dari KV berdasarkan tipe laporan
     * @param {string} typeId - ID tipe laporan
     * @param {Object} dateRange - Rentang tanggal
     * @returns {Promise<Array>} Data operasional
     */
    async _collectOperationalData(typeId, dateRange) {
        const kvKeyMap = {
            produksi: 'ywm:production:entries',
            maintenance: 'ywm:maintenance:workorders',
            quality: 'ywm:quality:records',
            keuangan: 'ywm:finance:transactions',
            hse: 'ywm:safety:incidents',
            spareparts: 'ywm:spareparts:items'
        };

        const kvKey = kvKeyMap[typeId];
        if (!kvKey) return [];

        try {
            const stored = await YWM.Data.get(kvKey);
            if (!stored) return [];

            let data = typeof stored === 'string' ? JSON.parse(stored) : stored;
            if (!Array.isArray(data)) data = [data];

            // Filter berdasarkan tanggal jika ada field tanggal
            return data.filter(item => {
                const itemDate = item.tanggal || item.created_at || item.timestamp;
                if (!itemDate) return true; // tanpa tanggal, tampilkan semua
                const d = new Date(itemDate).toISOString().split('T')[0];
                return d >= dateRange.dateFrom && d <= dateRange.dateTo;
            });
        } catch (e) {
            console.warn(`[Reports] Gagal ambil data ${typeId}:`, e.message);
            return [];
        }
    },

    /**
     * Hitung statistik dasar dari data
     * @param {string} typeId - Tipe laporan
     * @param {Array} data - Data operasional
     * @returns {Object} Statistik
     */
    _calculateStatistics(typeId, data) {
        const stats = { totalRecords: data.length };

        if (data.length === 0) return stats;

        switch (typeId) {
            case 'produksi': {
                const totalTarget = data.reduce((s, d) => s + (d.target_zak || d.target || 0), 0);
                const totalRealisasi = data.reduce((s, d) => s + (d.realisasi_zak || d.realisasi || 0), 0);
                const totalDowntime = data.reduce((s, d) => s + (d.downtime_menit || d.downtime || 0), 0);
                stats.pencapaian = totalTarget > 0 ? ((totalRealisasi / totalTarget) * 100).toFixed(1) : 0;
                stats.totalTargetZak = totalTarget;
                stats.totalRealisasiZak = totalRealisasi;
                stats.totalDowntimeMenit = totalDowntime;
                stats.avgDowntime = data.length > 0 ? Math.round(totalDowntime / data.length) : 0;
                break;
            }
            case 'maintenance': {
                const perStatus = {};
                data.forEach(d => {
                    const st = d.status || 'unknown';
                    perStatus[st] = (perStatus[st] || 0) + 1;
                });
                const totalBiaya = data.reduce((s, d) => s + (d.total_biaya || d.biaya || 0), 0);
                stats.perStatus = perStatus;
                stats.totalBiaya = totalBiaya;
                stats.selesai = perStatus['selesai'] || 0;
                stats.completionRate = data.length > 0 ? ((stats.selesai / data.length) * 100).toFixed(1) : 0;
                break;
            }
            case 'quality': {
                const totalBatch = data.length;
                const lulusSNI = data.filter(d => d.sni_compliant !== false && d.status !== 'reject').length;
                stats.totalBatch = totalBatch;
                stats.lulusSNI = lulusSNI;
                stats.ketidakpatuhan = totalBatch - lulusSNI;
                stats.kepatuhanPersen = totalBatch > 0 ? ((lulusSNI / totalBatch) * 100).toFixed(1) : 0;
                break;
            }
            case 'keuangan': {
                const pemasukan = data.filter(d => d.tipe === 'pemasukan').reduce((s, d) => s + (d.jumlah || 0), 0);
                const pengeluaran = data.filter(d => d.tipe === 'pengeluaran').reduce((s, d) => s + (d.jumlah || 0), 0);
                stats.totalPemasukan = pemasukan;
                stats.totalPengeluaran = pengeluaran;
                stats.saldo = pemasukan - pengeluaran;
                stats.margin = pemasukan > 0 ? (((pemasukan - pengeluaran) / pemasukan) * 100).toFixed(1) : 0;
                break;
            }
            case 'hse': {
                const perSeverity = {};
                data.forEach(d => {
                    const sev = d.severity || 'unknown';
                    perSeverity[sev] = (perSeverity[sev] || 0) + 1;
                });
                stats.totalInsiden = data.length;
                stats.perSeverity = perSeverity;
                stats.critical = perSeverity['critical'] || 0;
                stats.nearMiss = data.filter(d => d.tipe === 'near_miss').length;
                break;
            }
            case 'spareparts': {
                const belowReorder = data.filter(d => d.stok_saat_ini <= (d.reorder_point || d.stok_minimum || 0)).length;
                const totalNilai = data.reduce((s, d) => s + ((d.stok_saat_ini || 0) * (d.harga_satuan || 0)), 0);
                stats.totalItems = data.length;
                stats.belowReorder = belowReorder;
                stats.totalNilaiInventaris = totalNilai;
                break;
            }
        }

        return stats;
    },

    /**
     * Generate ringkasan narasi menggunakan AI
     * @param {string} typeId - Tipe laporan
     * @param {string} period - Periode
     * @param {Object} statistics - Statistik
     * @param {Object} dateRange - Rentang tanggal
     * @param {Array} data - Data mentah
     * @returns {Promise<string>} Narasi ringkasan
     */
    async _generateAISummary(typeId, period, statistics, dateRange, data) {
        const typeConfig = this._reportTypes.find(t => t.id === typeId);
        const reportLabel = typeConfig ? typeConfig.label : typeId;

        const prompt = `Generate a summary report for production data at PT Yoga Wibawa Mandiri (cement bagging company).

Jenis Laporan: ${reportLabel}
Periode: ${dateRange.label}
Rentang Tanggal: ${dateRange.dateFrom} s/d ${dateRange.dateTo}

Statistik:
${JSON.stringify(statistics, null, 2)}

Data Sample (maks 10 record terbaru):
${JSON.stringify(data.slice(0, 10), null, 2)}

Buatlah narasi ringkasan dalam Bahasa Indonesia yang formal dan profesional (3-5 paragraf). Sertakan:
1. Ringkasan eksekutif
2. Analisis data utama
3. Temuan penting
4. Rekomendasi tindakan

Gunakan format markdown untuk heading dan emphasis.`;

        const response = await puter.ai.chat(prompt, { model: 'gpt-4o-mini' });
        return typeof response === 'string' ? response : (response?.message?.content || response?.toString() || '');
    },

    /**
     * Tampilkan laporan di viewer
     * @param {Object} report - Objek laporan
     */
    _displayReport(report) {
        const viewer = document.getElementById('report-viewer');
        const titleEl = document.getElementById('report-viewer-title');
        const contentEl = document.getElementById('report-viewer-content');
        if (!viewer || !titleEl || !contentEl) return;

        titleEl.textContent = `${report.label} — ${report.period.charAt(0).toUpperCase() + report.period.slice(1)}`;

        // Konversi markdown sederhana ke HTML
        let htmlContent = '';

        // AI Summary
        if (report.aiSummary) {
            htmlContent += `
                <div style="background:rgba(0,212,255,0.05);border:1px solid rgba(0,212,255,0.15);border-radius:var(--radius-sm);padding:16px;margin-bottom:20px;">
                    <h4 style="color:var(--accent);margin-bottom:8px;font-size:0.9rem;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 011 1v3a1 1 0 01-1 1h-1.27A7 7 0 0112 22a7 7 0 01-6.73-5H4a1 1 0 01-1-1v-3a1 1 0 011-1h1a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2z"/><circle cx="9" cy="14" r="1"/><circle cx="15" cy="14" r="1"/></svg>
                        Ringkasan AI
                    </h4>
                    <div style="font-size:0.85rem;line-height:1.8;">${this._markdownToHtml(report.aiSummary)}</div>
                </div>
            `;
        }

        // Statistik
        if (report.statistics) {
            htmlContent += `
                <div style="margin-bottom:20px;">
                    <h4 style="margin-bottom:12px;font-size:0.9rem;">Statistik</h4>
                    ${this._renderStatisticsTable(report.type, report.statistics)}
                </div>
            `;
        }

        // Info laporan
        htmlContent += `
            <div style="margin-top:16px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.1);font-size:0.75rem;color:var(--text-muted);">
                Di-generate: ${typeof formatTanggal === 'function' ? formatTanggal(report.generatedAt, 'datetime') : report.generatedAt} |
                Oleh: ${report.generatedBy || 'System'} |
                Periode: ${report.dateRange?.label || '-'} |
                Total Data: ${report.statistics?.totalRecords || 0} record
            </div>
        `;

        contentEl.innerHTML = htmlContent;
        viewer.style.display = 'block';
        viewer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    /**
     * Render tabel statistik
     * @param {string} typeId - Tipe laporan
     * @param {Object} stats - Statistik
     * @returns {string} HTML tabel
     */
    _renderStatisticsTable(typeId, stats) {
        const rows = [];
        const addRow = (label, value, unit = '') => {
            rows.push(`<tr><td style="padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.06);color:var(--text-secondary);font-size:0.85rem;">${label}</td><td style="padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.06);font-weight:600;font-size:0.85rem;">${value}${unit}</td></tr>`);
        };

        addRow('Total Data', stats.totalRecords, ' record');

        switch (typeId) {
            case 'produksi':
                addRow('Target Zak', typeof formatAngka === 'function' ? formatAngka(stats.totalTargetZak) : stats.totalTargetZak, ' zak');
                addRow('Realisasi Zak', typeof formatAngka === 'function' ? formatAngka(stats.totalRealisasiZak) : stats.totalRealisasiZak, ' zak');
                addRow('Pencapaian', stats.pencapaian, '%');
                addRow('Total Downtime', typeof formatDurasi === 'function' ? formatDurasi(stats.totalDowntimeMenit) : stats.totalDowntimeMenit + ' menit');
                break;
            case 'maintenance':
                addRow('Completion Rate', stats.completionRate, '%');
                addRow('Total Biaya', typeof formatRupiah === 'function' ? formatRupiah(stats.totalBiaya) : stats.totalBiaya);
                if (stats.perStatus) {
                    Object.entries(stats.perStatus).forEach(([status, count]) => addRow(`WO ${status}`, count));
                }
                break;
            case 'quality':
                addRow('Kepatuhan SNI', stats.kepatuhanPersen, '%');
                addRow('Batch Lulus', stats.lulusSNI);
                addRow('Ketidakpatuhan', stats.ketidakpatuhan);
                break;
            case 'keuangan':
                addRow('Total Pemasukan', typeof formatRupiah === 'function' ? formatRupiah(stats.totalPemasukan) : stats.totalPemasukan);
                addRow('Total Pengeluaran', typeof formatRupiah === 'function' ? formatRupiah(stats.totalPengeluaran) : stats.totalPengeluaran);
                addRow('Saldo', typeof formatRupiah === 'function' ? formatRupiah(stats.saldo) : stats.saldo);
                addRow('Margin', stats.margin, '%');
                break;
            case 'hse':
                addRow('Total Insiden', stats.totalInsiden);
                addRow('Critical', stats.critical);
                addRow('Near Miss', stats.nearMiss);
                break;
            case 'spareparts':
                addRow('Total Item', stats.totalItems);
                addRow('Di Bawah Reorder Point', stats.belowReorder);
                addRow('Nilai Inventaris', typeof formatRupiah === 'function' ? formatRupiah(stats.totalNilaiInventaris) : stats.totalNilaiInventaris);
                break;
        }

        return `<table style="width:100%;border-collapse:collapse;">${rows.join('')}</table>`;
    },

    /**
     * Konversi markdown sederhana ke HTML
     * @param {string} md - Teks markdown
     * @returns {string} HTML
     */
    _markdownToHtml(md) {
        if (!md) return '';
        return md
            .replace(/^### (.*$)/gim, '<h5 style="margin:12px 0 6px;font-size:0.9rem;">$1</h5>')
            .replace(/^## (.*$)/gim, '<h4 style="margin:16px 0 8px;font-size:0.95rem;">$1</h4>')
            .replace(/^# (.*$)/gim, '<h3 style="margin:16px 0 8px;font-size:1.05rem;">$1</h3>')
            .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/gim, '<em>$1</em>')
            .replace(/^- (.*$)/gim, '<li style="margin-left:16px;">$1</li>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');
    },

    /**
     * Lihat laporan dari KV berdasarkan ID
     * @param {string} reportId - ID laporan
     */
    async _viewReport(reportId) {
        try {
            const stored = await YWM.Data.get(`ywm:report:generated:${reportId}`);
            if (!stored) {
                if (YWM.UI && YWM.UI.showToast) YWM.UI.showToast('Laporan tidak ditemukan', 'error');
                return;
            }
            const report = typeof stored === 'string' ? JSON.parse(stored) : stored;
            this._state.currentReport = report;
            this._displayReport(report);
        } catch (e) {
            console.error('[Reports] Gagal memuat laporan:', e);
            if (YWM.UI && YWM.UI.showToast) YWM.UI.showToast('Gagal memuat laporan', 'error');
        }
    },

    /**
     * Cetak laporan (print-friendly)
     */
    _printReport() {
        const report = this._state.currentReport;
        if (!report) return;

        const printWindow = window.open('', '_blank');
        const content = document.getElementById('report-viewer-content')?.innerHTML || '';

        printWindow.document.write(`
            <!DOCTYPE html>
            <html><head>
                <title>${report.label || 'Laporan'} — PT Yoga Wibawa Mandiri</title>
                <style>
                    body { font-family: 'Segoe UI', sans-serif; padding: 24px; color: #222; max-width: 800px; margin: 0 auto; }
                    h1 { font-size: 1.3rem; border-bottom: 2px solid #00d4ff; padding-bottom: 8px; }
                    h2 { font-size: 1.1rem; color: #333; }
                    h3, h4, h5 { color: #444; }
                    table { width: 100%; border-collapse: collapse; }
                    td, th { padding: 8px 12px; border: 1px solid #ddd; }
                    .text-muted { color: #888; }
                    @media print { body { padding: 0; } }
                </style>
            </head><body>
                <h1>${report.label || 'Laporan'} — Periode ${report.period || '-'}</h1>
                <p style="color:#888;font-size:0.85rem;">PT Yoga Wibawa Mandiri | ${report.dateRange?.label || '-'} | Generated: ${typeof formatTanggal === 'function' ? formatTanggal(report.generatedAt, 'datetime') : report.generatedAt}</p>
                <hr style="margin:16px 0;">
                ${content}
            </body></html>
        `);
        printWindow.document.close();
        printWindow.print();
    },

    /**
     * Export laporan sebagai file
     */
    _exportReport() {
        const report = this._state.currentReport;
        if (!report) return;

        const format = report.format || 'html';
        let content, filename, mimeType;

        switch (format) {
            case 'csv': {
                // Export data sebagai CSV
                if (report.data && report.data.length > 0) {
                    content = typeof formatCSV === 'function' ? formatCSV(report.data) : this._simpleCSV(report.data);
                } else {
                    content = 'Tipe,Tanggal,Statistik\n' +
                        `${report.type},${report.dateRange?.dateFrom || ''},${JSON.stringify(report.statistics)}`;
                }
                filename = `laporan_${report.type}_${report.dateRange?.dateFrom || 'export'}.csv`;
                mimeType = 'text/csv';
                break;
            }
            default: {
                // Export sebagai teks
                content = `${report.label || 'Laporan'}\n` +
                    `Periode: ${report.dateRange?.label || '-'}\n` +
                    `Generated: ${report.generatedAt}\n\n` +
                    (report.aiSummary || '') + '\n\n' +
                    `Statistik:\n${JSON.stringify(report.statistics, null, 2)}`;
                filename = `laporan_${report.type}_${report.dateRange?.dateFrom || 'export'}.txt`;
                mimeType = 'text/plain';
                break;
            }
        }

        if (typeof downloadFile === 'function') {
            downloadFile(content, filename, mimeType);
        } else {
            // Fallback download
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        if (YWM.UI && YWM.UI.showToast) {
            YWM.UI.showToast(`Laporan berhasil di-export sebagai ${format.toUpperCase()}`, 'success');
        }
    },

    /**
     * Konversi sederhana data ke CSV
     * @param {Array} data - Array of objects
     * @returns {string} CSV
     */
    _simpleCSV(data) {
        if (!data || !data.length) return '';
        const headers = Object.keys(data[0]);
        const rows = data.map(row => headers.map(h => {
            const val = String(row[h] ?? '');
            return val.includes(',') ? `"${val}"` : val;
        }).join(','));
        return [headers.join(','), ...rows].join('\n');
    },

    /**
     * Simpan laporan ke Puter FS
     * @param {Object} report - Objek laporan
     */
    async _saveToFS(report) {
        try {
            const fsPath = '/ywm-dashboard/exports';
            // Pastikan direktori ada
            try { await puter.fs.mkdir(fsPath); } catch (e) { /* sudah ada */ }

            const fileName = `laporan_${report.type}_${report.period}_${new Date().toISOString().split('T')[0]}.txt`;
            const content = typeof report.aiSummary === 'string' ? report.aiSummary : JSON.stringify(report, null, 2);
            await puter.fs.write(`${fsPath}/${fileName}`, content);
        } catch (e) {
            console.warn('[Reports] Gagal simpan ke FS:', e.message);
        }
    },

    /**
     * Refresh tampilan daftar laporan terbaru
     */
    _refreshRecentReports() {
        const container = document.getElementById('recent-reports-container');
        if (container) {
            container.innerHTML = this._renderRecentReports();
            // Pasang ulang event listener
            document.querySelectorAll('.recent-report-item').forEach(item => {
                item.addEventListener('click', async () => {
                    const reportId = item.dataset.reportId;
                    if (reportId) await this._viewReport(reportId);
                });
            });
        }
    },

    /**
     * Generate ID unik
     * @returns {string} ID
     */
    _generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
    }
};

console.log('[YWM Modules] Reports module dimuat ✓');
