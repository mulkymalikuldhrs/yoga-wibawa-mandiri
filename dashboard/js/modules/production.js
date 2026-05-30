/**
 * ============================================================
 * MODUL PRODUCTION TRACKER
 * PT Yoga Wibawa Mandiri — Dashboard Teknis
 * ============================================================
 *
 * Modul ini mengelola tracking produksi harian untuk
 * perusahaan pengantongan semen, termasuk:
 * - KPI Cards: Curah Diterima, Kantong Diisi, Distribusi, OEE
 * - Form input produksi per shift (modal)
 * - Tabel data produksi harian dengan breakdown shift
 * - CSS-only bar chart: target vs actual per hari
 * - Shift summary: perbandingan shift saat ini vs sebelumnya
 * - Smart Input AI: input bahasa natural / suara
 * - Date picker untuk navigasi tanggal
 *
 * KV Store patterns:
 * - ywm:production:daily:2026-05-25 → {date, shifts:[...], total_curah, ...}
 * - ywm:production:index:all → ["2026-05-25", "2026-05-24", ...]
 *
 * @version 1.0.0
 * @author YWM Development Team
 */

window.YWM = window.YWM || {};
window.YWM.Modules = window.YWM.Modules || {};

// ============================================================
// DATA LAYER — Pastikan YWM.Data sudah ada
// ============================================================

if (!window.YWM.Data) {
    window.YWM.Data = {
        async get(key) {
            try {
                if (typeof puter === 'undefined' || !puter.kv) return null;
                const raw = await puter.kv.get(key);
                if (!raw) return null;
                return JSON.parse(raw);
            } catch (e) {
                console.warn('[YWM.Data.get] Gagal ambil key:', key, e.message);
                return null;
            }
        },
        async set(key, value) {
            try {
                if (typeof puter === 'undefined' || !puter.kv) return false;
                await puter.kv.set(key, JSON.stringify(value));
                return true;
            } catch (e) {
                console.warn('[YWM.Data.set] Gagal simpan key:', key, e.message);
                return false;
            }
        },
        async setWithTimestamp(key, value) {
            const now = new Date().toISOString();
            const data = { ...value, updated_at: now, created_at: value.created_at || now };
            return await this.set(key, data);
        },
        async del(key) {
            try {
                if (typeof puter === 'undefined' || !puter.kv) return false;
                await puter.kv.delete(key);
                return true;
            } catch (e) {
                console.warn('[YWM.Data.del] Gagal hapus key:', key, e.message);
                return false;
            }
        },
        async addAuditLog(module, action, detail = {}) {
            try {
                const logKey = 'ywm:audit_log';
                const logs = (await this.get(logKey)) || [];
                logs.push({
                    module, action, detail,
                    timestamp: new Date().toISOString(),
                    user: (window.YWM?.PuterInit?.user?.username) || 'guest'
                });
                if (logs.length > 500) logs.splice(0, logs.length - 500);
                await this.set(logKey, logs);
            } catch (e) {
                console.warn('[YWM.Data.addAuditLog] Gagal:', e.message);
            }
        }
    };
}

// ============================================================
// KONFIGURASI MODUL
// ============================================================

const PROD_SHIFTS = ['Pagi', 'Malam'];
const PROD_MACHINES = ['Packer 1', 'Packer 2', 'Packer 3'];
const PROD_KV_PREFIX = 'ywm:production:daily:';
const PROD_KV_INDEX = 'ywm:production:index:all';

// Target default per hari (zak)
const DEFAULT_DAILY_TARGET = 10000;

// ============================================================
// STATE MANAGEMENT
// ============================================================

const prodState = {
    selectedDate: new Date().toISOString().slice(0, 10), // Default: hari ini
    dailyData: null,           // Data hari yang dipilih
    weekData: [],              // Data 7 hari terakhir (untuk chart)
    smartInputActive: false    // Mode smart input aktif
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Format angka dengan pemisah ribuan
 * @param {number} angka
 * @returns {string}
 */
function prodFormatAngka(angka) {
    if (angka === null || angka === undefined || isNaN(angka)) return '0';
    return Number(angka).toLocaleString('id-ID');
}

/**
 * Format tanggal ke label Indonesia
 * @param {string} dateStr - Format YYYY-MM-DD
 * @returns {string}
 */
function prodFormatTanggal(dateStr) {
    if (!dateStr) return '-';
    try {
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) {
        return dateStr;
    }
}

/**
 * Format tanggal singkat untuk chart (Sen, Sel, ...)
 * @param {string} dateStr - Format YYYY-MM-DD
 * @returns {string}
 */
function prodFormatChartDate(dateStr) {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
    } catch (e) {
        return dateStr.slice(5);
    }
}

/**
 * Hitung OEE (Overall Equipment Effectiveness)
 * Formula sederhana: (Actual / Target) * 100 * Availability Factor
 * @param {number} zak - Kantong diisi aktual
 * @param {number} target - Target harian
 * @param {number} downtimeMenit - Total downtime
 * @param {number} totalMenit - Total waktu operasi (default 720 menit = 12 jam)
 * @returns {number} OEE dalam persen
 */
function hitungOEE(zak, target, downtimeMenit = 0, totalMenit = 720) {
    if (!target || target === 0) return 0;
    const availability = Math.max(0, (totalMenit - (downtimeMenit || 0)) / totalMenit);
    const performance = Math.min(zak / target, 1.0);
    // Asumsi quality = 98% (konstan untuk penyederhanaan)
    const quality = 0.98;
    return Math.round(availability * performance * quality * 1000) / 10;
}

/**
 * Notifikasi toast
 * @param {string} message
 * @param {string} type - success, error, warning, info
 */
function prodShowToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} animate-fade-in`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ============================================================
// DATA OPERATIONS
// ============================================================

/**
 * Muat data produksi untuk tanggal tertentu
 * @param {string} date - Format YYYY-MM-DD
 * @returns {Promise<Object|null>}
 */
async function loadDailyData(date) {
    try {
        const data = await YWM.Data.get(PROD_KV_PREFIX + date);
        return data;
    } catch (e) {
        console.error('[Production] Gagal memuat data harian:', e);
        return null;
    }
}

/**
 * Muat data produksi untuk rentang tanggal
 * @param {string} startDate - Format YYYY-MM-DD
 * @param {number} days - Jumlah hari
 * @returns {Promise<Array>}
 */
async function loadWeekData(startDate, days = 7) {
    try {
        const result = [];
        for (let i = 0; i < days; i++) {
            const d = new Date(startDate + 'T00:00:00');
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().slice(0, 10);
            const data = await loadDailyData(dateStr);
            result.push(data || { date: dateStr, shifts: [], total_zak: 0, total_curah: 0, total_distribusi: 0, oee: 0 });
        }
        return result.reverse(); // Urutkan dari tertua ke terbaru
    } catch (e) {
        console.error('[Production] Gagal memuat data mingguan:', e);
        return [];
    }
}

/**
 * Simpan data produksi harian
 * @param {Object} entryData - Data entry produksi
 * @returns {Promise<Object|null>}
 */
async function saveProductionEntry(entryData) {
    try {
        // Validasi field wajib
        if (!entryData.tanggal) {
            prodShowToast('Tanggal wajib diisi', 'error');
            return null;
        }
        if (!entryData.shift) {
            prodShowToast('Shift wajib dipilih', 'error');
            return null;
        }

        const dateKey = entryData.tanggal;

        // Ambil data harian yang sudah ada (atau buat baru)
        let dailyData = (await YWM.Data.get(PROD_KV_PREFIX + dateKey)) || {
            date: dateKey,
            shifts: [],
            total_curah: 0,
            total_zak: 0,
            total_distribusi: 0,
            oee: 0,
            created_at: new Date().toISOString()
        };

        // Buat entry shift baru
        const shiftEntry = {
            shift: entryData.shift,
            curah: parseFloat(entryData.curah) || 0,
            zak: parseInt(entryData.zak, 10) || 0,
            target: parseInt(entryData.target, 10) || 0,
            distribusi: parseInt(entryData.distribusi, 10) || 0,
            mesin: entryData.mesin || '',
            downtime: parseInt(entryData.downtime, 10) || 0,
            catatan: (entryData.catatan || '').trim(),
            entered_at: new Date().toISOString(),
            entered_by: (window.YWM?.PuterInit?.user?.username) || 'guest'
        };

        // Cek apakah shift sudah ada, jika ya update
        const existingIdx = dailyData.shifts.findIndex(s => s.shift === shiftEntry.shift);
        if (existingIdx >= 0) {
            dailyData.shifts[existingIdx] = shiftEntry;
        } else {
            dailyData.shifts.push(shiftEntry);
        }

        // Hitung total harian
        dailyData.total_curah = dailyData.shifts.reduce((sum, s) => sum + (s.curah || 0), 0);
        dailyData.total_zak = dailyData.shifts.reduce((sum, s) => sum + (s.zak || 0), 0);
        dailyData.total_distribusi = dailyData.shifts.reduce((sum, s) => sum + (s.distribusi || 0), 0);
        const totalTarget = dailyData.shifts.reduce((sum, s) => sum + (s.target || 0), 0);
        const totalDowntime = dailyData.shifts.reduce((sum, s) => sum + (s.downtime || 0), 0);
        dailyData.oee = hitungOEE(dailyData.total_zak, totalTarget || DEFAULT_DAILY_TARGET, totalDowntime);
        dailyData.timestamp = new Date().toISOString();
        dailyData.updated_at = new Date().toISOString();

        // Simpan ke KV
        await YWM.Data.setWithTimestamp(PROD_KV_PREFIX + dateKey, dailyData);

        // Update index
        const index = (await YWM.Data.get(PROD_KV_INDEX)) || [];
        if (!index.includes(dateKey)) {
            index.push(dateKey);
            // Urutkan index dari terbaru
            index.sort((a, b) => b.localeCompare(a));
            await YWM.Data.set(PROD_KV_INDEX, index);
        }

        // Audit log
        await YWM.Data.addAuditLog('production', 'add_entry', {
            date: dateKey,
            shift: shiftEntry.shift,
            zak: shiftEntry.zak
        });

        prodShowToast(`Data produksi ${dateKey} shift ${shiftEntry.shift} berhasil disimpan`, 'success');
        return dailyData;
    } catch (e) {
        console.error('[Production] Gagal menyimpan entry:', e);
        prodShowToast('Gagal menyimpan data: ' + e.message, 'error');
        return null;
    }
}

/**
 * Hapus data shift tertentu
 * @param {string} date - Format YYYY-MM-DD
 * @param {string} shift - Nama shift
 * @returns {Promise<boolean>}
 */
async function deleteShiftEntry(date, shift) {
    try {
        if (!(await YWM.UI.confirm(`Hapus data shift ${shift} tanggal ${date}?`))) return false;

        let dailyData = await YWM.Data.get(PROD_KV_PREFIX + date);
        if (!dailyData) return false;

        dailyData.shifts = dailyData.shifts.filter(s => s.shift !== shift);

        // Hitung ulang total
        dailyData.total_curah = dailyData.shifts.reduce((sum, s) => sum + (s.curah || 0), 0);
        dailyData.total_zak = dailyData.shifts.reduce((sum, s) => sum + (s.zak || 0), 0);
        dailyData.total_distribusi = dailyData.shifts.reduce((sum, s) => sum + (s.distribusi || 0), 0);
        const totalTarget = dailyData.shifts.reduce((sum, s) => sum + (s.target || 0), 0);
        const totalDowntime = dailyData.shifts.reduce((sum, s) => sum + (s.downtime || 0), 0);
        dailyData.oee = hitungOEE(dailyData.total_zak, totalTarget || DEFAULT_DAILY_TARGET, totalDowntime);
        dailyData.timestamp = new Date().toISOString();

        if (dailyData.shifts.length === 0) {
            // Hapus data harian jika tidak ada shift lagi
            await YWM.Data.del(PROD_KV_PREFIX + date);
            const index = (await YWM.Data.get(PROD_KV_INDEX)) || [];
            const newIndex = index.filter(d => d !== date);
            await YWM.Data.set(PROD_KV_INDEX, newIndex);
        } else {
            await YWM.Data.setWithTimestamp(PROD_KV_PREFIX + date, dailyData);
        }

        await YWM.Data.addAuditLog('production', 'delete_shift', { date, shift });

        prodShowToast(`Data shift ${shift} berhasil dihapus`, 'success');
        return true;
    } catch (e) {
        console.error('[Production] Gagal menghapus shift:', e);
        prodShowToast('Gagal menghapus: ' + e.message, 'error');
        return false;
    }
}

// ============================================================
// RENDER FUNCTIONS
// ============================================================

/**
 * Render KPI Cards Row
 * @param {Object} dailyData - Data harian
 * @returns {string} HTML
 */
function renderKPICards(dailyData) {
    const totalCurah = dailyData?.total_curah || 0;
    const totalZak = dailyData?.total_zak || 0;
    const totalDistribusi = dailyData?.total_distribusi || 0;
    const oee = dailyData?.oee || 0;

    // Tentukan warna OEE
    let oeeColor = 'var(--status-error)';
    let oeeBadge = 'badge-error';
    if (oee >= 85) { oeeColor = 'var(--status-success)'; oeeBadge = 'badge-success'; }
    else if (oee >= 70) { oeeColor = 'var(--status-warning)'; oeeBadge = 'badge-warning'; }

    return `
    <div class="prod-kpi-row animate-fade-in" style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:22px;">
        <div class="glass" style="padding:18px 20px;border-radius:var(--radius-md);text-align:center;">
            <div style="font-size:0.65rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Curah Diterima</div>
            <div style="font-size:1.6rem;font-weight:700;color:var(--accent);">${prodFormatAngka(totalCurah)}</div>
            <div style="font-size:0.7rem;color:var(--text-muted);margin-top:4px;">ton</div>
        </div>
        <div class="glass" style="padding:18px 20px;border-radius:var(--radius-md);text-align:center;">
            <div style="font-size:0.65rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Kantong Diisi</div>
            <div style="font-size:1.6rem;font-weight:700;color:var(--status-success);">${prodFormatAngka(totalZak)}</div>
            <div style="font-size:0.7rem;color:var(--text-muted);margin-top:4px;">zak</div>
        </div>
        <div class="glass" style="padding:18px 20px;border-radius:var(--radius-md);text-align:center;">
            <div style="font-size:0.65rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Distribusi</div>
            <div style="font-size:1.6rem;font-weight:700;color:var(--status-info);">${prodFormatAngka(totalDistribusi)}</div>
            <div style="font-size:0.7rem;color:var(--text-muted);margin-top:4px;">zak</div>
        </div>
        <div class="glass" style="padding:18px 20px;border-radius:var(--radius-md);text-align:center;border-color:${oeeColor}33;">
            <div style="font-size:0.65rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">OEE</div>
            <div style="font-size:1.6rem;font-weight:700;color:${oeeColor};">${oee.toFixed(1)}%</div>
            <div style="margin-top:4px;"><span class="badge ${oeeBadge}">${oee >= 85 ? 'Baik' : oee >= 70 ? 'Cukup' : 'Perlu Perbaikan'}</span></div>
        </div>
    </div>`;
}

/**
 * Render production table (breakdown shift)
 * @param {Object} dailyData - Data harian
 * @returns {string} HTML
 */
function renderProductionTable(dailyData) {
    const shifts = dailyData?.shifts || [];

    if (shifts.length === 0) {
        return `
        <div class="empty-state" style="padding:30px;">
            <div class="empty-state-icon">📊</div>
            <div class="empty-state-text">Belum ada data produksi untuk tanggal ini</div>
            <button class="btn btn-accent btn-sm prod-add-btn">+ Input Produksi</button>
        </div>`;
    }

    return `
    <div class="data-table-wrapper glass" style="margin-bottom:20px;">
        <table class="data-table">
            <thead>
                <tr>
                    <th>Shift</th>
                    <th>Mesin</th>
                    <th style="text-align:right;">Curah (ton)</th>
                    <th style="text-align:right;">Zak</th>
                    <th style="text-align:right;">Target (zak)</th>
                    <th style="text-align:right;">Distribusi</th>
                    <th style="text-align:right;">Downtime</th>
                    <th>Pencapaian</th>
                    <th style="text-align:center;">Aksi</th>
                </tr>
            </thead>
            <tbody>
                ${shifts.map(s => {
                    const pencapaian = s.target > 0 ? Math.round((s.zak / s.target) * 100) : 0;
                    let pencapaianBadge = 'badge-error';
                    if (pencapaian >= 95) pencapaianBadge = 'badge-success';
                    else if (pencapaian >= 80) pencapaianBadge = 'badge-warning';

                    return `
                    <tr>
                        <td><strong class="text-accent">${s.shift}</strong></td>
                        <td>${s.mesin || '-'}</td>
                        <td style="text-align:right;">${prodFormatAngka(s.curah)}</td>
                        <td style="text-align:right;font-weight:600;">${prodFormatAngka(s.zak)}</td>
                        <td style="text-align:right;color:var(--text-muted);">${prodFormatAngka(s.target)}</td>
                        <td style="text-align:right;">${prodFormatAngka(s.distribusi)}</td>
                        <td style="text-align:right;${s.downtime > 0 ? 'color:var(--status-warning);' : ''}">${s.downtime || 0} min</td>
                        <td><span class="badge ${pencapaianBadge}">${pencapaian}%</span></td>
                        <td style="text-align:center;">
                            <button class="btn btn-sm btn-danger prod-delete-shift-btn" data-date="${dailyData.date}" data-shift="${s.shift}" title="Hapus">🗑️</button>
                        </td>
                    </tr>`;
                }).join('')}
            </tbody>
            <tfoot>
                <tr style="border-top:2px solid var(--glass-border);">
                    <td><strong>TOTAL</strong></td>
                    <td></td>
                    <td style="text-align:right;font-weight:700;color:var(--accent);">${prodFormatAngka(dailyData?.total_curah || 0)}</td>
                    <td style="text-align:right;font-weight:700;color:var(--status-success);">${prodFormatAngka(dailyData?.total_zak || 0)}</td>
                    <td style="text-align:right;color:var(--text-muted);">${prodFormatAngka(shifts.reduce((sum, s) => sum + (s.target || 0), 0))}</td>
                    <td style="text-align:right;font-weight:600;">${prodFormatAngka(dailyData?.total_distribusi || 0)}</td>
                    <td style="text-align:right;color:var(--status-warning);">${shifts.reduce((sum, s) => sum + (s.downtime || 0), 0)} min</td>
                    <td></td>
                    <td></td>
                </tr>
            </tfoot>
        </table>
    </div>

    ${dailyData?.shifts?.[0]?.catatan || dailyData?.shifts?.[1]?.catatan ? `
    <div class="glass-light" style="padding:12px 16px;border-radius:var(--radius-sm);margin-bottom:16px;">
        <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;margin-bottom:6px;">Catatan Produksi</div>
        ${dailyData.shifts.map(s => s.catatan ? `<div style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:4px;"><strong>${s.shift}:</strong> ${s.catatan}</div>` : '').join('')}
    </div>` : ''}`;
}

