/**
 * ============================================================
 * MODUL SPARE PARTS INVENTORY
 * PT Yoga Wibawa Mandiri — Dashboard Teknis
 * ============================================================
 *
 * Modul ini mengelola inventaris spare part untuk mesin
 * pengantongan semen, termasuk:
 * - Daftar inventaris dengan filter dan pencarian
 * - Statistik stok (total, rendah, habis, nilai)
 * - Filter berdasarkan kategori (Bearing, Belt, Seal, dll)
 * - Tabel data glassmorphic dengan status badge
 * - Modal tambah/edit spare part
 * - Detail view dengan riwayat pemakaian (CSS bars)
 * - Peringatan reorder untuk stok di bawah minimum
 * - Smart Input AI: input bahasa natural / suara
 *
 * KV Store patterns:
 * - ywm:sparepart:item:SP-001 → {kode, nama_item, kategori, ...}
 * - ywm:sparepart:index:all → ["SP-001", "SP-002", ...]
 *
 * @version 1.0.0
 * @author YWM Development Team
 */

window.YWM = window.YWM || {};
window.YWM.Modules = window.YWM.Modules || {};

// ============================================================
// DATA LAYER — Abstraksi puter.kv
// ============================================================

/** Pastikan YWM.Data tersedia; jika belum, buat wrapper dasar */
if (!window.YWM.Data) {
    window.YWM.Data = {
        /**
         * Ambil data dari puter.kv
         * @param {string} key - KV key
         * @returns {Promise<any|null>}
         */
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

        /**
         * Simpan data ke puter.kv
         * @param {string} key - KV key
         * @param {any} value - Data yang disimpan (akan di-JSON-kan)
         * @returns {Promise<boolean>}
         */
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

        /**
         * Simpan data dengan tambahan field timestamp
         * @param {string} key - KV key
         * @param {Object} value - Data yang disimpan
         * @returns {Promise<boolean>}
         */
        async setWithTimestamp(key, value) {
            const now = new Date().toISOString();
            const data = {
                ...value,
                updated_at: now,
                created_at: value.created_at || now
            };
            return await this.set(key, data);
        },

        /**
         * Hapus key dari puter.kv
         * @param {string} key - KV key
         * @returns {Promise<boolean>}
         */
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

        /**
         * Tambahkan entri ke audit log
         * @param {string} module - Nama modul
         * @param {string} action - Aksi yang dilakukan
         * @param {Object} detail - Detail perubahan
         * @returns {Promise<void>}
         */
        async addAuditLog(module, action, detail = {}) {
            try {
                const logKey = 'ywm:audit_log';
                const logs = (await this.get(logKey)) || [];
                logs.push({
                    module,
                    action,
                    detail,
                    timestamp: new Date().toISOString(),
                    user: (window.YWM?.PuterInit?.user?.username) || 'guest'
                });
                // Simpan hanya 500 log terakhir
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

const SP_CATEGORIES = ['Bearing', 'Belt', 'Seal', 'Filter', 'Elektrikal', 'Mekanikal', 'Lainnya'];
const SP_UNITS = ['Pcs', 'Set', 'Unit', 'm', 'L', 'kg', 'Roll', 'Box'];
const SP_KV_PREFIX = 'ywm:sparepart:item:';
const SP_KV_INDEX = 'ywm:sparepart:index:all';

// ============================================================
// STATE MANAGEMENT
// ============================================================

const spState = {
    items: [],              // Daftar semua item spare part
    filteredItems: [],      // Item setelah filter
    activeFilter: 'Semua',  // Filter kategori aktif
    searchQuery: '',         // Query pencarian
    selectedItemId: null,    // ID item yang dipilih untuk detail
    isEditing: false,        // Mode edit pada modal
    editingItem: null,       // Item yang sedang diedit
    showDetail: false,       // Tampilkan detail view
    smartInputActive: false  // Mode smart input aktif
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Generate kode spare part otomatis (SP-XXX)
 * @returns {Promise<string>} Kode baru, misalnya SP-001
 */
async function generateKode() {
    try {
        const index = (await YWM.Data.get(SP_KV_INDEX)) || [];
        const maxNum = index.reduce((max, kode) => {
            const num = parseInt(kode.replace('SP-', ''), 10);
            return isNaN(num) ? max : Math.max(max, num);
        }, 0);
        return `SP-${String(maxNum + 1).padStart(3, '0')}`;
    } catch (e) {
        // Fallback: gunakan timestamp
        return `SP-${Date.now().toString(36).toUpperCase().slice(-3)}`;
    }
}

/**
 * Hitung status stok
 * @param {number} stok - Jumlah stok saat ini
 * @param {number} minStok - Jumlah stok minimum
 * @returns {{ label: string, class: string }}
 */
function getStokStatus(stok, minStok) {
    if (stok === 0) return { label: 'Habis', class: 'badge-error' };
    if (stok < minStok) return { label: 'Rendah', class: 'badge-warning' };
    return { label: 'Aman', class: 'badge-success' };
}

/**
 * Format angka ke Rupiah
 * @param {number} angka
 * @returns {string}
 */
function formatRupiah(angka) {
    if (angka === null || angka === undefined || isNaN(angka)) return 'Rp 0';
    return 'Rp ' + Math.abs(Number(angka)).toLocaleString('id-ID');
}

/**
 * Format angka dengan pemisah ribuan
 * @param {number} angka
 * @returns {string}
 */
function formatAngka(angka) {
    if (angka === null || angka === undefined || isNaN(angka)) return '0';
    return Number(angka).toLocaleString('id-ID');
}

/**
 * Notifikasi toast sederhana
 * @param {string} message - Pesan toast
 * @param {string} type - Tipe: success, error, warning, info
 */
function showToast(message, type = 'info') {
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
// DATA OPERATIONS (CRUD)
// ============================================================

/**
 * Muat semua data spare part dari KV store
 * @returns {Promise<Array>} Daftar spare part
 */
async function loadAllItems() {
    try {
        const index = (await YWM.Data.get(SP_KV_INDEX)) || [];
        const items = [];
        for (const kode of index) {
            const item = await YWM.Data.get(SP_KV_PREFIX + kode);
            if (item) items.push(item);
        }
        // Urutkan berdasarkan kode
        items.sort((a, b) => (a.kode || '').localeCompare(b.kode || ''));
        return items;
    } catch (e) {
        console.error('[SpareParts] Gagal memuat data:', e);
        return [];
    }
}

/**
 * Simpan item spare part (buat baru atau update)
 * @param {Object} itemData - Data item
 * @returns {Promise<Object|null>} Item yang disimpan
 */
async function saveItem(itemData) {
    try {
        // Validasi field wajib
        if (!itemData.nama_item || !itemData.nama_item.trim()) {
            showToast('Nama item wajib diisi', 'error');
            return null;
        }
        if (itemData.stok === null || itemData.stok === undefined || isNaN(itemData.stok)) {
            showToast('Stok wajib diisi dengan angka', 'error');
            return null;
        }

        const isNew = !itemData.kode;
        let kode = itemData.kode;

        // Generate kode baru jika belum ada
        if (!kode) {
            kode = await generateKode();
        }

        // Siapkan data lengkap
        const dataToSave = {
            kode,
            nama_item: itemData.nama_item.trim(),
            kategori: itemData.kategori || 'Lainnya',
            lokasi_gudang: (itemData.lokasi_gudang || '').trim(),
            stok: parseInt(itemData.stok, 10) || 0,
            min_stok: parseInt(itemData.min_stok, 10) || 0,
            satuan: itemData.satuan || 'Pcs',
            harga_satuan: parseFloat(itemData.harga_satuan) || 0,
            catatan: (itemData.catatan || '').trim(),
            part_mesin: (itemData.part_mesin || '').trim(),
            created_at: itemData.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: itemData.created_by || (window.YWM?.PuterInit?.user?.username) || 'guest',
            updated_by: (window.YWM?.PuterInit?.user?.username) || 'guest',
            // Riwayat pemakaian (untuk chart detail)
            usage_history: itemData.usage_history || []
        };

        // Simpan item ke KV
        await YWM.Data.setWithTimestamp(SP_KV_PREFIX + kode, dataToSave);

        // Update index
        const index = (await YWM.Data.get(SP_KV_INDEX)) || [];
        if (!index.includes(kode)) {
            index.push(kode);
            await YWM.Data.set(SP_KV_INDEX, index);
        }

        // Audit log
        await YWM.Data.addAuditLog('spareparts', isNew ? 'create' : 'update', {
            kode,
            nama_item: dataToSave.nama_item
        });

        showToast(isNew ? `Item ${kode} berhasil ditambahkan` : `Item ${kode} berhasil diperbarui`, 'success');
        return dataToSave;
    } catch (e) {
        console.error('[SpareParts] Gagal menyimpan item:', e);
        showToast('Gagal menyimpan item: ' + e.message, 'error');
        return null;
    }
}

/**
 * Hapus item spare part
 * @param {string} kode - Kode item yang dihapus
 * @returns {Promise<boolean>}
 */
async function deleteItem(kode) {
    try {
        if (!kode) return false;

        // Konfirmasi hapus
        if (!(await YWM.UI.confirm(`Hapus item ${kode}? Tindakan ini tidak dapat dibatalkan.`))) return false;

        // Hapus dari KV
        await YWM.Data.del(SP_KV_PREFIX + kode);

        // Update index
        const index = (await YWM.Data.get(SP_KV_INDEX)) || [];
        const newIndex = index.filter(k => k !== kode);
        await YWM.Data.set(SP_KV_INDEX, newIndex);

        // Audit log
        await YWM.Data.addAuditLog('spareparts', 'delete', { kode });

        showToast(`Item ${kode} berhasil dihapus`, 'success');
        return true;
    } catch (e) {
        console.error('[SpareParts] Gagal menghapus item:', e);
        showToast('Gagal menghapus item: ' + e.message, 'error');
        return false;
    }
}

// ============================================================
// FILTER & PENCARIAN
// ============================================================

/**
 * Terapkan filter dan pencarian ke daftar item
 * @returns {Array} Item yang sudah difilter
 */
function applyFilters() {
    let items = [...spState.items];

    // Filter berdasarkan kategori
    if (spState.activeFilter !== 'Semua') {
        items = items.filter(item => item.kategori === spState.activeFilter);
    }

    // Filter berdasarkan pencarian
    if (spState.searchQuery.trim()) {
        const q = spState.searchQuery.toLowerCase().trim();
        items = items.filter(item =>
            (item.kode || '').toLowerCase().includes(q) ||
            (item.nama_item || '').toLowerCase().includes(q) ||
            (item.kategori || '').toLowerCase().includes(q) ||
            (item.lokasi_gudang || '').toLowerCase().includes(q) ||
            (item.part_mesin || '').toLowerCase().includes(q)
        );
    }

    spState.filteredItems = items;
    return items;
}

// ============================================================
// HITUNGAN STATISTIK
// ============================================================

/**
 * Hitung statistik ringkasan spare part
 * @param {Array} items - Daftar item
 * @returns {Object} Statistik
 */
function computeStats(items) {
    const totalItems = items.length;
    const stokRendah = items.filter(i => i.stok > 0 && i.stok < (i.min_stok || 0)).length;
    const stokHabis = items.filter(i => i.stok === 0).length;
    const totalNilai = items.reduce((sum, i) => sum + ((i.stok || 0) * (i.harga_satuan || 0)), 0);

    return { totalItems, stokRendah, stokHabis, totalNilai };
}

// ============================================================
// RENDER FUNCTIONS
// ============================================================

/**
 * Render baris statistik
 * @param {Object} stats
 * @returns {string} HTML
 */
function renderStatsRow(stats) {
    return `
    <div class="sp-stats-row animate-fade-in" style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px;">
        <div class="glass" style="padding:16px 18px;border-radius:var(--radius-md);">
            <div style="font-size:1.5rem;font-weight:700;color:var(--text-primary);">${formatAngka(stats.totalItems)}</div>
            <div style="font-size:0.7rem;color:var(--text-muted);margin-top:4px;text-transform:uppercase;letter-spacing:0.5px;">Total Items</div>
        </div>
        <div class="glass" style="padding:16px 18px;border-radius:var(--radius-md);border-color:rgba(255,171,0,0.25);">
            <div style="font-size:1.5rem;font-weight:700;color:var(--status-warning);">${formatAngka(stats.stokRendah)}</div>
            <div style="font-size:0.7rem;color:var(--text-muted);margin-top:4px;text-transform:uppercase;letter-spacing:0.5px;">Stok Rendah</div>
        </div>
        <div class="glass" style="padding:16px 18px;border-radius:var(--radius-md);border-color:rgba(255,82,82,0.25);">
            <div style="font-size:1.5rem;font-weight:700;color:var(--status-error);">${formatAngka(stats.stokHabis)}</div>
            <div style="font-size:0.7rem;color:var(--text-muted);margin-top:4px;text-transform:uppercase;letter-spacing:0.5px;">Stok Habis</div>
        </div>
        <div class="glass" style="padding:16px 18px;border-radius:var(--radius-md);">
            <div style="font-size:1.5rem;font-weight:700;color:var(--accent);">${formatRupiah(stats.totalNilai)}</div>
            <div style="font-size:0.7rem;color:var(--text-muted);margin-top:4px;text-transform:uppercase;letter-spacing:0.5px;">Total Nilai</div>
        </div>
    </div>`;
}

/**
 * Render filter tabs
 * @returns {string} HTML
 */
function renderFilterTabs() {
    const tabs = ['Semua', ...SP_CATEGORIES];
    return `
    <div class="sp-filter-tabs" style="display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap;">
        ${tabs.map(tab => {
            const isActive = spState.activeFilter === tab;
            const count = tab === 'Semua'
                ? spState.items.length
                : spState.items.filter(i => i.kategori === tab).length;
            return `<button class="btn btn-sm ${isActive ? 'btn-accent' : ''} sp-filter-tab" data-filter="${tab}" style="font-size:0.75rem;">
                ${tab} <span style="opacity:0.6;margin-left:4px;">(${count})</span>
            </button>`;
        }).join('')}
    </div>`;
}

/**
 * Render reorder alert — item yang perlu dipesan ulang
 * @param {Array} items - Daftar semua item
 * @returns {string} HTML
 */
function renderReorderAlert(items) {
    const reorderItems = items.filter(i => i.stok <= (i.min_stok || 0));
    if (reorderItems.length === 0) return '';

    return `
    <div class="glass animate-fade-in" style="padding:14px 18px;margin-bottom:16px;border-color:rgba(255,171,0,0.3);background:rgba(255,171,0,0.08);">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
            <span style="font-size:1rem;">⚠️</span>
            <strong style="font-size:0.85rem;color:var(--status-warning);">Peringatan Reorder</strong>
            <span class="badge badge-warning">${reorderItems.length} item</span>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">
            ${reorderItems.map(item => {
                const status = getStokStatus(item.stok, item.min_stok || 0);
                return `<span class="badge ${status.class}" style="cursor:pointer;" data-detail="${item.kode}" title="Stok: ${item.stok}, Min: ${item.min_stok || 0}">
                    ${item.kode} — ${item.nama_item} (${item.stok}/${item.min_stok || 0})
                </span>`;
            }).join('')}
        </div>
    </div>`;
}

/**
 * Render tabel data spare part
 * @param {Array} items - Item yang ditampilkan
 * @returns {string} HTML
 */
function renderDataTable(items) {
    if (items.length === 0) {
        return `
        <div class="empty-state">
            <div class="empty-state-icon">📦</div>
            <div class="empty-state-text">Belum ada data spare part</div>
            <button class="btn btn-accent btn-sm sp-add-btn">+ Tambah Spare Part</button>
        </div>`;
    }

    return `
    <div class="data-table-wrapper glass" style="margin-bottom:20px;">
        <table class="data-table">
            <thead>
                <tr>
                    <th>Kode</th>
                    <th>Nama Item</th>
                    <th>Kategori</th>
                    <th>Lokasi</th>
                    <th style="text-align:right;">Stok</th>
                    <th style="text-align:right;">Min Stok</th>
                    <th>Satuan</th>
                    <th>Status</th>
                    <th style="text-align:center;">Aksi</th>
                </tr>
            </thead>
            <tbody>
                ${items.map(item => {
                    const status = getStokStatus(item.stok, item.min_stok || 0);
                    const isLowStock = item.stok <= (item.min_stok || 0);
                    return `
                    <tr class="sp-row" data-kode="${item.kode}" style="cursor:pointer;${isLowStock ? 'background:rgba(255,171,0,0.04);' : ''}">
                        <td><strong class="text-accent">${item.kode}</strong></td>
                        <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${item.nama_item}">${item.nama_item}</td>
                        <td><span class="badge badge-info">${item.kategori || '-'}</span></td>
                        <td style="font-size:0.78rem;">${item.lokasi_gudang || '-'}</td>
                        <td style="text-align:right;font-weight:600;${item.stok === 0 ? 'color:var(--status-error);' : item.stok < (item.min_stok || 0) ? 'color:var(--status-warning);' : ''}">${formatAngka(item.stok)}</td>
                        <td style="text-align:right;color:var(--text-muted);">${formatAngka(item.min_stok || 0)}</td>
                        <td>${item.satuan || '-'}</td>
                        <td><span class="badge ${status.class}">${status.label}</span></td>
                        <td style="text-align:center;">
                            <button class="btn btn-sm sp-edit-btn" data-kode="${item.kode}" title="Edit" style="margin-right:4px;">✏️</button>
                            <button class="btn btn-sm btn-danger sp-delete-btn" data-kode="${item.kode}" title="Hapus">🗑️</button>
                        </td>
                    </tr>`;
                }).join('')}
            </tbody>
        </table>
    </div>`;
}

/**
 * Render detail view item spare part
 * @param {Object} item - Item yang ditampilkan
 * @returns {string} HTML
 */
function renderDetailView(item) {
    if (!item) return '';

    const status = getStokStatus(item.stok, item.min_stok || 0);
    const nilaiTotal = (item.stok || 0) * (item.harga_satuan || 0);

    // Buat chart CSS bars untuk riwayat pemakaian
    const usageHistory = item.usage_history || [];
    const maxUsage = Math.max(...usageHistory.map(h => h.jumlah || 0), 1);

    return `
    <div class="sp-detail-view glass animate-fade-in" style="padding:24px;margin-bottom:20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;">
            <div>
                <h3 style="font-size:1.1rem;font-weight:700;margin-bottom:4px;">${item.kode} — ${item.nama_item}</h3>
                <span class="badge ${status.class}">${status.label}</span>
                <span class="badge badge-info" style="margin-left:6px;">${item.kategori || '-'}</span>
            </div>
            <button class="btn btn-sm sp-close-detail-btn">✕ Tutup</button>
        </div>

        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin-bottom:20px;">
            <div class="glass-light" style="padding:12px 16px;border-radius:var(--radius-sm);">
                <div style="font-size:0.65rem;color:var(--text-muted);text-transform:uppercase;">Lokasi Gudang</div>
                <div style="font-size:0.95rem;font-weight:600;margin-top:4px;">${item.lokasi_gudang || '-'}</div>
            </div>
            <div class="glass-light" style="padding:12px 16px;border-radius:var(--radius-sm);">
                <div style="font-size:0.65rem;color:var(--text-muted);text-transform:uppercase;">Part Mesin</div>
                <div style="font-size:0.95rem;font-weight:600;margin-top:4px;">${item.part_mesin || '-'}</div>
            </div>
            <div class="glass-light" style="padding:12px 16px;border-radius:var(--radius-sm);">
                <div style="font-size:0.65rem;color:var(--text-muted);text-transform:uppercase;">Stok / Minimum</div>
                <div style="font-size:0.95rem;font-weight:600;margin-top:4px;">${formatAngka(item.stok)} / ${formatAngka(item.min_stok || 0)} ${item.satuan || ''}</div>
            </div>
            <div class="glass-light" style="padding:12px 16px;border-radius:var(--radius-sm);">
                <div style="font-size:0.65rem;color:var(--text-muted);text-transform:uppercase;">Nilai Total</div>
                <div style="font-size:0.95rem;font-weight:600;margin-top:4px;color:var(--accent);">${formatRupiah(nilaiTotal)}</div>
            </div>
            <div class="glass-light" style="padding:12px 16px;border-radius:var(--radius-sm);">
                <div style="font-size:0.65rem;color:var(--text-muted);text-transform:uppercase;">Harga Satuan</div>
                <div style="font-size:0.95rem;font-weight:600;margin-top:4px;">${formatRupiah(item.harga_satuan || 0)}</div>
            </div>
            <div class="glass-light" style="padding:12px 16px;border-radius:var(--radius-sm);">
                <div style="font-size:0.65rem;color:var(--text-muted);text-transform:uppercase;">Terakhir Diperbarui</div>
                <div style="font-size:0.95rem;font-weight:600;margin-top:4px;">${item.updated_at ? new Date(item.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</div>
            </div>
        </div>

        ${item.catatan ? `
        <div class="glass-light" style="padding:12px 16px;border-radius:var(--radius-sm);margin-bottom:18px;">
            <div style="font-size:0.65rem;color:var(--text-muted);text-transform:uppercase;margin-bottom:4px;">Catatan</div>
            <div style="font-size:0.85rem;color:var(--text-secondary);">${item.catatan}</div>
        </div>` : ''}

        <!-- Riwayat Pemakaian — CSS Bar Chart -->
        <div style="margin-top:8px;">
            <div style="font-size:0.8rem;font-weight:600;margin-bottom:10px;color:var(--text-secondary);">Riwayat Pemakaian</div>
            ${usageHistory.length === 0 ? `
                <div style="text-align:center;padding:16px;color:var(--text-muted);font-size:0.8rem;">Belum ada data pemakaian</div>
            ` : `
                <div style="display:flex;align-items:flex-end;gap:8px;height:120px;padding:0 4px;">
                    ${usageHistory.slice(-12).map(h => {
                        const pct = Math.max(Math.round(((h.jumlah || 0) / maxUsage) * 100), 4);
                        return `
                        <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">
                            <div style="font-size:0.6rem;color:var(--text-muted);">${h.jumlah || 0}</div>
                            <div style="width:100%;height:${pct}%;background:linear-gradient(to top,var(--accent),rgba(0,212,255,0.4));border-radius:4px 4px 0 0;min-height:4px;transition:height 0.3s;"></div>
                            <div style="font-size:0.55rem;color:var(--text-muted);white-space:nowrap;">${h.bulan || ''}</div>
                        </div>`;
                    }).join('')}
                </div>
            `}
        </div>
    </div>`;
}

/**
 * Render modal form tambah/edit spare part
 * @param {Object|null} editItem - Item yang diedit (null jika tambah baru)
 * @returns {string} HTML
 */
function renderModalForm(editItem = null) {
    const isEdit = !!editItem;
    const title = isEdit ? `Edit Spare Part — ${editItem.kode}` : 'Tambah Spare Part Baru';

    return `
    <div class="modal-overlay sp-modal-overlay animate-fade-in" id="sp-modal">
        <div class="modal-content" style="max-width:620px;">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="btn-icon btn-sm sp-modal-close-btn" title="Tutup">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
            <div class="modal-body">
                <form id="sp-form" class="form-grid">
                    <!-- Kode (auto, readonly) -->
                    <div class="form-group">
                        <label class="label-glass">Kode</label>
                        <input type="text" name="kode" class="input-glass" value="${isEdit ? editItem.kode : 'Auto-generated'}" readonly style="opacity:0.6;">
                    </div>
                    <!-- Nama Item -->
                    <div class="form-group">
                        <label class="label-glass">Nama Item *</label>
                        <input type="text" name="nama_item" class="input-glass" placeholder="Contoh: Bearing SKF 6205" value="${isEdit ? (editItem.nama_item || '') : ''}" required>
                    </div>
                    <!-- Kategori -->
                    <div class="form-group">
                        <label class="label-glass">Kategori *</label>
                        <select name="kategori" class="select-glass" required>
                            ${SP_CATEGORIES.map(cat => `<option value="${cat}" ${(isEdit && editItem.kategori === cat) ? 'selected' : ''}>${cat}</option>`).join('')}
                        </select>
                    </div>
                    <!-- Lokasi Gudang -->
                    <div class="form-group">
                        <label class="label-glass">Lokasi Gudang</label>
                        <input type="text" name="lokasi_gudang" class="input-glass" placeholder="Contoh: Gudang Utama Rak A3" value="${isEdit ? (editItem.lokasi_gudang || '') : ''}">
                    </div>
                    <!-- Stok -->
                    <div class="form-group">
                        <label class="label-glass">Stok *</label>
                        <input type="number" name="stok" class="input-glass" min="0" placeholder="0" value="${isEdit ? (editItem.stok ?? '') : ''}" required>
                    </div>
                    <!-- Min Stok -->
                    <div class="form-group">
                        <label class="label-glass">Min Stok</label>
                        <input type="number" name="min_stok" class="input-glass" min="0" placeholder="0" value="${isEdit ? (editItem.min_stok ?? '') : ''}">
                    </div>
                    <!-- Satuan -->
                    <div class="form-group">
                        <label class="label-glass">Satuan</label>
                        <select name="satuan" class="select-glass">
                            ${SP_UNITS.map(u => `<option value="${u}" ${(isEdit && editItem.satuan === u) ? 'selected' : ''}>${u}</option>`).join('')}
                        </select>
                    </div>
                    <!-- Harga Satuan -->
                    <div class="form-group">
                        <label class="label-glass">Harga Satuan (Rp)</label>
                        <input type="number" name="harga_satuan" class="input-glass" min="0" step="1000" placeholder="0" value="${isEdit ? (editItem.harga_satuan ?? '') : ''}">
                    </div>
                    <!-- Part Mesin -->
                    <div class="form-group full-width">
                        <label class="label-glass">Part Mesin (mesin yang memakai part ini)</label>
                        <input type="text" name="part_mesin" class="input-glass" placeholder="Contoh: Packer 1, Conveyor Belt 2, Rotary Valve" value="${isEdit ? (editItem.part_mesin || '') : ''}">
                    </div>
                    <!-- Catatan -->
                    <div class="form-group full-width">
                        <label class="label-glass">Catatan</label>
                        <textarea name="catatan" class="textarea-glass" rows="3" placeholder="Catatan tambahan...">${isEdit ? (editItem.catatan || '') : ''}</textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn sp-modal-close-btn">Batal</button>
                <button class="btn btn-accent sp-save-btn" data-edit="${isEdit ? editItem.kode : ''}">${isEdit ? 'Simpan Perubahan' : 'Tambah Item'}</button>
            </div>
        </div>
    </div>`;
}

/**
 * Render smart input panel
 * @returns {string} HTML
 */
function renderSmartInput() {
    return `
    <div class="glass sp-smart-input animate-fade-in" style="padding:14px 18px;margin-bottom:16px;border-color:rgba(0,212,255,0.2);background:rgba(0,212,255,0.04);">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
            <span style="font-size:1rem;">🤖</span>
            <strong style="font-size:0.85rem;color:var(--accent);">Smart Input — AI Parser</strong>
        </div>
        <div style="display:flex;gap:8px;">
            <input type="text" id="sp-smart-input-field" class="input-glass" placeholder='Contoh: "Tambah bearing SKF 6205, stok 10, lokasi gudang utama"' style="flex:1;">
            <button class="btn btn-accent btn-sm" id="sp-smart-input-process">Proses</button>
            <button class="btn btn-sm" id="sp-smart-input-voice" title="Input Suara">🎤</button>
            <button class="btn btn-sm" id="sp-smart-input-close" title="Tutup">✕</button>
        </div>
        <div id="sp-smart-input-status" style="font-size:0.75rem;color:var(--text-muted);margin-top:8px;"></div>
    </div>`;
}

// ============================================================
// SMART INPUT — PARSER BAHASA NATURAL
// ============================================================

/**
 * Parse input bahasa natural ke data spare part
 * Menggunakan AI (puter.ai.chat) jika tersedia, atau regex fallback
 * @param {string} input - Input bahasa natural
 * @returns {Promise<Object|null>} Data terstruktur
 */
async function parseSmartInput(input) {
    if (!input || !input.trim()) return null;

    // Fallback parsing dengan regex jika AI tidak tersedia
    const data = {
        nama_item: '',
        kategori: 'Lainnya',
        stok: 0,
        satuan: 'Pcs',
        lokasi_gudang: '',
        part_mesin: '',
        catatan: ''
    };

    const lower = input.toLowerCase();

    // Deteksi kategori dari keyword
    if (lower.includes('bearing')) data.kategori = 'Bearing';
    else if (lower.includes('belt') || lower.includes('v-belt')) data.kategori = 'Belt';
    else if (lower.includes('seal') || lower.includes('gasket')) data.kategori = 'Seal';
    else if (lower.includes('filter') || lower.includes('saringan')) data.kategori = 'Filter';
    else if (lower.includes('motor') || lower.includes('kontaktor') || lower.includes('relay') || lower.includes('mcb') || lower.includes('inverter') || lower.includes('elektrik')) data.kategori = 'Elektrikal';
    else if (lower.includes('pulley') || lower.includes('shaft') || lower.includes('gear') || lower.includes('coupling') || lower.includes('roller') || lower.includes('bearing') === false && (lower.includes('mekanik') || lower.includes('bolt') || lower.includes('nut'))) data.kategori = 'Mekanikal';

    // Deteksi stok (angka sebelum kata "stok", "unit", "pcs", "buah")
    const stokMatch = lower.match(/stok\s*(\d+)|(\d+)\s*(?:unit|pcs|buah|set|roll|box)/i);
    if (stokMatch) {
        data.stok = parseInt(stokMatch[1] || stokMatch[2], 10);
    }

    // Deteksi lokasi
    const lokasiMatch = lower.match(/lokasi\s+([\w\s]+)/i) || lower.match(/gudang\s+([\w\s]+)/i);
    if (lokasiMatch) {
        data.lokasi_gudang = lokasiMatch[1].trim().replace(/\s*[,;.]\s*$/, '');
    }

    // Coba gunakan AI jika tersedia untuk parsing lebih akurat
    if (typeof puter !== 'undefined' && puter.ai) {
        try {
            const prompt = `Parse input berikut menjadi JSON untuk data spare part PT Yoga Wibawa Mandiri (perusahaan pengantongan semen).

Input: "${input}"

Output dalam format JSON:
{
  "nama_item": "nama lengkap item",
  "kategori": "Bearing|Belt|Seal|Filter|Elektrikal|Mekanikal|Lainnya",
  "stok": 0,
  "min_stok": 0,
  "satuan": "Pcs|Set|Unit|m|L|kg|Roll|Box",
  "lokasi_gudang": "lokasi penyimpanan",
  "part_mesin": "mesin yang memakai",
  "harga_satuan": 0,
  "catatan": "catatan tambahan"
}

WAJIB output JSON saja, tanpa penjelasan.`;

            const response = await puter.ai.chat(prompt, { model: 'gpt-4o-mini' });
            const text = typeof response === 'string' ? response : (response?.message?.content || response?.toString() || '');
            // Ekstrak JSON
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                Object.assign(data, parsed);
            }
        } catch (e) {
            console.warn('[SpareParts] AI parsing gagal, gunakan regex fallback:', e.message);
            // Tetap gunakan data dari regex
        }
    }

    // Jika nama_item masih kosong, coba ambil dari input
    if (!data.nama_item) {
        // Hapus kata kunci umum dan ambil sisanya sebagai nama
        let nama = input
            .replace(/tambah|tambahkan|masukkan|input|stok\s*\d+|lokasi\s+[\w\s]+|gudang\s+[\w\s]+/gi, '')
            .replace(/,|;/g, ' ')
            .trim();
        data.nama_item = nama || input.trim();
    }

    // Normalisasi tipe data
    data.stok = parseInt(data.stok, 10) || 0;
    data.min_stok = parseInt(data.min_stok, 10) || 0;
    data.harga_satuan = parseFloat(data.harga_satuan) || 0;
    if (!SP_CATEGORIES.includes(data.kategori)) data.kategori = 'Lainnya';
    if (!SP_UNITS.includes(data.satuan)) data.satuan = 'Pcs';

    return data;
}

// ============================================================
// MODULE EXPORT
// ============================================================

YWM.Modules.spareparts = {
    title: 'Spare Parts',

    /**
     * Render modul spare parts
     * @returns {Promise<string>} HTML string
     */
    async render() {
        try {
            // Muat data dari KV store
            spState.items = await loadAllItems();
            applyFilters();
            const stats = computeStats(spState.items);

            return `
            <div class="module-detail animate-fade-in" id="sp-module">
                <!-- HEADER -->
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px;">
                    <div>
                        <h2 style="font-size:1.3rem;font-weight:700;margin-bottom:4px;">Inventaris Spare Part</h2>
                        <span style="font-size:0.75rem;color:var(--text-muted);">Kelola inventaris spare part mesin pengantongan semen</span>
                    </div>
                    <div style="display:flex;gap:8px;align-items:center;">
                        <button class="btn btn-sm" id="sp-smart-input-btn" title="Smart Input AI">🤖 Smart Input</button>
                        <button class="btn btn-accent" id="sp-add-btn">+ Tambah Spare Part</button>
                    </div>
                </div>

                <!-- SEARCH BAR -->
                <div style="margin-bottom:16px;">
                    <div style="position:relative;">
                        <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-muted);font-size:0.85rem;">🔍</span>
                        <input type="text" id="sp-search" class="input-glass" placeholder="Cari kode, nama, kategori, lokasi..." style="padding-left:36px;" value="${spState.searchQuery}">
                    </div>
                </div>

                <!-- SMART INPUT AREA (tersembunyi default) -->
                <div id="sp-smart-input-area" style="display:none;"></div>

                <!-- REORDER ALERT -->
                <div id="sp-reorder-alert">
                    ${renderReorderAlert(spState.items)}
                </div>

                <!-- STATS ROW -->
                ${renderStatsRow(stats)}

                <!-- FILTER TABS -->
                ${renderFilterTabs()}

                <!-- DETAIL VIEW (tersembunyi default) -->
                <div id="sp-detail-area"></div>

                <!-- DATA TABLE -->
                <div id="sp-table-area">
                    ${renderDataTable(spState.filteredItems)}
                </div>
            </div>`;
        } catch (e) {
            console.error('[SpareParts] Gagal render:', e);
            return `<div class="empty-state"><div class="empty-state-icon">⚠️</div><div class="empty-state-text">Gagal memuat modul Spare Parts</div><p class="text-muted">${e.message}</p></div>`;
        }
    },

    /**
     * Inisialisasi event listener setelah render
     */
    async init() {
        const container = document.getElementById('sp-module');
        if (!container) return;

        // ── Tombol Tambah ──
        container.addEventListener('click', async (e) => {
            const target = e.target.closest('button, .badge');
            if (!target) {
                // Klik pada baris tabel → buka detail
                const row = e.target.closest('.sp-row');
                if (row) {
                    const kode = row.dataset.kode;
                    await this.showDetail(kode);
                }
                return;
            }

            // Tombol Tambah Spare Part
            if (target.id === 'sp-add-btn' || target.classList.contains('sp-add-btn')) {
                this.openModal();
                return;
            }

            // Tombol Smart Input
            if (target.id === 'sp-smart-input-btn') {
                this.toggleSmartInput();
                return;
            }

            // Tombol Edit
            if (target.classList.contains('sp-edit-btn')) {
                const kode = target.dataset.kode;
                const item = spState.items.find(i => i.kode === kode);
                if (item) this.openModal(item);
                return;
            }

            // Tombol Hapus
            if (target.classList.contains('sp-delete-btn')) {
                const kode = target.dataset.kode;
                await deleteItem(kode);
                await this.refresh();
                return;
            }

            // Tombol Tutup Detail
            if (target.classList.contains('sp-close-detail-btn')) {
                spState.showDetail = false;
                spState.selectedItemId = null;
                const detailArea = document.getElementById('sp-detail-area');
                if (detailArea) detailArea.innerHTML = '';
                return;
            }

            // Filter tab
            if (target.classList.contains('sp-filter-tab')) {
                spState.activeFilter = target.dataset.filter;
                applyFilters();
                this.refreshTable();
                this.refreshFilterTabs();
                return;
            }

            // Badge reorder → buka detail
            if (target.dataset && target.dataset.detail) {
                await this.showDetail(target.dataset.detail);
                return;
            }

            // Modal close
            if (target.classList.contains('sp-modal-close-btn')) {
                this.closeModal();
                return;
            }

            // Save button
            if (target.classList.contains('sp-save-btn')) {
                await this.handleSave(target.dataset.edit);
                return;
            }

            // Smart input: proses
            if (target.id === 'sp-smart-input-process') {
                await this.processSmartInput();
                return;
            }

            // Smart input: voice
            if (target.id === 'sp-smart-input-voice') {
                await this.startVoiceInput();
                return;
            }

            // Smart input: tutup
            if (target.id === 'sp-smart-input-close') {
                this.toggleSmartInput(false);
                return;
            }
        });

        // ── Pencarian real-time ──
        const searchInput = document.getElementById('sp-search');
        if (searchInput) {
            let debounceTimer;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    spState.searchQuery = e.target.value;
                    applyFilters();
                    this.refreshTable();
                }, 300);
            });
        }

        console.log('[SpareParts] Modul diinisialisasi ✓');
    },

    // ========================================================
    // METHOD UTILITAS
    // ========================================================

    /**
     * Refresh seluruh tampilan modul
     */
    async refresh() {
        try {
            spState.items = await loadAllItems();
            applyFilters();
            this.refreshStats();
            this.refreshTable();
            this.refreshReorderAlert();
            this.refreshFilterTabs();
        } catch (e) {
            console.error('[SpareParts] Gagal refresh:', e);
        }
    },

    /**
     * Refresh statistik saja
     */
    refreshStats() {
        const stats = computeStats(spState.items);
        const statsRow = document.querySelector('.sp-stats-row');
        if (statsRow) {
            statsRow.outerHTML = renderStatsRow(stats);
        }
    },

    /**
     * Refresh tabel data saja
     */
    refreshTable() {
        const tableArea = document.getElementById('sp-table-area');
        if (tableArea) {
            tableArea.innerHTML = renderDataTable(spState.filteredItems);
        }
    },

    /**
     * Refresh reorder alert
     */
    refreshReorderAlert() {
        const alertArea = document.getElementById('sp-reorder-alert');
        if (alertArea) {
            alertArea.innerHTML = renderReorderAlert(spState.items);
        }
    },

    /**
     * Refresh filter tabs
     */
    refreshFilterTabs() {
        const tabsArea = document.querySelector('.sp-filter-tabs');
        if (tabsArea) {
            tabsArea.outerHTML = renderFilterTabs();
        }
    },

    /**
     * Buka modal tambah/edit
     * @param {Object|null} editItem - Item yang diedit (null = tambah baru)
     */
    openModal(editItem = null) {
        // Hapus modal sebelumnya jika ada
        const existing = document.getElementById('sp-modal');
        if (existing) existing.remove();

        spState.isEditing = !!editItem;
        spState.editingItem = editItem;

        const html = renderModalForm(editItem);
        document.body.insertAdjacentHTML('beforeend', html);

        // Fokus ke field nama_item
        setTimeout(() => {
            const namaInput = document.querySelector('#sp-form [name="nama_item"]');
            if (namaInput) namaInput.focus();
        }, 100);
    },

    /**
     * Tutup modal
     */
    closeModal() {
        const modal = document.getElementById('sp-modal');
        if (modal) modal.remove();
        spState.isEditing = false;
        spState.editingItem = null;
    },

    /**
     * Handle simpan form
     * @param {string} editKode - Kode item yang diedit (kosong = baru)
     */
    async handleSave(editKode) {
        const form = document.getElementById('sp-form');
        if (!form) return;

        const formData = new FormData(form);
        const data = {
            nama_item: formData.get('nama_item'),
            kategori: formData.get('kategori'),
            lokasi_gudang: formData.get('lokasi_gudang'),
            stok: formData.get('stok'),
            min_stok: formData.get('min_stok'),
            satuan: formData.get('satuan'),
            harga_satuan: formData.get('harga_satuan'),
            catatan: formData.get('catatan'),
            part_mesin: formData.get('part_mesin')
        };

        // Jika edit, sertakan kode dan data existing
        if (editKode) {
            const existing = spState.items.find(i => i.kode === editKode);
            if (existing) {
                data.kode = editKode;
                data.created_at = existing.created_at;
                data.created_by = existing.created_by;
                data.usage_history = existing.usage_history;
            }
        }

        // Validasi field wajib
        if (!data.nama_item || !data.nama_item.trim()) {
            showToast('Nama item wajib diisi', 'error');
            const namaInput = form.querySelector('[name="nama_item"]');
            if (namaInput) { namaInput.classList.add('input-error'); namaInput.focus(); }
            return;
        }
        if (data.stok === '' || data.stok === null || isNaN(data.stok)) {
            showToast('Stok wajib diisi dengan angka', 'error');
            const stokInput = form.querySelector('[name="stok"]');
            if (stokInput) { stokInput.classList.add('input-error'); stokInput.focus(); }
            return;
        }

        const result = await saveItem(data);
        if (result) {
            this.closeModal();
            await this.refresh();
        }
    },

    /**
     * Tampilkan detail view
     * @param {string} kode - Kode item
     */
    async showDetail(kode) {
        try {
            const item = await YWM.Data.get(SP_KV_PREFIX + kode);
            if (!item) {
                showToast('Item tidak ditemukan', 'error');
                return;
            }

            spState.selectedItemId = kode;
            spState.showDetail = true;

            const detailArea = document.getElementById('sp-detail-area');
            if (detailArea) {
                detailArea.innerHTML = renderDetailView(item);
                // Scroll ke detail
                detailArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } catch (e) {
            console.error('[SpareParts] Gagal menampilkan detail:', e);
        }
    },

    /**
     * Toggle smart input panel
     * @param {boolean|null} forceState - Paksa buka/tutup
     */
    toggleSmartInput(forceState) {
        const area = document.getElementById('sp-smart-input-area');
        if (!area) return;

        const show = forceState !== undefined ? forceState : area.style.display === 'none';
        if (show) {
            area.style.display = 'block';
            area.innerHTML = renderSmartInput();
            // Fokus ke input
            setTimeout(() => {
                const field = document.getElementById('sp-smart-input-field');
                if (field) field.focus();
            }, 100);
        } else {
            area.style.display = 'none';
            area.innerHTML = '';
        }
    },

    /**
     * Proses smart input
     */
    async processSmartInput() {
        const field = document.getElementById('sp-smart-input-field');
        const statusEl = document.getElementById('sp-smart-input-status');
        if (!field || !field.value.trim()) {
            showToast('Masukkan deskripsi spare part', 'warning');
            return;
        }

        const input = field.value.trim();

        if (statusEl) statusEl.innerHTML = '⏳ Memproses dengan AI...';

        try {
            const parsed = await parseSmartInput(input);
            if (parsed) {
                if (statusEl) statusEl.innerHTML = '✅ Data berhasil diparsing. Membuka form...';

                // Buka modal dengan data yang sudah diisi
                this.openModal({
                    kode: null,
                    ...parsed
                });

                // Isi form dengan data hasil parsing
                setTimeout(() => {
                    const form = document.getElementById('sp-form');
                    if (form) {
                        const fields = ['nama_item', 'kategori', 'lokasi_gudang', 'stok', 'min_stok', 'satuan', 'harga_satuan', 'part_mesin', 'catatan'];
                        fields.forEach(f => {
                            const el = form.querySelector(`[name="${f}"]`);
                            if (el && parsed[f] !== undefined && parsed[f] !== null && parsed[f] !== '') {
                                el.value = parsed[f];
                            }
                        });
                    }
                }, 150);

                // Tutup smart input
                this.toggleSmartInput(false);
            } else {
                if (statusEl) statusEl.innerHTML = '❌ Gagal mem-parsing input. Coba format lain.';
            }
        } catch (e) {
            console.error('[SpareParts] Smart input error:', e);
            if (statusEl) statusEl.innerHTML = '❌ Error: ' + e.message;
        }
    },

    /**
     * Mulai input suara via YWMVoiceHandler
     */
    async startVoiceInput() {
        const field = document.getElementById('sp-smart-input-field');
        const statusEl = document.getElementById('sp-smart-input-status');

        if (window.YWMVoiceHandler) {
            if (statusEl) statusEl.innerHTML = '🎤 Mendengarkan... silakan bicara';

            // Set callback
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

console.log('[SpareParts] Modul spare parts dimuat ✓');
