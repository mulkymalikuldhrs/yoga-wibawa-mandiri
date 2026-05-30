/**
 * ============================================================================
 * YWM App — Modul Inti Aplikasi Dashboard
 * PT Yoga Wibawa Mandiri
 * ============================================================================
 *
 * Modul ini adalah controller utama (router + inisialisasi) untuk dashboard.
 * Menyediakan 3 namespace utama:
 *   - YWM.App   → Routing, navigasi, lifecycle aplikasi
 *   - YWM.UI    → Utilitas UI (toast, modal, format, confirm)
 *   - YWM.Data  → Abstraksi data layer Puter.js KV Store + audit trail
 *
 * Dependensi:
 *   - Puter.js (global: puter)
 *   - glassmorphic.css (kelas CSS glassmorphism)
 *   - YWM.PuterInit (modul inisialisasi Puter.js)
 *   - YWM.Modules.* (modul-modul fitur yang didaftarkan)
 * ============================================================================
 */

(function () {
    'use strict';

    // =========================================================================
    // Inisialisasi Namespace Global
    // =========================================================================

    window.YWM = window.YWM || {};
    window.YWM.Modules = window.YWM.Modules || {};

    // =========================================================================
    // Konstanta & Konfigurasi
    // =========================================================================

    /** Modul default jika hash kosong / tidak valid */
    const DEFAULT_MODULE = 'home';

    /** Mapping nama modul → judul tampilan untuk breadcrumb */
    const MODULE_TITLES = {
        home: 'Beranda',
        spareparts: 'Spare Parts',
        production: 'Produksi',
        maintenance: 'Maintenance',
        team: 'Tim & Aktivitas',
        quality: 'Quality Control',
        qc: 'Quality Control',
        safety: 'Safety / HSE',
        hse: 'Safety / HSE',
        finance: 'Keuangan',
        hr: 'HR & Payroll',
        purchasing: 'Purchasing',
        documents: 'Dokumen & OCR',
        reports: 'Laporan',
        analytics: 'Analytics',
        notifications: 'Notifikasi',
        settings: 'Pengaturan'
    };

    /** Interval update jam (ms) */
    const CLOCK_INTERVAL = 1000;

    /** Prefix key KV Store */
    const KV_PREFIX = 'ywm:';

    // =========================================================================
    // YWM.App — Controller Utama Aplikasi
    // =========================================================================

    YWM.App = {

        /** Modul yang sedang aktif */
        _currentModule: null,

        /** Status inisialisasi Puter.js */
        _puterReady: false,

        /** Referensi interval jam */
        _clockInterval: null,

        /**
         * Inisialisasi seluruh aplikasi.
         * Dipanggil sekali saat DOM siap.
         */
        async init() {
            console.log('[YWM.App] Memulai inisialisasi aplikasi...');

            try {
                // 1. Inisialisasi Puter.js
                await this._initPuter();
            } catch (err) {
                console.warn('[YWM.App] Puter.js gagal diinisialisasi, berjalan mode offline:', err);
                this._updateConnectionStatus(false);
            }

            // 2. Pasang seluruh event listener global
            this._setupEventListeners();

            // 3. Mulai jam di status bar
            this._startClock();

            // 4. Navigasi ke modul awal (dari hash atau default)
            const initialModule = this._parseHash() || DEFAULT_MODULE;
            this.navigateTo(initialModule);

            console.log('[YWM.App] Inisialisasi selesai. Modul aktif:', initialModule);
        },

        /**
         * Inisialisasi Puter.js dan muat info user.
         * @private
         */
        async _initPuter() {
            // Cek apakah YWM.PuterInit tersedia
            if (typeof YWM.PuterInit !== 'undefined' && typeof YWM.PuterInit.init === 'function') {
                await YWM.PuterInit.init();
                console.log('[YWM.App] YWM.PuterInit.init() selesai.');
            } else if (typeof puter !== 'undefined') {
                // Fallback: langsung gunakan puter global
                console.log('[YWM.App] YWM.PuterInit tidak ditemukan, menggunakan puter global.');
            } else {
                throw new Error('Puter.js tidak tersedia.');
            }

            this._puterReady = true;
            this._updateConnectionStatus(true);

            // Ambil info user untuk sidebar
            try {
                const user = await puter.auth.getUser();
                if (user && user.username) {
                    this._updateUserInfo(user);
                    console.log('[YWM.App] User dimuat:', user.username);
                }
            } catch (err) {
                console.warn('[YWM.App] Gagal mengambil info user:', err);
            }
        },

        /**
         * Navigasi ke modul tertentu.
         * @param {string} moduleName — Nama modul (misal: 'spareparts')
         */
        async navigateTo(moduleName) {
            // Normalisasi nama modul
            moduleName = (moduleName || '').toLowerCase().trim();

            if (!moduleName) {
                moduleName = DEFAULT_MODULE;
            }

            console.log('[YWM.App] Navigasi ke modul:', moduleName);

            // Perbarui hash URL tanpa memicu hashchange berulang
            const targetHash = '#' + moduleName;
            if (window.location.hash !== targetHash) {
                this._isProgrammaticHashChange = true;
                window.location.hash = targetHash;
            }

            // Perbarui state sidebar aktif
            this._updateSidebarActive(moduleName);

            // Perbarui breadcrumb
            this._updateBreadcrumb(moduleName);

            // Render konten modul
            await this._renderModule(moduleName);

            // Simpan modul aktif
            this._currentModule = moduleName;
        },

        /**
         * Mengembalikan nama modul yang sedang aktif.
         * @returns {string|null}
         */
        getCurrentModule() {
            return this._currentModule;
        },

        /**
         * Tampilkan spinner loading di area konten.
         */
        showLoading() {
            const contentArea = document.getElementById('content-area');
            if (contentArea) {
                contentArea.innerHTML = `
                    <div class="flex items-center justify-center" style="min-height: 40vh;">
                        <div class="text-center">
                            <div class="spinner spinner-lg mx-auto mb-4"></div>
                            <p class="text-muted">Memuat data...</p>
                        </div>
                    </div>
                `;
            }
        },

        /**
         * Sembunyikan spinner loading.
         * Catatan: loading otomatis tergantikan saat modul di-render.
         */
        hideLoading() {
            // Tidak perlu aksi eksplisit karena render() mengganti innerHTML.
            // Fungsi ini disediakan untuk kompatibilitas API.
        },

        /**
         * Render ulang modul yang sedang aktif.
         */
        async refreshCurrentModule() {
            if (this._currentModule) {
                console.log('[YWM.App] Me-refresh modul:', this._currentModule);
                await this._renderModule(this._currentModule);
            }
        },

        // ---------------------------------------------------------------------
        // Metode Privat — Routing & Rendering
        // ---------------------------------------------------------------------

        /**
         * Render konten modul ke area konten.
         * @param {string} moduleName
         * @private
         */
        async _renderModule(moduleName) {
            const contentArea = document.getElementById('content-area');
            if (!contentArea) {
                console.error('[YWM.App] #content-area tidak ditemukan di DOM.');
                return;
            }

            // Tampilkan loading
            this.showLoading();

            try {
                // Cek apakah modul terdaftar
                const module = YWM.Modules[moduleName];

                if (!module) {
                    // Modul tidak dikenali — tampilkan halaman 404
                    contentArea.innerHTML = this._render404(moduleName);
                    return;
                }

                // Render HTML dari modul
                let html = '';
                if (typeof module.render === 'function') {
                    html = await module.render();
                } else {
                    html = `<div class="glass p-6"><p class="text-warning">Modul "${moduleName}" tidak memiliki fungsi render().</p></div>`;
                }

                // Animate: fade-in
                contentArea.innerHTML = `<div class="animate-fade-in">${html}</div>`;

                // Inisialisasi modul (event listeners, dll.)
                if (typeof module.init === 'function') {
                    try {
                        await module.init();
                    } catch (initErr) {
                        console.error(`[YWM.App] Error saat init modul "${moduleName}":`, initErr);
                        YWM.UI.showToast(`Gagal menginisialisasi modul ${moduleName}`, 'error');
                    }
                }

            } catch (err) {
                console.error(`[YWM.App] Error saat render modul "${moduleName}":`, err);
                contentArea.innerHTML = `
                    <div class="glass p-6 text-center animate-fade-in" style="min-height: 30vh;">
                        <div class="text-5xl mb-4">⚠️</div>
                        <h2 class="text-xl font-semibold text-error mb-2">Terjadi Kesalahan</h2>
                        <p class="text-muted mb-4">Gagal memuat modul "${moduleName}". Silakan coba lagi.</p>
                        <button class="btn btn-accent" onclick="YWM.App.refreshCurrentModule()">
                            Coba Lagi
                        </button>
                    </div>
                `;
            }
        },

        /**
         * Render halaman 404 untuk modul tidak dikenali.
         * @param {string} moduleName
         * @returns {string} HTML
         * @private
         */
        _render404(moduleName) {
            return `
                <div class="glass p-6 text-center animate-fade-in" style="min-height: 40vh;">
                    <div class="text-6xl mb-4">🔍</div>
                    <h2 class="text-2xl font-semibold mb-2">Modul Tidak Ditemukan</h2>
                    <p class="text-muted mb-4">Modul "<code class="text-accent">${this._escapeHtml(moduleName)}</code>" tidak tersedia di dashboard ini.</p>
                    <button class="btn btn-accent" onclick="YWM.App.navigateTo('home')">
                        Kembali ke Beranda
                    </button>
                </div>
            `;
        },

        /**
         * Parse URL hash menjadi nama modul.
         * @returns {string|null}
         * @private
         */
        _parseHash() {
            const hash = window.location.hash.replace('#', '').trim();
            return hash || null;
        },

        /**
         * Perbarui sidebar — tandai item aktif.
         * @param {string} moduleName
         * @private
         */
        _updateSidebarActive(moduleName) {
            // Hapus class aktif dari semua item sidebar
            const navItems = document.querySelectorAll('[data-module]');
            navItems.forEach(item => {
                item.classList.remove('active');
                item.removeAttribute('aria-current');
            });

            // Tambahkan class aktif ke item yang sesuai
            const activeItem = document.querySelector(`[data-module="${moduleName}"]`);
            if (activeItem) {
                activeItem.classList.add('active');
                activeItem.setAttribute('aria-current', 'page');
            }
        },

        /**
         * Perbarui teks breadcrumb.
         * @param {string} moduleName
         * @private
         */
        _updateBreadcrumb(moduleName) {
            const breadcrumb = document.getElementById('breadcrumb-current');
            if (breadcrumb) {
                const title = this._getModuleTitle(moduleName);
                breadcrumb.textContent = title;
            }

            // Juga perbarui judul halaman browser
            const title = this._getModuleTitle(moduleName);
            document.title = `${title} — YWM Dashboard`;
        },

        /**
         * Dapatkan judul tampilan untuk modul.
         * @param {string} moduleName
         * @returns {string}
         * @private
         */
        _getModuleTitle(moduleName) {
            // Cek di MODULE_TITLES dulu
            if (MODULE_TITLES[moduleName]) {
                return MODULE_TITLES[moduleName];
            }
            // Cek di modul yang terdaftar
            if (YWM.Modules[moduleName] && YWM.Modules[moduleName].title) {
                return YWM.Modules[moduleName].title;
            }
            // Fallback: kapitalisasi nama modul
            return moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
        },

        // ---------------------------------------------------------------------
        // Metode Privat — Event Listeners
        // ---------------------------------------------------------------------

        /**
         * Pasang seluruh event listener global.
         * @private
         */
        _setupEventListeners() {
            // --- Hash Change (navigasi browser) ---
            window.addEventListener('hashchange', () => {
                // Abaikan jika perubahan hash berasal dari navigateTo()
                if (this._isProgrammaticHashChange) {
                    this._isProgrammaticHashChange = false;
                    return;
                }
                const moduleName = this._parseHash() || DEFAULT_MODULE;
                this.navigateTo(moduleName);
            });

            // --- Sidebar Nav Clicks ---
            document.addEventListener('click', (e) => {
                const navItem = e.target.closest('[data-module]');
                if (navItem) {
                    e.preventDefault();
                    const moduleName = navItem.getAttribute('data-module');
                    if (moduleName) {
                        this.navigateTo(moduleName);
                    }
                }
            });

            // --- AI Panel Toggle ---
            const aiToggle = document.getElementById('ai-toggle-btn');
            if (aiToggle) {
                aiToggle.addEventListener('click', () => {
                    this._toggleAIPanel();
                });
            }

            // --- Search Bar (Ctrl+K) ---
            document.addEventListener('keydown', (e) => {
                // Ctrl+K atau Cmd+K → buka search
                if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                    e.preventDefault();
                    this._focusSearchBar();
                }
                // Escape → tutup search / modal
                if (e.key === 'Escape') {
                    this._closeSearchBar();
                    YWM.UI.closeModal();
                }
            });

            // --- Mobile Menu Toggle ---
            const mobileToggle = document.getElementById('mobile-menu-btn');
            if (mobileToggle) {
                mobileToggle.addEventListener('click', () => {
                    this._toggleMobileMenu();
                });
            }

            // --- Notification Button ---
            const notifBtn = document.getElementById('notif-btn');
            if (notifBtn) {
                notifBtn.addEventListener('click', () => {
                    this.navigateTo('notifications');
                });
            }

            // --- Online/Offline Status ---
            window.addEventListener('online', () => {
                this._updateConnectionStatus(true);
                YWM.UI.showToast('Koneksi internet kembali tersedia.', 'success');
            });

            window.addEventListener('offline', () => {
                this._updateConnectionStatus(false);
                YWM.UI.showToast('Koneksi internet terputus. Beberapa fitur mungkin tidak tersedia.', 'warning');
            });

            console.log('[YWM.App] Event listener global terpasang.');
        },

        /**
         * Toggle panel AI (buka/tutup).
         * @private
         */
        _toggleAIPanel() {
            const aiPanel = document.getElementById('ai-panel');
            if (!aiPanel) return;

            const isHidden = aiPanel.classList.contains('hidden');
            if (isHidden) {
                aiPanel.classList.remove('hidden');
                aiPanel.setAttribute('aria-hidden', 'false');
            } else {
                aiPanel.classList.add('hidden');
                aiPanel.setAttribute('aria-hidden', 'true');
            }
        },

        /**
         * Fokuskan search bar.
         * @private
         */
        _focusSearchBar() {
            const searchInput = document.getElementById('global-search');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        },

        /**
         * Tutup search bar.
         * @private
         */
        _closeSearchBar() {
            const searchInput = document.getElementById('global-search');
            if (searchInput) {
                searchInput.blur();
            }
        },

        /**
         * Toggle sidebar mobile (buka/tutup).
         * @private
         */
        _toggleMobileMenu() {
            const sidebar = document.getElementById('sidebar');
            if (!sidebar) return;

            const isOpen = sidebar.classList.contains('mobile-open');
            if (isOpen) {
                sidebar.classList.remove('mobile-open');
            } else {
                sidebar.classList.add('mobile-open');
            }
        },

        // ---------------------------------------------------------------------
        // Metode Privat — UI Updates
        // ---------------------------------------------------------------------

        /**
         * Perbarui info user di sidebar.
         * @param {Object} user — Objek user dari Puter.js
         * @private
         */
        _updateUserInfo(user) {
            const userNameEl = document.getElementById('user-name');
            const userAvatarEl = document.getElementById('user-avatar');

            if (userNameEl && user.username) {
                userNameEl.textContent = user.username;
            }

            if (userAvatarEl && user.username) {
                // Gunakan inisial sebagai avatar jika tidak ada gambar
                const initials = user.username.substring(0, 2).toUpperCase();
                userAvatarEl.textContent = initials;
            }
        },

        /**
         * Perbarui indikator status koneksi.
         * @param {boolean} online
         * @private
         */
        _updateConnectionStatus(online) {
            const statusDot = document.getElementById('connection-status-dot');
            const statusText = document.getElementById('connection-status-text');
            const headerDot = document.getElementById('status-dot');
            const headerText = document.getElementById('status-connection');
            if (statusDot) {
                statusDot.className = online ? 'status-dot online' : 'status-dot offline';
            }
            if (statusText) {
                statusText.textContent = online ? 'Terhubung' : 'Offline';
            }
            if (headerDot) {
                headerDot.className = online ? 'status-dot online' : 'status-dot offline';
            }
            if (headerText) {
                headerText.textContent = online ? 'Online' : 'Offline';
            }
        },

        /**
         * Mulai pembaruan jam di status bar setiap detik.
         * @private
         */
        _startClock() {
            const updateClock = () => {
                const clockEl = document.getElementById('status-time');
                if (clockEl) {
                    const now = new Date();
                    const options = {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                    };
                    clockEl.textContent = now.toLocaleDateString('id-ID', options);
                }
            };

            // Update segera
            updateClock();

            // Update berkala
            if (this._clockInterval) {
                clearInterval(this._clockInterval);
            }
            this._clockInterval = setInterval(updateClock, CLOCK_INTERVAL);
        },

        /**
         * Escape HTML untuk mencegah XSS.
         * @param {string} str
         * @returns {string}
         * @private
         */
        _escapeHtml(str) {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        },

        /** Flag untuk mencegah loop hashchange */
        _isProgrammaticHashChange: false
    };

    // =========================================================================
    // YWM.UI — Utilitas Antarmuka Pengguna
    // =========================================================================

    YWM.UI = {

        /** Timer auto-hide toast */
        _toastTimeout: null,

        /**
         * Tampilkan notifikasi toast.
         * @param {string} message — Pesan yang ditampilkan
         * @param {'success'|'error'|'info'|'warning'} type — Tipe toast
         */
        showToast(message, type = 'info') {
            // Pastikan container toast ada
            let container = document.getElementById('toast-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'toast-container';
                container.style.cssText = 'position:fixed;top:1rem;right:1rem;z-index:10000;display:flex;flex-direction:column;gap:0.5rem;pointer-events:none;';
                document.body.appendChild(container);
            }

            // Ikon berdasarkan tipe
            const icons = {
                success: '✅',
                error: '❌',
                warning: '⚠️',
                info: 'ℹ️'
            };

            // Badge class berdasarkan tipe
            const badgeClasses = {
                success: 'badge-success',
                error: 'badge-error',
                warning: 'badge-warning',
                info: 'badge-info'
            };

            const icon = icons[type] || icons.info;
            const badgeClass = badgeClasses[type] || badgeClasses.info;

            // Buat elemen toast
            const toast = document.createElement('div');
            toast.className = `glass ${badgeClass} animate-slide-up`;
            toast.style.cssText = 'pointer-events:auto;padding:0.75rem 1rem;border-radius:0.75rem;display:flex;align-items:center;gap:0.5rem;min-width:280px;max-width:420px;box-shadow:0 8px 32px rgba(0,0,0,0.2);';
            toast.innerHTML = `
                <span style="font-size:1.1rem;">${icon}</span>
                <span style="flex:1;font-size:0.875rem;">${this._escapeHtml(message)}</span>
                <button onclick="this.parentElement.remove()" style="background:none;border:none;color:inherit;cursor:pointer;font-size:1.1rem;opacity:0.7;padding:0;" aria-label="Tutup">&times;</button>
            `;

            container.appendChild(toast);

            // Auto-remove setelah 5 detik
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    toast.style.opacity = '0';
                    toast.style.transform = 'translateX(100%)';
                    setTimeout(() => toast.remove(), 300);
                }
            }, 5000);
        },

        /**
         * Tampilkan dialog modal.
         * @param {string} title — Judul modal
         * @param {string} bodyHTML — Konten body dalam HTML
         * @param {string} [footerHTML] — Konten footer dalam HTML (opsional)
         */
        showModal(title, bodyHTML, footerHTML) {
            // Pastikan elemen modal ada
            let modalOverlay = document.getElementById('modal-overlay');
            let modalDialog = document.getElementById('modal-dialog');

            if (!modalOverlay) {
                // Buat struktur modal
                modalOverlay = document.createElement('div');
                modalOverlay.id = 'modal-overlay';
                modalOverlay.style.cssText = 'position:fixed;inset:0;z-index:9000;background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:1rem;';
                modalOverlay.innerHTML = `
                    <div id="modal-dialog" class="glass-heavy animate-slide-up" style="border-radius:1rem;max-width:560px;width:100%;max-height:85vh;display:flex;flex-direction:column;overflow:hidden;">
                        <div style="display:flex;align-items:center;justify-content:space-between;padding:1rem 1.25rem;border-bottom:1px solid rgba(255,255,255,0.1);">
                            <h3 id="modal-title" style="margin:0;font-size:1.125rem;font-weight:600;"></h3>
                            <button onclick="YWM.UI.closeModal()" class="btn-icon" aria-label="Tutup modal">&times;</button>
                        </div>
                        <div id="modal-body" style="padding:1.25rem;overflow-y:auto;flex:1;"></div>
                        <div id="modal-footer" style="padding:1rem 1.25rem;border-top:1px solid rgba(255,255,255,0.1);display:flex;justify-content:flex-end;gap:0.5rem;"></div>
                    </div>
                `;
                document.body.appendChild(modalOverlay);

                // Klik di luar dialog untuk tutup
                modalOverlay.addEventListener('click', (e) => {
                    if (e.target === modalOverlay) {
                        this.closeModal();
                    }
                });

                modalDialog = document.getElementById('modal-dialog');
            }

            // Isi konten modal
            const titleEl = document.getElementById('modal-title');
            const bodyEl = document.getElementById('modal-body');
            const footerEl = document.getElementById('modal-footer');

            if (titleEl) titleEl.textContent = title;
            if (bodyEl) bodyEl.innerHTML = bodyHTML;
            if (footerEl) footerEl.innerHTML = footerHTML || '';

            // Tampilkan modal
            modalOverlay.style.display = 'flex';
            modalOverlay.setAttribute('aria-hidden', 'false');

            // Fokus ke dialog
            if (modalDialog) {
                modalDialog.focus();
            }
        },

        /**
         * Tutup dialog modal.
         */
        closeModal() {
            const modalOverlay = document.getElementById('modal-overlay');
            if (modalOverlay) {
                modalOverlay.style.display = 'none';
                modalOverlay.setAttribute('aria-hidden', 'true');
            }
        },

        /**
         * Format angka sebagai mata uang IDR.
         * @param {number} amount — Jumlah dalam Rupiah
         * @returns {string} — Contoh: "Rp 1.234.567"
         */
        formatCurrency(amount) {
            if (amount === null || amount === undefined || isNaN(amount)) {
                return 'Rp 0';
            }
            const num = Number(amount);
            return 'Rp ' + num.toLocaleString('id-ID', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            });
        },

        /**
         * Format string tanggal ke locale Indonesia.
         * @param {string} dateStr — String tanggal (ISO, dll.)
         * @returns {string} — Contoh: "12 Maret 2025"
         */
        formatDate(dateStr) {
            if (!dateStr) return '-';
            try {
                const date = new Date(dateStr);
                if (isNaN(date.getTime())) return '-';
                return date.toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });
            } catch (err) {
                return '-';
            }
        },

        /**
         * Format angka dengan pemisah ribuan.
         * @param {number} num — Angka
         * @returns {string} — Contoh: "1.234.567"
         */
        formatNumber(num) {
            if (num === null || num === undefined || isNaN(num)) {
                return '0';
            }
            return Number(num).toLocaleString('id-ID');
        },

        /**
         * Tampilkan dialog konfirmasi async (menggantikan window.confirm).
         * @param {string} message — Pesan konfirmasi
         * @returns {Promise<boolean>} — true jika pengguna mengkonfirmasi
         */
        confirm(message) {
            return new Promise((resolve) => {
                const bodyHTML = `
                    <p style="margin:0;color:rgba(255,255,255,0.8);line-height:1.6;">${this._escapeHtml(message)}</p>
                `;

                const footerHTML = `
                    <button id="modal-confirm-cancel" class="btn btn-sm">Batal</button>
                    <button id="modal-confirm-ok" class="btn btn-accent btn-sm">Ya, Lanjutkan</button>
                `;

                this.showModal('Konfirmasi', bodyHTML, footerHTML);

                // Pasang event listener setelah modal di-render
                setTimeout(() => {
                    const cancelBtn = document.getElementById('modal-confirm-cancel');
                    const okBtn = document.getElementById('modal-confirm-ok');

                    if (cancelBtn) {
                        cancelBtn.addEventListener('click', () => {
                            this.closeModal();
                            resolve(false);
                        });
                    }

                    if (okBtn) {
                        okBtn.addEventListener('click', () => {
                            this.closeModal();
                            resolve(true);
                        });
                    }
                }, 0);
            });
        },

        /**
         * Escape HTML untuk mencegah XSS.
         * @param {string} str
         * @returns {string}
         * @private
         */
        _escapeHtml(str) {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }
    };

    // =========================================================================
    // YWM.Data — Abstraksi Data Layer (Puter.js KV Store)
    // =========================================================================

    YWM.Data = {

        /**
         * Ambil nilai dari KV Store.
         * @param {string} key — Kunci data
         * @returns {Promise<any|null>} — Nilai (parsed JSON) atau null jika tidak ada
         */
        async get(key) {
            try {
                if (typeof puter === 'undefined' || !puter.kv) {
                    console.warn('[YWM.Data] Puter KV Store tidak tersedia.');
                    return null;
                }
                const raw = await puter.kv.get(key);
                if (raw === null || raw === undefined) {
                    return null;
                }
                // Coba parse JSON, fallback ke raw value
                try {
                    return JSON.parse(raw);
                } catch {
                    return raw;
                }
            } catch (err) {
                console.error(`[YWM.Data] Gagal mengambil key "${key}":`, err);
                return null;
            }
        },

        /**
         * Simpan nilai ke KV Store.
         * @param {string} key — Kunci data
         * @param {any} value — Nilai (akan di-JSON stringify)
         * @returns {Promise<boolean>} — true jika berhasil
         */
        async set(key, value) {
            try {
                if (typeof puter === 'undefined' || !puter.kv) {
                    console.warn('[YWM.Data] Puter KV Store tidak tersedia. Data tidak disimpan.');
                    return false;
                }
                const serialized = JSON.stringify(value);
                await puter.kv.set(key, serialized);
                return true;
            } catch (err) {
                console.error(`[YWM.Data] Gagal menyimpan key "${key}":`, err);
                return false;
            }
        },

        /**
         * Hapus data dari KV Store.
         * @param {string} key — Kunci data
         * @returns {Promise<boolean>} — true jika berhasil
         */
        async delete(key) {
            try {
                if (typeof puter === 'undefined' || !puter.kv) {
                    console.warn('[YWM.Data] Puter KV Store tidak tersedia.');
                    return false;
                }
                await puter.kv.delete(key);
                return true;
            } catch (err) {
                console.error(`[YWM.Data] Gagal menghapus key "${key}":`, err);
                return false;
            }
        },

        /**
         * Daftar kunci dengan prefix tertentu.
         * @param {string} prefix — Prefix kunci (misal: 'ywm:sparepart:')
         * @returns {Promise<string[]>} — Array kunci yang cocok
         */
        async list(prefix) {
            try {
                if (typeof puter === 'undefined' || !puter.kv) {
                    console.warn('[YWM.Data] Puter KV Store tidak tersedia.');
                    return [];
                }
                const result = await puter.kv.list(prefix);
                // Handle berbagai format respons dari Puter.js
                if (Array.isArray(result)) {
                    return result;
                }
                // Jika result adalah objek dengan properti keys/array
                if (result && Array.isArray(result.keys)) {
                    return result.keys;
                }
                if (result && Array.isArray(result.result)) {
                    return result.result;
                }
                return [];
            } catch (err) {
                console.error(`[YWM.Data] Gagal list prefix "${prefix}":`, err);
                return [];
            }
        },

        /**
         * Ambil nilai beserta metadata timestamp.
         * @param {string} key — Kunci data
         * @returns {Promise<Object|null>} — { data: any, created_at, updated_at, created_by, updated_by } atau null
         */
        async getWithTimestamp(key) {
            const record = await this.get(key);
            if (record === null) {
                return null;
            }
            // Jika record sudah memiliki metadata timestamp, kembalikan langsung
            if (record && typeof record === 'object' && '_meta' in record) {
                return record;
            }
            // Jika tidak ada metadata, bungkus dalam format standar
            return {
                data: record,
                _meta: {
                    created_at: null,
                    updated_at: null,
                    created_by: null,
                    updated_by: null
                }
            };
        },

        /**
         * Simpan nilai dengan metadata timestamp otomatis.
         * Jika data sudah ada, pertahankan created_at dan created_by.
         *
         * @param {string} key — Kunci data
         * @param {any} value — Nilai data (tanpa metadata, metadata ditambahkan otomatis)
         * @returns {Promise<boolean>} — true jika berhasil
         */
        async setWithTimestamp(key, value) {
            try {
                const now = new Date().toISOString();

                // Ambil username saat ini
                let username = 'system';
                try {
                    if (typeof puter !== 'undefined' && puter.auth) {
                        const user = await puter.auth.getUser();
                        if (user && user.username) {
                            username = user.username;
                        }
                    }
                } catch {
                    // Abaikan — gunakan 'system'
                }

                // Cek apakah data sudah ada (untuk mempertahankan created_at)
                const existing = await this.get(key);
                let createdAt = now;
                let createdBy = username;

                if (existing && typeof existing === 'object' && existing._meta) {
                    createdAt = existing._meta.created_at || now;
                    createdBy = existing._meta.created_by || username;
                }

                // Bungkus data dengan metadata
                const record = {
                    data: value,
                    _meta: {
                        created_at: createdAt,
                        updated_at: now,
                        created_by: createdBy,
                        updated_by: username
                    }
                };

                return await this.set(key, record);
            } catch (err) {
                console.error(`[YWM.Data] Gagal setWithTimestamp key "${key}":`, err);
                return false;
            }
        },

        /**
         * Tambahkan entri audit trail.
         * Menyimpan log per hari (key: ywm:audit:log:{YYYY-MM-DD}).
         *
         * @param {string} module — Nama modul terkait
         * @param {string} action — Jenis aksi (create/update/delete/view/dll.)
         * @param {string|Object} details — Detail aksi
         * @param {...*} extra — Argumen tambahan (oldValue, newValue, dll.) yang disertakan di entry
         * @returns {Promise<boolean>} — true jika berhasil
         */
        async addAuditLog(module, action, details = {}, ...extra) {
            try {
                const now = new Date();
                const dateKey = now.toISOString().split('T')[0]; // YYYY-MM-DD
                const logKey = `${KV_PREFIX}audit:log:${dateKey}`;

                // Ambil log hari ini
                let logs = await this.get(logKey);
                if (!Array.isArray(logs)) {
                    logs = [];
                }

                // Ambil username
                let username = 'system';
                try {
                    if (typeof puter !== 'undefined' && puter.auth) {
                        const user = await puter.auth.getUser();
                        if (user && user.username) {
                            username = user.username;
                        }
                    }
                } catch {
                    // Abaikan
                }

                // Buat entri audit baru
                const entry = {
                    id: now.getTime() + '-' + Math.random().toString(36).substring(2, 8),
                    timestamp: now.toISOString(),
                    module: module,
                    action: action,
                    details: typeof details === 'string' ? details : JSON.stringify(details),
                    user: username
                };

                // Sertakan argumen tambahan (oldValue, newValue, dll.) jika ada
                if (extra.length > 0) {
                    entry.oldValue = extra[0] ?? null;
                }
                if (extra.length > 1) {
                    entry.newValue = extra[1] ?? null;
                }
                if (extra.length > 2) {
                    entry.extra = extra.slice(2);
                }

                // Tambahkan ke awal array (terbaru duluan)
                logs.unshift(entry);

                // Batasi maksimal 500 entri per hari untuk menghindari data terlalu besar
                if (logs.length > 500) {
                    logs = logs.slice(0, 500);
                }

                // Simpan kembali
                return await this.set(logKey, logs);
            } catch (err) {
                console.error('[YWM.Data] Gagal menambahkan audit log:', err);
                return false;
            }
        }
    };

    // =========================================================================
    // Alias & Compatibility Shims
    // =========================================================================

    // Alias: YWM.navigate → YWM.App.navigateTo
    YWM.navigate = function(moduleName) {
        return YWM.App.navigateTo(moduleName);
    };

    // Alias: YWM.Data.del → YWM.Data.delete
    YWM.Data.del = function(key) {
        return YWM.Data.delete(key);
    };

    // Auth namespace
    YWM.Auth = {
        async getSession() {
            try {
                if (typeof puter !== 'undefined' && puter.auth) {
                    const user = await puter.auth.getUser();
                    return { user, isAuthenticated: !!user };
                }
            } catch (e) {
                // Not authenticated
            }
            return { user: { username: 'Guest', isGuest: true }, isAuthenticated: false };
        },
        async getUser() {
            try {
                if (typeof puter !== 'undefined' && puter.auth) {
                    return await puter.auth.getUser();
                }
            } catch (e) {}
            return { username: 'Guest', isGuest: true };
        }
    };

    // Quick AI helper for sidebar buttons
    YWM.App.quickAI = function(message) {
        const aiPanel = document.getElementById('ai-panel');
        const aiInput = document.getElementById('ai-chat-input');
        if (aiPanel) {
            aiPanel.classList.remove('hidden');
            aiPanel.classList.remove('collapsed');
        }
        if (aiInput) {
            aiInput.value = message;
            aiInput.focus();
            // Trigger send
            const sendBtn = document.getElementById('ai-send-btn');
            if (sendBtn) sendBtn.click();
        }
    };

    // =========================================================================
    // Auto-Init saat DOM siap
    // =========================================================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            YWM.App.init().catch(err => {
                console.error('[YWM.App] Fatal error saat inisialisasi:', err);
            });
        });
    } else {
        // DOM sudah siap (misal: script dimuat dengan defer/async)
        YWM.App.init().catch(err => {
            console.error('[YWM.App] Fatal error saat inisialisasi:', err);
        });
    }

})();