/**
 * Render CSS-only bar chart (target vs actual)
 * @param {Array} weekData - Data 7 hari
 * @returns {string} HTML
 */
function renderProductionChart(weekData) {
    if (!weekData || weekData.length === 0) {
        return `
        <div class="glass" style="padding:20px;margin-bottom:20px;">
            <div style="font-size:0.85rem;font-weight:600;margin-bottom:14px;color:var(--text-secondary);">Grafik Produksi Mingguan</div>
            <div style="text-align:center;color:var(--text-muted);font-size:0.8rem;padding:20px;">Belum ada data untuk ditampilkan</div>
        </div>`;
    }

    // Cari nilai maksimum untuk skala
    const maxZak = Math.max(
        ...weekData.map(d => d.total_zak || 0),
        ...weekData.map(d => d.shifts?.reduce((sum, s) => sum + (s.target || 0), 0) || 0),
        1
    );

    return `
    <div class="glass animate-fade-in" style="padding:20px;margin-bottom:20px;">
        <div style="font-size:0.85rem;font-weight:600;margin-bottom:14px;color:var(--text-secondary);">Grafik Produksi Mingguan — Target vs Aktual</div>
        <div style="display:flex;align-items:flex-end;gap:10px;height:180px;padding:0 8px;">
            ${weekData.map(d => {
                const zakPct = maxZak > 0 ? Math.max(Math.round(((d.total_zak || 0) / maxZak) * 100), 2) : 2;
                const targetVal = d.shifts?.reduce((sum, s) => sum + (s.target || 0), 0) || 0;
                const targetPct = maxZak > 0 ? Math.max(Math.round((targetVal / maxZak) * 100), 2) : 2;

                // Warna bar berdasarkan pencapaian
                const pencapaian = targetVal > 0 ? (d.total_zak || 0) / targetVal : 0;
                let barColor = 'var(--status-error)';
                if (pencapaian >= 0.95) barColor = 'var(--status-success)';
                else if (pencapaian >= 0.80) barColor = 'var(--status-warning)';

                return `
                <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;min-width:0;">
                    <div style="font-size:0.6rem;color:var(--text-muted);">${prodFormatAngka(d.total_zak || 0)}</div>
                    <div style="width:100%;position:relative;height:150px;display:flex;align-items:flex-end;gap:3px;">
                        <div style="flex:1;height:${zakPct}%;background:linear-gradient(to top,${barColor},${barColor}88);border-radius:4px 4px 0 0;min-height:2px;transition:height 0.4s ease;" title="Aktual: ${prodFormatAngka(d.total_zak || 0)} zak"></div>
                        <div style="flex:1;height:${targetPct}%;background:rgba(255,255,255,0.12);border:1px dashed rgba(255,255,255,0.2);border-radius:4px 4px 0 0;min-height:2px;transition:height 0.4s ease;" title="Target: ${prodFormatAngka(targetVal)} zak"></div>
                    </div>
                    <div style="font-size:0.6rem;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;">${prodFormatChartDate(d.date)}</div>
                </div>`;
            }).join('')}
        </div>
        <!-- Legend -->
        <div style="display:flex;justify-content:center;gap:20px;margin-top:12px;">
            <div style="display:flex;align-items:center;gap:6px;font-size:0.7rem;color:var(--text-muted);">
                <div style="width:14px;height:8px;border-radius:2px;background:var(--accent);"></div> Aktual
            </div>
            <div style="display:flex;align-items:center;gap:6px;font-size:0.7rem;color:var(--text-muted);">
                <div style="width:14px;height:8px;border-radius:2px;background:rgba(255,255,255,0.12);border:1px dashed rgba(255,255,255,0.3);"></div> Target
            </div>
        </div>
    </div>`;
}

