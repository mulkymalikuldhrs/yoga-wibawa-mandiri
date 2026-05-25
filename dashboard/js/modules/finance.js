/**
 * ============================================================
 * FINANCE MODULE
 * PT Yoga Wibawa Mandiri — Dashboard Pengantongan Semen Padang
 * ============================================================
 *
 * Modul ini menangani:
 * - Pencatatan transaksi keuangan (pemasukan & pengeluaran)
 * - Cash flow chart (income vs expenses per bulan)
 * - Budget vs Actual comparison per kategori
 * - Analisis cost per zak (biaya per kantong semen)
 *
 * KV Pattern:
 *   ywm:finance:transaction:TRX-2026-001  → data transaksi individual
 *   ywm:finance:index:all                  → index semua transaksi ID
 *   ywm:finance:budget:{category}          → budget per kategori
 *
 * @version 1.0.0
 */

window.YWM = window.YWM || {};
window.YWM.Modules = window.YWM.Modules || {};

YWM.Modules.finance = {
    title: 'Keuangan',

    // ── Kategori pengeluaran dan pemasukan ──
    CATEGORIES: {
        Pemasukan: ['Produksi', 'Penjualan', 'Jasa', 'Lainnya'],
        Pengeluaran: ['Produksi', 'Maintenance', 'Spare Part', 'Gaji', 'Operasional', 'Listrik', 'Transport', 'Lainnya']
    },

    // ── Budget default per kategori (Rupiah/bulan) ──
    DEFAULT_BUDGETS: {
        'Produksi': 500000000,
        'Maintenance': 150000000,
        'Spare Part': 100000000,
        'Gaji': 300000000,
        'Operasional': 200000000,
        'Listrik': 75000000,
        'Transport': 50000000,
        'Lainnya': 50000000
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
            console.error('[Finance] Gagal mengambil data:', key, err);
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
            console.error('[Finance] Gagal menyimpan data:', key, err);
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
            console.error('[Finance] Gagal menyimpan data + timestamp:', key, err);
            return false;
        }
    },

    async _addAudit(action, recordId, details = {}) {
        try {
            if (window.YWM && YWM.Data && typeof YWM.Data.addAuditLog === 'function') {
                await YWM.Data.addAuditLog('finance', recordId, action, details);
            }
        } catch (err) {
            console.warn('[Finance] Gagal menulis audit log:', err);
        }
    },

    // ============================================================
    // HELPER — Generate Transaction ID otomatis
    // ============================================================

    /**
     * Generate Transaction ID: TRX-YYYY-NNN
     * @returns {Promise<string>}
     */
    async _generateTransactionId() {
        try {
            const year = new Date().getFullYear();
            const prefix = `TRX-${year}-`;
            const index = await this._getData('ywm:finance:index:all') || [];
            const thisYear = index.filter(id => id.startsWith(prefix));
            const nextNum = thisYear.length + 1;
            return `${prefix}${String(nextNum).padStart(3, '0')}`;
        } catch (err) {
            return `TRX-${Date.now()}`;
        }
    },

    /**
     * Ambil semua transaksi dari KV
     * @returns {Promise<Array>}
     */
    async _getAllTransactions() {
        try {
            const index = await this._getData('ywm:finance:index:all') || [];
            const transactions = [];
            for (const trxId of index) {
                const data = await this._getData(`ywm:finance:transaction:${trxId}`);
                if (data) transactions.push(data);
            }
            transactions.sort((a, b) => new Date(b.tanggal || b.createdAt) - new Date(a.tanggal || a.createdAt));
            return transactions;
        } catch (err) {
            console.error('[Finance] Gagal mengambil semua transaksi:', err);
            return [];
        }
    },

    /**
     * Simpan transaksi baru
     * @param {object} trxData
     * @returns {Promise<boolean>}
     */
    async _saveTransaction(trxData) {
        try {
            const trxId = trxData.transaction_id;
            await this._setDataWithTimestamp(`ywm:finance:transaction:${trxId}`, trxData);
            const index = await this._getData('ywm:finance:index:all') || [];
            if (!index.includes(trxId)) {
                index.push(trxId);
                await this._setData('ywm:finance:index:all', index);
            }
            await this._addAudit('CREATE', trxId, { tipe: trxData.tipe, kategori: trxData.kategori, jumlah: trxData.jumlah });
            return true;
        } catch (err) {
            console.error('[Finance] Gagal menyimpan transaksi:', err);
            return false;
        }
    },

    /**
     * Ambil budget per kategori
     * @param {string} category
     * @returns {Promise<number>}
     */
    async _getBudget(category) {
        try {
            const data = await this._getData(`ywm:finance:budget:${category}`);
            if (data && typeof data.amount === 'number') return data.amount;
            return this.DEFAULT_BUDGETS[category] || 0;
        } catch (err) {
            return this.DEFAULT_BUDGETS[category] || 0;
        }
    },

    /**
     * Simpan budget per kategori
     * @param {string} category
     * @param {number} amount
     */
    async _saveBudget(category, amount) {
        try {
            await this._setDataWithTimestamp(`ywm:finance:budget:${category}`, { amount, category, updatedAt: new Date().toISOString() });
        } catch (err) {
            console.error('[Finance] Gagal menyimpan budget:', err);
        }
    },

    // ============================================================
    // VALIDASI
    // ============================================================

    _validateForm(data) {
        const errors = {};
        if (!data.tanggal) errors.tanggal = 'Tanggal wajib diisi';
        if (!data.tipe) errors.tipe = 'Tipe transaksi wajib dipilih';
        if (!data.kategori) errors.kategori = 'Kategori wajib dipilih';
        if (!data.jumlah || isNaN(Number(data.jumlah)) || Number(data.jumlah) <= 0) {
            errors.jumlah = 'Jumlah wajib diisi (angka positif)';
        }
        if (!data.deskripsi || data.deskripsi.trim() === '') errors.deskripsi = 'Deskripsi wajib diisi';
        return { valid: Object.keys(errors).length === 0, errors };
    },

    // ============================================================
    // KPI CALCULATIONS
    // ============================================================

    _calculateKPI(transactions) {
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        // Transaksi bulan ini
        const thisMonthTrx = transactions.filter(t => {
            const d = new Date(t.tanggal);
            return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        });

        const revenue = thisMonthTrx
            .filter(t => t.tipe === 'Pemasukan')
            .reduce((sum, t) => sum + (Number(t.jumlah) || 0), 0);

        const expenses = thisMonthTrx
            .filter(t => t.tipe === 'Pengeluaran')
            .reduce((sum, t) => sum + (Number(t.jumlah) || 0), 0);

        const margin = revenue > 0 ? (((revenue - expenses) / revenue) * 100).toFixed(1) : 0;

        // Cost per zak — estimasi dari produksi bulan ini
        // Asumsi: ambil dari production module atau gunakan estimasi
        const costPerZak = expenses > 0 ? this._estimateCostPerZak(expenses) : 0;

        return { revenue, expenses, margin, costPerZak };
    },

    /**
     * Estimasi cost per zak berdasarkan total pengeluaran
     * @param {number} totalExpenses
     * @returns {number}
     */
    _estimateCostPerZak(totalExpenses) {
        // Estimasi: 15.000 zak/bulan (3 shift × 5000 zak/shift × ~1 hari)
        // Dalam praktik, ambil dari data produksi
        const estimatedZakPerMonth = 15000;
        if (estimatedZakPerMonth > 0) {
            return Math.round(totalExpenses / estimatedZakPerMonth);
        }
        return 0;
    },

    /**
     * Hitung cash flow per bulan (6 bulan terakhir)
     * @param {Array} transactions
     * @returns {Array}
     */
    _calculateCashFlow(transactions) {
        const months = [];
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const month = d.getMonth();
            const year = d.getFullYear();
            const label = formatTanggal(d, 'short').replace(/\s\d{4}$/, '');

            const monthTrx = transactions.filter(t => {
                const td = new Date(t.tanggal);
                return td.getMonth() === month && td.getFullYear() === year;
            });

            const income = monthTrx.filter(t => t.tipe === 'Pemasukan').reduce((s, t) => s + (Number(t.jumlah) || 0), 0);
            const expense = monthTrx.filter(t => t.tipe === 'Pengeluaran').reduce((s, t) => s + (Number(t.jumlah) || 0), 0);

            months.push({ label, income, expense, net: income - expense });
        }

        return months;
    },

    /**
     * Hitung budget vs actual per kategori
     * @param {Array} transactions
     * @returns {Promise<Array>}
     */
    async _calculateBudgetVsActual(transactions) {
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        const thisMonthExpenses = transactions.filter(t => {
            const d = new Date(t.tanggal);
            return d.getMonth() === thisMonth && d.getFullYear() === thisYear && t.tipe === 'Pengeluaran';
        });

        const categoryActuals = {};
        thisMonthExpenses.forEach(t => {
            const cat = t.kategori || 'Lainnya';
            categoryActuals[cat] = (categoryActuals[cat] || 0) + (Number(t.jumlah) || 0);
        });

        const results = [];
        for (const [category, budgetAmount] of Object.entries(this.DEFAULT_BUDGETS)) {
            const budget = await this._getBudget(category);
            const actual = categoryActuals[category] || 0;
            const variance = budget - actual;
            const pct = budget > 0 ? ((actual / budget) * 100).toFixed(0) : 0;

            results.push({
                category,
                budget: budget || budgetAmount,
                actual,
                variance,
                pct: Number(pct)
            });
        }

        // Urutkan: paling over-budget di atas
        results.sort((a, b) => a.variance - b.variance);
        return results;
    },

    /**
     * Hitung breakdown cost per zak
     * @param {Array} transactions
     * @returns {object}
     */
    _calculateCostPerZakBreakdown(transactions) {
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        const expenses = transactions.filter(t => {
            const d = new Date(t.tanggal);
            return d.getMonth() === thisMonth && d.getFullYear() === thisYear && t.tipe === 'Pengeluaran';
        });

        const breakdown = {};
        let total = 0;
        expenses.forEach(t => {
            const cat = t.kategori || 'Lainnya';
            breakdown[cat] = (breakdown[cat] || 0) + (Number(t.jumlah) || 0);
            total += Number(t.jumlah) || 0;
        });

        const estimatedZak = 15000; // Estimasi produksi bulan ini

        const result = {};
        for (const [cat, amount] of Object.entries(breakdown)) {
            result[cat] = {
                total: amount,
                perZak: estimatedZak > 0 ? Math.round(amount / estimatedZak) : 0,
                percentage: total > 0 ? ((amount / total) * 100).toFixed(1) : 0
            };
        }

        return {
            breakdown: result,
            totalExpenses: total,
            totalPerZak: estimatedZak > 0 ? Math.round(total / estimatedZak) : 0,
            estimatedZak
        };
    },

    // ============================================================
    // RENDER
    // ============================================================

    async render() {
        const transactions = await this._getAllTransactions();
        const kpi = this._calculateKPI(transactions);
        const cashFlow = this._calculateCashFlow(transactions);
        const budgetVsActual = await this._calculateBudgetVsActual(transactions);
        const costBreakdown = this._calculateCostPerZakBreakdown(transactions);

        return `
        <div class="module-detail animate-fade-in" id="finance-module">
            <!-- ── HEADER ── -->
            <div class="detail-header" style="flex-wrap:wrap;gap:12px;">
                <div style="display:flex;align-items:center;gap:10px;">
                    <div class="card-icon finance" style="width:36px;height:36px;font-size:1rem;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                    </div>
                    <div>
                        <h2 class="detail-title">Keuangan</h2>
                        <span class="text-muted" style="font-size:0.75rem;">Manajemen Keuangan Operasional</span>
                    </div>
                </div>
                <div style="display:flex;gap:8px;align-items:center;">
                    <select id="finance-filter-period" class="select-glass" style="width:auto;padding:6px 30px 6px 10px;font-size:0.75rem;">
                        <option value="month">Bulan Ini</option>
                        <option value="quarter">Kuartal Ini</option>
                        <option value="year">Tahun Ini</option>
                        <option value="all">Semua</option>
                    </select>
                    <button class="btn btn-accent" id="finance-btn-add">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Tambah Transaksi
                    </button>
                </div>
            </div>

            <!-- ── KPI ROW ── -->
            <div class="card-stats" style="grid-template-columns:repeat(4,1fr);margin-bottom:20px;">
                <div class="stat-item">
                    <div class="stat-value text-success" id="fin-kpi-revenue">${formatRupiah(kpi.revenue, true)}</div>
                    <div class="stat-label">Revenue Bulan Ini</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value text-error" id="fin-kpi-expenses">${formatRupiah(kpi.expenses, true)}</div>
                    <div class="stat-label">Total Pengeluaran</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value ${Number(kpi.margin) >= 15 ? 'text-success' : Number(kpi.margin) >= 5 ? 'text-warning' : 'text-error'}" id="fin-kpi-margin">${kpi.margin}%</div>
                    <div class="stat-label">Margin</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value" id="fin-kpi-cost-zak">${formatRupiah(kpi.costPerZak, true)}/zak</div>
                    <div class="stat-label">Cost per Zak</div>
                </div>
            </div>

            <!-- ── CASH FLOW CHART ── -->
            <div class="glass" style="padding:20px;margin-bottom:20px;border-radius:var(--radius-lg);">
                <h3 style="font-size:0.9rem;font-weight:600;margin-bottom:16px;">Cash Flow — 6 Bulan Terakhir</h3>
                <div id="fin-cashflow-chart">
                    ${this._renderCashFlowChart(cashFlow)}
                </div>
            </div>

            <!-- ── TWO-COLUMN: Budget vs Actual + Cost per Zak ── -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
                <!-- Budget vs Actual -->
                <div class="glass" style="padding:20px;border-radius:var(--radius-lg);">
                    <h3 style="font-size:0.9rem;font-weight:600;margin-bottom:16px;">Budget vs Actual</h3>
                    ${this._renderBudgetVsActual(budgetVsActual)}
                </div>

                <!-- Cost per Zak Analysis -->
                <div class="glass" style="padding:20px;border-radius:var(--radius-lg);">
                    <h3 style="font-size:0.9rem;font-weight:600;margin-bottom:16px;">Cost per Zak Analysis</h3>
                    ${this._renderCostPerZak(costBreakdown)}
                </div>
            </div>

            <!-- ── TRANSACTION LIST ── -->
            <div class="glass" style="padding:20px;border-radius:var(--radius-lg);">
                <h3 style="font-size:0.9rem;font-weight:600;margin-bottom:16px;">Daftar Transaksi</h3>
                <div id="fin-transaction-list">
                    ${this._renderTransactionList(transactions)}
                </div>
            </div>
        </div>

        <!-- ── MODAL: TRANSACTION ENTRY FORM ── -->
        <div id="finance-modal" class="modal-overlay hidden">
            <div class="modal-content" style="max-width:580px;">
                <div class="modal-header">
                    <h3>Tambah Transaksi</h3>
                    <button class="btn-icon btn-sm" id="finance-modal-close">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="finance-form" class="form-grid" novalidate>
                        <div class="form-group full-width">
                            <label class="label-glass">ID Transaksi (otomatis)</label>
                            <input type="text" id="finance-f-transaction_id" class="input-glass" readonly>
                        </div>
                        <div class="form-group">
                            <label class="label-glass">Tanggal *</label>
                            <input type="date" name="tanggal" id="finance-f-tanggal" class="input-glass" required>
                        </div>
                        <div class="form-group">
                            <label class="label-glass">Tipe *</label>
                            <select name="tipe" id="finance-f-tipe" class="select-glass" required>
                                <option value="">— Pilih Tipe —</option>
                                <option value="Pemasukan">📈 Pemasukan</option>
                                <option value="Pengeluaran">📉 Pengeluaran</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="label-glass">Kategori *</label>
                            <select name="kategori" id="finance-f-kategori" class="select-glass" required>
                                <option value="">— Pilih Kategori —</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="label-glass">Jumlah (Rp) *</label>
                            <input type="number" step="1" name="jumlah" id="finance-f-jumlah" class="input-glass" placeholder="1500000" required>
                        </div>
                        <div class="form-group full-width">
                            <label class="label-glass">Deskripsi *</label>
                            <input type="text" name="deskripsi" id="finance-f-deskripsi" class="input-glass" placeholder="Pembayaran invoice dari PT..." required>
                        </div>
                        <div class="form-group full-width">
                            <label class="label-glass">Referensi</label>
                            <input type="text" name="referensi" id="finance-f-referensi" class="input-glass" placeholder="INV-2026-001 / PO-2026-042">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn" id="finance-btn-cancel">Batal</button>
                    <button class="btn btn-accent" id="finance-btn-submit">Simpan Transaksi</button>
                </div>
            </div>
        </div>
        `;
    },

    // ============================================================
    // RENDER HELPERS
    // ============================================================

    _renderCashFlowChart(cashFlow) {
        if (!cashFlow || cashFlow.length === 0) {
            return '<div class="empty-state"><div class="empty-state-icon">📊</div><div class="empty-state-text">Belum ada data cash flow</div></div>';
        }

        // Cari nilai maksimum untuk scaling
        let maxVal = 0;
        cashFlow.forEach(m => {
            if (m.income > maxVal) maxVal = m.income;
            if (m.expense > maxVal) maxVal = m.expense;
        });
        maxVal = maxVal || 1;
        const scaleMax = maxVal;

        return `
        <div style="overflow-x:auto;">
            <!-- Legend -->
            <div style="display:flex;gap:16px;margin-bottom:12px;">
                <span style="display:flex;align-items:center;gap:4px;font-size:0.72rem;">
                    <span style="width:10px;height:10px;border-radius:2px;background:rgba(0,230,118,0.7);display:inline-block;"></span>
                    <span class="text-muted">Pemasukan</span>
                </span>
                <span style="display:flex;align-items:center;gap:4px;font-size:0.72rem;">
                    <span style="width:10px;height:10px;border-radius:2px;background:rgba(255,82,82,0.7);display:inline-block;"></span>
                    <span class="text-muted">Pengeluaran</span>
                </span>
            </div>
            <!-- Chart -->
            <div style="display:flex;gap:12px;align-items:flex-end;min-width:400px;height:180px;padding-bottom:24px;">
                ${cashFlow.map(m => {
                    const incH = m.income > 0 ? Math.max(4, (m.income / scaleMax) * 150) : 0;
                    const expH = m.expense > 0 ? Math.max(4, (m.expense / scaleMax) * 150) : 0;
                    return `
                    <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;min-width:50px;">
                        <div style="display:flex;gap:3px;align-items:flex-end;height:150px;width:100%;">
                            <div style="flex:1;height:${incH}px;background:rgba(0,230,118,0.7);border-radius:3px 3px 0 0;min-height:${incH > 0 ? '3px' : '0'};" title="Pemasukan: ${formatRupiah(m.income)}"></div>
                            <div style="flex:1;height:${expH}px;background:rgba(255,82,82,0.7);border-radius:3px 3px 0 0;min-height:${expH > 0 ? '3px' : '0'};" title="Pengeluaran: ${formatRupiah(m.expense)}"></div>
                        </div>
                        <span style="font-size:0.6rem;color:var(--text-muted);">${m.label}</span>
                        <span style="font-size:0.55rem;color:${m.net >= 0 ? 'var(--status-success)' : 'var(--status-error)'};">${m.net >= 0 ? '+' : ''}${formatAngkaSingkat(m.net)}</span>
                    </div>`;
                }).join('')}
            </div>
        </div>`;
    },

    _renderBudgetVsActual(budgetData) {
        if (!budgetData || budgetData.length === 0) {
            return '<div class="text-muted" style="font-size:0.8rem;">Belum ada data budget</div>';
        }

        return `
        <div style="display:flex;flex-direction:column;gap:10px;">
            ${budgetData.map(b => {
                const barPct = Math.min(b.pct, 150); // Cap visual at 150%
                const isOver = b.pct > 100;
                const isWarning = b.pct > 75 && b.pct <= 100;
                const barColor = isOver ? 'rgba(255,82,82,0.7)' : isWarning ? 'rgba(255,171,0,0.6)' : 'rgba(0,230,118,0.5)';
                return `
                <div style="padding:8px 0;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                        <span style="font-size:0.78rem;font-weight:500;">${b.category}</span>
                        <span style="font-size:0.68rem;" class="${isOver ? 'text-error' : isWarning ? 'text-warning' : 'text-success'}">${b.pct}%</span>
                    </div>
                    <!-- Progress bar -->
                    <div style="width:100%;height:6px;background:rgba(255,255,255,0.08);border-radius:3px;position:relative;">
                        <div style="width:${Math.min(barPct, 100)}%;height:100%;background:${barColor};border-radius:3px;transition:width 0.3s;"></div>
                        ${isOver ? '<div style="position:absolute;left:66.7%;top:-2px;height:10px;border-left:1px dashed rgba(255,82,82,0.5);"></div>' : ''}
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-top:3px;">
                        <span style="font-size:0.62rem;color:var(--text-muted);">Actual: ${formatRupiah(b.actual)}</span>
                        <span style="font-size:0.62rem;color:var(--text-muted);">Budget: ${formatRupiah(b.budget)}</span>
                    </div>
                </div>`;
            }).join('')}
        </div>`;
    },

    _renderCostPerZak(costData) {
        if (!costData || !costData.breakdown || Object.keys(costData.breakdown).length === 0) {
            return `
            <div class="text-muted" style="font-size:0.8rem;">Belum ada data pengeluaran bulan ini</div>
            <div style="margin-top:12px;padding:10px;background:rgba(255,255,255,0.03);border-radius:var(--radius-sm);">
                <div style="font-size:0.72rem;color:var(--text-muted);">
                    <strong>Estimasi produksi:</strong> ~${formatAngka(costData.estimatedZak)} zak/bulan<br>
                    <strong>Cost per Zak:</strong> ${formatRupiah(costData.totalPerZak)}/zak
                </div>
            </div>`;
        }

        // Sort breakdown by total descending
        const sortedEntries = Object.entries(costData.breakdown).sort((a, b) => b[1].total - a[1].total);

        return `
        <!-- Ringkasan -->
        <div style="text-align:center;margin-bottom:16px;padding:12px;background:rgba(0,212,255,0.08);border-radius:var(--radius-sm);border:1px solid rgba(0,212,255,0.15);">
            <div style="font-size:1.4rem;font-weight:700;" class="text-accent">${formatRupiah(costData.totalPerZak)}</div>
            <div style="font-size:0.7rem;color:var(--text-muted);">Total Cost per Zak (est. ${formatAngka(costData.estimatedZak)} zak/bln)</div>
        </div>

        <!-- Breakdown bars -->
        <div style="display:flex;flex-direction:column;gap:8px;">
            ${sortedEntries.map(([cat, data]) => `
            <div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
                    <span style="font-size:0.75rem;">${cat}</span>
                    <span style="font-size:0.68rem;" class="text-muted">${formatRupiah(data.perZak)}/zak (${data.percentage}%)</span>
                </div>
                <div style="width:100%;height:5px;background:rgba(255,255,255,0.08);border-radius:3px;">
                    <div style="width:${data.percentage}%;height:100%;background:rgba(0,212,255,0.5);border-radius:3px;"></div>
                </div>
            </div>`).join('')}
        </div>

        <!-- Total -->
        <div style="margin-top:12px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.06);display:flex;justify-content:space-between;">
            <span style="font-size:0.78rem;font-weight:600;">Total Pengeluaran</span>
            <span style="font-size:0.78rem;font-weight:600;">${formatRupiah(costData.totalExpenses)}</span>
        </div>`;
    },

    _renderTransactionList(transactions) {
        if (!transactions || transactions.length === 0) {
            return '<div class="empty-state"><div class="empty-state-icon">💰</div><div class="empty-state-text">Belum ada transaksi</div><p class="text-muted" style="font-size:0.8rem;">Klik "Tambah Transaksi" untuk memulai pencatatan</p></div>';
        }

        const tipeBadge = (t) => t === 'Pemasukan' ? 'badge-success' : 'badge-error';
        const tipeIcon = (t) => t === 'Pemasukan' ? '📈' : '📉';

        return `
        <div class="data-table-wrapper">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tanggal</th>
                        <th>Tipe</th>
                        <th>Kategori</th>
                        <th style="text-align:right;">Jumlah</th>
                        <th>Deskripsi</th>
                        <th>Ref</th>
                    </tr>
                </thead>
                <tbody>
                    ${transactions.slice(0, 25).map(t => `
                    <tr>
                        <td style="font-weight:600;font-size:0.8rem;">${t.transaction_id || '-'}</td>
                        <td>${t.tanggal ? formatTanggal(t.tanggal, 'short') : '-'}</td>
                        <td><span class="badge ${tipeBadge(t.tipe)}">${tipeIcon(t.tipe)} ${t.tipe || '-'}</span></td>
                        <td>${t.kategori || '-'}</td>
                        <td style="text-align:right;font-weight:600;${t.tipe === 'Pemasukan' ? 'color:var(--status-success)' : 'color:var(--status-error)'};">
                            ${t.tipe === 'Pemasukan' ? '+' : '-'}${formatRupiah(t.jumlah)}
                        </td>
                        <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${t.deskripsi || '-'}</td>
                        <td style="font-size:0.72rem;color:var(--text-muted);">${t.referensi || '-'}</td>
                    </tr>`).join('')}
                </tbody>
            </table>
        </div>
        ${transactions.length > 25 ? '<p class="text-muted" style="font-size:0.72rem;margin-top:8px;">Menampilkan 25 terbaru dari total ' + transactions.length + '</p>' : ''}`;
    },

    // ============================================================
    // INIT — Event listeners
    // ============================================================

    async init() {
        const mod = document.getElementById('finance-module');
        if (!mod) return;

        const modal = document.getElementById('finance-modal');
        const btnAdd = document.getElementById('finance-btn-add');
        const btnClose = document.getElementById('finance-modal-close');
        const btnCancel = document.getElementById('finance-btn-cancel');
        const btnSubmit = document.getElementById('finance-btn-submit');
        const tipeSelect = document.getElementById('finance-f-tipe');
        const kategoriSelect = document.getElementById('finance-f-kategori');

        // Buka modal
        if (btnAdd) {
            btnAdd.addEventListener('click', async () => {
                const trxId = await this._generateTransactionId();
                document.getElementById('finance-f-transaction_id').value = trxId;
                document.getElementById('finance-f-tanggal').value = new Date().toISOString().split('T')[0];
                // Reset kategori
                this._updateCategoryOptions('Pemasukan');
                modal.classList.remove('hidden');
            });
        }

        // Tutup modal
        const closeModal = () => {
            modal.classList.add('hidden');
            document.getElementById('finance-form').reset();
            document.querySelectorAll('#finance-form .form-error').forEach(el => el.remove());
            document.querySelectorAll('#finance-form .input-error').forEach(el => el.classList.remove('input-error'));
        };

        if (btnClose) btnClose.addEventListener('click', closeModal);
        if (btnCancel) btnCancel.addEventListener('click', closeModal);
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
        }

        // Update kategori berdasarkan tipe transaksi
        if (tipeSelect) {
            tipeSelect.addEventListener('change', (e) => {
                this._updateCategoryOptions(e.target.value);
            });
        }

        // Submit form
        if (btnSubmit) {
            btnSubmit.addEventListener('click', async () => {
                await this._handleFormSubmit();
            });
        }

        // Period filter (re-render)
        const periodFilter = document.getElementById('finance-filter-period');
        if (periodFilter) {
            periodFilter.addEventListener('change', async () => {
                await this._refreshModule();
            });
        }
    },

    /**
     * Update opsi kategori berdasarkan tipe transaksi
     * @param {string} tipe - Pemasukan atau Pengeluaran
     */
    _updateCategoryOptions(tipe) {
        const kategoriSelect = document.getElementById('finance-f-kategori');
        if (!kategoriSelect) return;

        const categories = this.CATEGORIES[tipe] || [];
        kategoriSelect.innerHTML = '<option value="">— Pilih Kategori —</option>' +
            categories.map(c => `<option value="${c}">${c}</option>`).join('');
    },

    /**
     * Handle submit form transaksi
     */
    async _handleFormSubmit() {
        try {
            const form = document.getElementById('finance-form');
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            data.transaction_id = document.getElementById('finance-f-transaction_id').value;

            // Konversi jumlah ke number
            if (data.jumlah) data.jumlah = Number(data.jumlah);

            // Validasi
            const validation = this._validateForm(data);
            if (!validation.valid) {
                document.querySelectorAll('#finance-form .form-error').forEach(el => el.remove());
                document.querySelectorAll('#finance-form .input-error').forEach(el => el.classList.remove('input-error'));
                for (const [field, message] of Object.entries(validation.errors)) {
                    const input = document.querySelector(`#finance-form [name="${field}"]`) || document.getElementById(`finance-f-${field}`);
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
            const success = await this._saveTransaction(data);
            if (success) {
                document.getElementById('finance-modal').classList.add('hidden');
                form.reset();
                await this._refreshModule();
                this._showToast('Transaksi berhasil disimpan', 'success');
            } else {
                this._showToast('Gagal menyimpan transaksi', 'error');
            }
        } catch (err) {
            console.error('[Finance] Error submit form:', err);
            this._showToast('Terjadi kesalahan saat menyimpan data', 'error');
        }
    },

    /**
     * Re-render modul
     */
    async _refreshModule() {
        try {
            const transactions = await this._getAllTransactions();
            const kpi = this._calculateKPI(transactions);
            const cashFlow = this._calculateCashFlow(transactions);
            const budgetVsActual = await this._calculateBudgetVsActual(transactions);
            const costBreakdown = this._calculateCostPerZakBreakdown(transactions);

            // Update KPI
            const elRev = document.getElementById('fin-kpi-revenue');
            const elExp = document.getElementById('fin-kpi-expenses');
            const elMar = document.getElementById('fin-kpi-margin');
            const elCPZ = document.getElementById('fin-kpi-cost-zak');
            if (elRev) elRev.textContent = formatRupiah(kpi.revenue, true);
            if (elExp) elExp.textContent = formatRupiah(kpi.expenses, true);
            if (elMar) { elMar.textContent = kpi.margin + '%'; elMar.className = 'stat-value ' + (Number(kpi.margin) >= 15 ? 'text-success' : Number(kpi.margin) >= 5 ? 'text-warning' : 'text-error'); }
            if (elCPZ) elCPZ.textContent = formatRupiah(kpi.costPerZak, true) + '/zak';

            // Update chart
            const chartEl = document.getElementById('fin-cashflow-chart');
            if (chartEl) chartEl.innerHTML = this._renderCashFlowChart(cashFlow);

            // Update transaction list
            const listEl = document.getElementById('fin-transaction-list');
            if (listEl) listEl.innerHTML = this._renderTransactionList(transactions);
        } catch (err) {
            console.error('[Finance] Error refresh module:', err);
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
            console.warn('[Finance] Gagal menampilkan toast:', err);
        }
    }
};
