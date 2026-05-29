/**
 * ============================================================
 * NOTIFIKASI — Modul Notifikasi YWM Dashboard
 * PT Yoga Wibawa Mandiri — Cement Bagging Company
 * ============================================================
 *
 * Fitur:
 * 1. Header — Judul "Notifikasi" + Mark All Read + Filter
 * 2. Notification Stats — Jumlah belum dibaca per kategori
 * 3. Notification List — Dikelompokkan per tanggal
 *    - Ikon, judul, pesan, timestamp, status baca, badge kategori
 *    - Klik untuk tandai dibaca dan navigasi ke modul terkait
 * 4. Notification Preferences — Toggle per kategori
 * 5. Auto-Generated Notifications — Deteksi otomatis:
 *    - Spare part di bawah reorder point
 *    - Work order overdue
 *    - Deviasi target produksi > 10%
 *    - Insiden HSE dilaporkan
 *    - Cuti menunggu persetujuan
 * 6. TTS — puter.ai.txt2speech() untuk baca notifikasi
 *
 * KV: ywm:notification:user:{username}, ywm:notification:preferences:{username}
 *
 * @version 1.0.0
 */

window.YWM = window.YWM || {};
window.YWM.Modules = window.YWM.Modules || {};

YWM.Modules.notifications = {
    title: 'Notifikasi',

    /** Kategori notifikasi */
    _categories: [
        { id: 'produksi', label: 'Produksi', color: 'var(--accent)', icon: '📊' },
        { id: 'maintenance', label: 'Maintenance', color: 'var(--status-warning)', icon: '🔧' },
        { id: 'stok', label: 'Stok', color: 'var(--status-info)', icon: '📦' },
        { id: 'hse', label: 'HSE', color: 'var(--status-error)', icon: '⚠️' },
        { id: 'keuangan', label: 'Keuangan', color: 'var(--status-warning)', icon: '💰' },
        { id: 'hr', label: 'HR', color: 'var(--status-success)', icon: '🧑‍💼' }
    ],

    /** Peta kategori ke modul navigasi */
    _categoryToModule: {
        produksi: 'production',
        maintenance: 'maintenance',
        stok: 'spareparts',
        hse: 'safety',
        keuangan: 'finance',
        hr: 'hr'
    },

    /** State internal */
    _state: {
        notifications: [],
        filter: 'all',       // 'all' | kategori id
        preferences: null
    },

    /**
     * Render tampilan utama modul Notifikasi
     * @returns {Promise<string>} HTML string
     */
    async render() {
        // Muat notifikasi dari KV
        await this._loadNotifications();
        // Muat preferensi
        await this._loadPreferences();
        // Cek dan generate notifikasi otomatis
        await this._checkAutoNotifications();

        const stats = this._calculateStats();
        const statsHtml = this._renderStats(stats);
        const filterHtml = this._renderFilter();
        const listHtml = this._renderNotificationList();

        return `
            <div class="notifications-module animate-fade-in">
                <!-- Header -->
                <div class="module-header" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:12px;">
                    <div>
                        <h2 style="font-size:1.5rem;font-weight:700;margin-bottom:4px;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" style="vertical-align:middle;margin-right:8px;">
                                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
                            </svg>
                            Notifikasi
                            ${stats.totalUnread > 0 ? `<span class="badge badge-error" style="vertical-align:middle;font-size:0.7rem;">${stats.totalUnread}</span>` : ''}
                        </h2>
                        <p class="text-muted">Pusat notifikasi operasional PT Yoga Wibawa Mandiri</p>
                    </div>
                    <div style="display:flex;gap:8px;align-items:center;">
                        <button class="btn btn-sm" id="btn-notif-preferences" title="Pengaturan Notifikasi">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
                        </button>
                        <button class="btn btn-sm" id="btn-check-notifications" title="Cek Notifikasi Baru">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
                            Cek Baru
                        </button>
                        <button class="btn btn-sm btn-accent" id="btn-mark-all-read" title="Tandai Semua Dibaca">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                            Tandai Semua Dibaca
                        </button>
                    </div>
                </div>

                <!-- Stats -->
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin-bottom:24px;">
                    ${statsHtml}
                </div>

                <!-- Filter -->
                <div style="display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap;align-items:center;">
                    <span class="text-muted" style="font-size:0.8rem;margin-right:4px;">Filter:</span>
                    ${filterHtml}
                </div>

                <!-- Notification List -->
                <div id="notification-list-container">
                    ${listHtml}
                </div>
            </div>
        `;
    },

    /**
     * Hitung statistik notifikasi
     * @returns {Object} Statistik per kategori
     */
    _calculateStats() {
        const stats = { totalUnread: 0, perCategory: {} };

        this._categories.forEach(cat => {
            const unread = this._state.notifications.filter(
                n => n.category === cat.id && !n.read
            ).length;
            stats.perCategory[cat.id] = unread;
            stats.totalUnread += unread;
        });

        return stats;
    },

    /**
     * Render kartu statistik
     * @param {Object} stats - Statistik
     * @returns {string} HTML
     */
    _renderStats(stats) {
        return this._categories.map(cat => {
            const count = stats.perCategory[cat.id] || 0;
            return `
                <div class="glass" style="padding:14px 16px;display:flex;align-items:center;gap:12px;">
                    <span style="font-size:1.3rem;">${cat.icon}</span>
                    <div>
                        <p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:2px;">${cat.label}</p>
                        <p style="font-size:1.1rem;font-weight:700;${count > 0 ? `color:${cat.color}` : ''}">${count}</p>
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * Render tombol filter
     * @returns {string} HTML
     */
    _renderFilter() {
        const currentFilter = this._state.filter;
        let html = `<button class="btn btn-sm ${currentFilter === 'all' ? 'btn-accent' : ''}" data-notif-filter="all">Semua</button>`;
        this._categories.forEach(cat => {
            const isActive = currentFilter === cat.id;
            html += `<button class="btn btn-sm ${isActive ? 'btn-accent' : ''}" data-notif-filter="${cat.id}">${cat.icon} ${cat.label}</button>`;
        });
        return html;
    },

    /**
     * Render daftar notifikasi dikelompokkan per tanggal
     * @returns {string} HTML
     */
    _renderNotificationList() {
        let filtered = this._state.notifications;

        // Terapkan filter
        if (this._state.filter !== 'all') {
            filtered = filtered.filter(n => n.category === this._state.filter);
        }

        // Urutkan: belum dibaca dulu, lalu terbaru
        filtered.sort((a, b) => {
            if (a.read !== b.read) return a.read ? 1 : -1;
            return new Date(b.timestamp) - new Date(a.timestamp);
        });

        if (filtered.length === 0) {
            return `
                <div class="glass" style="padding:40px;text-align:center;">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" style="margin-bottom:12px;">
                        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
                    </svg>
                    <p class="text-muted">Tidak ada notifikasi</p>
                    <p class="text-muted" style="font-size:0.8rem;">Semua notifikasi sudah dibaca atau belum ada</p>
                </div>
            `;
        }

        // Kelompokkan per tanggal
        const grouped = {};
        filtered.forEach(n => {
            const dateKey = new Date(n.timestamp).toISOString().split('T')[0];
            if (!grouped[dateKey]) grouped[dateKey] = [];
            grouped[dateKey].push(n);
        });

        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        let html = '';
        const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

        for (const dateKey of sortedDates) {
            let dateLabel;
            if (dateKey === today) dateLabel = 'Hari Ini';
            else if (dateKey === yesterday) dateLabel = 'Kemarin';
            else dateLabel = typeof formatTanggal === 'function' ? formatTanggal(dateKey, 'short') : dateKey;

            html += `<div style="margin-bottom:16px;">`;
            html += `<p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">${dateLabel}</p>`;

            grouped[dateKey].forEach(n => {
                html += this._renderNotificationItem(n);
            });

            html += `</div>`;
        }

        return html;
    },

    /**
     * Render satu item notifikasi
     * @param {Object} notif - Objek notifikasi
     * @returns {string} HTML
     */
    _renderNotificationItem(notif) {
        const cat = this._categories.find(c => c.id === notif.category);
        const catLabel = cat ? cat.label : notif.category;
        const catColor = cat ? cat.color : 'var(--text-muted)';
        const catIcon = cat ? cat.icon : '🔔';
        const timeStr = typeof formatTanggal === 'function' ? formatTanggal(notif.timestamp, 'relative') : new Date(notif.timestamp).toLocaleTimeString();

        const unreadStyle = notif.read ? '' : 'border-left:3px solid var(--accent);background:rgba(0,212,255,0.03);';

        return `
            <div class="notification-item glass" data-notif-id="${notif.id}" data-notif-category="${notif.category}" style="padding:16px 18px;margin-bottom:8px;cursor:pointer;${unreadStyle}transition:background 0.2s;">
                <div style="display:flex;align-items:flex-start;gap:12px;">
                    <!-- Ikon -->
                    <div style="font-size:1.3rem;flex-shrink:0;margin-top:2px;">${catIcon}</div>

                    <!-- Konten -->
                    <div style="flex:1;min-width:0;">
                        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                            <span style="font-weight:${notif.read ? '500' : '700'};font-size:0.9rem;">${notif.title}</span>
                            <span class="badge badge-${this._getCategoryBadge(notif.category)}" style="font-size:0.6rem;">${catLabel}</span>
                            ${notif.priority === 'critical' ? '<span class="badge badge-error" style="font-size:0.6rem;">KRITIS</span>' : ''}
                        </div>
                        <p class="text-muted" style="font-size:0.82rem;margin-bottom:6px;line-height:1.5;">${notif.message}</p>
                        <div style="display:flex;align-items:center;gap:12px;">
                            <span class="text-muted" style="font-size:0.7rem;">${timeStr}</span>
                            ${!notif.read ? '<span style="width:6px;height:6px;border-radius:50%;background:var(--accent);display:inline-block;"></span>' : ''}
                        </div>
                    </div>

                    <!-- Aksi -->
                    <div style="display:flex;gap:4px;flex-shrink:0;">
                        <button class="btn-icon btn-sm" data-notif-tts="${notif.id}" title="Bacakan dengan TTS" style="width:28px;height:28px;">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/></svg>
                        </button>
                        <button class="btn-icon btn-sm" data-notif-dismiss="${notif.id}" title="Hapus" style="width:28px;height:28px;">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Dapatkan badge class berdasarkan kategori
     * @param {string} category - ID kategori
     * @returns {string} Badge class
     */
    _getCategoryBadge(category) {
        const badgeMap = {
            produksi: 'info',
            maintenance: 'warning',
            stok: 'info',
            hse: 'error',
            keuangan: 'warning',
            hr: 'success'
        };
        return badgeMap[category] || 'info';
    },

    /**
     * Inisialisasi event listener
     */
    async init() {
        const self = this;

        // Mark All Read
        const btnMarkAll = document.getElementById('btn-mark-all-read');
        if (btnMarkAll) {
            btnMarkAll.addEventListener('click', async () => {
                await self._markAllRead();
            });
        }

        // Cek notifikasi baru
        const btnCheck = document.getElementById('btn-check-notifications');
        if (btnCheck) {
            btnCheck.addEventListener('click', async () => {
                if (YWM.UI && YWM.UI.showToast) YWM.UI.showToast('Memeriksa notifikasi baru...', 'info');
                await self._checkAutoNotifications();
                self._refreshList();
            });
        }

        // Preferensi notifikasi
        const btnPrefs = document.getElementById('btn-notif-preferences');
        if (btnPrefs) {
            btnPrefs.addEventListener('click', () => {
                self._openPreferencesModal();
            });
        }

        // Filter
        document.querySelectorAll('[data-notif-filter]').forEach(btn => {
            btn.addEventListener('click', () => {
                self._state.filter = btn.dataset.notifFilter;
                self._refreshList();
            });
        });

        // Klik item notifikasi — tandai dibaca
        document.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', async (e) => {
                // Jangan trigger jika klik tombol aksi
                if (e.target.closest('[data-notif-tts]') || e.target.closest('[data-notif-dismiss]')) return;

                const notifId = item.dataset.notifId;
                if (notifId) {
                    await self._markAsRead(notifId);

                    // Navigasi ke modul terkait
                    const notif = self._state.notifications.find(n => n.id === notifId);
                    if (notif && notif.linkModule && YWM.App && YWM.App.navigateTo) {
                        YWM.App.navigateTo(notif.linkModule);
                    }
                }
            });
        });

        // TTS
        document.querySelectorAll('[data-notif-tts]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const notifId = btn.dataset.notifTts;
                await self._readAloud(notifId);
            });
        });

        // Hapus notifikasi
        document.querySelectorAll('[data-notif-dismiss]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const notifId = btn.dataset.notifDismiss;
                await self._dismissNotification(notifId);
            });
        });

        // Update badge notifikasi di sidebar/header
        this._updateNotifBadge();
    },

    /**
     * Muat notifikasi dari KV
     */
    async _loadNotifications() {
        try {
            const username = YWM.PuterInit?.user?.username || 'Guest';
            const stored = await YWM.Data.get(`ywm:notification:user:${username}`);
            if (stored) {
                this._state.notifications = typeof stored === 'string' ? JSON.parse(stored) : stored;
            } else {
                this._state.notifications = this._getDefaultNotifications();
            }
        } catch (e) {
            console.warn('[Notifications] Gagal memuat notifikasi:', e.message);
            this._state.notifications = this._getDefaultNotifications();
        }
    },

    /**
     * Muat preferensi notifikasi
     */
    async _loadPreferences() {
        try {
            const username = YWM.PuterInit?.user?.username || 'Guest';
            const stored = await YWM.Data.get(`ywm:notification:preferences:${username}`);
            if (stored) {
                this._state.preferences = typeof stored === 'string' ? JSON.parse(stored) : stored;
            } else {
                // Default: semua aktif
                this._state.preferences = {};
                this._categories.forEach(cat => {
                    this._state.preferences[cat.id] = true;
                });
            }
        } catch (e) {
            this._state.preferences = {};
            this._categories.forEach(cat => {
                this._state.preferences[cat.id] = true;
            });
        }
    },

    /**
     * Simpan notifikasi ke KV
     */
    async _saveNotifications() {
        try {
            const username = YWM.PuterInit?.user?.username || 'Guest';
            await YWM.Data.set(`ywm:notification:user:${username}`, JSON.stringify(this._state.notifications));
        } catch (e) {
            console.warn('[Notifications] Gagal menyimpan notifikasi:', e.message);
        }
    },

    /**
     * Notifikasi default (contoh data awal)
     * @returns {Array} Daftar notifikasi
     */
    _getDefaultNotifications() {
        const now = new Date();
        return [
            {
                id: 'notif_demo_1',
                category: 'stok',
                title: 'Stok Spare Part Rendah',
                message: 'Bearing SKF 6205 (kode: BRG-6205) stok saat ini 5 unit, di bawah reorder point 10 unit. Segera lakukan pemesanan ulang.',
                timestamp: new Date(now.getTime() - 1800000).toISOString(), // 30 menit lalu
                read: false,
                priority: 'high',
                linkModule: 'spareparts'
            },
            {
                id: 'notif_demo_2',
                category: 'maintenance',
                title: 'Work Order Overdue',
                message: 'WO #WO-2026-0145 (PM Packing Machine #2) telah melewati jadwal 2 hari. Prioritas: High. Teknisi: Ahmad R.',
                timestamp: new Date(now.getTime() - 7200000).toISOString(), // 2 jam lalu
                read: false,
                priority: 'critical',
                linkModule: 'maintenance'
            },
            {
                id: 'notif_demo_3',
                category: 'produksi',
                title: 'Deviasi Target Produksi',
                message: 'Shift Pagi hari ini: realisasi 8.200 zak dari target 10.000 zak (deviasi -18%). Perlu investigasi penyebab.',
                timestamp: new Date(now.getTime() - 14400000).toISOString(), // 4 jam lalu
                read: false,
                priority: 'high',
                linkModule: 'production'
            },
            {
                id: 'notif_demo_4',
                category: 'hse',
                title: 'Insiden HSE Dilaporkan',
                message: 'Near miss diarea loading dock — truk hampir menabrak pillar. Laporan insiden INS-2026-003 sudah dibuat.',
                timestamp: new Date(now.getTime() - 28800000).toISOString(), // 8 jam lalu
                read: false,
                priority: 'medium',
                linkModule: 'safety'
            },
            {
                id: 'notif_demo_5',
                category: 'hr',
                title: 'Pengajuan Cuti Menunggu Persetujuan',
                message: 'Budi Santoso mengajukan cuti tahunan 3 hari (5-7 Jun 2026). Menunggu persetujuan Supervisor.',
                timestamp: new Date(now.getTime() - 43200000).toISOString(), // 12 jam lalu
                read: true,
                priority: 'medium',
                linkModule: 'hr'
            },
            {
                id: 'notif_demo_6',
                category: 'keuangan',
                title: 'Laporan Keuangan Bulanan Siap',
                message: 'Laporan P&L bulan Mei 2026 sudah tersedia. Revenue: Rp 2.8M, Net Margin: 12.3%.',
                timestamp: new Date(now.getTime() - 86400000).toISOString(), // 1 hari lalu
                read: true,
                priority: 'low',
                linkModule: 'finance'
            }
        ];
    },

    /**
     * Cek dan generate notifikasi otomatis
     */
    async _checkAutoNotifications() {
        const prefs = this._state.preferences;
        const newNotifications = [];

        // 1. Spare part di bawah reorder point
        if (prefs.stok !== false) {
            try {
                const stored = await YWM.Data.get('ywm:spareparts:items');
                if (stored) {
                    const parts = typeof stored === 'string' ? JSON.parse(stored) : stored;
                    if (Array.isArray(parts)) {
                        parts.filter(p => p.stok_saat_ini <= (p.reorder_point || p.stok_minimum || 0)).forEach(p => {
                            // Cek apakah sudah ada notifikasi untuk part ini hari ini
                            const today = new Date().toISOString().split('T')[0];
                            const exists = this._state.notifications.some(n =>
                                n.category === 'stok' && n.metadata?.partId === p.id &&
                                n.timestamp && n.timestamp.startsWith(today)
                            );
                            if (!exists) {
                                newNotifications.push({
                                    id: 'notif_sp_' + this._generateId(),
                                    category: 'stok',
                                    title: `Stok Rendah: ${p.nama_part || p.nama || 'Part'}`,
                                    message: `${p.nama_part || p.nama || 'Part'} (${p.kode_part || p.kode || '-'}) stok: ${p.stok_saat_ini || 0} ${p.satuan || 'unit'}, reorder point: ${p.reorder_point || p.stok_minimum || 0}. Segera pesan ulang.`,
                                    timestamp: new Date().toISOString(),
                                    read: false,
                                    priority: 'high',
                                    linkModule: 'spareparts',
                                    metadata: { partId: p.id || p.kode_part }
                                });
                            }
                        });
                    }
                }
            } catch (e) {
                console.warn('[Notifications] Gagal cek stok spare parts:', e.message);
            }
        }

        // 2. Work order overdue
        if (prefs.maintenance !== false) {
            try {
                const stored = await YWM.Data.get('ywm:maintenance:workorders');
                if (stored) {
                    const wos = typeof stored === 'string' ? JSON.parse(stored) : stored;
                    if (Array.isArray(wos)) {
                        const today = new Date().toISOString().split('T')[0];
                        wos.filter(wo => {
                            const isOverdue = wo.status !== 'selesai' && wo.tanggal_jadwal && wo.tanggal_jadwal < today;
                            return isOverdue;
                        }).forEach(wo => {
                            const exists = this._state.notifications.some(n =>
                                n.category === 'maintenance' && n.metadata?.woId === wo.id
                            );
                            if (!exists) {
                                newNotifications.push({
                                    id: 'notif_wo_' + this._generateId(),
                                    category: 'maintenance',
                                    title: `Work Order Overdue: ${wo.nomor_wo || wo.id}`,
                                    message: `${wo.nomor_wo || 'WO'} — ${wo.deskripsi_masalah || wo.deskripsi || 'Maintenance task'} sudah melewati jadwal ${wo.tanggal_jadwal}. Prioritas: ${wo.prioritas || 'medium'}.`,
                                    timestamp: new Date().toISOString(),
                                    read: false,
                                    priority: wo.prioritas === 'critical' ? 'critical' : 'high',
                                    linkModule: 'maintenance',
                                    metadata: { woId: wo.id }
                                });
                            }
                        });
                    }
                }
            } catch (e) {
                console.warn('[Notifications] Gagal cek work orders:', e.message);
            }
        }

        // 3. Deviasi target produksi > 10%
        if (prefs.produksi !== false) {
            try {
                const stored = await YWM.Data.get('ywm:production:entries');
                if (stored) {
                    const entries = typeof stored === 'string' ? JSON.parse(stored) : stored;
                    if (Array.isArray(entries)) {
                        const today = new Date().toISOString().split('T')[0];
                        entries.filter(e => {
                            if (e.tanggal !== today) return false;
                            const target = e.target_zak || e.target || 0;
                            const realisasi = e.realisasi_zak || e.realisasi || 0;
                            if (target <= 0) return false;
                            const deviasi = Math.abs((realisasi - target) / target * 100);
                            return deviasi > 10;
                        }).forEach(e => {
                            const target = e.target_zak || e.target || 0;
                            const realisasi = e.realisasi_zak || e.realisasi || 0;
                            const deviasi = target > 0 ? (((realisasi - target) / target) * 100).toFixed(1) : 0;
                            const exists = this._state.notifications.some(n =>
                                n.category === 'produksi' && n.metadata?.shift === e.shift && n.timestamp && n.timestamp.startsWith(today)
                            );
                            if (!exists) {
                                newNotifications.push({
                                    id: 'notif_prod_' + this._generateId(),
                                    category: 'produksi',
                                    title: `Deviasi Target Produksi: ${e.shift || 'Shift'}`,
                                    message: `Shift ${e.shift || '-'} hari ini: realisasi ${typeof formatAngka === 'function' ? formatAngka(realisasi) : realisasi} zak dari target ${typeof formatAngka === 'function' ? formatAngka(target) : target} zak (deviasi ${deviasi}%). Perlu investigasi penyebab.`,
                                    timestamp: new Date().toISOString(),
                                    read: false,
                                    priority: 'high',
                                    linkModule: 'production',
                                    metadata: { shift: e.shift }
                                });
                            }
                        });
                    }
                }
            } catch (e) {
                console.warn('[Notifications] Gagal cek produksi:', e.message);
            }
        }

        // 4. HSE incident
        if (prefs.hse !== false) {
            try {
                const stored = await YWM.Data.get('ywm:safety:incidents');
                if (stored) {
                    const incidents = typeof stored === 'string' ? JSON.parse(stored) : stored;
                    if (Array.isArray(incidents)) {
                        const today = new Date().toISOString().split('T')[0];
                        incidents.filter(i => {
                            const dateStr = i.tanggal || i.created_at || i.timestamp;
                            return dateStr && dateStr.startsWith(today);
                        }).forEach(i => {
                            const exists = this._state.notifications.some(n =>
                                n.category === 'hse' && n.metadata?.incidentId === i.id
                            );
                            if (!exists) {
                                newNotifications.push({
                                    id: 'notif_hse_' + this._generateId(),
                                    category: 'hse',
                                    title: `Insiden HSE: ${i.tipe || i.jenis || 'Insiden'}`,
                                    message: `${i.tipe || i.jenis || 'Insiden'} dilaporkan — ${i.deskripsi || i.keterangan || 'Detail belum tersedia'}. Severity: ${i.severity || 'medium'}.`,
                                    timestamp: new Date().toISOString(),
                                    read: false,
                                    priority: i.severity === 'critical' ? 'critical' : 'high',
                                    linkModule: 'safety',
                                    metadata: { incidentId: i.id }
                                });
                            }
                        });
                    }
                }
            } catch (e) {
                console.warn('[Notifications] Gagal cek HSE:', e.message);
            }
        }

        // 5. Leave request pending
        if (prefs.hr !== false) {
            try {
                const stored = await YWM.Data.get('ywm:hr:leave_requests');
                if (stored) {
                    const leaves = typeof stored === 'string' ? JSON.parse(stored) : stored;
                    if (Array.isArray(leaves)) {
                        leaves.filter(l => l.status === 'pending' || l.status === 'dipending').forEach(l => {
                            const exists = this._state.notifications.some(n =>
                                n.category === 'hr' && n.metadata?.leaveId === l.id
                            );
                            if (!exists) {
                                newNotifications.push({
                                    id: 'notif_hr_' + this._generateId(),
                                    category: 'hr',
                                    title: `Pengajuan Cuti: ${l.nama || l.karyawan || 'Karyawan'}`,
                                    message: `${l.nama || l.karyawan || 'Karyawan'} mengajukan ${l.jenis_cuti || 'cuti'} ${l.durasi || ''} hari (${l.tanggal_mulai || '-'} s/d ${l.tanggal_selesai || '-'}). Menunggu persetujuan.`,
                                    timestamp: new Date().toISOString(),
                                    read: false,
                                    priority: 'medium',
                                    linkModule: 'hr',
                                    metadata: { leaveId: l.id }
                                });
                            }
                        });
                    }
                }
            } catch (e) {
                console.warn('[Notifications] Gagal cek leave requests:', e.message);
            }
        }

        // Tambahkan notifikasi baru
        if (newNotifications.length > 0) {
            this._state.notifications = [...newNotifications, ...this._state.notifications];
            await this._saveNotifications();
        }
    },

    /**
     * Tandai notifikasi sebagai dibaca
     * @param {string} notifId - ID notifikasi
     */
    async _markAsRead(notifId) {
        const notif = this._state.notifications.find(n => n.id === notifId);
        if (notif && !notif.read) {
            notif.read = true;
            await this._saveNotifications();
            this._refreshList();
            this._updateNotifBadge();
        }
    },

    /**
     * Tandai semua notifikasi sebagai dibaca
     */
    async _markAllRead() {
        let changed = false;
        this._state.notifications.forEach(n => {
            if (!n.read) {
                n.read = true;
                changed = true;
            }
        });

        if (changed) {
            await this._saveNotifications();
            this._refreshList();
            this._updateNotifBadge();
            if (YWM.UI && YWM.UI.showToast) {
                YWM.UI.showToast('Semua notifikasi ditandai sebagai dibaca', 'success');
            }
        }
    },

    /**
     * Hapus notifikasi
     * @param {string} notifId - ID notifikasi
     */
    async _dismissNotification(notifId) {
        this._state.notifications = this._state.notifications.filter(n => n.id !== notifId);
        await this._saveNotifications();
        this._refreshList();
        this._updateNotifBadge();
    },

    /**
     * Baca notifikasi dengan TTS
     * @param {string} notifId - ID notifikasi
     */
    async _readAloud(notifId) {
        const notif = this._state.notifications.find(n => n.id === notifId);
        if (!notif) return;

        try {
            if (typeof puter !== 'undefined' && puter.ai && puter.ai.txt2speech) {
                const text = `${notif.title}. ${notif.message}`;
                await puter.ai.txt2speech(text);
                if (YWM.UI && YWM.UI.showToast) {
                    YWM.UI.showToast('Membacakan notifikasi...', 'info');
                }
            } else {
                // Fallback: gunakan Web Speech API
                if ('speechSynthesis' in window) {
                    const utterance = new SpeechSynthesisUtterance(`${notif.title}. ${notif.message}`);
                    utterance.lang = 'id-ID';
                    utterance.rate = 0.9;
                    speechSynthesis.speak(utterance);
                    if (YWM.UI && YWM.UI.showToast) {
                        YWM.UI.showToast('Membacakan notifikasi...', 'info');
                    }
                } else {
                    if (YWM.UI && YWM.UI.showToast) {
                        YWM.UI.showToast('TTS tidak tersedia di browser ini', 'warning');
                    }
                }
            }
        } catch (e) {
            console.warn('[Notifications] Gagal TTS:', e.message);
            // Fallback ke Web Speech API
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(`${notif.title}. ${notif.message}`);
                utterance.lang = 'id-ID';
                speechSynthesis.speak(utterance);
            }
        }
    },

    /**
     * Buka modal preferensi notifikasi
     */
    _openPreferencesModal() {
        const self = this;
        const prefs = this._state.preferences;

        const togglesHtml = this._categories.map(cat => {
            const checked = prefs[cat.id] !== false ? 'checked' : '';
            return `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <span style="font-size:1.1rem;">${cat.icon}</span>
                        <span style="font-size:0.9rem;">${cat.label}</span>
                    </div>
                    <label style="position:relative;display:inline-block;width:44px;height:24px;">
                        <input type="checkbox" data-pref-category="${cat.id}" ${checked} style="opacity:0;width:0;height:0;">
                        <span style="position:absolute;cursor:pointer;inset:0;background:${checked ? 'var(--accent)' : 'rgba(255,255,255,0.15)'};transition:0.3s;border-radius:12px;"></span>
                        <span style="position:absolute;height:18px;width:18px;left:${checked ? '23px' : '3px'};bottom:3px;background:white;transition:0.3s;border-radius:50%;"></span>
                    </label>
                </div>
            `;
        }).join('');

        const content = `
            <p class="text-muted" style="margin-bottom:16px;font-size:0.85rem;">Atur notifikasi yang ingin Anda terima per kategori.</p>
            ${togglesHtml}
        `;

        if (YWM.UI && YWM.UI.openModal) {
            YWM.UI.openModal('Pengaturan Notifikasi', content, [
                {
                    label: 'Batal',
                    class: 'btn',
                    action: () => YWM.UI.closeModal()
                },
                {
                    label: 'Simpan',
                    class: 'btn btn-accent',
                    action: async () => {
                        const newPrefs = {};
                        document.querySelectorAll('[data-pref-category]').forEach(input => {
                            newPrefs[input.dataset.prefCategory] = input.checked;
                        });
                        self._state.preferences = newPrefs;
                        try {
                            const username = YWM.PuterInit?.user?.username || 'Guest';
                            await YWM.Data.set(`ywm:notification:preferences:${username}`, JSON.stringify(newPrefs));
                        } catch (e) {
                            console.warn('[Notifications] Gagal simpan preferensi:', e.message);
                        }
                        YWM.UI.closeModal();
                        if (YWM.UI && YWM.UI.showToast) {
                            YWM.UI.showToast('Preferensi notifikasi disimpan', 'success');
                        }
                    }
                }
            ]);
        }
    },

    /**
     * Refresh tampilan daftar notifikasi
     */
    _refreshList() {
        const container = document.getElementById('notification-list-container');
        if (container) {
            container.innerHTML = this._renderNotificationList();
            // Pasang ulang event listener
            this._attachItemListeners();
        }
    },

    /**
     * Pasang event listener pada item notifikasi
     */
    _attachItemListeners() {
        const self = this;

        document.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', async (e) => {
                if (e.target.closest('[data-notif-tts]') || e.target.closest('[data-notif-dismiss]')) return;
                const notifId = item.dataset.notifId;
                if (notifId) {
                    await self._markAsRead(notifId);
                    const notif = self._state.notifications.find(n => n.id === notifId);
                    if (notif && notif.linkModule && YWM.App && YWM.App.navigateTo) {
                        YWM.App.navigateTo(notif.linkModule);
                    }
                }
            });
        });

        document.querySelectorAll('[data-notif-tts]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                await self._readAloud(btn.dataset.notifTts);
            });
        });

        document.querySelectorAll('[data-notif-dismiss]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                await self._dismissNotification(btn.dataset.notifDismiss);
            });
        });
    },

    /**
     * Update badge notifikasi di sidebar/header
     */
    _updateNotifBadge() {
        const unreadCount = this._state.notifications.filter(n => !n.read).length;

        // Badge di sidebar
        const sidebarBadge = document.getElementById('notif-badge');
        if (sidebarBadge) {
            if (unreadCount > 0) {
                sidebarBadge.textContent = unreadCount > 99 ? '99+' : unreadCount;
                sidebarBadge.classList.remove('hidden');
            } else {
                sidebarBadge.classList.add('hidden');
            }
        }

        // Dot di header
        const headerDot = document.getElementById('header-notif-dot');
        if (headerDot) {
            if (unreadCount > 0) {
                headerDot.classList.remove('hidden');
            } else {
                headerDot.classList.add('hidden');
            }
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

console.log('[YWM Modules] Notifications module dimuat ✓');