/**
 * Render shift summary (perbandingan shift)
 * @param {Object} dailyData - Data harian
 * @returns {string} HTML
 */
function renderShiftSummary(dailyData) {
    const shifts = dailyData?.shifts || [];
    if (shifts.length < 2) return ''; // Perlu minimal 2 shift untuk perbandingan

    const shiftPagi = shifts.find(s => s.shift === 'Pagi');
    const shiftMalam = shifts.find(s => s.shift === 'Malam');

    if (!shiftPagi || !shiftMalam) return '';

    // Hitung perbandingan
    const zakDiff = shiftPagi.zak - shiftMalam.zak;
    const curahDiff = shiftPagi.curah - shiftMalam.curah;
    const downtimePagi = shiftPagi.downtime || 0;
    const downtimeMalam = shiftMalam.downtime || 0;

    return `
    <div class="glass animate-fade-in" style="padding:18px 20px;margin-bottom:20px;">
        <div style="font-size:0.85rem;font-weight:600;margin-bottom:14px;color:var(--text-secondary);">Perbandingan Shift</div>
        <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:10px;align-items:center;">
            <!-- Shift Pagi -->
            <div class="glass-light" style="padding:14px 16px;border-radius:var(--radius-sm);text-align:center;">
                <div style="font-size:0.7rem;color:var(--accent);text-transform:uppercase;font-weight:600;margin-bottom:8px;">Shift Pagi</div>
                <div style="font-size:1.2rem;font-weight:700;color:var(--text-primary);">${prodFormatAngka(shiftPagi.zak)} <span style="font-size:0.7rem;color:var(--text-muted);">zak</span></div>
                <div style="font-size:0.8rem;color:var(--text-muted);margin-top:4px;">${prodFormatAngka(shiftPagi.curah)} ton</div>
                <div style="font-size:0.75rem;margin-top:4px;${downtimePagi > 30 ? 'color:var(--status-warning);' : 'color:var(--text-muted);'}">Downtime: ${downtimePagi} min</div>
            </div>

            <!-- VS -->
            <div style="text-align:center;">
                <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);">VS</div>
                <div style="font-size:0.9rem;font-weight:700;color:${zakDiff > 0 ? 'var(--status-success)' : zakDiff < 0 ? 'var(--status-error)' : 'var(--text-muted)'};">
                    ${zakDiff > 0 ? '+' : ''}${prodFormatAngka(zakDiff)}
                </div>
                <div style="font-size:0.6rem;color:var(--text-muted);">zak</div>
            </div>

            <!-- Shift Malam -->
            <div class="glass-light" style="padding:14px 16px;border-radius:var(--radius-sm);text-align:center;">
                <div style="font-size:0.7rem;color:var(--status-info);text-transform:uppercase;font-weight:600;margin-bottom:8px;">Shift Malam</div>
                <div style="font-size:1.2rem;font-weight:700;color:var(--text-primary);">${prodFormatAngka(shiftMalam.zak)} <span style="font-size:0.7rem;color:var(--text-muted);">zak</span></div>
                <div style="font-size:0.8rem;color:var(--text-muted);margin-top:4px;">${prodFormatAngka(shiftMalam.curah)} ton</div>
                <div style="font-size:0.75rem;margin-top:4px;${downtimeMalam > 30 ? 'color:var(--status-warning);' : 'color:var(--text-muted);'}">Downtime: ${downtimeMalam} min</div>
            </div>
        </div>
    </div>`;
}

