/**
 * ============================================================
 * DOKUMEN & OCR — Modul Dashboard PT Yoga Wibawa Mandiri
 * ============================================================
 *
 * Modul ini menangani:
 * - Upload dokumen ke Puter FS + metadata form
 * - OCR Scanner: gambar → puter.ai.img2txt() → AI parse ke data terstruktur
 * - Document viewer: detail dokumen + hasil OCR
 * - Search & filter: berdasarkan kategori, tanggal, tag, konten OCR
 * - Grid kartu dokumen dengan status OCR
 *
 * KV Pattern:
 *   ywm:doc:meta:DOC-001      — Metadata dokumen per ID
 *   ywm:doc:index:all          — Index seluruh ID dokumen
 *   ywm:doc:ocr:DOC-001        — Hasil OCR per dokumen
 *
 * FS Pattern:
 *   /ywm-dashboard/documents/{category}/ — Lokasi file di Puter FS
 *
 * @version 1.0.0
 * @author YWM Development Team
 */

window.YWM = window.YWM || {};
window.YWM.Modules = window.YWM.Modules || {};

YWM.Modules.documents = {
    title: 'Dokumen & OCR',

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
            console.warn('[Documents] Gagal membaca KV:', key, err.message);
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
            console.warn('[Documents] Gagal menyimpan KV:', key, err.message);
        }
    },

    async _setWithTimestamp(key, value) {
        const record = { ...value, updatedAt: new Date().toISOString() };
        if (!record.createdAt) record.createdAt = record.updatedAt;
        await this._set(key, record);
        try {
            if (window.YWM && window.YWM.Data && typeof YWM.Data.addAuditLog === 'function') {
                await YWM.Data.addAuditLog('documents', 'set', key);
            }
        } catch (_) { /* abaikan */ }
    },

    // ============================================================
    // HELPERS
    // ============================================================

    /** Generate ID dokumen berikutnya */
    async _nextDocId() {
        const index = (await this._get('ywm:doc:index:all')) || [];
        let max = 0;
        index.forEach(id => {
            const num = parseInt(id.replace('DOC-', ''), 10);
            if (num > max) max = num;
        });
        return 'DOC-' + String(max + 1).padStart(3, '0');
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

    /** Kategori dokumen yang valid */
    _categories: ['Invoice', 'Report', 'Certificate', 'Contract', 'Manual', 'Other'],

    /** Ikon per kategori */
    _categoryIcon(cat) {
        const icons = {
            'Invoice': '&#128196;',
            'Report': '&#128202;',
            'Certificate': '&#127942;',
            'Contract': '&#128221;',
            'Manual': '&#128214;',
            'Other': '&#128206;'
        };
        return icons[cat] || icons['Other'];
    },

    // ============================================================
    // RENDER — Tampilan utama modul
    // ============================================================

    async render() {
        const docs = await this._loadDocuments();
        const kpi = this._calcKPI(docs);

        return `
        <div class="module-documents animate-fade-in">
            <!-- Header -->
            <div class="module-header" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
                <h2 style="font-size:1.4rem;font-weight:700;">${this.title}</h2>
                <div style="display:flex;gap:8px;">
                    <button class="btn btn-accent btn-sm" id="doc-btn-upload">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        Upload
                    </button>
                    <button class="btn btn-sm glass" id="doc-btn-ocr">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                        Scan OCR
                    </button>
                </div>
            </div>

            <!-- KPI Row -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-bottom:24px;">
                <div class="glass" style="padding:16px;border-radius:var(--radius-md);">
                    <div class="text-muted" style="font-size:0.72rem;text-transform:uppercase;letter-spacing:0.5px;">Total Dokumen</div>
                    <div style="font-size:1.6rem;font-weight:700;margin-top:4px;" class="text-accent">${kpi.total}</div>
                </div>
                <div class="glass" style="padding:16px;border-radius:var(--radius-md);">
                    <div class="text-muted" style="font-size:0.72rem;text-transform:uppercase;letter-spacing:0.5px;">Scanned (OCR)</div>
                    <div style="font-size:1.6rem;font-weight:700;margin-top:4px;" class="text-success">${kpi.scanned}</div>
                </div>
                <div class="glass" style="padding:16px;border-radius:var(--radius-md);">
                    <div class="text-muted" style="font-size:0.72rem;text-transform:uppercase;letter-spacing:0.5px;">Pending</div>
                    <div style="font-size:1.6rem;font-weight:700;margin-top:4px;" class="text-warning">${kpi.pending}</div>
                </div>
                <div class="glass" style="padding:16px;border-radius:var(--radius-md);">
                    <div class="text-muted" style="font-size:0.72rem;text-transform:uppercase;letter-spacing:0.5px;">Kategori Terbanyak</div>
                    <div style="font-size:1.2rem;font-weight:700;margin-top:4px;" class="text-accent">${kpi.topCategory}</div>
                </div>
            </div>

            <!-- Search & Filter -->
            <div style="display:flex;gap:10px;margin-bottom:18px;flex-wrap:wrap;align-items:center;">
                <div style="flex:1;min-width:200px;">
                    <input type="text" id="doc-search-input" class="input-glass" placeholder="Cari dokumen, tag, atau konten OCR..." style="font-size:0.85rem;">
                </div>
                <select id="doc-filter-category" class="select-glass" style="width:auto;min-width:140px;">
                    <option value="">Semua Kategori</option>
                    ${this._categories.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
                <select id="doc-filter-ocr" class="select-glass" style="width:auto;min-width:140px;">
                    <option value="">Semua Status OCR</option>
                    <option value="scanned">Sudah OCR</option>
                    <option value="pending">Belum OCR</option>
                </select>
            </div>

            <!-- Document Grid -->
            <div id="doc-grid">
                ${this._renderDocGrid(docs)}
            </div>
        </div>`;
    },

    // ============================================================
    // SUB-RENDER
    // ============================================================

    /** Render grid kartu dokumen */
    _renderDocGrid(docs) {
        if (!docs || docs.length === 0) {
            return `<div class="glass" style="padding:40px;text-align:center;">
                <p class="text-muted">Belum ada dokumen. Klik "Upload" atau "Scan OCR" untuk memulai.</p>
            </div>`;
        }

        let cards = docs.map(doc => {
            const ocrBadge = doc.ocrStatus === 'Scanned' ? 'badge-success' : 'badge-warning';
            const catIcon = this._categoryIcon(doc.kategori);
            const tags = (doc.tags || []).map(t => `<span style="background:rgba(0,212,255,0.1);color:var(--accent);padding:2px 8px;border-radius:10px;font-size:0.65rem;">${t}</span>`).join(' ');

            return `
            <div class="glass doc-card" data-id="${doc.id}" style="padding:16px;border-radius:var(--radius-md);cursor:pointer;transition:all 0.2s;">
                <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:10px;">
                    <span style="font-size:1.8rem;">${catIcon}</span>
                    <span class="badge ${ocrBadge}">${doc.ocrStatus || 'Pending'}</span>
                </div>
                <h4 style="font-size:0.9rem;font-weight:600;margin-bottom:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${doc.judul || 'Untitled'}</h4>
                <div style="font-size:0.75rem;margin-bottom:6px;" class="text-muted">${doc.kategori || 'Other'}</div>
                <div style="font-size:0.72rem;" class="text-muted">${doc.createdAt ? doc.createdAt.split('T')[0] : '-'}</div>
                <div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:4px;">${tags}</div>
                <div style="margin-top:10px;display:flex;gap:6px;">
                    <button class="btn btn-sm glass doc-btn-view" data-id="${doc.id}" title="Lihat detail">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                    ${doc.ocrStatus !== 'Scanned' ? `
                    <button class="btn btn-sm btn-accent doc-btn-run-ocr" data-id="${doc.id}" title="Jalankan OCR">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                    </button>` : ''}
                    <button class="btn btn-sm btn-danger doc-btn-del" data-id="${doc.id}" title="Hapus">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                    </button>
                </div>
            </div>`;
        }).join('');

        return `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px;">${cards}</div>`;
    },

    /** Render upload form */
    _renderUploadForm() {
        const catOptions = this._categories.map(c =>
            `<option value="${c}">${c}</option>`
        ).join('');

        return `
        <form id="doc-upload-form">
            <div style="margin-bottom:16px;">
                <label class="label-glass">File Dokumen *</label>
                <input type="file" id="doc-file-input" class="input-glass" accept="image/*,.pdf" required
                    style="padding:8px;">
                <div style="font-size:0.7rem;margin-top:4px;" class="text-muted">Format: JPG, PNG, WebP, PDF. Maks 10MB.</div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
                <div style="grid-column:span 2;">
                    <label class="label-glass">Judul Dokumen *</label>
                    <input type="text" name="judul" class="input-glass" placeholder="Judul dokumen" required>
                </div>
                <div>
                    <label class="label-glass">Kategori *</label>
                    <select name="kategori" class="select-glass" required>
                        <option value="">Pilih Kategori</option>
                        ${catOptions}
                    </select>
                </div>
                <div>
                    <label class="label-glass">Tags (pisah koma)</label>
                    <input type="text" name="tags" class="input-glass" placeholder="contoh: bearing, invoice, Q1">
                </div>
                <div style="grid-column:span 2;">
                    <label class="label-glass">Deskripsi</label>
                    <textarea name="deskripsi" class="textarea-glass" rows="2" placeholder="Deskripsi singkat dokumen"></textarea>
                </div>
            </div>
            <div style="margin-top:16px;display:flex;align-items:center;gap:10px;">
                <label style="display:flex;align-items:center;gap:6px;font-size:0.85rem;cursor:pointer;">
                    <input type="checkbox" name="autoOcr" id="doc-auto-ocr" checked>
                    Jalankan OCR otomatis setelah upload
                </label>
            </div>
            <div style="margin-top:20px;display:flex;justify-content:flex-end;gap:10px;">
                <button type="button" class="btn glass" onclick="YWM.UI.closeModal()">Batal</button>
                <button type="submit" class="btn btn-accent" id="doc-upload-submit">Upload</button>
            </div>
            <div id="doc-upload-progress" style="display:none;margin-top:12px;">
                <div class="text-muted" style="font-size:0.8rem;margin-bottom:6px;">Mengupload & memproses...</div>
                <div style="background:rgba(255,255,255,0.1);border-radius:4px;height:6px;overflow:hidden;">
                    <div id="doc-progress-bar" style="background:var(--accent);height:100%;width:0%;transition:width 0.3s;"></div>
                </div>
            </div>
        </form>`;
    },

    /** Render OCR scanner panel */
    _renderOCRScanner() {
        return `
        <div id="doc-ocr-panel">
            <div style="margin-bottom:16px;">
                <label class="label-glass">Upload Gambar untuk OCR *</label>
                <input type="file" id="ocr-file-input" class="input-glass" accept="image/*"
                    style="padding:8px;">
                <div style="font-size:0.7rem;margin-top:4px;" class="text-muted">Format: JPG, PNG, WebP. OCR akan mengekstrak teks dari gambar.</div>
            </div>
            <button class="btn btn-accent" id="ocr-run-btn" style="width:100%;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                Jalankan OCR
            </button>
            <div id="ocr-result-area" style="display:none;margin-top:16px;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                    <label class="label-glass" style="margin:0;">Hasil OCR</label>
                    <button class="btn btn-sm glass" id="ocr-parse-btn">AI Parse Data</button>
                </div>
                <div id="ocr-raw-text" class="glass" style="padding:12px;border-radius:var(--radius-sm);font-size:0.8rem;max-height:200px;overflow-y:auto;white-space:pre-wrap;"></div>
                <div id="ocr-parsed-data" style="display:none;margin-top:12px;">
                    <label class="label-glass">Data Terstruktur</label>
                    <div id="ocr-parsed-content" class="glass" style="padding:12px;border-radius:var(--radius-sm);font-size:0.8rem;"></div>
                </div>
                <div style="margin-top:12px;">
                    <button class="btn btn-accent btn-sm" id="ocr-save-doc">Simpan sebagai Dokumen</button>
                </div>
            </div>
            <div id="ocr-loading" style="display:none;margin-top:16px;text-align:center;">
                <div class="spinner spinner-lg" style="margin:0 auto 8px;"></div>
                <p class="text-muted" style="font-size:0.8rem;" id="ocr-loading-text">Memproses OCR...</p>
            </div>
        </div>`;
    },

    /** Render document viewer */
    _renderDocViewer(doc, ocrData) {
        if (!doc) return '<p class="text-error">Dokumen tidak ditemukan</p>';

        const catIcon = this._categoryIcon(doc.kategori);
        const tags = (doc.tags || []).map(t => `<span style="background:rgba(0,212,255,0.1);color:var(--accent);padding:2px 8px;border-radius:10px;font-size:0.65rem;">${t}</span>`).join(' ');

        let ocrSection = '';
        if (ocrData) {
            ocrSection = `
            <div style="margin-top:16px;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                    <label class="label-glass" style="margin:0;">Hasil OCR</label>
                    <button class="btn btn-sm glass doc-btn-reparse" data-id="${doc.id}">Re-parse AI</button>
                </div>
                <div class="glass" style="padding:12px;border-radius:var(--radius-sm);font-size:0.8rem;max-height:250px;overflow-y:auto;white-space:pre-wrap;margin-bottom:8px;">${ocrData.rawText || '(Teks tidak tersedia)'}</div>
                ${ocrData.parsed ? `
                <label class="label-glass">Data Terstruktur</label>
                <div class="glass" style="padding:12px;border-radius:var(--radius-sm);font-size:0.8rem;">
                    <pre style="margin:0;white-space:pre-wrap;">${JSON.stringify(ocrData.parsed, null, 2)}</pre>
                </div>` : ''}
            </div>`;
        }

        return `
        <div class="animate-fade-in">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
                <span style="font-size:2rem;">${catIcon}</span>
                <div>
                    <h3 style="font-size:1.1rem;font-weight:700;">${doc.judul || 'Untitled'}</h3>
                    <span class="badge ${doc.ocrStatus === 'Scanned' ? 'badge-success' : 'badge-warning'}">${doc.ocrStatus || 'Pending'}</span>
                </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
                <div>
                    <span class="text-muted" style="font-size:0.72rem;text-transform:uppercase;">Kategori</span>
                    <div style="font-size:0.9rem;">${doc.kategori || '-'}</div>
                </div>
                <div>
                    <span class="text-muted" style="font-size:0.72rem;text-transform:uppercase;">Upload Date</span>
                    <div style="font-size:0.9rem;">${doc.createdAt ? doc.createdAt.split('T')[0] : '-'}</div>
                </div>
                <div>
                    <span class="text-muted" style="font-size:0.72rem;text-transform:uppercase;">File</span>
                    <div style="font-size:0.9rem;">${doc.fileName || '-'}</div>
                </div>
                <div>
                    <span class="text-muted" style="font-size:0.72rem;text-transform:uppercase;">FS Path</span>
                    <div style="font-size:0.8rem;" class="text-muted">${doc.fsPath || '-'}</div>
                </div>
            </div>
            ${doc.deskripsi ? `
            <div style="margin-bottom:12px;">
                <span class="text-muted" style="font-size:0.72rem;text-transform:uppercase;">Deskripsi</span>
                <div style="font-size:0.85rem;">${doc.deskripsi}</div>
            </div>` : ''}
            ${tags ? `<div style="margin-bottom:12px;display:flex;flex-wrap:wrap;gap:4px;">${tags}</div>` : ''}
            ${ocrSection}
            <div style="margin-top:16px;display:flex;gap:8px;justify-content:flex-end;">
                ${doc.ocrStatus !== 'Scanned' ? `<button class="btn btn-accent btn-sm doc-btn-run-ocr-viewer" data-id="${doc.id}">Jalankan OCR</button>` : ''}
                <button class="btn btn-sm glass" onclick="YWM.UI.closeModal()">Tutup</button>
            </div>
        </div>`;
    },

    // ============================================================
    // KPI
    // ============================================================

    _calcKPI(docs) {
        const total = docs.length;
        const scanned = docs.filter(d => d.ocrStatus === 'Scanned').length;
        const pending = docs.filter(d => d.ocrStatus !== 'Scanned').length;

        // Kategori terbanyak
        const catCount = {};
        docs.forEach(d => {
            const cat = d.kategori || 'Other';
            catCount[cat] = (catCount[cat] || 0) + 1;
        });
        let topCategory = '-';
        let maxCount = 0;
        for (const [cat, count] of Object.entries(catCount)) {
            if (count > maxCount) {
                maxCount = count;
                topCategory = cat;
            }
        }

        return { total, scanned, pending, topCategory };
    },

    // ============================================================
    // DATA LOADING
    // ============================================================

    async _loadDocuments() {
        try {
            const index = (await this._get('ywm:doc:index:all')) || [];
            const docs = [];
            for (const id of index) {
                const doc = await this._get('ywm:doc:meta:' + id);
                if (doc) docs.push(doc);
            }
            docs.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
            return docs;
        } catch (err) {
            console.warn('[Documents] Gagal memuat dokumen:', err.message);
            return [];
        }
    },

    // ============================================================
    // CRUD DOKUMEN
    // ============================================================

    async _saveDocument(docData) {
        try {
            if (!docData.judul || docData.judul.trim() === '') throw new Error('Judul wajib diisi');
            if (!docData.kategori || !this._categories.includes(docData.kategori)) throw new Error('Kategori tidak valid');

            const id = await this._nextDocId();
            let index = (await this._get('ywm:doc:index:all')) || [];
            index.push(id);
            await this._set('ywm:doc:index:all', index);

            const tags = docData.tags || '';
            const tagsArray = typeof tags === 'string'
                ? tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
                : tags;

            const record = {
                id,
                judul: docData.judul.trim(),
                kategori: docData.kategori,
                deskripsi: docData.deskripsi || '',
                tags: tagsArray,
                fileName: docData.fileName || '',
                fileType: docData.fileType || '',
                fileSize: docData.fileSize || 0,
                fsPath: docData.fsPath || '',
                ocrStatus: docData.ocrStatus || 'Pending',
            };

            await this._setWithTimestamp('ywm:doc:meta:' + id, record);
            console.log('[Documents] Dokumen disimpan:', id);
            return record;
        } catch (err) {
            console.error('[Documents] Gagal menyimpan dokumen:', err.message);
            throw err;
        }
    },

    async _deleteDocument(id) {
        try {
            const doc = await this._get('ywm:doc:meta:' + id);
            // Hapus file dari Puter FS jika ada
            if (doc && doc.fsPath && typeof puter !== 'undefined' && puter.fs) {
                try {
                    await puter.fs.delete(doc.fsPath);
                } catch (fsErr) {
                    console.warn('[Documents] Gagal hapus file dari FS:', fsErr.message);
                }
            }
            // Hapus metadata
            await this._set('ywm:doc:meta:' + id, null);
            // Hapus OCR data
            await this._set('ywm:doc:ocr:' + id, null);
            // Update index
            let index = (await this._get('ywm:doc:index:all')) || [];
            index = index.filter(i => i !== id);
            await this._set('ywm:doc:index:all', index);
            console.log('[Documents] Dokumen dihapus:', id);
        } catch (err) {
            console.error('[Documents] Gagal menghapus dokumen:', err.message);
            throw err;
        }
    },

    // ============================================================
    // OCR
    // ============================================================

    /** Jalankan OCR pada file gambar dan simpan ke dokumen */
    async _runOCR(docId, imageFile) {
        try {
            if (typeof puter === 'undefined' || !puter.ai || typeof puter.ai.img2txt !== 'function') {
                throw new Error('puter.ai.img2txt tidak tersedia');
            }

            // Langkah 1: OCR — ekstrak teks dari gambar
            const rawText = await puter.ai.img2txt(imageFile);
            console.log('[Documents] OCR teks diekstrak:', (rawText || '').substring(0, 100) + '...');

            if (!rawText || rawText.trim().length === 0) {
                throw new Error('OCR tidak menghasilkan teks');
            }

            // Simpan hasil OCR mentah
            const ocrData = {
                docId,
                rawText,
                parsed: null,
                scannedAt: new Date().toISOString()
            };

            // Langkah 2: AI Parse ke data terstruktur
            try {
                const parsePrompt = `Extract structured data from this OCR text. The document is from PT Yoga Wibawa Mandiri (cement bagging company).

OCR Text:
${rawText.substring(0, 4000)}

Output JSON with relevant fields like: jenis_dokumen, nomor_referensi, tanggal, supplier, items (array of {nama, jumlah, satuan, harga_satuan}), total_keseluruhan, etc. Only include fields that are present in the text.

Output HANYA JSON, tanpa penjelasan.`;

                const resp = await puter.ai.chat(parsePrompt, { model: 'gpt-4o-mini' });
                const jsonStr = typeof resp === 'string' ? resp : resp?.message?.content || '';
                const match = jsonStr.match(/\{[\s\S]*\}/);
                if (match) {
                    ocrData.parsed = JSON.parse(match[0]);
                    console.log('[Documents] Data terstruktur berhasil diparse');
                }
            } catch (parseErr) {
                console.warn('[Documents] Gagal parse data terstruktur:', parseErr.message);
            }

            // Simpan data OCR
            await this._set('ywm:doc:ocr:' + docId, ocrData);

            // Update metadata dokumen
            const doc = await this._get('ywm:doc:meta:' + docId);
            if (doc) {
                doc.ocrStatus = 'Scanned';
                await this._setWithTimestamp('ywm:doc:meta:' + docId, doc);
            }

            console.log('[Documents] OCR selesai untuk:', docId);
            return ocrData;
        } catch (err) {
            console.error('[Documents] Gagal menjalankan OCR:', err.message);
            throw err;
        }
    },

    /** Re-parse data terstruktur dari teks OCR yang sudah ada */
    async _reparseOCR(docId) {
        try {
            const ocrData = await this._get('ywm:doc:ocr:' + docId);
            if (!ocrData || !ocrData.rawText) throw new Error('Data OCR tidak ditemukan');

            if (typeof puter === 'undefined' || !puter.ai) throw new Error('puter.ai tidak tersedia');

            const parsePrompt = `Extract structured data from this OCR text. The document is from PT Yoga Wibawa Mandiri (cement bagging company).

OCR Text:
${ocrData.rawText.substring(0, 4000)}

Output JSON with relevant fields. Only include fields that are present in the text.
Output HANYA JSON, tanpa penjelasan.`;

            const resp = await puter.ai.chat(parsePrompt, { model: 'gpt-4o-mini' });
            const jsonStr = typeof resp === 'string' ? resp : resp?.message?.content || '';
            const match = jsonStr.match(/\{[\s\S]*\}/);
            if (match) {
                ocrData.parsed = JSON.parse(match[0]);
                ocrData.reparsedAt = new Date().toISOString();
                await this._set('ywm:doc:ocr:' + docId, ocrData);
                console.log('[Documents] Re-parse selesai untuk:', docId);
                return ocrData;
            }
            throw new Error('Gagal mengekstrak JSON dari respons AI');
        } catch (err) {
            console.error('[Documents] Gagal re-parse OCR:', err.message);
            throw err;
        }
    },

    // ============================================================
    // PUTER FS — Upload file
    // ============================================================

    async _uploadToFS(file, category) {
        try {
            if (typeof puter === 'undefined' || !puter.fs) {
                console.warn('[Documents] puter.fs tidak tersedia');
                return null;
            }

            const basePath = '/ywm-dashboard/documents/';
            const catPath = basePath + category + '/';

            // Pastikan direktori ada
            try {
                await puter.fs.mkdir(basePath);
            } catch (_) { /* mungkin sudah ada */ }
            try {
                await puter.fs.mkdir(catPath);
            } catch (_) { /* mungkin sudah ada */ }

            // Upload file
            const timestamp = Date.now();
            const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
            const filePath = catPath + timestamp + '_' + sanitizedName;

            await puter.fs.write(filePath, file);
            console.log('[Documents] File disimpan di FS:', filePath);
            return filePath;
        } catch (err) {
            console.warn('[Documents] Gagal upload ke FS:', err.message);
            return null;
        }
    },

    // ============================================================
    // TOAST
    // ============================================================

    _showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) { console.log('[Documents Toast]', message); return; }
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

        // --- Upload Button ---
        const uploadBtn = document.getElementById('doc-btn-upload');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => {
                self._openUploadModal();
            });
        }

        // --- OCR Scanner Button ---
        const ocrBtn = document.getElementById('doc-btn-ocr');
        if (ocrBtn) {
            ocrBtn.addEventListener('click', () => {
                self._openOCRScannerModal();
            });
        }

        // --- View Document ---
        document.querySelectorAll('.doc-btn-view').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                await self._openDocViewerModal(id);
            });
        });

        // --- Run OCR from card ---
        document.querySelectorAll('.doc-btn-run-ocr').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                await self._runOCRFromCard(id);
            });
        });

        // --- Delete Document ---
        document.querySelectorAll('.doc-btn-del').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                if (await YWM.UI.confirm('Yakin ingin menghapus dokumen ' + id + '?')) {
                    try {
                        await self._deleteDocument(id);
                        self._showToast('Dokumen dihapus', 'success');
                        if (YWM.App && typeof YWM.App.refreshCurrentModule === 'function') {
                            await YWM.App.refreshCurrentModule();
                        }
                    } catch (err) {
                        self._showToast('Gagal: ' + err.message, 'error');
                    }
                }
            });
        });

        // --- Search & Filter ---
        const searchInput = document.getElementById('doc-search-input');
        const filterCategory = document.getElementById('doc-filter-category');
        const filterOcr = document.getElementById('doc-filter-ocr');

        const applyFilters = async () => {
            const allDocs = await self._loadDocuments();
            const query = (searchInput?.value || '').toLowerCase().trim();
            const catFilter = filterCategory?.value || '';
            const ocrFilter = filterOcr?.value || '';

            let filtered = allDocs;

            // Filter kategori
            if (catFilter) {
                filtered = filtered.filter(d => d.kategori === catFilter);
            }

            // Filter status OCR
            if (ocrFilter === 'scanned') {
                filtered = filtered.filter(d => d.ocrStatus === 'Scanned');
            } else if (ocrFilter === 'pending') {
                filtered = filtered.filter(d => d.ocrStatus !== 'Scanned');
            }

            // Filter pencarian teks
            if (query) {
                filtered = filtered.filter(d => {
                    const inTitle = (d.judul || '').toLowerCase().includes(query);
                    const inTags = (d.tags || []).some(t => t.toLowerCase().includes(query));
                    const inDesc = (d.deskripsi || '').toLowerCase().includes(query);
                    const inCategory = (d.kategori || '').toLowerCase().includes(query);
                    return inTitle || inTags || inDesc || inCategory;
                });

                // Jika query cukup panjang, cari juga di konten OCR
                if (query.length >= 3) {
                    const ocrMatches = [];
                    for (const doc of allDocs) {
                        if (filtered.find(f => f.id === doc.id)) continue;
                        try {
                            const ocrData = await self._get('ywm:doc:ocr:' + doc.id);
                            if (ocrData && ocrData.rawText && ocrData.rawText.toLowerCase().includes(query)) {
                                ocrMatches.push(doc);
                            }
                        } catch (_) { /* abaikan */ }
                    }
                    filtered = [...filtered, ...ocrMatches];
                }
            }

            // Update grid
            const grid = document.getElementById('doc-grid');
            if (grid) {
                grid.innerHTML = self._renderDocGrid(filtered);
                // Re-attach event listeners
                self._attachCardListeners();
            }
        };

        if (searchInput) searchInput.addEventListener('input', this._debounce(applyFilters, 300));
        if (filterCategory) filterCategory.addEventListener('change', applyFilters);
        if (filterOcr) filterOcr.addEventListener('change', applyFilters);
    },

    /** Re-attach card event listeners setelah filter/re-render */
    _attachCardListeners() {
        const self = this;

        document.querySelectorAll('.doc-btn-view').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                await self._openDocViewerModal(btn.dataset.id);
            });
        });

        document.querySelectorAll('.doc-btn-run-ocr').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                await self._runOCRFromCard(btn.dataset.id);
            });
        });

        document.querySelectorAll('.doc-btn-del').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (await YWM.UI.confirm('Yakin ingin menghapus dokumen ' + btn.dataset.id + '?')) {
                    try {
                        await self._deleteDocument(btn.dataset.id);
                        self._showToast('Dokumen dihapus', 'success');
                        if (YWM.App && typeof YWM.App.refreshCurrentModule === 'function') {
                            await YWM.App.refreshCurrentModule();
                        }
                    } catch (err) {
                        self._showToast('Gagal: ' + err.message, 'error');
                    }
                }
            });
        });
    },

    /** Debounce helper */
    _debounce(fn, delay) {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
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

    _openUploadModal() {
        const self = this;
        this._openModal('Upload Dokumen', this._renderUploadForm());

        setTimeout(() => {
            const form = document.getElementById('doc-upload-form');
            if (form) {
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const fd = new FormData(form);
                    const data = Object.fromEntries(fd.entries());
                    const fileInput = document.getElementById('doc-file-input');
                    const file = fileInput?.files[0];

                    if (!file) {
                        self._showToast('Pilih file terlebih dahulu', 'error');
                        return;
                    }

                    // Tampilkan progress
                    const progressEl = document.getElementById('doc-upload-progress');
                    const progressBar = document.getElementById('doc-progress-bar');
                    if (progressEl) progressEl.style.display = 'block';
                    if (progressBar) progressBar.style.width = '20%';

                    try {
                        // Upload ke Puter FS
                        if (progressBar) progressBar.style.width = '40%';
                        const fsPath = await self._uploadToFS(file, data.kategori || 'Other');

                        if (progressBar) progressBar.style.width = '60%';

                        // Simpan metadata
                        const doc = await self._saveDocument({
                            ...data,
                            fileName: file.name,
                            fileType: file.type,
                            fileSize: file.size,
                            fsPath: fsPath || '',
                        });

                        if (progressBar) progressBar.style.width = '80%';

                        // Auto OCR jika dicentang
                        if (data.autoOcr && file.type.startsWith('image/')) {
                            try {
                                await self._runOCR(doc.id, file);
                            } catch (ocrErr) {
                                console.warn('[Documents] Auto OCR gagal:', ocrErr.message);
                            }
                        }

                        if (progressBar) progressBar.style.width = '100%';

                        self._showToast('Dokumen berhasil diupload: ' + doc.id, 'success');
                        self._closeModal();
                        if (YWM.App && typeof YWM.App.refreshCurrentModule === 'function') {
                            await YWM.App.refreshCurrentModule();
                        }
                    } catch (err) {
                        self._showToast('Gagal upload: ' + err.message, 'error');
                        if (progressEl) progressEl.style.display = 'none';
                    }
                });
            }
        }, 100);
    },

    _openOCRScannerModal() {
        const self = this;
        let currentOcrRawText = '';
        let currentOcrParsed = null;

        this._openModal('Scan OCR', this._renderOCRScanner());

        setTimeout(() => {
            const runBtn = document.getElementById('ocr-run-btn');
            const fileInput = document.getElementById('ocr-file-input');
            const resultArea = document.getElementById('ocr-result-area');
            const rawTextEl = document.getElementById('ocr-raw-text');
            const loadingEl = document.getElementById('ocr-loading');
            const loadingText = document.getElementById('ocr-loading-text');
            const parseBtn = document.getElementById('ocr-parse-btn');
            const parsedDataEl = document.getElementById('ocr-parsed-data');
            const parsedContentEl = document.getElementById('ocr-parsed-content');
            const saveBtn = document.getElementById('ocr-save-doc');

            if (runBtn && fileInput) {
                runBtn.addEventListener('click', async () => {
                    const file = fileInput.files[0];
                    if (!file) {
                        self._showToast('Pilih gambar terlebih dahulu', 'error');
                        return;
                    }

                    // Tampilkan loading
                    if (resultArea) resultArea.style.display = 'none';
                    if (loadingEl) loadingEl.style.display = 'block';
                    if (loadingText) loadingText.textContent = 'Memproses OCR...';

                    try {
                        // Langkah 1: img2txt
                        if (typeof puter === 'undefined' || !puter.ai || typeof puter.ai.img2txt !== 'function') {
                            throw new Error('puter.ai.img2txt tidak tersedia');
                        }

                        if (loadingText) loadingText.textContent = 'Mengekstrak teks dari gambar...';
                        const rawText = await puter.ai.img2txt(file);
                        currentOcrRawText = rawText || '';

                        if (!currentOcrRawText || currentOcrRawText.trim().length === 0) {
                            throw new Error('OCR tidak menghasilkan teks. Coba gambar lain.');
                        }

                        // Tampilkan hasil
                        if (rawTextEl) rawTextEl.textContent = currentOcrRawText;
                        if (resultArea) resultArea.style.display = 'block';
                        if (loadingEl) loadingEl.style.display = 'none';

                        self._showToast('OCR berhasil — teks diekstrak', 'success');
                    } catch (err) {
                        if (loadingEl) loadingEl.style.display = 'none';
                        self._showToast('Gagal OCR: ' + err.message, 'error');
                    }
                });
            }

            // AI Parse button
            if (parseBtn) {
                parseBtn.addEventListener('click', async () => {
                    if (!currentOcrRawText) {
                        self._showToast('Tidak ada teks OCR untuk diparse', 'warning');
                        return;
                    }

                    if (loadingEl) loadingEl.style.display = 'block';
                    if (loadingText) loadingText.textContent = 'Mem-parsing data dengan AI...';

                    try {
                        if (typeof puter === 'undefined' || !puter.ai) {
                            throw new Error('puter.ai tidak tersedia');
                        }

                        const parsePrompt = `Extract structured data from this OCR text. The document is from PT Yoga Wibawa Mandiri (cement bagging company).

OCR Text:
${currentOcrRawText.substring(0, 4000)}

Output JSON with relevant fields like: jenis_dokumen, nomor_referensi, tanggal, supplier, items, total, etc.
Output HANYA JSON, tanpa penjelasan.`;

                        const resp = await puter.ai.chat(parsePrompt, { model: 'gpt-4o-mini' });
                        const jsonStr = typeof resp === 'string' ? resp : resp?.message?.content || '';
                        const match = jsonStr.match(/\{[\s\S]*\}/);

                        if (match) {
                            currentOcrParsed = JSON.parse(match[0]);
                            if (parsedContentEl) {
                                parsedContentEl.innerHTML = `<pre style="margin:0;white-space:pre-wrap;">${JSON.stringify(currentOcrParsed, null, 2)}</pre>`;
                            }
                            if (parsedDataEl) parsedDataEl.style.display = 'block';
                            self._showToast('Data berhasil diparse oleh AI', 'success');
                        } else {
                            throw new Error('Gagal mengekstrak JSON dari respons AI');
                        }
                    } catch (err) {
                        self._showToast('Gagal parse: ' + err.message, 'error');
                    } finally {
                        if (loadingEl) loadingEl.style.display = 'none';
                    }
                });
            }

            // Save as document button
            if (saveBtn) {
                saveBtn.addEventListener('click', async () => {
                    try {
                        // Simpan sebagai dokumen baru
                        const doc = await self._saveDocument({
                            judul: 'OCR Scan - ' + self._today(),
                            kategori: 'Other',
                            deskripsi: 'Dokumen dari OCR scan',
                            tags: 'ocr,scanned',
                            ocrStatus: 'Scanned',
                        });

                        // Simpan data OCR
                        await self._set('ywm:doc:ocr:' + doc.id, {
                            docId: doc.id,
                            rawText: currentOcrRawText,
                            parsed: currentOcrParsed,
                            scannedAt: new Date().toISOString()
                        });

                        self._showToast('Dokumen OCR disimpan: ' + doc.id, 'success');
                        self._closeModal();
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

    async _openDocViewerModal(id) {
        const self = this;
        const doc = await this._get('ywm:doc:meta:' + id);
        if (!doc) {
            this._showToast('Dokumen tidak ditemukan', 'error');
            return;
        }
        const ocrData = await this._get('ywm:doc:ocr:' + id);

        this._openModal('Detail: ' + (doc.judul || doc.id), this._renderDocViewer(doc, ocrData));

        setTimeout(() => {
            // Re-parse button
            const reparseBtn = document.querySelector('.doc-btn-reparse');
            if (reparseBtn) {
                reparseBtn.addEventListener('click', async () => {
                    try {
                        self._showToast('Mem-parsing ulang data...', 'info');
                        const result = await self._reparseOCR(id);
                        self._showToast('Data berhasil di-parse ulang', 'success');
                        self._closeModal();
                        await self._openDocViewerModal(id);
                    } catch (err) {
                        self._showToast('Gagal: ' + err.message, 'error');
                    }
                });
            }

            // Run OCR from viewer
            const runOcrBtn = document.querySelector('.doc-btn-run-ocr-viewer');
            if (runOcrBtn) {
                runOcrBtn.addEventListener('click', async () => {
                    await self._runOCRFromCard(id);
                    self._closeModal();
                    await self._openDocViewerModal(id);
                });
            }
        }, 100);
    },

    /** Jalankan OCR dari kartu dokumen */
    async _runOCRFromCard(id) {
        const self = this;
        this._showToast('Menjalankan OCR...', 'info');

        try {
            const doc = await this._get('ywm:doc:meta:' + id);
            if (!doc) throw new Error('Dokumen tidak ditemukan');

            // Periksa apakah file ada di Puter FS
            if (!doc.fsPath || typeof puter === 'undefined' || !puter.fs) {
                throw new Error('File tidak tersedia di Puter FS untuk di-OCR');
            }

            // Baca file dari Puter FS
            let fileData;
            try {
                const fileEntry = await puter.fs.read(doc.fsPath);
                // Konversi ke File/Blob
                if (fileEntry instanceof Blob) {
                    fileData = fileData;
                } else if (fileEntry instanceof ArrayBuffer) {
                    fileData = new Blob([fileEntry]);
                } else {
                    fileData = fileEntry;
                }
            } catch (readErr) {
                throw new Error('Gagal membaca file dari FS: ' + readErr.message);
            }

            // Jalankan OCR
            const ocrResult = await self._runOCR(id, fileData);
            self._showToast('OCR selesai untuk ' + id, 'success');

            if (YWM.App && typeof YWM.App.refreshCurrentModule === 'function') {
                await YWM.App.refreshCurrentModule();
            }
        } catch (err) {
            self._showToast('Gagal OCR: ' + err.message, 'error');
        }
    }
};

console.log('[Documents Module] Modul Dokumen & OCR dimuat ✓');
