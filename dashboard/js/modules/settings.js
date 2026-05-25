/**
 * ============================================================
 * PENGATURAN — Modul Settings YWM Dashboard
 * PT Yoga Wibawa Mandiri — Cement Bagging Company
 * ============================================================
 *
 * Fitur:
 * 1. Header — Judul "Pengaturan"
 * 2. General Settings — Nama perusahaan, alamat, telepon, logo
 * 3. User Management — Daftar user dengan role assignment
 * 4. Module Configuration — Enable/disable modul
 * 5. Notification Settings — Toggle notifikasi per tipe
 * 6. Data Management — Export backup, Import data, Clear cache
 * 7. About — Versi app, status Puter.js, info koneksi
 *
 * KV: ywm:settings:app, ywm:settings:modules, ywm:settings:notifications, ywm:auth:role:{username}
 *
 * @version 1.0.0
 */

window.YWM = window.YWM || {};
window.YWM.Modules = window.YWM.Modules || {};

YWM.Modules.settings = {
    title: 'Pengaturan',

    /** Daftar role yang tersedia */
    _roles: [
        { id: 'superadmin', label: 'Super Admin', color: 'var(--status-error)', level: 0 },
        { id: 'admin', label: 'Admin', color: 'var(--status-warning)', level: 1 },
        { id: 'manager', label: 'Manager', color: 'var(--accent)', level: 2 },
        { id: 'supervisor', label: 'Supervisor', color: 'var(--status-success)', level: 3 },
        { id: 'operator', label: 'Operator', color: 'var(--status-info)', level: 4 },
        { id: 'teknisi', label: 'Teknisi', color: 'var(--status-info)', level: 5 },
        { id: 'sales', label: 'Sales', color: 'var(--text-secondary)', level: 6 },
        { id: 'viewer', label: 'Viewer', color: 'var(--text-muted)', level: 7 }
    ],

    /** Daftar modul yang bisa di-toggle */
    _availableModules: [
        { id: 'home', label: 'Beranda', icon: '🏠', required: true },
        { id: 'production', label: 'Produksi', icon: '📊' },
        { id: 'spareparts', label: 'Spare Parts', icon: '🔧' },
        { id: 'maintenance', label: 'Maintenance', icon: '⚙️' },
        { id: 'quality', label: 'Quality Control', icon: '✅' },
        { id: 'team', label: 'Tim & Aktivitas', icon: '👥' },
        { id: 'finance', label: 'Keuangan', icon: '💰' },
        { id: 'hr', label: 'HR & Payroll', icon: '🧑‍💼' },
        { id: 'purchasing', label: 'Purchasing', icon: '🛒' },
        { id: 'safety', label: 'Safety / HSE', icon: '⚠️' },
        { id: 'documents', label: 'Dokumen & OCR', icon: '📄' },
        { id: 'reports', label: 'Laporan', icon: '📋' },
        { id: 'notifications', label: 'Notifikasi', icon: '🔔' },
        { id: 'analytics', label: 'Analytics', icon: '📈' },
        { id: 'settings', label: 'Pengaturan', icon: '⚙️', required: true }
    ],

    /** Tipe notifikasi yang bisa di-toggle */
    _notificationTypes: [
        { id: 'produksi', label: 'Produksi', icon: '📊' },
        { id: 'maintenance', label: 'Maintenance', icon: '🔧' },
        { id: 'stok', label: 'Stok & Inventaris', icon: '📦' },
        { id: 'hse', label: 'HSE & Safety', icon: '⚠️' },
        { id: 'keuangan', label: 'Keuangan', icon: '💰' },
        { id: 'hr', label: 'HR & Karyawan', icon: '🧑‍💼' },
        { id: 'system', label: 'Sistem', icon: '🖥️' }
    ],

    /** State internal */
    _state: {
        appSettings: null,
        moduleConfig: null,
        notifSettings: null,
        users: [],
        activeTab: 'general'
    },

    /**
     * Render tampilan utama modul Pengaturan
     * @returns {Promise<string>} HTML string
     */
    async render() {
        // Muat semua pengaturan dari KV
        await this._loadAllSettings();

        return `
            <div class="settings-module animate-fade-in">
                <!-- Header -->
                <div class="module-header" style="margin-bottom:24px;">
                    <h2 style="font-size:1.5rem;font-weight:700;margin-bottom:4px;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" style="vertical-align:middle;margin-right:8px;">
                            <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
                        </svg>
                        Pengaturan
                    </h2>
                    <p class="text-muted">Konfigurasi dashboard PT Yoga Wibawa Mandiri</p>
                </div>

                <!-- Tab Navigation -->
                <div style="display:flex;gap:4px;margin-bottom:24px;overflow-x:auto;padding-bottom:4px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:12px;">
                    <button class="btn btn-sm settings-tab ${this._state.activeTab === 'general' ? 'btn-accent' : ''}" data-settings-tab="general">🏢 Umum</button>
                    <button class="btn btn-sm settings-tab ${this._state.activeTab === 'users' ? 'btn-accent' : ''}" data-settings-tab="users">👥 Pengguna</button>
                    <button class="btn btn-sm settings-tab ${this._state.activeTab === 'modules' ? 'btn-accent' : ''}" data-settings-tab="modules">🧩 Modul</button>
                    <button class="btn btn-sm settings-tab ${this._state.activeTab === 'notifications' ? 'btn-accent' : ''}" data-settings-tab="notifications">🔔 Notifikasi</button>
                    <button class="btn btn-sm settings-tab ${this._state.activeTab === 'data' ? 'btn-accent' : ''}" data-settings-tab="data">💾 Data</button>
                    <button class="btn btn-sm settings-tab ${this._state.activeTab === 'about' ? 'btn-accent' : ''}" data-settings-tab="about">ℹ️ Tentang</button>
                </div>

                <!-- Tab Contents -->
                <div id="settings-tab-general" class="settings-tab-content" style="display:${this._state.activeTab === 'general' ? 'block' : 'none'};">
                    ${this._renderGeneralSettings()}
                </div>
                <div id="settings-tab-users" class="settings-tab-content" style="display:${this._state.activeTab === 'users' ? 'block' : 'none'};">
                    ${this._renderUserManagement()}
                </div>
                <div id="settings-tab-modules" class="settings-tab-content" style="display:${this._state.activeTab === 'modules' ? 'block' : 'none'};">
                    ${this._renderModuleConfig()}
                </div>
                <div id="settings-tab-notifications" class="settings-tab-content" style="display:${this._state.activeTab === 'notifications' ? 'block' : 'none'};">
                    ${this._renderNotificationSettings()}
                </div>
                <div id="settings-tab-data" class="settings-tab-content" style="display:${this._state.activeTab === 'data' ? 'block' : 'none'};">
                    ${this._renderDataManagement()}
                </div>
                <div id="settings-tab-about" class="settings-tab-content" style="display:${this._state.activeTab === 'about' ? 'block' : 'none'};">
                    ${this._renderAbout()}
                </div>
            </div>
        `;
    },

    /**
     * Inisialisasi event listener
     */
    async init() {
        const self = this;

        // Tab navigation
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                self._state.activeTab = tab.dataset.settingsTab;

                // Update tab buttons
                document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('btn-accent'));
                tab.classList.add('btn-accent');

                // Show/hide content
                document.querySelectorAll('.settings-tab-content').forEach(c => c.style.display = 'none');
                const content = document.getElementById(`settings-tab-${self._state.activeTab}`);
                if (content) content.style.display = 'block';
            });
        });

        // General Settings — Save
        const formGeneral = document.getElementById('form-general-settings');
        if (formGeneral) {
            formGeneral.addEventListener('submit', async (e) => {
                e.preventDefault();
                await self._saveGeneralSettings();
            });
        }

        // User Management — Add User
        const btnAddUser = document.getElementById('btn-add-user');
        if (btnAddUser) {
            btnAddUser.addEventListener('click', () => {
                self._openAddUserModal();
            });
        }

        // User Management — Edit/Delete
        document.querySelectorAll('[data-user-action]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const action = btn.dataset.userAction;
                const userId = btn.dataset.userId;
                if (action === 'edit') {
                    self._openEditUserModal(userId);
                } else if (action === 'delete') {
                    await self._deleteUser(userId);
                } else if (action === 'changerole') {
                    self._openChangeRoleModal(userId);
                }
            });
        });

        // Module Config — Toggle
        document.querySelectorAll('[data-module-toggle]').forEach(toggle => {
            toggle.addEventListener('change', async () => {
                await self._toggleModule(toggle.dataset.moduleToggle, toggle.checked);
            });
        });

        // Notification Settings — Toggle
        document.querySelectorAll('[data-notif-toggle]').forEach(toggle => {
            toggle.addEventListener('change', async () => {
                await self._toggleNotificationType(toggle.dataset.notifToggle, toggle.checked);
            });
        });

        // Data Management — Export
        const btnExportAll = document.getElementById('btn-export-all');
        if (btnExportAll) {
            btnExportAll.addEventListener('click', async () => {
                await self._exportAllData();
            });
        }

        // Data Management — Import
        const btnImportData = document.getElementById('btn-import-data');
        const fileImport = document.getElementById('file-import-data');
        if (btnImportData && fileImport) {
            btnImportData.addEventListener('click', () => fileImport.click());
            fileImport.addEventListener('change', async (e) => {
                await self._importData(e);
            });
        }

        // Data Management — Clear Cache
        const btnClearCache = document.getElementById('btn-clear-cache');
        if (btnClearCache) {
            btnClearCache.addEventListener('click', async () => {
                await self._clearCache();
            });
        }
    },

    // ============================================================
    // LOAD SETTINGS
    // ============================================================

    /**
     * Muat semua pengaturan dari KV
     */
    async _loadAllSettings() {
        try {
            // App settings
            const appStored = await YWM.Data.get('ywm:settings:app');
            this._state.appSettings = appStored ? (typeof appStored === 'string' ? JSON.parse(appStored) : appStored) : this._getDefaultAppSettings();
        } catch (e) {
            this._state.appSettings = this._getDefaultAppSettings();
        }

        try {
            // Module config
            const modStored = await YWM.Data.get('ywm:settings:modules');
            this._state.moduleConfig = modStored ? (typeof modStored === 'string' ? JSON.parse(modStored) : modStored) : this._getDefaultModuleConfig();
        } catch (e) {
            this._state.moduleConfig = this._getDefaultModuleConfig();
        }

        try {
            // Notification settings
            const notifStored = await YWM.Data.get('ywm:settings:notifications');
            this._state.notifSettings = notifStored ? (typeof notifStored === 'string' ? JSON.parse(notifStored) : notifStored) : this._getDefaultNotifSettings();
        } catch (e) {
            this._state.notifSettings = this._getDefaultNotifSettings();
        }

        try {
            // Users
            const username = YWM.PuterInit?.user?.username || 'Guest';
            // Ambil role user saat ini
            const roleStored = await YWM.Data.get(`ywm:auth:role:${username}`);
            const currentUserRole = roleStored || 'viewer';

            // Daftar user default
            this._state.users = [
                { id: 'u1', username: username, role: currentUserRole, status: 'active', lastLogin: new Date().toISOString() },
                { id: 'u2', username: 'admin.ywm', role: 'admin', status: 'active', lastLogin: new Date(Date.now() - 86400000).toISOString() },
                { id: 'u3', username: 'supervisor.produksi', role: 'supervisor', status: 'active', lastLogin: new Date(Date.now() - 172800000).toISOString() },
                { id: 'u4', username: 'operator.shift1', role: 'operator', status: 'active', lastLogin: new Date(Date.now() - 259200000).toISOString() },
                { id: 'u5', username: 'teknisi.mesin', role: 'teknisi', status: 'inactive', lastLogin: new Date(Date.now() - 604800000).toISOString() }
            ];
        } catch (e) {
            this._state.users = [];
        }
    },

    /**
     * Default app settings
     */
    _getDefaultAppSettings() {
        return {
            companyName: 'PT Yoga Wibawa Mandiri',
            companyAddress: 'Jl. Raya Indarung, Lubuk Kilangan, Padang, Sumatera Barat',
            companyPhone: '+62 751 461 225',
            companyEmail: 'info@yogawibawamandiri.co.id',
            companyLogo: '',
            timezone: 'Asia/Jakarta',
            dateFormat: 'DD/MM/YYYY',
            currency: 'IDR',
            fiscalYearStart: '01'
        };
    },

    /**
     * Default module config (semua aktif)
     */
    _getDefaultModuleConfig() {
        const config = {};
        this._availableModules.forEach(m => {
            config[m.id] = true;
        });
        return config;
    },

    /**
     * Default notification settings (semua aktif)
     */
    _getDefaultNotifSettings() {
        const settings = {};
        this._notificationTypes.forEach(n => {
            settings[n.id] = true;
        });
        return settings;
    },

    // ============================================================
    // GENERAL SETTINGS
    // ============================================================

    _renderGeneralSettings() {
        const s = this._state.appSettings;

        return `
            <div class="glass" style="padding:24px;">
                <h3 style="font-size:1.05rem;margin-bottom:20px;">Informasi Perusahaan</h3>
                <form id="form-general-settings" novalidate>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                        <div style="grid-column:1/-1;">
                            <label class="label-glass" for="inp-company-name">Nama Perusahaan *</label>
                            <input type="text" id="inp-company-name" class="input-glass" value="${s.companyName || ''}" required>
                        </div>
                        <div style="grid-column:1/-1;">
                            <label class="label-glass" for="inp-company-address">Alamat</label>
                            <textarea id="inp-company-address" class="textarea-glass" rows="2">${s.companyAddress || ''}</textarea>
                        </div>
                        <div>
                            <label class="label-glass" for="inp-company-phone">Telepon</label>
                            <input type="tel" id="inp-company-phone" class="input-glass" value="${s.companyPhone || ''}">
                        </div>
                        <div>
                            <label class="label-glass" for="inp-company-email">Email</label>
                            <input type="email" id="inp-company-email" class="input-glass" value="${s.companyEmail || ''}">
                        </div>
                        <div>
                            <label class="label-glass" for="sel-timezone">Zona Waktu</label>
                            <select id="sel-timezone" class="select-glass">
                                <option value="Asia/Jakarta" ${s.timezone === 'Asia/Jakarta' ? 'selected' : ''}>WIB (Asia/Jakarta)</option>
                                <option value="Asia/Makassar" ${s.timezone === 'Asia/Makassar' ? 'selected' : ''}>WITA (Asia/Makassar)</option>
                                <option value="Asia/Jayapura" ${s.timezone === 'Asia/Jayapura' ? 'selected' : ''}>WIT (Asia/Jayapura)</option>
                            </select>
                        </div>
                        <div>
                            <label class="label-glass" for="sel-date-format">Format Tanggal</label>
                            <select id="sel-date-format" class="select-glass">
                                <option value="DD/MM/YYYY" ${s.dateFormat === 'DD/MM/YYYY' ? 'selected' : ''}>DD/MM/YYYY</option>
                                <option value="YYYY-MM-DD" ${s.dateFormat === 'YYYY-MM-DD' ? 'selected' : ''}>YYYY-MM-DD</option>
                                <option value="MM/DD/YYYY" ${s.dateFormat === 'MM/DD/YYYY' ? 'selected' : ''}>MM/DD/YYYY</option>
                            </select>
                        </div>
                        <div>
                            <label class="label-glass" for="sel-currency">Mata Uang</label>
                            <select id="sel-currency" class="select-glass">
                                <option value="IDR" ${s.currency === 'IDR' ? 'selected' : ''}>IDR - Rupiah Indonesia</option>
                                <option value="USD" ${s.currency === 'USD' ? 'selected' : ''}>USD - Dolar AS</option>
                            </select>
                        </div>
                        <div>
                            <label class="label-glass" for="sel-fiscal-start">Awal Tahun Fiskal</label>
                            <select id="sel-fiscal-start" class="select-glass">
                                ${Array.from({length:12}, (_, i) => {
                                    const val = String(i+1).padStart(2, '0');
                                    const label = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'][i];
                                    return `<option value="${val}" ${s.fiscalYearStart === val ? 'selected' : ''}>${label}</option>`;
                                }).join('')}
                            </select>
                        </div>
                    </div>
                    <div style="margin-top:20px;display:flex;justify-content:flex-end;">
                        <button type="submit" class="btn btn-accent">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                            Simpan Pengaturan
                        </button>
                    </div>
                </form>
            </div>
        `;
    },

    /**
     * Simpan pengaturan umum
     */
    async _saveGeneralSettings() {
        try {
            const companyName = document.getElementById('inp-company-name')?.value?.trim();
            const companyAddress = document.getElementById('inp-company-address')?.value?.trim();
            const companyPhone = document.getElementById('inp-company-phone')?.value?.trim();
            const companyEmail = document.getElementById('inp-company-email')?.value?.trim();
            const timezone = document.getElementById('sel-timezone')?.value;
            const dateFormat = document.getElementById('sel-date-format')?.value;
            const currency = document.getElementById('sel-currency')?.value;
            const fiscalYearStart = document.getElementById('sel-fiscal-start')?.value;

            // Validasi field wajib
            if (!companyName) {
                if (YWM.UI && YWM.UI.showToast) YWM.UI.showToast('Nama perusahaan wajib diisi', 'error');
                return;
            }

            // Validasi email jika diisi
            if (companyEmail && typeof validateEmail === 'function') {
                const emailResult = validateEmail(companyEmail);
                if (!emailResult.valid) {
                    if (YWM.UI && YWM.UI.showToast) YWM.UI.showToast(emailResult.error, 'error');
                    return;
                }
            }

            const settings = {
                companyName,
                companyAddress,
                companyPhone,
                companyEmail,
                timezone,
                dateFormat,
                currency,
                fiscalYearStart
            };

            await YWM.Data.setWithTimestamp('ywm:settings:app', JSON.stringify(settings));
            this._state.appSettings = settings;

            // Audit log
            if (YWM.Data && YWM.Data.addAuditLog) {
                await YWM.Data.addAuditLog('settings', 'app', 'UPDATE', null, settings);
            }

            if (YWM.UI && YWM.UI.showToast) {
                YWM.UI.showToast('Pengaturan umum berhasil disimpan', 'success');
            }
        } catch (e) {
            console.error('[Settings] Gagal simpan pengaturan umum:', e);
            if (YWM.UI && YWM.UI.showToast) {
                YWM.UI.showToast('Gagal menyimpan pengaturan: ' + e.message, 'error');
            }
        }
    },

    // ============================================================
    // USER MANAGEMENT
    // ============================================================

    _renderUserManagement() {
        const users = this._state.users;

        const rows = users.map(u => {
            const role = this._roles.find(r => r.id === u.role);
            const roleLabel = role ? role.label : u.role;
            const roleColor = role ? role.color : 'var(--text-muted)';
            const statusBadge = u.status === 'active'
                ? '<span class="badge badge-success">Aktif</span>'
                : '<span class="badge badge-warning">Nonaktif</span>';
            const lastLogin = u.lastLogin
                ? (typeof formatTanggal === 'function' ? formatTanggal(u.lastLogin, 'relative') : new Date(u.lastLogin).toLocaleDateString())
                : '-';

            return `
                <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
                    <td style="padding:12px 16px;">
                        <div style="display:flex;align-items:center;gap:10px;">
                            <div style="width:32px;height:32px;border-radius:50%;background:rgba(0,212,255,0.15);display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:600;color:var(--accent);">
                                ${(u.username || '?').charAt(0).toUpperCase()}
                            </div>
                            <span style="font-weight:500;font-size:0.85rem;">${u.username}</span>
                        </div>
                    </td>
                    <td style="padding:12px 16px;">
                        <span style="color:${roleColor};font-size:0.8rem;font-weight:600;">${roleLabel}</span>
                    </td>
                    <td style="padding:12px 16px;">${statusBadge}</td>
                    <td style="padding:12px 16px;">
                        <span class="text-muted" style="font-size:0.8rem;">${lastLogin}</span>
                    </td>
                    <td style="padding:12px 16px;">
                        <div style="display:flex;gap:4px;">
                            <button class="btn btn-sm" data-user-action="changerole" data-user-id="${u.id}" title="Ubah Role">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                            </button>
                            <button class="btn btn-sm" data-user-action="edit" data-user-id="${u.id}" title="Edit">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button class="btn btn-sm btn-danger" data-user-action="delete" data-user-id="${u.id}" title="Hapus">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        return `
            <div class="glass" style="padding:24px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                    <h3 style="font-size:1.05rem;">Manajemen Pengguna</h3>
                    <button class="btn btn-sm btn-accent" id="btn-add-user">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Tambah User
                    </button>
                </div>
                <div style="overflow-x:auto;">
                    <table style="width:100%;border-collapse:collapse;">
                        <thead>
                            <tr style="border-bottom:1px solid rgba(255,255,255,0.1);">
                                <th style="padding:10px 16px;text-align:left;font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Username</th>
                                <th style="padding:10px 16px;text-align:left;font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Role</th>
                                <th style="padding:10px 16px;text-align:left;font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Status</th>
                                <th style="padding:10px 16px;text-align:left;font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Login Terakhir</th>
                                <th style="padding:10px 16px;text-align:left;font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows}
                        </tbody>
                    </table>
                </div>

                <!-- Role Legend -->
                <div style="margin-top:20px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08);">
                    <p class="text-muted" style="font-size:0.75rem;margin-bottom:8px;">Hierarki Role:</p>
                    <div style="display:flex;flex-wrap:wrap;gap:8px;">
                        ${this._roles.map(r => `
                            <span class="badge" style="border:1px solid ${r.color};color:${r.color};background:transparent;">${r.label}</span>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Buka modal tambah user
     */
    _openAddUserModal() {
        const self = this;
        const roleOptions = this._roles.map(r => `<option value="${r.id}">${r.label}</option>`).join('');

        const content = `
            <form id="form-add-user" novalidate>
                <div style="margin-bottom:16px;">
                    <label class="label-glass" for="inp-new-username">Username *</label>
                    <input type="text" id="inp-new-username" class="input-glass" placeholder="contoh: operator.shift2" required>
                </div>
                <div style="margin-bottom:16px;">
                    <label class="label-glass" for="sel-new-role">Role *</label>
                    <select id="sel-new-role" class="select-glass" required>
                        <option value="">— Pilih Role —</option>
                        ${roleOptions}
                    </select>
                </div>
                <div style="margin-bottom:16px;">
                    <label class="label-glass" for="sel-new-status">Status</label>
                    <select id="sel-new-status" class="select-glass">
                        <option value="active">Aktif</option>
                        <option value="inactive">Nonaktif</option>
                    </select>
                </div>
            </form>
        `;

        if (YWM.UI && YWM.UI.openModal) {
            YWM.UI.openModal('Tambah Pengguna', content, [
                { label: 'Batal', class: 'btn', action: () => YWM.UI.closeModal() },
                {
                    label: 'Simpan',
                    class: 'btn btn-accent',
                    action: async () => {
                        const username = document.getElementById('inp-new-username')?.value?.trim();
                        const role = document.getElementById('sel-new-role')?.value;
                        const status = document.getElementById('sel-new-status')?.value || 'active';

                        // Validasi
                        if (!username) {
                            if (YWM.UI && YWM.UI.showToast) YWM.UI.showToast('Username wajib diisi', 'error');
                            return;
                        }
                        if (!role) {
                            if (YWM.UI && YWM.UI.showToast) YWM.UI.showToast('Role wajib dipilih', 'error');
                            return;
                        }

                        // Cek duplikasi
                        if (self._state.users.some(u => u.username === username)) {
                            if (YWM.UI && YWM.UI.showToast) YWM.UI.showToast('Username sudah digunakan', 'error');
                            return;
                        }

                        const newUser = {
                            id: 'u_' + self._generateId(),
                            username,
                            role,
                            status,
                            lastLogin: null
                        };

                        self._state.users.push(newUser);

                        // Simpan role ke KV
                        try {
                            await YWM.Data.set(`ywm:auth:role:${username}`, role);
                        } catch (e) { /* abaikan */ }

                        // Audit log
                        if (YWM.Data && YWM.Data.addAuditLog) {
                            try {
                                await YWM.Data.addAuditLog('settings', newUser.id, 'CREATE', null, newUser);
                            } catch (e) { /* abaikan */ }
                        }

                        YWM.UI.closeModal();
                        if (YWM.UI && YWM.UI.showToast) YWM.UI.showToast(`User "${username}" berhasil ditambahkan`, 'success');

                        // Refresh
                        if (YWM.App && YWM.App.renderModule) {
                            await YWM.App.renderModule('settings');
                        }
                    }
                }
            ]);
        }
    },

    /**
     * Buka modal ubah role
     * @param {string} userId - ID user
     */
    _openChangeRoleModal(userId) {
        const self = this;
        const user = this._state.users.find(u => u.id === userId);
        if (!user) return;

        const roleOptions = this._roles.map(r =>
            `<option value="${r.id}" ${r.id === user.role ? 'selected' : ''}>${r.label}</option>`
        ).join('');

        const content = `
            <p style="margin-bottom:16px;">Ubah role untuk user <strong>${user.username}</strong>:</p>
            <div>
                <label class="label-glass" for="sel-change-role">Role Baru *</label>
                <select id="sel-change-role" class="select-glass">
                    ${roleOptions}
                </select>
            </div>
        `;

        if (YWM.UI && YWM.UI.openModal) {
            YWM.UI.openModal('Ubah Role Pengguna', content, [
                { label: 'Batal', class: 'btn', action: () => YWM.UI.closeModal() },
                {
                    label: 'Simpan',
                    class: 'btn btn-accent',
                    action: async () => {
                        const newRole = document.getElementById('sel-change-role')?.value;
                        if (!newRole) return;

                        const oldRole = user.role;
                        user.role = newRole;

                        // Simpan role ke KV
                        try {
                            await YWM.Data.set(`ywm:auth:role:${user.username}`, newRole);
                        } catch (e) { /* abaikan */ }

                        // Audit log
                        if (YWM.Data && YWM.Data.addAuditLog) {
                            try {
                                await YWM.Data.addAuditLog('settings', userId, 'UPDATE', { role: oldRole }, { role: newRole });
                            } catch (e) { /* abaikan */ }
                        }

                        YWM.UI.closeModal();
                        if (YWM.UI && YWM.UI.showToast) YWM.UI.showToast(`Role ${user.username} diubah ke ${self._roles.find(r => r.id === newRole)?.label || newRole}`, 'success');

                        if (YWM.App && YWM.App.renderModule) {
                            await YWM.App.renderModule('settings');
                        }
                    }
                }
            ]);
        }
    },

    /**
     * Buka modal edit user
     * @param {string} userId - ID user
     */
    _openEditUserModal(userId) {
        const self = this;
        const user = this._state.users.find(u => u.id === userId);
        if (!user) return;

        const content = `
            <form id="form-edit-user" novalidate>
                <div style="margin-bottom:16px;">
                    <label class="label-glass" for="inp-edit-username">Username</label>
                    <input type="text" id="inp-edit-username" class="input-glass" value="${user.username}" disabled style="opacity:0.6;">
                    <p class="text-muted" style="font-size:0.7rem;margin-top:4px;">Username tidak dapat diubah</p>
                </div>
                <div style="margin-bottom:16px;">
                    <label class="label-glass" for="sel-edit-status">Status</label>
                    <select id="sel-edit-status" class="select-glass">
                        <option value="active" ${user.status === 'active' ? 'selected' : ''}>Aktif</option>
                        <option value="inactive" ${user.status === 'inactive' ? 'selected' : ''}>Nonaktif</option>
                    </select>
                </div>
            </form>
        `;

        if (YWM.UI && YWM.UI.openModal) {
            YWM.UI.openModal('Edit Pengguna', content, [
                { label: 'Batal', class: 'btn', action: () => YWM.UI.closeModal() },
                {
                    label: 'Simpan',
                    class: 'btn btn-accent',
                    action: async () => {
                        const newStatus = document.getElementById('sel-edit-status')?.value;
                        user.status = newStatus;

                        if (YWM.Data && YWM.Data.addAuditLog) {
                            try {
                                await YWM.Data.addAuditLog('settings', userId, 'UPDATE', null, { status: newStatus });
                            } catch (e) { /* abaikan */ }
                        }

                        YWM.UI.closeModal();
                        if (YWM.UI && YWM.UI.showToast) YWM.UI.showToast(`Status ${user.username} diperbarui`, 'success');

                        if (YWM.App && YWM.App.renderModule) {
                            await YWM.App.renderModule('settings');
                        }
                    }
                }
            ]);
        }
    },

    /**
     * Hapus user
     * @param {string} userId - ID user
     */
    async _deleteUser(userId) {
        const user = this._state.users.find(u => u.id === userId);
        if (!user) return;

        // Konfirmasi
        if (!confirm(`Yakin ingin menghapus user "${user.username}"?`)) return;

        this._state.users = this._state.users.filter(u => u.id !== userId);

        // Hapus role dari KV
        try {
            if (typeof puter !== 'undefined' && puter.kv) {
                await puter.kv.del(`ywm:auth:role:${user.username}`);
            }
        } catch (e) { /* abaikan */ }

        // Audit log
        if (YWM.Data && YWM.Data.addAuditLog) {
            try {
                await YWM.Data.addAuditLog('settings', userId, 'DELETE', user, null);
            } catch (e) { /* abaikan */ }
        }

        if (YWM.UI && YWM.UI.showToast) YWM.UI.showToast(`User "${user.username}" dihapus`, 'success');

        if (YWM.App && YWM.App.renderModule) {
            await YWM.App.renderModule('settings');
        }
    },

    // ============================================================
    // MODULE CONFIGURATION
    // ============================================================

    _renderModuleConfig() {
        const config = this._state.moduleConfig;

        const items = this._availableModules.map(m => {
            const enabled = config[m.id] !== false;
            const isRequired = m.required;

            return `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
                    <div style="display:flex;align-items:center;gap:12px;">
                        <span style="font-size:1.2rem;">${m.icon}</span>
                        <div>
                            <span style="font-size:0.9rem;font-weight:500;">${m.label}</span>
                            ${isRequired ? '<span class="badge badge-info" style="margin-left:6px;font-size:0.55rem;">WAJIB</span>' : ''}
                        </div>
                    </div>
                    <label style="position:relative;display:inline-block;width:44px;height:24px;">
                        <input type="checkbox" data-module-toggle="${m.id}" ${enabled ? 'checked' : ''} ${isRequired ? 'disabled' : ''} style="opacity:0;width:0;height:0;">
                        <span style="position:absolute;cursor:${isRequired ? 'not-allowed' : 'pointer'};inset:0;background:${enabled ? 'var(--accent)' : 'rgba(255,255,255,0.15)'};transition:0.3s;border-radius:12px;${isRequired ? 'opacity:0.5;' : ''}"></span>
                        <span style="position:absolute;height:18px;width:18px;left:${enabled ? '23px' : '3px'};bottom:3px;background:white;transition:0.3s;border-radius:50%;"></span>
                    </label>
                </div>
            `;
        }).join('');

        return `
            <div class="glass" style="padding:24px;">
                <h3 style="font-size:1.05rem;margin-bottom:20px;">Konfigurasi Modul</h3>
                <p class="text-muted" style="font-size:0.85rem;margin-bottom:16px;">Aktifkan atau nonaktifkan modul sesuai kebutuhan operasional.</p>
                ${items}
            </div>
        `;
    },

    /**
     * Toggle modul on/off
     * @param {string} moduleId - ID modul
     * @param {boolean} enabled - Status aktif
     */
    async _toggleModule(moduleId, enabled) {
        // Jangan izinkan toggle modul wajib
        const mod = this._availableModules.find(m => m.id === moduleId);
        if (mod && mod.required) {
            if (YWM.UI && YWM.UI.showToast) YWM.UI.showToast('Modul wajib tidak dapat dinonaktifkan', 'warning');
            return;
        }

        this._state.moduleConfig[moduleId] = enabled;

        try {
            await YWM.Data.set('ywm:settings:modules', JSON.stringify(this._state.moduleConfig));

            // Audit log
            if (YWM.Data && YWM.Data.addAuditLog) {
                await YWM.Data.addAuditLog('settings', moduleId, 'UPDATE', { enabled: !enabled }, { enabled });
            }
        } catch (e) {
            console.warn('[Settings] Gagal simpan konfigurasi modul:', e.message);
        }

        if (YWM.UI && YWM.UI.showToast) {
            const modLabel = this._availableModules.find(m => m.id === moduleId)?.label || moduleId;
            YWM.UI.showToast(`Modul ${modLabel} ${enabled ? 'diaktifkan' : 'dinonaktifkan'}`, enabled ? 'success' : 'info');
        }
    },

    // ============================================================
    // NOTIFICATION SETTINGS
    // ============================================================

    _renderNotificationSettings() {
        const settings = this._state.notifSettings;

        const items = this._notificationTypes.map(n => {
            const enabled = settings[n.id] !== false;

            return `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
                    <div style="display:flex;align-items:center;gap:12px;">
                        <span style="font-size:1.2rem;">${n.icon}</span>
                        <span style="font-size:0.9rem;font-weight:500;">${n.label}</span>
                    </div>
                    <label style="position:relative;display:inline-block;width:44px;height:24px;">
                        <input type="checkbox" data-notif-toggle="${n.id}" ${enabled ? 'checked' : ''} style="opacity:0;width:0;height:0;">
                        <span style="position:absolute;cursor:pointer;inset:0;background:${enabled ? 'var(--accent)' : 'rgba(255,255,255,0.15)'};transition:0.3s;border-radius:12px;"></span>
                        <span style="position:absolute;height:18px;width:18px;left:${enabled ? '23px' : '3px'};bottom:3px;background:white;transition:0.3s;border-radius:50%;"></span>
                    </label>
                </div>
            `;
        }).join('');

        return `
            <div class="glass" style="padding:24px;">
                <h3 style="font-size:1.05rem;margin-bottom:20px;">Pengaturan Notifikasi</h3>
                <p class="text-muted" style="font-size:0.85rem;margin-bottom:16px;">Atur tipe notifikasi yang ingin Anda terima.</p>
                ${items}
            </div>
        `;
    },

    /**
     * Toggle tipe notifikasi
     * @param {string} typeId - ID tipe notifikasi
     * @param {boolean} enabled - Status aktif
     */
    async _toggleNotificationType(typeId, enabled) {
        this._state.notifSettings[typeId] = enabled;

        try {
            await YWM.Data.set('ywm:settings:notifications', JSON.stringify(this._state.notifSettings));

            if (YWM.Data && YWM.Data.addAuditLog) {
                await YWM.Data.addAuditLog('settings', `notif_${typeId}`, 'UPDATE', { enabled: !enabled }, { enabled });
            }
        } catch (e) {
            console.warn('[Settings] Gagal simpan pengaturan notifikasi:', e.message);
        }

        if (YWM.UI && YWM.UI.showToast) {
            const label = this._notificationTypes.find(n => n.id === typeId)?.label || typeId;
            YWM.UI.showToast(`Notifikasi ${label} ${enabled ? 'diaktifkan' : 'dinonaktifkan'}`, enabled ? 'success' : 'info');
        }
    },

    // ============================================================
    // DATA MANAGEMENT
    // ============================================================

    _renderDataManagement() {
        return `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                <!-- Export / Backup -->
                <div class="glass" style="padding:24px;">
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--status-success)" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        <h3 style="font-size:1rem;">Export & Backup</h3>
                    </div>
                    <p class="text-muted" style="font-size:0.85rem;margin-bottom:16px;">Export seluruh data dashboard sebagai file backup JSON.</p>
                    <button class="btn btn-accent" id="btn-export-all" style="width:100%;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Export Semua Data
                    </button>
                </div>

                <!-- Import -->
                <div class="glass" style="padding:24px;">
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--status-warning)" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        <h3 style="font-size:1rem;">Import Data</h3>
                    </div>
                    <p class="text-muted" style="font-size:0.85rem;margin-bottom:16px;">Import data dari file backup JSON yang sebelumnya di-export.</p>
                    <input type="file" id="file-import-data" accept=".json" style="display:none;">
                    <button class="btn" id="btn-import-data" style="width:100%;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        Import Data dari File
                    </button>
                </div>

                <!-- Clear Cache -->
                <div class="glass" style="padding:24px;grid-column:1/-1;">
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--status-error)" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                        <h3 style="font-size:1rem;">Bersihkan Cache</h3>
                    </div>
                    <p class="text-muted" style="font-size:0.85rem;margin-bottom:16px;">Hapus data cache lokal yang tersimpan. Data di Puter KV tetap aman.</p>
                    <button class="btn btn-danger" id="btn-clear-cache">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                        Bersihkan Cache
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Export semua data sebagai backup
     */
    async _exportAllData() {
        try {
            if (YWM.UI && YWM.UI.showToast) YWM.UI.showToast('Mengumpulkan data untuk export...', 'info');

            const backup = {
                version: '3.0.0',
                exportedAt: new Date().toISOString(),
                exportedBy: YWM.PuterInit?.user?.username || 'Guest',
                appSettings: this._state.appSettings,
                moduleConfig: this._state.moduleConfig,
                notifSettings: this._state.notifSettings,
                users: this._state.users
            };

            // Coba kumpulkan data dari KV (best effort)
            const kvKeys = [
                'ywm:report:index:all',
                'ywm:production:entries',
                'ywm:maintenance:workorders',
                'ywm:spareparts:items',
                'ywm:finance:transactions',
                'ywm:safety:incidents',
                'ywm:quality:records'
            ];

            const kvData = {};
            for (const key of kvKeys) {
                try {
                    const val = await YWM.Data.get(key);
                    if (val) kvData[key] = val;
                } catch (e) { /* abaikan */ }
            }
            backup.kvData = kvData;

            const content = JSON.stringify(backup, null, 2);
            const filename = `ywm_backup_${new Date().toISOString().split('T')[0]}.json`;

            if (typeof downloadFile === 'function') {
                downloadFile(content, filename, 'application/json');
            } else {
                const blob = new Blob([content], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }

            // Audit log
            if (YWM.Data && YWM.Data.addAuditLog) {
                await YWM.Data.addAuditLog('settings', 'backup', 'EXPORT', null, { filename, size: content.length });
            }

            if (YWM.UI && YWM.UI.showToast) {
                YWM.UI.showToast('Data berhasil di-export!', 'success');
            }
        } catch (e) {
            console.error('[Settings] Gagal export data:', e);
            if (YWM.UI && YWM.UI.showToast) {
                YWM.UI.showToast('Gagal export data: ' + e.message, 'error');
            }
        }
    },

    /**
     * Import data dari file backup
     * @param {Event} e - File input change event
     */
    async _importData(e) {
        const file = e.target?.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            // Validasi format
            if (!data.version) {
                throw new Error('Format file backup tidak valid');
            }

            // Konfirmasi import
            if (!confirm(`Import data dari "${file.name}"?\n\nVersi: ${data.version}\nExport pada: ${data.exportedAt}\nOleh: ${data.exportedBy || '-'}\n\nPERHATIAN: Data yang ada mungkin akan ditimpa.`)) {
                return;
            }

            // Restore settings
            if (data.appSettings) {
                await YWM.Data.set('ywm:settings:app', JSON.stringify(data.appSettings));
                this._state.appSettings = data.appSettings;
            }
            if (data.moduleConfig) {
                await YWM.Data.set('ywm:settings:modules', JSON.stringify(data.moduleConfig));
                this._state.moduleConfig = data.moduleConfig;
            }
            if (data.notifSettings) {
                await YWM.Data.set('ywm:settings:notifications', JSON.stringify(data.notifSettings));
                this._state.notifSettings = data.notifSettings;
            }

            // Restore KV data
            if (data.kvData) {
                for (const [key, value] of Object.entries(data.kvData)) {
                    try {
                        await YWM.Data.set(key, typeof value === 'string' ? value : JSON.stringify(value));
                    } catch (e) { /* abaikan per key */ }
                }
            }

            // Audit log
            if (YWM.Data && YWM.Data.addAuditLog) {
                await YWM.Data.addAuditLog('settings', 'backup', 'IMPORT', null, { filename: file.name });
            }

            if (YWM.UI && YWM.UI.showToast) {
                YWM.UI.showToast('Data berhasil di-import! Halaman akan di-refresh...', 'success');
            }

            // Refresh setelah delay
            setTimeout(() => location.reload(), 2000);

        } catch (e) {
            console.error('[Settings] Gagal import data:', e);
            if (YWM.UI && YWM.UI.showToast) {
                YWM.UI.showToast('Gagal import data: ' + e.message, 'error');
            }
        }
    },

    /**
     * Bersihkan cache lokal
     */
    async _clearCache() {
        if (!confirm('Bersihkan semua data cache lokal?\n\nData di Puter KV tidak akan terpengaruh.')) return;

        try {
            // Hapus localStorage terkait YWM
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('ywm_')) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(k => localStorage.removeItem(k));

            // Audit log
            if (YWM.Data && YWM.Data.addAuditLog) {
                await YWM.Data.addAuditLog('settings', 'cache', 'DELETE', null, { keysRemoved: keysToRemove.length });
            }

            if (YWM.UI && YWM.UI.showToast) {
                YWM.UI.showToast(`Cache dibersihkan (${keysToRemove.length} item dihapus)`, 'success');
            }
        } catch (e) {
            console.error('[Settings] Gagal bersihkan cache:', e);
            if (YWM.UI && YWM.UI.showToast) {
                YWM.UI.showToast('Gagal bersihkan cache: ' + e.message, 'error');
            }
        }
    },

    // ============================================================
    // ABOUT
    // ============================================================

    _renderAbout() {
        const puterReady = typeof puter !== 'undefined';
        const isAuth = YWM.PuterInit?.isAuthenticated?.() || false;
        const user = YWM.PuterInit?.user || {};
        const isOnline = YWM.PuterInit?.online ?? navigator.onLine;

        return `
            <div class="glass" style="padding:24px;">
                <!-- App Info -->
                <div style="text-align:center;margin-bottom:28px;">
                    <div style="width:64px;height:64px;margin:0 auto 12px;border-radius:16px;background:linear-gradient(135deg,var(--accent),#0099cc);display:flex;align-items:center;justify-content:center;">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                        </svg>
                    </div>
                    <h3 style="font-size:1.2rem;margin-bottom:4px;">YWM Dashboard</h3>
                    <p class="text-muted" style="font-size:0.85rem;">PT Yoga Wibawa Mandiri — Technical Dashboard</p>
                    <p style="font-size:0.8rem;color:var(--accent);margin-top:4px;">Version 3.0.0</p>
                </div>

                <!-- Status Grid -->
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px;">
                    <div style="padding:14px;background:rgba(0,212,255,0.05);border-radius:var(--radius-sm);text-align:center;">
                        <p class="text-muted" style="font-size:0.7rem;margin-bottom:6px;">Puter.js Status</p>
                        <p style="font-size:0.9rem;font-weight:600;color:${puterReady ? 'var(--status-success)' : 'var(--status-error)'};">
                            ${puterReady ? '✓ Terhubung' : '✗ Tidak Tersedia'}
                        </p>
                    </div>
                    <div style="padding:14px;background:rgba(0,212,255,0.05);border-radius:var(--radius-sm);text-align:center;">
                        <p class="text-muted" style="font-size:0.7rem;margin-bottom:6px;">Autentikasi</p>
                        <p style="font-size:0.9rem;font-weight:600;color:${isAuth ? 'var(--status-success)' : 'var(--status-warning)'};">
                            ${isAuth ? '✓ Terautentikasi' : '✗ Guest'}
                        </p>
                    </div>
                    <div style="padding:14px;background:rgba(0,212,255,0.05);border-radius:var(--radius-sm);text-align:center;">
                        <p class="text-muted" style="font-size:0.7rem;margin-bottom:6px;">Koneksi</p>
                        <p style="font-size:0.9rem;font-weight:600;color:${isOnline ? 'var(--status-success)' : 'var(--status-error)'};">
                            ${isOnline ? '✓ Online' : '✗ Offline'}
                        </p>
                    </div>
                    <div style="padding:14px;background:rgba(0,212,255,0.05);border-radius:var(--radius-sm);text-align:center;">
                        <p class="text-muted" style="font-size:0.7rem;margin-bottom:6px;">Pengguna</p>
                        <p style="font-size:0.9rem;font-weight:600;">${user.username || 'Guest'}</p>
                    </div>
                </div>

                <!-- Connection Details -->
                <div style="margin-bottom:24px;">
                    <h4 style="font-size:0.9rem;margin-bottom:12px;">Detail Koneksi</h4>
                    <table style="width:100%;border-collapse:collapse;">
                        <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
                            <td style="padding:8px 0;color:var(--text-muted);font-size:0.82rem;">Puter.js SDK</td>
                            <td style="padding:8px 0;font-size:0.82rem;text-align:right;">v2</td>
                        </tr>
                        <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
                            <td style="padding:8px 0;color:var(--text-muted);font-size:0.82rem;">AI Model Default</td>
                            <td style="padding:8px 0;font-size:0.82rem;text-align:right;">GPT-4o-mini</td>
                        </tr>
                        <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
                            <td style="padding:8px 0;color:var(--text-muted);font-size:0.82rem;">Cloud Storage</td>
                            <td style="padding:8px 0;font-size:0.82rem;text-align:right;">Puter FS</td>
                        </tr>
                        <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
                            <td style="padding:8px 0;color:var(--text-muted);font-size:0.82rem;">Database</td>
                            <td style="padding:8px 0;font-size:0.82rem;text-align:right;">Puter KV Store</td>
                        </tr>
                        <tr>
                            <td style="padding:8px 0;color:var(--text-muted);font-size:0.82rem;">Modul Aktif</td>
                            <td style="padding:8px 0;font-size:0.82rem;text-align:right;">${this._availableModules.filter(m => this._state.moduleConfig[m.id] !== false).length} / ${this._availableModules.length}</td>
                        </tr>
                    </table>
                </div>

                <!-- Footer -->
                <div style="text-align:center;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08);">
                    <p class="text-muted" style="font-size:0.75rem;">© 2026 PT Yoga Wibawa Mandiri</p>
                    <p class="text-muted" style="font-size:0.65rem;margin-top:4px;">Dashboard Teknis v3.0 — Powered by Puter.js</p>
                </div>
            </div>
        `;
    },

    /**
     * Generate ID unik
     * @returns {string} ID
     */
    _generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
    }
};

console.log('[YWM Modules] Settings module dimuat ✓');