/**
 * Render modal form input produksi
 * @param {string} date - Tanggal yang dipilih
 * @returns {string} HTML
 */
function renderEntryModal(date) {
    return `
    <div class="modal-overlay prod-modal-overlay animate-fade-in" id="prod-modal">
        <div class="modal-content" style="max-width:600px;">
            <div class="modal-header">
                <h3>Input Produksi — ${prodFormatTanggal(date)}</h3>
                <button class="btn-icon btn-sm prod-modal-close-btn" title="Tutup">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
            <div class="modal-body">
                <form id="prod-form" class="form-grid">
                    <!-- Tanggal (readonly) -->
                    <div class="form-group">
                        <label class="label-glass">Tanggal</label>
                        <input type="text" name="tanggal" class="input-glass" value="${prodFormatTanggal(date)}" readonly style="opacity:0.6;">
                    </div>
                    <!-- Shift -->
                    <div class="form-group">
                        <label class="label-glass">Shift *</label>
                        <select name="shift" class="select-glass" required>
                            ${PROD_SHIFTS.map(s => `<option value="${s}">${s}</option>`).join('')}
                        </select>
                    </div>
                    <!-- Curah Diterima -->
                    <div class="form-group">
                        <label class="label-glass">Curah Diterima (ton)</label>
                        <input type="number" name="curah" class="input-glass" min="0" step="0.1" placeholder="0" value="">
                    </div>
                    <!-- Kantong Diisi -->
                    <div class="form-group">
                        <label class="label-glass">Kantong Diisi (zak) *</label>
                        <input type="number" name="zak" class="input-glass" min="0" placeholder="0" value="" required>
                    </div>
                    <!-- Target Harian -->
                    <div class="form-group">
                        <label class="label-glass">Target Harian (zak)</label>
                        <input type="number" name="target" class="input-glass" min="0" placeholder="${DEFAULT_DAILY_TARGET}" value="${DEFAULT_DAILY_TARGET}">
                    </div>
                    <!-- Distribusi -->
                    <div class="form-group">
                        <label class="label-glass">Distribusi (zak)</label>
                        <input type="number" name="distribusi" class="input-glass" min="0" placeholder="0" value="">
                    </div>
                    <!-- Mesin -->
                    <div class="form-group">
                        <label class="label-glass">Mesin</label>
                        <select name="mesin" class="select-glass">
                            <option value="">-- Pilih Mesin --</option>
                            ${PROD_MACHINES.map(m => `<option value="${m}">${m}</option>`).join('')}
                        </select>
                    </div>
                    <!-- Downtime -->
                    <div class="form-group">
                        <label class="label-glass">Downtime (menit)</label>
                        <input type="number" name="downtime" class="input-glass" min="0" placeholder="0" value="">
                    </div>
                    <!-- Catatan -->
                    <div class="form-group full-width">
                        <label class="label-glass">Catatan</label>
                        <textarea name="catatan" class="textarea-glass" rows="2" placeholder="Catatan produksi, kendala, dll..."></textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn prod-modal-close-btn">Batal</button>
                <button class="btn btn-accent prod-save-btn">Simpan Data</button>
            </div>
        </div>
    </div>`;
}

