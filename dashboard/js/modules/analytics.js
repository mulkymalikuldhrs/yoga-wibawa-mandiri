/**
 * ============================================================
 * ANALYTICS — Modul Analytics YWM Dashboard
 * PT Yoga Wibawa Mandiri — Cement Bagging Company
 * ============================================================
 *
 * Fitur:
 * 1. Header — Judul "Analytics" + Period selector (7d/30d/90d/custom)
 * 2. Production Analytics — OEE trend, daily production, shift comparison, downtime
 * 3. Financial Analytics — Revenue trend, cost breakdown pie (CSS), margin trend
 * 4. Maintenance Analytics — WO completion rate, MTBF/MTTR, cost per machine
 * 5. Inventory Analytics — Turnover rate, aging analysis, top used parts
 * 6. AI Forecasting — puter.ai.chat() untuk prediksi produksi minggu depan
 * 7. Semua chart CSS-only (tanpa library eksternal)
 *
 * KV: ywm:analytics:daily:{date}, ywm:analytics:weekly:{week}, ywm:analytics:monthly:{month}
 *
 * @version 1.0.0
 */

window.YWM = window.YWM || {};
window.YWM.Modules = window.YWM.Modules || {};

YWM.Modules.analytics = {
    title: 'Analytics',

    /** State internal */
    _state: {
        period: '30d',
        dateFrom: null,
        dateTo: null,
        analyticsData: null,
        aiForecast: null,
        isLoadingForecast: false
    },

    /**
     * Render tampilan utama modul Analytics
     * @returns {Promise<string>} HTML string
     */
    async render() {
        // Hitung rentang tanggal default
        this._updateDateRange();

        // Muat data analytics
        await this._loadAnalyticsData();

        return `
            <div class="analytics-module animate-fade-in">
                <!-- Header -->
                <div class="module-header" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:12px;">
                    <div>
                        <h2 style="font-size:1.5rem;font-weight:700;margin-bottom:4px;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" style="vertical-align:middle;margin-right:8px;">
                                <path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/>
                            </svg>
                            Analytics
                        </h2>
                        <p class="text-muted">Analisis dan visualisasi data operasional PT Yoga Wibawa Mandiri</p>
                    </div>
                    <div style="display:flex;gap:8px;align-items:center;">
                        <!-- Period Selector -->
                        <div style="display:flex;gap:4px;background:rgba(255,255,255,0.05);border-radius:var(--radius-sm);padding:3px;">
                            <button class="btn btn-sm period-btn ${this._state.period === '7d' ? 'btn-accent' : ''}" data-period="7d" style="border:none;background:${this._state.period === '7d' ? '' : 'transparent'};">7 Hari</button>
                            <button class="btn btn-sm period-btn ${this._state.period === '30d' ? 'btn-accent' : ''}" data-period="30d" style="border:none;background:${this._state.period === '30d' ? '' : 'transparent'};">30 Hari</button>
                            <button class="btn btn-sm period-btn ${this._state.period === '90d' ? 'btn-accent' : ''}" data-period="90d" style="border:none;background:${this._state.period === '90d' ? '' : 'transparent'};">90 Hari</button>
                            <button class="btn btn-sm period-btn ${this._state.period === 'custom' ? 'btn-accent' : ''}" data-period="custom" style="border:none;background:${this._state.period === 'custom' ? '' : 'transparent'};">Custom</button>
                        </div>
                        <div id="custom-period-inputs" style="display:${this._state.period === 'custom' ? 'flex' : 'none'};gap:6px;align-items:center;">
                            <input type="date" id="analytics-date-from" class="input-glass" style="width:140px;padding:6px 10px;font-size:0.8rem;" value="${this._state.dateFrom || ''}">
                            <span class="text-muted" style="font-size:0.8rem;">s/d</span>
                            <input type="date" id="analytics-date-to" class="input-glass" style="width:140px;padding:6px 10px;font-size:0.8rem;" value="${this._state.dateTo || ''}">
                            <button class="btn btn-sm btn-accent" id="btn-apply-custom-period">Terapkan</button>
                        </div>
                    </div>
                </div>

                <!-- Quick Stats Summary -->
                <div id="analytics-summary" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px;margin-bottom:28px;">
                    ${this._renderSummaryCards()}
                </div>

                <!-- Tabs Navigasi -->
                <div style="display:flex;gap:4px;margin-bottom:20px;overflow-x:auto;padding-bottom:4px;">
                    <button class="btn btn-sm analytics-tab active" data-tab="production" style="white-space:nowrap;">
                        📊 Produksi
                    </button>
                    <button class="btn btn-sm analytics-tab" data-tab="financial" style="white-space:nowrap;">
                        💰 Keuangan
                    </button>
                    <button class="btn btn-sm analytics-tab" data-tab="maintenance" style="white-space:nowrap;">
                        🔧 Maintenance
                    </button>
                    <button class="btn btn-sm analytics-tab" data-tab="inventory" style="white-space:nowrap;">
                        📦 Inventaris
                    </button>
                    <button class="btn btn-sm analytics-tab" data-tab="forecast" style="white-space:nowrap;">
                        🤖 AI Forecast
                    </button>
                </div>

                <!-- Tab Contents -->
                <div id="analytics-tab-production" class="analytics-tab-content">
                    ${this._renderProductionAnalytics()}
                </div>
                <div id="analytics-tab-financial" class="analytics-tab-content" style="display:none;">
                    ${this._renderFinancialAnalytics()}
                </div>
                <div id="analytics-tab-maintenance" class="analytics-tab-content" style="display:none;">
                    ${this._renderMaintenanceAnalytics()}
                </div>
                <div id="analytics-tab-inventory" class="analytics-tab-content" style="display:none;">
                    ${this._renderInventoryAnalytics()}
                </div>
                <div id="analytics-tab-forecast" class="analytics-tab-content" style="display:none;">
                    ${this._renderForecastTab()}
                </div>
            </div>
        `;
    },

    /**
     * Inisialisasi event listener
     */
    async init() {
        const self = this;

        // Period selector
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                self._state.period = btn.dataset.period;
                self._updateDateRange();
                self._refreshModule();
            });
        });

        // Custom period apply
        const btnApply = document.getElementById('btn-apply-custom-period');
        if (btnApply) {
            btnApply.addEventListener('click', () => {
                const fromEl = document.getElementById('analytics-date-from');
                const toEl = document.getElementById('analytics-date-to');
                if (fromEl && toEl && fromEl.value && toEl.value) {
                    self._state.dateFrom = fromEl.value;
                    self._state.dateTo = toEl.value;
                    self._refreshModule();
                } else {
                    if (YWM.UI && YWM.UI.showToast) {
                        YWM.UI.showToast('Tanggal mulai dan akhir wajib diisi', 'error');
                    }
                }
            });
        }

        // Tab navigation
        document.querySelectorAll('.analytics-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                // Deaktivasi semua tab
                document.querySelectorAll('.analytics-tab').forEach(t => {
                    t.classList.remove('btn-accent');
                    t.classList.remove('active');
                });
                tab.classList.add('btn-accent', 'active');

                // Sembunyikan semua content
                document.querySelectorAll('.analytics-tab-content').forEach(c => {
                    c.style.display = 'none';
                });

                // Tampilkan content terpilih
                const tabId = tab.dataset.tab;
                const content = document.getElementById(`analytics-tab-${tabId}`);
                if (content) content.style.display = 'block';

                // Jika tab forecast, trigger AI forecast
                if (tabId === 'forecast' && !self._state.aiForecast) {
                    self._runAIForecast();
                }
            });
        });
    },

    /**
     * Update rentang tanggal berdasarkan periode
     */
    _updateDateRange() {
        const now = new Date();
        const fmt = d => d.toISOString().split('T')[0];
        this._state.dateTo = fmt(now);

        switch (this._state.period) {
            case '7d': {
                const d = new Date(now);
                d.setDate(d.getDate() - 6);
                this._state.dateFrom = fmt(d);
                break;
            }
            case '30d': {
                const d = new Date(now);
                d.setDate(d.getDate() - 29);
                this._state.dateFrom = fmt(d);
                break;
            }
            case '90d': {
                const d = new Date(now);
                d.setDate(d.getDate() - 89);
                this._state.dateFrom = fmt(d);
                break;
            }
            case 'custom':
                // Tidak ubah dateFrom/dateTo (sudah diset oleh user)
                break;
        }
    },

    /**
     * Muat data analytics dari KV
     */
    async _loadAnalyticsData() {
        try {
            // Coba ambil data agregat dari KV
            const dailyKey = `ywm:analytics:daily:${this._state.dateFrom}`;
            const stored = await YWM.Data.get(dailyKey);

            if (stored) {
                this._state.analyticsData = typeof stored === 'string' ? JSON.parse(stored) : stored;
            } else {
                // Generate demo data jika belum ada
                this._state.analyticsData = this._generateDemoData();
            }
        } catch (e) {
            console.warn('[Analytics] Gagal memuat data, menggunakan demo data:', e.message);
            this._state.analyticsData = this._generateDemoData();
        }
    },

    /**
     * Generate data demo untuk analytics
     * @returns {Object} Data analytics
     */
    _generateDemoData() {
        const data = {
            production: {
                oee: [],
                daily: [],
                shiftComparison: { pagi: 0, siang: 0, malam: 0 },
                downtime: [],
                totalZak: 0,
                avgYield: 0,
                avgOEE: 0
            },
            financial: {
                revenue: [],
                costs: { material: 0, labor: 0, maintenance: 0, overhead: 0, other: 0 },
                margins: [],
                totalRevenue: 0,
                totalCost: 0,
                avgMargin: 0
            },
            maintenance: {
                woCompletionRate: 0,
                mtbf: 0,
                mttr: 0,
                costPerMachine: [],
                totalWO: 0,
                completedWO: 0
            },
            inventory: {
                turnoverRate: 0,
                agingItems: [],
                topUsedParts: [],
                totalItems: 0,
                totalValue: 0
            }
        };

        const numDays = this._getPeriodDays();
        const now = new Date();

        // Data produksi harian
        for (let i = 0; i < numDays; i++) {
            const date = new Date(now);
            date.setDate(date.getDate() - (numDays - 1 - i));
            const dateStr = date.toISOString().split('T')[0];
            const dayLabel = date.getDate() + '/' + (date.getMonth() + 1);

            const target = 10000 + Math.floor(Math.random() * 2000);
            const realisasi = target * (0.82 + Math.random() * 0.18);
            const yieldPct = (realisasi / target * 100).toFixed(1);
            const oee = (65 + Math.random() * 25).toFixed(1);
            const downtime = Math.floor(Math.random() * 120);

            data.production.daily.push({ date: dateStr, label: dayLabel, target, realisasi: Math.round(realisasi), yield: parseFloat(yieldPct) });
            data.production.oee.push({ date: dateStr, label: dayLabel, oee: parseFloat(oee) });
            data.production.downtime.push({ date: dateStr, label: dayLabel, minutes: downtime });

            data.production.shiftComparison.pagi += 3500 + Math.floor(Math.random() * 1000);
            data.production.shiftComparison.siang += 3000 + Math.floor(Math.random() * 800);
            data.production.shiftComparison.malam += 2500 + Math.floor(Math.random() * 700);
        }

        data.production.totalZak = data.production.daily.reduce((s, d) => s + d.realisasi, 0);
        data.production.avgYield = (data.production.daily.reduce((s, d) => s + d.yield, 0) / data.production.daily.length).toFixed(1);
        data.production.avgOEE = (data.production.oee.reduce((s, d) => s + d.oee, 0) / data.production.oee.length).toFixed(1);

        // Data keuangan
        for (let i = 0; i < numDays; i++) {
            const date = new Date(now);
            date.setDate(date.getDate() - (numDays - 1 - i));
            const dateStr = date.toISOString().split('T')[0];
            const dayLabel = date.getDate() + '/' + (date.getMonth() + 1);

            const revenue = 80000000 + Math.random() * 40000000;
            const margin = 8 + Math.random() * 12;

            data.financial.revenue.push({ date: dateStr, label: dayLabel, amount: Math.round(revenue) });
            data.financial.margins.push({ date: dateStr, label: dayLabel, margin: parseFloat(margin.toFixed(1)) });
        }

        data.financial.totalRevenue = data.financial.revenue.reduce((s, d) => s + d.amount, 0);
        data.financial.costs = {
            material: Math.round(data.financial.totalRevenue * 0.52),
            labor: Math.round(data.financial.totalRevenue * 0.18),
            maintenance: Math.round(data.financial.totalRevenue * 0.12),
            overhead: Math.round(data.financial.totalRevenue * 0.10),
            other: Math.round(data.financial.totalRevenue * 0.05)
        };
        data.financial.totalCost = Object.values(data.financial.costs).reduce((s, v) => s + v, 0);
        data.financial.avgMargin = (data.financial.margins.reduce((s, d) => s + d.margin, 0) / data.financial.margins.length).toFixed(1);

        // Data maintenance
        data.maintenance.totalWO = 40 + Math.floor(Math.random() * 20);
        data.maintenance.completedWO = Math.floor(data.maintenance.totalWO * (0.7 + Math.random() * 0.2));
        data.maintenance.woCompletionRate = ((data.maintenance.completedWO / data.maintenance.totalWO) * 100).toFixed(1);
        data.maintenance.mtbf = (120 + Math.random() * 80).toFixed(0); // jam
        data.maintenance.mttr = (2 + Math.random() * 4).toFixed(1); // jam

        const machines = ['Packer #1', 'Packer #2', 'Conveyor A', 'Conveyor B', 'Silo #1', 'Dust Collector', 'Compressor', 'Crane'];
        data.maintenance.costPerMachine = machines.map(m => ({
            machine: m,
            cost: Math.round(5000000 + Math.random() * 15000000),
            woCount: Math.floor(2 + Math.random() * 6)
        }));

        // Data inventaris
        data.inventory.totalItems = 150 + Math.floor(Math.random() * 50);
        data.inventory.totalValue = Math.round(500000000 + Math.random() * 200000000);
        data.inventory.turnoverRate = (3 + Math.random() * 4).toFixed(1);

        data.inventory.agingItems = [
            { category: '< 30 hari', count: Math.floor(data.inventory.totalItems * 0.55) },
            { category: '30-90 hari', count: Math.floor(data.inventory.totalItems * 0.25) },
            { category: '90-180 hari', count: Math.floor(data.inventory.totalItems * 0.12) },
            { category: '> 180 hari', count: Math.floor(data.inventory.totalItems * 0.08) }
        ];

        const partNames = ['Bearing SKF 6205', 'V-Belt A-68', 'Filter Oli HX40', 'Seal Hydraulic', 'Bolt M12x50', 'Lithium Grease', 'Contact Relay', 'Coupling Fenner'];
        data.inventory.topUsedParts = partNames.map(p => ({
            name: p,
            usage: Math.floor(10 + Math.random() * 50),
            value: Math.round(500000 + Math.random() * 5000000)
        })).sort((a, b) => b.usage - a.usage);

        return data;
    },

    /**
     * Hitung jumlah hari periode
     * @returns {number} Jumlah hari
     */
    _getPeriodDays() {
        if (this._state.dateFrom && this._state.dateTo) {
            const diff = new Date(this._state.dateTo) - new Date(this._state.dateFrom);
            return Math.max(1, Math.ceil(diff / 86400000) + 1);
        }
        return 30;
    },

    /**
     * Render kartu ringkasan
     * @returns {string} HTML
     */
    _renderSummaryCards() {
        const d = this._state.analyticsData;
        if (!d) return '';

        return `
            <div class="glass" style="padding:16px;">
                <p class="text-muted" style="font-size:0.7rem;margin-bottom:4px;">Total Produksi</p>
                <p style="font-size:1.2rem;font-weight:700;color:var(--accent);">${typeof formatAngka === 'function' ? formatAngka(d.production.totalZak) : d.production.totalZak} <span style="font-size:0.75rem;font-weight:400;">zak</span></p>
            </div>
            <div class="glass" style="padding:16px;">
                <p class="text-muted" style="font-size:0.7rem;margin-bottom:4px;">Rata-rata OEE</p>
                <p style="font-size:1.2rem;font-weight:700;color:${parseFloat(d.production.avgOEE) >= 85 ? 'var(--status-success)' : parseFloat(d.production.avgOEE) >= 70 ? 'var(--status-warning)' : 'var(--status-error)'};">${d.production.avgOEE}%</p>
            </div>
            <div class="glass" style="padding:16px;">
                <p class="text-muted" style="font-size:0.7rem;margin-bottom:4px;">Revenue</p>
                <p style="font-size:1.2rem;font-weight:700;color:var(--status-success);">${typeof formatRupiah === 'function' ? formatRupiah(d.financial.totalRevenue, true) : d.financial.totalRevenue}</p>
            </div>
            <div class="glass" style="padding:16px;">
                <p class="text-muted" style="font-size:0.7rem;margin-bottom:4px;">WO Completion</p>
                <p style="font-size:1.2rem;font-weight:700;color:${parseFloat(d.maintenance.woCompletionRate) >= 80 ? 'var(--status-success)' : 'var(--status-warning)'};">${d.maintenance.woCompletionRate}%</p>
            </div>
            <div class="glass" style="padding:16px;">
                <p class="text-muted" style="font-size:0.7rem;margin-bottom:4px;">Avg Margin</p>
                <p style="font-size:1.2rem;font-weight:700;color:var(--accent);">${d.financial.avgMargin}%</p>
            </div>
            <div class="glass" style="padding:16px;">
                <p class="text-muted" style="font-size:0.7rem;margin-bottom:4px;">Inventory Turnover</p>
                <p style="font-size:1.2rem;font-weight:700;color:var(--accent);">${d.inventory.turnoverRate}x</p>
            </div>
        `;
    },

    // ============================================================
    // PRODUCTION ANALYTICS
    // ============================================================

    _renderProductionAnalytics() {
        const d = this._state.analyticsData?.production;
        if (!d) return '<p class="text-muted">Data produksi tidak tersedia</p>';

        return `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                <!-- OEE Trend -->
                <div class="glass" style="padding:20px;grid-column:1/-1;">
                    <h4 style="font-size:0.9rem;margin-bottom:16px;">OEE Trend</h4>
                    ${this._renderBarChart(d.oee.map(o => ({ label: o.label, value: o.oee, max: 100 })), 'var(--accent)', '%')}
                    <div style="display:flex;justify-content:space-between;margin-top:8px;">
                        <span class="text-muted" style="font-size:0.7rem;">Target: 85%</span>
                        <span class="text-muted" style="font-size:0.7rem;">Rata-rata: ${d.avgOEE}%</span>
                    </div>
                </div>

                <!-- Daily Production -->
                <div class="glass" style="padding:20px;">
                    <h4 style="font-size:0.9rem;margin-bottom:16px;">Produksi Harian (Target vs Realisasi)</h4>
                    ${this._renderDualBarChart(
                        d.daily.map(x => ({ label: x.label, value: x.realisasi, max: 12000 })),
                        d.daily.map(x => ({ label: x.label, value: x.target, max: 12000 })),
                        'var(--accent)',
                        'rgba(255,255,255,0.2)'
                    )}
                </div>

                <!-- Shift Comparison -->
                <div class="glass" style="padding:20px;">
                    <h4 style="font-size:0.9rem;margin-bottom:16px;">Perbandingan Shift</h4>
                    ${this._renderHorizontalBarChart([
                        { label: 'Pagi', value: d.shiftComparison.pagi, color: 'var(--accent)' },
                        { label: 'Siang', value: d.shiftComparison.siang, color: 'var(--status-warning)' },
                        { label: 'Malam', value: d.shiftComparison.malam, color: 'var(--status-info)' }
                    ])}
                </div>

                <!-- Downtime Analysis -->
                <div class="glass" style="padding:20px;grid-column:1/-1;">
                    <h4 style="font-size:0.9rem;margin-bottom:16px;">Analisis Downtime</h4>
                    ${this._renderBarChart(d.downtime.map(dt => ({ label: dt.label, value: dt.minutes, max: 120 })), 'var(--status-error)', ' menit')}
                </div>
            </div>
        `;
    },

    // ============================================================
    // FINANCIAL ANALYTICS
    // ============================================================

    _renderFinancialAnalytics() {
        const d = this._state.analyticsData?.financial;
        if (!d) return '<p class="text-muted">Data keuangan tidak tersedia</p>';

        // Hitung total untuk pie chart
        const totalCost = Object.values(d.costs).reduce((s, v) => s + v, 0);

        return `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                <!-- Revenue Trend -->
                <div class="glass" style="padding:20px;grid-column:1/-1;">
                    <h4 style="font-size:0.9rem;margin-bottom:16px;">Revenue Trend</h4>
                    ${this._renderBarChart(d.revenue.map(r => ({
                        label: r.label,
                        value: r.amount / 1000000, // juta
                        max: 150
                    })), 'var(--status-success)', ' Jt')}
                </div>

                <!-- Cost Breakdown Pie (CSS) -->
                <div class="glass" style="padding:20px;">
                    <h4 style="font-size:0.9rem;margin-bottom:16px;">Breakdown Biaya</h4>
                    ${this._renderCSSPieChart([
                        { label: 'Material', value: d.costs.material, color: '#00d4ff' },
                        { label: 'Tenaga Kerja', value: d.costs.labor, color: '#ffab00' },
                        { label: 'Maintenance', value: d.costs.maintenance, color: '#ff5252' },
                        { label: 'Overhead', value: d.costs.overhead, color: '#00e676' },
                        { label: 'Lainnya', value: d.costs.other, color: '#ab47bc' }
                    ], totalCost)}
                </div>

                <!-- Margin Trend -->
                <div class="glass" style="padding:20px;">
                    <h4 style="font-size:0.9rem;margin-bottom:16px;">Margin Trend</h4>
                    ${this._renderBarChart(d.margins.map(m => ({
                        label: m.label,
                        value: m.margin,
                        max: 25
                    })), 'var(--status-success)', '%')}
                    <p class="text-muted" style="font-size:0.7rem;margin-top:8px;">Rata-rata margin: ${d.avgMargin}%</p>
                </div>
            </div>
        `;
    },

    // ============================================================
    // MAINTENANCE ANALYTICS
    // ============================================================

    _renderMaintenanceAnalytics() {
        const d = this._state.analyticsData?.maintenance;
        if (!d) return '<p class="text-muted">Data maintenance tidak tersedia</p>';

        return `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                <!-- WO Completion Rate -->
                <div class="glass" style="padding:20px;">
                    <h4 style="font-size:0.9rem;margin-bottom:16px;">Work Order Completion Rate</h4>
                    ${this._renderDonutChart(parseFloat(d.woCompletionRate), d.completedWO, d.totalWO - d.completedWO)}
                    <div style="text-align:center;margin-top:12px;">
                        <p style="font-size:1.5rem;font-weight:700;color:${parseFloat(d.woCompletionRate) >= 80 ? 'var(--status-success)' : 'var(--status-warning)'};">${d.woCompletionRate}%</p>
                        <p class="text-muted" style="font-size:0.8rem;">${d.completedWO} dari ${d.totalWO} WO selesai</p>
                    </div>
                </div>

                <!-- MTBF / MTTR -->
                <div class="glass" style="padding:20px;">
                    <h4 style="font-size:0.9rem;margin-bottom:16px;">MTBF / MTTR</h4>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:20px;">
                        <div style="text-align:center;padding:20px;background:rgba(0,230,118,0.05);border-radius:var(--radius-sm);">
                            <p class="text-muted" style="font-size:0.7rem;margin-bottom:8px;">MTBF (Mean Time Between Failure)</p>
                            <p style="font-size:2rem;font-weight:700;color:var(--status-success);">${d.mtbf}</p>
                            <p class="text-muted" style="font-size:0.75rem;">jam</p>
                        </div>
                        <div style="text-align:center;padding:20px;background:rgba(255,82,82,0.05);border-radius:var(--radius-sm);">
                            <p class="text-muted" style="font-size:0.7rem;margin-bottom:8px;">MTTR (Mean Time To Repair)</p>
                            <p style="font-size:2rem;font-weight:700;color:var(--status-error);">${d.mttr}</p>
                            <p class="text-muted" style="font-size:0.75rem;">jam</p>
                        </div>
                    </div>
                </div>

                <!-- Cost per Machine -->
                <div class="glass" style="padding:20px;grid-column:1/-1;">
                    <h4 style="font-size:0.9rem;margin-bottom:16px;">Biaya Maintenance per Mesin</h4>
                    ${this._renderHorizontalBarChart(
                        d.costPerMachine
                            .sort((a, b) => b.cost - a.cost)
                            .slice(0, 6)
                            .map(m => ({
                                label: m.machine,
                                value: m.cost / 1000000, // juta
                                color: m.cost > 10000000 ? 'var(--status-error)' : m.cost > 5000000 ? 'var(--status-warning)' : 'var(--status-success)'
                            }))
                    )}
                    <p class="text-muted" style="font-size:0.7rem;margin-top:8px;">Dalam jutaan Rupiah</p>
                </div>
            </div>
        `;
    },

    // ============================================================
    // INVENTORY ANALYTICS
    // ============================================================

    _renderInventoryAnalytics() {
        const d = this._state.analyticsData?.inventory;
        if (!d) return '<p class="text-muted">Data inventaris tidak tersedia</p>';

        return `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                <!-- Aging Analysis -->
                <div class="glass" style="padding:20px;">
                    <h4 style="font-size:0.9rem;margin-bottom:16px;">Aging Analysis</h4>
                    ${this._renderHorizontalBarChart(
                        d.agingItems.map(a => ({
                            label: a.category,
                            value: a.count,
                            color: a.category.includes('180') ? 'var(--status-error)' : a.category.includes('90') ? 'var(--status-warning)' : 'var(--status-success)'
                        }))
                    )}
                    <p class="text-muted" style="font-size:0.7rem;margin-top:8px;">Total item: ${d.totalItems}</p>
                </div>

                <!-- Turnover & Value -->
                <div class="glass" style="padding:20px;">
                    <h4 style="font-size:0.9rem;margin-bottom:16px;">Ringkasan Inventaris</h4>
                    <div style="display:grid;gap:16px;margin-top:12px;">
                        <div style="padding:16px;background:rgba(0,212,255,0.05);border-radius:var(--radius-sm);text-align:center;">
                            <p class="text-muted" style="font-size:0.7rem;margin-bottom:6px;">Turnover Rate</p>
                            <p style="font-size:2rem;font-weight:700;color:var(--accent);">${d.turnoverRate}x</p>
                        </div>
                        <div style="padding:16px;background:rgba(0,230,118,0.05);border-radius:var(--radius-sm);text-align:center;">
                            <p class="text-muted" style="font-size:0.7rem;margin-bottom:6px;">Total Nilai Inventaris</p>
                            <p style="font-size:1.3rem;font-weight:700;color:var(--status-success);">${typeof formatRupiah === 'function' ? formatRupiah(d.totalValue) : d.totalValue}</p>
                        </div>
                    </div>
                </div>

                <!-- Top Used Parts -->
                <div class="glass" style="padding:20px;grid-column:1/-1;">
                    <h4 style="font-size:0.9rem;margin-bottom:16px;">Spare Part Paling Banyak Digunakan</h4>
                    ${this._renderHorizontalBarChart(
                        d.topUsedParts.slice(0, 6).map(p => ({
                            label: p.name,
                            value: p.usage,
                            color: 'var(--accent)'
                        }))
                    )}
                </div>
            </div>
        `;
    },

    // ============================================================
    // AI FORECAST TAB
    // ============================================================

    _renderForecastTab() {
        return `
            <div class="glass" style="padding:24px;">
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2">
                        <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 011 1v3a1 1 0 01-1 1h-1.27A7 7 0 0112 22a7 7 0 01-6.73-5H4a1 1 0 01-1-1v-3a1 1 0 011-1h1a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2z"/>
                        <circle cx="9" cy="14" r="1"/><circle cx="15" cy="14" r="1"/>
                    </svg>
                    <div>
                        <h4 style="font-size:1rem;">AI Forecasting</h4>
                        <p class="text-muted" style="font-size:0.8rem;">Prediksi produksi minggu depan berdasarkan data historis</p>
                    </div>
                </div>
                <div id="forecast-content">
                    <div style="text-align:center;padding:32px;">
                        <p class="text-muted" style="margin-bottom:12px;">Klik tombol di bawah untuk menjalankan AI forecasting</p>
                        <button class="btn btn-accent" id="btn-run-forecast">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                            Jalankan AI Forecast
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Jalankan AI forecasting
     */
    async _runAIForecast() {
        const btn = document.getElementById('btn-run-forecast');
        const container = document.getElementById('forecast-content');
        if (!container) return;

        // Tampilkan loading
        container.innerHTML = `
            <div style="text-align:center;padding:32px;">
                <div class="spinner spinner-lg" style="margin:0 auto 16px;"></div>
                <p style="color:var(--accent);">AI sedang menganalisis data historis...</p>
                <p class="text-muted" style="font-size:0.8rem;">Proses ini membutuhkan beberapa detik</p>
            </div>
        `;

        try {
            const d = this._state.analyticsData;
            const productionSummary = d.production.daily.slice(-14).map(p =>
                `${p.date}: target ${p.target} zak, realisasi ${p.realisasi} zak, yield ${p.yield}%`
            ).join('\n');

            const oeeSummary = d.production.oee.slice(-14).map(o =>
                `${o.date}: OEE ${o.oee}%`
            ).join('\n');

            const prompt = `Kamu adalah analis data untuk PT Yoga Wibawa Mandiri, perusahaan pengemasan semen (cement bagging). Berdasarkan data historis berikut, prediksi produksi untuk minggu depan (7 hari ke depan).

Data Produksi 14 Hari Terakhir:
${productionSummary}

Data OEE 14 Hari Terakhir:
${oeeSummary}

Statistik Ringkasan:
- Rata-rata OEE: ${d.production.avgOEE}%
- Rata-rata Yield: ${d.production.avgYield}%
- Total Produksi Periode: ${typeof formatAngka === 'function' ? formatAngka(d.production.totalZak) : d.production.totalZak} zak

Berikan prediksi dalam format berikut:
1. Prediksi harian (7 hari) dalam format tabel
2. Estimasi total produksi minggu depan
3. Faktor-faktor yang mempengaruhi prediksi
4. Rekomendasi untuk meningkatkan output
5. Level keyakinan prediksi (High/Medium/Low)

Gunakan Bahasa Indonesia yang formal.`;

            const response = await puter.ai.chat(prompt, { model: 'gpt-4o-mini' });
            const forecastText = typeof response === 'string' ? response : (response?.message?.content || response?.toString() || 'Forecast tidak tersedia');

            this._state.aiForecast = forecastText;

            // Simpan ke KV
            try {
                await YWM.Data.setWithTimestamp(
                    `ywm:analytics:daily:${new Date().toISOString().split('T')[0]}`,
                    JSON.stringify({ ...d, aiForecast: forecastText })
                );
            } catch (e) { /* abaikan */ }

            // Render hasil
            container.innerHTML = `
                <div style="background:rgba(0,212,255,0.05);border:1px solid rgba(0,212,255,0.15);border-radius:var(--radius-sm);padding:20px;">
                    <h4 style="color:var(--accent);margin-bottom:12px;font-size:0.9rem;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        Hasil AI Forecast
                    </h4>
                    <div style="font-size:0.85rem;line-height:1.8;">${this._markdownToHtml(forecastText)}</div>
                    <div style="margin-top:16px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.1);font-size:0.7rem;color:var(--text-muted);">
                        Di-generate: ${typeof formatTanggal === 'function' ? formatTanggal(new Date(), 'datetime') : new Date().toLocaleString()} | Model: GPT-4o-mini
                    </div>
                </div>
                <div style="margin-top:12px;text-align:center;">
                    <button class="btn btn-sm" id="btn-rerun-forecast">🔄 Jalankan Ulang Forecast</button>
                </div>
            `;

            // Re-run button
            const btnRerun = document.getElementById('btn-rerun-forecast');
            if (btnRerun) {
                btnRerun.addEventListener('click', () => {
                    this._state.aiForecast = null;
                    this._runAIForecast();
                });
            }

        } catch (error) {
            console.error('[Analytics] Gagal menjalankan AI forecast:', error);
            container.innerHTML = `
                <div style="text-align:center;padding:32px;">
                    <p style="color:var(--status-error);margin-bottom:12px;">Gagal menjalankan AI forecasting</p>
                    <p class="text-muted" style="font-size:0.8rem;margin-bottom:16px;">${error.message}</p>
                    <button class="btn btn-sm btn-accent" id="btn-retry-forecast">Coba Lagi</button>
                </div>
            `;
            const btnRetry = document.getElementById('btn-retry-forecast');
            if (btnRetry) {
                btnRetry.addEventListener('click', () => this._runAIForecast());
            }
        }
    },

    // ============================================================
    // CSS-ONLY CHART RENDERERS
    // ============================================================

    /**
     * Render bar chart vertikal CSS-only
     * @param {Array} data - [{label, value, max}]
     * @param {string} color - Warna bar
     * @param {string} unit - Satuan nilai
     * @returns {string} HTML
     */
    _renderBarChart(data, color = 'var(--accent)', unit = '') {
        if (!data || data.length === 0) return '<p class="text-muted" style="font-size:0.8rem;">Tidak ada data</p>';

        // Batasi jumlah bar yang ditampilkan
        const maxBars = 20;
        const displayData = data.length > maxBars ? data.filter((_, i) => i % Math.ceil(data.length / maxBars) === 0) : data;
        const globalMax = Math.max(...displayData.map(d => d.max || d.value), 1);

        const bars = displayData.map(d => {
            const height = Math.max(2, (d.value / globalMax) * 100);
            return `
                <div style="display:flex;flex-direction:column;align-items:center;flex:1;min-width:20px;">
                    <span style="font-size:0.6rem;color:var(--text-muted);margin-bottom:4px;">${typeof d.value === 'number' ? (d.value > 1000 ? (d.value / 1000).toFixed(0) + 'k' : d.value.toFixed ? d.value.toFixed(0) : d.value) : d.value}</span>
                    <div style="width:100%;max-width:28px;height:${height}%;background:${color};border-radius:3px 3px 0 0;min-height:2px;transition:height 0.3s;opacity:0.85;"></div>
                    <span style="font-size:0.55rem;color:var(--text-muted);margin-top:4px;transform:rotate(-45deg);white-space:nowrap;max-width:40px;overflow:hidden;text-overflow:ellipsis;">${d.label}</span>
                </div>
            `;
        }).join('');

        return `
            <div style="display:flex;align-items:flex-end;height:160px;gap:2px;padding:0 4px;">
                ${bars}
            </div>
        `;
    },

    /**
     * Render dual bar chart (dua set bar berdampingan)
     * @param {Array} data1 - Data set pertama
     * @param {Array} data2 - Data set kedua
     * @param {string} color1 - Warna bar pertama
     * @param {string} color2 - Warna bar kedua
     * @returns {string} HTML
     */
    _renderDualBarChart(data1, data2, color1 = 'var(--accent)', color2 = 'rgba(255,255,255,0.2)') {
        if (!data1 || data1.length === 0) return '<p class="text-muted" style="font-size:0.8rem;">Tidak ada data</p>';

        const maxBars = 15;
        const displayData1 = data1.length > maxBars ? data1.filter((_, i) => i % Math.ceil(data1.length / maxBars) === 0) : data1;
        const displayData2 = data2.length > maxBars ? data2.filter((_, i) => i % Math.ceil(data2.length / maxBars) === 0) : data2;

        const globalMax = Math.max(
            ...displayData1.map(d => d.max || d.value),
            ...displayData2.map(d => d.max || d.value),
            1
        );

        const bars = displayData1.map((d1, i) => {
            const d2 = displayData2[i] || { value: 0 };
            const h1 = Math.max(2, (d1.value / globalMax) * 100);
            const h2 = Math.max(2, (d2.value / globalMax) * 100);
            return `
                <div style="display:flex;flex-direction:column;align-items:center;flex:1;min-width:24px;">
                    <div style="display:flex;gap:1px;width:100%;max-width:36px;height:140px;align-items:flex-end;">
                        <div style="flex:1;height:${h2}%;background:${color2};border-radius:2px 2px 0 0;min-height:2px;"></div>
                        <div style="flex:1;height:${h1}%;background:${color1};border-radius:2px 2px 0 0;min-height:2px;"></div>
                    </div>
                    <span style="font-size:0.5rem;color:var(--text-muted);margin-top:4px;">${d1.label}</span>
                </div>
            `;
        }).join('');

        return `
            <div style="display:flex;align-items:flex-end;height:160px;gap:2px;padding:0 4px;">
                ${bars}
            </div>
            <div style="display:flex;gap:16px;margin-top:8px;justify-content:center;">
                <span style="font-size:0.7rem;display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;background:${color2};border-radius:2px;display:inline-block;"></span>Target</span>
                <span style="font-size:0.7rem;display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;background:${color1};border-radius:2px;display:inline-block;"></span>Realisasi</span>
            </div>
        `;
    },

    /**
     * Render horizontal bar chart CSS-only
     * @param {Array} data - [{label, value, color}]
     * @returns {string} HTML
     */
    _renderHorizontalBarChart(data) {
        if (!data || data.length === 0) return '<p class="text-muted" style="font-size:0.8rem;">Tidak ada data</p>';

        const maxVal = Math.max(...data.map(d => d.value), 1);

        return `
            <div style="display:flex;flex-direction:column;gap:10px;">
                ${data.map(d => {
                    const width = Math.max(3, (d.value / maxVal) * 100);
                    const displayVal = d.value >= 1000000 ? (d.value / 1000000).toFixed(1) + ' Jt' :
                                       d.value >= 1000 ? (d.value / 1000).toFixed(0) + 'k' : d.value;
                    return `
                        <div>
                            <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                                <span style="font-size:0.8rem;">${d.label}</span>
                                <span style="font-size:0.75rem;color:var(--text-secondary);font-weight:600;">${displayVal}</span>
                            </div>
                            <div style="width:100%;height:20px;background:rgba(255,255,255,0.05);border-radius:4px;overflow:hidden;">
                                <div style="width:${width}%;height:100%;background:${d.color || 'var(--accent)'};border-radius:4px;transition:width 0.5s;opacity:0.85;"></div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    /**
     * Render CSS-only pie chart (conic-gradient)
     * @param {Array} data - [{label, value, color}]
     * @param {number} total - Total nilai
     * @returns {string} HTML
     */
    _renderCSSPieChart(data, total) {
        if (!data || data.length === 0 || total <= 0) return '<p class="text-muted">Tidak ada data</p>';

        // Hitung conic-gradient stops
        let gradientStops = [];
        let cumulativePercent = 0;

        data.forEach(d => {
            const percent = (d.value / total) * 100;
            gradientStops.push(`${d.color} ${cumulativePercent}% ${cumulativePercent + percent}%`);
            cumulativePercent += percent;
        });

        const gradientCSS = `conic-gradient(${gradientStops.join(', ')})`;

        const legend = data.map(d => {
            const percent = ((d.value / total) * 100).toFixed(1);
            return `
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                    <span style="width:10px;height:10px;border-radius:2px;background:${d.color};flex-shrink:0;"></span>
                    <span style="font-size:0.78rem;flex:1;">${d.label}</span>
                    <span style="font-size:0.75rem;color:var(--text-secondary);font-weight:600;">${percent}%</span>
                </div>
            `;
        }).join('');

        return `
            <div style="display:flex;align-items:center;gap:24px;">
                <div style="width:140px;height:140px;border-radius:50%;background:${gradientCSS};flex-shrink:0;position:relative;">
                    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:60px;height:60px;border-radius:50%;background:var(--bg-gradient-mid);display:flex;align-items:center;justify-content:center;">
                        <span style="font-size:0.65rem;color:var(--text-muted);text-align:center;">Cost<br>Breakdown</span>
                    </div>
                </div>
                <div style="flex:1;">
                    ${legend}
                </div>
            </div>
        `;
    },

    /**
     * Render donut chart CSS-only
     * @param {number} percentage - Persentase
     * @param {number} completed - Nilai selesai
     * @param {number} remaining - Nilai tersisa
     * @returns {string} HTML
     */
    _renderDonutChart(percentage, completed, remaining) {
        const color = percentage >= 80 ? 'var(--status-success)' : percentage >= 60 ? 'var(--status-warning)' : 'var(--status-error)';
        const gradientCSS = `conic-gradient(${color} 0% ${percentage}%, rgba(255,255,255,0.1) ${percentage}% 100%)`;

        return `
            <div style="display:flex;justify-content:center;">
                <div style="width:120px;height:120px;border-radius:50%;background:${gradientCSS};position:relative;">
                    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:70px;height:70px;border-radius:50%;background:var(--bg-gradient-mid);display:flex;align-items:center;justify-content:center;flex-direction:column;">
                        <span style="font-size:1.1rem;font-weight:700;color:${color};">${percentage.toFixed(0)}%</span>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Konversi markdown sederhana ke HTML
     * @param {string} md - Markdown
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
            .replace(/^\|(.+)\|$/gim, (match) => {
                const cells = match.split('|').filter(c => c.trim());
                return '<tr>' + cells.map(c => `<td style="padding:6px 10px;border:1px solid rgba(255,255,255,0.1);font-size:0.8rem;">${c.trim()}</td>`).join('') + '</tr>';
            })
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');
    },

    /**
     * Refresh modul (re-render)
     */
    async _refreshModule() {
        this._updateDateRange();
        await this._loadAnalyticsData();

        // Re-render seluruh modul via App
        if (YWM.App && YWM.App.renderModule) {
            await YWM.App.renderModule('analytics');
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

console.log('[YWM Modules] Analytics module dimuat ✓');
