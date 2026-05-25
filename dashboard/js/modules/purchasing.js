/**
 * ============================================================
 * PURCHASING — Modul Dashboard PT Yoga Wibawa Mandiri
 * ============================================================
 *
 * Modul ini menangani:
 * - Manajemen Purchase Order (PO) — buat, kirim, terima, batalkan
 * - Daftar supplier dengan kontak info
 * - Detail PO dengan item breakdown & delivery status
 * - Smart Input suara: "Buat PO untuk 10 bearing SKF 6205 dari supplier PT Surya"
 *
 * KV Pattern:
 *   ywm:purchasing:po:PO-2026-001      — Data PO per nomor
 *   ywm:purchasing:index:all           — Index seluruh nomor PO
 *   ywm:purchasing:supplier:SUP-001    — Data supplier per ID
 *
 * @version 1.0.0
 * @author YWM Development Team
 */

window.YWM = window.YWM || {};
window.YWM.Modules = window.YWM.Modules || {};

YWM.Modules.purchasing = {
    title: 'Purchasing',

    // ============================================================
    // DATA LAYER — Wrapper YWM.Data dengan fallback ke puter.kv
    // ============================================================

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
            console.warn('[Purchasing] Gagal membaca KV:', key, err.message);
        }
        return null;
    },

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
            console.warn('[Purchasing] Gagal menyimpan KV:', key, err.message);
        }
    },

    async _setWithTimestamp(key, value) {
        const record = { ...value, updatedAt: new Date().toISOString() };
        if (!record.createdAt) record.createdAt = record.updatedAt;
        await this._set(key, record);
        try {
            if (window.YWM && window.YWM.Data && typeof YWM.Data.addAuditLog === 'function') {
                await YWM.Data.addAuditLog('purchasing', 'set', key);
            }
        } catch (_) { /* abaikan */ }
    },

    // ============================================================
    // HELPERS
    // ============================================================

    /** Generate nomor PO berikutnya */
    async _nextPONumber() {
        const index = (await this._get('ywm:purchasing:index:all')) || [];
        const year = new Date().getFullYear();
        let max = 0;
        index.forEach(poNum => {
            const match = poNum.match(/PO-(\d+)-(\d+)/);
            if (match && parseInt(match[1]) === year) {
                const seq = parseInt(match[2], 10);
                if (seq > max) max = seq;
            }
        });
        return 'PO-' + year + '-' + String(max + 1).padStart(3, '0');
    },

    /** Generate ID supplier berikutnya */
    async _nextSupplierId() {
        const suppliers = await this._loadSuppliers();
        let max = 0;
        suppliers.forEach(s => {
            const num = parseInt(s.id.replace('SUP-', ''), 10);
            if (num > max) max = num;
        });
        return 'SUP-' + String(max + 1).padStart(3, '0');
    },

    /** Format angka ke Rupiah */
    _rp(val) {
        if (val === null || val === undefined || isNaN(val)) return 'Rp 0';
        return 'Rp ' + Number(val).toLocaleString('id-ID');
    },

    /** Tanggal hari ini */
    _today() {
        return new Date().toISOString().split('T')[0];
    },

    /** Status PO yang valid */
    _poStatuses: ['Draft', 'Sent', 'Received', 'Cancelled'],

    // ============================================================
    // RENDER — Tampilan utama modul
    // ============================================================

    async render() {
        const pos = await this._loadPOs();
        const suppliers = await this._loadSuppliers();
        const kpi = this._calcKPI(pos);

        return `
        <div class="module-purchasing animate-fade-in">
            <!-- Header -->
            <div class="module-header" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
                <h2 style="font-size:1.4rem;font-weight:700;">${this.title}</h2>
                <div style="display:flex;gap:8px;">
                    <button class="btn btn-accent btn-sm" id="po-btn-create">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Buat PO
                    </button>
                    <button class="btn btn-sm glass" id="po-btn-voice" title="Input Suara">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/></svg>
                        Suara
                    </button>
                </div>
            </div>

            <!-- KPI Row -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-bottom:24px;">
                <div class="glass" style="padding:16px;border-radius:var(--radius-md);">
                    <div class="text-muted" style="font-size:0.72rem;text-transform:uppercase;letter-spacing:0.5px;">PO Open</div>
                    <div style="font-size:1.6rem;font-weight:700;margin-top:4px;" class="text-accent">${kpi.poOpen}</div>
                </div>
                <div class="glass" style="padding:16px;border-radius:var(--radius-md);">
                    <div class="text-muted" style="font-size:0.72rem;text-transform:uppercase;letter-spacing:0.5px;">PO Bulan Ini</div>
                    <div style="font-size:1.6rem;font-weight:700;margin-top:4px;" class="text-success">${kpi.poThisMonth}</div>
                </div>
                <div class="glass" style="padding:16px;border-radius:var(--radius-md);">
                    <div class="text-muted" style="font-size:0.72rem;text-transform:uppercase;letter-spacing:0.5px;">Total PO Value</div>
                    <div style="font-size:1.6rem;font-weight:700;margin-top:4px;" class="text-accent">${this._rp(kpi.totalValue)}</div>
                </div>
                <div class="glass" style="padding:16px;border-radius:var(--radius-md);">
                    <div class="text-muted" style="font-size:0.72rem;text-transform:uppercase;letter-spacing:0.5px;">Pending Delivery</div>
                    <div style="font-size:1.6rem;font-weight:700;margin-top:4px;" class="text-warning">${kpi.pendingDelivery}</div>
                </div>
            </div>

            <!-- Tab Navigation -->
            <div style="display:flex;gap:6px;margin-bottom:18px;flex-wrap:wrap;">
                <button class="btn btn-sm btn-accent po-tab-btn" data-tab="polist">Daftar PO</button>
                <button class="btn btn-sm glass po-tab-btn" data-tab="suppliers">Supplier</button>
            </div>

            <!-- Tab: Daftar PO -->
            <div id="po-tab-polist" class="po-tab-content">
                ${this._renderPOList(pos)}
            </div>

            <!-- Tab: Supplier Directory -->
            <div id="po-tab-suppliers" class="po-tab-content" style="display:none;">
                ${this._renderSupplierSection(suppliers)}
            </div>
        </div>`;
    },

    // ============================================================
    // SUB-RENDER
    // ============================================================

    /** Render daftar PO */
    _renderPOList(pos) {
        if (!pos || pos.length === 0) {
            return `<div class="glass" style="padding:40px;text-align:center;">
                <p class="text-muted">Belum ada Purchase Order. Klik "Buat PO" untuk memulai.</p>
            </div>`;
        }
        let rows = pos.map(po => {
            const statusClass = po.status === 'Received' ? 'badge-success' :
                                po.status === 'Cancelled' ? 'badge-error' :
                                po.status === 'Sent' ? 'badge-warning' : 'badge-info';
            const itemCount = (po.items || []).length;
            const total = this._calcPOTotal(po.items);
            return `<tr style="border-bottom:1px solid rgba(255,255,255,0.06);cursor:pointer;" class="po-row-click" data-po="${po.poNumber}">
                <td style="padding:10px 8px;font-size:0.8rem;" class="text-accent">${po.poNumber}</td>
                <td style="padding:10px 8px;font-size:0.85rem;">${po.supplier || '-'}</td>
                <td style="padding:10px 8px;font-size:0.8rem;">${itemCount} item</td>
                <td style="padding:10px 8px;font-size:0.8rem;text-align:right;">${this._rp(total)}</td>
                <td style="padding:10px 8px;"><span class="badge ${statusClass}">${po.status}</span></td>
                <td style="padding:10px 8px;font-size:0.8rem;" class="text-muted">${po.createdAt ? po.createdAt.split('T')[0] : '-'}</td>
            </tr>`;
        }).join('');

        return `
        <div class="glass" style="overflow-x:auto;border-radius:var(--radius-md);">
            <table style="width:100%;border-collapse:collapse;">
                <thead>
                    <tr style="border-bottom:1px solid rgba(255,255,255,0.12);">
                        <th style="padding:12px 8px;text-align:left;font-size:0.72rem;text-transform:uppercase;" class="text-muted">PO Number</th>
                        <th style="padding:12px 8px;text-align:left;font-size:0.72rem;text-transform:uppercase;" class="text-muted">Supplier</th>
                        <th style="padding:12px 8px;text-align:left;font-size:0.72rem;text-transform:uppercase;" class="text-muted">Items</th>
                        <th style="padding:12px 8px;text-align:right;font-size:0.72rem;text-transform:uppercase;" class="text-muted">Total</th>
                        <th style="padding:12px 8px;text-align:left;font-size:0.72rem;text-transform:uppercase;" class="text-muted">Status</th>
                        <th style="padding:12px 8px;text-align:left;font-size:0.72rem;text-transform:uppercase;" class="text-muted">Tanggal</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>`;
    },

    /** Render supplier section */
    _renderSupplierSection(suppliers) {
        let cards = '';
        if (suppliers.length === 0) {
            cards = `<div class="glass" style="padding:40px;text-align:center;grid-column:span 3;">
                <p class="text-muted">Belum ada data supplier.</p>
            </div>`;
        } else {
            cards = suppliers.map(sup => `
                <div class="glass" style="padding:16px;border-radius:var(--radius-md);">
                    <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:10px;">
                        <h4 style="font-size:0.95rem;font-weight:600;">${sup.nama}</h4>
                        <span class="badge badge-info">${sup.id}</span>
                    </div>
                    <div style="font-size:0.8rem;" class="text-secondary">${sup.kontak || '-'}</div>
                    <div style="font-size:0.8rem;" class="text-muted">${sup.telepon || '-'}</div>
                    <div style="font-size:0.8rem;margin-top:4px;" class="text-muted">${sup.email || '-'}</div>
                    <div style="font-size:0.75rem;margin-top:6px;" class="text-muted">${sup.alamat || '-'}</div>
                    <div style="margin-top:10px;display:flex;gap:6px;">
                        <button class="btn btn-sm glass po-btn-edit-sup" data-id="${sup.id}" title="Edit">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button class="btn btn-sm btn-danger po-btn-del-sup" data-id="${sup.id}" title="Hapus">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                        </button>
                    </div>
                </div>
            `).join('');
        }

        return `
        <div style="margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;">
            <h3 style="font-size:1rem;">Directory Supplier</h3>
            <button class="btn btn-accent btn-sm" id="po-btn-add-supplier">Tambah Supplier</button>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px;">
            ${cards}
        </div>`;
    },

    /** Render PO Detail */
    _renderPODetail(po) {
        if (!po) return '<p class="text-error">PO tidak ditemukan</p>';

        const statusBadge = po.status === 'Received' ? 'badge-success' :
                            po.status === 'Cancelled' ? 'badge-error' :
                            po.status === 'Sent' ? 'badge-warning' : 'badge-info';

        let itemRows = (po.items || []).map((item, idx) => {
            const subtotal = (Number(item.quantity) || 0) * (Number(item.unit_price) || 0);
            return `<tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
                <td style="padding:8px;font-size:0.8rem;">${idx + 1}</td>
                <td style="padding:8px;font-size:0.85rem;">${item.item_name}</td>
                <td style="padding:8px;font-size:0.8rem;text-align:right;">${Number(item.quantity) || 0}</td>
                <td style="padding:8px;font-size:0.8rem;">${item.unit || 'pcs'}</td>
                <td style="padding:8px;font-size:0.8rem;text-align:right;">${this._rp(item.unit_price)}</td>
                <td style="padding:8px;font-size:0.8rem;text-align:right;" class="text-accent">${this._rp(subtotal)}</td>
            </tr>`;
        }).join('');

        const grandTotal = this._calcPOTotal(po.items);

        let statusActions = '';
        if (po.status === 'Draft') {
            statusActions = `<button class="btn btn-accent btn-sm" id="po-detail-send">Kirim PO</button>
                             <button class="btn btn-danger btn-sm" id="po-detail-cancel">Batalkan</button>`;
        } else if (po.status === 'Sent') {
            statusActions = `<button class="btn btn-accent btn-sm" id="po-detail-receive">Terima Barang</button>
                             <button class="btn btn-danger btn-sm" id="po-detail-cancel">Batalkan</button>`;
        }

        return `
        <div class="animate-fade-in">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <div>
                    <h3 style="font-size:1.1rem;font-weight:700;" class="text-accent">${po.poNumber}</h3>
                    <span class="badge ${statusBadge}" style="margin-top:4px;">${po.status}</span>
                </div>
                <div style="display:flex;gap:8px;">
                    ${statusActions}
                    <button class="btn btn-sm glass" onclick="YWM.UI.closeModal()">Tutup</button>
                </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
                <div>
                    <span class="text-muted" style="font-size:0.72rem;text-transform:uppercase;">Supplier</span>
                    <div style="font-size:0.9rem;font-weight:500;">${po.supplier || '-'}</div>
                </div>
                <div>
                    <span class="text-muted" style="font-size:0.72rem;text-transform:uppercase;">Tanggal Dibuat</span>
                    <div style="font-size:0.9rem;">${po.createdAt ? po.createdAt.split('T')[0] : '-'}</div>
                </div>
                <div>
                    <span class="text-muted" style="font-size:0.72rem;text-transform:uppercase;">Tanggal Jatuh Tempo</span>
                    <div style="font-size:0.9rem;">${po.due_date || '-'}</div>
                </div>
                <div>
                    <span class="text-muted" style="font-size:0.72rem;text-transform:uppercase;">Catatan</span>
                    <div style="font-size:0.9rem;">${po.catatan || '-'}</div>
                </div>
            </div>

            <div class="glass" style="overflow-x:auto;border-radius:var(--radius-md);">
                <table style="width:100%;border-collapse:collapse;">
                    <thead>
                        <tr style="border-bottom:1px solid rgba(255,255,255,0.12);">
                            <th style="padding:10px 8px;text-align:left;font-size:0.72rem;text-transform:uppercase;" class="text-muted">#</th>
                            <th style="padding:10px 8px;text-align:left;font-size:0.72rem;text-transform:uppercase;" class="text-muted">Item</th>
                            <th style="padding:10px 8px;text-align:right;font-size:0.72rem;text-transform:uppercase;" class="text-muted">Qty</th>
                            <th style="padding:10px 8px;text-align:left;font-size:0.72rem;text-transform:uppercase;" class="text-muted">Satuan</th>
                            <th style="padding:10px 8px;text-align:right;font-size:0.72rem;text-transform:uppercase;" class="text-muted">Harga Satuan</th>
                            <th style="padding:10px 8px;text-align:right;font-size:0.72rem;text-transform:uppercase;" class="text-muted">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>${itemRows}</tbody>
                    <tfoot>
                        <tr style="border-top:2px solid rgba(255,255,255,0.15);">
                            <td colspan="5" style="padding:12px 8px;font-weight:700;text-align:right;">GRAND TOTAL</td>
                            <td style="padding:12px 8px;font-weight:700;text-align:right;font-size:1rem;" class="text-accent">${this._rp(grandTotal)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>`;
    },

    // ============================================================
    // KPI
    // ============================================================

    _calcKPI(pos) {
        const now = new Date();
        const thisMonth = now.toISOString().substring(0, 7); // YYYY-MM
        const poOpen = pos.filter(p => p.status === 'Draft' || p.status === 'Sent').length;
        const poThisMonth = pos.filter(p => p.createdAt && p.createdAt.startsWith(thisMonth)).length;
        const totalValue = pos.reduce((sum, p) => sum + this._calcPOTotal(p.items), 0);
        const pendingDelivery = pos.filter(p => p.status === 'Sent').length;
        return { poOpen, poThisMonth, totalValue, pendingDelivery };
    },

    /** Hitung total PO dari items */
    _calcPOTotal(items) {
        if (!items || !Array.isArray(items)) return 0;
        return items.reduce((sum, item) => {
            return sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0);
        }, 0);
    },

    // ============================================================
    // DATA LOADING
    // ============================================================

    async _loadPOs() {
        try {
            const index = (await this._get('ywm:purchasing:index:all')) || [];
            const pos = [];
            for (const poNum of index) {
                const po = await this._get('ywm:purchasing:po:' + poNum);
                if (po) pos.push(po);
            }
            // Urutkan: terbaru di atas
            pos.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
            return pos;
        } catch (err) {
            console.warn('[Purchasing] Gagal memuat PO:', err.message);
            return [];
        }
    },

    async _loadSuppliers() {
        try {
            const index = (await this._get('ywm:purchasing:supplier:index')) || [];
            const suppliers = [];
            for (const id of index) {
                const sup = await this._get('ywm:purchasing:supplier:' + id);
                if (sup) suppliers.push(sup);
            }
            return suppliers;
        } catch (err) {
            console.warn('[Purchasing] Gagal memuat supplier:', err.message);
            return [];
        }
    },

    // ============================================================
    // CRUD PO
    // ============================================================

    async _savePO(poData) {
        try {
            if (!poData.supplier || poData.supplier.trim() === '') throw new Error('Supplier wajib diisi');
            if (!poData.items || poData.items.length === 0) throw new Error('Minimal 1 item harus diisi');

            // Validasi setiap item
            for (const item of poData.items) {
                if (!item.item_name || item.item_name.trim() === '') throw new Error('Nama item wajib diisi');
                if (!item.quantity || Number(item.quantity) <= 0) throw new Error('Quantity harus > 0');
            }

            const poNumber = await this._nextPONumber();
            let index = (await this._get('ywm:purchasing:index:all')) || [];
            index.push(poNumber);
            await this._set('ywm:purchasing:index:all', index);

            const record = {
                poNumber,
                supplier: poData.supplier.trim(),
                items: poData.items.map(it => ({
                    item_name: it.item_name.trim(),
                    quantity: Number(it.quantity) || 0,
                    unit: it.unit || 'pcs',
                    unit_price: Number(it.unit_price) || 0,
                })),
                catatan: poData.catatan || '',
                due_date: poData.due_date || '',
                status: 'Draft',
            };

            await this._setWithTimestamp('ywm:purchasing:po:' + poNumber, record);
            console.log('[Purchasing] PO dibuat:', poNumber);
            return record;
        } catch (err) {
            console.error('[Purchasing] Gagal membuat PO:', err.message);
            throw err;
        }
    },

    async _updatePOStatus(poNumber, newStatus) {
        try {
            const po = await this._get('ywm:purchasing:po:' + poNumber);
            if (!po) throw new Error('PO tidak ditemukan');
            if (!this._poStatuses.includes(newStatus)) throw new Error('Status tidak valid');

            po.status = newStatus;
            await this._setWithTimestamp('ywm:purchasing:po:' + poNumber, po);
            console.log('[Purchasing] Status PO diupdate:', poNumber, newStatus);
        } catch (err) {
            console.error('[Purchasing] Gagal update status PO:', err.message);
            throw err;
        }
    },

    // ============================================================
    // CRUD SUPPLIER
    // ============================================================

    async _saveSupplier(supData, isEdit = false) {
        try {
            if (!supData.nama || supData.nama.trim() === '') throw new Error('Nama supplier wajib diisi');

            let id = supData.id;
            let index = (await this._get('ywm:purchasing:supplier:index')) || [];

            if (!isEdit) {
                id = await this._nextSupplierId();
                index.push(id);
                await this._set('ywm:purchasing:supplier:index', index);
            }

            const record = {
                id,
                nama: supData.nama.trim(),
                kontak: supData.kontak || '',
                telepon: supData.telepon || '',
                email: supData.email || '',
                alamat: supData.alamat || '',
            };

            await this._setWithTimestamp('ywm:purchasing:supplier:' + id, record);
            console.log('[Purchasing] Supplier disimpan:', id);
            return record;
        } catch (err) {
            console.error('[Purchasing] Gagal menyimpan supplier:', err.message);
            throw err;
        }
    },

    async _deleteSupplier(id) {
        try {
            await this._set('ywm:purchasing:supplier:' + id, null);
            let index = (await this._get('ywm:purchasing:supplier:index')) || [];
            index = index.filter(i => i !== id);
            await this._set('ywm:purchasing:supplier:index', index);
            console.log('[Purchasing] Supplier dihapus:', id);
        } catch (err) {
            console.error('[Purchasing] Gagal menghapus supplier:', err.message);
            throw err;
        }
    },

    // ============================================================
    // MODAL — Form Buat PO
    // ============================================================

    _renderPOForm(suppliers) {
        const supOptions = suppliers.map(s =>
            `<option value="${s.nama}">${s.nama}</option>`
        ).join('');

        return `
        <form id="po-create-form">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
                <div style="grid-column:span 2;">
                    <label class="label-glass">Supplier *</label>
                    <select name="supplier" class="select-glass" id="po-form-supplier" required>
                        <option value="">Pilih Supplier</option>
                        ${supOptions}
                    </select>
                </div>
                <div>
                    <label class="label-glass">Tanggal Jatuh Tempo</label>
                    <input type="date" name="due_date" class="input-glass">
                </div>
                <div></div>
                <div style="grid-column:span 2;">
                    <label class="label-glass">Catatan</label>
                    <textarea name="catatan" class="textarea-glass" rows="2" placeholder="Catatan tambahan"></textarea>
                </div>
            </div>

            <!-- Dynamic Items -->
            <div style="margin-top:18px;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
                    <label class="label-glass" style="margin:0;">Item PO *</label>
                    <button type="button" class="btn btn-sm glass" id="po-add-item-btn">+ Tambah Item</button>
                </div>
                <div id="po-items-container">
                    <div class="po-item-row" style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr auto;gap:8px;margin-bottom:8px;align-items:end;">
                        <div><input type="text" name="item_name_0" class="input-glass" placeholder="Nama item" required style="font-size:0.8rem;"></div>
                        <div><input type="number" name="quantity_0" class="input-glass" placeholder="Qty" min="1" required style="font-size:0.8rem;"></div>
                        <div><input type="text" name="unit_0" class="input-glass" placeholder="Satuan" value="pcs" style="font-size:0.8rem;"></div>
                        <div><input type="number" name="unit_price_0" class="input-glass" placeholder="Harga" min="0" required style="font-size:0.8rem;"></div>
                        <button type="button" class="btn btn-sm btn-danger po-remove-item" title="Hapus item" style="height:38px;">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                    </div>
                </div>
            </div>

            <div style="margin-top:20px;display:flex;justify-content:flex-end;gap:10px;">
                <button type="button" class="btn glass" onclick="YWM.UI.closeModal()">Batal</button>
                <button type="submit" class="btn btn-accent">Buat PO</button>
            </div>
        </form>`;
    },

    /** Render form supplier */
    _renderSupplierForm(sup = null) {
        const isEdit = !!sup;
        return `
        <form id="po-supplier-form">
            <input type="hidden" name="id" value="${sup ? sup.id : ''}">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
                <div style="grid-column:span 2;">
                    <label class="label-glass">Nama Supplier *</label>
                    <input type="text" name="nama" class="input-glass" value="${sup ? sup.nama : ''}" placeholder="PT ..." required>
                </div>
                <div>
                    <label class="label-glass">Kontak Person</label>
                    <input type="text" name="kontak" class="input-glass" value="${sup ? sup.kontak : ''}" placeholder="Nama kontak">
                </div>
                <div>
                    <label class="label-glass">Telepon</label>
                    <input type="tel" name="telepon" class="input-glass" value="${sup ? sup.telepon : ''}" placeholder="08xx">
                </div>
                <div style="grid-column:span 2;">
                    <label class="label-glass">Email</label>
                    <input type="email" name="email" class="input-glass" value="${sup ? sup.email : ''}" placeholder="email@supplier.com">
                </div>
                <div style="grid-column:span 2;">
                    <label class="label-glass">Alamat</label>
                    <textarea name="alamat" class="textarea-glass" rows="2" placeholder="Alamat lengkap">${sup ? sup.alamat : ''}</textarea>
                </div>
            </div>
            <div style="margin-top:20px;display:flex;justify-content:flex-end;gap:10px;">
                <button type="button" class="btn glass" onclick="YWM.UI.closeModal()">Batal</button>
                <button type="submit" class="btn btn-accent">${isEdit ? 'Simpan' : 'Tambah Supplier'}</button>
            </div>
        </form>`;
    },

    // ============================================================
    // SMART INPUT
    // ============================================================

    async processSmartInput(text) {
        try {
            if (!text || text.trim().length === 0) return null;
            const lower = text.toLowerCase();

            // Deteksi: buat PO
            if (lower.includes('buat po') || lower.includes('purchase order') || lower.includes('pesan')) {
                const parsed = await this._parsePOFromText(text);
                if (parsed) {
                    const saved = await this._savePO(parsed);
                    this._showToast('PO berhasil dibuat: ' + saved.poNumber, 'success');
                    if (window.YWM && window.YWM.App && typeof YWM.App.loadModule === 'function') {
                        await YWM.App.loadModule('purchasing');
                    }
                    return saved;
                }
            }

            // Fallback: AI parsing
            if (typeof puter !== 'undefined' && puter.ai) {
                const prompt = `Parse perintah purchasing berikut menjadi data PO JSON.
Perintah: "${text}"

Output JSON saja:
{
  "supplier": "nama supplier",
  "items": [{"item_name": "nama item", "quantity": 10, "unit": "pcs", "unit_price": 0}],
  "catatan": "",
  "due_date": ""
}`;
                const resp = await puter.ai.chat(prompt, { model: 'gpt-4o-mini' });
                const jsonStr = typeof resp === 'string' ? resp : resp?.message?.content || '';
                const match = jsonStr.match(/\{[\s\S]*\}/);
                if (match) {
                    const parsed = JSON.parse(match[0]);
                    const saved = await this._savePO(parsed);
                    this._showToast('PO dibuat via AI: ' + saved.poNumber, 'success');
                    if (window.YWM && window.YWM.App && typeof YWM.App.loadModule === 'function') {
                        await YWM.App.loadModule('purchasing');
                    }
                    return saved;
                }
            }

            this._showToast('Tidak dapat memproses perintah. Coba: "Buat PO untuk 10 bearing SKF 6205 dari supplier PT Surya"', 'warning');
            return null;
        } catch (err) {
            console.error('[Purchasing] Smart input error:', err);
            this._showToast('Gagal memproses input: ' + err.message, 'error');
            return null;
        }
    },

    /** Parse teks sederhana untuk data PO tanpa AI */
    async _parsePOFromText(text) {
        const lower = text.toLowerCase();
        let supplier = '', item_name = '', quantity = 1, unit = 'pcs';

        // Ekstrak supplier
        const supMatch = text.match(/(?:dari|supplier)\s+([A-Za-z\s]+?)(?:,|\.|$)/i);
        if (supMatch) supplier = supMatch[1].trim();

        // Ekstrak quantity + item
        const itemMatch = text.match(/(\d+)\s+(.+?)(?:\s+dari|\s+untuk|,|\.|$)/i);
        if (itemMatch) {
            quantity = parseInt(itemMatch[1]) || 1;
            item_name = itemMatch[2].trim();
        }

        if (!item_name && !supplier) return null;

        return {
            supplier: supplier || 'Unknown',
            items: [{ item_name: item_name || 'Item', quantity, unit, unit_price: 0 }],
            catatan: 'Dibuat via smart input',
            due_date: ''
        };
    },

    // ============================================================
    // TOAST
    // ============================================================

    _showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) { console.log('[Purchasing Toast]', message); return; }
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
        let itemCount = 1; // Counter untuk dynamic item rows

        // --- Tab Navigation ---
        document.querySelectorAll('.po-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.po-tab-btn').forEach(b => {
                    b.classList.remove('btn-accent');
                    b.classList.add('glass');
                });
                document.querySelectorAll('.po-tab-content').forEach(c => c.style.display = 'none');
                btn.classList.remove('glass');
                btn.classList.add('btn-accent');
                const tabId = 'po-tab-' + btn.dataset.tab;
                const tabEl = document.getElementById(tabId);
                if (tabEl) tabEl.style.display = 'block';
            });
        });

        // --- Buat PO ---
        const createBtn = document.getElementById('po-btn-create');
        if (createBtn) {
            createBtn.addEventListener('click', async () => {
                const suppliers = await self._loadSuppliers();
                self._openCreatePOModal(suppliers);
            });
        }

        // --- Voice Input ---
        const voiceBtn = document.getElementById('po-btn-voice');
        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => {
                self._startVoiceInput();
            });
        }

        // --- Klik baris PO untuk lihat detail ---
        document.querySelectorAll('.po-row-click').forEach(row => {
            row.addEventListener('click', async () => {
                const poNum = row.dataset.po;
                const po = await self._get('ywm:purchasing:po:' + poNum);
                if (po) self._openPODetailModal(po);
            });
        });

        // --- Tambah Supplier ---
        const addSupBtn = document.getElementById('po-btn-add-supplier');
        if (addSupBtn) {
            addSupBtn.addEventListener('click', () => {
                self._openSupplierModal();
            });
        }

        // --- Edit Supplier ---
        document.querySelectorAll('.po-btn-edit-sup').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                const sup = await self._get('ywm:purchasing:supplier:' + id);
                if (sup) self._openSupplierModal(sup);
            });
        });

        // --- Hapus Supplier ---
        document.querySelectorAll('.po-btn-del-sup').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                if (confirm('Yakin ingin menghapus supplier ' + id + '?')) {
                    try {
                        await self._deleteSupplier(id);
                        self._showToast('Supplier dihapus', 'success');
                        if (window.YWM && window.YWM.App && typeof YWM.App.loadModule === 'function') {
                            await YWM.App.loadModule('purchasing');
                        }
                    } catch (err) {
                        self._showToast('Gagal: ' + err.message, 'error');
                    }
                }
            });
        });
    },

    // ============================================================
    // MODAL HELPERS
    // ============================================================

    _openModal(title, bodyHtml) {
        if (window.YWM && window.YWM.UI && typeof YWM.UI.openModal === 'function') {
            YWM.UI.openModal(title, bodyHtml);
        } else {
            const overlay = document.getElementById('modal-overlay');
            const titleEl = document.getElementById('modal-title');
            const bodyEl = document.getElementById('modal-body');
            const footerEl = document.getElementById('modal-footer');
            if (overlay && titleEl && bodyEl) {
                titleEl.textContent = title;
                bodyEl.innerHTML = bodyHtml;
                if (footerEl) footerEl.style.display = 'none';
                overlay.classList.remove('hidden');
            }
        }
    },

    _closeModal() {
        if (window.YWM && window.YWM.UI && typeof YWM.UI.closeModal === 'function') {
            YWM.UI.closeModal();
        } else {
            const overlay = document.getElementById('modal-overlay');
            if (overlay) overlay.classList.add('hidden');
        }
    },

    async _openCreatePOModal(suppliers) {
        const self = this;
        let itemCount = 1;

        this._openModal('Buat Purchase Order', this._renderPOForm(suppliers));

        setTimeout(() => {
            // Dynamic item rows
            const addItemBtn = document.getElementById('po-add-item-btn');
            if (addItemBtn) {
                addItemBtn.addEventListener('click', () => {
                    const container = document.getElementById('po-items-container');
                    const idx = itemCount++;
                    const row = document.createElement('div');
                    row.className = 'po-item-row';
                    row.style.cssText = 'display:grid;grid-template-columns:2fr 1fr 1fr 1fr auto;gap:8px;margin-bottom:8px;align-items:end;';
                    row.innerHTML = `
                        <div><input type="text" name="item_name_${idx}" class="input-glass" placeholder="Nama item" required style="font-size:0.8rem;"></div>
                        <div><input type="number" name="quantity_${idx}" class="input-glass" placeholder="Qty" min="1" required style="font-size:0.8rem;"></div>
                        <div><input type="text" name="unit_${idx}" class="input-glass" placeholder="Satuan" value="pcs" style="font-size:0.8rem;"></div>
                        <div><input type="number" name="unit_price_${idx}" class="input-glass" placeholder="Harga" min="0" required style="font-size:0.8rem;"></div>
                        <button type="button" class="btn btn-sm btn-danger po-remove-item" title="Hapus item" style="height:38px;">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                    `;
                    container.appendChild(row);

                    // Attach remove handler
                    row.querySelector('.po-remove-item').addEventListener('click', () => row.remove());
                });
            }

            // Remove item buttons (initial row)
            document.querySelectorAll('.po-remove-item').forEach(btn => {
                btn.addEventListener('click', () => btn.closest('.po-item-row').remove());
            });

            // Form submit
            const form = document.getElementById('po-create-form');
            if (form) {
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const fd = new FormData(form);

                    // Kumpulkan items
                    const items = [];
                    const itemNames = fd.getAll('item_name_0') ? [] : []; // trigger
                    // Cara lebih baik: cari semua item_name_ fields
                    const entries = Object.fromEntries(fd.entries());
                    const itemIndices = new Set();
                    for (const key of Object.keys(entries)) {
                        const match = key.match(/item_name_(\d+)/);
                        if (match) itemIndices.add(parseInt(match[1]));
                    }

                    for (const idx of itemIndices) {
                        const item_name = entries[`item_name_${idx}`];
                        const quantity = entries[`quantity_${idx}`];
                        const unit = entries[`unit_${idx}`] || 'pcs';
                        const unit_price = entries[`unit_price_${idx}`];
                        if (item_name && quantity) {
                            items.push({ item_name, quantity, unit, unit_price });
                        }
                    }

                    const poData = {
                        supplier: entries.supplier,
                        items,
                        catatan: entries.catatan || '',
                        due_date: entries.due_date || '',
                    };

                    try {
                        const saved = await self._savePO(poData);
                        self._showToast('PO berhasil dibuat: ' + saved.poNumber, 'success');
                        self._closeModal();
                        if (window.YWM && window.YWM.App && typeof YWM.App.loadModule === 'function') {
                            await YWM.App.loadModule('purchasing');
                        }
                    } catch (err) {
                        self._showToast('Gagal membuat PO: ' + err.message, 'error');
                    }
                });
            }
        }, 100);
    },

    _openPODetailModal(po) {
        const self = this;
        this._openModal('Detail PO: ' + po.poNumber, this._renderPODetail(po));

        setTimeout(() => {
            const sendBtn = document.getElementById('po-detail-send');
            if (sendBtn) {
                sendBtn.addEventListener('click', async () => {
                    try {
                        await self._updatePOStatus(po.poNumber, 'Sent');
                        self._showToast('PO berhasil dikirim', 'success');
                        self._closeModal();
                        if (window.YWM && window.YWM.App && typeof YWM.App.loadModule === 'function') {
                            await YWM.App.loadModule('purchasing');
                        }
                    } catch (err) {
                        self._showToast('Gagal: ' + err.message, 'error');
                    }
                });
            }

            const receiveBtn = document.getElementById('po-detail-receive');
            if (receiveBtn) {
                receiveBtn.addEventListener('click', async () => {
                    try {
                        await self._updatePOStatus(po.poNumber, 'Received');
                        self._showToast('Barang diterima', 'success');
                        self._closeModal();
                        if (window.YWM && window.YWM.App && typeof YWM.App.loadModule === 'function') {
                            await YWM.App.loadModule('purchasing');
                        }
                    } catch (err) {
                        self._showToast('Gagal: ' + err.message, 'error');
                    }
                });
            }

            const cancelBtn = document.getElementById('po-detail-cancel');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', async () => {
                    if (confirm('Yakin ingin membatalkan PO ' + po.poNumber + '?')) {
                        try {
                            await self._updatePOStatus(po.poNumber, 'Cancelled');
                            self._showToast('PO dibatalkan', 'warning');
                            self._closeModal();
                            if (window.YWM && window.YWM.App && typeof YWM.App.loadModule === 'function') {
                                await YWM.App.loadModule('purchasing');
                            }
                        } catch (err) {
                            self._showToast('Gagal: ' + err.message, 'error');
                        }
                    }
                });
            }
        }, 100);
    },

    _openSupplierModal(sup = null) {
        const self = this;
        const isEdit = !!sup;
        this._openModal(isEdit ? 'Edit Supplier' : 'Tambah Supplier', this._renderSupplierForm(sup));

        setTimeout(() => {
            const form = document.getElementById('po-supplier-form');
            if (form) {
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const fd = new FormData(form);
                    const data = Object.fromEntries(fd.entries());

                    try {
                        await self._saveSupplier(data, isEdit);
                        self._showToast(isEdit ? 'Supplier diupdate' : 'Supplier ditambahkan', 'success');
                        self._closeModal();
                        if (window.YWM && window.YWM.App && typeof YWM.App.loadModule === 'function') {
                            await YWM.App.loadModule('purchasing');
                        }
                    } catch (err) {
                        self._showToast('Gagal: ' + err.message, 'error');
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
                if (!started) this._showToast('Gagal memulai perekaman suara', 'error');
            } catch (err) {
                this._showToast('Error voice input: ' + err.message, 'error');
            }
        } else {
            const text = prompt('Masukkan perintah (contoh: "Buat PO untuk 10 bearing SKF 6205 dari supplier PT Surya"):');
            if (text) await this.processSmartInput(text);
        }
    }
};

console.log('[Purchasing Module] Modul Purchasing dimuat ✓');