/**
 * Render smart input panel untuk produksi
 * @returns {string} HTML
 */
function renderSmartInput() {
    return `
    <div class="glass prod-smart-input animate-fade-in" style="padding:14px 18px;margin-bottom:16px;border-color:rgba(0,212,255,0.2);background:rgba(0,212,255,0.04);">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
            <span style="font-size:1rem;">🤖</span>
            <strong style="font-size:0.85rem;color:var(--accent);">Smart Input — Produksi</strong>
        </div>
        <div style="display:flex;gap:8px;">
            <input type="text" id="prod-smart-input-field" class="input-glass" placeholder='Contoh: "Produksi hari ini shift pagi, 500 zak, curah 25 ton, packer 2"' style="flex:1;">
            <button class="btn btn-accent btn-sm" id="prod-smart-input-process">Proses</button>
            <button class="btn btn-sm" id="prod-smart-input-voice" title="Input Suara">🎤</button>
            <button class="btn btn-sm" id="prod-smart-input-close" title="Tutup">✕</button>
        </div>
        <div id="prod-smart-input-status" style="font-size:0.75rem;color:var(--text-muted);margin-top:8px;"></div>
    </div>`;
}

// ============================================================
// SMART INPUT — PARSER BAHASA NATURAL PRODUKSI
// ============================================================

/**
 * Parse input bahasa natural ke data produksi
 * @param {string} input - Input bahasa natural
 * @param {string} date - Tanggal default
 * @returns {Promise<Object|null>}
 */
async function parseSmartInput(input, date) {
    if (!input || !input.trim()) return null;

    const data = {
        tanggal: date,
        shift: '',
        curah: 0,
        zak: 0,
        target: DEFAULT_DAILY_TARGET,
        distribusi: 0,
        mesin: '',
        downtime: 0,
        catatan: ''
    };

    const lower = input.toLowerCase();

    // Deteksi shift
    if (lower.includes('pagi') || lower.includes('siang')) data.shift = 'Pagi';
    else if (lower.includes('malam')) data.shift = 'Malam';

    // Deteksi jumlah zak
    const zakMatch = lower.match(/(\d[\d.]*)\s*zak/);
    if (zakMatch) data.zak = parseInt(zakMatch[1].replace(/\./g, ''), 10) || 0;

    // Deteksi curah (ton)
    const curahMatch = lower.match(/curah\s*([\d.]+)\s*ton|([\d.]+)\s*ton/);
    if (curahMatch) data.curah = parseFloat(curahMatch[1] || curahMatch[2]) || 0;

    // Deteksi mesin/packer
    const packerMatch = lower.match(/packer\s*(\d)/);
    if (packerMatch) data.mesin = `Packer ${packerMatch[1]}`;

    // Deteksi downtime
    const downtimeMatch = lower.match(/downtime\s*([\d.]+)\s*menit|([\d.]+)\s*menit\s*downtime/);
    if (downtimeMatch) data.downtime = parseInt(downtimeMatch[1] || downtimeMatch[2], 10) || 0;

    // Deteksi target
    const targetMatch = lower.match(/target\s*([\d.]+)/);
    if (targetMatch) data.target = parseInt(targetMatch[1].replace(/\./g, ''), 10) || 0;

    // Coba AI jika tersedia
    if (typeof puter !== 'undefined' && puter.ai) {
        try {
            const prompt = `Parse input berikut menjadi JSON untuk data produksi PT Yoga Wibawa Mandiri (perusahaan pengantongan semen).

Input: "${input}"
Tanggal: ${date}

Output dalam format JSON:
{
  "shift": "Pagi|Malam",
  "curah": 0,
  "zak": 0,
  "target": ${DEFAULT_DAILY_TARGET},
  "distribusi": 0,
  "mesin": "Packer 1|Packer 2|Packer 3",
  "downtime": 0,
  "catatan": ""
}

WAJIB output JSON saja, tanpa penjelasan.`;

            const response = await puter.ai.chat(prompt, { model: 'gpt-4o-mini' });
            const text = typeof response === 'string' ? response : (response?.message?.content || response?.toString() || '');
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                Object.assign(data, parsed);
            }
        } catch (e) {
            console.warn('[Production] AI parsing gagal, gunakan regex fallback:', e.message);
        }
    }

    // Normalisasi
    if (!PROD_SHIFTS.includes(data.shift)) data.shift = 'Pagi'; // Default
    if (!PROD_MACHINES.includes(data.mesin)) data.mesin = '';
    data.zak = parseInt(data.zak, 10) || 0;
    data.curah = parseFloat(data.curah) || 0;
    data.target = parseInt(data.target, 10) || DEFAULT_DAILY_TARGET;
    data.distribusi = parseInt(data.distribusi, 10) || 0;
    data.downtime = parseInt(data.downtime, 10) || 0;

    return data;
}

// ============================================================
// MODULE EXPORT
// ============================================================

YWM.Modules.production = {
    title: 'Produksi',

    /**
     * Render modul produksi
     * @returns {Promise<string>} HTML string
     */
    async render() {
        try {
            // Muat data hari yang dipilih
            prodState.dailyData = await loadDailyData(prodState.selectedDate);
            prodState.weekData = await loadWeekData(prodState.selectedDate, 7);

            const dailyData = prodState.dailyData || { date: prodState.selectedDate, shifts: [], total_curah: 0, total_zak: 0, total_distribusi: 0, oee: 0 };

            return `
            <div class="module-detail animate-fade-in" id="prod-module">
                <!-- HEADER -->
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px;">
                    <div>
                        <h2 style="font-size:1.3rem;font-weight:700;margin-bottom:4px;">Produksi & Operasional</h2>
                        <span style="font-size:0.75rem;color:var(--text-muted);">Tracking produksi harian pengantongan semen</span>
                    </div>
                    <div style="display:flex;gap:8px;align-items:center;">
                        <!-- Date Picker -->
                        <input type="date" id="prod-date-picker" class="input-glass" value="${prodState.selectedDate}" style="width:170px;">
                        <button class="btn btn-sm" id="prod-smart-input-btn" title="Smart Input AI">🤖 Smart Input</button>
                        <button class="btn btn-accent" id="prod-add-btn">+ Input Produksi</button>
                    </div>
                </div>

                <!-- SMART INPUT AREA (tersembunyi default) -->
                <div id="prod-smart-input-area" style="display:none;"></div>

                <!-- KPI CARDS -->
                ${renderKPICards(dailyData)}

                <!-- PRODUCTION CHART -->
                ${renderProductionChart(prodState.weekData)}

                <!-- SHIFT SUMMARY -->
                ${renderShiftSummary(dailyData)}

                <!-- PRODUCTION TABLE -->
                <div style="font-size:0.85rem;font-weight:600;margin-bottom:10px;color:var(--text-secondary);">
                    Detail Produksi — ${prodFormatTanggal(prodState.selectedDate)}
                </div>
                <div id="prod-table-area">
                    ${renderProductionTable(dailyData)}
                </div>
            </div>`;
        } catch (e) {
            console.error('[Production] Gagal render:', e);
            return `<div class="empty-state"><div class="empty-state-icon">⚠️</div><div class="empty-state-text">Gagal memuat modul Produksi</div><p class="text-muted">${e.message}</p></div>`;
        }
    },

    /**
     * Inisialisasi event listener setelah render
     */
    async init() {
        const container = document.getElementById('prod-module');
        if (!container) return;

        // ── Date Picker ──
        const datePicker = document.getElementById('prod-date-picker');
        if (datePicker) {
            datePicker.addEventListener('change', async (e) => {
                prodState.selectedDate = e.target.value;
                await this.refreshAll();
            });
        }

        // ── Delegasi event klik ──
        container.addEventListener('click', async (e) => {
            const target = e.target.closest('button');
            if (!target) return;

            // Tombol Tambah Produksi
            if (target.id === 'prod-add-btn' || target.classList.contains('prod-add-btn')) {
                this.openEntryModal();
                return;
            }

            // Tombol Smart Input
            if (target.id === 'prod-smart-input-btn') {
                this.toggleSmartInput();
                return;
            }

            // Hapus shift entry
            if (target.classList.contains('prod-delete-shift-btn')) {
                const date = target.dataset.date;
                const shift = target.dataset.shift;
                if (date && shift) {
                    const deleted = await deleteShiftEntry(date, shift);
                    if (deleted) await this.refreshAll();
                }
                return;
            }

            // Modal close
            if (target.classList.contains('prod-modal-close-btn')) {
                this.closeEntryModal();
                return;
            }

            // Save button
            if (target.classList.contains('prod-save-btn')) {
                await this.handleSave();
                return;
            }

            // Smart input: proses
            if (target.id === 'prod-smart-input-process') {
                await this.processSmartInput();
                return;
            }

            // Smart input: voice
            if (target.id === 'prod-smart-input-voice') {
                await this.startVoiceInput();
                return;
            }

            // Smart input: tutup
            if (target.id === 'prod-smart-input-close') {
                this.toggleSmartInput(false);
                return;
            }
        });

        console.log('[Production] Modul diinisialisasi ✓');
    },

    // ========================================================
    // METHOD UTILITAS
    // ========================================================

    /**
     * Refresh seluruh tampilan modul
     */
    async refreshAll() {
        try {
            prodState.dailyData = await loadDailyData(prodState.selectedDate);
            prodState.weekData = await loadWeekData(prodState.selectedDate, 7);

            const dailyData = prodState.dailyData || { date: prodState.selectedDate, shifts: [], total_curah: 0, total_zak: 0, total_distribusi: 0, oee: 0 };

            // Refresh KPI
            const kpiRow = document.querySelector('.prod-kpi-row');
            if (kpiRow) kpiRow.outerHTML = renderKPICards(dailyData);

            // Refresh chart
            const chartArea = container?.querySelector('.glass.animate-fade-in');
            // Lebih aman: refresh dengan mengganti area chart
            this.refreshChart();
            this.refreshTable();
        } catch (e) {
            console.error('[Production] Gagal refresh:', e);
        }
    },

    /**
     * Refresh tabel produksi
     */
    refreshTable() {
        const tableArea = document.getElementById('prod-table-area');
        if (!tableArea) return;

        const dailyData = prodState.dailyData || { date: prodState.selectedDate, shifts: [], total_curah: 0, total_zak: 0, total_distribusi: 0, oee: 0 };
        tableArea.innerHTML = renderProductionTable(dailyData);
    },

    /**
     * Refresh chart produksi
     */
    refreshChart() {
        const container = document.getElementById('prod-module');
        if (!container) return;

        // Cari elemen chart dan ganti
        const existingChart = container.querySelector('.glass.animate-fade-in');
        if (existingChart && existingChart.querySelector('[style*="height:180px"]')) {
            existingChart.outerHTML = renderProductionChart(prodState.weekData);
        }
    },

    /**
     * Buka modal input produksi
     */
    openEntryModal() {
        // Hapus modal sebelumnya jika ada
        const existing = document.getElementById('prod-modal');
        if (existing) existing.remove();

        const html = renderEntryModal(prodState.selectedDate);
        document.body.insertAdjacentHTML('beforeend', html);

        // Fokus ke field shift
        setTimeout(() => {
            const shiftSelect = document.querySelector('#prod-form [name="shift"]');
            if (shiftSelect) shiftSelect.focus();
        }, 100);
    },

    /**
     * Tutup modal input produksi
     */
    closeEntryModal() {
        const modal = document.getElementById('prod-modal');
        if (modal) modal.remove();
    },

    /**
     * Handle simpan form produksi
     */
    async handleSave() {
        const form = document.getElementById('prod-form');
        if (!form) return;

        const formData = new FormData(form);
        const data = {
            tanggal: prodState.selectedDate,
            shift: formData.get('shift'),
            curah: formData.get('curah'),
            zak: formData.get('zak'),
            target: formData.get('target'),
            distribusi: formData.get('distribusi'),
            mesin: formData.get('mesin'),
            downtime: formData.get('downtime'),
            catatan: formData.get('catatan')
        };

        // Validasi field wajib
        if (!data.shift) {
            prodShowToast('Shift wajib dipilih', 'error');
            const shiftEl = form.querySelector('[name="shift"]');
            if (shiftEl) { shiftEl.classList.add('input-error'); shiftEl.focus(); }
            return;
        }
        if (!data.zak || isNaN(data.zak) || parseInt(data.zak, 10) < 0) {
            prodShowToast('Jumlah zak wajib diisi dengan angka yang valid', 'error');
            const zakEl = form.querySelector('[name="zak"]');
            if (zakEl) { zakEl.classList.add('input-error'); zakEl.focus(); }
            return;
        }

        const result = await saveProductionEntry(data);
        if (result) {
            this.closeEntryModal();
            await this.refreshAll();
        }
    },

    /**
     * Toggle smart input panel
     * @param {boolean|null} forceState
     */
    toggleSmartInput(forceState) {
        const area = document.getElementById('prod-smart-input-area');
        if (!area) return;

        const show = forceState !== undefined ? forceState : area.style.display === 'none';
        if (show) {
            area.style.display = 'block';
            area.innerHTML = renderSmartInput();
            setTimeout(() => {
                const field = document.getElementById('prod-smart-input-field');
                if (field) field.focus();
            }, 100);
        } else {
            area.style.display = 'none';
            area.innerHTML = '';
        }
    },

    /**
     * Proses smart input untuk produksi
     */
    async processSmartInput() {
        const field = document.getElementById('prod-smart-input-field');
        const statusEl = document.getElementById('prod-smart-input-status');
        if (!field || !field.value.trim()) {
            prodShowToast('Masukkan deskripsi produksi', 'warning');
            return;
        }

        const input = field.value.trim();

        if (statusEl) statusEl.innerHTML = '⏳ Memproses dengan AI...';

        try {
            const parsed = await parseSmartInput(input, prodState.selectedDate);
            if (parsed) {
                if (statusEl) statusEl.innerHTML = '✅ Data berhasil diparsing. Menyimpan...';

                // Langsung simpan data (tanpa modal)
                const result = await saveProductionEntry(parsed);
                if (result) {
                    this.toggleSmartInput(false);
                    await this.refreshAll();
                }
            } else {
                if (statusEl) statusEl.innerHTML = '❌ Gagal mem-parsing input. Coba format lain.';
            }
        } catch (e) {
            console.error('[Production] Smart input error:', e);
            if (statusEl) statusEl.innerHTML = '❌ Error: ' + e.message;
        }
    },

    /**
     * Mulai input suara
     */
    async startVoiceInput() {
        const field = document.getElementById('prod-smart-input-field');
        const statusEl = document.getElementById('prod-smart-input-status');

        if (window.YWMVoiceHandler) {
            if (statusEl) statusEl.innerHTML = '🎤 Mendengarkan... silakan bicara';

            window.YWMVoiceHandler.on('transcriptionComplete', (data) => {
                if (data.text && field) {
                    field.value = data.text;
                    if (statusEl) statusEl.innerHTML = '✅ Transkripsi diterima. Klik "Proses" untuk parsing.';
                }
            });

            window.YWMVoiceHandler.on('transcriptionError', (error) => {
                if (statusEl) statusEl.innerHTML = '❌ Gagal: ' + (error.message || 'Error voice input');
            });

            try {
                await window.YWMVoiceHandler.start();
            } catch (e) {
                if (statusEl) statusEl.innerHTML = '❌ Mikrofon tidak tersedia';
            }
        } else {
            // Fallback: Web Speech API
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition && field) {
                const recognition = new SpeechRecognition();
                recognition.lang = 'id-ID';
                recognition.continuous = false;
                recognition.interimResults = false;

                if (statusEl) statusEl.innerHTML = '🎤 Mendengarkan... (fallback browser)';

                recognition.onresult = (event) => {
                    const transcript = event.results[0][0].transcript;
                    field.value = transcript;
                    if (statusEl) statusEl.innerHTML = '✅ Transkripsi diterima. Klik "Proses" untuk parsing.';
                };

                recognition.onerror = (event) => {
                    if (statusEl) statusEl.innerHTML = '❌ Error: ' + event.error;
                };

                recognition.onend = () => {
                    if (statusEl && statusEl.innerHTML.includes('Mendengarkan')) {
                        statusEl.innerHTML = 'Selesai mendengarkan.';
                    }
                };

                recognition.start();
            } else {
                if (statusEl) statusEl.innerHTML = '❌ Input suara tidak didukung di browser ini';
            }
        }
    }
};

console.log('[Production] Modul production tracker dimuat ✓');
